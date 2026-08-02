"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  APPLICATION_STEP_RANK,
  INPUT_CLASS,
  ITEMS_HANDLED_OPTIONS,
  SHIPMENT_FREQUENCY_OPTIONS,
  SHIPPING_METHOD_OPTIONS,
  YES_NO_OPTIONS,
} from "./constants";
import {
  ApplicationLoadError,
  ApplicationLoading,
  ApplicationSectionLabel,
  BackArrowIcon,
  FieldError,
  FieldLabel,
  PartnerApplicationShell,
  PartnerMultiSelect,
  PartnerSelect,
  UkCityAutosuggest,
} from "./PartnerApplicationUI";
import type { ApiErrorResponse, PartnerApplicationResponse } from "./types";
import { usePartnerApplication } from "./usePartnerApplication";

type OperationalValues = {
  collectionCities: string[];
  itemsHandled: string[];
  shippingMethod: string;
  shipmentFrequency: string;
  airCargoPricePerKg: string;
  seaCargoPricePerKg: string;
  pricePerBarrel: string;
  insuranceAvailable: "" | "Yes" | "No";
  upfrontImmigrationCharge: "" | "Yes" | "No";
};

function buildOperationalValues(
  data: PartnerApplicationResponse,
): OperationalValues {
  return {
    collectionCities: data.application.collectionCities,
    itemsHandled: data.application.itemsHandled,
    shippingMethod: data.application.shippingMethod ?? "",
    shipmentFrequency: data.application.shipmentFrequency ?? "",
    airCargoPricePerKg: data.application.airCargoPricePerKg ?? "",
    seaCargoPricePerKg: data.application.seaCargoPricePerKg ?? "",
    pricePerBarrel: data.application.pricePerBarrel ?? "",
    insuranceAvailable:
      data.application.insuranceAvailable === null
        ? ""
        : data.application.insuranceAvailable
          ? "Yes"
          : "No",
    upfrontImmigrationCharge:
      data.application.upfrontImmigrationCharge === null
        ? ""
        : data.application.upfrontImmigrationCharge
          ? "Yes"
          : "No",
  };
}

export default function PartnerOperationalDetailsForm() {
  const router = useRouter();
  const { data, error: loadError, isLoading } = usePartnerApplication();

  useEffect(() => {
    if (!data) return;

    if (data.application.currentStep === "SUBMITTED") {
      router.replace(routes.web.partnerApplicationSubmitted);
      return;
    }

    if (APPLICATION_STEP_RANK[data.application.currentStep] < 2) {
      router.replace(routes.web.partnerBusinessInformation);
    }
  }, [data, router]);

  if (isLoading || !data) {
    return loadError ? (
      <ApplicationLoadError message={loadError} />
    ) : (
      <ApplicationLoading />
    );
  }

  if (
    data.application.currentStep === "SUBMITTED" ||
    APPLICATION_STEP_RANK[data.application.currentStep] < 2
  ) {
    return <ApplicationLoading />;
  }

  return (
    <OperationalDetailsEditor
      key={data.application.id}
      data={data}
    />
  );
}

function OperationalDetailsEditor({
  data,
}: {
  data: PartnerApplicationResponse;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<OperationalValues>(() =>
    buildOperationalValues(data),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof OperationalValues>(field: K, value: OperationalValues[K]) {
    setValues((current) => current ? { ...current, [field]: value } : current);
    setErrors((current) => { const next = { ...current }; delete next[field]; return next; });
  }

  function updateShippingMethod(value: string) {
    setValues((current) => {
      if (!current) return current;
      return {
        ...current,
        shippingMethod: value,
        airCargoPricePerKg: value === "Sea cargo" ? "" : current.airCargoPricePerKg,
        seaCargoPricePerKg: value === "Air cargo" ? "" : current.seaCargoPricePerKg,
      };
    });
    setErrors((current) => { const next = { ...current }; delete next.shippingMethod; delete next.airCargoPricePerKg; delete next.seaCargoPricePerKg; return next; });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values || isSaving) return;
    setIsSaving(true);
    setErrors({});
    setFormError("");

    try {
      const response = await fetch(buildApiUrl(routes.api.partnerAuth.operationalDetails), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          insuranceAvailable: values.insuranceAvailable === "" ? null : values.insuranceAvailable === "Yes",
          upfrontImmigrationCharge: values.upfrontImmigrationCharge === "" ? null : values.upfrontImmigrationCharge === "Yes",
        }),
      });
      const result = (await response.json().catch(() => ({}))) as ApiErrorResponse;
      if (!response.ok) {
        setErrors(result.errors ?? {});
        throw new Error(result.message ?? "Unable to save operational details.");
      }
      router.push(searchParams.get("returnTo") === "review" ? routes.web.partnerApplicationReview : routes.web.partnerAccountInformation);
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Unable to save operational details.");
    } finally {
      setIsSaving(false);
    }
  }

  const showAir = values.shippingMethod === "Air cargo" || values.shippingMethod === "Both";
  const showSea = values.shippingMethod === "Sea cargo" || values.shippingMethod === "Both";

  return (
    <PartnerApplicationShell activeStep={2} currentStep={data.application.currentStep} headerTitle="One step closer" headerDescription="Help us understand how you operate. These details will be used during verification and when displaying your profile to customers." pageTitle="Operational Details">
      <form onSubmit={handleSubmit} noValidate>
        <ApplicationSectionLabel>Operational Details</ApplicationSectionLabel>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <div className="md:col-span-2"><FieldLabel required>Collection Cities</FieldLabel><UkCityAutosuggest id="collectionCities" values={values.collectionCities} placeholder="Search UK cities" onChange={(next) => updateField("collectionCities", next)} error={Boolean(errors.collectionCities)} /><FieldError>{errors.collectionCities}</FieldError></div>
          <div className="md:col-span-2"><FieldLabel required>Items Handled</FieldLabel><PartnerMultiSelect id="itemsHandled" values={values.itemsHandled} options={ITEMS_HANDLED_OPTIONS} placeholder="Select the items you handle" onChange={(next) => updateField("itemsHandled", next)} error={Boolean(errors.itemsHandled)} /><FieldError>{errors.itemsHandled}</FieldError></div>
          <div><FieldLabel required>Shipping Method</FieldLabel><PartnerSelect id="shippingMethod" value={values.shippingMethod} options={SHIPPING_METHOD_OPTIONS} placeholder="What shipping style do you use?" onChange={updateShippingMethod} error={Boolean(errors.shippingMethod)} /><FieldError>{errors.shippingMethod}</FieldError></div>
          <div><FieldLabel required>Shipment Frequency</FieldLabel><PartnerSelect id="shipmentFrequency" value={values.shipmentFrequency} options={SHIPMENT_FREQUENCY_OPTIONS} placeholder="Select an option" onChange={(value) => updateField("shipmentFrequency", value)} error={Boolean(errors.shipmentFrequency)} /><FieldError>{errors.shipmentFrequency}</FieldError></div>
        </div>

        <div className="mt-7"><ApplicationSectionLabel>Pricing estimations</ApplicationSectionLabel></div>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          {showAir ? <MoneyField id="airCargoPricePerKg" label="Price Per KG (Air cargo)" value={values.airCargoPricePerKg} onChange={(value) => updateField("airCargoPricePerKg", value)} error={errors.airCargoPricePerKg} /> : null}
          {showSea ? <MoneyField id="seaCargoPricePerKg" label="Price Per KG (Sea cargo)" value={values.seaCargoPricePerKg} onChange={(value) => updateField("seaCargoPricePerKg", value)} error={errors.seaCargoPricePerKg} /> : null}
          <MoneyField id="pricePerBarrel" label="Price Per Barrel" value={values.pricePerBarrel} onChange={(value) => updateField("pricePerBarrel", value)} error={errors.pricePerBarrel} />
          <div><FieldLabel required>Insurance Availability</FieldLabel><PartnerSelect id="insuranceAvailable" value={values.insuranceAvailable} options={YES_NO_OPTIONS} placeholder="Do you offer insurance?" onChange={(value) => updateField("insuranceAvailable", value as OperationalValues["insuranceAvailable"])} error={Boolean(errors.insuranceAvailable)} /><FieldError>{errors.insuranceAvailable}</FieldError></div>
          <div><FieldLabel required>Upfront Immigration Charge</FieldLabel><PartnerSelect id="upfrontImmigrationCharge" value={values.upfrontImmigrationCharge} options={YES_NO_OPTIONS} placeholder="Offer upfront immigration charge?" onChange={(value) => updateField("upfrontImmigrationCharge", value as OperationalValues["upfrontImmigrationCharge"])} error={Boolean(errors.upfrontImmigrationCharge)} /><FieldError>{errors.upfrontImmigrationCharge}</FieldError></div>
        </div>

        {formError ? <p className="zion-field-error mt-5 text-center">{formError}</p> : null}
        <div className="mt-9 flex items-center justify-between gap-4">
          <Link href={routes.web.partnerBusinessInformation} className="zion-btn zion-btn-outline-blue h-11 min-h-0 w-[144px] min-w-0 rounded-lg px-4 font-sans text-base font-normal"><BackArrowIcon className="h-6 w-6" /> Back</Link>
          <button type="submit" disabled={isSaving} className="zion-btn zion-btn-md zion-btn-blue w-[126px]">{isSaving ? <LoadingSpinner /> : "Next"}</button>
        </div>
      </form>
    </PartnerApplicationShell>
  );
}

function MoneyField({ id, label, value, onChange, error }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <div>
      <FieldLabel htmlFor={id} required>{label}</FieldLabel>
      <div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm text-neutral-10">£</span><input id={id} inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} className={`${INPUT_CLASS} pl-7`} aria-invalid={Boolean(error)} /></div>
      <FieldError>{error}</FieldError>
    </div>
  );
}