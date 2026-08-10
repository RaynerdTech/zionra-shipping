import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import TrustFeatures from "@/components/sections/TrustFeatures";
import QuoteShipmentSection from "@/components/sections/quote";
import HowItWorks from "@/components/sections/HowItWorks";
import CustomerReviews from "@/components/sections/CustomerReviews";
import TrustedVerifiedAgents from "@/components/sections/TrustedVerifiedAgents";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="overflow-x-clip">
        <Hero />
        <TrustFeatures />
        <QuoteShipmentSection />
        <HowItWorks />
        <CustomerReviews />
        <TrustedVerifiedAgents />
      </main>
      <Footer />
    </>
  );
}
