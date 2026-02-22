"use client";

import Link from "next/link";

interface ModelCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  span?: boolean;
}

export default function ModelCard({
  href,
  title,
  description,
  span,
}: ModelCardProps) {
  return (
    <Link href={href} className={`block group h-full ${span ? "col-span-2 lg:col-span-1" : ""}`}>
      <div
        className="relative overflow-hidden rounded-2xl border transition-all duration-500 h-full"
        style={{
          background: "linear-gradient(to bottom right, var(--warm-50), var(--warm-100)/60)",
          borderColor: "var(--warm-300)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--warm-300)";
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-[var(--accent)]/[0.03] group-hover:to-transparent transition-all duration-700" />

        {/* Content */}
        <div className={`relative p-4 sm:p-8 pb-5 sm:pb-10 flex flex-col gap-1 h-full ${span ? "text-center items-center" : ""}`}>
          <h3
            className="font-display text-base sm:text-2xl italic"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h3>
          <p
            className={`text-xs sm:text-base leading-relaxed mt-1 flex-1 ${span ? "max-w-sm" : ""}`}
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
          <div
            className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-4 text-xs sm:text-sm font-medium tracking-wide opacity-60 group-hover:opacity-100 transition-opacity duration-300"
            style={{ color: "var(--accent)" }}
          >
            <span>Explore</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
