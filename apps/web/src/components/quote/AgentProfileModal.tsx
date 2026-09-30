/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import type { QuoteAgentDetail } from "./types";

type Props = {
  agentId: string | null;
  onClose: () => void;
  onSelect: (agentId: string) => void;
};

function relativeDate(value: string) {
  const days = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return "Today";
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 31) {
    const weeks = Math.max(1, Math.round(days / 7));
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  const months = Math.max(1, Math.round(days / 30));
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "G";
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-h-[54px] flex-col items-center justify-center border-r border-neutral-03 last:border-r-0">
      <strong className="font-display text-[16px] font-semibold leading-[22px] text-primary-10 sm:text-[18px]">{value}</strong>
      <span className="mt-1 font-sans text-[10px] tracking-[1.5px] text-neutral-07 sm:text-[11px]">{label}</span>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-neutral-03 bg-neutral-01 px-3 py-1 font-sans text-[10px] leading-[14px] text-neutral-09 sm:text-[11px]">{children}</span>;
}

export default function AgentProfileModal({ agentId, onClose, onSelect }: Props) {
  const [agent, setAgent] = useState<QuoteAgentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!agentId) return;
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    setAgent(null);
    setReviewsOpen(false);
    setVisibleReviews(3);

    void fetch(buildApiUrl(`${routes.api.quote.agents}/${encodeURIComponent(agentId)}`), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load this agent.");
        return response.json() as Promise<QuoteAgentDetail>;
      })
      .then((body) => { if (active) setAgent(body); })
      .catch((caught) => {
        if (active && !(caught instanceof DOMException && caught.name === "AbortError")) setError(caught instanceof Error ? caught.message : "Unable to load this agent.");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; controller.abort(); };
  }, [agentId]);

  useEffect(() => {
    if (!agentId) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function escape(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", escape);
    };
  }, [agentId, onClose]);

  const reviews = useMemo(() => agent?.reviews.slice(0, visibleReviews) ?? [], [agent, visibleReviews]);

  if (!agentId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Shipping agent profile" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <div className="relative max-h-[92vh] w-full max-w-[845px] overflow-y-auto rounded-[14px] border border-neutral-03 bg-white shadow-[0_28px_70px_rgba(7,22,44,0.32)]">
        <div className="h-[96px] bg-gradient-to-r from-primary-10 via-primary-08 to-primary-06 sm:h-[100px]" />
        <button type="button" onClick={onClose} aria-label="Close agent profile" className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-[8px] bg-white text-primary-10 transition hover:bg-primary-01">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
        </button>

        {loading ? (
          <div className="space-y-5 px-6 pb-8 pt-12 sm:px-11">
            <div className="h-7 w-52 animate-pulse rounded bg-neutral-02" />
            <div className="grid grid-cols-4 border border-neutral-02"><div className="h-16 animate-pulse bg-neutral-01" /><div className="h-16 animate-pulse bg-neutral-01" /><div className="h-16 animate-pulse bg-neutral-01" /><div className="h-16 animate-pulse bg-neutral-01" /></div>
            <div className="h-20 animate-pulse rounded bg-neutral-01" />
            <div className="h-14 animate-pulse rounded bg-primary-02" />
          </div>
        ) : error || !agent ? (
          <div className="px-6 py-12 text-center"><p className="text-[14px] text-error">{error || "Unable to load this agent."}</p><button type="button" onClick={onClose} className="zion-btn zion-btn-outline-blue zion-btn-md mt-5">Close</button></div>
        ) : (
          <div className="relative px-6 pb-7 pt-12 sm:px-11 sm:pt-10">
            <div className="absolute -top-10 left-7 grid h-20 w-20 place-items-center overflow-hidden rounded-full border-[5px] border-white bg-primary-01 sm:left-10">
              {agent.logoUrl ? <img src={agent.logoUrl} alt={`${agent.companyName} logo`} className="h-full w-full object-cover" /> : <img src="/images/logo-zionra.png" alt="" className="h-12 w-12 object-contain" />}
            </div>
            <button type="button" onClick={() => setSaved((current) => !current)} aria-label={saved ? "Remove saved agent" : "Save agent"} className="absolute right-6 top-3 grid h-10 w-10 place-items-center rounded-[8px] border border-neutral-03 text-primary-10 hover:bg-primary-01 sm:right-11">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"}><path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.7L6 20V5.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            </button>

            <h2 className="font-display text-[22px] font-semibold leading-[30px] text-primary-10">{agent.companyName} {agent.verified ? <span className="inline-flex translate-y-[-1px] items-center text-tertiary-10" aria-label="Verified">✓</span> : null}</h2>

            <div className="mt-2 grid grid-cols-2 border border-neutral-03 sm:grid-cols-4">
              <Metric value={agent.rating !== null ? agent.rating.toFixed(1) : "—"} label="Rating" />
              <Metric value={agent.reviewCount.toLocaleString()} label="Reviews" />
              <Metric value={agent.shipmentCount > 0 ? `${agent.shipmentCount.toLocaleString()}+` : "0"} label="Shipments" />
              <Metric value={agent.onTimeRate !== null ? `${agent.onTimeRate}%` : "—"} label="On-time rate" />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Tag>Response Time: {agent.responseTime ?? "Not provided"}</Tag>
              <Tag>Collection Method: {agent.collectionMethod ?? "Not provided"}</Tag>
              <Tag>Delivery Method: {agent.deliveryMethod ?? "Not provided"}</Tag>
              <Tag>Insurance Availability: {agent.insuranceAvailable === null ? "Not provided" : agent.insuranceAvailable ? "Yes" : "No"}</Tag>
              <Tag>Shipment frequency: {agent.shipmentFrequency ?? "Not provided"}</Tag>
            </div>

            <p className="mt-7 font-sans text-[15px] font-semibold leading-9 text-neutral-08 sm:text-[16px]">{agent.bio || `${agent.companyName} is a verified Zionra shipping partner serving approved collection locations between the UK and Nigeria.`}</p>

            <button type="button" onClick={() => onSelect(agent.id)} className="zion-btn zion-btn-blue mt-6 min-h-[56px] w-full text-[16px]">Select agent</button>

            <div className="mt-5 border-t border-neutral-03 pt-1">
              <button type="button" onClick={() => setReviewsOpen((current) => !current)} className="flex w-full items-center justify-between py-4 text-left">
                <span className="flex items-center gap-2 font-display text-[16px] font-semibold text-primary-10">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M5 5h14v11H9l-4 3V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                  Reviews ({agent.reviewCount})
                </span>
                <svg className={`h-4 w-4 transition-transform ${reviewsOpen ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>

              {reviewsOpen ? (
                <div className="pb-1">
                  {agent.reviewCount === 0 ? (
                    <div className="rounded-[10px] bg-neutral-01 px-4 py-6 text-center"><p className="font-sans text-[14px] text-neutral-07">No Google reviews have been synced for this agent yet.</p></div>
                  ) : (
                    <div className="space-y-5 py-3">
                      {reviews.map((review) => (
                        <article key={review.id} className="flex gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-neutral-01 text-[12px] font-medium text-neutral-08">{review.authorPhotoUrl ? <img src={review.authorPhotoUrl} alt="" className="h-full w-full object-cover" /> : initials(review.authorName)}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3"><strong className="text-[13px] font-semibold text-primary-10">{review.authorName}</strong><span className="shrink-0 text-[10px] text-neutral-06">{relativeDate(review.reviewedAt)}</span></div>
                            <p className="mt-0.5 text-[13px] tracking-[1px] text-secondary-06">{"★".repeat(review.rating)}{"☆".repeat(Math.max(0, 5 - review.rating))}</p>
                            {review.comment ? <p className="mt-1 text-[12px] leading-[18px] text-neutral-08">{review.comment}</p> : null}
                          </div>
                        </article>
                      ))}
                      {visibleReviews < agent.reviews.length ? <button type="button" onClick={() => setVisibleReviews((count) => count + 3)} className="zion-btn zion-btn-outline-blue min-h-[38px] w-full text-[12px]">Load more reviews</button> : null}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
