"use client";

import { useState, useRef, useEffect } from "react";

// Cached Saaras API output — this is the real transcript returned by Saaras V3
// for the 3 Idiots "Life is a race" clip (public/saaras-demo.mp3)
const SAARAS_TRANSCRIPT =
  "रिमेंबर लाइफ इज अ रेस। अगर तेज नहीं भागोगे तो कोई तुम्हें कुचल के आगे निकल जाएगा। लेट मी टेल यू अ वेरी इंटरेस्टिंग स्टोरी। ये एस्ट्रोनॉफ्स पेन है। स्पेस में फाउंटेन पेन, बॉल पेन कुछ नहीं चलता। तो लाखों डॉलर खर्च करने के बाद साइंटिस्ट ने ऐसा पेन इजाद किया जिससे कोई भी एंगल, कोई भी टेंपरेचर जीरो ग्रेविटी में हम लिख सकते हैं।";

const TRANSCRIPT_WORDS = SAARAS_TRANSCRIPT.split(/\s+/);

const ENGLISH_TRANSLATION =
  "Remember, life is a race. If you don't run fast, someone will crush you and move ahead. Let me tell you a very interesting story. This is an astronaut's pen. In space, fountain pens and ball pens don't work. So after spending millions of dollars, scientists invented a pen that can write at any angle, any temperature, in zero gravity.";

const AUDIO_SRC = "/saaras-demo.mp3";
const WAVEFORM_BARS = 60;

const SCENE = {
  movie: "3 Idiots (2009)",
  character: "Virus (Boman Irani)",
};

type Phase = "idle" | "playing" | "done";

export default function DemoSaaras() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [visibleWords, setVisibleWords] = useState(0);
  const [waveformPosition, setWaveformPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Pre-computed waveform heights (integers to avoid hydration mismatch)
  const waveformHeights = useRef(
    Array.from({ length: WAVEFORM_BARS }, (_, i) => {
      const x = i / WAVEFORM_BARS;
      return Math.round(15 + Math.sin(x * 12) * 25 + Math.cos(x * 7) * 15 + Math.sin(x * 23) * 10);
    })
  ).current;

  const runDemo = async () => {
    setShowTranslation(false);
    setVisibleWords(0);
    setWaveformPosition(0);

    const audio = new Audio(AUDIO_SRC);
    audioRef.current = audio;

    await new Promise<void>((resolve, reject) => {
      audio.addEventListener("canplaythrough", () => resolve(), { once: true });
      audio.addEventListener("error", () => reject(), { once: true });
      audio.load();
    });

    const duration = audio.duration;
    setAudioDuration(duration);
    setPhase("playing");
    audio.play();

    // Sync waveform + word reveal to audio playback
    // Speech starts ~1.5s into the clip, so offset word reveal accordingly.
    // Also trail slightly (0.9 factor) so words don't appear before they're spoken.
    const SPEECH_START_S = 1.5;
    const syncToAudio = () => {
      if (!audioRef.current || audioRef.current.paused) return;
      const currentTime = audioRef.current.currentTime;
      const progress = currentTime / duration;
      setWaveformPosition(progress);
      const speechProgress = Math.max(0, (currentTime - SPEECH_START_S) / (duration - SPEECH_START_S));
      const wordIndex = Math.floor(speechProgress * TRANSCRIPT_WORDS.length * 0.92);
      setVisibleWords(Math.min(Math.max(0, wordIndex), TRANSCRIPT_WORDS.length));
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(syncToAudio);
      }
    };
    animFrameRef.current = requestAnimationFrame(syncToAudio);

    // Wait for audio to end
    await new Promise<void>((resolve) => {
      audio.addEventListener("ended", () => resolve(), { once: true });
    });

    cancelAnimationFrame(animFrameRef.current);
    setVisibleWords(TRANSCRIPT_WORDS.length);
    setWaveformPosition(1);

    await new Promise((r) => setTimeout(r, 600));
    setShowTranslation(true);
    setPhase("done");
  };

  const handlePlay = () => {
    if (phase !== "idle") return;
    runDemo();
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    setPhase("idle");
    setVisibleWords(0);
    setWaveformPosition(0);
    setShowTranslation(false);
    setTimeout(() => runDemo(), 200);
  };

  // Detect English words (transliterated Hindi is written in Devanagari by Saaras)
  const isEnglish = (word: string) => /^[a-zA-Z]/.test(word);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="section-label">Saaras</span>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl italic mt-3 text-[var(--text-primary)]">
          The Listener
        </h2>
      </div>

      {/* Setup */}
      <div className="max-w-2xl mx-auto mb-12 text-center space-y-4">
        <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Indians don&apos;t speak one language at a time. In a single sentence, a speaker switches between{" "}
          <strong style={{ color: "var(--text-primary)" }}>Hindi and English mid-sentence</strong> — sometimes mid-word.
        </p>
        <p className="text-base leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          Most speech engines transcribe this as gibberish. Saaras is trained on real Indian conversations — code-mixed, noisy, multi-speaker — across 22 languages.
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
            Listen to a famous Bollywood scene and watch Saaras transcribe it live
          </p>
        </div>
      )}

      {/* Demo content */}
      {phase !== "idle" && (
        <div className="grid lg:grid-cols-2 gap-6 items-start anim-fade-in">

          {/* LEFT: Audio waveform + scene info */}
          <div className="glass-card p-6 sm:p-8">
            {/* Scene context */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl"
                style={{ background: "var(--accent-subtle)", border: "1.5px solid var(--border-accent)" }}
              >
                🎬
              </div>
              <div>
                <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {SCENE.movie}
                </p>
                <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  {SCENE.character} · {audioDuration > 0 ? `${Math.round(audioDuration)}s` : "~25s"}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-secondary)" }}>
              Virus delivers his iconic &ldquo;Life is a race&rdquo; speech — switching between Hindi and English in every sentence. Watch Saaras handle every word.
            </p>

            {/* Waveform */}
            <div
              className="rounded-xl p-5"
              style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}
            >
              {/* Playback indicator */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    background: phase === "playing" ? "var(--accent)" : "var(--bg-tertiary)",
                    color: phase === "playing" ? "white" : "var(--text-tertiary)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {phase === "playing" ? (
                    <div className="flex items-center gap-[2px]">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-[3px] rounded-full bg-white"
                          style={{
                            height: "14px",
                            animation: "audio-wave 0.8s ease-in-out infinite",
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{
                    color: phase === "playing" ? "var(--accent)" : "var(--success)"
                  }}>
                    {phase === "playing" ? "Transcribing..." : "Transcription complete"}
                  </p>
                </div>
                <span className="text-xs font-mono tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                  {(() => {
                    const total = audioDuration || 25;
                    const current = Math.round(waveformPosition * total);
                    const totalRound = Math.round(total);
                    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
                    return `${fmt(current)} / ${fmt(totalRound)}`;
                  })()}
                </span>
              </div>

              {/* Waveform bars */}
              <div className="flex items-end gap-[2px] h-16">
                {waveformHeights.map((h, i) => {
                  const progress = i / WAVEFORM_BARS;
                  const isPlayed = progress < waveformPosition;
                  const isCurrent = Math.abs(progress - waveformPosition) < 1 / WAVEFORM_BARS && phase === "playing";

                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-full transition-colors duration-150"
                      style={{
                        height: `${h}%`,
                        background: isPlayed ? "var(--accent)" : "var(--bg-tertiary)",
                        opacity: isPlayed ? 0.8 : 0.35,
                        boxShadow: isCurrent ? "0 0 8px var(--accent-glow-strong)" : "none",
                      }}
                    />
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-0.5 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{ width: `${waveformPosition * 100}%`, background: "var(--accent)" }}
                />
              </div>
            </div>

            {/* Language legend */}
            {visibleWords > 0 && (
              <div className="flex items-center gap-4 mt-5 anim-fade-in">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: "var(--accent)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Hindi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: "var(--text-primary)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>English</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Transcript (cached Saaras output, revealed word-by-word) */}
          <div className="glass-card p-6 sm:p-8 lg:min-h-[400px] flex flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--accent)" }}>
                  Live Transcript
                </p>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid var(--border-accent)" }}
                >
                  Saaras API
                </span>
              </div>

              <div
                className="rounded-xl p-5"
                style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}
              >
                <p className="text-base leading-[2] font-body">
                  {TRANSCRIPT_WORDS.slice(0, visibleWords).map((word, i) => {
                    const eng = isEnglish(word);
                    return (
                      <span
                        key={i}
                        className="inline transition-opacity duration-300"
                        style={{
                          color: eng ? "var(--text-primary)" : "var(--accent)",
                          fontWeight: eng ? 400 : 600,
                        }}
                      >
                        {word}{" "}
                      </span>
                    );
                  })}
                  {phase === "playing" && (
                    <span
                      className="inline-block w-0.5 h-5 ml-0.5 align-middle"
                      style={{ background: "var(--accent)", animation: "typing-cursor 0.8s step-end infinite" }}
                    />
                  )}
                </p>
              </div>

              {/* English translation */}
              {showTranslation && (
                <div className="mt-4 anim-fade-in">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: "var(--text-tertiary)" }}>
                    English Translation
                  </p>
                  <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    &ldquo;{ENGLISH_TRANSLATION}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Punchline + Capabilities + Replay */}
      {phase === "done" && (
        <div className="mt-10 anim-fade-in space-y-8">
          <div className="text-center space-y-3">
            <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Every Hindi word. Every English word. Every mid-sentence switch — transcribed perfectly.
            </p>
          </div>

          {/* Other capabilities */}
          <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl px-4 py-3 text-center" style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}>
              <p className="text-2xl mb-1">🌐</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>22 Languages</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Hindi, Tamil, Bengali, Telugu, Kannada, and more</p>
            </div>
            <div className="rounded-xl px-4 py-3 text-center" style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}>
              <p className="text-2xl mb-1">⚡</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Streaming</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Real-time transcription with low-latency decoding</p>
            </div>
            <div className="rounded-xl px-4 py-3 text-center" style={{ background: "var(--warm-50)", border: "1.5px solid var(--border-subtle)" }}>
              <p className="text-2xl mb-1">👥</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Multi-Speaker</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Handles noisy environments and multiple speakers</p>
            </div>
          </div>

          {/* Replay + Try it yourself */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
            <a
              href="https://www.sarvam.ai/models/saaras"
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
