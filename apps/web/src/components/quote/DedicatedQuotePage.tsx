"use client";

import { useEffect, useState } from "react";

import { QuoteForm } from "@/components/sections/quote";
import {
  EMPTY_QUOTE_DRAFT,
  readQuoteDraft,
  type QuoteDraft,
} from "@/lib/quoteFlow";
import QuoteSummaryBar from "./QuoteSummaryBar";

export default function DedicatedQuotePage() {
  const [draft, setDraft] = useState<QuoteDraft>(EMPTY_QUOTE_DRAFT);

  useEffect(() => {
    setDraft(readQuoteDraft());
  }, []);

  return (
    <main className="bg-white pt-[15px] font-sans">
      <QuoteSummaryBar draft={draft} />

      <section className="bg-primary-10">
        <div className="mx-auto min-h-[500px] w-full max-w-[1272px] px-0 sm:px-2 lg:px-6 xl:px-0">
          <QuoteForm variant="dedicated" onDraftChange={setDraft} />
        </div>
      </section>
    </main>
  );
}
