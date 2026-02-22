"use client";

import { AGENT_PERSONAS, type PipelineStage } from "@/lib/constants";

interface PipelineRelayProps {
  activeStage: PipelineStage | null;
  completedStages: PipelineStage[];
}

// Pre-computed stagger offsets to give each card a slightly different vertical drift
const DRIFT_OFFSETS = [
  { y: -6, delay: 0 },
  { y: 4, delay: 0.3 },
  { y: -3, delay: 0.6 },
  { y: 7, delay: 0.15 },
  { y: -5, delay: 0.45 },
];

// Dot-matrix style progress indicator (like Kimi's green dots)
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

export default function PipelineRelay({
  activeStage,
  completedStages,
}: PipelineRelayProps) {
  const anyActive = activeStage !== null;

  return (
    <div className="w-full py-2">
      {/* Swarm grid: 5 cards in a row on desktop, wrapping on mobile */}
      <div
        className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4 max-w-3xl mx-auto px-4"
        style={{
          perspective: "800px",
        }}
      >
        {AGENT_PERSONAS.map((agent, i) => {
          const isActive = activeStage === agent.id;
          const isDone = completedStages.includes(agent.id);
          const isWaiting = !isActive && !isDone;
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
                  : "var(--surface-raised)",
                border: `1.5px solid ${
                  isActive
                    ? "var(--accent)"
                    : isDone
                    ? "rgba(90, 143, 110, 0.3)"
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
              {/* Status badge — top */}
              <div
                className="text-[9px] font-bold uppercase tracking-[0.12em] mb-2 px-2 py-0.5 rounded-full"
                style={{
                  background: isActive
                    ? "var(--accent)"
                    : isDone
                    ? "rgba(90, 143, 110, 0.12)"
                    : "var(--warm-100)",
                  color: isActive
                    ? "white"
                    : isDone
                    ? "var(--success)"
                    : "var(--text-muted)",
                }}
              >
                {isActive ? "ACTIVE" : isDone ? "DONE" : "READY"}
              </div>

              {/* Icon */}
              <span className="text-2xl">{agent.icon}</span>

              {/* API name */}
              <span
                className="text-xs font-semibold tracking-wide mt-1.5"
                style={{
                  color: isActive
                    ? "var(--accent)"
                    : isDone
                    ? "var(--success)"
                    : "var(--text-tertiary)",
                }}
              >
                {agent.apiName}
              </span>

              {/* Role */}
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
                {agent.role}
              </span>

              {/* Progress / Status indicator */}
              {isActive && <ProgressDots />}
              {isDone && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-2"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="var(--success)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
