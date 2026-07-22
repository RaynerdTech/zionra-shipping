/**
 * Responsibility:
 * Provides the shared responsive page structure for Zionra password recovery.
 * It matches the recovery hierarchy while allowing each step to own its form logic.
 */

"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type AuthRecoveryShellProps = {
  backHref: string;
  backLabel: string;
  title: string;
  description: string;
  children: ReactNode;
  showRightDecoration?: boolean;
};

function BackArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M13.333 8H2.667M6.667 4 2.667 8l4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M3 3l8 8M11 3l-8 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BottomLeftDecoration() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-[-58px] left-[-58px] h-[130px] w-[130px] rounded-full bg-[rgba(255,166,48,0.05)]"
    />
  );
}

function RightDecoration() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-[20%] right-[8%] hidden h-[132px] w-[132px] rounded-full bg-[rgba(40,107,220,0.05)] lg:block"
    >
      <div className="absolute inset-[18px] rounded-full bg-[rgba(40,107,220,0.04)]" />
    </div>
  );
}

export default function AuthRecoveryShell({
  backHref,
  backLabel,
  title,
  description,
  children,
  showRightDecoration = false,
}: AuthRecoveryShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-01 pt-6 md:px-8 md:py-10">
      <BottomLeftDecoration />
      {showRightDecoration ? <RightDecoration /> : null}

      <section className="relative z-10 mx-auto min-h-[calc(100vh-24px)] w-full rounded-t-[24px] bg-white px-6 pb-12 pt-5 md:min-h-0 md:max-w-[920px] md:rounded-none md:bg-transparent md:px-0 md:pb-20 md:pt-0">
        <Link
          href={backHref}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-primary-04 px-3 py-1.5 font-sans text-sm font-normal text-text-body-light no-underline transition-colors hover:bg-primary-01 hover:text-primary-08 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03 md:border-0 md:px-0 md:text-primary-06"
        >
          <span className="md:hidden">
            <CloseIcon />
          </span>
          <span className="hidden md:inline-flex">
            <BackArrowIcon />
          </span>
          <span>{backLabel}</span>
        </Link>

        <header className="mx-auto mt-6 w-full max-w-[560px] text-center md:mt-3">
          <h1 className="font-display text-[28px] font-semibold leading-[38px] tracking-[-0.7px] text-primary-10 md:text-[30px] md:leading-[40px]">
            {title}
          </h1>
          <p className="mt-1 font-sans text-base font-normal leading-6 text-text-body-light">
            {description}
          </p>
          <div className="mx-auto mt-1 h-px w-full max-w-[360px] bg-primary-02" />
        </header>

        <div className="mx-auto mt-7 w-full max-w-[560px]">{children}</div>
      </section>
    </main>
  );
}