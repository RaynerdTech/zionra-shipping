/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import {
  EMPTY_QUOTE_DRAFT,
  QUOTE_COLLECTION_OPTIONS,
  QUOTE_DELIVERY_OPTIONS,
  QUOTE_ITEM_OPTIONS,
  QUOTE_SHIPPING_METHOD_OPTIONS,
  quoteItemLabel,
  readQuoteDraft,
  type QuoteDraft,
  writeQuoteDraft,
  writeSelectedQuoteAgent,
} from "@/lib/quoteFlow";
import AgentProfileModal from "./AgentProfileModal";
import QuoteLocationInput from "./QuoteLocationInput";
import QuoteSummaryBar from "./QuoteSummaryBar";
import type { QuoteAgentSummary, QuoteAgentsResponse } from "./types";

type SortMode = "best" | "price" | "fastest" | "rating";
type Tone = "light" | "dark";

const UK_FLAG = "/images/United-Kingdom.svg";
const NG_FLAG = "/images/Nigeria.svg";

const SORT_OPTIONS: readonly [SortMode, string][] = [
  ["best", "Best match"],
  ["price", "Lowest price"],
  ["fastest", "Fastest"],
  ["rating", "Highest rated"],
];

const AGENT_RESULTS_CACHE_KEY = "zionra.quote-agent-results.v1";

type AgentResultsCache = {
  queryKey: string;
  response: QuoteAgentsResponse;
};

function buildAgentQuery(draft: QuoteDraft) {
  const params = new URLSearchParams({
    pickupCity: draft.from?.city ?? "",
    pickupLabel: draft.from?.label ?? "",
    itemTypes: draft.itemTypes.join(","),
    collectionMode: draft.collectionMode,
    deliveryMode: draft.deliveryMode,
  });
  if (draft.weightKg) params.set("weightKg", draft.weightKg);
  if (draft.lengthCm) params.set("lengthCm", draft.lengthCm);
  if (draft.widthCm) params.set("widthCm", draft.widthCm);
  if (draft.shippingMethod) params.set("shippingMethod", draft.shippingMethod);
  return params.toString();
}

function readAgentResultsCache(): AgentResultsCache | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(AGENT_RESULTS_CACHE_KEY);
    return value ? JSON.parse(value) as AgentResultsCache : null;
  } catch {
    return null;
  }
}

function writeAgentResultsCache(cache: AgentResultsCache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AGENT_RESULTS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Cache failure should not block quote comparison.
  }
}

function formatMoney(value: number | null) {
  if (value === null) return "Quote required";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-neutral-03 bg-neutral-02/60 px-2.5 py-1 font-sans text-[10px] leading-[14px] text-neutral-09">{children}</span>;
}

function AgentLogo({ agent }: { agent: QuoteAgentSummary }) {
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-01">
      {agent.logoUrl ? <img src={agent.logoUrl} alt={`${agent.companyName} logo`} className="h-full w-full object-cover" /> : <img src="/images/logo-zionra.png" alt="" className="h-7 w-7 object-contain" />}
    </div>
  );
}

function AgentCard({ agent, best, onProfile, onSelect, selecting = false }: { agent: QuoteAgentSummary; best: boolean; onProfile: () => void; onSelect: () => void; selecting?: boolean }) {
  return (
    <article className="grid gap-5 rounded-[14px] bg-white px-5 py-5 shadow-[0_1px_0_rgba(7,22,44,0.02)] md:grid-cols-[minmax(0,1fr)_150px] md:px-7">
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <AgentLogo agent={agent} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-[18px] font-semibold leading-[26px] text-primary-10">{agent.companyName}</h3>
              {agent.verified ? <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-10 px-2.5 py-1 text-[10px] text-white"><span>✓</span> Verified</span> : null}
            </div>
            <button type="button" onClick={onProfile} className="mt-2 text-[12px] font-medium text-primary-06 hover:underline">View full profile</button>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-06">
              <span className="text-secondary-06">★ {agent.rating !== null ? agent.rating.toFixed(1) : "—"}</span>
              <span>·</span>
              <span>{agent.reviewCount > 0 ? `${agent.reviewCount} reviews` : "No reviews yet"}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Tag>Response Time: {agent.responseTime ?? "Not provided"}</Tag>
          <Tag>Collection Method: {agent.collectionMethod ?? "Not provided"}</Tag>
          <Tag>Delivery Method: {agent.deliveryMethod ?? "Not provided"}</Tag>
          <Tag>Insurance Availability: {agent.insuranceAvailable === null ? "Not provided" : agent.insuranceAvailable ? "Yes" : "No"}</Tag>
          <Tag>Shipment frequency: {agent.shipmentFrequency ?? "Not provided"}</Tag>
        </div>
      </div>

      <div className="flex flex-col justify-center border-t border-neutral-03 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        {best ? <span className="mb-2 w-fit rounded-full border border-primary-03 bg-primary-01 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[1px] text-primary-06">Best match</span> : null}
        <strong className="font-display text-[22px] font-semibold leading-[30px] text-primary-10">{formatMoney(agent.estimatedPriceGbp)}</strong>
        <span className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-06">
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" /><path d="M8 5v3l2 1" stroke="currentColor" strokeLinecap="round" /></svg>
          {agent.deliveryEstimate ?? agent.shippingMethod ?? "Delivery time varies"}
        </span>
        <button type="button" onClick={onSelect} disabled={selecting} className="zion-btn zion-btn-blue mt-4 min-h-[48px] w-full text-[15px] disabled:cursor-wait disabled:opacity-70">{selecting ? "Opening…" : "Select"}</button>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="grid min-w-0 animate-pulse gap-5 overflow-hidden rounded-[14px] bg-white px-4 py-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_150px] md:px-7 md:py-6">
      <div className="min-w-0">
        <div className="flex min-w-0 gap-3">
          <div className="h-11 w-11 shrink-0 rounded-full bg-neutral-02" />
          <div className="min-w-0 flex-1">
            <div className="h-5 w-full max-w-44 rounded bg-neutral-02" />
            <div className="mt-3 h-3 w-full max-w-28 rounded bg-neutral-02" />
          </div>
        </div>
        <div className="mt-6 flex min-w-0 flex-wrap gap-2">
          <div className="h-6 w-28 max-w-full rounded-full bg-neutral-02" />
          <div className="h-6 w-40 max-w-full rounded-full bg-neutral-02" />
          <div className="h-6 w-36 max-w-full rounded-full bg-neutral-02" />
        </div>
      </div>
      <div className="min-w-0 border-t border-neutral-02 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <div className="h-7 w-24 max-w-full rounded bg-neutral-02" />
        <div className="mt-3 h-4 w-20 max-w-full rounded bg-neutral-02" />
        <div className="mt-4 h-12 w-full rounded bg-primary-02" />
      </div>
    </div>
  );
}

function MultiItemFilter({ values, onChange, tone = "light", required = false }: { values: string[]; onChange: (values: string[]) => void; tone?: Tone; required?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function outside(event: PointerEvent) { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className={`mb-2 block text-[13px] leading-[20px] ${tone === "dark" ? "text-neutral-01" : "text-neutral-10"}`}>
        What are you sending?{required ? <span className="text-error">*</span> : null}
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
      <label className={`mb-2 block text-[13px] leading-[20px] ${tone === "dark" ? "text-neutral-01" : "text-neutral-10"}`}>{label}{required ? <span className="text-error">*</span> : null}</label>
      <div className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="zion-input h-[48px] appearance-none bg-white pr-10 text-[13px]"><option value="">Select an option</option>{options.map((option) => <option key={`${label}-${option.value || "any"}`} value={option.value}>{option.label}</option>)}</select>
        <span className="pointer-events-none absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-primary-01 text-primary-10"><svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span>
      </div>
    </div>
  );
}

function SortControls({ sortMode, onChange, compact = false }: { sortMode: SortMode; onChange: (mode: SortMode) => void; compact?: boolean }) {
  return (
    <div className={compact ? "grid grid-cols-2 gap-2" : "flex flex-wrap items-center gap-3"}>
      {!compact ? <span className="mr-1 text-[12px] text-neutral-06">Sort by:</span> : null}
      {SORT_OPTIONS.map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`${compact ? "min-h-11 w-full px-3 py-2.5" : "min-w-[120px] px-5 py-3"} rounded-[12px] border text-[12px] transition ${sortMode === value ? "border-primary-06 bg-white text-primary-06" : "border-neutral-03 bg-white text-neutral-07 hover:border-primary-04"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function FilterPanel({ draft, onChange, embedded = false }: { draft: QuoteDraft; onChange: (draft: QuoteDraft) => void; embedded?: boolean }) {
  const update = <K extends keyof QuoteDraft>(key: K, value: QuoteDraft[K]) => onChange({ ...draft, [key]: value });
  return (
    <aside className={embedded ? "bg-white" : "sticky top-[112px] max-h-[calc(100vh-128px)] overflow-y-auto overscroll-contain rounded-[2px] bg-white p-5"}>
      <h2 className="border-b border-neutral-03 pb-3 font-sans text-[13px] font-semibold text-primary-10">Filter results</h2>
      <div className="mt-6 space-y-6">
        <QuoteLocationInput label="From" helper="Enter postcode" placeholder="e.g Cr0 12t" countryCode="GB" flagSrc={UK_FLAG} value={draft.from} onChange={(value) => update("from", value)} />
        <QuoteLocationInput label="To" helper="Enter delivery location" placeholder="Enter full address" countryCode="NG" flagSrc={NG_FLAG} value={draft.to} onChange={(value) => update("to", value)} />
        <MultiItemFilter values={draft.itemTypes} onChange={(value) => update("itemTypes", value)} />
        <div><label className="mb-2 block text-[13px] leading-[20px] text-neutral-10">Kg</label><input type="number" min="0" step="0.1" value={draft.weightKg} onChange={(event) => update("weightKg", event.target.value)} className="zion-input h-[48px] text-[13px]" placeholder="0" /><p className="mt-1.5 text-[11px] text-neutral-06">Enter package weight</p></div>
        <div><label className="mb-2 block text-[13px] leading-[20px] text-neutral-10">Length</label><input type="number" min="0" value={draft.lengthCm} onChange={(event) => update("lengthCm", event.target.value)} className="zion-input h-[48px] text-[13px]" placeholder="Item length" /></div>
        <div><label className="mb-2 block text-[13px] leading-[20px] text-neutral-10">Width</label><input type="number" min="0" value={draft.widthCm} onChange={(event) => update("widthCm", event.target.value)} className="zion-input h-[48px] text-[13px]" placeholder="Item width" /></div>
        <SelectField label="Collection method" value={draft.collectionMode} options={QUOTE_COLLECTION_OPTIONS} onChange={(value) => update("collectionMode", value)} />
        <SelectField label="Delivery method" value={draft.deliveryMode} options={QUOTE_DELIVERY_OPTIONS} onChange={(value) => update("deliveryMode", value)} />
        <SelectField label="Shipping method" value={draft.shippingMethod} options={QUOTE_SHIPPING_METHOD_OPTIONS} onChange={(value) => update("shippingMethod", value)} />
      </div>
    </aside>
  );
}

function ExpandedQuoteEditor({ draft, onChange, canSubmit, onSubmit }: { draft: QuoteDraft; onChange: (draft: QuoteDraft) => void; canSubmit: boolean; onSubmit: () => void }) {
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
            <label className="mb-2 block text-[13px] leading-[20px] text-neutral-01">Kg<span className="text-error">*</span></label>
            <input type="number" min="0" step="0.1" value={draft.weightKg} onChange={(event) => update("weightKg", event.target.value)} className="zion-input h-[48px] bg-white text-[13px]" placeholder="0" />
            <p className="mt-1.5 text-[11px] text-neutral-03">Enter package weight</p>
          </div>

          <div><label className="mb-2 block text-[13px] leading-[20px] text-neutral-01">Length</label><input type="number" min="0" value={draft.lengthCm} onChange={(event) => update("lengthCm", event.target.value)} className="zion-input h-[48px] bg-white text-[13px]" placeholder="Item length" /></div>
          <div><label className="mb-2 block text-[13px] leading-[20px] text-neutral-01">Width</label><input type="number" min="0" value={draft.widthCm} onChange={(event) => update("widthCm", event.target.value)} className="zion-input h-[48px] bg-white text-[13px]" placeholder="Item width" /></div>
          <SelectField tone="dark" label="Delivery Method" value={draft.deliveryMode} options={QUOTE_DELIVERY_OPTIONS} onChange={(value) => update("deliveryMode", value)} />
          <SelectField tone="dark" label="Collection method" value={draft.collectionMode} options={QUOTE_COLLECTION_OPTIONS} onChange={(value) => update("collectionMode", value)} />
        </div>

        <div className="mt-12 flex justify-center pb-2">
          <button type="submit" disabled={!canSubmit} className="zion-btn zion-btn-blue min-h-[52px] w-[190px] text-[15px] disabled:cursor-not-allowed disabled:opacity-50">Get a quote</button>
        </div>
      </div>
    </form>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function CompareAgentsPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<QuoteDraft>(EMPTY_QUOTE_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [agents, setAgents] = useState<QuoteAgentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("best");
  const [profileAgentId, setProfileAgentId] = useState<string | null>(null);
  const [eurToGbpRate, setEurToGbpRate] = useState(0.86);
  const [quoteEditorExpanded, setQuoteEditorExpanded] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [resolvedQueryKey, setResolvedQueryKey] = useState("");
  const [pendingAgentId, setPendingAgentId] = useState<string | null>(null);

  useEffect(() => {
    const storedDraft = readQuoteDraft();
    const storedQueryKey = buildAgentQuery(storedDraft);
    const cached = readAgentResultsCache();
    setDraft(storedDraft);
    if (cached?.queryKey === storedQueryKey) {
      setAgents(cached.response.agents);
      setEurToGbpRate(cached.response.rate.value);
      setResolvedQueryKey(storedQueryKey);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    router.prefetch(routes.web.quoteShipment);
  }, [router]);

  useEffect(() => {
    if (!hydrated) return;
    writeQuoteDraft(draft);
  }, [draft, hydrated]);

  useEffect(() => {
    if (!mobileToolsOpen) return;
    function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") setMobileToolsOpen(false); }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileToolsOpen]);

  const canSearch = Boolean(draft.from?.city && draft.to && draft.itemTypes.length && draft.collectionMode && Number(draft.weightKg) > 0);
  const queryKey = canSearch ? buildAgentQuery(draft) : "";

  useEffect(() => {
    if (!hydrated || !canSearch || !draft.from) {
      setAgents([]);
      setLoading(false);
      setError("");
      setResolvedQueryKey("");
      return;
    }

    if (queryKey && resolvedQueryKey === queryKey) {
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    const timer = window.setTimeout(async () => {
      if (!active) return;
      try {
        const response = await fetch(`${buildApiUrl(routes.api.quote.agents)}?${queryKey}`, { signal: controller.signal });
        if (!response.ok) {
          const body = await response.json().catch(() => null) as { message?: string } | null;
          throw new Error(body?.message || "Unable to compare shipping agents.");
        }
        const body = await response.json() as QuoteAgentsResponse;
        if (!active) return;
        setAgents(body.agents);
        setEurToGbpRate(body.rate.value);
        setResolvedQueryKey(queryKey);
        writeAgentResultsCache({ queryKey, response: body });
      } catch (caught) {
        if (active && !(caught instanceof DOMException && caught.name === "AbortError")) {
          setError(caught instanceof Error ? caught.message : "Unable to compare shipping agents.");
          setAgents([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 220);

    return () => { active = false; window.clearTimeout(timer); controller.abort(); };
  }, [canSearch, draft.from, hydrated, queryKey, resolvedQueryKey]);

  const sortedAgents = useMemo(() => {
    const next = [...agents];
    if (sortMode === "price") return next.sort((a, b) => (a.estimatedPriceGbp ?? Number.POSITIVE_INFINITY) - (b.estimatedPriceGbp ?? Number.POSITIVE_INFINITY));
    if (sortMode === "fastest") return next.sort((a, b) => a.speedRank - b.speedRank || a.responseRank - b.responseRank || b.bestMatchScore - a.bestMatchScore);
    if (sortMode === "rating") return next.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || b.reviewCount - a.reviewCount || b.bestMatchScore - a.bestMatchScore);
    return next.sort((a, b) => b.bestMatchScore - a.bestMatchScore || (a.estimatedPriceGbp ?? Number.POSITIVE_INFINITY) - (b.estimatedPriceGbp ?? Number.POSITIVE_INFINITY));
  }, [agents, sortMode]);

  function selectAgent(agentId: string) {
    if (pendingAgentId) return;
    setPendingAgentId(agentId);
    const agent = agents.find((item) => item.id === agentId);
    if (agent) {
      writeSelectedQuoteAgent({
        id: agent.id,
        companyName: agent.companyName,
        logoUrl: agent.logoUrl,
        verified: agent.verified,
        rating: agent.rating,
        reviewCount: agent.reviewCount,
        responseTime: agent.responseTime,
        collectionMethod: agent.collectionMethod,
        deliveryMethod: agent.deliveryMethod,
        insuranceAvailable: agent.insuranceAvailable,
        shipmentFrequency: agent.shipmentFrequency,
        shippingMethod: agent.shippingMethod,
        estimatedPriceGbp: agent.estimatedPriceGbp,
        pricePerKgEur: agent.pricePerKgEur,
        eurToGbpRate,
      });
    }
    setProfileAgentId(null);
    router.push(`${routes.web.quoteShipment}?agent=${encodeURIComponent(agentId)}`);
  }

  function submitExpandedQuote() {
    setQuoteEditorExpanded(false);
    window.requestAnimationFrame(() => {
      document.getElementById("quote-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const routeLabel = draft.from && draft.to
    ? `${draft.from.city || draft.from.primary} → ${draft.to.city || draft.to.primary}`
    : "Complete your quote details";

  return (
    <>
      <QuoteSummaryBar draft={draft} expanded={quoteEditorExpanded} onToggle={() => setQuoteEditorExpanded((current) => !current)} />

      <div id="quote-editor-panel" className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${quoteEditorExpanded ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <ExpandedQuoteEditor draft={draft} onChange={setDraft} canSubmit={canSearch} onSubmit={submitExpandedQuote} />
        </div>
      </div>

      <main id="quote-results" className="min-h-[70vh] scroll-mt-24 bg-neutral-01 pb-20 font-sans lg:pb-16">
        <div className="mx-auto w-full max-w-[1272px] px-4 pt-4 sm:px-6 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-neutral-07">
            <p><span>Home</span><span className="mx-2">/</span><span>Get a quote</span><span className="mx-2">/</span><span className="text-primary-10">Compare agents</span></p>
            <button type="button" className="rounded-full bg-secondary-06 px-3 py-1 text-[10px] font-medium text-secondary-10 transition-colors hover:bg-secondary-05">Read on shipment prohibitions</button>
          </div>

          <div className="mt-2 grid gap-2 lg:grid-cols-[324px_minmax(0,1fr)] lg:gap-4">
            <h1 className="font-display text-[20px] font-semibold leading-[30px] text-primary-10">{loading ? "Finding agents…" : `${sortedAgents.length} agent${sortedAgents.length === 1 ? "" : "s"} found`}</h1>
            <p className="self-center text-[12px] text-neutral-08">{routeLabel}</p>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[324px_minmax(0,1fr)]">
            <div className="hidden lg:block">
              <FilterPanel draft={draft} onChange={setDraft} />
            </div>

            <section className="min-w-0">
              <div className="mb-5 hidden lg:block">
                <SortControls sortMode={sortMode} onChange={setSortMode} />
              </div>

              <div className="space-y-4" aria-live="polite">
                {!hydrated || loading ? <><SkeletonCard /><SkeletonCard /><SkeletonCard /></> : !canSearch ? (
                  <div className="rounded-[14px] bg-white px-6 py-14 text-center"><h2 className="font-display text-[20px] font-semibold text-primary-10">Complete your quote details</h2><p className="mx-auto mt-2 max-w-lg text-[13px] leading-[20px] text-neutral-06">Choose your pickup and delivery locations, item type and collection method to compare eligible shipping agents. You can narrow the results further by delivery or shipping method.</p></div>
                ) : error ? (
                  <div className="rounded-[14px] bg-white px-6 py-14 text-center"><p className="text-[14px] text-error">{error}</p></div>
                ) : sortedAgents.length === 0 ? (
                  <div className="rounded-[14px] bg-white px-6 py-14 text-center"><h2 className="font-display text-[20px] font-semibold text-primary-10">No matching agents yet</h2><p className="mx-auto mt-2 max-w-lg text-[13px] leading-[20px] text-neutral-06">No approved shipping partner currently matches this pickup city and shipment. Try adjusting the filters or check again later.</p></div>
                ) : sortedAgents.map((agent, index) => <AgentCard key={agent.id} agent={agent} best={sortMode === "best" && index === 0} selecting={pendingAgentId === agent.id} onProfile={() => setProfileAgentId(agent.id)} onSelect={() => selectAgent(agent.id)} />)}
              </div>
            </section>
          </div>
        </div>
      </main>

      {mobileToolsOpen ? (
        <>
          <button type="button" aria-label="Close sort and filters" onClick={() => setMobileToolsOpen(false)} className="fixed inset-0 z-40 bg-primary-10/25 lg:hidden" />
          <section className="fixed bottom-[84px] left-4 right-4 z-50 max-h-[calc(100dvh-112px)] overflow-y-auto rounded-[18px] border border-neutral-03 bg-white p-4 shadow-[0_20px_50px_rgba(7,22,44,0.22)] lg:hidden">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-display text-[18px] font-semibold text-primary-10">Sort and filter</h2>
              <button type="button" onClick={() => setMobileToolsOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-neutral-01 text-primary-10" aria-label="Close sort and filters">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
            <p className="mb-2 text-[12px] font-semibold text-primary-10">Sort by</p>
            <SortControls sortMode={sortMode} onChange={setSortMode} compact />
            <div className="my-5 border-t border-neutral-03" />
            <FilterPanel draft={draft} onChange={setDraft} embedded />
          </section>
        </>
      ) : null}

      <button
        type="button"
        aria-label={mobileToolsOpen ? "Hide sort and filters" : "Show sort and filters"}
        aria-expanded={mobileToolsOpen}
        onClick={() => setMobileToolsOpen((current) => !current)}
        className="fixed bottom-4 left-4 z-[70] grid h-12 w-12 place-items-center rounded-full bg-primary-06 text-white shadow-[0_10px_24px_rgba(7,22,44,0.24)] transition-transform active:scale-95 lg:hidden"
      >
        {mobileToolsOpen ? <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="m7 7 10 10m0-10L7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg> : <FilterIcon />}
      </button>

      <AgentProfileModal agentId={profileAgentId} onClose={() => setProfileAgentId(null)} onSelect={selectAgent} />
    </>
  );
}
