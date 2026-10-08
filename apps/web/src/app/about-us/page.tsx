import type { Metadata } from "next";

import AboutUsContent from "@/components/about/AboutUsContent";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "About Us | Zionra",
  description:
    "Learn why Zionra is building a transparent, reliable cross-border shipping marketplace connecting the UK and Africa.",
};

export default function AboutUsPage() {
  return (
    <>
      <Header />
      <main className="overflow-x-clip bg-neutral-01">
        <AboutUsContent />
      </main>
      <Footer />
    </>
  );
}
