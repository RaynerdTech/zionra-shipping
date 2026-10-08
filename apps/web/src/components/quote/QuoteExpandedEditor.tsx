"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  QUOTE_COLLECTION_OPTIONS,
  QUOTE_DELIVERY_OPTIONS,
  QUOTE_ITEM_OPTIONS,
  quoteItemLabel,
  type QuoteDraft,
} from "@/lib/quoteFlow";
import QuoteLocationInput from "./QuoteLocationInput";

const UK_FLAG = "/images/United-Kingdom.svg";
const NG_FLAG = "/images/Nigeria.svg";

type Tone = "light" | "dark";

function RequiredMark() {
  return <span className="text-error-bright">*</span>;
}

function MultiItemFilter({ values, onChange, tone = "light", required = false }: { values: string[]; onChange: (values: string[]) => void; tone?: Tone; required?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function outside(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className={`mb-2 block text-[13px] leading-[20px] ${tone === "dark" ? "text-neutral-01" : "text-neutral-10"}`}>
        What are you sending?{required ? <RequiredMark /> : null}
      </label>
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex min-h-[48px] w-full flex-wrap items-center gap-1 rounded-[10px] border-[1.5px] border-neutral-03 bg-white px-2.5 py-2 text-left focus:border-primary-06 focus:outline-none">
        {values.length ? values.map((value) => <span key={value} className="inline-flex items-center gap-1 rounded-[5px] bg-primary-01 px-2 py-1 text-[11px] text-neutral-09">{quoteItemLabel(value)}<span aria-hidden="true">×</span></span>) : <span className="text-[13px] text-neutral-05">e.g Letters, Furniture etc</span>}
        <span className="ml-auto grid h-7 w-7 place-items-center rounded-full bg-primary-01 text-primary-10"><svg className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span>
      </button>
      {open ? <div className="absolute inset-x-0 top-[76px] z-[80] max-h-64 overflow-y-auto rounded-[10px] border border-neutral-03 bg-white p-1 shadow-[0_14px_34px_rgba(7,22,44,0.14)]">{QUOTE_ITEM_OPTIONS.map((option) => { const selected = values.includes(option.value); return <button key={option.value} type="button" onClick={() => onChange(selected ? values.filter((item) => item !== option.value) : [...values, option.value])} className={`flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-[12px] ${selected ? "bg-primary-01 text-primary-08" : "text-neutral-10 hover:bg-neutral-01"}`}><span>{option.label}</span><span className={`grid h-4 w-4 place-items-center rounded border ${selected ? "border-primary-06 bg-primary-06 text-white" : "border-neutral-03"}`}>{selected ? "✓" : ""}</span></button>; })}</div> : null}
      <p className={`mt-1.5 text-[11px] ${tone === "dark" ? "text-neutral-03" : "text-primary-06"}`}>Select item type</p>
    </div>
  );
}

function SelectField({ label, value, options, onChange, tone = "light", required = false }: { label: string; value: string; options: readonly { value: string; label: string }[]; onChange: (value: string) => void; tone?: Tone; required?: boolean }) {
  return (
    <div>
      <label className={`mb-2 block text-[13px] leading-[20px] ${tone === "dark" ? "text-neutral-01" : "text-neutral-10"}`}>{label}{required ? <RequiredMark /> : null}</label>
      <div className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="zion-input h-[48px] appearance-none bg-white pr-10 text-[13px]"><option value="">Select an option</option>{options.map((option) => <option key={`${label}-${option.value || "any"}`} value={option.value}>{option.label}</option>)}</select>
        <span className="pointer-events-none absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-primary-01 text-primary-10"><svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span>
      </div>
    </div>
  );
}

export default function QuoteExpandedEditor({ draft, onChange, canSubmit, onSubmit }: { draft: QuoteDraft; onChange: (draft: QuoteDraft) => void; canSubmit: boolean; onSubmit: () => void }) {
  const update = <K extends keyof QuoteDraft>(key: K, value: QuoteDraft[K]) => onChange({ ...draft, [key]: value });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSubmit) onSubmit();
  }

  return (
    <form onSubmit={submit} className="bg-primary-10 text-white">
      <div className="mx-auto w-full max-w-[1272px] px-4 py-8 sm:px-6 lg:py-9 xl:px-0">
        <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          <QuoteLocationInput required tone="dark" label="From" helper="Enter postcode" placeholder="e.g Cr0 12t" countryCode="GB" flagSrc={UK_FLAG} value={draft.from} onChange={(value) => update("from", value)} />
          <QuoteLocationInput required tone="dark" label="To" helper="Enter delivery location" placeholder="Enter full address" countryCode="NG" flagSrc={NG_FLAG} value={draft.to} onChange={(value) => update("to", value)} />
          <MultiItemFilter required tone="dark" values={draft.itemTypes} onChange={(value) => update("itemTypes", value)} />
          <div>
            <label className="mb-2 block text-[13px] leading-[20px] text-neutral-01">Kg<RequiredMark /></label>
            <input type="number" min="0" step="0.1" value={draft.weightKg} onChange={(event) => update("weightKg", event.target.value)} className="zion-input h-[48px] bg-white text-[13px]" placeholder="0" />
            <p className="mt-1.5 text-[11px] text-neutral-03">Enter package weight</p>
          </div>

          <div><label className="mb-2 block text-[13px] leading-[20px] text-neutral-01">Length</label><input type="number" min="0" value={draft.lengthCm} onChange={(event) => update("lengthCm", event.target.value)} className="zion-input h-[48px] bg-white text-[13px]" placeholder="Item length" /></div>
          <div><label className="mb-2 block text-[13px] leading-[20px] text-neutral-01">Width</label><input type="number" min="0" value={draft.widthCm} onChange={(event) => update("widthCm", event.target.value)} className="zion-input h-[48px] bg-white text-[13px]" placeholder="Item width" /></div>
          <SelectField tone="dark" label="Delivery Method" value={draft.deliveryMode} options={QUOTE_DELIVERY_OPTIONS} onChange={(value) => update("deliveryMode", value)} />
          <SelectField required tone="dark" label="Collection method" value={draft.collectionMode} options={QUOTE_COLLECTION_OPTIONS} onChange={(value) => update("collectionMode", value)} />
        </div>

        <div className="mt-12 flex justify-center pb-2">
          <button type="submit" disabled={!canSubmit} className="zion-btn zion-btn-blue min-h-[52px] w-[190px] text-[15px] disabled:cursor-not-allowed disabled:opacity-50">Get a quote</button>
        </div>
      </div>
    </form>
  );
}
