"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import DocumentViewer from "./DocumentViewer";
import AnswerCard from "./AnswerCard";
import SimpleAgentSwarmView from "./SimpleAgentSwarmView";
import {
  DEMO_SCENARIOS,
  DEMO_DOCUMENT,
  DEMO_STAGE_TIMING,
  DEMO_TOTAL_TIME_MS,
} from "@/lib/demoData";
import type { DemoScenario, DemoTurn } from "@/lib/demoData";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import type { PipelineStage, StageStatus } from "@/lib/constants";
import { unlockAudio } from "@/lib/audioContext";

type DemoPhase =
  | "idle"
  | "starting"
  | "doc-shown"
  | "recording"
  | "processing"
  | "stage-running"
  | "answer-shown"
  | "done";

interface CompletedTurn {
  turn: DemoTurn;
  audioBase64: string | null;
}

const defaultStages = (): Record<PipelineStage, { status: StageStatus; timeMs?: number }> => ({
  parse: { status: "idle" },
  stt: { status: "idle" },
  llm: { status: "idle" },
  translate: { status: "idle" },
  tts: { status: "idle" },
});

const LANGUAGE_REGIONS: Record<string, string> = {
  "ta-IN": "Tamil Nadu",
  "hi-IN": "Uttar Pradesh",
  "bn-IN": "West Bengal",
  "te-IN": "Andhra Pradesh",
  "kn-IN": "Karnataka",
};

function TypewriterText({ text, duration }: { text: string; duration: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const charDelay = duration / text.length;
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, charDelay);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, duration]);

  return (
    <>
      {displayedText}
      {currentIndex < text.length && (
        <span
          className="inline-block w-0.5 h-5 ml-0.5 align-middle"
          style={{
            background: "var(--accent)",
            animation: "typing-cursor 0.8s step-end infinite",
          }}
        />
      )}
    </>
  );
}

export default function OldDemoView() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [stages, setStages] = useState(defaultStages);
  const [showDoc, setShowDoc] = useState(false);
  const [showMic, setShowMic] = useState(false);
  const [micRecording, setMicRecording] = useState(false);
  const [micProcessing, setMicProcessing] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const [demoStarted, setDemoStarted] = useState(false);

  const [turnIndex, setTurnIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<CompletedTurn[]>([]);
  const [currentTurnAudio, setCurrentTurnAudio] = useState<string | null>(null);
  const [showCurrentAnswer, setShowCurrentAnswer] = useState(false);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const scenario: DemoScenario = DEMO_SCENARIOS[selectedIndex];
  const currentTurn: DemoTurn = scenario.turns[turnIndex];
  const region = LANGUAGE_REGIONS[scenario.languageCode] || "India";

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const updateStage = useCallback(
    (id: PipelineStage, status: StageStatus, timeMs?: number) => {
      setStages((prev) => ({ ...prev, [id]: { status, timeMs } }));
    },
    []
  );

  const prefetchTtsAudio = useCallback(async (sc: DemoScenario, turn: DemoTurn) => {
    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const lang = SUPPORTED_LANGUAGES[sc.languageCode];
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: turn.translatedAnswer,
          targetLang: sc.languageCode,
          voice: lang.voice,
        }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          setCurrentTurnAudio(data.audio);
        }
      }
    } catch {
      // TTS is optional
    }
  }, []);

  const runTurn = useCallback(
    (turnIdx: number) => {
      const sc = DEMO_SCENARIOS[selectedIndex];
      const turn = sc.turns[turnIdx];
      const timing = DEMO_STAGE_TIMING;

      setTurnIndex(turnIdx);
      setShowCurrentAnswer(false);
      setCurrentTurnAudio(null);
      setStages(defaultStages());
      setShowMic(false);
      setMicRecording(false);
      setMicProcessing(false);

      prefetchTtsAudio(sc, turn);

      let t = 0;

      t += 400;
      schedule(() => {
        setShowDoc(true);
        setPhase("doc-shown");
      }, t);

      t += 600;
      schedule(() => updateStage("parse", "active"), t);

      t += 2400;
      schedule(() => updateStage("parse", "done", 3000), t);

      t += 400;
      schedule(() => {
        setShowMic(true);
        setMicRecording(true);
        setPhase("recording");
      }, t);

      t += 2500;
      schedule(() => {
        setMicRecording(false);
        setMicProcessing(true);
        setPhase("processing");
      }, t);

      for (let i = 1; i < timing.length; i++) {
        const stage = timing[i];
        t += stage.delayBefore;
        const stageId = stage.id;
        const duration = stage.duration;

        schedule(() => {
          updateStage(stageId, "active");
          setPhase("stage-running");
        }, t);

        t += duration;
        schedule(() => updateStage(stageId, "done", duration), t);
      }

      t += 500;
      schedule(() => {
        setMicProcessing(false);
        setShowCurrentAnswer(true);
        setPhase("answer-shown");
      }, t);

      t += 1500;
      schedule(() => {
        setShowReplay(true);
        setPhase("done");
      }, t);
    },
    [selectedIndex, schedule, updateStage, prefetchTtsAudio]
  );

  const runDemo = useCallback(() => {
    unlockAudio();
    clearTimers();
    setPhase("starting");
    setStages(defaultStages());
    setShowDoc(false);
    setShowMic(false);
    setMicRecording(false);
    setMicProcessing(false);
    setShowCurrentAnswer(false);
    setShowReplay(false);
    setCurrentTurnAudio(null);
    setChatHistory([]);
    setTurnIndex(0);
    setDemoStarted(true);

    schedule(() => runTurn(0), 0);
  }, [clearTimers, schedule, runTurn]);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const handleLanguageSwitch = (index: number) => {
    if (index === selectedIndex && !demoStarted) return;
    setSelectedIndex(index);
    if (demoStarted) {
      clearTimers();
      setShowCurrentAnswer(false);
      setCurrentTurnAudio(null);
      setStages(defaultStages());
      setShowDoc(false);
      setShowMic(false);
      setMicRecording(false);
      setMicProcessing(false);
      setShowReplay(false);
      setTimeout(() => runDemo(), 100);
    }
  };

  const SectionLabel = ({ label, step, accent }: { label: string; step: string; accent?: boolean }) => (
    <div className="flex items-center gap-2.5">
      <div className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
      <span
        className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2"
        style={{ color: accent ? "var(--accent)" : "var(--text-tertiary)" }}
      >
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px]"
          style={{
            background: accent ? "var(--accent-subtle)" : "var(--bg-tertiary)",
            color: accent ? "var(--accent)" : "var(--text-tertiary)",
            border: `1.5px solid ${accent ? "var(--border-accent)" : "var(--border-subtle)"}`,
          }}
        >
          {step}
        </span>
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
    </div>
  );

  const VerticalConnector = ({ active }: { active?: boolean }) => (
    <div className="flex justify-center py-1">
      <svg width="12" height="28" viewBox="0 0 12 28" fill="none">
        <line
          x1="6" y1="0" x2="6" y2="20"
          stroke={active ? "var(--accent)" : "var(--border-visible)"}
          strokeWidth="1.5"
          strokeDasharray={active ? "none" : "3 3"}
        />
        <polygon
          points="2,18 6,26 10,18"
          fill={active ? "var(--accent)" : "var(--border-visible)"}
        />
      </svg>
    </div>
  );

  const hasAnswers = showCurrentAnswer;

  return (
    <div className="space-y-5 max-w-5xl mx-auto px-6 pt-4 sm:pt-12 pb-12">
      {/* Language Picker + Play Button */}
      <div className="anim-slide-up flex flex-col items-center gap-5">
        <div
          className="inline-flex flex-nowrap justify-center gap-1.5 sm:gap-2 rounded-2xl p-1.5 sm:p-2.5 overflow-x-auto max-w-full"
          style={{ background: "var(--bg-secondary)", border: "1.5px solid var(--border-subtle)" }}
        >
          {DEMO_SCENARIOS.map((sc, i) => (
            <button
              key={sc.languageCode}
              onClick={() => handleLanguageSwitch(i)}
              className="rounded-full px-3 sm:px-4 py-2.5 sm:py-2.5 text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 whitespace-nowrap shrink-0"
              style={{
                background: i === selectedIndex ? "var(--bg-elevated)" : "transparent",
                color: i === selectedIndex ? "var(--accent)" : "var(--text-tertiary)",
                border: i === selectedIndex
                  ? "1.5px solid var(--accent)"
                  : "1.5px solid var(--border-subtle)",
                boxShadow: i === selectedIndex
                  ? "0 1px 6px rgba(0,0,0,0.08)"
                  : "none",
              }}
            >
              {sc.nativeName}
              <span className="ml-1 sm:ml-1.5 opacity-60 hidden sm:inline">{sc.languageName}</span>
            </button>
          ))}
        </div>

        {!demoStarted && (
          <button
            onClick={runDemo}
            className="inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-base font-semibold tracking-wide transition-all duration-300 hover-lift"
            style={{
              background: "var(--accent)",
              color: "white",
              boxShadow: "0 4px 24px var(--accent-glow-strong)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Play Demo
          </button>
        )}
      </div>

      {/* Idle state — explain what the demo will show */}
      {!demoStarted && (
        <div className="text-center py-8 max-w-lg mx-auto space-y-3">
          <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            A farmer receives a government form in Hindi, a language he can&apos;t read. He picks up his phone, points it at the document, and asks a question <strong style={{ color: "var(--accent)" }}>in his own language</strong>.
          </p>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Choose a language above, then press <strong>Play Demo</strong> to watch 5 AI models answer him, by voice.
          </p>
        </div>
      )}

      {demoStarted && (
        <>
          {/* Scenario */}
          <div className="anim-slide-up">
            <div
              className="rounded-2xl px-6 py-5"
              style={{
                background: "linear-gradient(135deg, var(--accent-subtle) 0%, rgba(184, 99, 58, 0.03) 100%)",
                border: "1.5px solid var(--border-accent)",
              }}
            >
              <div className="flex items-start gap-3.5">
                <span className="text-3xl mt-0.5">&#x1F468;&#x200D;&#x1F33E;</span>
                <div className="flex-1 text-left">
                  {scenario.languageCode === "hi-IN" ? (
                    <>
                      <p className="text-base leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
                        <strong style={{ color: "var(--text-primary)" }}>Rajesh</strong>, a farmer in <strong style={{ color: "var(--text-primary)" }}>{region}</strong>, receives the PM-KISAN subsidy form, but the dense government language is hard to understand.
                      </p>
                      <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        He asks a question <strong style={{ color: "var(--accent)" }}>in Hindi</strong> and <strong style={{ color: "var(--accent)" }}>hears Vaani answer in plain Hindi, by voice</strong>.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-base leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
                        <strong style={{ color: "var(--text-primary)" }}>Rajesh</strong>, a farmer in <strong style={{ color: "var(--text-primary)" }}>{region}</strong>, receives the PM-KISAN subsidy form, entirely in Hindi.
                      </p>
                      <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        He speaks <strong style={{ color: "var(--accent)" }}>{scenario.languageName}</strong>, not Hindi.
                        Watch him ask a question and <strong style={{ color: "var(--accent)" }}>hear Vaani answer in his language, by voice</strong>.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: INPUT */}
          <SectionLabel label="Input" step="1" />

          {phase === "starting" && (
            <p
              className="text-center text-base font-medium tracking-wide anim-fade-in"
              style={{ color: "var(--text-tertiary)" }}
            >
              Starting demo...
            </p>
          )}

          {showDoc && (
            <div>
              <div className="grid gap-4 md:grid-cols-2 overflow-hidden">
                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] anim-fade-in" style={{ color: "var(--text-tertiary)" }}>
                    Document (Hindi)
                  </p>
                  <div className="relative flex-1">
                    <div
                      className="h-full"
                      style={{
                        animation: "document-focus 2.2s cubic-bezier(0.16, 1, 0.3, 1) both",
                        animationDelay: "0.2s"
                      }}
                    >
                      <DocumentViewer
                        fileName={DEMO_DOCUMENT.fileName}
                        textLength={DEMO_DOCUMENT.textLength}
                        textSnippet={DEMO_DOCUMENT.textSnippet}
                        pageCount={DEMO_DOCUMENT.pageCount}
                      />
                    </div>

                    {stages.parse.status === "active" && (
                      <div
                        className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
                        style={{ border: "2px solid var(--accent)" }}
                      >
                        <div
                          className="absolute left-0 right-0 h-0.5"
                          style={{
                            background: "var(--accent)",
                            boxShadow: "0 0 20px var(--accent-glow-strong)",
                            animation: "scan-line 2.4s ease-in-out forwards",
                          }}
                        />
                        <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full"
                          style={{
                            background: "var(--accent)",
                            color: "white",
                            fontSize: "11px",
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                          }}
                        >
                          <div className="flex gap-0.5">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-1 h-1 rounded-full bg-white"
                                style={{
                                  animation: `glow-pulse 1s ease-in-out infinite`,
                                  animationDelay: `${i * 0.15}s`,
                                }}
                              />
                            ))}
                          </div>
                          <span>READING DOCUMENT</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>
                    Question ({scenario.languageName} voice)
                  </p>
                  <div className="glass-card p-5 flex flex-col flex-1 overflow-hidden" style={{ minHeight: "160px", border: "1.5px solid var(--border-visible)" }}>
                    {showMic ? (
                      <div className="flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-3xl">&#x1F468;&#x200D;&#x1F33E;</span>
                            <p className="text-[10px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                              Rajesh
                            </p>
                          </div>

                          <div className="flex-1">
                            <div
                              className="relative rounded-2xl rounded-tl-sm px-4 py-3"
                              style={{
                                background: "var(--accent-subtle)",
                                border: "2px solid var(--border-accent)",
                              }}
                            >
                              {micRecording && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex gap-0.5">
                                      {[0, 1, 2].map((i) => (
                                        <div
                                          key={i}
                                          className="w-0.5 h-3.5 rounded-full"
                                          style={{
                                            background: "var(--accent)",
                                            animation: `audio-wave 0.8s ease-in-out infinite`,
                                            animationDelay: `${i * 0.1}s`,
                                          }}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                                      Speaking...
                                    </span>
                                  </div>
                                  <p
                                    className="text-base font-semibold leading-relaxed"
                                    style={{
                                      color: "var(--text-primary)",
                                      animation: "fadeIn 0.3s ease-out"
                                    }}
                                  >
                                    <TypewriterText text={currentTurn.question} duration={2000} />
                                  </p>
                                </div>
                              )}
                              {(micProcessing || showCurrentAnswer) && (
                                <p className="text-base font-semibold leading-relaxed" style={{ color: "var(--text-primary)" }}>
                                  {currentTurn.question}
                                </p>
                              )}
                            </div>

                            {(micProcessing || showCurrentAnswer) && (
                              <p
                                className="text-[13px] italic mt-2 ml-1 anim-fade-in"
                                style={{ color: "var(--text-tertiary)" }}
                              >
                                ({currentTurn.questionEnglish})
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                          Waiting for voice...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <VerticalConnector active={micProcessing || phase === "stage-running" || hasAnswers} />

          <SectionLabel
            label={showCurrentAnswer ? "Complete" : "Processing"}
            step="2"
            accent={phase === "stage-running" || micProcessing}
          />

          <div className="anim-slide-up">
            <SimpleAgentSwarmView stages={stages} languageName={scenario.languageName} />
          </div>

          <VerticalConnector active={hasAnswers} />

          <SectionLabel label="Output" step="3" accent={hasAnswers} />

          {showCurrentAnswer ? (
            <div className="anim-slide-up">
              <AnswerCard
                question={currentTurn.question}
                answer={currentTurn.translatedAnswer}
                languageCode={scenario.languageCode}
                audioBase64={currentTurnAudio}
                totalTimeMs={DEMO_TOTAL_TIME_MS}
                autoPlay={true}
              />
            </div>
          ) : (
            <div
              className="glass-card flex items-center justify-center p-8 text-center"
              style={{ opacity: 0.5 }}
            >
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                {micProcessing || phase === "stage-running"
                  ? "Processing through The Crew..."
                  : "Answer will appear here"}
              </p>
            </div>
          )}

          {showReplay && (
            <div className="flex flex-col items-center gap-4 pt-4 anim-fade-in">
              <button
                onClick={() => {
                  clearTimers();
                  runDemo();
                }}
                className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-base font-semibold tracking-wide transition-all duration-300"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                  border: "1.5px solid var(--border-visible)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-dim)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-visible)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1,4 1,10 7,10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Replay Demo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
