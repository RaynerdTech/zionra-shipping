"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import {
  ApplicationLoadError,
  ApplicationLoading,
} from "./PartnerApplicationUI";
import { usePartnerApplication } from "./usePartnerApplication";

const NEXT_STEPS = [
  {
    title: "Application review",
    description:
      "Our team reviews your submitted details and documents (2–3 business days).",
  },
  {
    title: "Verification call",
    description:
      "A Zionra partner specialist may contact you to verify your details.",
  },
  {
    title: "Account activation",
    description:
      "Once approved, you’ll receive an email to activate your partner account.",
  },
] as const;

const CONFETTI_COLORS = [
  "#286BDC",
  "#2EC4B6",
  "#FFA630",
  "#124E49",
  "#E8493F",
  "#72A7EC",
] as const;

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  width: number;
  height: number;
  color: string;
  drift: number;
  rotation: number;
  round: boolean;
};

type PartnerApplicationSubmittedViewProps = {
  reference: string;
  showConfetti?: boolean;
  showDashboardAction?: boolean;
};

export function PartnerApplicationSubmittedView({
  reference,
  showConfetti = false,
  showDashboardAction = false,
}: PartnerApplicationSubmittedViewProps) {
  const confetti = useMemo<ConfettiPiece[]>(() => {
    if (!showConfetti) return [];

    return Array.from({ length: 34 }, (_, index): ConfettiPiece => ({
      id: index,
      left: 4 + ((index * 17) % 92),
      delay: (index % 9) * 0.055,
      duration: 1.65 + (index % 7) * 0.11,
      width: 5 + (index % 3) * 2,
      height: 8 + (index % 4) * 2,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      drift: -55 + ((index * 29) % 110),
      rotation: 360 + (index % 5) * 180,
      round: index % 4 === 0,
    }));
  }, [showConfetti]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-01 px-4 py-9">
      <span
        aria-hidden="true"
        className="absolute -right-16 top-0 h-44 w-44 rounded-full bg-tertiary-06/[0.05]"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-primary-06/[0.05]"
      />

      <section className="relative w-full max-w-[560px] overflow-hidden rounded-[20px] border border-neutral-03/60 bg-white px-6 py-8 md:px-10 md:py-10">
        {confetti.length ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[260px] overflow-hidden"
          >
            {confetti.map((piece) => (
              <span
                key={piece.id}
                className="partner-confetti-piece absolute -top-5 block"
                style={
                  {
                    left: `${piece.left}%`,
                    width: `${piece.width}px`,
                    height: `${piece.height}px`,
                    backgroundColor: piece.color,
                    borderRadius: piece.round ? "999px" : "2px",
                    animationDelay: `${piece.delay}s`,
                    animationDuration: `${piece.duration}s`,
                    "--confetti-drift": `${piece.drift}px`,
                    "--confetti-rotation": `${piece.rotation}deg`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        ) : null}

        <div className="mx-auto mt-3 flex h-20 w-20 items-center justify-center rounded-full bg-tertiary-09 text-white">
          <svg
            aria-hidden="true"
            viewBox="0 0 36 36"
            className="h-9 w-9"
            fill="none"
          >
            <path
              d="m7 18 7 7L29 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-center font-display text-[26px] font-bold leading-8 text-primary-10">
          Application Submitted!
        </h1>
        <p className="mx-auto mt-2 max-w-[430px] text-center font-sans text-sm leading-6 text-text-body-light">
          Thank you for applying to become a Zionra Shipping Partner.
        </p>

        <div className="mx-auto mt-6 h-px w-full bg-neutral-02" />

        <h2 className="mt-6 text-center font-display text-base font-bold text-primary-10">
          What happens next?
        </h2>

        <div className="mt-2">
          {NEXT_STEPS.map((step, index) => (
            <div
              key={step.title}
              className="flex gap-3 border-b border-neutral-02 py-4 last:border-b-0"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-02 font-sans text-xs text-neutral-06">
                {index + 1}
              </span>
              <div>
                <h3 className="font-display text-sm font-bold text-primary-10">
                  {step.title}
                </h3>
                <p className="mt-1 font-sans text-xs leading-5 text-text-body-light">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-primary-03 bg-primary-01 px-3 py-2 font-sans text-xs">
          <span className="text-neutral-06">📋 Application reference:</span>
          <span className="font-medium text-primary-06">{reference}</span>
        </div>

        {showDashboardAction ? (
          <div className="mt-7 flex justify-center">
            <Link
              href={routes.web.partnerDashboard}
              className="zion-btn zion-btn-blue zion-btn-md min-w-[190px]"
            >
              Go to Dashboard <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : null}
      </section>

      <style jsx>{`
        .partner-confetti-piece {
          opacity: 0;
          animation-name: partner-confetti-fall;
          animation-timing-function: cubic-bezier(0.18, 0.72, 0.3, 1);
          animation-fill-mode: forwards;
        }

        @keyframes partner-confetti-fall {
          0% {
            opacity: 0;
            transform: translate3d(0, -18px, 0) rotate(0deg);
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--confetti-drift), 250px, 0)
              rotate(var(--confetti-rotation));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .partner-confetti-piece {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

export default function PartnerApplicationSubmitted() {
  const router = useRouter();
  const { data, error, isLoading } = usePartnerApplication();
  const isSubmitted = data?.application.currentStep === "SUBMITTED";
  const isApproved = data?.partner.status === "APPROVED";

  useEffect(() => {
    if (!data) return;
    if (isApproved) {
      router.replace(routes.web.partnerDashboard);
      return;
    }
    if (!isSubmitted) router.replace(routes.web.partnerApplicationReview);
  }, [data, isApproved, isSubmitted, router]);

  if (isLoading || !data) {
    return error ? (
      <ApplicationLoadError message={error} />
    ) : (
      <ApplicationLoading />
    );
  }

  if (isApproved || !isSubmitted || !data.application.applicationReference) {
    return <ApplicationLoading />;
  }

  return (
    <PartnerApplicationSubmittedView
      reference={data.application.applicationReference}
    />
  );
}