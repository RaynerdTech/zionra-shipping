"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

import { routes } from "@/config/routes";

type RevealVariant =
  | "fade"
  | "fade-up"
  | "blur-up"
  | "scale"
  | "slide-left"
  | "slide-right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
};

type ScrollBlobOptions = {
  axis: "X" | "Y";
  from: number;
  mode?: "entry" | "exit";
  rotation?: number;
  anchorSelf?: boolean;
};

const heroImage = "/images/about/about-hero.jpg";
const missionImage = "/images/about/about-mission.jpg";

const partnershipCards = [
  {
    number: 1,
    title: "The Application",
    body: "Tell us who you are and how you operate. A few details about your business, your routes, and how you work is all it takes to get started.",
    image: "/images/about/partner-application.jpg",
    alt: "Partner application form",
  },
  {
    number: 2,
    title: "Review process",
    body: "Every application is checked by our team, not a bot. We verify your credentials and track record before you’re allowed near a customer’s parcel.",
    image: "/images/about/partner-review.jpg",
    alt: "Application submitted confirmation",
  },
  {
    number: 3,
    title: "Get Booked !",
    body: "Once you’re verified, you’re live. Customers can find you, compare you, and book you, with every job backed by the trust you’ve already earned.",
    image: "/images/about/partner-booked.jpg",
    alt: "Partner application on mobile",
  },
] as const;

export default function AboutUsContent() {
  return (
    <div className="bg-neutral-01 pt-5">
      <AboutHero />
      <WhyZionra />
      <MissionValues />
      <StrategicPartnerships />
      <AboutCta />
    </div>
  );
}

function AboutHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const blobRef = useRef<HTMLDivElement | null>(null);

  useScrollBlob(sectionRef, blobRef, {
    axis: "Y",
    from: 105,
    mode: "exit",
    rotation: -18,
  });

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto min-h-[604px] w-full max-w-[1272px] overflow-hidden bg-primary-10 px-5 py-12 sm:px-8 sm:py-14 lg:px-12 xl:h-[604px] xl:px-0 xl:py-0"
    >
      <div
        ref={blobRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-88px] left-[18%] h-[150px] w-[450px] rounded-[50%] bg-[rgba(255,166,48,0.15)] motion-reduce:transform-none sm:h-[180px] sm:w-[540px] xl:left-[360.006px] xl:top-[397.466px] xl:h-[200px] xl:w-[600px]"
        style={{ transformOrigin: "0 0", transform: "rotate(-18deg)" }}
      />

      <div className="relative z-10 grid gap-10 xl:block">
        <div className="xl:absolute xl:left-20 xl:top-20 xl:w-[560px]">
          <Reveal>
            <div className="font-sans text-[11px] font-medium leading-4 tracking-[1.5px] text-secondary-06">
              ABOUT US
            </div>
          </Reveal>

          <Reveal variant="blur-up" delay={90}>
            <h1 className="mt-6 font-display text-[36px] font-bold leading-[46px] tracking-[-1.3px] text-neutral-01 sm:text-[40px] sm:leading-[52px] sm:tracking-[-1.5px]">
              Smarter Cross boarder
              <br />
              <span className="text-secondary-06">Shipping Starts Here</span>
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-6 max-w-[520px] font-sans text-[16px] leading-[26px] text-text-on-dark-muted">
              <p>
                Cross border shipping shouldn’t mean crossing your fingers and
                hoping it arrives. Zionra connects you with verified shipping
                agents, upfront pricing, and real time tracking, so you always
                know where your money and your parcel are.
              </p>
              <p className="mt-[26px]">
                We started Zionra because too many people were left in the dark,
                sending something abroad and just hoping for the best. We’re
                building the platform we wished existed: verified agents, honest
                prices, every shipment tracked from pickup to delivery.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal
          variant="scale"
          delay={110}
          className="relative mx-auto h-[330px] w-full max-w-[539px] overflow-hidden rounded sm:h-[390px] xl:absolute xl:left-[649px] xl:top-[86px] xl:h-[432px] xl:w-[539px]"
        >
          <Image
            src={heroImage}
            alt="Zionra courier handing a parcel to a customer on a UK street"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 539px"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}

function WhyZionra() {
  return (
    <section className="mx-auto w-full max-w-[1272px] bg-white px-5 py-10 sm:px-8 xl:h-[296px] xl:px-6">
      <div className="grid items-center gap-6 xl:h-full xl:grid-cols-[492px_708px]">
        <Reveal variant="slide-right">
          <article className="flex min-h-[216px] items-center rounded-2xl bg-primary-10 px-6 py-8 transition duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(7,22,44,0.18)] sm:px-7 xl:h-[216px] xl:px-7 xl:py-[33px]">
            <div className="flex w-full items-start gap-4 sm:items-center">
              <DarkIcon>
                <span className="font-display text-[20px] leading-none text-secondary-06">♥</span>
              </DarkIcon>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[10px] font-bold leading-3 tracking-[1.5px] text-secondary-06">
                  WHY WE BUILT ZIONRA
                </div>
                <p className="mt-2 font-sans text-[16px] leading-[26px] text-text-on-dark-muted">
                  Without competition, shipping prices stay high and no one has
                  to earn your business. Zionra brings verified agents together
                  in one place, competing on price and service. You compare, you
                  choose, and they earn your trust.
                </p>
              </div>
            </div>
          </article>
        </Reveal>

        <Reveal variant="slide-left" delay={90}>
          <article className="flex min-h-[180px] items-center rounded-2xl bg-primary-10 px-6 py-8 transition duration-200 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(7,22,44,0.18)] xl:h-[180px] xl:px-[18px] xl:py-[46px]">
            <div className="flex w-full items-start gap-4 sm:items-center">
              <DarkIcon>
                <svg viewBox="0 0 24 24" className="h-[19.5px] w-[15.5px] fill-secondary-06" aria-hidden="true">
                  <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
                </svg>
              </DarkIcon>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[12px] font-bold leading-[15px] text-secondary-06">
                  THE ZIONRA EFFECT
                </div>
                <p className="mt-2 font-sans text-[16px] leading-[26px] text-text-on-dark-muted">
                  When agents compete for your business, prices become fair,
                  service improves, and trust stops being something you hope for
                  and becomes something you can see, in verified profiles and real
                  reviews. It’s what happens when a marketplace finally works the
                  way it should.
                </p>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

function MissionValues() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const blobRef = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);

  useScrollBlob(sectionRef, blobRef, { axis: "X", from: -120 });
  useSectionEntered(sectionRef, setEntered);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 lg:px-12 xl:h-[680px] xl:px-0 xl:py-0"
    >
      <div
        ref={blobRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-[-224px] top-[-263px] hidden h-[480px] w-[480px] rounded-full bg-[rgba(46,196,182,0.08)] lg:block"
        style={{ transform: "translateX(-120%)" }}
      />

      <div className="relative mx-auto grid w-full max-w-[1272px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:block xl:h-full">
        <Reveal
          variant="slide-right"
          className="relative z-10 h-[360px] overflow-hidden rounded sm:h-[430px] xl:absolute xl:left-0 xl:top-[107px] xl:h-[466px] xl:w-[625px]"
        >
          <Image
            src={missionImage}
            alt="Zionra courier handing a parcel to a customer at a market street"
            fill
            sizes="(max-width: 1023px) 100vw, 625px"
            className="object-cover"
          />
        </Reveal>

        <div className="relative z-10 xl:absolute xl:left-[648px] xl:top-[112.5px] xl:w-[624px]">
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-[-0.5px] h-[111px] w-full origin-left rounded-[56px] bg-[rgba(255,166,48,0.04)] transition-[clip-path] duration-[950ms] motion-reduce:[clip-path:inset(0_0_0_0)] ${
              entered
                ? "[clip-path:inset(0_0_0_0)]"
                : "[clip-path:inset(0_100%_0_0)]"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(.22,.61,.36,1)", transitionDelay: "150ms" }}
          />

          <Reveal>
            <h2 className="relative z-10 font-display text-[34px] font-bold leading-[44px] tracking-[-1.2px] text-primary-10 sm:text-[40px] sm:leading-[52px] sm:tracking-[-1.5px]">
              Zionra: Building infrastructure for a connected diaspora
            </h2>
          </Reveal>
          <Reveal delay={90}>
            <p className="relative z-10 mt-[17px] max-w-[605px] font-sans text-[16px] leading-[26px] text-text-body-light">
              Zionra is a technology enabled logistics marketplace on a mission
              to make cross border shipping from the UK to Africa simple,
              transparent, and reliable. We connect customers with verified
              shipping agents, enable secure payments, and provide real time
              tracking — all in one platform.
            </p>
          </Reveal>
        </div>

        <div className="rounded-xl bg-neutral-01 p-6 lg:col-span-2 xl:absolute xl:left-[648px] xl:top-[364px] xl:h-[204px] xl:w-[708px] xl:rounded-none xl:px-0 xl:py-[26px]">
          <Reveal>
            <h3 className="text-center font-display text-[20px] font-semibold leading-[30px] tracking-[-0.3px] text-primary-10">
              More than a shipping platform.
              <br />
              We’re building infrastructure for a connected diaspora
            </h3>
          </Reveal>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:ml-[39.59px] xl:mt-4 xl:w-[618px] xl:gap-[11.88px]">
            <Reveal delay={90}>
              <ValueCard accent="blue" label="Verified and Trusted Agents">
                <ShieldIcon />
              </ValueCard>
            </Reveal>
            <Reveal delay={180}>
              <ValueCard accent="orange" label="Real-Time Tracking">
                <SearchIcon />
              </ValueCard>
            </Reveal>
            <Reveal delay={270}>
              <ValueCard accent="teal" label="24/7 Support">
                <BoltIcon />
              </ValueCard>
            </Reveal>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute left-0 top-[364px] z-0 hidden h-[204px] bg-neutral-01 xl:block xl:w-[707px]"
      />
    </section>
  );
}

function StrategicPartnerships() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const topBlobRef = useRef<HTMLDivElement | null>(null);
  const redBlobRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [railVisible, setRailVisible] = useState(false);

  useScrollBlob(sectionRef, topBlobRef, { axis: "Y", from: -140 });
  useScrollBlob(sectionRef, redBlobRef, {
    axis: "X",
    from: 120,
    anchorSelf: true,
  });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRailVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRailVisible(true);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );

    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-neutral-01 px-5 py-16 sm:px-8 lg:px-12 xl:-mt-[41px] xl:min-h-[1092px] xl:px-0 xl:pb-20 xl:pt-10"
    >
      <div
        ref={redBlobRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-[78%] top-[774px] hidden h-[480px] w-[480px] rounded-full bg-[rgba(220,75,74,0.05)] lg:block"
        style={{ transform: "translateX(120%)" }}
      />

      <div className="relative mx-auto w-full max-w-[1272px]">
        <div
          ref={topBlobRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-40px] ml-[-300px] hidden h-[200px] w-[600px] rounded-[50%] bg-[rgba(255,166,48,0.04)] lg:block"
          style={{ transform: "translateY(-140%)" }}
        />

        <div className="relative z-10 mx-auto flex max-w-[450px] flex-col gap-4 text-center">
          <Reveal>
            <h2 className="font-display text-[36px] font-bold leading-[46px] tracking-[-1.3px] text-primary-10 sm:text-[40px] sm:leading-[52px] sm:tracking-[-1.5px]">
              Strategic Partnerships
            </h2>
          </Reveal>
          <Reveal delay={90}>
            <p className="font-sans text-[16px] leading-[26px] text-text-body-light">
              Our network is built on seasoned logistics experts committed to
              reliability, precision, and smooth operations.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-12 xl:mt-10 xl:min-h-[755px]">
          <div
            ref={railRef}
            aria-hidden="true"
            className="absolute left-[182px] top-0 hidden h-[77px] w-[908px] xl:block"
          >
            <div
              className={`absolute left-[22px] top-[27px] h-[2px] w-[869px] origin-left bg-primary-10 transition-transform duration-[900ms] motion-reduce:scale-x-100 ${
                railVisible ? "scale-x-100" : "scale-x-0"
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(.22,.61,.36,1)", transitionDelay: "100ms" }}
            />

            {[0, 432, 864].map((left, index) => (
              <div
                key={`badge-${left}`}
                className={`absolute grid h-11 w-11 place-items-center rounded-full bg-primary-10 font-display text-[16px] font-semibold text-white transition-transform duration-[380ms] motion-reduce:scale-100 ${
                  railVisible ? "scale-100" : "scale-0"
                }`}
                style={{
                  left,
                  top: index === 0 ? 0 : 2,
                  transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
                  transitionDelay: `${350 + index * 90}ms`,
                }}
              >
                {index + 1}
              </div>
            ))}

            {[22, 454, 886].map((left, index) => (
              <div
                key={`line-${left}`}
                className={`absolute top-[46px] h-[31px] w-[2px] origin-top bg-primary-10 transition-transform duration-300 motion-reduce:scale-y-100 ${
                  railVisible ? "scale-y-100" : "scale-y-0"
                }`}
                style={{ left, transitionDelay: `${500 + index * 90}ms` }}
              />
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-6 xl:absolute xl:left-0 xl:top-[77px] xl:w-full">
            {partnershipCards.map((card, index) => (
              <Reveal key={card.title} delay={700 + index * 90}>
                <article className="mx-auto flex w-full max-w-[408px] flex-col items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary-10 font-display text-[16px] font-semibold text-white xl:hidden">
                    {card.number}
                  </div>
                  <h3 className="text-center font-display text-[24px] font-semibold leading-[34px] tracking-[-0.5px] text-black">
                    {card.title}
                  </h3>
                  <p className="min-h-[104px] text-center font-sans text-[16px] leading-[26px] text-text-body-light lg:min-h-[130px] xl:min-h-[104px]">
                    {card.body}
                  </p>
                  <div className="relative h-[457px] w-full overflow-hidden rounded-[19.04px] bg-neutral-02 transition duration-200 hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(7,22,44,0.06)]">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 1023px) 100vw, 408px"
                      className="object-cover"
                    />
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={970} className="mt-12 flex justify-center xl:absolute xl:left-1/2 xl:top-[918px] xl:mt-0 xl:-translate-x-1/2">
          <Link
            href={routes.web.partnerApplication}
            className="zion-btn zion-btn-md min-w-[225px] bg-primary-01 text-primary-08 hover:bg-primary-02"
          >
            Become a shipping partner
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function AboutCta() {
  return (
    <section className="relative overflow-hidden bg-primary-06 px-5 py-8 sm:px-8 lg:px-12 xl:h-[120px] xl:px-0 xl:py-0">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,.08) 1px, transparent 1px)",
          backgroundSize: "80px 60px",
          backgroundPosition: "40px 20px",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between xl:h-full">
        <div>
          <Reveal>
            <h2 className="font-display text-[24px] font-semibold leading-[34px] tracking-[-0.5px] text-white">
              Ready to ship smarter?
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="mt-1 max-w-[520px] font-sans text-[16px] leading-[26px] text-white/75">
              Join thousands of customers who ship with confidence using Zionra.
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:gap-[18px]">
          <Reveal delay={140}>
            <Link
              href={routes.web.homeQuote}
              className="flex h-11 min-w-[144px] items-center justify-center gap-[10px] rounded-md border border-primary-06 bg-white px-3 font-sans text-[16px] leading-[26px] text-primary-06 transition hover:bg-primary-01"
            >
              Get quote <ArrowIcon />
            </Link>
          </Reveal>
          <Reveal delay={210}>
            <Link
              href={routes.web.homeTrack}
              className="flex h-11 items-center justify-center gap-[10px] rounded-md border border-primary-01 bg-primary-01 px-3 font-sans text-[14px] leading-[22px] text-primary-06 transition hover:border-primary-02 hover:bg-primary-02"
            >
              Track Shipment <ArrowIcon />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "fade-up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hiddenClass: Record<RevealVariant, string> = {
    fade: "opacity-0",
    "fade-up": "translate-y-7 opacity-0",
    "blur-up": "translate-y-7 opacity-0 blur-[6px]",
    scale: "scale-[0.94] opacity-0",
    "slide-left": "translate-x-7 opacity-0",
    "slide-right": "-translate-x-7 opacity-0",
  };

  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
    transitionTimingFunction: "cubic-bezier(.22,.61,.36,1)",
  };

  return (
    <div
      ref={ref}
      style={style}
      className={`transition-[opacity,transform,filter] duration-700 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:blur-none ${
        visible
          ? "translate-x-0 translate-y-0 scale-100 opacity-100 blur-none"
          : hiddenClass[variant]
      } ${className}`}
    >
      {children}
    </div>
  );
}

function useSectionEntered(
  ref: RefObject<HTMLElement | null>,
  setEntered: (value: boolean) => void,
) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setEntered(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, setEntered]);
}

function useScrollBlob(
  sectionRef: RefObject<HTMLElement | null>,
  blobRef: RefObject<HTMLElement | null>,
  options: ScrollBlobOptions,
) {
  useEffect(() => {
    const section = sectionRef.current;
    const blob = blobRef.current;
    if (!section || !blob) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;

    const update = () => {
      ticking = false;

      if (media.matches) {
        blob.style.transform = options.rotation
          ? `rotate(${options.rotation}deg)`
          : "none";
        return;
      }

      const vh = window.innerHeight;
      const rect = section.getBoundingClientRect();
      let progress: number;

      if (options.mode === "exit") {
        progress = rect.bottom / (vh * 0.6);
      } else if (options.anchorSelf) {
        const top = rect.top + blob.offsetTop;
        progress = (vh - top) / (vh * 0.55);
      } else {
        const start = vh;
        const end = vh * 0.2;
        progress = (start - rect.top) / (start - end);
      }

      progress = Math.max(0, Math.min(1, progress));
      const travel = (1 - progress) * options.from;
      const translate = `translate${options.axis}(${travel}%)`;
      const rotate = options.rotation ? ` rotate(${options.rotation}deg)` : "";
      blob.style.transform = `${translate}${rotate}`;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    media.addEventListener("change", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      media.removeEventListener("change", requestUpdate);
    };
  }, [blobRef, options.anchorSelf, options.axis, options.from, options.mode, options.rotation, sectionRef]);
}

function DarkIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1F2734]">
      {children}
    </span>
  );
}

function ValueCard({
  children,
  label,
  accent,
}: {
  children: ReactNode;
  label: string;
  accent: "blue" | "orange" | "teal";
}) {
  const accentClasses = {
    blue: "border-primary-06/20 before:bg-primary-06",
    orange: "border-secondary-06/20 before:bg-secondary-06",
    teal: "border-tertiary-06/20 before:bg-tertiary-06",
  }[accent];

  return (
    <article
      className={`relative flex min-h-[86px] items-center justify-center overflow-hidden rounded-[5.94px] border bg-white px-2 transition duration-200 before:absolute before:left-0 before:top-0 before:h-[2px] before:w-full hover:-translate-y-[3px] hover:shadow-[0_10px_26px_rgba(7,22,44,0.10)] ${accentClasses}`}
    >
      <div className="text-center">
        <div className="mx-auto grid h-[21.79px] w-[21.79px] place-items-center rounded-full bg-[#1F2734] text-secondary-06">
          {children}
        </div>
        <div className="mt-1 font-display text-[12px] font-bold leading-3 text-primary-10">
          {label}
        </div>
      </div>
    </article>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[10.65px] w-[10.65px] fill-secondary-06" aria-hidden="true">
      <path d="M12 1.5 3.5 4.7v6.6c0 4.8 3.4 9 8.5 10.7 5.1-1.7 8.5-5.9 8.5-10.7V4.7L12 1.5Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[10.65px] w-[10.65px] fill-secondary-06" aria-hidden="true">
      <path d="M10.5 2a8.5 8.5 0 1 0 5.05 15.34l4.3 4.3a1.3 1.3 0 0 0 1.85-1.85l-4.3-4.3A8.5 8.5 0 0 0 10.5 2Zm0 3a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[10.65px] w-[10.65px] fill-secondary-06" aria-hidden="true">
      <path d="M13.5 2 4 13.5h6L9.5 22 20 10.5h-6.5L13.5 2Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 14 14" className="h-[14px] w-[14px]" fill="none" aria-hidden="true">
      <path
        d="M1 7h12M8 2.5 12.5 7 8 11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}