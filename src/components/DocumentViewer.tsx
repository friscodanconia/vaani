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
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--surface-raised)", border: "1px solid var(--warm-100)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: "var(--accent-bg)" }}
        >
          📄
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" style={{ color: "var(--warm-800)" }}>
            {fileName}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--warm-400)" }}>
            {textLength.toLocaleString()} characters extracted
            {pageCount > 1 ? ` · ${pageCount} pages` : ""}
          </p>
        </div>
      </div>

      <div
        className="mt-3 rounded-lg p-3 text-xs leading-relaxed"
        style={{
          background: "var(--surface-overlay)",
          color: "var(--warm-600)",
          maxHeight: "120px",
          overflow: "hidden",
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
        }}
      >
        {textSnippet}
      </div>
    </div>
  );
}
