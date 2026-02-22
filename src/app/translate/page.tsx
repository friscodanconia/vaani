import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import DemoTranslate from "@/components/DemoTranslate";
import Footer from "@/components/Footer";
import ModelNav from "@/components/ModelNav";

export const metadata: Metadata = {
  title: "Sarvam Translate — One India | Vaani",
  description: "One headline across eight Indian languages with Sarvam Translate.",
};

export default function TranslatePage() {
  return (
    <>
      <NavBar title="One India" />
      <main className="relative z-10">
        <DemoTranslate />
      </main>
      <ModelNav current="/translate" />
      <Footer compact />
    </>
  );
}
