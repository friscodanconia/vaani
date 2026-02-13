"use client";

import { useCallback, useState, useRef } from "react";

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export default function DocumentUpload({ onUpload, isUploading }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      onClick={() => inputRef.current?.click()}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-dashed p-16 text-center transition-all duration-500"
      style={{
        borderColor: isDragging ? "var(--accent)" : "var(--border-visible)",
        background: isDragging
          ? "var(--accent-subtle)"
          : "var(--bg-glass)",
        opacity: isUploading ? 0.7 : 1,
        pointerEvents: isUploading ? "none" : "auto",
        boxShadow: isDragging ? "0 0 60px var(--accent-glow), inset 0 0 60px var(--accent-glow)" : "none",
      }}
    >
      {/* Subtle inner glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)",
        }}
      />

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={handleChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-5">
            <div
              className="h-12 w-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--border-visible)", borderTopColor: "var(--accent)" }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: "0 0 30px var(--accent-glow)" }}
            />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Extracting text from document...
          </p>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center">
          {/* Upload icon */}
          <div className="mb-5 anim-float">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-30 group-hover:opacity-60 transition-opacity duration-300">
              <rect x="8" y="6" width="32" height="36" rx="4" stroke="var(--text-primary)" strokeWidth="1.5" />
              <path d="M16 22L24 16L32 22" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="24" y1="16" x2="24" y2="32" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="14" y1="36" x2="34" y2="36" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Drop a document here, or{" "}
            <span style={{ color: "var(--accent)" }}>browse</span>
          </p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
            PDF, PNG, JPG — any language
          </p>
        </div>
      )}
    </div>
  );
}
