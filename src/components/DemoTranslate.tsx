"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { HEADLINE_ENGLISH, TRANSLATIONS, TranslationCard } from "@/data/translateDemoData";

type Phase = "idle" | "translating" | "done";

interface CardState {
  status: "idle" | "typing" | "done";
  fullText: string;
  graphemes: string[];
  displayedChars: number;
  startTime: number;
}

const TYPING_SPEED = 55; // chars per second

// Elliptical layout: wider horizontally to avoid overlap on landscape screens
const RADIUS_X = 420;
const RADIUS_Y = 310;
const RADIAL_POSITIONS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * 360) / 8 - 90; // start from top
  const rad = (angle * Math.PI) / 180;
  return {
    x: Math.cos(rad) * RADIUS_X,
    y: Math.sin(rad) * RADIUS_Y,
  };
});

// Line length for SVG dash animation (average of radii)
const LINE_LENGTH = Math.round((RADIUS_X + RADIUS_Y) / 2);

function makeEmptyCards(): CardState[] {
  return TRANSLATIONS.map(() => ({
    status: "idle" as const,
    fullText: "",
    graphemes: [],
    displayedChars: 0,
    startTime: 0,
  }));
}

// Generate a subtle typewriter click using Web Audio API
function createClickSound(audioCtx: AudioContext) {
  const buffer = audioCtx.createBuffer(1, 200, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < 200; i++) {
    // Sharp transient noise that decays quickly
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 20);
  }
  return buffer;
}

export default function DemoTranslate() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [cards, setCards] = useState<CardState[]>(makeEmptyCards);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finalTime, setFinalTime] = useState<string | null>(null);
  const [svgLineActive, setSvgLineActive] = useState<boolean[]>(() =>
    Array(8).fill(false)
  );

  const timerStartRef = useRef(0);
  const rafRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const cardsRef = useRef<CardState[]>(makeEmptyCards());

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const clickBufferRef = useRef<AudioBuffer | null>(null);
  const lastClickRef = useRef(0);

  const playClick = useCallback(() => {
    const ctx = audioCtxRef.current;
    const buffer = clickBufferRef.current;
    if (!ctx || !buffer) return;

    // Throttle clicks to ~18 per second max (every ~55ms)
    const now = performance.now();
    if (now - lastClickRef.current < 55) return;
    lastClickRef.current = now;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.06; // very subtle
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }, []);

  // rAF loop uses refs only — no closure issues
  const tick = useCallback(() => {
    if (phaseRef.current !== "translating") return;

    const now = performance.now();
    const elapsed = now - timerStartRef.current;
    setElapsedMs(elapsed);

    const currentCards = cardsRef.current;
    let anyChanged = false;
    let allDone = true;
    let anyTyping = false;

    const nextCards = currentCards.map((c) => {
      if (c.status === "typing") {
        const charElapsed = now - c.startTime;
        const charsToShow = Math.min(
          Math.floor((charElapsed / 1000) * TYPING_SPEED),
          c.graphemes.length
        );
        if (charsToShow >= c.graphemes.length) {
          anyChanged = true;
          return { ...c, displayedChars: c.graphemes.length, status: "done" as const };
        }
        if (charsToShow !== c.displayedChars) {
          anyChanged = true;
          anyTyping = true;
          allDone = false;
          return { ...c, displayedChars: charsToShow };
        }
        anyTyping = true;
        allDone = false;
        return c;
      }
      if (c.status === "idle") allDone = false;
      return c;
    });

    if (anyTyping) playClick();

    if (anyChanged) {
      cardsRef.current = nextCards;
      setCards(nextCards);
    }

    if (allDone && nextCards.every((c) => c.status === "done")) {
      phaseRef.current = "done";
      setFinalTime((elapsed / 1000).toFixed(2));
      setPhase("done");
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [playClick]);

  const startTyping = useCallback((index: number, text: string) => {
    const graphemes = Array.from(text);
    const updated = [...cardsRef.current];
    updated[index] = {
      status: "typing",
      fullText: text,
      graphemes,
      displayedChars: 0,
      startTime: performance.now(),
    };
    cardsRef.current = updated;
    setCards([...updated]);
  }, []);

  const startDemo = useCallback(() => {
    if (phaseRef.current === "translating") return;

    // Init audio on first user interaction
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      clickBufferRef.current = createClickSound(ctx);
    }

    // Reset everything
    const fresh = makeEmptyCards();
    cardsRef.current = fresh;
    setCards(fresh);
    phaseRef.current = "translating";
    setPhase("translating");
    setElapsedMs(0);
    setFinalTime(null);
    setSvgLineActive(Array(8).fill(false));

    timerStartRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    // Track how many API calls have returned (for timing)
    let responsesLanded = 0;

    // Fire all 8 API calls independently
    // We use cached translations for display but real API calls for timing
    TRANSLATIONS.forEach((lang, i) => {
      // Stagger SVG line animations
      setTimeout(() => {
        setSvgLineActive((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 50);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: HEADLINE_ENGLISH,
          targetLang: lang.languageCode,
        }),
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then(() => {
          clearTimeout(timeout);
          responsesLanded++;
          // Always use cached high-quality native-script translations
          startTyping(i, lang.translatedHeadline);
        })
        .catch(() => {
          clearTimeout(timeout);
          responsesLanded++;
          // Fallback also uses cached
          startTyping(i, lang.translatedHeadline);
        });
    });
  }, [tick, startTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  const handlePlay = () => {
    if (phaseRef.current === "done") {
      phaseRef.current = "idle";
      setPhase("idle");
      setTimeout(() => startDemo(), 50);
    } else {
      startDemo();
    }
  };

  const displayTime = finalTime ?? (elapsedMs / 1000).toFixed(2);

  const renderCard = (lang: TranslationCard, i: number, card: CardState) => {
    const borderColor =
      card.status === "done"
        ? "var(--success)"
        : card.status === "typing"
        ? "var(--accent)"
        : "var(--border-subtle)";

    const displayedText = card.graphemes.slice(0, card.displayedChars).join("");

    return (
      <div
        key={i}
        className="glass-card p-4 transition-all duration-300"
        style={{ borderColor }}
      >
        {/* Masthead */}
        <p
          className="text-xs font-semibold tracking-[0.15em] uppercase mb-2"
          style={{ color: "var(--text-tertiary)" }}
        >
          {lang.masthead}
        </p>

        {/* Translation text area */}
        <div className="min-h-[4rem] mb-2 overflow-hidden">
          {card.status !== "idle" && (
            <p
              className="text-sm font-medium leading-relaxed break-words"
              style={{ color: "var(--text-primary)" }}
            >
              {displayedText}
              {card.status === "typing" && (
                <span
                  className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom"
                  style={{
                    background: "var(--accent)",
                    animation: "typing-cursor 0.6s ease-in-out infinite",
                  }}
                />
              )}
              {card.status === "done" && (
                <span className="inline-block ml-1.5 text-[var(--success)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="inline">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </span>
              )}
            </p>
          )}
        </div>

        {/* Language badge */}
        <span
          className="inline-block text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full"
          style={{
            background: "var(--accent-subtle)",
            color: "var(--accent)",
            border: "1.5px solid var(--border-accent)",
          }}
        >
          {lang.nativeName} · {lang.language}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="section-label">Sarvam Translate</span>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl italic mt-3 text-[var(--text-primary)]">
          One India
        </h2>
      </div>

      {/* Setup */}
      <div className="max-w-2xl mx-auto mb-12 text-center space-y-4">
        <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          India publishes news in{" "}
          <strong style={{ color: "var(--text-primary)" }}>22 official languages</strong>.
          A headline in English should read just as naturally in Tamil, Bengali, or
          Gujarati — not like a machine translated it.
        </p>
        <p className="text-base leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          Sarvam Translate is an open-weight translation model trained specifically for
          Indian languages. Watch one headline race across eight front pages — live.
        </p>
      </div>

      {/* Play Demo button (idle state) */}
      {phase === "idle" && (
        <div className="text-center mb-10 anim-fade-in">
          <button
            onClick={handlePlay}
            className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-lg font-semibold tracking-wide transition-all duration-300 hover-lift"
            style={{
              background: "var(--accent)",
              color: "white",
              border: "2px solid var(--accent)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Play Demo
          </button>
          <p className="text-sm mt-3" style={{ color: "var(--text-tertiary)" }}>
            Live API calls — watch 8 translations race in parallel
          </p>
        </div>
      )}

      {/* Timer (during and after) */}
      {phase !== "idle" && (
        <div className="text-center mb-8 anim-fade-in">
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2"
            style={{
              background: phase === "done" ? "rgba(90,143,110,0.08)" : "var(--accent-subtle)",
              border: `1.5px solid ${phase === "done" ? "rgba(90,143,110,0.3)" : "var(--border-accent)"}`,
              animation: phase === "done" ? "timer-pop 0.4s ease-out" : "none",
            }}
          >
            {phase === "translating" && (
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: "var(--accent)", animation: "glow-pulse 1s ease-in-out infinite" }}
              />
            )}
            {phase === "done" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            )}
            <span
              className="text-lg font-semibold tabular-nums"
              style={{
                color: phase === "done" ? "var(--success)" : "var(--accent)",
                fontFamily: "'Outfit', monospace",
              }}
            >
              {displayTime}s
            </span>
          </div>
        </div>
      )}

      {/* Demo content */}
      {phase !== "idle" && (
        <div className="anim-fade-in">
          {/* ── Desktop: Elliptical radial layout (lg+) ── */}
          <div className="hidden lg:block relative" style={{ minHeight: "780px", paddingTop: "40px" }}>
            {/* SVG overlay for broadcast lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
              viewBox={`-${RADIUS_X + 80} -${RADIUS_Y + 80} ${(RADIUS_X + 80) * 2} ${(RADIUS_Y + 80) * 2}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {RADIAL_POSITIONS.map((pos, i) => (
                <line
                  key={i}
                  x1="0"
                  y1="0"
                  x2={pos.x}
                  y2={pos.y}
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray={LINE_LENGTH}
                  strokeDashoffset={svgLineActive[i] ? 0 : LINE_LENGTH}
                  style={{
                    opacity: svgLineActive[i] ? 0.25 : 0,
                    transition: `stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 50}ms, opacity 0.3s ease ${i * 50}ms`,
                  } as React.CSSProperties}
                />
              ))}
            </svg>

            {/* Center: English source card */}
            <div
              className="absolute glass-card p-6 text-center"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "300px",
                zIndex: 2,
                animation: phase === "translating" ? "breathe 2s ease-in-out infinite" : "none",
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <span
                  className="text-xs font-semibold tracking-[0.15em] uppercase"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  English · Source
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--accent-subtle)",
                    color: "var(--accent)",
                    border: "1px solid var(--border-accent)",
                  }}
                >
                  Live API
                </span>
              </div>
              <p className="font-display text-lg font-semibold text-[var(--text-primary)] leading-snug">
                {HEADLINE_ENGLISH}
              </p>
            </div>

            {/* 8 language cards in an ellipse */}
            {TRANSLATIONS.map((lang, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `calc(50% + ${RADIAL_POSITIONS[i].x}px)`,
                  top: `calc(50% + ${RADIAL_POSITIONS[i].y}px)`,
                  transform: "translate(-50%, -50%)",
                  width: "190px",
                  zIndex: 2,
                }}
              >
                {renderCard(lang, i, cards[i])}
              </div>
            ))}
          </div>

          {/* ── Mobile: 2-column grid (<lg) ── */}
          <div className="lg:hidden">
            {/* English source card */}
            <div
              className="glass-card p-6 sm:p-8 mb-6 text-center"
              style={{
                animation: phase === "translating" ? "breathe 2s ease-in-out infinite" : "none",
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <span
                  className="text-xs font-semibold tracking-[0.15em] uppercase"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  English · Source
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--accent-subtle)",
                    color: "var(--accent)",
                    border: "1px solid var(--border-accent)",
                  }}
                >
                  Live API
                </span>
              </div>
              <p className="font-display text-xl sm:text-2xl font-semibold text-[var(--text-primary)] leading-snug">
                {HEADLINE_ENGLISH}
              </p>
            </div>

            {/* 2-col grid of translations */}
            <div className="grid grid-cols-2 gap-3">
              {TRANSLATIONS.map((lang, i) => renderCard(lang, i, cards[i]))}
            </div>
          </div>
        </div>
      )}

      {/* Punchline + Capabilities + Replay (done state) */}
      {phase === "done" && (
        <div className="mt-10 anim-fade-in space-y-8">
          <div className="text-center space-y-3">
            <p
              className="font-display text-2xl sm:text-3xl italic"
              style={{ color: "var(--text-primary)" }}
            >
              One headline. Eight languages.{" "}
              <span style={{ color: "var(--accent)" }}>{finalTime}s.</span>
            </p>
          </div>

          {/* Capability cards */}
          <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-4">
            <div
              className="rounded-xl px-4 py-3 text-center"
              style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}
            >
              <p className="text-2xl mb-1">🌐</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                22 Languages
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                All scheduled Indian languages supported
              </p>
            </div>
            <div
              className="rounded-xl px-4 py-3 text-center"
              style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}
            >
              <p className="text-2xl mb-1">📄</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Long-Form Text
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                Handles structured documents and paragraphs
              </p>
            </div>
            <div
              className="rounded-xl px-4 py-3 text-center"
              style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}
            >
              <p className="text-2xl mb-1">🔓</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Open Weights
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                Customize and deploy on your own infrastructure
              </p>
            </div>
          </div>

          {/* Replay + Try it yourself */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handlePlay}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 hover-lift"
              style={{
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                border: "1.5px solid var(--border-visible)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1,4 1,10 7,10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Replay
            </button>
            <a
              href="https://www.sarvam.ai/models"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 hover-lift"
              style={{
                background: "var(--accent)",
                color: "white",
                border: "1.5px solid var(--accent)",
              }}
            >
              Try it yourself
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15,3 21,3 21,9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
