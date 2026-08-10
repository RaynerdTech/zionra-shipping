"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  ReactNode,
} from "react";


const ukFlagSrc = "/images/United-Kingdom.svg";
const ngFlagSrc = "/images/Nigeria.svg";

const PHOTON_ENDPOINT = "https://photon.komoot.io/api/";
const GETADDRESS_ENDPOINT = "https://api.getAddress.io";

// Add your getAddress.io domain token/API key here.
// For client-side code, use a domain token instead of exposing a private API key.
const GETADDRESS_DOMAIN_TOKEN = "";

type ActiveTab = "quote" | "track";
type CountryCode = "GB" | "NG";

type PhotonFeatureProperties = {
  name?: string;
  street?: string;
  housenumber?: string;
  district?: string;
  locality?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  osm_type?: string;
  osm_id?: string | number;
};

type PhotonFeature = {
  properties?: PhotonFeatureProperties;
  geometry?: {
    coordinates?: unknown;
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

type GetAddressSuggestion = {
  id: string;
  address: string;
  url?: string;
};

type GetAddressAutocompleteResponse = {
  suggestions?: GetAddressSuggestion[];
};

type GetAddressFullAddress = {
  postcode?: string;
  latitude?: number;
  longitude?: number;
  formatted_address?: string[];
  thoroughfare?: string;
  building_name?: string;
  sub_building_name?: string;
  sub_building_number?: string;
  building_number?: string;
  line_1?: string;
  line_2?: string;
  line_3?: string;
  line_4?: string;
  locality?: string;
  town_or_city?: string;
  county?: string;
  district?: string;
  country?: string;
  residential?: boolean;
};

type LocationResult = {
  id: string;
  label: string;
  primary: string;
  secondary: string;
  coordinates: [number, number] | null;
  raw: unknown;
  source: "photon" | "getaddress";
  addressId?: string;
};

type IconProps = {
  className?: string;
};

type FieldLabelProps = {
  htmlFor?: string;
  id?: string;
  children: ReactNode;
};

type LocationAutocompleteProps = {
  label: string;
  helper?: string;
  placeholder: string;
  flagSrc: string;
  flagAlt: string;
  countryCode: CountryCode;
  value: LocationResult | null;
  onChange: (value: LocationResult | null) => void;
  className?: string;
  error?: string;
};

type TextInputProps = {
  label: string;
  placeholder?: string;
  unit?: string;
  type?: ComponentPropsWithoutRef<"input">["type"];
  defaultValue?: string | number;
  value?: string | number;
  onChange?: (value: string) => void;
  className?: string;
  error?: string;
};

type DropdownOption = {
  value: string;
  label: string;
};

type DropdownFieldProps = {
  label: string;
  placeholder: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
};

type MultiSelectDropdownFieldProps = {
  label: string;
  placeholder: string;
  options: DropdownOption[];
  values: string[];
  onChange: (values: string[]) => void;
  className?: string;
  error?: string;
};

type QuoteFormErrors = {
  fromLocation?: string;
  toLocation?: string;
  itemTypes?: string;
  collectionMode?: string;
  deliveryMode?: string;
};

const ITEM_TYPE_OPTIONS: DropdownOption[] = [
  { value: "parcel", label: "Parcel / package" },
  { value: "documents", label: "Documents" },
  { value: "clothing", label: "Clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "household", label: "Household items" },
  { value: "other", label: "Other item" },
];

const COLLECTION_OPTIONS: DropdownOption[] = [
  { value: "collection", label: "Pickup from address" },
  { value: "dropoff", label: "Drop off at agent" },
];

const DELIVERY_OPTIONS: DropdownOption[] = [
  { value: "door-to-door", label: "Door-to-door delivery" },
  { value: "receiver-pickup", label: "Receiver pickup" },
];

function ChevronDownIcon({ className = "" }: IconProps) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 6.75L9 11.25L13.5 6.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function parseCoordinates(value: unknown): [number, number] | null {
  if (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    return [value[0], value[1]];
  }

  return null;
}

function uniqueParts(parts: Array<string | undefined>): string[] {
  return [...new Set(parts.filter((part): part is string => Boolean(part)))];
}

function buildPhotonDisplay(feature: PhotonFeature): {
  label: string;
  primary: string;
  secondary: string;
} {
  const p = feature.properties ?? {};

  const primary =
    p.name ||
    uniqueParts([p.housenumber, p.street]).join(" ") ||
    p.street ||
    p.city ||
    p.locality ||
    p.postcode ||
    "Location";

  const secondaryParts = uniqueParts([
    p.district,
    p.locality,
    p.city,
    p.county,
    p.state,
    p.postcode,
    p.country,
  ]);

  const secondary = secondaryParts.join(", ");
  const label = uniqueParts([primary, ...secondaryParts]).join(", ");

  return {
    label,
    primary,
    secondary,
  };
}

function splitAddressLabel(address: string): {
  primary: string;
  secondary: string;
} {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    primary: parts[0] || address || "Location",
    secondary: parts.slice(1).join(", "),
  };
}

function buildGetAddressFullDisplay(address: GetAddressFullAddress): {
  label: string;
  primary: string;
  secondary: string;
} {
  const premisePrimary = uniqueParts([
    address.sub_building_name,
    address.sub_building_number,
    address.building_name,
    address.building_number,
    address.thoroughfare,
  ]).join(" ");

  const primary =
    premisePrimary ||
    address.line_1 ||
    address.formatted_address?.find(Boolean) ||
    address.postcode ||
    "Location";

  const secondaryParts = uniqueParts([
    address.line_2,
    address.line_3,
    address.line_4,
    address.locality,
    address.town_or_city,
    address.county,
    address.postcode,
    address.country,
  ]);

  const secondary = secondaryParts.join(", ");
  const label = uniqueParts([primary, ...secondaryParts]).join(", ");

  return {
    label,
    primary,
    secondary,
  };
}

function hasUkAddressProvider(): boolean {
  return GETADDRESS_DOMAIN_TOKEN.trim().length > 0;
}

async function searchGetAddressResults(
  searchTerm: string,
  signal: AbortSignal,
): Promise<LocationResult[]> {
  const params = new URLSearchParams({
    "api-key": GETADDRESS_DOMAIN_TOKEN,
    top: "6",
    all: "true",
    "show-postcode": "true",
  });

  const response = await fetch(
    `${GETADDRESS_ENDPOINT}/autocomplete/${encodeURIComponent(
      searchTerm,
    )}?${params.toString()}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("UK address search failed");
  }

  const data = (await response.json()) as GetAddressAutocompleteResponse;

  return (data.suggestions ?? [])
    .map((suggestion, index) => {
      const display = splitAddressLabel(suggestion.address);

      return {
        id: `getaddress-${suggestion.id}-${index}`,
        label: suggestion.address,
        primary: display.primary,
        secondary: display.secondary,
        coordinates: null,
        raw: suggestion,
        source: "getaddress" as const,
        addressId: suggestion.id,
      };
    })
    .filter((item) => item.label.length > 0);
}

async function resolveGetAddressResult(
  result: LocationResult,
): Promise<LocationResult> {
  if (!result.addressId || !hasUkAddressProvider()) {
    return result;
  }

  const params = new URLSearchParams({
    "api-key": GETADDRESS_DOMAIN_TOKEN,
  });

  const response = await fetch(
    `${GETADDRESS_ENDPOINT}/get/${encodeURIComponent(
      result.addressId,
    )}?${params.toString()}`,
  );

  if (!response.ok) {
    return result;
  }

  const fullAddress = (await response.json()) as GetAddressFullAddress;
  const display = buildGetAddressFullDisplay(fullAddress);

  return {
    ...result,
    label: display.label,
    primary: display.primary,
    secondary: display.secondary,
    coordinates:
      typeof fullAddress.longitude === "number" &&
      typeof fullAddress.latitude === "number"
        ? [fullAddress.longitude, fullAddress.latitude]
        : result.coordinates,
    raw: fullAddress,
  };
}

async function searchPhotonResults(
  searchTerm: string,
  countryCode: CountryCode,
  signal: AbortSignal,
): Promise<LocationResult[]> {
  const params = new URLSearchParams({
    q: searchTerm,
    limit: "7",
    lang: "en",
    countrycode: countryCode.toLowerCase(),
  });

  const response = await fetch(`${PHOTON_ENDPOINT}?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Location search failed");
  }

  const data = (await response.json()) as PhotonResponse;

  return (data.features ?? [])
    .map((feature, index) => {
      const display = buildPhotonDisplay(feature);

      return {
        id: `${feature.properties?.osm_type ?? "osm"}-${
          feature.properties?.osm_id ?? index
        }-${index}`,
        label: display.label,
        primary: display.primary,
        secondary: display.secondary,
        coordinates: parseCoordinates(feature.geometry?.coordinates),
        raw: feature,
        source: "photon" as const,
      };
    })
    .filter((item) => item.label.length > 0);
}
function FieldLabel({ htmlFor, id, children }: FieldLabelProps) {
  return (
    <label id={id} htmlFor={htmlFor} className="mb-2 block font-sans text-[14px] leading-[22px] text-neutral-01">
      {children}
    </label>
  );
}

function HelperText({ children }: { children: ReactNode }) {
  return <p className="mt-2 font-sans text-[14px] leading-[22px] text-text-on-dark-muted">{children}</p>;
}

function LocationAutocomplete({
  label,
  helper,
  placeholder,
  flagSrc,
  flagAlt,
  countryCode,
  value,
  onChange,
  className = "",
  error,
}: LocationAutocompleteProps) {
  const inputId = useId();
  const listboxId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const trimmedQuery = query.trim();
  const isOpen = isFocused && trimmedQuery.length >= 2;
  const errorId = `${inputId}-error`;

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (event.target instanceof Node && wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      if (trimmedQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        setActiveIndex(-1);
        return;
      }
      try {
        setIsLoading(true);
        const mappedResults =
          countryCode === "GB" && hasUkAddressProvider()
            ? await searchGetAddressResults(trimmedQuery, controller.signal)
            : await searchPhotonResults(trimmedQuery, countryCode, controller.signal);
        if (!isActive) return;
        setResults(mappedResults);
        setActiveIndex(mappedResults.length > 0 ? 0 : -1);
      } catch (caught) {
        if (!isActive) return;
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setResults([]);
        setActiveIndex(-1);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }, trimmedQuery.length < 2 ? 0 : 280);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trimmedQuery, countryCode]);

  async function selectResult(result: LocationResult) {
    setIsFocused(false);
    setActiveIndex(-1);
    const selected = result.source === "getaddress" ? await resolveGetAddressResult(result) : result;
    setQuery(selected.label);
    onChange(selected);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (results.length === 0 ? -1 : current >= results.length - 1 ? 0 : current + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (results.length === 0 ? -1 : current <= 0 ? results.length - 1 : current - 1));
    }
    if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      void selectResult(results[activeIndex]);
    }
    if (event.key === "Escape") {
      setIsFocused(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-neutral-01">
          <img src={flagSrc} alt={flagAlt} className="h-[10px] w-[14px] rounded-[1px] object-cover" />
        </span>
        <input
          id={inputId}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange(null);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-12 w-full rounded-[10px] border bg-white pl-12 pr-3 font-sans text-[14px] text-primary-10 outline-none transition placeholder:text-neutral-05 hover:border-primary-05 focus:border-primary-06 focus:ring-[3px] focus:ring-primary-06/20 ${error ? "border-error" : "border-neutral-03"}`}
        />
        {isOpen ? (
          <div id={listboxId} role="listbox" className="absolute left-0 right-0 top-[54px] z-[60] max-h-[260px] overflow-y-auto rounded-[10px] border border-neutral-03 bg-white p-1 shadow-[0_14px_34px_rgba(7,22,44,0.16)]">
            {isLoading ? (
              <div className="px-3 py-3 text-[14px] text-text-body-light">Searching locations...</div>
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <button
                  key={result.id}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => void selectResult(result)}
                  className={`flex w-full items-start gap-3 rounded-[8px] px-3 py-2.5 text-left transition ${activeIndex === index ? "bg-primary-01" : "hover:bg-neutral-01"}`}
                >
                  <img src={flagSrc} alt="" className="mt-1 h-[12px] w-[18px] rounded-[1px] object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium text-primary-10">{result.primary}</span>
                    {result.secondary ? <span className="mt-1 block text-[12px] leading-[16px] text-text-body-light">{result.secondary}</span> : null}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-[14px] text-text-body-light">No matching locations found</div>
            )}
          </div>
        ) : null}
      </div>
      {helper ? <HelperText>{helper}</HelperText> : null}
      {error ? <p id={errorId} className="mt-1.5 text-[12px] text-error-on-dark">{error}</p> : null}
    </div>
  );
}

function TextInput({ label, placeholder, unit, type = "text", defaultValue = "", value, onChange, className = "", error }: TextInputProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  return (
    <div className={className}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={inputId}
          type={type}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-12 w-full rounded-[10px] border bg-white px-3 font-sans text-[14px] text-primary-10 outline-none transition placeholder:text-neutral-05 hover:border-primary-05 focus:border-primary-06 focus:ring-[3px] focus:ring-primary-06/20 ${error ? "border-error" : "border-neutral-03"}`}
        />
        {unit ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-06">{unit}</span> : null}
      </div>
      {error ? <p id={errorId} className="mt-1.5 text-[12px] text-error-on-dark">{error}</p> : null}
    </div>
  );
}

function DropdownField({ label, placeholder, options, value, onChange, className = "", error }: DropdownFieldProps) {
  const labelId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedOption = useMemo(() => options.find((option) => option.value === value) ?? null, [options, value]);
  const errorId = `${labelId}-error`;

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (event.target instanceof Node && wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectOption(option: DropdownOption) {
    onChange(option.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen && options[activeIndex]) selectOption(options[activeIndex]);
      else setIsOpen(true);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current >= options.length - 1 ? 0 : current + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current <= 0 ? options.length - 1 : current - 1));
    }
    if (event.key === "Escape") setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <FieldLabel id={labelId}>{label}</FieldLabel>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`group flex h-12 w-full items-center justify-between rounded-[10px] border bg-white px-3 text-left font-sans text-[14px] outline-none transition hover:border-primary-05 focus:border-primary-06 focus:ring-[3px] focus:ring-primary-06/20 ${error ? "border-error" : "border-neutral-03"}`}
      >
        <span className={selectedOption ? "truncate text-primary-10" : "truncate text-neutral-05"}>{selectedOption?.label ?? placeholder}</span>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutral-01 text-primary-10 transition group-hover:bg-primary-01">
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>
      {isOpen ? (
        <div role="listbox" className="absolute left-0 right-0 top-[78px] z-[60] max-h-[220px] overflow-y-auto rounded-[10px] border border-neutral-03 bg-white p-1 shadow-[0_14px_34px_rgba(7,22,44,0.16)]">
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
              className={`block w-full rounded-[8px] px-3 py-2.5 text-left text-[14px] text-primary-10 transition ${option.value === value || activeIndex === index ? "bg-primary-01" : "hover:bg-neutral-01"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p id={errorId} className="mt-1.5 text-[12px] text-error-on-dark">{error}</p> : null}
    </div>
  );
}

function MultiSelectDropdownField({ label, placeholder, options, values, onChange, className = "", error }: MultiSelectDropdownFieldProps) {
  const labelId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedOptions = useMemo(() => options.filter((option) => values.includes(option.value)), [options, values]);
  const selectedLabel = selectedOptions.length > 0 ? selectedOptions.map((option) => option.label).join(", ") : placeholder;
  const errorId = `${labelId}-error`;

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (event.target instanceof Node && wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOption(option: DropdownOption) {
    onChange(values.includes(option.value) ? values.filter((item) => item !== option.value) : [...values, option.value]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen && options[activeIndex]) toggleOption(options[activeIndex]);
      else setIsOpen(true);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current >= options.length - 1 ? 0 : current + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current <= 0 ? options.length - 1 : current - 1));
    }
    if (event.key === "Escape") setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <FieldLabel id={labelId}>{label}</FieldLabel>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`group flex h-12 w-full items-center justify-between rounded-[10px] border bg-white px-3 text-left font-sans text-[14px] outline-none transition hover:border-primary-05 focus:border-primary-06 focus:ring-[3px] focus:ring-primary-06/20 ${error ? "border-error" : "border-neutral-03"}`}
      >
        <span className={selectedOptions.length > 0 ? "truncate text-primary-10" : "truncate text-neutral-05"}>{selectedLabel}</span>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutral-01 text-primary-10 transition group-hover:bg-primary-01">
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>
      {isOpen ? (
        <div role="listbox" aria-multiselectable="true" className="absolute left-0 right-0 top-[78px] z-[60] max-h-[240px] overflow-y-auto rounded-[10px] border border-neutral-03 bg-white p-1 shadow-[0_14px_34px_rgba(7,22,44,0.16)]">
          {options.map((option, index) => {
            const selected = values.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggleOption(option)}
                className={`flex w-full items-center justify-between rounded-[8px] px-3 py-2.5 text-left text-[14px] text-primary-10 transition ${selected || activeIndex === index ? "bg-primary-01" : "hover:bg-neutral-01"}`}
              >
                <span>{option.label}</span>
                <span className={`grid h-4 w-4 place-items-center rounded-[4px] border text-[10px] ${selected ? "border-primary-06 bg-primary-06 text-white" : "border-neutral-03"}`}>{selected ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {error ? <p id={errorId} className="mt-1.5 text-[12px] text-error-on-dark">{error}</p> : null}
    </div>
  );
}

function QuoteForm() {
  const [fromLocation, setFromLocation] = useState<LocationResult | null>(null);
  const [toLocation, setToLocation] = useState<LocationResult | null>(null);
  const [itemTypes, setItemTypes] = useState<string[]>([]);
  const [collectionMode, setCollectionMode] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("");
  const [errors, setErrors] = useState<QuoteFormErrors>({});

  function clearError(field: keyof QuoteFormErrors) {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  }

  function validateQuoteForm() {
    const nextErrors: QuoteFormErrors = {};
    if (!fromLocation) nextErrors.fromLocation = "This field is required";
    if (!toLocation) nextErrors.toLocation = "This field is required";
    if (itemTypes.length === 0) nextErrors.itemTypes = "Select at least one item";
    if (!collectionMode) nextErrors.collectionMode = "This field is required";
    if (!deliveryMode) nextErrors.deliveryMode = "This field is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleQuoteSubmit() {
    if (!validateQuoteForm()) return;
    // The current codebase has no quote API submission yet. Preserve the validated state until that API exists.
  }

  return (
    <div className="w-full px-4 pb-8 pt-7 sm:px-6 lg:px-2 lg:pb-10 lg:pt-6">
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
        <LocationAutocomplete
          label="From*"
          helper="Enter postcode"
          placeholder="e.g Cr0 12t"
          flagSrc={ukFlagSrc}
          flagAlt="United Kingdom flag"
          countryCode="GB"
          value={fromLocation}
          onChange={(next) => {
            setFromLocation(next);
            clearError("fromLocation");
          }}
          error={errors.fromLocation}
        />
        <LocationAutocomplete
          label="To*"
          helper="Enter delivery location"
          placeholder="Enter full address"
          flagSrc={ngFlagSrc}
          flagAlt="Nigeria flag"
          countryCode="NG"
          value={toLocation}
          onChange={(next) => {
            setToLocation(next);
            clearError("toLocation");
          }}
          error={errors.toLocation}
        />
        <MultiSelectDropdownField
          label="What are you sending?*"
          placeholder="e.g Letters, Furniture etc"
          options={ITEM_TYPE_OPTIONS}
          values={itemTypes}
          onChange={(next) => {
            setItemTypes(next);
            clearError("itemTypes");
          }}
          error={errors.itemTypes}
        />
        <TextInput label="Kg*" placeholder="0" type="number" />
        <TextInput label="Length" placeholder="Item length" />
        <TextInput label="Width" placeholder="Item width" />
        <DropdownField
          label="Collection method"
          placeholder="Select an option"
          options={COLLECTION_OPTIONS}
          value={collectionMode}
          onChange={(next) => {
            setCollectionMode(next);
            clearError("collectionMode");
          }}
          error={errors.collectionMode}
        />
        <DropdownField
          label="Delivery method"
          placeholder="Select an option"
          options={DELIVERY_OPTIONS}
          value={deliveryMode}
          onChange={(next) => {
            setDeliveryMode(next);
            clearError("deliveryMode");
          }}
          error={errors.deliveryMode}
        />
      </div>
      <div className="mt-8 flex justify-center">
        <button type="button" onClick={handleQuoteSubmit} className="zion-btn zion-btn-md zion-btn-blue min-w-[144px] px-4">
          Get a quote <ArrowIcon />
        </button>
      </div>
    </div>
  );
}

function TrackShipmentForm() {
  const [trackingNumber, setTrackingNumber] = useState("");
  return (
    <div className="flex min-h-[350px] w-full flex-col items-center justify-between px-4 pb-10 pt-10 sm:px-6 lg:min-h-[412px] lg:pt-11">
      <div className="w-full max-w-[408px]">
        <TextInput
          label="Enter your tracking number"
          placeholder="e.g. ZNR-240518-7XQ9"
          value={trackingNumber}
          onChange={setTrackingNumber}
        />
        <p className="mt-2 font-sans text-[14px] leading-[22px] text-text-on-dark-muted">
          You’ll find your tracking number in your booking confirmation email.
        </p>
      </div>
      <button type="button" className="zion-btn zion-btn-md zion-btn-blue mt-10 px-4">
        Track shipment <ArrowIcon />
      </button>
    </div>
  );
}

function QuoteTabs({ activeTab, onChange }: { activeTab: ActiveTab; onChange: (tab: ActiveTab) => void }) {
  return (
    <div className="grid w-full max-w-[723px] grid-cols-2 overflow-hidden rounded-t-[16px]">
      <TabButton active={activeTab === "quote"} onClick={() => onChange("quote")} type="quote" title="Get an estimated quote" subtitle="Compare agents instantly" />
      <TabButton active={activeTab === "track"} onClick={() => onChange("track")} type="track" title="Track Shipment" subtitle="Track your shipment" />
    </div>
  );
}

function TabButton({ active, onClick, type, title, subtitle }: { active: boolean; onClick: () => void; type: ActiveTab; title: string; subtitle: string }) {
  const filled = type === "quote" ? "bg-primary-06" : "bg-secondary-09";
  const bar = type === "quote" ? "bg-secondary-06" : "bg-primary-06";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      id={type === "track" ? "track-shipment" : undefined}
      className={`relative min-h-[72px] px-2 pb-4 pt-2 text-center transition ${active ? filled : "bg-white/[0.07] hover:bg-white/[0.04]"}`}
    >
      <span className="flex items-center justify-center gap-1 text-neutral-01">
        {type === "quote" ? <CalculatorIcon /> : <PackageIcon />}
        <strong className="font-sans text-[13px] font-normal leading-[20px] sm:text-[16px] sm:leading-[26px]">{title}</strong>
      </span>
      <span className="block font-sans text-[11px] leading-[18px] text-text-on-dark-muted sm:text-[12px]">{subtitle}</span>
      <span className={`absolute bottom-0 left-0 h-3 w-full ${active ? bar : "bg-white/[0.05]"}`} />
    </button>
  );
}

function CalculatorIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="2" width="18" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h18M15 6h2M7 14h10M7 18h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5 3 7.2v9.6l9 4.7 9-4.7V7.2L12 2.5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 7.2 12 12l9-4.8M12 12v9.5M7.5 4.8l9 4.7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-[14px] w-[14px]" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 7h12M8 2.5 12.5 7 8 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function QuoteShipmentSection() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("quote");

  useEffect(() => {
    function syncTabWithHash() {
      if (window.location.hash === "#track-shipment") {
        setActiveTab("track");
      } else if (window.location.hash === "#get-quote") {
        setActiveTab("quote");
      }
    }

    syncTabWithHash();
    window.addEventListener("hashchange", syncTabWithHash);
    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

  return (
    <section id="get-quote" className="scroll-mt-24 bg-neutral-01 px-4 py-5 font-sans sm:px-6 lg:py-7">
      <div className="mx-auto flex w-full max-w-[1272px] flex-col items-center overflow-visible rounded-[16px] border border-primary-06/20 bg-primary-09">
        <QuoteTabs activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "quote" ? <QuoteForm /> : <TrackShipmentForm />}
      </div>
    </section>
  );
}
