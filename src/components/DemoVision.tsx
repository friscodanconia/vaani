"use client";

import { useState, useRef, useEffect } from "react";

const MANUSCRIPT = {
  title: "Tolkāppiyam — Tamil Palm-Leaf Manuscript",
  era: "~300 BCE · Sangam Period",
  imageUrl: "/tamil-manuscript.jpg",
  language: "Tamil",
  extractedLines: [
    { label: "Panel (a)", tamil: "யாதும் ஊரே யாவரும் கேளிர்\nதீதும் நன்றும் பிறர் தர வாரா", english: "Every country is my own, and every person my kin. Good and evil do not come from others." },
    { label: "Panel (b)", tamil: "நோதலும் தணிதலும் அவற்றோர் அன்ன\nசாதலும் புதுவது அன்றே வாழ்தல்", english: "Pain and its relief are of the same nature. Death too is not new, nor is living." },
    { label: "Panel (c)", tamil: "உண்டால் அம்ம இவ்வுலகம் இந்திரர்\nஅமிழ்தம் இயைவது ஆயினும் இனிதெனத்", english: "Even if one were offered Indra's nectar, it would not taste sweet if eaten alone." },
    { label: "Panel (d)", tamil: "தமிழ் மொழி போல் இனிது எங்கும் காணோம்\nமக்கள் தாமே நாகரிகம் ஆவர்", english: "We see nothing as sweet as the Tamil tongue anywhere. People themselves become civilisation." },
    { label: "Panel (e)", tamil: "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு", english: "As the letter 'A' is first of all letters, so is the eternal God first in the world." },
    { label: "Panel (f)", tamil: "கற்றதனால் ஆய பயன் என்கொல் வாலறிவன்\nநற்றாள் தொழாஅர் எனின்", english: "What is the use of learning, if one does not worship the feet of the Pure Knowing One?" },
  ],
};

type Phase = "intro" | "scanning" | "extracting" | "done";

export default function DemoVision() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [started, setStarted] = useState(false);
  const [scanPercent, setScanPercent] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const abortedRef = useRef(false);

  useEffect(() => {
    return () => {
      abortedRef.current = true;
    };
  }, []);

  const handlePlay = () => {
    if (started && phase !== "done") return;
    runDemo();
  };

  const runDemo = async () => {
    abortedRef.current = false;
    setStarted(true);
    setPhase("scanning");
    setScanPercent(0);

    const scanStart = Date.now();
    const scanDuration = 2500;
    const animateScan = () => {
      if (abortedRef.current) return;
      const elapsed = Date.now() - scanStart;
      const progress = Math.min(elapsed / scanDuration, 1);
      setScanPercent(Math.round(progress * 100));
      if (progress < 1) {
        requestAnimationFrame(animateScan);
      }
    };
    requestAnimationFrame(animateScan);
    await new Promise((r) => setTimeout(r, scanDuration + 300));

    if (abortedRef.current) return;
    setPhase("extracting");
    for (let i = 1; i <= MANUSCRIPT.extractedLines.length; i++) {
      if (abortedRef.current) return;
      await new Promise((r) => setTimeout(r, 600));
      setVisibleLines(i);
    }

    if (abortedRef.current) return;
    await new Promise((r) => setTimeout(r, 600));
    setPhase("done");
  };

  const handleReplay = () => {
    setPhase("intro");
    setScanPercent(0);
    setVisibleLines(0);
    setTimeout(() => runDemo(), 100);
  };

  return (
    <div ref={sectionRef} className="max-w-6xl mx-auto px-6 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="section-label">Sarvam Vision</span>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl italic mt-3 text-[var(--text-primary)]">
          The Reader
        </h2>
      </div>

      {/* Setup */}
      <div className="max-w-2xl mx-auto mb-12 text-center space-y-4">
        <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          This is a <strong style={{ color: "var(--text-primary)" }}>palm-leaf manuscript</strong> of the Tolkāppiyam, one of the oldest surviving works in Tamil, dating to roughly <strong style={{ color: "var(--text-primary)" }}>300 BCE</strong>.
        </p>
        <p className="text-base leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          Faded ink, brittle palm leaves, ancient letterforms that no longer match modern Tamil fonts. Standard OCR engines fail on documents like this. Sarvam Vision is a 3B vision-language model trained specifically for Indian scripts: handwritten, printed, or ancient.
        </p>
      </div>

      {/* Play Demo button */}
      {!started && (
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
            Watch Sarvam Vision read a 2,300-year-old manuscript
          </p>
        </div>
      )}

      {/* Desktop: side-by-side | Mobile: stacked */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">

        {/* LEFT: Manuscript image */}
        <div className="glass-card overflow-hidden">
          <div className="relative bg-[var(--warm-100)]">
            <img
              src={MANUSCRIPT.imageUrl}
              alt={MANUSCRIPT.title}
              className="w-full h-auto object-contain"
              style={{ minHeight: "300px" }}
              loading="eager"
            />

            {/* Language badge */}
            <span
              className="absolute top-4 left-4 text-sm font-semibold tracking-wide px-3.5 py-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.9)",
                color: "var(--text-secondary)",
                backdropFilter: "blur(8px)",
              }}
            >
              {MANUSCRIPT.language} · {MANUSCRIPT.era}
            </span>

            {/* Scanning overlay */}
            {phase === "scanning" && (
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute left-0 right-0 h-0.5"
                  style={{
                    top: `${scanPercent}%`,
                    background: "var(--accent)",
                    boxShadow: "0 0 20px var(--accent-glow-strong), 0 0 40px var(--accent-glow)",
                    transition: "top 0.05s linear",
                  }}
                />
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-full"
                  style={{
                    background: "var(--accent)",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white"
                        style={{
                          animation: "glow-pulse 1s ease-in-out infinite",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                  <span>SCANNING · {scanPercent}%</span>
                </div>
              </div>
            )}

            {/* Done badge */}
            {(phase === "extracting" || phase === "done") && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-full anim-fade-in"
                style={{
                  background: "rgba(90, 143, 110, 0.95)",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                <span>SCAN COMPLETE</span>
              </div>
            )}
          </div>

          {/* Caption under image */}
          <div className="px-5 py-3" style={{ borderTop: "1.5px solid var(--border-subtle)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {MANUSCRIPT.title}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              One of the oldest literary traditions in India
            </p>
          </div>
        </div>

        {/* RIGHT: Extracted text */}
        <div className="glass-card p-6 sm:p-8 lg:min-h-[400px] flex flex-col">
          {phase === "intro" && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-base text-center" style={{ color: "var(--text-tertiary)" }}>
                Watch Sarvam Vision read a 2,300-year-old manuscript...
              </p>
            </div>
          )}

          {phase === "scanning" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1 h-5 rounded-full"
                      style={{
                        background: "var(--accent)",
                        animation: "audio-wave 0.8s ease-in-out infinite",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-base font-medium" style={{ color: "var(--accent)" }}>
                  Reading ancient Tamil script...
                </p>
                <p className="text-sm font-mono tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                  {scanPercent}% complete
                </p>
              </div>
            </div>
          )}

          {(phase === "extracting" || phase === "done") && (
            <div className="space-y-1 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-4" style={{ color: "var(--accent)" }}>
                Extracted Text
              </p>
              {MANUSCRIPT.extractedLines.map((line, i) => (
                <div
                  key={i}
                  className={`transition-all duration-700 ${i < visibleLines ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div
                    className="rounded-xl px-4 py-3 mb-2.5"
                    style={{
                      background: "var(--warm-50)",
                      border: "1.5px solid var(--border-subtle)",
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--accent)", opacity: 0.7 }}>
                      {line.label}
                    </p>
                    <p className="text-base font-medium leading-relaxed whitespace-pre-line" style={{ color: "var(--text-primary)" }}>
                      {line.tamil}
                    </p>
                    <p className="text-sm mt-1.5 italic leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                      {line.english}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Punchline + Replay */}
      {phase === "done" && (
        <div className="mt-10 text-center anim-fade-in space-y-5">
          <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            A 2,300-year-old palm-leaf manuscript, read in seconds.
          </p>
          <p className="text-base" style={{ color: "var(--text-tertiary)" }}>
            Sarvam Vision supports 22 Indian scripts, from ancient manuscripts to modern government forms.
          </p>
          <button
            onClick={handleReplay}
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
        </div>
      )}
    </div>
  );
}
