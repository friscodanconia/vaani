import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import OldDemoView from "@/components/OldDemoView";
import Footer from "@/components/Footer";
import ModelNav from "@/components/ModelNav";

export const metadata: Metadata = {
  title: "The Full Pipeline — Watch 5 Models Work Together | Vaani",
  description: "Watch all 5 Sarvam AI models work in concert to answer questions about documents in any Indian language.",
};

export default function VaaniPipelinePage() {
  return (
    <>
      <NavBar title="The Full Pipeline" />
      <main className="relative z-10">
        <div className="max-w-5xl mx-auto px-6 pt-12 sm:pt-20 pb-4">
          <div className="text-center mb-2">
            <span className="section-label">All 5 Models</span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl italic mt-3 text-[var(--text-primary)]">
              The Full Pipeline
            </h2>
          </div>
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Watch all 5 Sarvam AI models work <strong style={{ color: "var(--text-primary)" }}>in concert</strong>, from reading a document to speaking the answer aloud in the user&apos;s language.
            </p>
            <p className="text-base" style={{ color: "var(--text-tertiary)" }}>
              Vision reads the document. Saaras transcribes the question. Sarvam-M reasons over the text. Mayura translates. Bulbul speaks.
            </p>
          </div>
        </div>
        <OldDemoView />
      </main>
      <ModelNav current="/vaani" />
      <Footer compact />
    </>
  );
}
