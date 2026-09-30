/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentPropsWithoutRef, FormEvent, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CountryCode } from "libphonenumber-js";
import type { QuoteAgentDetail } from "./types";
import CountrySelect from "@/components/ui/CountrySelect";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import {
  quoteItemLabel,
  readQuoteDraft,
  readSelectedQuoteAgent,
  readShipmentDraft,
  type QuoteDraft,
  type QuoteLocation,
  type SelectedQuoteAgent,
  writeShipmentDraft,
} from "@/lib/quoteFlow";
import QuoteSummaryBar from "./QuoteSummaryBar";
import QuoteLocationInput from "./QuoteLocationInput";

type CustomerResponse = {
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneCountryCode: string;
    phoneNumber: string;
  };
};

type FormState = {
  senderFullName: string;
  senderPhoneCountryCode: CountryCode;
  senderPhoneNumber: string;
  senderEmail: string;
  pickupAddress: string;
  pickupCity: string;
  pickupPostcode: string;
  receiverFullName: string;
  receiverPhoneCountryCode: CountryCode;
  receiverPhoneNumber: string;
  receiverEmail: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPostcode: string;
  itemsDescription: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  declaredValueGbp: string;
};

function countryCodeFromCallingCode(callingCode: string, fallback: CountryCode): CountryCode {
  return COUNTRY_OPTIONS.find((country) => country.callingCode === callingCode)?.code ?? fallback;
}

function callingCode(countryCode: CountryCode) {
  return COUNTRY_OPTIONS.find((country) => country.code === countryCode)?.callingCode ?? "";
}

function postcodeFromLabel(label: string) {
  const match = label.match(/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i);
  return match?.[0]?.toUpperCase() ?? "";
}

function locationFromForm(address: string, city: string, postcode: string, state = ""): QuoteLocation | null {
  if (!address.trim()) return null;
  return {
    label: address,
    primary: address.split(",")[0]?.trim() || address,
    secondary: [city, state, postcode].filter(Boolean).join(", "),
    city,
    coordinates: null,
    postcode,
    state,
  };
}

function money(value: number | null) {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

function Field({ label, required = false, value, onChange, placeholder, type = "text", span = "" }: { label: string; required?: boolean; value: string; onChange: (value: string) => void; placeholder?: string; type?: ComponentPropsWithoutRef<"input">["type"]; span?: string }) {
  return (
    <label className={span}>
      <span className="mb-2 block text-[12px] leading-[18px] text-neutral-10">{label}{required ? <span className="text-error"> *</span> : null}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="zion-input h-[44px] text-[13px]" />
    </label>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-2 text-primary-10">
      <span className="grid h-5 w-5 place-items-center rounded-full border border-neutral-04">
        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="4.5" stroke="currentColor" /><path d="M8 5.5v5M5.5 8h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
      </span>
      <h2 className="font-display text-[15px] font-semibold leading-[22px]">{children}</h2>
    </div>
  );
}

function AgentSummaryCard({ agent, onUnselect, returning = false }: { agent: SelectedQuoteAgent; onUnselect: () => void; returning?: boolean }) {
  return (
    <section className="grid gap-4 rounded-[10px] border border-neutral-02 bg-white px-5 py-4 sm:grid-cols-[minmax(0,1fr)_120px]">
      <div className="flex min-w-0 gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-01">{agent.logoUrl ? <img src={agent.logoUrl} alt={`${agent.companyName} logo`} className="h-full w-full object-cover" /> : <img src="/images/logo-zionra.png" alt="" className="h-6 w-6 object-contain" />}</div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><h1 className="font-display text-[15px] font-semibold text-primary-10">{agent.companyName}</h1>{agent.verified ? <span className="rounded-full bg-tertiary-10 px-2 py-0.5 text-[9px] text-white">✓ Verified</span> : null}</div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-06"><span className="text-secondary-06">★ {agent.rating !== null ? agent.rating.toFixed(1) : "—"}</span><span>·</span><span>{agent.reviewCount ? `${agent.reviewCount} reviews` : "No reviews yet"}</span></div>
          <div className="mt-3 flex flex-wrap gap-2 text-[9px] text-neutral-08"><span className="rounded-full border border-neutral-03 bg-neutral-01 px-2 py-1">Response Time: {agent.responseTime ?? "Not provided"}</span><span className="rounded-full border border-neutral-03 bg-neutral-01 px-2 py-1">Collection Method: {agent.collectionMethod ?? "Not provided"}</span><span className="rounded-full border border-neutral-03 bg-neutral-01 px-2 py-1">Delivery Method: {agent.deliveryMethod ?? "Not provided"}</span></div>
        </div>
      </div>
      <div className="flex flex-col items-stretch justify-center border-t border-neutral-02 pt-3 sm:items-end sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"><strong className="font-display text-[17px] text-primary-10 sm:text-right">{money(agent.estimatedPriceGbp)}</strong><button type="button" onClick={onUnselect} disabled={returning} className="zion-btn zion-btn-orange mt-3 min-h-[42px] w-full text-[12px] disabled:cursor-wait disabled:opacity-70 sm:min-h-[38px] sm:w-auto sm:min-w-[96px]">{returning ? "Returning…" : "Unselect"}</button></div>
    </section>
  );
}

export default function ShipmentDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agent") ?? "";
  const [draft, setDraft] = useState<QuoteDraft | null>(null);
  const [agent, setAgent] = useState<SelectedQuoteAgent | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<QuoteLocation | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState<QuoteLocation | null>(null);
  const [returningToAgents, setReturningToAgents] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<FormState>({
    senderFullName: "",
    senderPhoneCountryCode: "GB",
    senderPhoneNumber: "",
    senderEmail: "",
    pickupAddress: "",
    pickupCity: "",
    pickupPostcode: "",
    receiverFullName: "",
    receiverPhoneCountryCode: "NG",
    receiverPhoneNumber: "",
    receiverEmail: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryPostcode: "",
    itemsDescription: "",
    weightKg: "",
    lengthCm: "",
    widthCm: "",
    declaredValueGbp: "",
  });

  useEffect(() => {
    const storedDraft = readQuoteDraft();
    const storedAgent = readSelectedQuoteAgent();
    const storedShipment = readShipmentDraft();
    const controller = new AbortController();
    let active = true;

    setDraft(storedDraft);
    if (storedAgent?.id === agentId) {
      setAgent(storedAgent);
      setAgentLoading(false);
    } else if (agentId) {
      setAgentLoading(true);
      void fetch(buildApiUrl(`${routes.api.quote.agents}/${encodeURIComponent(agentId)}`), { signal: controller.signal })
        .then(async (response) => response.ok ? response.json() as Promise<QuoteAgentDetail> : null)
        .then((detail) => {
          if (!active || !detail) return;
          setAgent({
            id: detail.id,
            companyName: detail.companyName,
            logoUrl: detail.logoUrl,
            verified: detail.verified,
            rating: detail.rating,
            reviewCount: detail.reviewCount,
            responseTime: detail.responseTime,
            collectionMethod: detail.collectionMethod,
            deliveryMethod: detail.deliveryMethod,
            insuranceAvailable: detail.insuranceAvailable,
            shipmentFrequency: detail.shipmentFrequency,
            shippingMethod: detail.shippingMethod,
            estimatedPriceGbp: null,
            pricePerKgEur: detail.pricePerKgEur,
            eurToGbpRate: detail.eurToGbpRate,
          });
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          if (active) setAgent(null);
        })
        .finally(() => { if (active) setAgentLoading(false); });
    }

    const nextForm: FormState = {
      senderFullName: storedShipment?.senderFullName ?? "",
      senderPhoneCountryCode: countryCodeFromCallingCode(storedShipment?.senderPhoneCountryCode ?? "", "GB"),
      senderPhoneNumber: storedShipment?.senderPhoneNumber ?? "",
      senderEmail: storedShipment?.senderEmail ?? "",
      pickupAddress: storedShipment?.pickupAddress || storedDraft.from?.label || "",
      pickupCity: storedShipment?.pickupCity || storedDraft.from?.city || "",
      pickupPostcode: storedShipment?.pickupPostcode || storedDraft.from?.postcode || (storedDraft.from ? postcodeFromLabel(storedDraft.from.label) : ""),
      receiverFullName: storedShipment?.receiverFullName ?? "",
      receiverPhoneCountryCode: countryCodeFromCallingCode(storedShipment?.receiverPhoneCountryCode ?? "", "NG"),
      receiverPhoneNumber: storedShipment?.receiverPhoneNumber ?? "",
      receiverEmail: storedShipment?.receiverEmail ?? "",
      deliveryAddress: storedShipment?.deliveryAddress || storedDraft.to?.label || "",
      deliveryCity: storedShipment?.deliveryCity || storedDraft.to?.city || "",
      deliveryState: storedShipment?.deliveryState || storedDraft.to?.state || "",
      deliveryPostcode: storedShipment?.deliveryPostcode || storedDraft.to?.postcode || "",
      itemsDescription: storedShipment?.itemsDescription || storedDraft.itemTypes.map(quoteItemLabel).join(", "),
      weightKg: storedShipment?.weightKg || storedDraft.weightKg,
      lengthCm: storedShipment?.lengthCm || storedDraft.lengthCm,
      widthCm: storedShipment?.widthCm || storedDraft.widthCm,
      declaredValueGbp: storedShipment?.declaredValueGbp ?? "",
    };

    setForm(nextForm);
    setPickupLocation(storedDraft.from?.label === nextForm.pickupAddress ? storedDraft.from : locationFromForm(nextForm.pickupAddress, nextForm.pickupCity, nextForm.pickupPostcode));
    setDeliveryLocation(storedDraft.to?.label === nextForm.deliveryAddress ? storedDraft.to : locationFromForm(nextForm.deliveryAddress, nextForm.deliveryCity, nextForm.deliveryPostcode, nextForm.deliveryState));
    setHydrated(true);

    return () => {
      active = false;
      controller.abort();
    };
  }, [agentId]);

  useEffect(() => {
    router.prefetch(routes.web.quote);
  }, [router]);

  useEffect(() => {
    if (!hydrated) return;
    const controller = new AbortController();
    void fetch(buildApiUrl(routes.api.customerAuth.me), { credentials: "include", signal: controller.signal })
      .then(async (response) => response.ok ? response.json() as Promise<CustomerResponse> : null)
      .then((body) => {
        const customer = body?.customer;
        if (!customer) return;
        setForm((current) => ({
          ...current,
          senderFullName: current.senderFullName || `${customer.firstName} ${customer.lastName}`.trim(),
          senderPhoneCountryCode: current.senderPhoneNumber ? current.senderPhoneCountryCode : countryCodeFromCallingCode(customer.phoneCountryCode, "GB"),
          senderPhoneNumber: current.senderPhoneNumber || customer.phoneNumber,
          senderEmail: current.senderEmail || customer.email,
        }));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !agentId) return;
    writeShipmentDraft({
      agentId,
      senderFullName: form.senderFullName,
      senderPhoneCountryCode: callingCode(form.senderPhoneCountryCode),
      senderPhoneNumber: form.senderPhoneNumber,
      senderEmail: form.senderEmail,
      pickupAddress: form.pickupAddress,
      pickupCity: form.pickupCity,
      pickupPostcode: form.pickupPostcode,
      receiverFullName: form.receiverFullName,
      receiverPhoneCountryCode: callingCode(form.receiverPhoneCountryCode),
      receiverPhoneNumber: form.receiverPhoneNumber,
      receiverEmail: form.receiverEmail,
      deliveryAddress: form.deliveryAddress,
      deliveryCity: form.deliveryCity,
      deliveryState: form.deliveryState,
      deliveryPostcode: form.deliveryPostcode,
      itemsDescription: form.itemsDescription,
      weightKg: form.weightKg,
      lengthCm: form.lengthCm,
      widthCm: form.widthCm,
      declaredValueGbp: form.declaredValueGbp,
    });
  }, [agentId, form, hydrated]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const selectPickupLocation = (value: QuoteLocation | null) => {
    setPickupLocation(value);
    if (!value) return;
    setForm((current) => ({
      ...current,
      pickupAddress: value.label,
      pickupCity: value.city,
      pickupPostcode: value.postcode || postcodeFromLabel(value.label) || current.pickupPostcode,
    }));
  };
  const selectDeliveryLocation = (value: QuoteLocation | null) => {
    setDeliveryLocation(value);
    if (!value) return;
    setForm((current) => ({
      ...current,
      deliveryAddress: value.label,
      deliveryCity: value.city,
      deliveryState: value.state || current.deliveryState,
      deliveryPostcode: value.postcode || current.deliveryPostcode,
    }));
  };
  const numericWeight = Number(form.weightKg);
  const shipping = agent?.pricePerKgEur !== null && agent?.pricePerKgEur !== undefined && Number.isFinite(numericWeight) && numericWeight > 0
    ? Math.round(agent.pricePerKgEur * numericWeight * agent.eurToGbpRate * 100) / 100
    : agent?.estimatedPriceGbp ?? null;
  const serviceCharge = shipping === null ? null : Math.round(shipping * 0.05 * 100) / 100;
  const total = shipping === null || serviceCharge === null ? null : Math.round((shipping + serviceCharge) * 100) / 100;

  const requiredComplete = useMemo(() => Boolean(
    form.senderFullName.trim() && form.senderPhoneNumber.trim() && form.senderEmail.trim() && form.pickupAddress.trim() && form.pickupCity.trim() && form.receiverFullName.trim() && form.receiverPhoneNumber.trim() && form.deliveryAddress.trim() && form.deliveryCity.trim() && form.deliveryState.trim() && form.itemsDescription.trim() && form.weightKg.trim() && form.declaredValueGbp.trim()
  ), [form]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setPaymentNotice("");
    if (!agent || !requiredComplete) {
      setFormError("Complete all required shipment details before continuing.");
      return;
    }
    setFormError("");
    writeShipmentDraft({
      agentId: agent.id,
      senderFullName: form.senderFullName.trim(),
      senderPhoneCountryCode: callingCode(form.senderPhoneCountryCode),
      senderPhoneNumber: form.senderPhoneNumber.trim(),
      senderEmail: form.senderEmail.trim(),
      pickupAddress: form.pickupAddress.trim(),
      pickupCity: form.pickupCity.trim(),
      pickupPostcode: form.pickupPostcode.trim(),
      receiverFullName: form.receiverFullName.trim(),
      receiverPhoneCountryCode: callingCode(form.receiverPhoneCountryCode),
      receiverPhoneNumber: form.receiverPhoneNumber.trim(),
      receiverEmail: form.receiverEmail.trim(),
      deliveryAddress: form.deliveryAddress.trim(),
      deliveryCity: form.deliveryCity.trim(),
      deliveryState: form.deliveryState.trim(),
      deliveryPostcode: form.deliveryPostcode.trim(),
      itemsDescription: form.itemsDescription.trim(),
      weightKg: form.weightKg.trim(),
      lengthCm: form.lengthCm.trim(),
      widthCm: form.widthCm.trim(),
      declaredValueGbp: form.declaredValueGbp.trim(),
    });
    setPaymentNotice("Shipment details saved. Payment integration is the next step in this flow.");
  }

  function returnToAgents() {
    if (returningToAgents) return;
    setReturningToAgents(true);
    router.push(routes.web.quote);
  }

  if (!hydrated || !draft || agentLoading) {
    return <main className="min-h-screen bg-neutral-01"><div className="mx-auto max-w-[900px] animate-pulse px-4 py-12"><div className="h-32 rounded bg-white" /><div className="mt-4 h-[640px] rounded bg-white" /></div></main>;
  }

  if (!agent || !agentId) {
    return <><QuoteSummaryBar draft={draft} /><main className="min-h-[60vh] bg-neutral-01 px-4 py-16 text-center"><h1 className="font-display text-[24px] font-semibold text-primary-10">Select an agent to continue</h1><p className="mt-2 text-[14px] text-neutral-06">Your quote details are still saved.</p><button type="button" onClick={() => router.push(routes.web.quote)} className="zion-btn zion-btn-blue zion-btn-md mt-6">Compare agents</button></main></>;
  }

  return (
    <>
      <QuoteSummaryBar draft={draft} />
      <main className="min-h-screen bg-neutral-01 pb-16 font-sans">
        <div className="mx-auto w-full max-w-[900px] px-4 pt-5 sm:px-6">
          <p className="mb-4 text-[11px] text-neutral-07">Home <span className="mx-2">/</span> Get a quote <span className="mx-2">/</span> Compare agents <span className="mx-2">/</span> <span className="text-primary-10">Shipment details</span></p>
          <AgentSummaryCard agent={agent} returning={returningToAgents} onUnselect={returnToAgents} />

          <div className="mt-4 rounded-[10px] border border-neutral-02 bg-white px-5 py-4 text-[12px] leading-[20px] text-neutral-08">{agent.companyName} is a verified Zionra shipping partner. Complete the shipment details below to continue with this quote.</div>

          <form onSubmit={submit} className="mt-4 rounded-[10px] border border-neutral-02 bg-white p-5 sm:p-7">
            <h1 className="font-display text-[18px] font-semibold text-primary-10">Shipment information</h1>

            <section className="mt-6 border-b border-neutral-02 pb-7">
              <SectionHeading>Sender Details</SectionHeading>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Full Name" required value={form.senderFullName} onChange={(value) => update("senderFullName", value)} placeholder="e.g. Chinedu Okafor" />
                <div><span className="mb-2 block text-[12px] leading-[18px] text-neutral-10">Phone Number <span className="text-error">*</span></span><div className="grid min-w-0 grid-cols-[108px_minmax(0,1fr)] gap-2 sm:grid-cols-[112px_minmax(0,1fr)]"><CountrySelect id="sender-country" value={form.senderPhoneCountryCode} onChange={(country) => update("senderPhoneCountryCode", country.code)} compact ariaLabel="Sender phone country" /><input value={form.senderPhoneNumber} onChange={(event) => update("senderPhoneNumber", event.target.value)} className="zion-input h-[48px] min-w-0 text-[13px]" placeholder="7123 456789" /></div></div>
                <Field label="Email Address" required type="email" value={form.senderEmail} onChange={(value) => update("senderEmail", value)} placeholder="you@example.com" />
                <div className="md:col-span-2"><QuoteLocationInput label="Pickup Address" required placeholder="Enter full address" countryCode="GB" flagSrc="/images/United-Kingdom.svg" value={pickupLocation} onInputChange={(value) => setForm((current) => ({ ...current, pickupAddress: value, pickupCity: "", pickupPostcode: "" }))} onChange={selectPickupLocation} /></div>
                <Field label="City" required value={form.pickupCity} onChange={(value) => update("pickupCity", value)} placeholder="London" />
                <Field label="Postcode" value={form.pickupPostcode} onChange={(value) => update("pickupPostcode", value)} placeholder="SW1A 1AA" />
              </div>
            </section>

            <section className="border-b border-neutral-02 py-7">
              <SectionHeading>Receiver Details</SectionHeading>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Full Name" required value={form.receiverFullName} onChange={(value) => update("receiverFullName", value)} placeholder="e.g. John Adeyemi" />
                <div><span className="mb-2 block text-[12px] leading-[18px] text-neutral-10">Phone Number <span className="text-error">*</span></span><div className="grid min-w-0 grid-cols-[108px_minmax(0,1fr)] gap-2 sm:grid-cols-[112px_minmax(0,1fr)]"><CountrySelect id="receiver-country" value={form.receiverPhoneCountryCode} onChange={(country) => update("receiverPhoneCountryCode", country.code)} compact ariaLabel="Receiver phone country" /><input value={form.receiverPhoneNumber} onChange={(event) => update("receiverPhoneNumber", event.target.value)} className="zion-input h-[48px] min-w-0 text-[13px]" placeholder="801 234 5678" /></div></div>
                <Field label="Email Address (Optional)" type="email" value={form.receiverEmail} onChange={(value) => update("receiverEmail", value)} placeholder="receiver@example.com" />
                <div className="md:col-span-2"><QuoteLocationInput label="Delivery Address" required placeholder="Enter full address" countryCode="NG" flagSrc="/images/Nigeria.svg" value={deliveryLocation} onInputChange={(value) => setForm((current) => ({ ...current, deliveryAddress: value, deliveryCity: "", deliveryState: "", deliveryPostcode: "" }))} onChange={selectDeliveryLocation} /></div>
                <Field label="City" required value={form.deliveryCity} onChange={(value) => update("deliveryCity", value)} placeholder="Lagos" />
                <Field label="State" required value={form.deliveryState} onChange={(value) => update("deliveryState", value)} placeholder="Lagos" />
                <Field label="Postcode (Optional)" value={form.deliveryPostcode} onChange={(value) => update("deliveryPostcode", value)} placeholder="e.g. 100001" />
              </div>
            </section>

            <section className="pt-7">
              <SectionHeading>Package Details</SectionHeading>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Items description" required value={form.itemsDescription} onChange={(value) => update("itemsDescription", value)} placeholder="e.g. Clothing, documents, electronics" span="md:col-span-3" />
                <Field label="Weight (kg)" required type="number" value={form.weightKg} onChange={(value) => update("weightKg", value)} placeholder="8" />
                <Field label="Length (cm)" type="number" value={form.lengthCm} onChange={(value) => update("lengthCm", value)} placeholder="Item length" />
                <Field label="Width (cm)" type="number" value={form.widthCm} onChange={(value) => update("widthCm", value)} placeholder="Item width" />
                <Field label="Declared shipment value" required type="number" value={form.declaredValueGbp} onChange={(value) => update("declaredValueGbp", value)} placeholder="£350.00" span="md:col-span-3" />
              </div>

              <div className="mx-auto mt-6 max-w-[650px] rounded-[10px] border border-neutral-03 px-5 py-4 text-[12px] text-neutral-08">
                <div className="flex justify-between gap-4 py-1"><span>Shipping ({form.weightKg || "—"}kg)</span><strong className="text-primary-10">{money(shipping)}</strong></div>
                <div className="flex justify-between gap-4 py-1"><span>Service charge (5%)</span><strong className="text-primary-10">{money(serviceCharge)}</strong></div>
                <div className="mt-2 flex justify-between gap-4 border-t border-neutral-02 pt-3 font-semibold"><span>Estimated total</span><strong className="text-primary-10">{money(total)}</strong></div>
              </div>

              {formError ? <p className="mt-4 text-center text-[13px] text-error">{formError}</p> : null}
              {paymentNotice ? <p className="mt-4 rounded-[8px] bg-primary-01 px-4 py-3 text-center text-[12px] text-primary-08">{paymentNotice}</p> : null}
              <button type="submit" className="zion-btn zion-btn-blue mx-auto mt-5 min-h-[52px] min-w-[320px] max-w-full px-6 text-[14px]">Continue to payment{total !== null ? ` — ${money(total)}` : ""}</button>
            </section>
          </form>
        </div>
      </main>
    </>
  );
}
