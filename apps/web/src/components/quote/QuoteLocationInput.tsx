/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { QuoteLocation } from "@/lib/quoteFlow";

const PHOTON_ENDPOINT = "https://photon.komoot.io/api/";

type Result = {
  id: string;
  label: string;
  primary: string;
  secondary: string;
  city: string;
  coordinates: [number, number] | null;
  postcode?: string;
  state?: string;
  country?: string;
};

type Props = {
  label: string;
  helper?: string;
  placeholder: string;
  countryCode: "GB" | "NG";
  flagSrc: string;
  value: QuoteLocation | null;
  onChange: (value: QuoteLocation | null) => void;
  onInputChange?: (value: string) => void;
  required?: boolean;
  tone?: "light" | "dark";
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export default function QuoteLocationInput({
  label,
  helper,
  placeholder,
  countryCode,
  flagSrc,
  value,
  onChange,
  onInputChange,
  required = false,
  tone = "light",
}: Props) {
  const inputId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<Result[]>([]);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value?.label) setQuery(value.label);
  }, [value?.label]);

  useEffect(() => {
    function outside(event: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setFocused(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (!focused || term.length < 2 || term === value?.label) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;
    const timer = window.setTimeout(async () => {
      if (!active) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: term, limit: "6", lang: "en", countrycode: countryCode.toLowerCase() });
        const response = await fetch(`${PHOTON_ENDPOINT}?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) throw new Error("location search failed");
        const data = await response.json() as { features?: Array<{ properties?: Record<string, unknown>; geometry?: { coordinates?: unknown } }> };
        const next = (data.features ?? []).map((feature, index) => {
          const p = feature.properties ?? {};
          const primary = text(p.name) || [text(p.housenumber), text(p.street)].filter(Boolean).join(" ") || text(p.street) || text(p.city) || text(p.locality) || text(p.postcode) || "Location";
          const secondaryParts = [p.district, p.locality, p.city, p.county, p.state, p.postcode, p.country].map(text).filter(Boolean);
          const rawCoordinates = feature.geometry?.coordinates;
          const coordinates = Array.isArray(rawCoordinates) && typeof rawCoordinates[0] === "number" && typeof rawCoordinates[1] === "number"
            ? [rawCoordinates[0], rawCoordinates[1]] as [number, number]
            : null;
          const city = text(p.city) || text(p.locality) || text(p.name) || text(p.district) || text(p.county) || primary;
          return {
            id: `${text(p.osm_type) || "osm"}-${String(p.osm_id ?? index)}-${index}`,
            label: [primary, ...secondaryParts].filter((part, i, all) => all.indexOf(part) === i).join(", "),
            primary,
            secondary: secondaryParts.filter((part, i, all) => all.indexOf(part) === i).join(", "),
            city,
            coordinates,
            postcode: text(p.postcode),
            state: text(p.state) || text(p.county),
            country: text(p.country),
          };
        });
        if (active) setResults(next);
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 260);

    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [countryCode, focused, query, value?.label]);

  return (
    <div ref={wrapperRef} className="relative">
      <label
        htmlFor={inputId}
        className={`mb-2 block font-sans text-[13px] leading-[20px] ${tone === "dark" ? "text-neutral-01" : "text-neutral-10"}`}
      >
        {label}{required ? <span className="text-error">*</span> : null}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2"><img src={flagSrc} alt="" className="h-[12px] w-[18px] rounded-[1px] object-cover" /></span>
        <input
          id={inputId}
          value={query}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            onInputChange?.(next);
            onChange(null);
          }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`zion-input h-[48px] pl-10 text-[13px] leading-[20px] ${tone === "dark" ? "bg-white" : ""}`}
        />
        {focused && query.trim().length >= 2 && query !== value?.label ? (
          <div className="absolute inset-x-0 top-[48px] z-50 max-h-60 overflow-y-auto rounded-[10px] border border-neutral-03 bg-white p-1 shadow-[0_14px_34px_rgba(7,22,44,0.14)]">
            {loading ? <p className="px-3 py-3 text-[13px] text-neutral-06">Searching locations...</p> : results.length ? results.map((result) => (
              <button key={result.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(result); setQuery(result.label); setFocused(false); }} className="flex w-full items-start gap-2 rounded-[8px] px-3 py-2.5 text-left hover:bg-primary-01">
                <img src={flagSrc} alt="" className="mt-1 h-[10px] w-[15px] rounded-[1px] object-cover" />
                <span className="min-w-0"><strong className="block truncate text-[13px] font-medium text-primary-10">{result.primary}</strong>{result.secondary ? <span className="mt-0.5 block text-[11px] leading-[16px] text-neutral-06">{result.secondary}</span> : null}</span>
              </button>
            )) : <p className="px-3 py-3 text-[13px] text-neutral-06">No matching locations found</p>}
          </div>
        ) : null}
      </div>
      {helper ? (
        <p className={`mt-1.5 text-[11px] leading-[16px] ${tone === "dark" ? "text-neutral-03" : "text-neutral-06"}`}>{helper}</p>
      ) : null}
    </div>
  );
}
