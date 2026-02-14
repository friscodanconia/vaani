"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import DocumentViewer from "./DocumentViewer";
import VoiceInput from "./VoiceInput";
import AnswerCard from "./AnswerCard";
import AgentSwarmView from "./AgentSwarmView";
import {
  DEMO_SCENARIOS,
  DEMO_DOCUMENT,
  DEMO_STAGE_TIMING,
  DEMO_STAGE_TIMING_FOLLOWUP,
  DEMO_TOTAL_TIME_MS,
} from "@/lib/demoData";
import type { DemoScenario, DemoTurn } from "@/lib/demoData";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import type { PipelineStage, StageStatus } from "@/lib/constants";

type DemoPhase =
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
  lid: { status: "idle" },
  llm: { status: "idle" },
  translate: { status: "idle" },
  tts: { status: "idle" },
});

// Region mapping for the scenario narrative
const LANGUAGE_REGIONS: Record<string, string> = {
  "ta-IN": "Tamil Nadu",
  "hi-IN": "Uttar Pradesh",
  "bn-IN": "West Bengal",
  "te-IN": "Andhra Pradesh",
  "kn-IN": "Karnataka",
};

interface DemoViewProps {
  onSwitchToTry: () => void;
}

export default function DemoView({ onSwitchToTry }: DemoViewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>("starting");
  const [stages, setStages] = useState(defaultStages);
  const [showDoc, setShowDoc] = useState(false);
  const [showMic, setShowMic] = useState(false);
  const [micRecording, setMicRecording] = useState(false);
  const [micProcessing, setMicProcessing] = useState(false);
  const [showReplay, setShowReplay] = useState(false);

  // Multi-turn state
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

  // Fire-and-forget TTS call
  const fetchTtsAudio = useCallback(async (sc: DemoScenario, turn: DemoTurn) => {
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
        if (data.audio) setCurrentTurnAudio(data.audio);
      }
    } catch {
      // TTS failed silently — demo still works without audio
    }
  }, []);

  const runTurn = useCallback(
    (turnIdx: number) => {
      const sc = DEMO_SCENARIOS[selectedIndex];
      const turn = sc.turns[turnIdx];
      const isFollowup = turnIdx > 0;
      const timing = isFollowup ? DEMO_STAGE_TIMING_FOLLOWUP : DEMO_STAGE_TIMING;

      setTurnIndex(turnIdx);
      setShowCurrentAnswer(false);
      setCurrentTurnAudio(null);

      // Reset crew stages for this turn (parse stays done on followup)
      if (isFollowup) {
        setStages((prev) => ({
          ...defaultStages(),
          parse: { status: "done", timeMs: prev.parse.timeMs },
        }));
      } else {
        setStages(defaultStages());
      }

      setShowMic(false);
      setMicRecording(false);
      setMicProcessing(false);

      let t = 0;

      if (!isFollowup) {
        // Show document on first turn
        t += 600;
        schedule(() => {
          setShowDoc(true);
          setPhase("doc-shown");
        }, t);

        // Parse stage: active -> done
        t += 400;
        schedule(() => updateStage("parse", "active"), t);
        t += DEMO_STAGE_TIMING[0].duration;
        schedule(() => updateStage("parse", "done", DEMO_STAGE_TIMING[0].duration), t);
      }

      // Show mic in recording state
      t += isFollowup ? 300 : 600;
      schedule(() => {
        setShowMic(true);
        setMicRecording(true);
        setPhase("recording");
      }, t);

      // Transition mic to processing
      t += 1800;
      schedule(() => {
        setMicRecording(false);
        setMicProcessing(true);
        setPhase("processing");
      }, t);

      // Run pipeline stages
      for (let i = 0; i < timing.length; i++) {
        // For first turn, skip parse (index 0) since we handle it above
        if (!isFollowup && i === 0) continue;
        const stage = timing[i];
        t += stage.delayBefore;
        const stageId = stage.id;
        const duration = stage.duration;

        if (stageId === "tts") {
          schedule(() => {
            updateStage(stageId, "active");
            setPhase("stage-running");
            fetchTtsAudio(sc, turn);
          }, t);
        } else {
          schedule(() => {
            updateStage(stageId, "active");
            setPhase("stage-running");
          }, t);
        }

        t += duration;
        schedule(() => updateStage(stageId, "done", duration), t);
      }

      // Show answer for this turn
      t += 500;
      schedule(() => {
        setMicProcessing(false);
        setShowCurrentAnswer(true);
        setPhase("answer-shown");
      }, t);

      // After answer shown, either advance to next turn or finish
      t += 800;
      if (turnIdx < sc.turns.length - 1) {
        // Commit this turn to chat history, then start next turn after pause
        schedule(() => {
          setChatHistory((prev) => [
            ...prev,
            { turn, audioBase64: null }, // audio will be captured at commit time
          ]);
          setShowCurrentAnswer(false);
        }, t);

        t += 1500; // pause between turns
        schedule(() => runTurn(turnIdx + 1), t);
      } else {
        // Final turn — show replay
        schedule(() => {
          setShowReplay(true);
          setPhase("done");
        }, t);
      }
    },
    [selectedIndex, schedule, updateStage, fetchTtsAudio]
  );

  const runDemo = useCallback(() => {
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

    schedule(() => runTurn(0), 0);
  }, [clearTimers, schedule, runTurn]);

  useEffect(() => {
    runDemo();
    return clearTimers;
  }, [runDemo, clearTimers]);

  const handleLanguageSwitch = (index: number) => {
    if (index === selectedIndex) return;
    setSelectedIndex(index);
  };

  const noop = () => {};

  const SectionLabel = ({ label, step, accent }: { label: string; step: string; accent?: boolean }) => (
    <div className="flex items-center gap-2.5">
      <div className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
      <span
        className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2"
        style={{ color: accent ? "var(--accent)" : "var(--text-tertiary)" }}
      >
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px]"
          style={{
            background: accent ? "var(--accent-subtle)" : "var(--bg-tertiary)",
            color: accent ? "var(--accent)" : "var(--text-tertiary)",
            border: `1px solid ${accent ? "var(--border-accent)" : "var(--border-subtle)"}`,
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

  const hasAnswers = chatHistory.length > 0 || showCurrentAnswer;

  return (
    <div className="space-y-4">
      {/* Language Picker */}
      <div className="anim-slide-up flex justify-center">
        <div
          className="inline-flex flex-wrap justify-center gap-1.5 rounded-2xl p-2"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
        >
          {DEMO_SCENARIOS.map((sc, i) => (
            <button
              key={sc.languageCode}
              onClick={() => handleLanguageSwitch(i)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300"
              style={{
                background: i === selectedIndex ? "var(--bg-elevated)" : "transparent",
                color: i === selectedIndex ? "var(--accent)" : "var(--text-tertiary)",
                boxShadow: i === selectedIndex
                  ? "0 1px 6px rgba(0,0,0,0.08), 0 0 0 1px var(--border-accent)"
                  : "none",
              }}
            >
              {sc.nativeName}
              <span className="ml-1 opacity-60">{sc.languageName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scenario */}
      <div className="anim-slide-up">
        <div
          className="rounded-2xl px-6 py-4 text-center"
          style={{
            background: "linear-gradient(135deg, var(--accent-subtle) 0%, rgba(184, 99, 58, 0.03) 100%)",
            border: "1px solid var(--border-accent)",
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            A farmer in <strong style={{ color: "var(--text-primary)" }}>{region}</strong> receives
            a government form in <strong style={{ color: "var(--text-primary)" }}>Hindi</strong>.
            They ask a question <strong style={{ color: "var(--text-primary)" }}>in {scenario.languageName}</strong> and
            Vaani answers <strong style={{ color: "var(--accent)" }}>in their own language, by voice</strong>.
          </p>
        </div>
      </div>

      {/* SECTION 1: INPUT */}
      <SectionLabel label="Input" step="1" />

      {phase === "starting" && (
        <p
          className="text-center text-sm font-medium tracking-wide anim-fade-in"
          style={{ color: "var(--text-tertiary)" }}
        >
          Starting demo...
        </p>
      )}

      {showDoc && (
        <div className="anim-slide-up">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>
                Document (Hindi)
              </p>
              <DocumentViewer
                fileName={DEMO_DOCUMENT.fileName}
                textLength={DEMO_DOCUMENT.textLength}
                textSnippet={DEMO_DOCUMENT.textSnippet}
                pageCount={DEMO_DOCUMENT.pageCount}
              />
            </div>

            {/* Voice question */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--text-tertiary)" }}>
                Question ({scenario.languageName} voice)
                {turnIndex > 0 && (
                  <span style={{ color: "var(--accent)", marginLeft: "6px" }}>
                    Follow-up
                  </span>
                )}
              </p>
              <div className="glass-card p-4 flex flex-col items-center justify-center text-center" style={{ minHeight: "120px" }}>
                {showMic ? (
                  <div className="space-y-3">
                    {micRecording && (
                      <>
                        <VoiceInput
                          isRecording={true}
                          isProcessing={false}
                          disabled={false}
                          onStart={noop}
                          onStop={noop}
                        />
                        <p className="text-xs font-medium" style={{ color: "var(--accent)" }}>Listening...</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            &ldquo;{currentTurn.question}&rdquo;
                          </p>
                          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                            {currentTurn.questionEnglish}
                          </p>
                        </div>
                      </>
                    )}
                    {micProcessing && (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          &ldquo;{currentTurn.question}&rdquo;
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {currentTurn.questionEnglish}
                        </p>
                      </div>
                    )}
                    {showCurrentAnswer && (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                          &ldquo;{currentTurn.question}&rdquo;
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {currentTurn.questionEnglish}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {turnIndex > 0 ? "Follow-up question..." : "Waiting for voice..."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* connector */}
      <VerticalConnector active={micProcessing || phase === "stage-running" || hasAnswers} />

      {/* SECTION 2: THE CREW */}
      <SectionLabel label="The Crew" step="2" accent={phase === "stage-running" || micProcessing} />

      <div className="anim-slide-up">
        <AgentSwarmView stages={stages} languageName={scenario.languageName} />
      </div>

      {/* connector */}
      <VerticalConnector active={hasAnswers} />

      {/* SECTION 3: OUTPUT — Chat Thread */}
      <SectionLabel label="Output" step="3" accent={hasAnswers} />

      {hasAnswers ? (
        <div className="space-y-3">
          {/* Previously completed turns */}
          {chatHistory.map((completed, i) => (
            <div key={i} className="anim-slide-up">
              <div className="mb-1.5">
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-tertiary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  Turn {i + 1}
                </span>
              </div>
              <AnswerCard
                question={completed.turn.question}
                answer={completed.turn.translatedAnswer}
                languageCode={scenario.languageCode}
                audioBase64={completed.audioBase64}
                totalTimeMs={DEMO_TOTAL_TIME_MS}
              />
            </div>
          ))}

          {/* Current turn answer */}
          {showCurrentAnswer && (
            <div className="anim-slide-up">
              <div className="mb-1.5">
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--accent-subtle)",
                    color: "var(--accent)",
                    border: "1px solid var(--border-accent)",
                  }}
                >
                  Turn {chatHistory.length + 1}
                </span>
              </div>
              <AnswerCard
                question={currentTurn.question}
                answer={currentTurn.translatedAnswer}
                languageCode={scenario.languageCode}
                audioBase64={currentTurnAudio}
                totalTimeMs={DEMO_TOTAL_TIME_MS}
              />
            </div>
          )}
        </div>
      ) : (
        <div
          className="glass-card flex items-center justify-center p-8 text-center"
          style={{ opacity: 0.5 }}
        >
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {micProcessing || phase === "stage-running"
              ? "Processing through The Crew..."
              : "Answer will appear here"}
          </p>
        </div>
      )}

      {/* Replay + CTA */}
      {showReplay && (
        <div className="flex flex-col items-center gap-4 pt-4 anim-fade-in">
          <button
            onClick={runDemo}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-300"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-visible)",
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1,4 1,10 7,10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Replay Demo
          </button>

          <button
            onClick={onSwitchToTry}
            className="text-sm font-semibold tracking-wide transition-colors duration-300"
            style={{ color: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Try with your own document &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
