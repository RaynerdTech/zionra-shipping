"use client";

import type { QuoteDraft } from "@/lib/quoteFlow";

function CalculatorIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 lg:h-5 lg:w-5" viewBox="0 0 24 24" fill="none">
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
    <section className="rounded-b-[10px] bg-primary-08 text-white lg:rounded-none">
      <div className="relative mx-auto flex min-h-[60px] w-full max-w-[1272px] items-center justify-start px-5 py-2.5 sm:px-6 lg:min-h-[66px] lg:justify-center lg:px-20 lg:py-3">
        <div className="flex items-center gap-2 lg:gap-2.5">
          <span className="text-neutral-01"><CalculatorIcon /></span>
          <div>
            <p className="font-sans text-[13px] font-semibold leading-[17px] lg:text-[15px] lg:leading-[20px]">Get an estimated quote</p>
            <p className="mt-1 max-w-[70vw] truncate font-sans text-[9px] leading-[13px] text-primary-02 lg:mt-2 lg:max-w-none lg:text-[11px] lg:leading-[16px]">{route}</p>
          </div>
        </div>

        {onToggle ? (
          <button
            type="button"
            aria-label={expanded ? "Collapse quote form" : "Expand quote form"}
            aria-expanded={expanded}
            aria-controls="quote-editor-panel"
            onClick={onToggle}
            className="absolute right-5 grid h-9 w-9 place-items-center rounded-full bg-transparent text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-5 lg:right-6 lg:h-11 lg:w-11 lg:bg-primary-01 lg:text-primary-10 lg:hover:bg-primary-02"
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
