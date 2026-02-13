"use client";

import { SUPPORTED_LANGUAGES } from "@/lib/constants";

export default function LanguageBadge({ languageCode }: { languageCode: string }) {
  const lang = SUPPORTED_LANGUAGES[languageCode];
  const label = lang ? `${lang.nativeName} · ${lang.name}` : languageCode;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      style={{
        background: "var(--accent-bg)",
        color: "var(--accent)",
        border: "1px solid rgba(194, 101, 42, 0.2)",
      }}
    >
      <span className="text-[10px]">🇮🇳</span>
      {label}
    </span>
  );
}
