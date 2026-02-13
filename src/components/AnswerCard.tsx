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
    <div
      className="rounded-2xl p-5 anim-slide-up"
      style={{ background: "var(--surface-raised)", border: "1px solid var(--warm-100)" }}
    >
      {/* Question */}
      <p className="text-xs italic" style={{ color: "var(--warm-400)" }}>
        &ldquo;{question}&rdquo;
      </p>

      {/* Answer */}
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--warm-800)" }}>
        {answer}
      </p>

      {/* Footer: language + audio + timing */}
      <div className="mt-4 flex items-center gap-3 flex-wrap">
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
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            style={{
              background: isPlaying ? "var(--accent)" : "var(--surface-overlay)",
              color: isPlaying ? "white" : "var(--warm-600)",
              border: `1px solid ${isPlaying ? "var(--accent)" : "var(--warm-200)"}`,
            }}
          >
            {isPlaying ? "⏸ Pause" : "🔊 Play"}
          </button>
        )}

        <span className="ml-auto text-[10px] tabular-nums" style={{ color: "var(--warm-400)" }}>
          {(totalTimeMs / 1000).toFixed(1)}s total
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
