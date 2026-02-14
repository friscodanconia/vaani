"use client";

import { AGENT_PERSONAS, type PipelineStage, type StageStatus } from "@/lib/constants";

interface AgentSwarmViewProps {
  stages: Record<PipelineStage, { status: StageStatus; timeMs?: number }>;
  languageName?: string; // dynamic language for flow labels (e.g. "Tamil", "Bengali")
}

// Build dynamic flow labels based on selected language
function getFlowLabels(languageName: string): Record<PipelineStage, { flowIn: string; flowOut: string }> {
  return {
    parse: { flowIn: "Hindi PDF", flowOut: "Hindi text" },
    stt: { flowIn: `${languageName} voice`, flowOut: `${languageName} text` },
    lid: { flowIn: `${languageName} text`, flowOut: `"${languageName}" detected` },
    llm: { flowIn: `Hindi doc + ${languageName} Q`, flowOut: "English answer" },
    translate: { flowIn: "English answer", flowOut: `${languageName} answer` },
    tts: { flowIn: `${languageName} text`, flowOut: `${languageName} audio` },
  };
}

function RelayArrow({ active, done }: { active: boolean; done: boolean }) {
  const color = done ? "var(--success)" : active ? "var(--accent)" : "var(--bg-tertiary)";
  return (
    <div className="crew-relay-arrow flex-shrink-0 flex items-center justify-center">
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <line
          x1="0" y1="10" x2="20" y2="10"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray={done ? "none" : "4 3"}
          className={done ? "crew-connector-done" : ""}
        />
        <polygon
          points="18,5 26,10 18,15"
          fill={color}
          opacity={done || active ? 1 : 0.4}
        />
      </svg>
    </div>
  );
}

export default function AgentSwarmView({ stages, languageName }: AgentSwarmViewProps) {
  const lang = languageName || "Tamil";
  const flowLabels = getFlowLabels(lang);

  return (
    <div className="glass-card p-5 overflow-hidden">
      {/* Desktop: horizontal relay chain */}
      <div className="hidden lg:flex items-stretch crew-chain">
        {AGENT_PERSONAS.map((agent, i) => {
          const s = stages[agent.id];
          const isActive = s.status === "active";
          const isDone = s.status === "done";
          const isError = s.status === "error";
          const showFlow = isActive || isDone;
          const flow = flowLabels[agent.id];

          // Check if next stage is active or done (for the connector arrow)
          const nextAgent = AGENT_PERSONAS[i + 1];
          const nextDone = nextAgent ? stages[nextAgent.id].status === "done" : false;
          const nextActive = nextAgent ? stages[nextAgent.id].status === "active" : false;

          return (
            <div key={agent.id} className="flex items-stretch">
              {/* Card */}
              <div
                className={`crew-card ${isActive ? "crew-card-active" : ""} ${isDone ? "crew-card-done" : ""} ${isError ? "crew-card-error" : ""}`}
              >
                {/* Header */}
                <div className="crew-card-header">
                  <span className="crew-card-name">{agent.name}</span>
                  {isDone && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  )}
                  {isActive && <span className="agent-status-dot" style={{ width: 6, height: 6 }} />}
                  {!isActive && !isDone && !isError && (
                    <span className="block w-1.5 h-1.5 rounded-full" style={{ background: "var(--bg-tertiary)" }} />
                  )}
                </div>

                {/* Icon + Role */}
                <div className="flex flex-col items-center py-2 px-2 flex-1">
                  <span className={`text-xl mb-1 ${isActive ? "anim-float" : ""}`}>{agent.icon}</span>
                  <p className="crew-card-role">{agent.role}</p>
                  <p className="crew-card-tagline">
                    {isActive ? "Working..." : agent.tagline}
                  </p>
                </div>

                {/* Flow pill */}
                {showFlow && (
                  <div className="crew-flow-pill anim-fade-in">
                    <span className="crew-flow-label">{flow.flowIn}</span>
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none" className="flex-shrink-0">
                      <path d="M1 3h5M4.5 1L7 3l-2.5 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="crew-flow-label font-semibold">{flow.flowOut}</span>
                  </div>
                )}

                {/* Footer */}
                <div className="px-2.5 pb-2 pt-1 flex items-center justify-between">
                  <span className="crew-card-api">{agent.apiName}</span>
                  {s.timeMs !== undefined && (
                    <span
                      className="text-[10px] font-mono font-bold tabular-nums"
                      style={{ color: isDone ? "var(--success)" : "var(--text-tertiary)" }}
                    >
                      {(s.timeMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>

              {/* Relay arrow between cards */}
              {i < AGENT_PERSONAS.length - 1 && (
                <RelayArrow active={nextActive} done={isDone && nextDone} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile/Tablet: 2-column grid with flow arrows between rows */}
      <div className="lg:hidden grid grid-cols-2 gap-2.5">
        {AGENT_PERSONAS.map((agent, i) => {
          const s = stages[agent.id];
          const isActive = s.status === "active";
          const isDone = s.status === "done";
          const isError = s.status === "error";
          const showFlow = isActive || isDone;
          const flow = flowLabels[agent.id];

          return (
            <div
              key={agent.id}
              className={`crew-card ${isActive ? "crew-card-active" : ""} ${isDone ? "crew-card-done" : ""} ${isError ? "crew-card-error" : ""}`}
            >
              <div className="crew-card-header">
                <span className="crew-card-name">{agent.name}</span>
                <span className="crew-card-step">{i + 1}</span>
              </div>
              <div className="flex flex-col items-center py-2 px-2 flex-1">
                <span className={`text-lg mb-1 ${isActive ? "anim-float" : ""}`}>{agent.icon}</span>
                <p className="crew-card-role">{agent.role}</p>
              </div>
              {showFlow && (
                <div className="crew-flow-pill anim-fade-in">
                  <span className="crew-flow-label">{flow.flowIn}</span>
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none" className="flex-shrink-0">
                    <path d="M1 3h5M4.5 1L7 3l-2.5 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="crew-flow-label font-semibold">{flow.flowOut}</span>
                </div>
              )}
              <div className="px-2.5 pb-2 pt-1 flex items-center justify-between">
                <span className="crew-card-api">{agent.apiName}</span>
                {s.timeMs !== undefined && (
                  <span
                    className="text-[10px] font-mono font-bold tabular-nums"
                    style={{ color: isDone ? "var(--success)" : "var(--text-tertiary)" }}
                  >
                    {(s.timeMs / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
