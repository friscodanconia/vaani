"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Phase = "idle" | "translating" | "done";
type SideStatus = "idle" | "typing" | "done";

// The Bengali example — the strongest one ("eat tea")
const ORIGINAL = "দাদা, একটু চা খাবেন? বাইরে তো বৃষ্টি পড়ছে, একটু জিরিয়ে নিন। আমি এইমাত্র রসগোল্লা বানিয়েছি, সেটাও খেয়ে যান।";
const ORIGINAL_LANG = "Bengali";
const CONTEXT = "Offering tea and sweets to a guest during rain";

const LITERAL_TEXT =
  "Elder brother, will you eat some tea? Outside rain is falling, please take some rest for a little while. I have just now made rosogolla, eat that also and go.";
const LITERAL_NOTE =
  '"Eat tea", "eat that also and go" — literal translations of চা খাবেন and খেয়ে যান that sound bizarre in English.';

// Cached Mayura translation (fallback if API fails)
const MAYURA_FALLBACK =
  "Hey, would you like some tea? It's pouring outside — why don't you sit down and take a break for a bit? I just made some rosogolla, have some before you leave.";
const MAYURA_NOTE =
  "Drops the stiff honorific, fixes 'eat tea' → 'like some tea', and captures the warmth of the original Bengali.";

// Key differences to highlight after completion
const DIFFS = [
  { literal: "eat some tea", mayura: "like some tea", note: "Fixes the classic চা খাবেন mistranslation" },
  { literal: "Outside rain is falling", mayura: "It's pouring outside", note: "Natural English word order" },
  { literal: "take some rest", mayura: "sit down, take a break", note: "Captures the warmth of জিরিয়ে নিন" },
  { literal: "eat that also and go", mayura: "have some before you leave", note: "খেয়ে যান doesn't mean 'eat and go'" },
];

const TYPING_SPEED = 50; // chars per second
const LITERAL_DELAY = 200; // ms before literal starts typing (feels like instant)

// Generate a subtle typewriter click using Web Audio API
function createClickSound(audioCtx: AudioContext) {
  const buffer = audioCtx.createBuffer(1, 200, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < 200; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 20);
  }
  return buffer;
}

export default function DemoMayura() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [literalStatus, setLiteralStatus] = useState<SideStatus>("idle");
  const [mayuraStatus, setMayuraStatus] = useState<SideStatus>("idle");
  const [literalChars, setLiteralChars] = useState(0);
  const [mayuraText, setMayuraText] = useState("");
  const [mayuraChars, setMayuraChars] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finalTime, setFinalTime] = useState<string | null>(null);
  const [showDiffs, setShowDiffs] = useState(false);

  const timerStartRef = useRef(0);
  const rafRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");

  // Typing state kept in refs for rAF loop
  const literalRef = useRef({ status: "idle" as SideStatus, chars: 0, startTime: 0 });
  const mayuraRef = useRef({
    status: "idle" as SideStatus,
    chars: 0,
    startTime: 0,
    graphemes: [] as string[],
    text: "",
  });

  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const clickBufferRef = useRef<AudioBuffer | null>(null);
  const lastClickRef = useRef(0);

  const playClick = useCallback(() => {
    const ctx = audioCtxRef.current;
    const buffer = clickBufferRef.current;
    if (!ctx || !buffer) return;
    const now = performance.now();
    if (now - lastClickRef.current < 55) return;
    lastClickRef.current = now;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.06;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }, []);

  const literalGraphemes = Array.from(LITERAL_TEXT);

  const tick = useCallback(() => {
    if (phaseRef.current !== "translating") return;

    const now = performance.now();
    setElapsedMs(now - timerStartRef.current);

    let anyTyping = false;
    let bothDone = true;

    // Literal side
    const lit = literalRef.current;
    if (lit.status === "typing") {
      const elapsed = now - lit.startTime;
      const chars = Math.min(
        Math.floor((elapsed / 1000) * TYPING_SPEED),
        literalGraphemes.length
      );
      if (chars !== lit.chars) {
        lit.chars = chars;
        setLiteralChars(chars);
        anyTyping = true;
      }
      if (chars >= literalGraphemes.length) {
        lit.status = "done";
        setLiteralStatus("done");
      } else {
        bothDone = false;
        anyTyping = true;
      }
    } else if (lit.status === "idle") {
      bothDone = false;
    }

    // Mayura side
    const may = mayuraRef.current;
    if (may.status === "typing") {
      const elapsed = now - may.startTime;
      const chars = Math.min(
        Math.floor((elapsed / 1000) * TYPING_SPEED),
        may.graphemes.length
      );
      if (chars !== may.chars) {
        may.chars = chars;
        setMayuraChars(chars);
        anyTyping = true;
      }
      if (chars >= may.graphemes.length) {
        may.status = "done";
        setMayuraStatus("done");
      } else {
        bothDone = false;
        anyTyping = true;
      }
    } else if (may.status === "idle") {
      bothDone = false;
    }

    if (anyTyping) playClick();

    if (bothDone) {
      const elapsed = now - timerStartRef.current;
      phaseRef.current = "done";
      setFinalTime((elapsed / 1000).toFixed(2));
      setPhase("done");
      // Show diffs after a beat
      setTimeout(() => setShowDiffs(true), 600);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [playClick, literalGraphemes.length]);

  const startDemo = useCallback(() => {
    if (phaseRef.current === "translating") return;

    // Init audio
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      clickBufferRef.current = createClickSound(ctx);
    }

    // Reset
    literalRef.current = { status: "idle", chars: 0, startTime: 0 };
    mayuraRef.current = { status: "idle", chars: 0, startTime: 0, graphemes: [], text: "" };
    setLiteralStatus("idle");
    setMayuraStatus("idle");
    setLiteralChars(0);
    setMayuraText("");
    setMayuraChars(0);
    setElapsedMs(0);
    setFinalTime(null);
    setShowDiffs(false);

    phaseRef.current = "translating";
    setPhase("translating");
    timerStartRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    // Start literal side after a tiny delay (it's "instant" — cached)
    setTimeout(() => {
      literalRef.current.status = "typing";
      literalRef.current.startTime = performance.now();
      setLiteralStatus("typing");
    }, LITERAL_DELAY);

    // Fire real Mayura API call (Bengali → English)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: ORIGINAL,
        sourceLang: "bn-IN",
        targetLang: "en-IN",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeout);
        const text: string = data.translated || MAYURA_FALLBACK;
        const graphemes = Array.from(text);
        mayuraRef.current = {
          status: "typing",
          chars: 0,
          startTime: performance.now(),
          graphemes,
          text,
        };
        setMayuraText(text);
        setMayuraStatus("typing");
      })
      .catch(() => {
        clearTimeout(timeout);
        const graphemes = Array.from(MAYURA_FALLBACK);
        mayuraRef.current = {
          status: "typing",
          chars: 0,
          startTime: performance.now(),
          graphemes,
          text: MAYURA_FALLBACK,
        };
        setMayuraText(MAYURA_FALLBACK);
        setMayuraStatus("typing");
      });
  }, [tick]);

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

  const literalDisplayed = literalGraphemes.slice(0, literalChars).join("");
  const mayuraGraphemes = Array.from(mayuraText);
  const mayuraDisplayed = mayuraGraphemes.slice(0, mayuraChars).join("");

  const cursor = (
    <span
      className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom"
      style={{
        background: "var(--accent)",
        animation: "typing-cursor 0.6s ease-in-out infinite",
      }}
    />
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="section-label">Mayura</span>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl italic mt-3 text-[var(--text-primary)]">
          Lost in Translation
        </h2>
      </div>

      {/* Setup */}
      <div className="max-w-2xl mx-auto mb-12 text-center space-y-4">
        <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Literal translation{" "}
          <strong style={{ color: "var(--text-primary)" }}>misses the soul</strong>.
          &ldquo;Will you eat some tea?&rdquo; is grammatically correct Bengali-to-English
          — but no one talks like that.
        </p>
        <p className="text-base leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          Mayura translates meaning, not just words. Watch a literal engine and Mayura
          race on the same sentence — live.
        </p>
      </div>

      {/* Play Demo button */}
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
            Bengali → English — literal vs Mayura, side by side
          </p>
        </div>
      )}

      {/* Demo content */}
      {phase !== "idle" && (
        <div className="anim-fade-in space-y-6">
          {/* Timer */}
          <div className="text-center">
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

          {/* Original Bengali sentence */}
          <div className="glass-card p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span
                className="text-xs font-semibold tracking-[0.15em] uppercase"
                style={{ color: "var(--text-tertiary)" }}
              >
                {CONTEXT}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--accent-subtle)",
                  color: "var(--accent)",
                  border: "1px solid var(--border-accent)",
                }}
              >
                {ORIGINAL_LANG}
              </span>
            </div>
            <p className="font-display text-xl sm:text-2xl font-semibold text-[var(--text-primary)] leading-snug">
              {ORIGINAL}
            </p>
          </div>

          {/* Duel: side by side on desktop, stacked on mobile */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Literal side */}
            <div
              className="glass-card p-5 transition-all duration-300"
              style={{
                borderColor:
                  literalStatus === "done"
                    ? "var(--error)"
                    : literalStatus === "typing"
                    ? "rgba(191,79,79,0.4)"
                    : "var(--border-subtle)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-semibold tracking-[0.12em] uppercase"
                  style={{ color: "#bf4f4f" }}
                >
                  Literal translation
                </span>
              </div>
              <div className="min-h-[5rem]">
                {literalStatus !== "idle" && (
                  <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                    {literalDisplayed}
                    {literalStatus === "typing" && cursor}
                  </p>
                )}
              </div>
              {literalStatus === "done" && (
                <p className="text-xs mt-3 italic" style={{ color: "#bf4f4f" }}>
                  {LITERAL_NOTE}
                </p>
              )}
            </div>

            {/* Mayura side */}
            <div
              className="glass-card p-5 transition-all duration-300"
              style={{
                borderColor:
                  mayuraStatus === "done"
                    ? "var(--success)"
                    : mayuraStatus === "typing"
                    ? "var(--accent)"
                    : "var(--border-subtle)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-semibold tracking-[0.12em] uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  Mayura translation
                </span>
              </div>
              <div className="min-h-[5rem]">
                {mayuraStatus === "idle" && phase === "translating" && (
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: "var(--accent)", animation: "glow-pulse 1s ease-in-out infinite" }}
                    />
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Calling Sarvam API...
                    </span>
                  </div>
                )}
                {mayuraStatus !== "idle" && (
                  <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
                    {mayuraDisplayed}
                    {mayuraStatus === "typing" && cursor}
                  </p>
                )}
              </div>
              {mayuraStatus === "done" && (
                <p className="text-xs mt-3 italic" style={{ color: "var(--accent)" }}>
                  {MAYURA_NOTE}
                </p>
              )}
            </div>
          </div>

          {/* Key differences annotation */}
          {showDiffs && (
            <div className="anim-fade-in">
              <div className="glass-card p-5">
                <p
                  className="text-xs font-semibold tracking-[0.15em] uppercase mb-4"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Key Differences
                </p>
                <div className="space-y-3">
                  {DIFFS.map((d, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium line-through"
                        style={{
                          background: "rgba(191,79,79,0.06)",
                          color: "#bf4f4f",
                          border: "1px solid rgba(191,79,79,0.15)",
                        }}
                      >
                        {d.literal}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" className="shrink-0">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: "rgba(90,143,110,0.08)",
                          color: "var(--success)",
                          border: "1px solid rgba(90,143,110,0.2)",
                        }}
                      >
                        {d.mayura}
                      </span>
                      <span className="text-xs basis-full sm:basis-auto" style={{ color: "var(--text-muted)" }}>
                        {d.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Punchline + Capabilities + Replay */}
      {phase === "done" && showDiffs && (
        <div className="mt-10 anim-fade-in space-y-8">
          <div className="text-center space-y-3">
            <p
              className="font-display text-2xl sm:text-3xl italic"
              style={{ color: "var(--text-primary)" }}
            >
              Same words. Different soul.
            </p>
          </div>

          {/* Capabilities */}
          <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl px-4 py-3 text-center" style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}>
              <p className="text-2xl mb-1">💬</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Colloquial</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Handles slang, code-mixing, and casual speech</p>
            </div>
            <div className="rounded-xl px-4 py-3 text-center" style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}>
              <p className="text-2xl mb-1">🙏</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Cultural Context</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Preserves honorifics, idioms, and regional expressions</p>
            </div>
            <div className="rounded-xl px-4 py-3 text-center" style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}>
              <p className="text-2xl mb-1">🌐</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>22 Languages</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>All scheduled Indian languages supported</p>
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
