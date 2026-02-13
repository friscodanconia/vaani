"use client";

import { PIPELINE_STAGES, type PipelineStage, type StageStatus } from "@/lib/constants";

interface PipelineViewProps {
  stages: Record<PipelineStage, { status: StageStatus; timeMs?: number }>;
}

export default function PipelineView({ stages }: PipelineViewProps) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--surface-raised)", border: "1px solid var(--warm-100)" }}
    >
      <p
        className="mb-4 text-[11px] font-medium uppercase tracking-widest"
        style={{ color: "var(--warm-400)" }}
      >
        Pipeline
      </p>

      <div className="flex items-center justify-between gap-1">
        {PIPELINE_STAGES.map((stage, i) => {
          const s = stages[stage.id];
          const isActive = s.status === "active";
          const isDone = s.status === "done";
          const isError = s.status === "error";

          return (
            <div key={stage.id} className="flex items-center gap-1 flex-1">
              {/* Stage box */}
              <div
                className={`flex flex-col items-center justify-center rounded-xl px-3 py-3 flex-1 min-w-0 transition-all duration-300 ${
                  isActive ? "anim-shimmer" : ""
                }`}
                style={{
                  background: isDone
                    ? "var(--accent-bg)"
                    : isActive
                    ? "var(--accent-bg)"
                    : isError
                    ? "rgba(220, 38, 38, 0.08)"
                    : "var(--surface-overlay)",
                  border: `1.5px solid ${
                    isDone
                      ? "var(--accent)"
                      : isActive
                      ? "var(--accent)"
                      : isError
                      ? "var(--error)"
                      : "var(--warm-200)"
                  }`,
                  boxShadow: isActive ? "0 0 20px rgba(194, 101, 42, 0.15)" : "none",
                }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: isDone || isActive ? "var(--accent)" : isError ? "var(--error)" : "var(--warm-400)",
                  }}
                >
                  {stage.label}
                </span>
                <span
                  className="mt-0.5 text-[9px] truncate max-w-full"
                  style={{ color: "var(--warm-400)" }}
                >
                  {stage.apiName}
                </span>
                {s.timeMs !== undefined && (
                  <span
                    className="mt-1 text-[9px] font-medium tabular-nums"
                    style={{ color: "var(--warm-500)" }}
                  >
                    {(s.timeMs / 1000).toFixed(1)}s
                  </span>
                )}
              </div>

              {/* Connector arrow */}
              {i < PIPELINE_STAGES.length - 1 && (
                <svg width="16" height="12" viewBox="0 0 16 12" className="flex-shrink-0">
                  <line
                    x1="0"
                    y1="6"
                    x2="10"
                    y2="6"
                    stroke={isDone ? "var(--accent)" : "var(--warm-200)"}
                    strokeWidth="1.5"
                    className={isDone ? "pipeline-connector" : ""}
                  />
                  <polyline
                    points="8,2 14,6 8,10"
                    fill="none"
                    stroke={isDone ? "var(--accent)" : "var(--warm-200)"}
                    strokeWidth="1.5"
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
