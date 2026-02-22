"use client";

import OldDemoView from "@/components/OldDemoView";
import ModelCard from "@/components/ModelCard";
import Footer from "@/components/Footer";

const MODEL_CARDS = [
  { href: "/vision", icon: "\u{1F4C4}", title: "Sarvam Vision", description: "Read any Indian script" },
  { href: "/saaras", icon: "\u{1F399}\uFE0F", title: "Saaras STT", description: "Transcribe any speech" },
  { href: "/translate", icon: "\u{1F504}", title: "Sarvam Translate", description: "One headline, eight languages" },
  { href: "/mayura", icon: "\u{1F30A}", title: "Mayura", description: "Culturally-aware translation" },
  { href: "/bulbul", icon: "\u{1F50A}", title: "Bulbul TTS", description: "Five voices, natural intonation", span: true },
];

export default function Home() {
  return (
    <main className="relative">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#bfb09a]/[0.06] rounded-full blur-[120px] animate-float" />
        <div
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#c2652a]/[0.04] rounded-full blur-[100px] animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 sm:pt-24 pb-2 sm:pb-8">
        <div className="text-center mb-6 animate-slide-up max-w-2xl mx-auto">
          <h1
            className="font-display text-7xl sm:text-9xl font-light italic tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Vaani
          </h1>
          <span className="section-label mt-3 block">Sarvam AI Demo Hub</span>
          <p className="mt-6 font-body text-xl sm:text-2xl text-[var(--text-secondary)] font-light leading-relaxed">
            India has 22 official languages, but most government documents arrive in just one.
          </p>
          <p className="mt-4 font-body text-lg sm:text-xl text-[var(--text-secondary)] font-light leading-relaxed">
            Vaani chains 5 AI models — vision, speech, reasoning, translation, and voice synthesis — so anyone can <strong className="font-medium" style={{ color: "var(--text-primary)" }}>upload a document and ask questions in their own language</strong>.
          </p>
          <p className="mt-4 text-base text-[var(--text-muted)]">
            Watch the demo below to see all 5 models work in concert.
          </p>
        </div>
      </section>

      {/* Full pipeline demo */}
      <section className="relative z-10">
        <OldDemoView />
      </section>

      {/* Divider */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-6 sm:py-16">
        <div className="divider-gradient" />
      </div>

      {/* Individual model cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-16 sm:pb-24">
        <div className="mb-10 text-center">
          <span className="section-label mb-3 block">Explore Individual Models</span>
          <h2 className="font-display text-3xl sm:text-4xl italic" style={{ color: "var(--text-primary)" }}>
            Try each model
          </h2>
          <p className="mt-3 text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Each model handles one step of the pipeline. Try them individually to see what they do.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {MODEL_CARDS.map((card) => (
            <ModelCard key={card.href} {...card} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
