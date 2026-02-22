import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import DemoSaaras from "@/components/DemoSaaras";
import Footer from "@/components/Footer";
import ModelNav from "@/components/ModelNav";

export const metadata: Metadata = {
  title: "Saaras STT — The Listener | Vaani",
  description: "Transcribe speech in any Indian language with Saaras speech-to-text.",
};

export default function SaarasPage() {
  return (
    <>
      <NavBar title="The Listener" />
      <main className="relative z-10">
        <DemoSaaras />
      </main>
      <ModelNav current="/saaras" />
      <Footer compact />
    </>
  );
}
