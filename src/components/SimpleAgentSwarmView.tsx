"use client";

import { type PipelineStage, type StageStatus } from "@/lib/constants";

interface SimpleAgentSwarmViewProps {
  stages: Record<PipelineStage, { status: StageStatus; timeMs?: number }>;
  languageName?: string;
}

const SIMPLE_AGENTS: {
  id: PipelineStage;
  icon: string;
  action: string;
  description: string;
  apiName: string;
}[] = [
  { id: "parse", icon: "\u{1F4C4}", action: "Read", description: "Extract text", apiName: "Sarvam Vision" },
  { id: "stt", icon: "\u{1F3A4}", action: "Listen", description: "Capture voice", apiName: "Saaras" },
  { id: "llm", icon: "\u{1F9E0}", action: "Think", description: "Find answer", apiName: "Sarvam-M" },
  { id: "translate", icon: "\u{1F504}", action: "Translate", description: "Convert language", apiName: "Mayura" },
  { id: "tts", icon: "\u{1F50A}", action: "Speak", description: "Generate voice", apiName: "Bulbul" },
];

// Stagger offsets for the floating animation (Kimi swarm style)
const DRIFT_OFFSETS = [
  { y: -6, delay: 0 },
  { y: 4, delay: 0.3 },
  { y: -3, delay: 0.6 },
  { y: 7, delay: 0.15 },
  { y: -5, delay: 0.45 },
];

// Dot-matrix progress indicator (Kimi green dots style)
function ProgressDots() {
  return (
    <div className="flex gap-[3px] mt-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="w-[5px] h-[5px] rounded-[1px]"
          style={{
            background: "var(--accent)",
            animationName: "glow-pulse",
            animationDuration: "1.2s",
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${i * 0.15}s`,
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
}

export default function SimpleAgentSwarmView({ stages }: SimpleAgentSwarmViewProps) {
  const anyActive = Object.values(stages).some((s) => s.status === "active");

  return (
    <div className="glass-card p-4 sm:p-5 overflow-hidden">
      {/* Swarm grid: 5 cards across on desktop, 3 on mobile */}
      <div
        className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4"
        style={{ perspective: "800px" }}
      >
        {SIMPLE_AGENTS.map((agent, i) => {
          const s = stages[agent.id];
          const isActive = s.status === "active";
          const isDone = s.status === "done";
          const isError = s.status === "error";
          const isWaiting = !isActive && !isDone && !isError;
          const drift = DRIFT_OFFSETS[i];

          return (
            <div
              key={agent.id}
              className="flex flex-col items-center text-center rounded-xl p-3 sm:p-4 transition-all duration-500"
              style={{
                background: isActive
                  ? "var(--surface-raised)"
                  : isDone
                  ? "rgba(90, 143, 110, 0.04)"
                  : isError
                  ? "rgba(191, 79, 79, 0.04)"
                  : "var(--surface-raised)",
                border: `1.5px solid ${
                  isActive
                    ? "var(--accent)"
                    : isDone
                    ? "rgba(90, 143, 110, 0.3)"
                    : isError
                    ? "var(--error)"
                    : "var(--border-subtle)"
                }`,
                boxShadow: isActive
                  ? "0 0 20px var(--accent-glow), 0 0 40px var(--accent-glow)"
                  : "none",
                opacity: isWaiting && anyActive ? 0.45 : 1,
                animationName: anyActive && !isWaiting ? "swarm-float" : "none",
                animationDuration: anyActive && !isWaiting ? `${2.5 + drift.delay}s` : "0s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${drift.delay}s`,
              }}
            >
              {/* Status badge */}
              <div
                className="text-[9px] font-bold uppercase tracking-[0.12em] mb-2 px-2 py-0.5 rounded-full"
                style={{
                  background: isActive
                    ? "var(--accent)"
                    : isDone
                    ? "rgba(90, 143, 110, 0.12)"
                    : isError
                    ? "rgba(191, 79, 79, 0.12)"
                    : "var(--warm-100)",
                  color: isActive
                    ? "white"
                    : isDone
                    ? "var(--success)"
                    : isError
                    ? "var(--error)"
                    : "var(--text-muted)",
                }}
              >
                {isActive ? "ACTIVE" : isDone ? "DONE" : isError ? "ERROR" : "READY"}
              </div>

              {/* Icon */}
              <span className="text-2xl sm:text-3xl">{agent.icon}</span>

              {/* API name */}
              <span
                className="text-xs font-semibold tracking-wide mt-1.5"
                style={{
                  color: isActive
                    ? "var(--accent)"
                    : isDone
                    ? "var(--success)"
                    : isError
                    ? "var(--error)"
                    : "var(--text-tertiary)",
                }}
              >
                {agent.apiName}
              </span>

              {/* Action */}
              <span
                className="text-[11px] font-medium"
                style={{
                  color: isActive
                    ? "var(--accent)"
                    : isDone
                    ? "var(--success)"
                    : "var(--text-muted)",
                }}
              >
                {agent.action}
              </span>

              {/* Progress / Status indicator */}
              {isActive && <ProgressDots />}
              {isDone && (
                <div className="flex items-center gap-1.5 mt-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="var(--success)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {s.timeMs !== undefined && (
                    <span
                      className="text-[10px] font-mono font-bold tabular-nums"
                      style={{ color: "var(--success)" }}
                    >
                      {(s.timeMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
