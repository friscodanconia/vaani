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

    // Reset pipeline stages for the Q&A flow (keep parse as done)
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
      // 1. Get audio blob
      const audioBlob = await recorderRef.current.stop();
      recorderRef.current = null;

      // 2. Transcribe (STT)
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

      // 3. Language Detection (LID) — confirm with Language ID API
      updateStage("lid", "active");
      const lidStart = Date.now();

      const lidRes = await fetch("/api/detect-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });
      const lidData = await lidRes.json();
      if (lidRes.ok && lidData.languageCode) {
        detectedLang = lidData.languageCode;
      }

      updateStage("lid", "done", Date.now() - lidStart);

      // 4. Ask LLM
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

      // 5. Translate answer to user's language (if not already in that language)
      updateStage("translate", "active");
      const transStart = Date.now();

      if (detectedLang !== "en-IN" && SUPPORTED_LANGUAGES[detectedLang]) {
        const transRes = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: finalAnswer,
            sourceLang: "en-IN",
            targetLang: detectedLang,
          }),
        });
        const transData = await transRes.json();
        if (transRes.ok && transData.translated) {
          translatedAnswer = transData.translated;
        }
      }

      updateStage("translate", "done", Date.now() - transStart);

      // 6. Synthesize speech (TTS)
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

      // Add to history
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
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12">
      {/* Header */}
      <header className="mb-10 text-center anim-slide-up">
        <h1
          className="font-display text-5xl font-light tracking-tight"
          style={{ color: "var(--warm-900)" }}
        >
          Vaani
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--warm-400)" }}>
          Talk to any document, in any Indian language
        </p>
      </header>

      {/* Main content */}
      <div className="flex-1 space-y-6">
        {/* Document section */}
        {!hasDocument ? (
          <DocumentUpload onUpload={handleUpload} isUploading={appState === "uploading"} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left: Document info */}
            <div className="space-y-4">
              <DocumentViewer
                fileName={fileName}
                textLength={documentText.length}
                textSnippet={documentText.slice(0, 500)}
                pageCount={pageCount}
              />

              {/* New document button */}
              <button
                onClick={() => {
                  setAppState("idle");
                  setDocumentText("");
                  setFileName("");
                  setQaHistory([]);
                  setStages(defaultStages());
                  setError(null);
                }}
                className="text-xs underline transition-colors"
                style={{ color: "var(--warm-400)" }}
              >
                Upload a different document
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
                  className="flex h-full items-center justify-center rounded-2xl p-8 text-center"
                  style={{ background: "var(--surface-raised)", border: "1px solid var(--warm-100)" }}
                >
                  <p className="text-sm" style={{ color: "var(--warm-400)" }}>
                    Ask a question about the document
                    <br />
                    <span className="text-xs">in any Indian language</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voice input */}
        {hasDocument && (
          <div className="flex justify-center py-4">
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
            className="rounded-xl p-4 text-center text-sm"
            style={{ background: "rgba(220, 38, 38, 0.08)", color: "var(--error)" }}
          >
            {error}
          </div>
        )}

        {/* Pipeline */}
        <PipelineView stages={stages} />

        {/* Q&A History (older entries) */}
        {qaHistory.length > 1 && (
          <div className="space-y-4">
            <p
              className="text-[11px] font-medium uppercase tracking-widest"
              style={{ color: "var(--warm-400)" }}
            >
              Previous Questions
            </p>
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

      {/* Footer */}
      <footer className="mt-12 text-center">
        <p className="text-[11px]" style={{ color: "var(--warm-400)" }}>
          Powered by{" "}
          <span className="font-medium" style={{ color: "var(--warm-500)" }}>
            Sarvam AI
          </span>{" "}
          — Document Intelligence · Saarika · Language ID · Sarvam-M · Mayura · Bulbul
        </p>
      </footer>
    </div>
  );
}
