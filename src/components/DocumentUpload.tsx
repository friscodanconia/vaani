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
      className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300"
      style={{
        borderColor: isDragging ? "var(--accent)" : "var(--warm-200)",
        background: isDragging ? "var(--accent-bg)" : "var(--surface-raised)",
        opacity: isUploading ? 0.6 : 1,
        pointerEvents: isUploading ? "none" : "auto",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={handleChange}
        className="hidden"
      />

      {isUploading ? (
        <>
          <div
            className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "var(--warm-200)", borderTopColor: "var(--accent)" }}
          />
          <p className="text-sm font-medium" style={{ color: "var(--warm-600)" }}>
            Extracting text from document...
          </p>
        </>
      ) : (
        <>
          <div className="mb-3 text-3xl opacity-40">📄</div>
          <p className="text-sm font-medium" style={{ color: "var(--warm-700)" }}>
            Drop a document here or click to upload
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--warm-400)" }}>
            PDF, PNG, JPG — any language
          </p>
        </>
      )}
    </div>
  );
}
