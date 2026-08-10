import type { Metadata } from "next";

import HowItWorksContent from "@/components/how-it-works/HowItWorksContent";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "How It Works | Zionra",
  description:
    "See how Zionra helps you compare verified shipping agents, book securely, and track cross-border shipments in one place.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="overflow-x-clip bg-neutral-01">
        <HowItWorksContent />
      </main>
      <Footer />
    </>
  );
}
