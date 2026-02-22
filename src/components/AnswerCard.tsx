"use client";

import { useRef, useEffect, useState, memo } from "react";
import LanguageBadge from "./LanguageBadge";
import { getSharedAudio } from "@/lib/audioContext";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const hasTriedAutoPlay = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get the shared (pre-unlocked) audio element
  useEffect(() => {
    const audio = getSharedAudio();
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    if (audioBase64 && audioRef.current) {
      const audio = audioRef.current;
      audio.volume = 1;
      audio.src = `data:audio/mp3;base64,${audioBase64}`;

      if (autoPlay && !hasTriedAutoPlay.current) {
        hasTriedAutoPlay.current = true;

        const attemptPlay = () => {
          audio.play().catch(() => {
            // Autoplay blocked — user will see the Play button
          });
        };

        if (audio.readyState >= 2) {
          attemptPlay();
        } else {
          audio.addEventListener("canplay", attemptPlay, { once: true });
          audio.load();
        }
      }
    }
  }, [audioBase64, autoPlay]);

  // Clean up on unmount: stop playback
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

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
                  animationName: "audio-wave",
                  animationDuration: "0.8s",
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
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
                    animationName: "glow-pulse",
                    animationDuration: "1s",
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
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
    </div>
  );
}

export default memo(AnswerCard);
