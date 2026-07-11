import type { ReactNode } from "react";

const ukFlagSrc = "/images/United-Kingdom.svg";
const ngFlagSrc = "/images/Nigeria.svg";

type StepCardProps = {
  step: string;
  title: string;
  description: string;
  accentClass: string;
  cardClass: string;
  borderClass: string;
  children: ReactNode;
};

type TrackStepItem = {
  label: string;
  active: boolean;
};

const trackingSteps: TrackStepItem[] = [
  { label: "Booked", active: true },
  { label: "Picked up", active: true },
  { label: "In transit", active: true },
  { label: "Delivered", active: false },
];

function HowItWorks() {
  return (
    <section className="w-full bg-neutral-05/15">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-[26px] pt-[36px] sm:px-6 md:pb-[42px] md:pt-[42px] lg:px-[24px] lg:pb-[50px] lg:pt-[50px]">
        <div className="pt-0 lg:pt-[8px]">
          <h2 className="font-sans text-[24px] font-bold leading-none tracking-[-0.5px] text-primary-10 lg:text-[40px] lg:tracking-[-1.5px]">
            How It Works
          </h2>

          <p className="mt-[10px] font-sans text-[14px] font-light leading-none text-tertiary-06 lg:text-[18px]">
            Three simple steps to ship smarter
          </p>
        </div>

        <div className="mt-[18px] grid grid-cols-1 gap-[28px] lg:mt-[22px] lg:grid-cols-3 lg:gap-[22px]">
          <StepCard
            step="01"
            title="Enter shipment details"
            description="Tell us the origin, destination, weight and what you're sending. Takes under a minute."
            accentClass="bg-primary-06"
            cardClass="bg-primary-06/[0.08]"
            borderClass="border-primary-06/20 border-t-primary-06"
          >
            <ShipmentPreview />
          </StepCard>

          <StepCard
            step="02"
            title="Compare verified agents"
            description="Browse agents by price, transit time and rating. Filter to find your perfect match."
            accentClass="bg-secondary-06"
            cardClass="bg-secondary-06/[0.12]"
            borderClass="border-secondary-06/25 border-t-secondary-06"
          >
            <AgentsPreview />
          </StepCard>

          <StepCard
            step="03"
            title="Book, pay and track"
            description="Confirm your booking, pay securely and get real-time updates on every shipment."
            accentClass="bg-tertiary-06"
            cardClass="bg-tertiary-06/[0.10]"
            borderClass="border-tertiary-06/30 border-t-tertiary-06"
          >
            <TrackingPreview />
          </StepCard>
        </div>

        <div className="mt-[28px] lg:mt-[24px]">
          <button
            type="button"
            className="zion-btn zion-btn-sm zion-btn-blue font-light"
          >
            Learn more
          </button>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  title,
  description,
  accentClass,
  cardClass,
  borderClass,
  children,
}: StepCardProps) {
  return (
    <article
      className={`min-w-0 rounded-b-[12px] border border-t-[4px] ${borderClass} ${cardClass} px-[19px] pb-[14px] pt-[16px] lg:min-h-[248px] lg:px-[18px] lg:pb-[18px] lg:pt-[18px]`}
    >
      <div
        className={`inline-flex h-[30px] min-w-[38px] items-center justify-center rounded-full px-[10px] font-sans text-[14px] font-semibold leading-none text-white ${accentClass}`}
      >
        {step}
      </div>

      <h3 className="mt-[14px] font-sans text-[20px] font-bold leading-[1.15] text-primary-10 lg:text-[17px]">
        {title}
      </h3>

      <p className="mt-[8px] max-w-[420px] font-sans text-[14px] leading-[1.7] text-neutral-08/70 lg:max-w-[340px] lg:leading-[1.65]">
        {description}
      </p>

      <div className="mt-[16px]">{children}</div>
    </article>
  );
}

function ShipmentPreview() {
  return (
    <div className="rounded-[8px] border border-primary-06/20 text-white/45 p-[9px] lg:p-[10px]">
      <div className="grid grid-cols-2 gap-[8px]">
        <LocationMiniField label="From">
          <img
            src={ukFlagSrc}
            alt="United Kingdom flag"
            className="h-[12px] w-[16px] shrink-0 rounded-[2px] object-cover"
          />
          <span className="truncate">United Kingdom</span>
        </LocationMiniField>

        <LocationMiniField label="To">
          <img
            src={ngFlagSrc}
            alt="Nigeria flag"
            className="h-[12px] w-[16px] shrink-0 rounded-[2px] object-cover"
          />
          <span className="truncate">Nigeria</span>
        </LocationMiniField>
      </div>

      <div className="mt-[8px] hidden items-center gap-[8px] sm:flex">
        <div className="flex h-[26px] w-[90px] shrink-0 items-center rounded-[5px] border border-navborder px-[9px] font-sans text-[12px] text-primary-10/80">
          5 kg
        </div>

        <div className="inline-flex h-[26px] min-w-0 flex-1 items-center justify-center rounded-[5px] bg-primary-06 px-[18px] font-sans text-[12px] font-semibold text-white">
          Get Quote →
        </div>
      </div>

      <div className="mt-[10px] sm:hidden">
        <div className="inline-flex h-[32px] w-full items-center justify-center rounded-[5px] bg-primary-06 px-[18px] font-sans text-[12px] font-semibold text-white">
          Get Quote →
        </div>
      </div>
    </div>
  );
}

function LocationMiniField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[5px] border border-navborder text-white/55 px-[8px] py-[6px]">
      <div className="font-sans text-[12px] leading-none text-neutral-08/65">
        {label}
      </div>

      <div className="mt-[5px] flex min-w-0 items-center gap-[6px] font-sans text-[12px] font-medium leading-none text-primary-10">
        {children}
      </div>
    </div>
  );
}

function AgentsPreview() {
  return (
    <div className="rounded-[8px] border border-secondary-06/25 text-white/35 px-[10px] py-[8px] lg:px-[12px] lg:py-[10px]">
      <AgentRow
        initials="Q"
        name="QuickShip Lagos"
        rating="★★★★★"
        meta="7-10 days"
        barWidth="w-[86px] lg:w-[106px]"
        badge="Top"
      />

      <AgentRow
        initials="N"
        name="NigeriaXpress"
        rating="★★★★☆"
        meta="5-8 days"
        barWidth="w-[64px] lg:w-[84px]"
      />

      <AgentRow
        initials="S"
        name="SafeRoute Co."
        rating="★★★★☆"
        meta="10-14 days"
        barWidth="w-[70px] lg:w-[92px]"
        last
      />
    </div>
  );
}

function AgentRow({
  initials,
  name,
  rating,
  meta,
  barWidth,
  badge,
  last = false,
}: {
  initials: string;
  name: string;
  rating: string;
  meta: string;
  barWidth: string;
  badge?: string;
  last?: boolean;
}) {
  return (
    <div className={`${last ? "" : "border-b border-black/[0.08]"} py-[5px]`}>
      <div className="flex min-w-0 items-center gap-[8px]">
        <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-secondary-06/80 font-sans text-[12px] font-semibold text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-[8px]">
            <p className="min-w-0 truncate font-sans text-[12px] font-semibold leading-none text-primary-10">
              {name}
            </p>

            <div
              className={`hidden h-[4px] shrink-0 rounded-full bg-secondary-06 sm:block ${barWidth}`}
            />
          </div>

          <div
            className={`mt-[5px] h-[4px] rounded-full bg-secondary-06 sm:hidden ${barWidth}`}
          />
        </div>

        <div className="flex shrink-0 flex-col items-start sm:items-end">
          <div className="flex items-center gap-[6px]">
            <span className="font-sans text-[16px] leading-none tracking-[2px] text-secondary-06">
              {rating}
            </span>

            {badge ? (
              <span className="inline-flex h-[14px] items-center rounded-full bg-tertiary-06/20 px-[6px] font-sans text-[12px] font-semibold text-tertiary-06">
                ✓ {badge}
              </span>
            ) : null}
          </div>

          <span className="mt-[6px] font-sans text-[12px] leading-none text-neutral-08/60">
            {meta}
          </span>
        </div>
      </div>
    </div>
  );
}

function TrackingPreview() {
  return (
    <div className="rounded-[8px] border border-tertiary-06/30 text-white/35 p-[10px] lg:p-[12px]">
      <TrackLine />

      <div className="mt-[10px] flex items-center gap-[7px] rounded-[5px] border border-tertiary-06 t px-[10px] py-[7px] font-sans text-[12px] leading-none text-primary-10">
        <span className="inline-flex h-[11px] w-[11px] shrink-0 rounded-full bg-tertiary-06" />
        <span className="min-w-0 truncate">
          Live&nbsp; ZNR-20480 • Manc → Lagos · Est. 3 days
        </span>
      </div>
    </div>
  );
}

function TrackLine() {
  const completedCount = trackingSteps.filter((step) => step.active).length;
  const progressRatio =
    trackingSteps.length <= 1
      ? 0
      : (completedCount - 1) / (trackingSteps.length - 1);

  return (
    <div className="relative px-[3px]">
      <div className="absolute left-[30px] right-[30px] top-[10px] h-[3px] bg-neutral-05/45" />

      <div
        className="absolute left-[30px] top-[10px] h-[3px] bg-tertiary-06"
        style={{ width: `calc((100% - 60px) * ${progressRatio})` }}
      />

      <div className="relative grid grid-cols-4">
        {trackingSteps.map((step) => (
          <TrackStep key={step.label} label={step.label} active={step.active} />
        ))}
      </div>
    </div>
  );
}

function TrackStep({ label, active }: TrackStepItem) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      <div
        className={`relative z-[1] flex h-[22px] w-[22px] items-center justify-center rounded-full ${
          active
            ? "bg-tertiary-06 text-white"
            : "border-[4px] border-zion-muted-2/60 text-white"
        }`}
      >
        {active ? <PlusTinyIcon /> : null}
      </div>

      <span className="mt-[6px] max-w-full truncate text-center font-sans text-[12px] leading-none text-neutral-08/65 lg:text-[10px]">
        {label}
      </span>
    </div>
  );
}

function PlusTinyIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 2V8M2 5H8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default HowItWorks;
