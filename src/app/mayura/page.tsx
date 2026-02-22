import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import DemoMayura from "@/components/DemoMayura";
import Footer from "@/components/Footer";
import ModelNav from "@/components/ModelNav";

export const metadata: Metadata = {
  title: "Mayura — Lost in Translation | Vaani",
  description: "See what literal translation misses with Mayura's culturally-aware translation.",
};

export default function MayuraPage() {
  return (
    <>
      <NavBar title="Lost in Translation" />
      <main className="relative z-10">
        <DemoMayura />
      </main>
      <ModelNav current="/mayura" />
      <Footer compact />
    </>
  );
}
