import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import QuoteShipmentSection from "@/components/sections/quote";
import HowItWorks from "@/components/sections/HowItWorks";
import TransparentPricing from "@/components/sections/TransparentPricing";
import TrustedVerifiedAgents from "@/components/sections/TrustedVerifiedAgents";
import CustomerReviews from "@/components/sections/CustomerReviews";

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <QuoteShipmentSection />
        <HowItWorks />
        <TrustedVerifiedAgents />
        <TransparentPricing />
        <CustomerReviews />
      </main>

      <Footer />
    </>
  );
}