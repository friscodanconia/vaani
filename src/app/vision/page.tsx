import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import DemoVision from "@/components/DemoVision";
import Footer from "@/components/Footer";
import ModelNav from "@/components/ModelNav";

export const metadata: Metadata = {
  title: "Sarvam Vision — The Reader | Vaani",
  description: "Extract text from any document in any Indian script using Sarvam Vision.",
};

export default function VisionPage() {
  return (
    <>
      <NavBar title="The Reader" />
      <main className="relative z-10">
        <DemoVision />
      </main>
      <ModelNav current="/vision" />
      <Footer compact />
    </>
  );
}
