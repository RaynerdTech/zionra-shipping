import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/config/routes";
import HomepageReveal from "./HomepageReveal";
import HeroVisual from "./HeroVisual";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary-10 font-sans text-text-on-dark-muted">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.16) 1.5px, transparent 1.5px)",
          backgroundSize: "72px 80px",
          backgroundPosition: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-[1272px] items-center gap-8 px-5 py-14 sm:px-8 sm:py-16 lg:min-h-[600px] lg:grid-cols-[minmax(0,628px)_minmax(390px,516px)] lg:gap-10 lg:px-6 lg:py-10 xl:px-0">
        <div className="relative z-10">
          <HomepageReveal variant="fade-up">
            <div className="inline-flex h-10 items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.08] px-4 font-sans text-[14px] font-medium text-neutral-01">
              <ShieldCheckIcon />
              <span>Fast. Secure. Reliable.</span>
            </div>
          </HomepageReveal>

          <HomepageReveal variant="blur-up" delay={80}>
            <h1 className="mt-6 max-w-[700px] font-display text-[42px] font-bold leading-[1.08] tracking-[-1.8px] text-neutral-01 sm:text-[54px] sm:tracking-[-2px] lg:text-[64px] lg:leading-[1.08] xl:text-[72px] xl:leading-[80px] xl:tracking-[-2.5px]">
              Ship Smarter to Nigeria with Zionra
            </h1>
          </HomepageReveal>

          <HomepageReveal delay={160}>
            <p className="mt-4 max-w-[520px] font-sans text-[16px] leading-[26px] text-text-on-dark-muted sm:text-[18px] sm:leading-[30px]">
              Compare verified shipping agents, book securely, and track every delivery from the UK to Nigeria
            </p>
          </HomepageReveal>

          <HomepageReveal delay={240}>
            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
              <TrustItem icon={<ShieldIcon />}>Trusted Agents</TrustItem>
              <TrustItem icon={<ClockIcon />}>Real-time Tracking</TrustItem>
              <TrustItem icon={<LockIcon />}>Secure Payment</TrustItem>
            </div>
          </HomepageReveal>

          <HomepageReveal delay={320}>
            <div className="mt-10 flex flex-wrap gap-3 sm:gap-5 lg:mt-11 lg:gap-6">
              <Link
                href={routes.web.homeQuote}
                className="zion-btn zion-btn-md zion-btn-blue min-w-[150px] px-6 font-semibold"
              >
                Get a quote
              </Link>
              <Link
                href={routes.web.partnerApplication}
                className="zion-btn zion-btn-md min-w-[180px] border border-white/55 bg-transparent px-6 font-semibold text-white transition hover:border-white hover:bg-white/10 active:bg-white/15"
              >
                Become an Agent
              </Link>
            </div>
          </HomepageReveal>
        </div>

        <HomepageReveal variant="scale" delay={160} className="mx-auto w-full max-w-[516px] lg:mx-0">
          <HeroVisual />
        </HomepageReveal>
      </div>
    </section>
  );
}

function TrustItem({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-2 font-sans text-[14px] font-medium text-text-on-dark-muted">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="h-6 w-6 shrink-0 text-tertiary-06" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l8 3v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5l8-3z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-6 w-6 shrink-0 text-tertiary-06" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l8 3v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5l8-3z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-6 w-6 shrink-0 text-tertiary-06" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-6 w-6 shrink-0 text-tertiary-06" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default Hero;
