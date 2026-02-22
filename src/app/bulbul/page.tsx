import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import DemoBulbul from "@/components/DemoBulbul";
import Footer from "@/components/Footer";
import ModelNav from "@/components/ModelNav";

export const metadata: Metadata = {
  title: "Bulbul TTS — Voices of India | Vaani",
  description: "Hear natural Indian voices in five languages with Bulbul text-to-speech.",
};

export default function BulbulPage() {
  return (
    <>
      <NavBar title="Voices of India" />
      <main className="relative z-10">
        <DemoBulbul />
      </main>
      <ModelNav current="/bulbul" />
      <Footer compact />
    </>
  );
}
