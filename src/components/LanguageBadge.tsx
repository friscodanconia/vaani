"use client";

import { SUPPORTED_LANGUAGES } from "@/lib/constants";

export default function LanguageBadge({ languageCode }: { languageCode: string }) {
  const lang = SUPPORTED_LANGUAGES[languageCode];
  const label = lang ? `${lang.nativeName} \u00B7 ${lang.name}` : languageCode;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold tracking-wide"
      style={{
        background: "var(--accent-subtle)",
        color: "var(--accent)",
        border: "1.5px solid var(--border-accent)",
      }}
    >
      {label}
    </span>
  );
}
