"use client";

import { SUPPORTED_LANGUAGES } from "@/lib/constants";

export default function LanguageBadge({ languageCode }: { languageCode: string }) {
  const lang = SUPPORTED_LANGUAGES[languageCode];
  const label = lang ? `${lang.nativeName} · ${lang.name}` : languageCode;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide"
      style={{
        background: "var(--accent-subtle)",
        color: "var(--accent)",
        border: "1px solid var(--border-accent)",
      }}
    >
      {label}
    </span>
  );
}
