"use client";

import { PIPELINE_STAGES, type PipelineStage, type StageStatus } from "@/lib/constants";

interface PipelineViewProps {
  stages: Record<PipelineStage, { status: StageStatus; timeMs?: number }>;
}

export default function PipelineView({ stages }: PipelineViewProps) {
  return (
    <div className="glass-card p-6 overflow-hidden">
      {/* Label */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--text-tertiary)" }}
        >
          Sarvam Pipeline
        </span>
        <div className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
      </div>

      {/* Pipeline stages */}
      <div className="flex items-center gap-0 stagger">
        {PIPELINE_STAGES.map((stage, i) => {
          const s = stages[stage.id];
          const isActive = s.status === "active";
          const isDone = s.status === "done";
          const isError = s.status === "error";
          const hasActivity = isActive || isDone || isError;

          return (
            <div key={stage.id} className="flex items-center flex-1 min-w-0">
              {/* Stage node */}
              <div className="relative flex-1 min-w-0">
                {/* Glow behind active/done nodes */}
                {(isActive || isDone) && (
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      boxShadow: `0 0 ${isActive ? "40px" : "25px"} var(--accent-glow)`,
                      opacity: isActive ? 1 : 0.6,
                    }}
                  />
                )}

                <div
                  className={`relative flex flex-col items-center justify-center rounded-2xl py-4 px-2 transition-all duration-500 ${
                    isActive ? "anim-shimmer" : ""
                  }`}
                  style={{
                    background: isDone
                      ? "var(--accent-subtle)"
                      : isActive
                      ? "var(--accent-subtle)"
                      : isError
                      ? "rgba(248, 113, 113, 0.08)"
                      : "var(--bg-secondary)",
                    border: `1.5px solid ${
                      isDone
                        ? "var(--accent-dim)"
                        : isActive
                        ? "var(--accent)"
                        : isError
                        ? "var(--error)"
                        : "var(--border-subtle)"
                    }`,
                  }}
                >
                  {/* Stage number indicator */}
                  <div
                    className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      background: hasActivity
                        ? isDone
                          ? "var(--accent)"
                          : isActive
                          ? "var(--accent)"
                          : "var(--error)"
                        : "var(--bg-tertiary)",
                      color: hasActivity ? "var(--bg-primary)" : "var(--text-tertiary)",
                      boxShadow: hasActivity ? "0 0 12px var(--accent-glow)" : "none",
                    }}
                  >
                    {isDone ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>

                  <span
                    className="text-[13px] font-bold tracking-wide"
                    style={{
                      color: isDone || isActive ? "var(--accent)" : isError ? "var(--error)" : "var(--text-secondary)",
                    }}
                  >
                    {stage.label}
                  </span>

                  <span
                    className="mt-0.5 text-[10px] font-medium truncate max-w-full"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {stage.apiName}
                  </span>

                  {s.timeMs !== undefined && (
                    <span
                      className="mt-1.5 text-[10px] font-mono font-semibold tabular-nums"
                      style={{ color: isDone ? "var(--accent-dim)" : "var(--text-tertiary)" }}
                    >
                      {(s.timeMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>

              {/* Connector */}
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="flex-shrink-0 w-4 flex items-center justify-center">
                  <svg width="16" height="12" viewBox="0 0 16 12">
                    <line
                      x1="0"
                      y1="6"
                      x2="10"
                      y2="6"
                      stroke={isDone ? "var(--accent)" : "var(--border-subtle)"}
                      strokeWidth="1.5"
                      className={isDone ? "pipeline-connector" : ""}
                    />
                    <polyline
                      points="8,2 14,6 8,10"
                      fill="none"
                      stroke={isDone ? "var(--accent)" : "var(--border-subtle)"}
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
