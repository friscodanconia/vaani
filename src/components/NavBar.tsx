"use client";

import Link from "next/link";

interface NavBarProps {
  title: string;
}

export default function NavBar({ title }: NavBarProps) {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b flex items-center justify-between px-6 py-3"
      style={{
        background: "var(--warm-50)/80",
        borderColor: "var(--border-subtle)",
      }}
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-medium tracking-wide hover:opacity-70 transition-opacity"
        style={{ color: "var(--accent)" }}
      >
        <span>&larr;</span>
        <span className="font-display italic text-lg">Vaani</span>
      </Link>
      <span
        className="text-sm font-medium tracking-wide"
        style={{ color: "var(--text-secondary)" }}
      >
        {title}
      </span>
    </nav>
  );
}
