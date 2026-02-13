"use client";

import { useState, useRef, useCallback } from "react";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentViewer from "@/components/DocumentViewer";
import VoiceInput from "@/components/VoiceInput";
import AnswerCard from "@/components/AnswerCard";
import PipelineView from "@/components/PipelineView";
import { AudioRecorder } from "@/lib/audioRecorder";
import { SUPPORTED_LANGUAGES, type PipelineStage, type StageStatus } from "@/lib/constants";

type AppState = "idle" | "uploading" | "doc-ready" | "recording" | "processing" | "answering";

interface QAEntry {
  question: string;
  answer: string;
  translatedAnswer: string;
  languageCode: string;
  audioBase64: string | null;
  totalTimeMs: number;
}

const defaultStages = (): Record<PipelineStage, { status: StageStatus; timeMs?: number }> => ({
  parse: { status: "idle" },
  stt: { status: "idle" },
  lid: { status: "idle" },
  llm: { status: "idle" },
  translate: { status: "idle" },
  tts: { status: "idle" },
});

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [documentText, setDocumentText] = useState("");
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [qaHistory, setQaHistory] = useState<QAEntry[]>([]);
  const [stages, setStages] = useState(defaultStages);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);

  const updateStage = useCallback(
    (id: PipelineStage, status: StageStatus, timeMs?: number) => {
      setStages((prev) => ({ ...prev, [id]: { status, timeMs } }));
    },
    []
  );

  // ─── Document Upload ───
  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setAppState("uploading");
      setStages(defaultStages());
      updateStage("parse", "active");

      const t0 = Date.now();
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/parse-document", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Parse failed");

        updateStage("parse", "done", Date.now() - t0);
        setDocumentText(data.text);
        setFileName(file.name);
        setPageCount(data.pageCount || 1);
        setAppState("doc-ready");
        setQaHistory([]);
      } catch (err) {
        updateStage("parse", "error");
        setError(err instanceof Error ? err.message : "Upload failed");
        setAppState("idle");
      }
    },
    [updateStage]
  );

  // ─── Voice Recording ───
  const handleRecordStart = useCallback(async () => {
    try {
      setError(null);
      const recorder = new AudioRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setAppState("recording");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone access denied");
    }
  }, []);

  const handleRecordStop = useCallback(async () => {
    if (!recorderRef.current) return;

    setAppState("processing");

    setStages((prev) => ({
      ...prev,
      stt: { status: "idle" },
      lid: { status: "idle" },
      llm: { status: "idle" },
      translate: { status: "idle" },
      tts: { status: "idle" },
    }));

    const totalStart = Date.now();

    try {
      const audioBlob = await recorderRef.current.stop();
      recorderRef.current = null;

      // STT
      updateStage("stt", "active");
      const sttStart = Date.now();
      const sttForm = new FormData();
      sttForm.append("audio", audioBlob, "audio.webm");
      const sttRes = await fetch("/api/transcribe", { method: "POST", body: sttForm });
      const sttData = await sttRes.json();
      if (!sttRes.ok) throw new Error(sttData.error || "Transcription failed");
      updateStage("stt", "done", Date.now() - sttStart);

      const transcript = sttData.transcript;
      let detectedLang = sttData.languageCode || "unknown";

      // LID
      updateStage("lid", "active");
      const lidStart = Date.now();
      const lidRes = await fetch("/api/detect-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });
      const lidData = await lidRes.json();
      if (lidRes.ok && lidData.languageCode) detectedLang = lidData.languageCode;
      updateStage("lid", "done", Date.now() - lidStart);

      // LLM
      updateStage("llm", "active");
      const llmStart = Date.now();
      const askRes = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentText, question: transcript }),
      });
      const askData = await askRes.json();
      if (!askRes.ok) throw new Error(askData.error || "LLM failed");
      updateStage("llm", "done", Date.now() - llmStart);

      let finalAnswer = askData.answer;
      let translatedAnswer = finalAnswer;

      // Translate
      updateStage("translate", "active");
      const transStart = Date.now();
      if (detectedLang !== "en-IN" && SUPPORTED_LANGUAGES[detectedLang]) {
        const transRes = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: finalAnswer, sourceLang: "en-IN", targetLang: detectedLang }),
        });
        const transData = await transRes.json();
        if (transRes.ok && transData.translated) translatedAnswer = transData.translated;
      }
      updateStage("translate", "done", Date.now() - transStart);

      // TTS
      updateStage("tts", "active");
      const ttsStart = Date.now();
      const lang = SUPPORTED_LANGUAGES[detectedLang] || SUPPORTED_LANGUAGES["hi-IN"];
      const ttsRes = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: translatedAnswer,
          targetLang: detectedLang in SUPPORTED_LANGUAGES ? detectedLang : "hi-IN",
          voice: lang.voice,
        }),
      });
      const ttsData = await ttsRes.json();
      updateStage("tts", "done", Date.now() - ttsStart);

      const audioBase64 = ttsRes.ok ? ttsData.audio : null;

      setQaHistory((prev) => [
        {
          question: transcript,
          answer: finalAnswer,
          translatedAnswer,
          languageCode: detectedLang,
          audioBase64,
          totalTimeMs: Date.now() - totalStart,
        },
        ...prev,
      ]);

      setAppState("doc-ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
      setAppState("doc-ready");
    }
  }, [documentText, updateStage]);

  const hasDocument = appState !== "idle" && appState !== "uploading";

  return (
    <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16" style={{ zIndex: 1 }}>
      {/* ─── Header ─── */}
      <header className="mb-16 text-center anim-slide-up">
        <div className="mb-4">
          <span
            className="inline-block text-[10px] font-medium uppercase tracking-[0.3em] rounded-full px-4 py-1.5"
            style={{
              color: "var(--accent)",
              background: "var(--accent-subtle)",
              border: "1px solid var(--border-accent)",
            }}
          >
            6 Sarvam AI APIs
          </span>
        </div>
        <h1
          className="font-display text-7xl font-light italic tracking-tight"
          style={{
            color: "var(--text-primary)",
            textShadow: "0 0 80px var(--accent-glow)",
          }}
        >
          Vaani
        </h1>
        <p className="mt-3 text-sm tracking-wide" style={{ color: "var(--text-tertiary)" }}>
          Talk to any document, in any Indian language
        </p>
      </header>

      {/* ─── Main content ─── */}
      <div className="flex-1 space-y-8">
        {/* Document section */}
        {!hasDocument ? (
          <div className="anim-slide-up" style={{ animationDelay: "100ms" }}>
            <DocumentUpload onUpload={handleUpload} isUploading={appState === "uploading"} />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 anim-slide-up" style={{ animationDelay: "100ms" }}>
            {/* Left: Document info */}
            <div className="space-y-3">
              <DocumentViewer
                fileName={fileName}
                textLength={documentText.length}
                textSnippet={documentText.slice(0, 500)}
                pageCount={pageCount}
              />
              <button
                onClick={() => {
                  setAppState("idle");
                  setDocumentText("");
                  setFileName("");
                  setQaHistory([]);
                  setStages(defaultStages());
                  setError(null);
                }}
                className="text-[11px] tracking-wide transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
              >
                Upload different document
              </button>
            </div>

            {/* Right: Latest answer */}
            <div>
              {qaHistory.length > 0 ? (
                <AnswerCard
                  question={qaHistory[0].question}
                  answer={qaHistory[0].translatedAnswer || qaHistory[0].answer}
                  languageCode={qaHistory[0].languageCode}
                  audioBase64={qaHistory[0].audioBase64}
                  totalTimeMs={qaHistory[0].totalTimeMs}
                />
              ) : (
                <div
                  className="glass-card flex h-full items-center justify-center p-10 text-center"
                >
                  <div>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 opacity-20">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="var(--text-primary)" strokeWidth="1.5" />
                    </svg>
                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                      Ask a question about the document
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)", opacity: 0.6 }}>
                      in any Indian language
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voice input */}
        {hasDocument && (
          <div className="flex justify-center py-6 anim-slide-up" style={{ animationDelay: "200ms" }}>
            <VoiceInput
              isRecording={appState === "recording"}
              isProcessing={appState === "processing"}
              disabled={appState === "processing"}
              onStart={handleRecordStart}
              onStop={handleRecordStop}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-4 text-center text-sm anim-fade-in"
            style={{ background: "rgba(248, 113, 113, 0.08)", color: "var(--error)", border: "1px solid rgba(248, 113, 113, 0.2)" }}
          >
            {error}
          </div>
        )}

        {/* Pipeline */}
        <div className="anim-slide-up" style={{ animationDelay: "300ms" }}>
          <PipelineView stages={stages} />
        </div>

        {/* Q&A History */}
        {qaHistory.length > 1 && (
          <div className="space-y-4 anim-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
              <span
                className="text-[10px] font-medium uppercase tracking-[0.2em]"
                style={{ color: "var(--text-tertiary)" }}
              >
                Previous
              </span>
              <div className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
            </div>
            {qaHistory.slice(1).map((qa, i) => (
              <AnswerCard
                key={i}
                question={qa.question}
                answer={qa.translatedAnswer || qa.answer}
                languageCode={qa.languageCode}
                audioBase64={qa.audioBase64}
                totalTimeMs={qa.totalTimeMs}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Footer ─── */}
      <footer className="mt-16 text-center">
        <div className="h-px mb-6" style={{ background: "var(--border-subtle)" }} />
        <p className="text-[10px] tracking-wide" style={{ color: "var(--text-tertiary)" }}>
          Powered by{" "}
          <span style={{ color: "var(--accent-dim)" }}>Sarvam AI</span>
          <span style={{ opacity: 0.4 }}>
            {" "}— Document Intelligence · Saarika · Language ID · Sarvam-M · Mayura · Bulbul
          </span>
        </p>
      </footer>
    </div>
  );
}
