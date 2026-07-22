/**
 * Responsibility:
 * Provides the shared responsive shell for Zionra password-recovery pages.
 * It renders the brand, navigation, decorative circles, card structure,
 * and security notice while leaving each recovery form responsible for its logic.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthRecoveryShellProps = {
  backHref: string;
  backLabel: string;
  title: string;
  description: string;
  children: ReactNode;
};

function BackArrowIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M19 12H5M11 18L5 12L11 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DecorativeCircles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-6px] top-[-34px] z-0 h-[136px] w-[136px] md:h-[240px] md:w-[240px]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-[-20px] top-0 h-[136px] w-[136px] md:h-[240px] md:w-[240px]"
        viewBox="0 0 220 160"
        fill="none"
      >
        <circle cx="120" cy="40" r="120" fill="#286BDC" fillOpacity="0.05" />
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-[-6px] top-[-6px] h-[95.2px] w-[95.2px] md:right-0 md:top-0 md:h-[150px] md:w-[150px]"
        viewBox="0 0 150 150"
        fill="none"
      >
        <circle cx="75" cy="75" r="75" fill="#286BDC" fillOpacity="0.04" />
      </svg>
    </div>
  );
}

export default function AuthRecoveryShell({
  backHref,
  backLabel,
  title,
  description,
  children,
}: AuthRecoveryShellProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-neutral-01 px-4 py-4 md:flex md:items-center md:justify-center md:px-8 md:py-10">
      <DecorativeCircles />

      <section className="relative z-10 mx-auto w-full max-w-[560px] overflow-hidden rounded-[20px] bg-white px-6 pb-7 pt-5 shadow-[0_4px_24px_rgba(7,22,44,0.08)] md:px-12 md:pb-10 md:pt-8">
        <Link
          href={backHref}
          className="inline-flex min-h-9 w-fit items-center gap-2 rounded-md px-2 py-1 font-sans text-base font-normal leading-6 text-primary-06 no-underline transition-colors duration-[180ms] hover:bg-primary-01 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03"
        >
          <BackArrowIcon />
          <span>{backLabel}</span>
        </Link>

        <div className="mx-auto mt-5 flex w-fit items-center gap-2 md:mt-2">
          <Image
            src="/images/logo-zionra.png"
            alt=""
            width={30}
            height={30}
            className="h-[30px] w-[30px] object-contain"
            priority
          />
          <span className="font-display text-[24px] font-bold tracking-[-0.5px] text-primary-10">
            zionra
          </span>
        </div>

        <header className="mx-auto mt-6 max-w-[430px] text-center">
          <h1 className="font-display text-[28px] font-semibold leading-[38px] tracking-[-0.7px] text-neutral-10 md:text-[32px] md:leading-[44px] md:tracking-[-1px]">
            {title}
          </h1>
          <p className="mt-2 font-sans text-sm font-normal leading-[22px] text-text-body-light md:text-base md:leading-[26px]">
            {description}
          </p>
          <div className="mx-auto mt-4 h-px w-full max-w-[400px] bg-neutral-03" />
        </header>

        <div className="mx-auto mt-6 w-full max-w-[400px]">{children}</div>

        <div className="mx-auto mt-8 max-w-[400px] rounded-xl border border-primary-02 bg-primary-01 px-4 py-3 text-center font-sans text-xs font-normal leading-[18px] text-primary-04">
          Your data is protected with industry-standard security.
        </div>
      </section>
    </main>
  );
}
