"use client";

import { useRef, useEffect, useState, memo } from "react";
import LanguageBadge from "./LanguageBadge";

interface AnswerCardProps {
  question: string;
  answer: string;
  languageCode: string;
  audioBase64: string | null;
  totalTimeMs: number;
  autoPlay?: boolean;
}

function AnswerCard({
  question,
  answer,
  languageCode,
  audioBase64,
  totalTimeMs,
  autoPlay = false,
}: AnswerCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayFailed, setAutoPlayFailed] = useState(false);
  const hasTriedAutoPlay = useRef(false);

  useEffect(() => {
    if (audioBase64 && audioRef.current) {
      const audio = audioRef.current;
      audio.src = `data:audio/mp3;base64,${audioBase64}`;

      if (autoPlay && !hasTriedAutoPlay.current) {
        hasTriedAutoPlay.current = true;

        const attemptPlay = () => {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              setAutoPlayFailed(true);
            });
          }
        };

        if (audio.readyState >= 2) {
          attemptPlay();
        } else {
          audio.addEventListener('canplay', attemptPlay, { once: true });
          audio.load();
        }
      }
    }
  }, [audioBase64, autoPlay]);

  return (
    <div className="glass-card p-5 anim-slide-up">
      <div className="flex items-start gap-2 mb-4">
        <div
          className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px]"
          style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
        >
          Q
        </div>
        <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          &ldquo;{question}&rdquo;
        </p>
      </div>

      <div className="h-px mb-4" style={{ background: "var(--border-subtle)" }} />

      <div className="relative">
        <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
          {answer}
        </p>

        {isPlaying && (
          <div className="absolute -left-8 top-0 flex items-center gap-0.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-0.5 rounded-full bg-current"
                style={{
                  height: "12px",
                  color: "var(--accent)",
                  animation: `audio-wave 0.8s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {autoPlayFailed && autoPlay && (
          <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs anim-fade-in" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 010 7.07" strokeLinecap="round" />
            </svg>
            <span className="font-medium">Turn on volume and click Play to hear the answer</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Detected:
          </span>
          <LanguageBadge languageCode={languageCode} />
        </div>

        {audioBase64 ? (
          <button
            onClick={() => {
              if (audioRef.current) {
                if (isPlaying) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                } else {
                  audioRef.current.play().catch(() => {});
                }
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold tracking-wide transition-all duration-300"
            style={{
              background: isPlaying ? "var(--accent)" : "var(--bg-elevated)",
              color: isPlaying ? "var(--bg-primary)" : "var(--text-secondary)",
              border: `1.5px solid ${isPlaying ? "var(--accent)" : "var(--border-visible)"}`,
              boxShadow: isPlaying ? "0 0 20px var(--accent-glow)" : "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              {isPlaying ? (
                <>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </>
              ) : (
                <polygon points="5,3 19,12 5,21" />
              )}
            </svg>
            {isPlaying ? "Pause" : "Play"}
          </button>
        ) : autoPlay && (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{
                    background: "var(--accent)",
                    animation: `glow-pulse 1s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <span>Loading audio...</span>
          </div>
        )}

        <span className="ml-auto text-xs font-mono font-semibold tabular-nums" style={{ color: "var(--text-tertiary)" }}>
          {(totalTimeMs / 1000).toFixed(1)}s
        </span>
      </div>

      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

export default memo(AnswerCard);
