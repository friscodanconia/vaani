"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { unlockAudio, isAudioUnlocked, playBase64Audio } from "@/lib/audioContext";
import {
  DEMO_DOCUMENT,
  DEMO_SCENARIOS,
  DEMO_STAGE_TIMING,
  DEMO_STAGE_TIMING_FOLLOWUP,
} from "@/lib/demoData";
import { AGENT_PERSONAS, type PipelineStage } from "@/lib/constants";
import PipelineRelay from "./PipelineRelay";

type HeroState = "idle" | "playing" | "done";

interface ConversationEntry {
  question: string;
  questionEnglish: string;
  answer: string;
  translatedAnswer: string;
  languageName: string;
  nativeName: string;
}

export default function VaaniHero({ autoPlay = false }: { autoPlay?: boolean }) {
  const [heroState, setHeroState] = useState<HeroState>("idle");
  const [activeStage, setActiveStage] = useState<PipelineStage | null>(null);
  const [completedStages, setCompletedStages] = useState<PipelineStage[]>([]);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [showDocument, setShowDocument] = useState(false);
  const [currentTurnLabel, setCurrentTurnLabel] = useState("");
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const cancelRef = useRef(false);

  const typeText = useCallback(
    (text: string, speed = 20): Promise<void> => {
      return new Promise((resolve) => {
        setIsTyping(true);
        setTypingText("");
        let i = 0;
        const interval = setInterval(() => {
          if (cancelRef.current) {
            clearInterval(interval);
            setIsTyping(false);
            resolve();
            return;
          }
          i++;
          setTypingText(text.slice(0, i));
          if (i >= text.length) {
            clearInterval(interval);
            setIsTyping(false);
            resolve();
          }
        }, speed);
      });
    },
    []
  );

  const runPipelineAnimation = useCallback(
    async (timing: typeof DEMO_STAGE_TIMING) => {
      setCompletedStages([]);
      for (const stage of timing) {
        if (cancelRef.current) return;
        await new Promise((r) => setTimeout(r, stage.delayBefore));
        setActiveStage(stage.id);
        await new Promise((r) => setTimeout(r, stage.duration));
        setActiveStage(null);
        setCompletedStages((prev) => [...prev, stage.id]);
      }
    },
    []
  );

  const runDemo = useCallback(async () => {
    cancelRef.current = false;
    setHeroState("playing");
    setConversation([]);
    setShowDocument(true);

    const scenario = DEMO_SCENARIOS[0]; // Tamil

    // Turn 1
    setCurrentTurnLabel(`${scenario.nativeName} — Turn 1`);
    await runPipelineAnimation(DEMO_STAGE_TIMING);
    if (cancelRef.current) return;

    const turn1 = scenario.turns[0];
    await typeText(turn1.translatedAnswer, 15);
    if (cancelRef.current) return;

    setConversation([
      {
        question: turn1.question,
        questionEnglish: turn1.questionEnglish,
        answer: turn1.answer,
        translatedAnswer: turn1.translatedAnswer,
        languageName: scenario.languageName,
        nativeName: scenario.nativeName,
      },
    ]);
    setTypingText("");

    // Try TTS for turn 1
    try {
      if (isAudioUnlocked()) {
        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: turn1.translatedAnswer,
            targetLang: scenario.languageCode,
            voice: "priya",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.audio) await playBase64Audio(data.audio);
        }
      }
    } catch {
      // TTS is optional in demo
    }

    await new Promise((r) => setTimeout(r, 1500));
    if (cancelRef.current) return;

    // Turn 2
    setCurrentTurnLabel(`${scenario.nativeName} — Turn 2`);
    await runPipelineAnimation(DEMO_STAGE_TIMING_FOLLOWUP);
    if (cancelRef.current) return;

    const turn2 = scenario.turns[1];
    await typeText(turn2.translatedAnswer, 15);
    if (cancelRef.current) return;

    setConversation((prev) => [
      ...prev,
      {
        question: turn2.question,
        questionEnglish: turn2.questionEnglish,
        answer: turn2.answer,
        translatedAnswer: turn2.translatedAnswer,
        languageName: scenario.languageName,
        nativeName: scenario.nativeName,
      },
    ]);
    setTypingText("");

    // Try TTS for turn 2
    try {
      if (isAudioUnlocked()) {
        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: turn2.translatedAnswer,
            targetLang: scenario.languageCode,
            voice: "priya",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.audio) await playBase64Audio(data.audio);
        }
      }
    } catch {
      // TTS is optional
    }

    setHeroState("done");
  }, [runPipelineAnimation, typeText]);

  useEffect(() => {
    if (autoPlay) {
      runDemo();
    }
  }, [autoPlay, runDemo]);

  const handleBegin = () => {
    unlockAudio();
    runDemo();
  };

  const handleReplay = () => {
    cancelRef.current = true;
    setTimeout(() => {
      setHeroState("idle");
      setActiveStage(null);
      setCompletedStages([]);
      setConversation([]);
      setShowDocument(false);
      setCurrentTurnLabel("");
      setTypingText("");
    }, 100);
  };

  return (
    <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Title */}
      <div className="text-center mb-10 animate-slide-up">
        <span className="section-label mb-4 block">Sarvam AI Demo Hub</span>
        <h1
          className="font-display text-7xl sm:text-9xl font-light italic tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Vaani
        </h1>
        <p className="mt-5 font-body text-xl sm:text-2xl text-[var(--text-secondary)] font-light max-w-lg mx-auto leading-relaxed">
          Talk to any document, in any Indian language.
        </p>
        <p className="mt-2 text-[var(--text-muted)] text-base sm:text-lg">
          5 AI models working in concert.
        </p>
      </div>

      {/* Begin / Replay button */}
      {heroState === "idle" && (
        <button
          onClick={handleBegin}
          className="mt-4 rounded-full px-10 py-4 text-base font-medium text-white tracking-wide
                     hover:scale-105 transition-transform duration-300 animate-scale-in animate-breathe"
          style={{ background: "var(--accent)" }}
        >
          Begin
        </button>
      )}

      {heroState === "done" && (
        <button
          onClick={handleReplay}
          className="mt-4 rounded-full px-8 py-3 text-base font-medium tracking-wide
                     hover:scale-105 transition-transform duration-300 animate-fade-in"
          style={{
            color: "var(--accent)",
            background: "var(--accent-bg)",
            border: "1px solid var(--border-accent)",
          }}
        >
          Replay
        </button>
      )}

      {/* Demo content area */}
      {heroState !== "idle" && (
        <div className="mt-12 w-full max-w-4xl space-y-6 animate-fade-in">
          {/* Document card + Turn label side by side on desktop */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-4 items-start">
            {showDocument && (
              <div className="card p-6 animate-relay-in">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📄</span>
                  <div>
                    <p className="text-base font-medium text-[var(--text-primary)]">
                      {DEMO_DOCUMENT.fileName}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      {DEMO_DOCUMENT.pageCount} pages · {DEMO_DOCUMENT.textLength} chars
                    </p>
                    <p className="text-sm text-[var(--text-tertiary)] mt-2 line-clamp-2 font-body leading-relaxed">
                      {DEMO_DOCUMENT.textSnippet}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentTurnLabel && (
              <div className="flex items-center justify-center lg:justify-start">
                <span
                  className="inline-block text-xs font-medium uppercase tracking-[0.2em] px-4 py-2 rounded-full animate-fade-in"
                  style={{
                    background: "var(--accent-bg)",
                    color: "var(--accent)",
                    border: "1px solid var(--border-accent)",
                  }}
                >
                  {currentTurnLabel}
                </span>
              </div>
            )}
          </div>

          {/* Pipeline relay */}
          <PipelineRelay
            activeStage={activeStage}
            completedStages={completedStages}
          />

          {/* Typing indicator */}
          {typingText && (
            <div className="card p-6 animate-relay-in">
              <p className="text-base font-body text-[var(--text-primary)] leading-relaxed">
                {typingText}
                {isTyping && (
                  <span className="inline-block w-0.5 h-5 bg-[var(--accent)] ml-0.5 animate-pulse align-text-bottom" />
                )}
              </p>
            </div>
          )}

          {/* Completed conversation — 2 columns on desktop */}
          <div className="grid lg:grid-cols-2 gap-5">
            {conversation.map((entry, i) => (
              <div key={i} className="card p-6 space-y-4 animate-relay-in">
                {/* Question */}
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">🎤</span>
                  <div>
                    <p className="text-base font-medium text-[var(--text-primary)]">
                      {entry.question}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-1 italic">
                      {entry.questionEnglish}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="divider-gradient" />

                {/* Answer */}
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">💬</span>
                  <div>
                    <p className="text-base text-[var(--text-primary)] leading-relaxed">
                      {entry.translatedAnswer}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-2 italic">
                      {entry.answer}
                    </p>
                    <span
                      className="inline-block mt-3 text-xs font-medium tracking-wide px-3 py-1 rounded-full"
                      style={{
                        background: "var(--accent-bg)",
                        color: "var(--accent)",
                      }}
                    >
                      {entry.nativeName} · {entry.languageName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
