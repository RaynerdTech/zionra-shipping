"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { CountryCode } from "libphonenumber-js";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import CountrySelect from "@/components/ui/CountrySelect";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { APPLICATION_STEP_RANK, FIELD_LABEL_CLASS, REQUIRED_CLASS } from "./constants";
import type { ApiErrorResponse, PartnerApplicationStep } from "./types";

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 14 14" className={`h-3.5 w-3.5 ${className}`} fill="none">
      <path d="M4.083 5.833 7 8.75l2.917-2.917" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BackArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-5 w-5 ${className}`} fill="none">
      <path d="M16 10H4m5-5-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none">
      <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
}) {
  const content = (
    <>
      {children}
      {required ? <span className={REQUIRED_CLASS}> *</span> : null}
    </>
  );

  return htmlFor ? (
    <label htmlFor={htmlFor} className={FIELD_LABEL_CLASS}>
      {content}
    </label>
  ) : (
    <span className={FIELD_LABEL_CLASS}>{content}</span>
  );
}

export function FieldError({ children }: { children?: string }) {
  return children ? <p className="zion-field-error mt-1">{children}</p> : null;
}

export function ApplicationSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-6 items-center rounded-md bg-primary-01 pl-4 font-sans text-xs font-normal text-primary-06 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-md before:bg-primary-06">
      {children}
    </div>
  );
}

export function ApplicationLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-01 text-primary-06">
      <LoadingSpinner />
      <span className="sr-only">Loading partner application</span>
    </main>
  );
}

export function ApplicationLoadError({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-01 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-02 bg-white p-6 text-center">
        <h1 className="font-display text-xl font-semibold text-primary-10">Unable to load application</h1>
        <p className="mt-2 font-sans text-sm leading-6 text-text-body-light">{message}</p>
        <Link href={routes.web.partnerApplication} className="zion-btn zion-btn-outline-blue zion-btn-md mt-6">
          Back to partner registration
        </Link>
      </div>
    </main>
  );
}

const STEP_LINKS = [
  { number: 1, label: "Business Information", step: "BUSINESS_INFORMATION" as const, href: routes.web.partnerBusinessInformation },
  { number: 2, label: "Operational Details", step: "OPERATIONAL_DETAILS" as const, href: routes.web.partnerOperationalDetails },
  { number: 3, label: "Account Information", step: "ACCOUNT_INFORMATION" as const, href: routes.web.partnerAccountInformation },
];

function ApplicationSteps({ activeStep, currentStep }: { activeStep: 1 | 2 | 3; currentStep: PartnerApplicationStep }) {
  const currentRank = APPLICATION_STEP_RANK[currentStep];

  return (
    <nav aria-label="Application progress" className="mx-auto w-full max-w-[620px] overflow-hidden">
      <ol className="flex w-full min-w-0 items-center justify-center gap-2 sm:gap-3 lg:gap-10">
        {STEP_LINKS.map((item) => {
          const enabled = currentRank >= item.number;
          const active = activeStep === item.number;
          const visibleOnSmallScreens =
            item.number === activeStep || item.number === activeStep + 1;
          const stretchOnSmallScreens = activeStep < STEP_LINKS.length;

          const content = (
            <span
              className={`inline-flex h-8 max-w-full items-center justify-center gap-1.5 rounded-md px-2 font-sans text-[11px] leading-4 sm:px-2.5 lg:w-auto lg:px-2.5 lg:text-xs ${
                stretchOnSmallScreens ? "w-full" : "w-auto"
              } ${active ? "bg-neutral-01 text-neutral-10" : "text-neutral-06"}`}
            >
              <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] text-white ${active ? "bg-primary-06" : "bg-neutral-06"}`}>
                {item.number}
              </span>
              <span className="min-w-0 whitespace-nowrap">{item.label}</span>
            </span>
          );

          return (
            <li
              key={item.number}
              className={`${
                visibleOnSmallScreens
                  ? stretchOnSmallScreens
                    ? "min-w-0 flex-1"
                    : "shrink-0"
                  : "hidden"
              } lg:block lg:flex-none`}
            >
              {enabled ? <Link href={item.href}>{content}</Link> : <span aria-disabled="true">{content}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CancelApplicationModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && !isCancelling) onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isCancelling, onClose]);

  async function cancelApplication() {
    if (isCancelling) return;
    setIsCancelling(true);
    setError("");

    try {
      const response = await fetch(buildApiUrl(routes.api.partnerAuth.application), {
        method: "DELETE",
        credentials: "include",
      });
      const result = (await response.json().catch(() => ({}))) as ApiErrorResponse;
      if (!response.ok) throw new Error(result.message ?? "Unable to cancel the application.");
      router.replace(routes.web.partnerApplication);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Unable to cancel the application.");
      setIsCancelling(false);
    }
  }

  return (
    <div role="presentation" className="fixed inset-0 z-[100] flex items-end justify-center bg-primary-10/55 md:items-center md:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !isCancelling) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="cancel-application-title" className="w-full rounded-t-2xl border border-primary-02 bg-primary-01 text-center shadow-2xl md:max-w-[460px] md:rounded-2xl">
        <div className="px-6 pb-5 pt-6">
          <h2 id="cancel-application-title" className="font-display text-2xl font-semibold text-primary-10">Cancel Application</h2>
          <p className="mx-auto mt-2 max-w-[310px] font-sans text-base font-semibold leading-6 text-text-body-light">Are you sure you want to cancel the application?</p>
          {error ? <p className="zion-field-error mt-3">{error}</p> : null}
        </div>
        <button type="button" disabled={isCancelling} onClick={onClose} className="block w-full border-t border-primary-02 bg-transparent px-5 py-4 font-sans text-lg text-neutral-10 hover:bg-white/50 disabled:opacity-60">No</button>
        <button type="button" disabled={isCancelling} onClick={cancelApplication} className="block w-full rounded-b-2xl border-t border-primary-02 bg-transparent px-5 py-4 font-sans text-lg text-error transition-colors hover:bg-white/50 active:text-[#BF1A10] disabled:opacity-60">
          {isCancelling ? "Cancelling…" : "Cancel application"}
        </button>
      </section>
    </div>
  );
}

export function PartnerApplicationShell({
  activeStep,
  currentStep,
  headerTitle,
  headerDescription,
  pageTitle,
  pageSubtitle = "Fill all the required fields",
  showSteps = true,
  children,
}: {
  activeStep?: 1 | 2 | 3;
  currentStep: PartnerApplicationStep;
  headerTitle: string;
  headerDescription?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  showSteps?: boolean;
  children: ReactNode;
}) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  return (
    <main className="min-h-screen overflow-x-clip bg-white">
      <header className="relative overflow-hidden bg-primary-10 px-4 pb-7 pt-4 text-white md:px-14 md:pb-9 md:pt-8 xl:px-[72px]">
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-primary-06/[0.07]" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-5 -top-14 h-48 w-48 rounded-full bg-primary-06/[0.09]" />
        <div className="relative z-10 mx-auto max-w-[1120px]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <Image src="/images/logo-zionra.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" priority />
              <span className="font-display text-base font-bold">zionra</span>
            </div>
            <button type="button" onClick={() => setShowCancelModal(true)} className="inline-flex items-center gap-1.5 font-sans text-[11px] text-neutral-03 transition-colors hover:text-error active:text-[#BF1A10] lg:hidden">
              <CloseIcon /> Cancel Application
            </button>
          </div>
          <h1 className="mt-4 font-display text-[24px] font-semibold leading-8 tracking-[-0.5px] md:mt-5 md:text-[34px] md:leading-[44px]">{headerTitle}</h1>
          <div className="mt-2 h-[3px] w-14 rounded-full bg-secondary-06 md:w-[72px]" />
          {headerDescription ? (
            <p className="mt-3 max-w-[520px] font-sans text-base font-normal leading-[26px] text-[#D4DAE0]">
              {headerDescription}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-[1120px] px-4 pb-12 pt-4 sm:px-6 md:px-10 md:pt-6">
        {showSteps && activeStep ? (
          <div className="lg:grid lg:grid-cols-[minmax(170px,1fr)_minmax(0,620px)_minmax(170px,1fr)] lg:items-center">
            <button type="button" onClick={() => setShowCancelModal(true)} className="hidden items-center gap-1.5 justify-self-start font-sans text-xs text-neutral-08 transition-colors hover:text-error active:text-[#BF1A10] lg:inline-flex">
              <CloseIcon /> Cancel Application
            </button>
            <ApplicationSteps activeStep={activeStep} currentStep={currentStep} />
            <span aria-hidden="true" className="hidden lg:block" />
          </div>
        ) : (
          <button type="button" onClick={() => setShowCancelModal(true)} className="hidden items-center gap-1.5 font-sans text-xs text-neutral-08 transition-colors hover:text-error active:text-[#BF1A10] lg:inline-flex">
            <CloseIcon /> Cancel Application
          </button>
        )}

        {pageTitle ? (
          <div className="mx-auto mt-5 max-w-[680px] text-center md:mt-8">
            <h2 className="font-display text-2xl font-semibold leading-8 text-primary-10 md:text-[28px] md:leading-9">{pageTitle}</h2>
            <p className="mt-0.5 font-sans text-sm text-neutral-06">{pageSubtitle}</p>
            <div className="mx-auto mt-3 h-px w-full bg-primary-04 md:hidden" />
          </div>
        ) : null}

        <div className="mx-auto mt-5 w-full max-w-[680px] md:mt-7">{children}</div>
      </div>

      {showCancelModal ? <CancelApplicationModal onClose={() => setShowCancelModal(false)} /> : null}
    </main>
  );
}

export function PartnerSelect({
  id,
  value,
  options,
  placeholder,
  onChange,
  error,
}: {
  id: string;
  value: string;
  options: readonly string[];
  placeholder: string;
  onChange: (value: string) => void;
  error?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button id={id} type="button" aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={listboxId} aria-invalid={error || undefined} onClick={() => setIsOpen((open) => !open)} className={`zion-input flex h-[52px] w-full items-center justify-between gap-3 text-left md:h-12 ${error ? "zion-input-error" : isOpen ? "border-2 border-primary-06" : ""}`}>
        <span className={`min-w-0 flex-1 truncate ${value ? "text-neutral-10" : "text-neutral-05"}`}>{value || placeholder}</span>
        <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-01 text-primary-08 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}><ChevronIcon /></span>
      </button>
      {isOpen ? (
        <div id={listboxId} role="listbox" aria-labelledby={id} className="absolute inset-x-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-lg border border-neutral-03 bg-white py-1 shadow-[0_10px_30px_rgba(7,22,44,0.14)]">
          {options.map((option) => {
            const selected = option === value;
            return (
              <button key={option} type="button" role="option" aria-selected={selected} onClick={() => { onChange(option); setIsOpen(false); }} className={`flex w-full min-w-0 items-center justify-between gap-3 px-3 py-2.5 text-left font-sans text-sm leading-[22px] transition-colors ${selected ? "bg-primary-06 text-white" : "text-neutral-10 hover:bg-primary-01"}`}>
                <span className="block min-w-0 break-words">{option}</span>
                {selected ? <span className="shrink-0 text-white">✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function PartnerMultiSelect({
  id,
  values,
  options,
  placeholder,
  onChange,
  error,
}: {
  id: string;
  values: string[];
  options: readonly string[];
  placeholder: string;
  onChange: (values: string[]) => void;
  error?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function toggle(option: string) {
    onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option]);
  }

  return (
    <div ref={rootRef} className="relative">
      <button id={id} type="button" aria-haspopup="listbox" aria-expanded={isOpen} aria-invalid={error || undefined} onClick={() => setIsOpen((open) => !open)} className={`zion-input flex min-h-[52px] w-full items-center justify-between gap-3 py-2 text-left md:min-h-12 ${error ? "zion-input-error" : isOpen ? "border-2 border-primary-06" : ""}`}>
        <span className={values.length ? "min-w-0 flex-1 truncate text-neutral-10" : "text-neutral-05"}>{values.length ? `${values.length} selected` : placeholder}</span>
        <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-01 text-primary-08 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}><ChevronIcon /></span>
      </button>
      {isOpen ? (
        <div role="listbox" aria-multiselectable="true" aria-labelledby={id} className="absolute inset-x-0 z-50 mt-2 max-h-[330px] overflow-y-auto rounded-xl border border-primary-02 bg-white p-2 shadow-[0_14px_32px_rgba(7,30,61,0.16)]">
          {options.map((option) => {
            const selected = values.includes(option);
            return (
              <button key={option} type="button" role="option" aria-selected={selected} onClick={() => toggle(option)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-sans text-sm ${selected ? "bg-primary-01 text-primary-08" : "text-neutral-09 hover:bg-primary-01/70"}`}>
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${selected ? "border-primary-06 bg-primary-06 text-white" : "border-neutral-04 bg-white"}`}>{selected ? "✓" : ""}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {values.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((value) => <span key={value} className="inline-flex items-center gap-1 rounded bg-primary-01 px-2 py-1 font-sans text-[11px] text-primary-08">{value}<button type="button" aria-label={`Remove ${value}`} onClick={() => toggle(value)} className="text-primary-06"><CloseIcon /></button></span>)}
        </div>
      ) : null}
    </div>
  );
}

export function TagsInput({
  id,
  values,
  placeholder,
  onChange,
  error,
}: {
  id: string;
  values: string[];
  placeholder: string;
  onChange: (values: string[]) => void;
  error?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function addDraft() {
    const next = draft.trim().replace(/,$/, "");
    if (!next) return;
    if (!values.some((value) => value.toLowerCase() === next.toLowerCase())) onChange([...values, next]);
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addDraft();
    }
    if (event.key === "Backspace" && !draft && values.length) onChange(values.slice(0, -1));
  }

  return (
    <div
      className={`zion-input !h-auto min-h-[52px] w-full min-w-0 flex-wrap content-start items-center gap-1.5 overflow-hidden px-3 py-2 md:min-h-12 ${
        error
          ? "zion-input-error"
          : "focus-within:border-2 focus-within:border-primary-06"
      }`}
    >
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex max-w-full min-w-0 shrink-0 items-center gap-1 rounded bg-primary-01 px-2 py-1 font-sans text-xs text-primary-08"
        >
          <span className="max-w-[180px] truncate sm:max-w-[240px]">
            {value}
          </span>
          <button
            type="button"
            aria-label={`Remove ${value}`}
            onClick={() =>
              onChange(values.filter((item) => item !== value))
            }
            className="shrink-0 text-primary-06"
          >
            <CloseIcon />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={addDraft}
        placeholder={values.length ? "Add another city" : placeholder}
        className="min-w-[120px] flex-[1_1_120px] border-0 bg-transparent px-0 py-1 font-sans text-base font-normal leading-[26px] text-neutral-10 outline-none placeholder:text-neutral-05"
      />
    </div>
  );
}

export function PhoneField({
  id,
  country,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  placeholder = "0000 0000 00",
  error,
}: {
  id: string;
  country: CountryCode;
  phoneNumber: string;
  onCountryChange: (country: CountryCode, callingCode: string) => void;
  onPhoneChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  return (
    <div className="grid grid-cols-[116px_minmax(0,1fr)] gap-3">
      <CountrySelect
        id={`${id}Country`}
        value={country}
        compact
        ariaLabel="Phone country code"
        onChange={(selected) =>
          onCountryChange(selected.code, selected.callingCode)
        }
      />
      <input id={id} type="tel" value={phoneNumber} onChange={(event) => onPhoneChange(event.target.value)} placeholder={placeholder} className="zion-input h-[52px] min-w-0 md:h-12" aria-invalid={error || undefined} />
    </div>
  );
}

export function AddContactButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="zion-btn zion-btn-md zion-btn-outline-blue"><PlusIcon /> Add Contact</button>;
}