"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  Dispatch,
  KeyboardEvent,
  ReactNode,
  SetStateAction,
} from "react";

import TrustFeatures from "./TrustFeatures";

const ukFlagSrc = "/images/United-Kingdom.svg";
const ngFlagSrc = "/images/Nigeria.svg";
const desktopBgSrc = "/images/man-smiling.jpg";

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

type ToggleableProps = {
  mobile?: boolean;
};

type QuoteButtonProps = ToggleableProps & {
  onClick?: () => void;
};

type QuoteFormErrors = {
  fromLocation?: string;
  toLocation?: string;
  itemTypes?: string;
  pickupMode?: string;
};

type MobileTabsProps = {
  activeTab: ActiveTab;
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
};

const ITEM_TYPE_OPTIONS: DropdownOption[] = [
  { value: "parcel", label: "Parcel / package" },
  { value: "documents", label: "Documents" },
  { value: "clothing", label: "Clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "household", label: "Household items" },
  { value: "other", label: "Other item" },
];

const PICKUP_OPTIONS: DropdownOption[] = [
  { value: "collection", label: "Pickup from address" },
  { value: "dropoff", label: "Drop off at agent" },
  { value: "door-to-door", label: "Door-to-door delivery" },
  { value: "receiver-pickup", label: "Receiver pickup" },
];

const desktopBackgroundStyle: CSSProperties = {
  backgroundImage: `linear-gradient(90deg, rgba(7, 22, 44, 0.5), rgba(7, 22, 44, 0.18)), url(${desktopBgSrc})`,
};

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
    <label
      id={id}
      htmlFor={htmlFor}
      className="mb-[6px] block text-[14px] font-light leading-none text-neutral-05"
    >
      {children}
    </label>
  );
}

function HelperText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-[8px] text-[14px] leading-none text-neutral-05 font-light">
      {children}
    </p>
  );
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

  const [query, setQuery] = useState<string>(value?.label ?? "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const trimmedQuery = query.trim();
  const isOpen = isFocused && trimmedQuery.length >= 2;
  const errorId = `${inputId}-error`;

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        wrapperRef.current &&
        !wrapperRef.current.contains(target)
      ) {
        setIsFocused(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);

        const mappedResults =
          countryCode === "GB" && hasUkAddressProvider()
            ? await searchGetAddressResults(trimmedQuery, controller.signal)
            : await searchPhotonResults(
                trimmedQuery,
                countryCode,
                controller.signal,
              );

        if (!isActive) return;

        setResults(mappedResults);
        setActiveIndex(mappedResults.length > 0 ? 0 : -1);
      } catch (error) {
        if (!isActive) return;

        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setResults([]);
        setActiveIndex(-1);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }, 280);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trimmedQuery, countryCode]);

  async function selectResult(result: LocationResult) {
    setIsFocused(false);
    setActiveIndex(-1);

    const selectedResult =
      result.source === "getaddress"
        ? await resolveGetAddressResult(result)
        : result;

    setQuery(selectedResult.label);
    onChange(selectedResult);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        results.length === 0
          ? -1
          : current >= results.length - 1
            ? 0
            : current + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        results.length === 0
          ? -1
          : current <= 0
            ? results.length - 1
            : current - 1,
      );
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
        <img
          src={flagSrc}
          alt={flagAlt}
          className="pointer-events-none absolute left-[13px] top-1/2 z-20 h-[17px] w-[24px] -translate-y-1/2 rounded-[2px] object-cover"
        />

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
          className={`h-[48px] w-full rounded-[8px] border bg-primary-09 pl-[55px] pr-4 font-sans text-[15px] leading-[1.25] text-neutral-01 outline-none placeholder:text-neutral-05 ${
            error
              ? "border-error focus:border-error"
              : "border-neutral-03 focus:border-neutral-03"
          }`}
        />

        {isOpen ? (
          <div
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-[56px] z-[999] max-h-[278px] overflow-y-auto rounded-[12px] border border-neutral-03 bg-primary-09 p-1"
          >
            {isLoading ? (
              <div className="px-4 py-3 text-[14px] leading-[1.45] text-neutral-05">
                Searching locations...
              </div>
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <button
                  key={result.id}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => void selectResult(result)}
                  className={`flex w-full items-start gap-3 rounded-[8px] px-3 py-[11px] text-left font-sans transition ${
                    activeIndex === index
                      ? "bg-primary-08 text-neutral-01"
                      : "bg-transparent text-neutral-01 hover:bg-primary-08"
                  }`}
                >
                  <img
                    src={flagSrc}
                    alt=""
                    className="mt-[2px] h-[14px] w-[21px] shrink-0 rounded-[2px] object-cover"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium leading-[1.25]">
                      {result.primary}
                    </span>

                    {result.secondary ? (
                      <span className="mt-[4px] block text-[12.5px] leading-[1.35] text-neutral-05">
                        {result.secondary}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-[14px] leading-[1.45] text-neutral-05">
                No matching locations found
              </div>
            )}
          </div>
        ) : null}
      </div>

      {helper ? <HelperText>{helper}</HelperText> : null}

      {error ? (
        <p
          id={errorId}
          className="mt-[7px] text-[12px] leading-none text-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TextInput({
  label,
  placeholder,
  unit,
  type = "text",
  defaultValue = "",
  value,
  onChange,
  className = "",
  error,
}: TextInputProps) {
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
          className={`h-[48px] w-full rounded-[8px] border bg-primary-09 px-[15px] font-sans text-[15px] leading-[1.25] text-neutral-01 outline-none placeholder:text-neutral-05 ${
            error
              ? "border-error focus:border-error"
              : "border-neutral-03 focus:border-neutral-03"
          }`}
        />

        {unit ? (
          <span className="pointer-events-none absolute right-[15px] top-1/2 -translate-y-1/2 text-[14px] text-neutral-05">
            {unit}
          </span>
        ) : null}
      </div>

      {error ? (
        <p
          id={errorId}
          className="mt-[7px] text-[12px] leading-none text-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DropdownField({
  label,
  placeholder,
  options,
  value,
  onChange,
  className = "",
  error,
}: DropdownFieldProps) {
  const labelId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const errorId = `${labelId}-error`;

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        wrapperRef.current &&
        !wrapperRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
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

      if (isOpen && options[activeIndex]) {
        selectOption(options[activeIndex]);
      } else {
        setIsOpen(true);
      }
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current >= options.length - 1 ? 0 : current + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current <= 0 ? options.length - 1 : current - 1,
      );
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <FieldLabel id={labelId}>{label}</FieldLabel>

      <button
        ref={buttonRef}
        type="button"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`flex h-[48px] w-full items-center justify-between rounded-[8px] border bg-primary-09 px-[15px] font-sans text-[15px] leading-[1.25] outline-none transition ${
          error
            ? "border-error focus:border-error"
            : "border-neutral-03 focus:border-neutral-03"
        }`}
      >
        <span
          className={
            selectedOption
              ? "truncate text-neutral-01"
              : "truncate text-neutral-05"
          }
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDownIcon
          className={`shrink-0 text-neutral-05 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[74px] z-[999] max-h-[220px] overflow-y-auto rounded-[12px] border border-neutral-03 bg-primary-09 p-1"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
              className={`block w-full rounded-[8px] px-3 py-[10px] text-left font-sans text-[14px] leading-[1.25] transition ${
                option.value === value || activeIndex === index
                  ? "bg-primary-08 text-neutral-01"
                  : "bg-transparent text-neutral-01 hover:bg-primary-08"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <p
          id={errorId}
          className="mt-[7px] text-[12px] leading-none text-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function MultiSelectDropdownField({
  label,
  placeholder,
  options,
  values,
  onChange,
  className = "",
  error,
}: MultiSelectDropdownFieldProps) {
  const labelId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOptions = useMemo(
    () => options.filter((option) => values.includes(option.value)),
    [options, values],
  );

  const selectedLabel =
    selectedOptions.length > 0
      ? selectedOptions.map((option) => option.label).join(", ")
      : placeholder;

  const errorId = `${labelId}-error`;

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        wrapperRef.current &&
        !wrapperRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOption(option: DropdownOption) {
    const nextValues = values.includes(option.value)
      ? values.filter((value) => value !== option.value)
      : [...values, option.value];

    onChange(nextValues);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isOpen && options[activeIndex]) {
        toggleOption(options[activeIndex]);
      } else {
        setIsOpen(true);
      }
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current >= options.length - 1 ? 0 : current + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        current <= 0 ? options.length - 1 : current - 1,
      );
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <FieldLabel id={labelId}>{label}</FieldLabel>

      <button
        ref={buttonRef}
        type="button"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`flex h-[48px] w-full items-center justify-between rounded-[8px] border bg-primary-09 px-[15px] font-sans text-[15px] leading-[1.25] outline-none transition ${
          error
            ? "border-error focus:border-error"
            : "border-neutral-03 focus:border-neutral-03"
        }`}
      >
        <span
          className={
            selectedOptions.length > 0
              ? "truncate text-neutral-01"
              : "truncate text-neutral-05"
          }
        >
          {selectedLabel}
        </span>

        <ChevronDownIcon
          className={`shrink-0 text-neutral-05 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 right-0 top-[74px] z-[999] max-h-[220px] overflow-y-auto rounded-[12px] border border-neutral-03 bg-primary-09 p-1"
        >
          {options.map((option, index) => {
            const isSelected = values.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggleOption(option)}
                className={`flex w-full items-center gap-2 rounded-[8px] px-3 py-[10px] text-left font-sans text-[14px] leading-[1.25] transition ${
                  isSelected || activeIndex === index
                    ? "bg-primary-08 text-neutral-01"
                    : "bg-transparent text-neutral-01 hover:bg-primary-08"
                }`}
              >
                <span
                  className={`flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[4px] border text-[11px] leading-none ${
                    isSelected
                      ? "border-primary-06 bg-primary-06 text-neutral-01"
                      : "border-neutral-03 text-transparent"
                  }`}
                >
                  ✓
                </span>

                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {error ? (
        <p
          id={errorId}
          className="mt-[7px] text-[12px] leading-none text-error"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function BenefitsRow({ mobile = false }: ToggleableProps) {
  return (
    <div
      className={
        mobile
          ? "mt-[15px] flex items-center justify-between gap-3 overflow-hidden whitespace-nowrap text-[11px] leading-none text-neutral-05"
          : "mt-[8px] flex flex-wrap items-center gap-x-[23px] gap-y-2 text-[14px] leading-none text-neutral-05"
      }
    >
      <span>✓&nbsp; Free to use</span>
      <span>✓&nbsp; No hidden fees</span>
      <span>✓&nbsp; Save up to 40%</span>
    </div>
  );
}

function QuoteButton({ mobile = false, onClick }: QuoteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        mobile
          ? "zion-btn zion-btn-sm zion-btn-orange w-full mt-[36px]"
          : "zion-btn zion-btn-sm zion-btn-orange mt-[34px]"
      }
    >
      Get Quote
      <span className="ml-2 text-[19px] leading-none">→</span>
    </button>
  );
}

function QuoteForm({ mobile = false }: ToggleableProps) {
  const [fromLocation, setFromLocation] = useState<LocationResult | null>(null);
  const [toLocation, setToLocation] = useState<LocationResult | null>(null);
  const [itemTypes, setItemTypes] = useState<string[]>([]);
  const [pickupMode, setPickupMode] = useState("");
  const [errors, setErrors] = useState<QuoteFormErrors>({});

  function clearError(field: keyof QuoteFormErrors) {
    setErrors((current) => {
      if (!current[field]) return current;

      return {
        ...current,
        [field]: undefined,
      };
    });
  }

  function validateQuoteForm(): boolean {
    const nextErrors: QuoteFormErrors = {};

    if (!fromLocation) {
      nextErrors.fromLocation = "This field is required";
    }

    if (!toLocation) {
      nextErrors.toLocation = "This field is required";
    }

    if (itemTypes.length === 0) {
      nextErrors.itemTypes = "Select at least one item";
    }

    if (!pickupMode) {
      nextErrors.pickupMode = "This field is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleQuoteSubmit() {
    const isValid = validateQuoteForm();

    if (!isValid) {
      return;
    }

    // Form is valid here. Connect this block to the quote API when ready.
  }

  if (mobile) {
    return (
      <div className="px-[13px] pb-[27px] pt-[17px]">
        <LocationAutocomplete
          label="From"
          helper="Enter postcode"
          placeholder="Collection Location"
          flagSrc={ukFlagSrc}
          flagAlt="United Kingdom flag"
          countryCode="GB"
          value={fromLocation}
          onChange={(value) => {
            setFromLocation(value);
            clearError("fromLocation");
          }}
          error={errors.fromLocation}
        />

        <LocationAutocomplete
          label="To"
          helper="Enter delivery location"
          placeholder="Delivery Location"
          flagSrc={ngFlagSrc}
          flagAlt="Nigeria flag"
          countryCode="NG"
          value={toLocation}
          onChange={(value) => {
            setToLocation(value);
            clearError("toLocation");
          }}
          className="mt-[22px]"
          error={errors.toLocation}
        />

        <div className="mt-[22px] grid grid-cols-[124px_minmax(0,1fr)] gap-x-[35px]">
          <TextInput label="Weight" unit="kg" type="number" defaultValue={0} />

          <MultiSelectDropdownField
            label="What are you sending"
            placeholder="Select item type"
            options={ITEM_TYPE_OPTIONS}
            values={itemTypes}
            onChange={(values) => {
              setItemTypes(values);
              clearError("itemTypes");
            }}
            error={errors.itemTypes}
          />
        </div>

        <div className="mt-[22px] grid grid-cols-[137px_minmax(0,1fr)] gap-x-[24px]">
          <TextInput label="Length" placeholder="Item length" />
          <TextInput label="Width" placeholder="Item width" />
        </div>

        <DropdownField
          label="Pickup / drop off"
          placeholder="Select item type"
          options={PICKUP_OPTIONS}
          value={pickupMode}
          onChange={(value) => {
            setPickupMode(value);
            clearError("pickupMode");
          }}
          className="mt-[22px] w-[225px]"
          error={errors.pickupMode}
        />

        <QuoteButton mobile onClick={handleQuoteSubmit} />
        <BenefitsRow mobile />
      </div>
    );
  }

  return (
    <div className="px-[22px] pb-[25px] pt-[16px]">
      <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_110px] gap-x-[18px] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_135px] xl:gap-x-[26px]">
        <LocationAutocomplete
          label="From"
          helper="Enter postcode"
          placeholder="flat 12, 3 fell road, croydon"
          flagSrc={ukFlagSrc}
          flagAlt="United Kingdom flag"
          countryCode="GB"
          value={fromLocation}
          onChange={(value) => {
            setFromLocation(value);
            clearError("fromLocation");
          }}
          error={errors.fromLocation}
        />

        <LocationAutocomplete
          label="To"
          helper="Enter delivery location"
          placeholder="Magodo phase 2"
          flagSrc={ngFlagSrc}
          flagAlt="Nigeria flag"
          countryCode="NG"
          value={toLocation}
          onChange={(value) => {
            setToLocation(value);
            clearError("toLocation");
          }}
          error={errors.toLocation}
        />

        <TextInput label="Weight" unit="kg" type="number" defaultValue={0} />
      </div>

      <div className="mt-[28px] grid grid-cols-[minmax(150px,1.25fr)_minmax(90px,0.75fr)_minmax(100px,0.9fr)_minmax(150px,1.25fr)] gap-x-[18px] xl:grid-cols-[minmax(190px,1.25fr)_minmax(110px,0.75fr)_minmax(130px,0.9fr)_minmax(190px,1.25fr)] xl:gap-x-[25px]">
        <MultiSelectDropdownField
          label="What are you sending"
          placeholder="Select item type"
          options={ITEM_TYPE_OPTIONS}
          values={itemTypes}
          onChange={(values) => {
            setItemTypes(values);
            clearError("itemTypes");
          }}
          error={errors.itemTypes}
        />

        <TextInput label="Length" placeholder="Item length" />
        <TextInput label="Width" placeholder="Item width" />

        <DropdownField
          label="Pickup / drop off"
          placeholder="Select item type"
          options={PICKUP_OPTIONS}
          value={pickupMode}
          onChange={(value) => {
            setPickupMode(value);
            clearError("pickupMode");
          }}
          error={errors.pickupMode}
        />
      </div>

      <BenefitsRow />
      <QuoteButton onClick={handleQuoteSubmit} />
    </div>
  );
}

function TrackShipmentForm({ mobile = false }: ToggleableProps) {
  return (
    <div
      className={
        mobile
          ? "px-[13px] pb-[27px] pt-[18px]"
          : "relative z-10 px-[30px] pt-[16px] before:absolute before:left-[-1px] before:top-[-72px] before:z-30 before:h-[326px] before:w-px before:bg-primary-08 before:content-['']"
      }
    >
      <TextInput
        label="Enter your tracking number"
        placeholder="e.g. ZNR-240518-7XQ9"
        className={mobile ? "w-full" : "w-full max-w-[374px]"}
      />

      <button
        type="button"
        className={
          mobile
            ? "mt-[12px] block w-full text-right font-sans text-[14px] text-neutral-05"
            : "mt-[12px] block w-full max-w-[374px] text-right font-sans text-[14px] text-neutral-05"
        }
      >
        How to find your tracking number?
      </button>

      <button
        type="button"
        className={
          mobile
            ? "zion-btn zion-btn zion-btn-sm zion-btn-blue w-full mt-[28px]"
            : "zion-btn zion-btn zion-btn-sm zion-btn-blue mt-[29px]"
        }
      >
        Track Shipment
        <span className="ml-2 text-[19px] leading-none">→</span>
      </button>
    </div>
  );
}

function DesktopHeaders() {
  return (
    <div className="grid h-[72px] grid-cols-[minmax(0,1fr)_minmax(360px,420px)] overflow-hidden rounded-t-[0px] xl:grid-cols-[minmax(0,1fr)_minmax(440px,515px)]">
      <div className="relative bg-primary-06 text-neutral-01">
        <div className="flex h-[58px] items-center justify-center gap-[82px]">
          <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[40px] bg-primary-07 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
            >
              <rect
                x="0.720001"
                y="0.719971"
                width="20"
                height="20"
                stroke="white"
                strokeWidth="1.44"
                strokeLinecap="square"
                strokeLinejoin="round"
              />
              <path
                d="M9.35999 5.52002H11.28"
                stroke="white"
                strokeWidth="1.44"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.16 9.35999H18.48"
                stroke="white"
                strokeWidth="1.44"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.51999 13.2H6.47999M14.16 13.2H15.12M10.8 13.2H9.83998"
                stroke="white"
                strokeWidth="1.44"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.51999 17.0399H6.47999M14.16 17.0399H15.12M10.8 17.0399H9.83998"
                stroke="white"
                strokeWidth="1.44"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="text-center">
            <h2 className="font-display lg:text-[18px] text-[16px] font-bold lg:font-light leading-none text-white">
              Get a Quote
            </h2>
            <p className="mt-[8px] font-display text-[14px] leading-none font-light text-white">
              Find the best rate from trusted agents
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-[13px] w-full bg-secondary-06" />
      </div>

      <div className="flex h-[72px] items-center gap-[17px] bg-secondary-06 pl-[28px] text-primary-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M11.998 10L20.998 6L11.998 2L2.99805 6L11.998 10Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.498 4L7.49805 8"
            stroke="black"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M3.00195 6V18L11.998 22M11.998 22L21.002 18V6.01357M11.998 22V10"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.99805 11L8.49805 12"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div>
          <h2 className="font-sans lg:text-[18px] text-[16px] lg:font-light leading-none text-black font-bold">
            Track Shipment
          </h2>
          <p className="mt-[9px] font-sans text-[14px] leading-none text-secondary-10 font-light">
            Find the best rate from trusted agents
          </p>
        </div>
      </div>
    </div>
  );
}

function MobileTabs({ activeTab, setActiveTab }: MobileTabsProps) {
  return (
    <div className="relative grid h-[58px] grid-cols-[195px_minmax(0,1fr)] overflow-hidden bg-primary-09">
      <span
        aria-hidden="true"
        className="absolute left-[195px] top-1/2 z-20 h-[76%] w-px -translate-y-1/2 bg-primary-06/30"
      />

      <button
        type="button"
        onClick={() => setActiveTab("quote")}
        className={`relative px-[17px] text-left font-sans text-[15px] ${
          activeTab === "quote"
            ? "bg-primary-06 font-semibold text-neutral-01 after:absolute after:bottom-0 after:left-0 after:h-[4px] after:w-full after:bg-secondary-06"
            : "bg-primary-09 font-medium text-neutral-05"
        }`}
      >
        Get a Quote
      </button>

      <button
        type="button"
        onClick={() => setActiveTab("track")}
        className={`relative px-[18px] text-left font-sans text-[15px] ${
          activeTab === "track"
            ? "bg-primary-06 font-semibold text-neutral-01 after:absolute after:bottom-0 after:left-0 after:h-[4px] after:w-full after:bg-secondary-06"
            : "bg-primary-09 font-medium text-neutral-05"
        }`}
      >
        Track Shipment
      </button>
    </div>
  );
}

export default function QuoteShipmentSection() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("quote");

  return (
    <>
      <section className="relative overflow-visible bg-transparent px-4 py-[30px] font-sans text-neutral-01 sm:px-6 bg-primary-09 lg:px-8">
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat lg:block"
          style={desktopBackgroundStyle}
          aria-hidden="true"
        />

        <div className="relative mx-auto hidden min-h-[409px] max-w-[1420px] overflow-visible rounded-b-[14px] bg-primary-09 lg:block">
          <DesktopHeaders />

          <div className="grid min-h-[337px] grid-cols-[minmax(0,1fr)_minmax(360px,420px)] overflow-visible xl:grid-cols-[minmax(0,1fr)_minmax(440px,515px)]">
            <QuoteForm />
            <TrackShipmentForm />
          </div>
        </div>

        <div className="relative mx-auto max-w-[365px] overflow-visible rounded-b-[14px] bg-primary-09 lg:hidden">
          <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === "quote" ? (
            <QuoteForm mobile />
          ) : (
            <TrackShipmentForm mobile />
          )}
        </div>
      </section>

      <TrustFeatures />
    </>
  );
}
