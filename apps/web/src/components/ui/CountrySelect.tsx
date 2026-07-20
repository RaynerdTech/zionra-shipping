/**
 * Responsibility:
 * Renders the shared Zionra country selector with country flags, names,
 * international calling codes, keyboard dismissal, and click-outside closing.
 */

/* eslint-disable @next/next/no-img-element */

"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { CountryCode } from "libphonenumber-js";
import {
  COUNTRY_OPTIONS,
  type CountryOption,
} from "@/lib/countries";

type CountrySelectProps = {
  id: string;
  value: CountryCode;
  onChange: (country: CountryOption) => void;
  compact?: boolean;
  error?: boolean;
  ariaLabel: string;
};

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M4.083 5.833 7 8.75l2.917-2.917"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CountryFlag({ country }: { country: CountryOption }) {
  return (
    <span className="relative inline-flex h-[18px] w-6 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-neutral-01 font-sans text-[13px] leading-none">
      <span aria-hidden="true">{country.flagFallback}</span>
      <img
        src={country.flagUrl}
        alt=""
        width="24"
        height="18"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </span>
  );
}

export default function CountrySelect({
  id,
  value,
  onChange,
  compact = false,
  error = false,
  ariaLabel,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedCountry =
    COUNTRY_OPTIONS.find((country) => country.code === value) ??
    COUNTRY_OPTIONS[0];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function selectCountry(country: CountryOption) {
    onChange(country);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        className={`zion-input flex h-[52px] items-center text-left md:h-12 ${
          compact ? "gap-2 px-3" : "gap-2 pr-3"
        } ${error ? "zion-input-error" : ""}`}
      >
        <CountryFlag country={selectedCountry} />
        <span
          className={`text-neutral-10 ${
            compact
              ? "shrink-0 whitespace-nowrap"
              : "min-w-0 flex-1 truncate"
          }`}
        >
          {compact
            ? selectedCountry.callingCode
            : selectedCountry.name}
        </span>
        <span
          className={`pointer-events-none inline-flex shrink-0 items-center justify-center text-primary-08 ${
            compact
              ? "ml-auto h-5 w-5"
              : "h-8 w-8 rounded-full bg-primary-01"
          }`}
        >
          <ChevronIcon />
        </span>
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-neutral-02 bg-white p-1 shadow-lg ${
            compact ? "left-0 w-[290px]" : "inset-x-0"
          }`}
        >
          {COUNTRY_OPTIONS.map((country) => {
            const isSelected = country.code === value;

            return (
              <button
                key={country.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectCountry(country)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left font-sans text-sm leading-[22px] hover:bg-primary-01 focus-visible:outline-2 focus-visible:outline-primary-03 ${
                  isSelected
                    ? "bg-primary-01 text-primary-08"
                    : "text-neutral-10"
                }`}
              >
                <CountryFlag country={country} />
                <span className="min-w-0 flex-1 truncate">
                  {country.name}
                </span>
                <span className="shrink-0 text-text-body-light">
                  {country.callingCode}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
