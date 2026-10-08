"use client";

import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

import { routes } from "@/config/routes";

import styles from "./HowItWorksContent.module.css";

const heroImage = "/images/how-it-works/hero-collage.jpg";

const steps = [
  {
    title: "Enter shipment details",
    description: "Tell us what you’re sending and where it’s going.",
    bullets: [
      "Pickup & delivery locations",
      "Shipment type & weight",
      "Delivery preferences",
      "Package category selection",
    ],
    pill: "Takes less than 1 minute",
    icon: <DetailsIcon />,
  },
  {
    title: "Compare verified agents",
    description: "Instantly see all agents with transparent pricing.",
    bullets: [
      "Transparent pricing visibility",
      "Delivery timelines",
      "Pickup & delivery coverage",
      "Verified shipping partners",
    ],
    pill: "Multiple agents, one platform",
    icon: <SearchIcon />,
  },
  {
    title: "Book & pay securely",
    description:
      "Confirm your shipment and pay securely through the Zionra platform.",
    bullets: [
      "Secure payment processing",
      "Shipment confirmation",
      "Structured booking flow",
      "Trusted transaction handling",
    ],
    pill: "Safe, secure and simple",
    icon: <PaymentIcon />,
  },
  {
    title: "Track your shipment",
    description:
      "Follow your package in real time, from pickup to final delivery.",
    bullets: [
      "Delivery milestone notifications",
      "Real-time shipment visibility",
      "Shipment status tracking",
      "End-to-end proof of delivery",
    ],
    pill: "We keep you updated",
    icon: <ParcelIcon />,
  },
] as const;

const beforeItems = [
  "Message multiple agents separately",
  "Wait hours or days for replies",
  "Compare prices manually",
  "Unclear shipping costs",
  "Limited shipment visibility",
  "Fragmented communication",
] as const;

const withItems = [
  "Compare shipping options instantly",
  "Transparent structured pricing",
  "Verified shipping partners",
  "Real-time shipment tracking",
  "Secure payments",
  "Centralised support experience",
] as const;

const whyItems = [
  {
    title: "Verified Agents",
    description: "All agents vetted for trust and reliability.",
    tone: styles.whyBlue,
    icon: <ShieldIcon />,
  },
  {
    title: "Transparent Pricing",
    description: "Compare shipping options clearly.",
    tone: styles.whyOrange,
    icon: <PricingIcon />,
  },
  {
    title: "Real-time Tracking",
    description: "Track your shipment progress.",
    tone: styles.whyTeal,
    icon: <LocationIcon />,
  },
  {
    title: "Secure Payments",
    description: "Your payments and data protected.",
    tone: styles.whyBlue,
    icon: <ShieldIcon />,
  },
  {
    title: "Customer Support",
    description: "We’re here whenever you need us.",
    tone: styles.whyTeal,
    icon: <SupportIcon />,
  },
] as const;

export default function HowItWorksContent() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const revealNodes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-hiw-reveal]"),
    ).filter((node) => !node.hasAttribute("data-hiw-defer"));

    const showAllReveals = () => {
      revealNodes.forEach((node) => node.classList.add(styles.visible));
    };

    let revealObserver: IntersectionObserver | null = null;

    if (motionPreference.matches) {
      showAllReveals();
    } else {
      revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            (entry.target as HTMLElement).classList.add(styles.visible);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );

      revealNodes.forEach((node) => revealObserver?.observe(node));
    }

    const stepsRail = root.querySelector<HTMLElement>("[data-steps-rail]");
    let railObserver: IntersectionObserver | null = null;

    if (stepsRail) {
      if (motionPreference.matches) {
        stepsRail.classList.add(styles.railVisible);
        stepsRail
          .querySelectorAll<HTMLElement>("[data-hiw-defer]")
          .forEach((node) => node.classList.add(styles.visible));
      } else {
        railObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              stepsRail.classList.add(styles.railVisible);
              stepsRail
                .querySelectorAll<HTMLElement>("[data-hiw-defer]")
                .forEach((node) => node.classList.add(styles.visible));
              observer.unobserve(entry.target);
            });
          },
          { threshold: 0.25 },
        );
        railObserver.observe(stepsRail);
      }
    }

    const difference = root.querySelector<HTMLElement>("[data-difference]");
    let differenceObserver: IntersectionObserver | null = null;

    if (difference) {
      if (motionPreference.matches) {
        difference.classList.add(styles.differenceVisible);
      } else {
        differenceObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              difference.classList.add(styles.differenceVisible);
              observer.unobserve(entry.target);
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
        );
        differenceObserver.observe(difference);
      }
    }

    const scrollBlobs = [
      {
        element: root.querySelector<HTMLElement>("[data-steps-blob]"),
        section: root.querySelector<HTMLElement>("[data-steps-section]"),
        axis: "Y" as const,
        from: -140,
      },
      {
        element: root.querySelector<HTMLElement>("[data-difference-blob]"),
        section: root.querySelector<HTMLElement>("[data-difference]"),
        axis: "Y" as const,
        from: -140,
      },
      {
        element: root.querySelector<HTMLElement>("[data-difference-red]"),
        section: root.querySelector<HTMLElement>("[data-difference]"),
        axis: "X" as const,
        from: -120,
      },
      {
        element: root.querySelector<HTMLElement>("[data-difference-teal]"),
        section: root.querySelector<HTMLElement>("[data-difference]"),
        axis: "X" as const,
        from: 120,
      },
      {
        element: root.querySelector<HTMLElement>("[data-why-blob]"),
        section: root.querySelector<HTMLElement>("[data-why-section]"),
        axis: "Y" as const,
        from: -140,
      },
    ].filter(
      (
        item,
      ): item is {
        element: HTMLElement;
        section: HTMLElement;
        axis: "X" | "Y";
        from: number;
      } => Boolean(item.element && item.section),
    );

    let animationFrame = 0;

    const updateScrollBlobs = () => {
      animationFrame = 0;

      if (motionPreference.matches) {
        scrollBlobs.forEach(({ element }) => {
          element.style.transform = "none";
        });
        return;
      }

      const viewportHeight = window.innerHeight;
      const start = viewportHeight;
      const end = viewportHeight * 0.2;

      scrollBlobs.forEach(({ element, section, axis, from }) => {
        let progress =
          (start - section.getBoundingClientRect().top) / (start - end);
        progress = Math.max(0, Math.min(1, progress));
        const amount = (1 - progress) * from;
        element.style.transform = `translate${axis}(${amount}%)`;
      });
    };

    const scheduleScrollUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateScrollBlobs);
    };

    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    window.addEventListener("resize", scheduleScrollUpdate);
    motionPreference.addEventListener("change", updateScrollBlobs);
    updateScrollBlobs();

    return () => {
      revealObserver?.disconnect();
      railObserver?.disconnect();
      differenceObserver?.disconnect();
      window.removeEventListener("scroll", scheduleScrollUpdate);
      window.removeEventListener("resize", scheduleScrollUpdate);
      motionPreference.removeEventListener("change", updateScrollBlobs);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.page}>
      <Hero />
      <Steps />
      <Difference />
      <WhyZionra />
    </div>
  );
}

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="how-it-works-title">
      <div className={styles.heroDots} aria-hidden="true" />

      <div className={styles.heroCopy}>
        <Reveal className={styles.eyebrow}>HOW IT WORKS</Reveal>

        <Reveal variant="blur" delay={90}>
          <h1 id="how-it-works-title" className={styles.heroTitle}>
            Smarter Cross Boarder
            <br />
            <span className={styles.heroTitleAccent}>Shipping Starts Here.</span>
          </h1>
        </Reveal>

        <Reveal delay={180}>
          <p className={styles.heroSub}>
            Compare verified shipping agents, access transparent pricing, make
            secure payments, track shipments in real-time — all in one platform.
          </p>
        </Reveal>

        <Reveal delay={270}>
          <div className={styles.heroCtas}>
            <Link
              href={routes.web.homeQuote}
              className={`${styles.heroButton} ${styles.heroPrimary}`}
            >
              Get a quote
            </Link>
            <Link
              href={routes.web.homeTrack}
              className={`${styles.heroButton} ${styles.heroOutline}`}
            >
              Track Shipment
            </Link>
          </div>
        </Reveal>
      </div>

      <Reveal variant="scale" delay={100} className={styles.collage}>
        <Image
          src={heroImage}
          alt="Zionra shipping partner beside stacked parcels"
          fill
          priority
          sizes="(max-width: 767px) calc(100vw - 76px), (max-width: 1279px) 516px, 516px"
          className={styles.collageImage}
        />
      </Reveal>
    </section>
  );
}

function Steps() {
  const numberLeft = [128, 452, 776, 1100];
  const lineLeft = [151.5, 474, 798, 1122];
  const lineTop = [73, 75, 68, 68];

  return (
    <section
      data-steps-section
      className={styles.stepsSection}
      aria-labelledby="steps-title"
    >
      <div className={styles.stepsWrap}>
        <div data-steps-blob className={styles.stepsBlob} aria-hidden="true" />

        <div className={styles.stepsHead}>
          <Reveal className={styles.eyebrow}>4 SIMPLE STEPS</Reveal>
          <Reveal delay={90}>
            <h2 id="steps-title" className={styles.sectionTitle}>
              How Zionra Works
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className={styles.sectionSub}>
              From quote comparison to delivery tracking — everything in one
              place
            </p>
          </Reveal>
        </div>

        <div data-steps-rail className={styles.stepsRail}>
          <div className={styles.routeLine} aria-hidden="true" />

          {numberLeft.map((left, index) => (
            <div
              key={`num-${index}`}
              className={styles.num}
              style={{ left, transitionDelay: `${350 + index * 90}ms` }}
              aria-hidden="true"
            >
              {index + 1}
            </div>
          ))}

          {lineLeft.map((left, index) => (
            <div
              key={`line-${index}`}
              className={styles.vline}
              style={{
                left,
                top: lineTop[index],
                transitionDelay: `${500 + index * 90}ms`,
              }}
              aria-hidden="true"
            />
          ))}

          {steps.map((step, index) => (
            <Reveal
              key={step.title}
              variant="slideOut"
              defer
              delay={700 + index * 90}
            >
              <StepCard step={step} number={index + 1} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  number,
}: {
  step: (typeof steps)[number];
  number: number;
}) {
  return (
    <article className={styles.stepCard}>
      <span className={styles.mobileNum} aria-hidden="true">
        {number}
      </span>
      <div className={styles.iconWrap} aria-hidden="true">
        {step.icon}
      </div>
      <div className={styles.textBlock}>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
        <div className={styles.divider} aria-hidden="true" />
      </div>
      <div className={styles.bullets}>
        {step.bullets.map((bullet) => (
          <div key={bullet} className={styles.bulletRow}>
            <span className={styles.bulletDot} aria-hidden="true" />
            <span className={styles.bulletText}>{bullet}</span>
          </div>
        ))}
      </div>
      <div className={styles.pill}>{step.pill}</div>
    </article>
  );
}

function Difference() {
  return (
    <div className={styles.differenceOuter}>
      <section
        data-difference
        className={styles.difference}
        aria-labelledby="difference-title"
      >
        <div
          className={`${styles.rule} ${styles.ruleLeft} ${styles.ruleTop}`}
          aria-hidden="true"
        />
        <div
          className={`${styles.rule} ${styles.ruleRight} ${styles.ruleTop}`}
          aria-hidden="true"
        />
        <div
          className={`${styles.rule} ${styles.ruleLeft} ${styles.ruleBottom}`}
          aria-hidden="true"
        />
        <div
          className={`${styles.rule} ${styles.ruleRight} ${styles.ruleBottom}`}
          aria-hidden="true"
        />

        <div
          data-difference-red
          className={styles.redEllipse}
          aria-hidden="true"
        />
        <div
          data-difference-teal
          className={styles.tealEllipse}
          aria-hidden="true"
        />
        <div className={styles.ring1} aria-hidden="true" />
        <div className={styles.ring2} aria-hidden="true" />
        <DifferenceAccents />
        <div
          data-difference-blob
          className={styles.differenceBlob}
          aria-hidden="true"
        />

        <div className={styles.differenceHead}>
          <Reveal className={styles.eyebrow}>THE ZIONRA DIFFERENCE</Reveal>
          <Reveal delay={90}>
            <h2 id="difference-title" className={styles.sectionTitle}>
              Before Zionra vs. With Zionra
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className={styles.sectionSub}>Where we make a difference</p>
          </Reveal>
        </div>

        <Reveal
          variant="slideRight"
          className={`${styles.compareCard} ${styles.before}`}
        >
          <ComparisonCard title="Before Zionra" items={beforeItems} good={false} />
        </Reveal>

        <Reveal variant="scale" delay={90} className={styles.vs}>
          <div className={styles.vsRing} aria-hidden="true" />
          <div className={styles.vsCore}>VS</div>
        </Reveal>

        <Reveal
          variant="slideLeft"
          delay={180}
          className={`${styles.compareCard} ${styles.with}`}
        >
          <ComparisonCard title="With Zionra" items={withItems} good />
        </Reveal>

        <Reveal delay={270} className={styles.tracker}>
          <TrackingStrip />
        </Reveal>
      </section>
    </div>
  );
}

function ComparisonCard({
  title,
  items,
  good,
}: {
  title: string;
  items: readonly string[];
  good: boolean;
}) {
  return (
    <div className={styles.compareInner}>
      <h3>{title}</h3>
      <ul className={styles.compareList}>
        {items.map((item) => (
          <li key={item} className={styles.compareItem}>
            <span className={styles.compareIcon} aria-hidden="true">
              {good ? <CheckIcon /> : <CrossIcon />}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrackingStrip() {
  const points = [
    { left: "7.20%", labelLeft: "10.29%", label: "Picked up", on: true },
    { left: "35.73%", labelLeft: "38.82%", label: "In transit", on: true },
    {
      left: "64.27%",
      labelLeft: "67.35%",
      label: "Out for delivery",
      on: true,
    },
    { left: "92.80%", labelLeft: "95.88%", label: "Delivered", on: false },
  ];

  return (
    <>
      <div className={styles.trackerTitle}>Your shipment · ZNR-20480</div>
      <div className={styles.trackerStatus}>In Transit</div>
      <div className={styles.trackerEta}>Arriving in 2 days</div>
      <div className={styles.trackerRail} aria-hidden="true" />
      <div className={styles.trackerFill} aria-hidden="true" />
      {points.map((point) => (
        <span key={point.label}>
          <span
            className={`${styles.trackerDot} ${point.on ? styles.trackerDotOn : ""}`}
            style={{ left: point.left }}
            aria-hidden="true"
          />
          <span
            className={styles.trackerLabel}
            style={{ left: point.labelLeft }}
          >
            {point.label}
          </span>
        </span>
      ))}
    </>
  );
}

function WhyZionra() {
  return (
    <div className={styles.whyOuter}>
      <section
        data-why-section
        className={styles.why}
        aria-labelledby="why-zionra-title"
      >
        <div className={styles.whyInner}>
          <div className={styles.whyStack}>
            <div className={styles.whyHead}>
              <Reveal className={styles.eyebrow}>WHY CHOOSE US</Reveal>
              <Reveal delay={90}>
                <h2 id="why-zionra-title" className={styles.sectionTitle}>
                  Why use Zionra?
                </h2>
              </Reveal>
            </div>

            <div className={styles.whyGrid}>
              {whyItems.map((item, index) => (
                <Reveal key={item.title} delay={index * 90}>
                  <article className={`${styles.whyItem} ${item.tone}`}>
                    <span className={styles.whyIcon} aria-hidden="true">
                      {item.icon}
                    </span>
                    <div className={styles.whyText}>
                      <b>{item.title}</b>
                      <span>{item.description}</span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <div data-why-blob className={styles.whyBlob} aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "fadeUp",
  defer = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fadeUp" | "blur" | "scale" | "slideRight" | "slideLeft" | "slideOut";
  defer?: boolean;
}) {
  const variantClass = {
    fadeUp: styles.fadeUp,
    blur: styles.blurUp,
    scale: styles.scale,
    slideRight: styles.slideRight,
    slideLeft: styles.slideLeft,
    slideOut: styles.slideOut,
  }[variant];

  return (
    <div
      data-hiw-reveal
      {...(defer ? { "data-hiw-defer": "" } : {})}
      className={`${styles.reveal} ${variantClass} ${className}`}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function DifferenceAccents() {
  return (
    <div aria-hidden="true">
      <span
        style={{
          position: "absolute",
          left: 1270,
          top: 228,
          width: 8,
          height: 8,
          borderRadius: 2,
          background: "rgba(46,196,182,.08)",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 160,
          top: 252,
          width: 8,
          height: 8,
          borderRadius: 2,
          background: "rgba(255,166,48,.08)",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 1320,
          top: 530,
          width: 10,
          height: 10,
          borderRadius: 2,
          background: "rgba(40,107,220,.10)",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 1380,
          top: 550,
          width: 16,
          height: 16,
          borderRadius: 2,
          background: "rgba(255,166,48,.10)",
        }}
      />
    </div>
  );
}

function DetailsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M8 9h8M8 13h5" />
      <circle cx="18.5" cy="5.5" r="2.5" fill="#fff" stroke="none" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5 21 21" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M2.5 9.5h19M6 15h4" />
    </svg>
  );
}

function ParcelIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 3 7.2v9.6l9 4.7 9-4.7V7.2L12 2.5Z" />
      <path d="M3 7.2 12 12l9-4.8M12 12v9.5M7.5 4.8l9 4.7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 8 8" aria-hidden="true">
      <path d="M1 1l6 6M7 1l-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 8 8" aria-hidden="true">
      <path d="M1 4.2l2 2 4-4.4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.2 3.9 4.2c-.9.3-1.5 1.2-1.5 2.2v6.1c0 4.5 3 8.5 7.4 9.9l1.5.5c.5.1 1 .1 1.4 0l1.5-.5c4.4-1.4 7.4-5.4 7.4-9.9V6.4c0-1-.6-1.9-1.5-2.2l-8.1-3a1 1 0 0 0-.7 0Z" />
    </svg>
  );
}

function PricingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.3 1.8h17.4c1.1 0 2 .9 2 2v11.5c0 1.1-.9 2-2 2H3.3c-1.1 0-2-.9-2-2V3.8c0-1.1.9-2 2-2Zm8.7 4a3.7 3.7 0 1 0 0 7.5 3.7 3.7 0 0 0 0-7.5Z" />
      <path d="M5.5 17.8h13c.7 0 1.3.6 1.3 1.3s-.6 1.2-1.3 1.2h-13c-.7 0-1.2-.5-1.2-1.2s.5-1.3 1.2-1.3Z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.3a8.8 8.8 0 0 0-8.8 8.8c0 3.4 2 6.7 4 9a30 30 0 0 0 4.1 4c.4.3 1 .3 1.4 0a30 30 0 0 0 4.1-4c2-2.3 4-5.6 4-9A8.8 8.8 0 0 0 12 1.3Zm0 11.7a3 3 0 1 1 0-6.1 3 3 0 0 1 0 6.1Z" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1C5.9 1 1 5.9 1 12v5h2.6v-5A8.4 8.4 0 0 1 12 3.6 8.4 8.4 0 0 1 20.4 12v5H23v-5c0-6.1-4.9-11-11-11Z" />
      <path d="M1 11.2h4.5c.8 0 1.5.7 1.5 1.5v5.7c0 .8-.7 1.5-1.5 1.5H1V11.2Z" />
      <path d="M23 11.2h-4.5c-.8 0-1.5.7-1.5 1.5v5.7c0 .8.7 1.5 1.5 1.5H23V11.2Z" />
      <rect x="8" y="20" width="8" height="3" rx="1.5" />
    </svg>
  );
}
