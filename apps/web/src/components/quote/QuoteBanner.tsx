"use client";

import { useState } from "react";

import type { QuoteDraft } from "@/lib/quoteFlow";
import QuoteExpandedEditor from "./QuoteExpandedEditor";
import QuoteSummaryBar from "./QuoteSummaryBar";

type Props = {
  draft: QuoteDraft;
  onDraftChange: (draft: QuoteDraft) => void;
  onSubmit?: () => void;
};

export default function QuoteBanner({ draft, onDraftChange, onSubmit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const canSubmit = Boolean(
    draft.from?.city
      && draft.to
      && draft.itemTypes.length
      && draft.collectionMode
      && Number(draft.weightKg) > 0,
  );

  function submit() {
    if (!canSubmit) return;
    setExpanded(false);
    onSubmit?.();
  }

  return (
    <>
      <QuoteSummaryBar draft={draft} expanded={expanded} onToggle={() => setExpanded((current) => !current)} />
      <div
        id="quote-editor-panel"
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${expanded ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <QuoteExpandedEditor draft={draft} onChange={onDraftChange} canSubmit={canSubmit} onSubmit={submit} />
        </div>
      </div>
    </>
  );
}
