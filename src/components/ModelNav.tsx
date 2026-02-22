"use client";

import Link from "next/link";

const MODEL_ORDER = [
  { href: "/vision", label: "Vision" },
  { href: "/saaras", label: "Saaras" },
  { href: "/translate", label: "Translate" },
  { href: "/mayura", label: "Mayura" },
  { href: "/bulbul", label: "Bulbul" },
  { href: "/vaani", label: "Full Pipeline" },
];

interface ModelNavProps {
  current: string; // e.g. "/vision"
}

export default function ModelNav({ current }: ModelNavProps) {
  const idx = MODEL_ORDER.findIndex((m) => m.href === current);
  const prev = idx > 0 ? MODEL_ORDER[idx - 1] : null;
  const next = idx < MODEL_ORDER.length - 1 ? MODEL_ORDER[idx + 1] : null;

  return (
    <div className="flex items-center justify-between max-w-5xl mx-auto px-6 py-6">
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-center gap-1.5 text-sm font-medium tracking-wide transition-opacity hover:opacity-70 py-2"
          style={{ color: "var(--accent)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {prev.label}
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="flex items-center gap-1.5 text-sm font-medium tracking-wide transition-opacity hover:opacity-70 py-2"
          style={{ color: "var(--accent)" }}
        >
          {next.label}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
