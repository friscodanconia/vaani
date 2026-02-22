"use client";

import { AGENT_PERSONAS } from "@/lib/constants";

interface FooterProps {
  compact?: boolean;
}

export default function Footer({ compact = false }: FooterProps) {
  if (compact) {
    return (
      <footer className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="divider-gradient mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm">
          <span className="text-[var(--text-muted)]">
            Built on{" "}
            <a
              href="https://www.sarvam.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--accent)] hover:underline inline-block py-2"
            >
              Sarvam AI
            </a>
          </span>
          <span className="hidden sm:inline text-[var(--border-visible)]">&middot;</span>
          <div className="flex items-center gap-1.5">
            {AGENT_PERSONAS.map((agent) => (
              <span
                key={agent.id}
                className="text-[11px] font-medium tracking-wide px-2 py-1 rounded-full"
                style={{
                  background: "var(--warm-50)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {agent.apiName}
              </span>
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-[var(--text-muted)] mt-4 tracking-wide">
          Vaani Demo Hub &middot; 2026
        </p>
      </footer>
    );
  }

  return (
    <footer className="relative z-10 max-w-5xl mx-auto px-6 py-24">
      <div className="divider-gradient mb-14" />

      {/* Relay chain visual */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-12 overflow-hidden max-w-full">
        {AGENT_PERSONAS.map((agent, i) => (
          <div key={agent.id} className="flex items-center shrink-0">
            <div
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
              style={{
                background: "var(--accent-bg)",
                border: "1px solid var(--border-accent)",
              }}
              title={`${agent.name} — ${agent.role}`}
            >
              <span className="text-base sm:text-xl">{agent.icon}</span>
            </div>
            {i < AGENT_PERSONAS.length - 1 && (
              <svg width="20" height="8" viewBox="0 0 20 8" className="mx-1">
                <line
                  x1="0"
                  y1="4"
                  x2="15"
                  y2="4"
                  stroke="var(--warm-300)"
                  strokeWidth="1"
                />
                <polygon points="14,1 20,4 14,7" fill="var(--warm-300)" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div className="text-center space-y-5">
        <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl italic text-[var(--text-primary)]">
          5 models. 1 voice. Any language.
        </h3>
        <p className="font-body text-base text-[var(--text-secondary)]">
          Built on{" "}
          <a
            href="https://www.sarvam.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--accent)] hover:underline inline-block py-2"
          >
            Sarvam AI
          </a>
        </p>

        {/* API pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {AGENT_PERSONAS.map((agent) => (
            <span
              key={agent.id}
              className="text-xs font-medium tracking-wide px-3 py-1.5 rounded-full"
              style={{
                background: "var(--warm-50)",
                color: "var(--text-muted)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {agent.apiName}
            </span>
          ))}
        </div>
      </div>

      <div className="divider-gradient mt-14" />

      <p className="text-center text-xs text-[var(--text-muted)] mt-8 tracking-wide">
        Vaani Demo Hub &middot; 2026
      </p>
    </footer>
  );
}
