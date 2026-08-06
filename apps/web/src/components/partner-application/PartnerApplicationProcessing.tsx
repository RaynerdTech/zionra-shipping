"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import { PartnerApplicationSubmittedView } from "./PartnerApplicationSubmitted";
import type { ApiErrorResponse } from "./types";

const STEPS = [
  "Verifying your identity",
  "Reviewing business documents",
  "Creating your partner account",
  "Finalising onboarding profile",
] as const;

const STEP_TITLES = [
  "Verifying your identity…",
  "Reviewing documents…",
  "Creating your account…",
  "Finalising your profile…",
] as const;

const STEP_TIMINGS = [600, 1800, 3200, 4600] as const;
const STEP_PROGRESS = [22, 48, 74, 100] as const;

type SubmitApplicationResponse = ApiErrorResponse & {
  reference?: string;
  application?: {
    applicationReference?: string | null;
  };
};

export default function PartnerApplicationProcessing() {
  const [activeStep, setActiveStep] = useState(-1);
  const [progress, setProgress] = useState(8);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [submittedReference, setSubmittedReference] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const startedAt = Date.now();

    function preventNavigation(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", preventNavigation);

    STEP_TIMINGS.forEach((timing, index) => {
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setActiveStep(index);
          setProgress(STEP_PROGRESS[index]);
        }, timing),
      );
    });

    async function submit() {
      try {
        const response = await fetch(
          buildApiUrl(routes.api.partnerAuth.submitApplication),
          {
            method: "POST",
            credentials: "include",
          },
        );
        const result = (await response
          .json()
          .catch(() => ({}))) as SubmitApplicationResponse;

        if (!response.ok) {
          throw new Error(
            result.message ?? "Unable to submit your application.",
          );
        }

        const reference =
          result.reference ?? result.application?.applicationReference;

        if (!reference) {
          throw new Error(
            "Application submitted, but its reference could not be loaded.",
          );
        }

        const remaining = Math.max(0, 5800 - (Date.now() - startedAt));
        await new Promise((resolve) => setTimeout(resolve, remaining));
        if (cancelled) return;

        setActiveStep(STEPS.length);
        setProgress(100);
        await new Promise((resolve) => setTimeout(resolve, 400));
        if (cancelled) return;

        window.removeEventListener("beforeunload", preventNavigation);
        window.history.replaceState(
          window.history.state,
          "",
          routes.web.partnerApplicationSubmitted,
        );
        setSubmittedReference(reference);
      } catch (submitError) {
        if (cancelled) return;
        timers.forEach(clearTimeout);
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to submit your application.",
        );
      }
    }

    void submit();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      window.removeEventListener("beforeunload", preventNavigation);
    };
  }, [attempt]);

  function retry() {
    setError("");
    setProgress(8);
    setActiveStep(-1);
    setAttempt((current) => current + 1);
  }

  if (submittedReference) {
    return (
      <PartnerApplicationSubmittedView
        reference={submittedReference}
        showConfetti
        showDashboardAction
      />
    );
  }

  const title =
    activeStep >= 0 && activeStep < STEP_TITLES.length
      ? STEP_TITLES[activeStep]
      : "Processing your application…";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-01 px-4 py-10">
      <span
        aria-hidden="true"
        className="absolute -right-20 top-12 h-52 w-52 rounded-full bg-primary-06/[0.04]"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-secondary-06/[0.04]"
      />

      <section className="relative w-full max-w-[560px] overflow-hidden rounded-[20px] border border-neutral-03/60 bg-white px-6 py-9 md:px-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-16 h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(40,107,220,0.05)_0%,transparent_70%)]"
        />

        <div className="relative z-10">
          <div className="relative mx-auto flex h-[100px] w-[100px] items-center justify-center">
            <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-r-primary-03 border-t-primary-06" />
            <span className="absolute inset-[7px] animate-[spin_2s_linear_infinite_reverse] rounded-full border-2 border-transparent border-b-tertiary-06 border-l-tertiary-03" />
            <span className="relative flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border border-primary-03/50 bg-primary-01">
              <Image
                src="/images/logo-zionra.png"
                alt=""
                width={34}
                height={34}
                className="h-9 w-9 object-contain"
                priority
              />
            </span>
          </div>

          {error ? (
            <div className="mt-6 text-center">
              <h1 className="font-display text-2xl font-semibold text-primary-10">
                Submission could not be completed
              </h1>
              <p className="mt-3 font-sans text-sm leading-6 text-text-body-light">
                {error}
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={retry}
                  className="zion-btn zion-btn-blue zion-btn-md w-full sm:w-auto"
                >
                  Try again
                </button>
                <Link
                  href={routes.web.partnerApplicationReview}
                  className="zion-btn zion-btn-outline-blue zion-btn-md w-full sm:w-auto"
                >
                  Back to review
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="mt-5 text-center font-display text-[22px] font-semibold leading-7 text-primary-10">
                {title}
              </h1>
              <p className="mx-auto mt-2 max-w-[420px] text-center font-sans text-sm leading-6 text-text-body-light">
                We’re verifying your details and setting up your Zionra partner
                account. Please don’t close this window.
              </p>

              <div className="mt-7 h-1.5 w-full overflow-hidden rounded bg-neutral-03">
                <div
                  className="h-full rounded bg-primary-06 transition-[width] duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-5 space-y-3">
                {STEPS.map((label, index) => {
                  const done =
                    index < activeStep || activeStep === STEPS.length;
                  const active = index === activeStep;

                  return (
                    <div key={label} className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-white transition-colors ${
                          done
                            ? "bg-tertiary-09"
                            : active
                              ? "partner-processing-active-step bg-primary-06"
                              : "bg-neutral-03"
                        }`}
                      >
                        {done ? (
                          <span aria-hidden="true">✓</span>
                        ) : active ? (
                          <span
                            aria-hidden="true"
                            className="partner-processing-dot h-1.5 w-1.5 rounded-full bg-white"
                          />
                        ) : index === STEPS.length - 1 ? (
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-white/40"
                          />
                        ) : (
                          <span aria-hidden="true">✓</span>
                        )}
                      </span>
                      <span
                        className={`font-sans text-sm transition-colors ${
                          done
                            ? "text-neutral-10"
                            : active
                              ? "font-semibold text-primary-06"
                              : "text-neutral-03"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-lg border border-secondary-04/40 bg-secondary-01 px-3 py-1.5 text-center font-sans text-xs text-secondary-09">
                ⚠ Please do not close this window or navigate away
              </div>
            </>
          )}
        </div>
      </section>

      <style jsx>{`
        .partner-processing-active-step {
          animation: partner-processing-pulse 1.2s ease-in-out infinite;
        }

        .partner-processing-dot {
          animation: partner-processing-blink 1s ease-in-out infinite;
        }

        @keyframes partner-processing-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(40, 107, 220, 0);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(40, 107, 220, 0.2);
          }
        }

        @keyframes partner-processing-blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .partner-processing-active-step,
          .partner-processing-dot {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}