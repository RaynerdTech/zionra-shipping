"use client";

import type { QuoteDraft } from "@/lib/quoteFlow";

function CalculatorIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8h10M8 12h2m4 0h2m-8 4h2m4 0h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  draft: QuoteDraft;
  expanded?: boolean;
  onToggle?: () => void;
};

export default function QuoteSummaryBar({ draft, expanded = false, onToggle }: Props) {
  const route = draft.from && draft.to
    ? `${draft.from.city || draft.from.primary} → ${draft.to.city || draft.to.primary}`
    : "Complete your shipment details";

  return (
    <section className="bg-primary-08 text-white">
      <div className="relative mx-auto flex min-h-[66px] w-full max-w-[1272px] items-center justify-center px-16 py-3 sm:px-20">
        <div className="flex items-center gap-2.5">
          <span className="text-neutral-01"><CalculatorIcon /></span>
          <div>
            <p className="font-sans text-[14px] font-semibold leading-[20px] sm:text-[15px]">Get an estimated quote</p>
            <p className="mt-2 max-w-[62vw] truncate font-sans text-[11px] leading-[16px] text-primary-02 sm:max-w-none">{route}</p>
          </div>
        </div>

        {onToggle ? (
          <button
            type="button"
            aria-label={expanded ? "Collapse quote form" : "Expand quote form"}
            aria-expanded={expanded}
            aria-controls="quote-editor-panel"
            onClick={onToggle}
            className="absolute right-4 grid h-11 w-11 place-items-center rounded-full bg-primary-01 text-primary-10 transition-colors hover:bg-primary-02 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-6"
          >
            <svg className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none">
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
      </div>
    </section>
  );
}
