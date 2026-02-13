"use client";

import { useRef, useEffect, useState } from "react";
import LanguageBadge from "./LanguageBadge";

interface AnswerCardProps {
  question: string;
  answer: string;
  languageCode: string;
  audioBase64: string | null;
  totalTimeMs: number;
}

export default function AnswerCard({
  question,
  answer,
  languageCode,
  audioBase64,
  totalTimeMs,
}: AnswerCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioBase64 && audioRef.current) {
      audioRef.current.src = `data:audio/mp3;base64,${audioBase64}`;
      audioRef.current.play().catch(() => {});
    }
  }, [audioBase64]);

  return (
    <div className="glass-card p-5 anim-slide-up">
      {/* Question */}
      <div className="flex items-start gap-2 mb-4">
        <div
          className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px]"
          style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
        >
          Q
        </div>
        <p className="text-xs italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          &ldquo;{question}&rdquo;
        </p>
      </div>

      {/* Divider */}
      <div className="h-px mb-4" style={{ background: "var(--border-subtle)" }} />

      {/* Answer */}
      <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
        {answer}
      </p>

      {/* Footer */}
      <div className="mt-5 flex items-center gap-3 flex-wrap">
        <LanguageBadge languageCode={languageCode} />

        {audioBase64 && (
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
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide transition-all duration-300"
            style={{
              background: isPlaying ? "var(--accent)" : "var(--bg-elevated)",
              color: isPlaying ? "var(--bg-primary)" : "var(--text-secondary)",
              border: `1px solid ${isPlaying ? "var(--accent)" : "var(--border-visible)"}`,
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
        )}

        <span className="ml-auto text-[10px] font-mono tabular-nums" style={{ color: "var(--text-tertiary)" }}>
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
