"use client";

import { useEffect, useState } from "react";

import { QuoteForm } from "@/components/sections/quote";
import {
  EMPTY_QUOTE_DRAFT,
  readQuoteDraft,
  type QuoteDraft,
} from "@/lib/quoteFlow";

function CalculatorIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8h10M8 12h2m4 0h2m-8 4h2m4 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function DedicatedQuotePage() {
  const [draft, setDraft] = useState<QuoteDraft>(EMPTY_QUOTE_DRAFT);

  useEffect(() => {
    setDraft(readQuoteDraft());
  }, []);

  const routeLabel = draft.from && draft.to
    ? `${draft.from.city || draft.from.primary} → ${draft.to.city || draft.to.primary}`
    : "Enter your shipment details";

  return (
    <main className="bg-white pt-[15px] font-sans">
      <section className="bg-primary-08 text-white">
        <div className="mx-auto flex min-h-[64px] w-full max-w-[1272px] items-center justify-center px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="text-neutral-01">
              <CalculatorIcon />
            </span>
            <div>
              <h1 className="text-[14px] font-semibold leading-[20px] sm:text-[15px]">
                Get an estimated quote
              </h1>
              <p className="mt-2 max-w-[72vw] truncate text-[11px] leading-[16px] text-primary-02 sm:max-w-none">
                {routeLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-10">
        <div className="mx-auto min-h-[500px] w-full max-w-[1272px] px-0 sm:px-2 lg:px-6 xl:px-0">
          <QuoteForm variant="dedicated" onDraftChange={setDraft} />
        </div>
      </section>
    </main>
  );
}
