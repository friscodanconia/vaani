"use client";

import { useCallback, useState, useRef } from "react";

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export default function DocumentUpload({ onUpload, isUploading }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className="group relative z-10 overflow-hidden rounded-3xl transition-all duration-500"
      style={{
        background: isDragging
          ? "linear-gradient(135deg, var(--accent-subtle), var(--bg-elevated))"
          : "var(--bg-glass)",
        opacity: isUploading ? 0.7 : 1,
        pointerEvents: isUploading ? "none" : "auto",
        boxShadow: isDragging
          ? "0 0 60px var(--accent-glow), inset 0 0 60px var(--accent-glow), 0 25px 80px -20px rgba(80, 55, 30, 0.15)"
          : "0 1px 3px rgba(80, 55, 30, 0.05), 0 12px 40px rgba(80, 55, 30, 0.06)",
      }}
    >
      {/* Decorative accent bar on top */}
      <div
        className="h-1 w-full transition-all duration-500"
        style={{
          background: isDragging
            ? "var(--accent)"
            : "linear-gradient(90deg, transparent 10%, var(--accent-dim) 50%, transparent 90%)",
          opacity: isDragging ? 1 : 0.3,
        }}
      />

      {/* Hover glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)",
        }}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="doc-upload"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={handleChange}
        className="sr-only"
      />

      {isUploading ? (
        <div className="relative z-10 flex flex-col items-center py-16 px-8">
          <div className="relative mb-5">
            <div
              className="h-14 w-14 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--border-visible)", borderTopColor: "var(--accent)" }}
            />
          </div>
          <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Extracting text...
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-tertiary)" }}>
            Running Document Intelligence
          </p>
        </div>
      ) : (
        <div className="relative z-10 flex items-center gap-8 py-12 px-10">
          {/* Left: large icon */}
          <div className="flex-shrink-0 anim-float">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{
                background: "var(--accent-subtle)",
                border: "1.5px solid var(--border-accent)",
                boxShadow: "0 8px 30px var(--accent-glow)",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                <rect x="10" y="6" width="28" height="36" rx="3" stroke="var(--accent)" strokeWidth="2" />
                <path d="M18 22L24 16L30 22" stroke="var(--accent-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="24" y1="16" x2="24" y2="32" stroke="var(--accent-dim)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Right: text + button */}
          <div className="min-w-0">
            <p className="font-display text-2xl italic" style={{ color: "var(--text-primary)" }}>
              Drop your document
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-tertiary)" }}>
              PDF, PNG, JPG — any language
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: "var(--accent)",
                color: "var(--bg-primary)",
                boxShadow: "0 4px 20px var(--accent-glow-strong)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Browse Files
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
