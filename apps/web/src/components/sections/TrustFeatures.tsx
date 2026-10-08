import type { ReactNode } from "react";

import HomepageReveal from "./HomepageReveal";

type FeatureItem = {
  title: string;
  description: string;
  icon: ReactNode;
};

const featureItems: FeatureItem[] = [
  {
    title: "Verified Shipping Agents",
    description: "We work with reliable verified shipping agents",
    icon: <VerifiedIcon />,
  },
  {
    title: "Best prices",
    description: "Compare prices easily",
    icon: <PriceIcon />,
  },
  {
    title: "Real-time Tracking",
    description: "Track every step of the way",
    icon: <TrackingIcon />,
  },
  {
    title: "Safe & Secure",
    description: "Protected & secure payment",
    icon: <SecureIcon />,
  },
  {
    title: "24/7 Support",
    description: "Always here when you need us",
    icon: <SupportIcon />,
  },
];

function TrustFeatures() {
  return (
    <section className="bg-white font-sans">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-y-1 px-5 py-3 min-[480px]:grid-cols-2 sm:px-8 md:grid-cols-3 md:gap-x-3 xl:grid-cols-5 xl:px-2">
        {featureItems.map((item, index) => (
          <HomepageReveal key={item.title} delay={index * 70}>
            <article className="flex min-h-[96px] items-start gap-4 px-2 py-4 min-[480px]:flex-col min-[480px]:gap-2 xl:min-h-[100px] xl:px-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center text-primary-10">
                {item.icon}
              </span>
              <div className="min-w-0">
                <h2 className="font-sans text-[14px] font-normal leading-[22px] text-primary-10">
                  {item.title}
                </h2>
                <p className="mt-0.5 font-display text-[11px] leading-4 text-text-body-light">
                  {item.description}
                </p>
              </div>
            </article>
          </HomepageReveal>
        ))}
      </div>
    </section>
  );
}

function VerifiedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path d="M10.29 2.53 4.57 4.63A2.39 2.39 0 0 0 3 6.87v6.19c0 3.72 2.4 7.02 5.94 8.15l1.55.49c.98.31 2.04.31 3.02 0l1.55-.49C18.6 20.08 21 16.78 21 13.06V6.87a2.39 2.39 0 0 0-1.57-2.24l-5.72-2.1a3.5 3.5 0 0 0-2.42 0Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PriceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path d="M17 7H7c-1.5 1.2-4 4.3-4 8.5C3 19.6 6.5 22 12 22s9-2.4 9-6.5C21 11.3 18.5 8.2 17 7Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 2h7c.6 0 1 .5.79 1.06L15 7H9L7.71 3.06C7.5 2.5 7.9 2 8.5 2Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TrackingIcon() {
  return <VerifiedIcon />;
}

function SecureIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path d="M21.5 12c0 5.25-4.25 9.5-9.5 9.5-1.3 0-2.54-.26-3.67-.73-.34-.14-.51-.21-.63-.24a1.3 1.3 0 0 0-.34-.03c-.13 0-.27.04-.56.12l-2.35.7c-.62.19-.93.28-1.14.2a.65.65 0 0 1-.39-.39c-.07-.2.02-.51.2-1.13l.7-2.35c.09-.29.13-.43.13-.56a1.3 1.3 0 0 0-.03-.34c-.03-.12-.1-.29-.24-.63A9.46 9.46 0 0 1 2.5 12C2.5 6.75 6.75 2.5 12 2.5s9.5 4.25 9.5 9.5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 11V9.6a2 2 0 1 1 4 0V11" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8.5" y="11" width="7" height="4.5" rx="1.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path d="M4.5 9H5a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-.5A2.5 2.5 0 0 1 2 14.5v-3A2.5 2.5 0 0 1 4.5 9Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.5 9H19a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h.5a2.5 2.5 0 0 0 2.5-2.5v-3A2.5 2.5 0 0 0 19.5 9Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 10V9a7 7 0 0 1 14 0v1M19 17v.5a3.5 3.5 0 0 1-3.5 3.5H13" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default TrustFeatures;
