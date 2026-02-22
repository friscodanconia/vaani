"use client";

interface DocumentViewerProps {
  fileName: string;
  textLength: number;
  textSnippet: string;
  pageCount: number;
}

export default function DocumentViewer({
  fileName,
  textLength,
  textSnippet,
  pageCount,
}: DocumentViewerProps) {
  return (
    <div className="glass-card p-5 h-full flex flex-col overflow-hidden">
      <div className="flex items-start gap-3.5">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--accent-subtle)", border: "1.5px solid var(--border-accent)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="var(--accent)" strokeWidth="1.5" />
            <polyline points="14,2 14,8 20,8" stroke="var(--accent)" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium" style={{ color: "var(--text-primary)" }}>
            {fileName}
          </p>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-tertiary)" }}>
            {textLength.toLocaleString()} characters
            {pageCount > 1 ? ` \u00B7 ${pageCount} pages` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ background: "rgba(52, 211, 153, 0.1)" }}>
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--success)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--success)" }}>Ready</span>
        </div>
      </div>

      <div
        className="mt-4 rounded-xl p-3.5 text-sm leading-relaxed font-mono flex-1 break-words"
        style={{
          background: "var(--bg-secondary)",
          color: "var(--text-secondary)",
          border: "1.5px solid var(--border-subtle)",
          maxHeight: "110px",
          overflow: "hidden",
          overflowWrap: "anywhere",
          maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
        }}
      >
        {textSnippet}
      </div>
    </div>
  );
}
