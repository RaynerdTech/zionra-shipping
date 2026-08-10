import type { ReactNode } from "react";
import Link from "next/link";

import { routes } from "@/config/routes";
import HomepageReveal from "./HomepageReveal";
import HomepageTrackingPreview from "./HomepageTrackingPreview";

const ukFlagSrc = "/images/United-Kingdom.svg";
const ngFlagSrc = "/images/Nigeria.svg";

const agentRows = [
  { initial: "Q", name: "QuickShip Lagos", rating: "★★★★★" },
  { initial: "N", name: "NigeriaXpress", rating: "★★★★☆" },
  { initial: "S", name: "SafeRoute Co.", rating: "★★★★☆" },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 overflow-hidden bg-white px-4 py-16 font-sans sm:px-6 md:py-20 lg:min-h-[680px] lg:px-8 lg:py-20">
      <div className="pointer-events-none absolute -left-[170px] bottom-[-120px] h-[356px] w-[356px] rounded-full bg-error/[0.05]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[220px] w-[600px] -translate-x-1/2 rounded-full bg-secondary-06/[0.04]" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-[1272px] flex-col items-center">
        <HomepageReveal className="text-center">
          <h2 className="font-display text-[34px] font-bold leading-[44px] tracking-[-1px] text-primary-10 sm:text-[40px] sm:leading-[52px] sm:tracking-[-1.5px]">
            How It Works
          </h2>
          <p className="mt-1 text-[16px] leading-[26px] text-text-body-light">Three simple steps to ship smarter</p>
        </HomepageReveal>

        <div className="mt-12 grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:mt-[60px] lg:grid-cols-3 lg:gap-6">
          <HomepageReveal delay={0} className="h-full"><StepOne /></HomepageReveal>
          <HomepageReveal delay={90} className="h-full"><StepTwo /></HomepageReveal>
          <HomepageReveal delay={180} className="h-full md:col-span-2 lg:col-span-1"><StepThree /></HomepageReveal>
        </div>

        <HomepageReveal delay={220}>
          <Link href={routes.web.homeHowItWorks} className="zion-btn zion-btn-md zion-btn-blue mt-12 min-w-[192px] px-6">
            Learn More
          </Link>
        </HomepageReveal>
      </div>
    </section>
  );
}

function StepShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <article className="flex h-full min-h-[248px] flex-col rounded-[12px] border border-neutral-03 bg-white px-6 py-7 transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(7,22,44,0.08)] lg:px-6 lg:py-8">
      <div>
        <h3 className="font-display text-[16px] font-semibold leading-[22px] text-primary-10">{title}</h3>
        <p className="mt-1 text-[13px] leading-[20px] text-text-body-light sm:text-[14px] sm:leading-[22px]">{description}</p>
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </article>
  );
}

function StepOne() {
  return (
    <StepShell title="1. Enter shipment details" description="Tell us origin, destination, weight and what you’re sending.">
      <div className="grid min-h-[120px] grid-cols-2 gap-x-3 gap-y-3 rounded-[8px] border border-primary-02 p-2.5">
        <MiniField label="From"><img src={ngFlagSrc} alt="Nigeria flag" className="h-[10px] w-[14px]" /><span>Nigeria</span></MiniField>
        <MiniField label="From" active><img src={ukFlagSrc} alt="United Kingdom flag" className="h-[10px] w-[14px]" /><span>United Kingdom</span></MiniField>
        <MiniField label="From"><span>5 kg</span></MiniField>
        <div className="min-w-0">
          <span className="block font-display text-[10px] text-neutral-06">Quotation</span>
          <div className="mt-1.5 flex h-[30px] items-center justify-center rounded-[6px] bg-primary-06 px-2 text-[11px] font-medium text-white">Get Quote →</div>
        </div>
      </div>
    </StepShell>
  );
}

function MiniField({ label, active = false, children }: { label: string; active?: boolean; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="block font-display text-[10px] text-neutral-06">{label}</span>
      <div className={`mt-1.5 flex h-[30px] min-w-0 items-center gap-2 rounded-[6px] border bg-primary-01 px-2 text-[10px] text-primary-10 ${active ? "border-primary-06" : "border-neutral-03"}`}>
        {children}
      </div>
    </div>
  );
}

function StepTwo() {
  return (
    <StepShell title="2. Compare verified agents" description="Browse agents by price, transit time and rating. Filter to find your perfect match.">
      <div className="flex min-h-[120px] flex-col justify-center gap-2 rounded-[8px] border border-primary-02 p-2.5">
        {agentRows.map((agent) => (
          <div key={agent.name} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[9px] bg-primary-06 text-[11px] font-medium text-white">{agent.initial}</span>
              <span className="truncate font-sans text-[11px] font-medium tracking-[1.4px] text-primary-10">{agent.name}</span>
            </div>
            <span className="shrink-0 font-display text-[9px] text-secondary-06">{agent.rating}</span>
          </div>
        ))}
      </div>
    </StepShell>
  );
}

function StepThree() {
  return (
    <StepShell title="3. Book, pay and track" description="Confirm your booking, pay securely and get real-time updates on every shipment.">
      <HomepageTrackingPreview />
    </StepShell>
  );
}

export default HowItWorks;
