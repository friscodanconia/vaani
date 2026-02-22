"use client";

import { useState, useRef, useEffect } from "react";
import { BULBUL_SOURCE_TEXT, BULBUL_VOICES } from "@/data/bulbulDemoData";

export default function DemoBulbul() {
  const [started, setStarted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [doneCount, setDoneCount] = useState(0);
  const [done, setDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortedRef = useRef(false);

  useEffect(() => {
    return () => {
      abortedRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const runSequence = async () => {
    abortedRef.current = false;
    setStarted(true);
    setDone(false);
    setDoneCount(0);
    setActiveIndex(-1);
    setPlayingIndex(-1);

    for (let i = 0; i < BULBUL_VOICES.length; i++) {
      if (abortedRef.current) return;
      setActiveIndex(i);
      setPlayingIndex(i);

      await new Promise<void>((resolve) => {
        const audio = new Audio(BULBUL_VOICES[i].audioFile);
        audioRef.current = audio;
        audio.onended = () => {
          setPlayingIndex(-1);
          setDoneCount(i + 1);
          resolve();
        };
        audio.onerror = () => {
          setPlayingIndex(-1);
          setDoneCount(i + 1);
          resolve();
        };
        audio.play().catch(() => {
          setPlayingIndex(-1);
          setDoneCount(i + 1);
          resolve();
        });
      });

      if (abortedRef.current) return;
      await new Promise((r) => setTimeout(r, 400));
    }

    if (abortedRef.current) return;
    setActiveIndex(-1);
    setDone(true);
  };

  const handlePlay = () => {
    if (started && !done) return;
    runSequence();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="section-label">Bulbul V3</span>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl italic mt-3 text-[var(--text-primary)]">
          Voices of India
        </h2>
      </div>

      {/* Setup */}
      <div className="max-w-2xl mx-auto mb-12 text-center space-y-4">
        <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          One sentence. <strong style={{ color: "var(--text-primary)" }}>Five languages. Five voices.</strong> Hear the same words travel across India.
        </p>
        <p className="text-base leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          Bulbul V3 is Sarvam&apos;s production-ready text-to-speech model for Indian languages. Natural intonation, correct pronunciation, expressive delivery — not robotic synthesis.
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
            Listen to one English sentence spoken in 5 Indian languages
          </p>
        </div>
      )}

      {/* Demo content */}
      {started && (
        <div className="anim-fade-in">
          {/* Source text */}
          <div className="glass-card p-6 sm:p-8 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: "var(--text-tertiary)" }}>
                English · Source
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid var(--border-accent)" }}
              >
                Bulbul V3 API
              </span>
            </div>
            <p className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-[var(--text-primary)] leading-snug italic">
              &ldquo;{BULBUL_SOURCE_TEXT}&rdquo;
            </p>
          </div>

          {/* Counter */}
          <div className="text-center mb-6">
            <span className="text-base font-body" style={{ color: "var(--text-tertiary)" }}>
              Spoken in{" "}
              <span className="font-semibold text-lg" style={{ color: "var(--accent)" }}>
                {doneCount}
              </span>{" "}
              of {BULBUL_VOICES.length} languages
            </span>
          </div>

          {/* Voice cards — 2-col on mobile, 5-col on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {BULBUL_VOICES.map((voice, i) => {
              const isPlaying = playingIndex === i;
              const isDone = i < doneCount;
              const isWaiting = !isDone && !isPlaying;

              return (
                <div
                  key={i}
                  className={`glass-card p-3 sm:p-5 text-center transition-all duration-500 flex flex-col ${
                    isPlaying ? "ring-2 ring-[var(--accent)]/30" : ""
                  } ${isWaiting && activeIndex < i ? "opacity-40" : "opacity-100"}`}
                >
                  {/* Language name */}
                  <p className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    {voice.nativeName}
                  </p>
                  <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {voice.language}
                  </p>

                  {/* Translation — fixed height so tick marks align */}
                  <div className="flex-1 flex items-start justify-center mt-2 sm:mt-3 min-h-[3rem] sm:min-h-[4rem]">
                    {(isDone || isPlaying) && (
                      <p className="text-xs sm:text-sm leading-relaxed anim-fade-in" style={{ color: "var(--text-secondary)" }}>
                        {voice.translation}
                      </p>
                    )}
                  </div>

                  {/* Status — always at bottom */}
                  <div className="flex justify-center mt-2 sm:mt-4 h-6">
                    {isPlaying ? (
                      <div className="flex items-center gap-[3px] h-6">
                        {[0, 1, 2, 3, 4, 5, 6].map((j) => (
                          <div
                            key={j}
                            className="w-0.5 rounded-full"
                            style={{
                              background: "var(--accent)",
                              animation: "audio-wave 0.8s ease-in-out infinite",
                              animationDelay: `${j * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                    ) : isDone ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Punchline + Capabilities + Replay */}
      {done && (
        <div className="mt-10 anim-fade-in space-y-8">
          <div className="text-center space-y-3">
            <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              One sentence. Five voices. Each one sounds like a native speaker.
            </p>
          </div>

          {/* Capabilities */}
          <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl px-4 py-3 text-center" style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}>
              <p className="text-2xl mb-1">🗣️</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>11 Languages</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Natural speech across major Indian languages</p>
            </div>
            <div className="rounded-xl px-4 py-3 text-center" style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}>
              <p className="text-2xl mb-1">🎭</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Expressive</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Natural intonation, not robotic flat synthesis</p>
            </div>
            <div className="rounded-xl px-4 py-3 text-center" style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}>
              <p className="text-2xl mb-1">⚡</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Production-Ready</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Low-latency streaming for real-time applications</p>
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
              href="https://www.sarvam.ai/apis/text-to-speech"
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
