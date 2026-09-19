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
  otherItemsHandled: string;
  operationalBusinessAddress: string;
  shippingMethod: string;
  shipmentFrequency: string;
  pricePerKg: string;
  pricePerBarrel: string;
  insuranceAvailable: "" | "Yes" | "No";
  maxLength: string;
  maxHeight: string;
  maxWidth: string;
  upfrontImmigrationCharge: "" | "Yes" | "No";
};

const OTHER_ITEM_PREFIX = "Other: ";

function buildOperationalValues(
  data: PartnerApplicationResponse,
): OperationalValues {
  const customItems = data.application.itemsHandled.filter((item) =>
    item.startsWith(OTHER_ITEM_PREFIX),
  );
  const selectedItems = data.application.itemsHandled.filter((item) =>
    ITEMS_HANDLED_OPTIONS.includes(
      item as (typeof ITEMS_HANDLED_OPTIONS)[number],
    ),
  );

  if (customItems.length > 0 && !selectedItems.includes("Other")) {
    selectedItems.push("Other");
  }

  return {
    collectionCities: data.application.collectionCities,
    itemsHandled: selectedItems,
    otherItemsHandled: customItems
      .map((item) => item.slice(OTHER_ITEM_PREFIX.length).trim())
      .filter(Boolean)
      .join(", "),
    operationalBusinessAddress:
      data.application.operationalBusinessAddress ?? "",
    shippingMethod: data.application.shippingMethod ?? "",
    shipmentFrequency: data.application.shipmentFrequency ?? "",
    pricePerKg: data.application.pricePerKg ?? "",
    pricePerBarrel: data.application.pricePerBarrel ?? "",
    insuranceAvailable:
      data.application.insuranceAvailable === null
        ? ""
        : data.application.insuranceAvailable
          ? "Yes"
          : "No",
    maxLength: data.application.maxLength ?? "",
    maxHeight: data.application.maxHeight ?? "",
    maxWidth: data.application.maxWidth ?? "",
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

  return <OperationalDetailsEditor key={data.application.id} data={data} />;
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

  const returnToReview = searchParams.get("returnTo") === "review";
  const nextRoute = returnToReview
    ? routes.web.partnerApplicationReview
    : routes.web.partnerAccountInformation;
  const showOtherItemsInput = values.itemsHandled.includes("Other");

  useEffect(() => {
    router.prefetch(nextRoute);
  }, [nextRoute, router]);

  function updateField<K extends keyof OperationalValues>(
    field: K,
    value: OperationalValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function updateItemsHandled(nextItems: string[]) {
    setValues((current) => ({
      ...current,
      itemsHandled: nextItems,
      otherItemsHandled: nextItems.includes("Other")
        ? current.otherItemsHandled
        : "",
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next.itemsHandled;
      delete next.otherItemsHandled;
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setErrors({});
    setFormError("");

    try {
      const response = await fetch(
        buildApiUrl(routes.api.partnerAuth.operationalDetails),
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collectionCities: values.collectionCities,
            itemsHandled: values.itemsHandled,
            otherItemsHandled: values.otherItemsHandled,
            operationalBusinessAddress: values.operationalBusinessAddress,
            shippingMethod: values.shippingMethod,
            shipmentFrequency: values.shipmentFrequency,
            pricePerKg: values.pricePerKg,
            pricePerBarrel: values.pricePerBarrel,
            insuranceAvailable:
              values.insuranceAvailable === ""
                ? null
                : values.insuranceAvailable === "Yes",
            maxLength: values.maxLength,
            maxHeight: values.maxHeight,
            maxWidth: values.maxWidth,
            upfrontImmigrationCharge:
              values.upfrontImmigrationCharge === ""
                ? null
                : values.upfrontImmigrationCharge === "Yes",
          }),
        },
      );

      const result = (await response
        .json()
        .catch(() => ({}))) as ApiErrorResponse;

      if (!response.ok) {
        setErrors(result.errors ?? {});
        throw new Error(
          result.message ?? "Unable to save operational details.",
        );
      }

      router.push(nextRoute);
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save operational details.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PartnerApplicationShell
      activeStep={2}
      currentStep={data.application.currentStep}
      headerTitle="One step closer"
      headerDescription="Help us understand how you operate. These details will be used during verification and when displaying your profile to customers."
      pageTitle="Operational Details"
    >
      <form onSubmit={handleSubmit} noValidate>
        <ApplicationSectionLabel>Operational Details</ApplicationSectionLabel>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel required>Collection Cities</FieldLabel>
            <UkCityAutosuggest
              id="collectionCities"
              values={values.collectionCities}
              placeholder="Search UK cities"
              onChange={(next) => updateField("collectionCities", next)}
              error={Boolean(errors.collectionCities)}
            />
            <FieldError>{errors.collectionCities}</FieldError>
          </div>

          <div className="md:col-span-2">
            <FieldLabel required>Items Handled</FieldLabel>
            <PartnerMultiSelect
              id="itemsHandled"
              values={values.itemsHandled}
              options={ITEMS_HANDLED_OPTIONS}
              placeholder="Select the items you handle"
              onChange={updateItemsHandled}
              error={Boolean(errors.itemsHandled)}
            />
            <FieldError>{errors.itemsHandled}</FieldError>
          </div>

          {showOtherItemsInput ? (
            <div className="md:col-span-2">
              <FieldLabel htmlFor="otherItemsHandled" required>
                Other Items Handled
              </FieldLabel>
              <input
                id="otherItemsHandled"
                value={values.otherItemsHandled}
                onChange={(event) =>
                  updateField("otherItemsHandled", event.target.value)
                }
                placeholder="Tell us what other items you handle"
                maxLength={120}
                className={INPUT_CLASS}
                aria-invalid={Boolean(errors.otherItemsHandled)}
              />
              <FieldError>{errors.otherItemsHandled}</FieldError>
            </div>
          ) : null}

          <div className="md:col-span-2">
            <FieldLabel htmlFor="operationalBusinessAddress" required>
              Business Address
            </FieldLabel>
            <input
              id="operationalBusinessAddress"
              value={values.operationalBusinessAddress}
              onChange={(event) =>
                updateField(
                  "operationalBusinessAddress",
                  event.target.value,
                )
              }
              placeholder="Enter business address"
              className={INPUT_CLASS}
              aria-invalid={Boolean(errors.operationalBusinessAddress)}
            />
            <FieldError>{errors.operationalBusinessAddress}</FieldError>
          </div>

          <div>
            <FieldLabel required>Shipping Method</FieldLabel>
            <PartnerSelect
              id="shippingMethod"
              value={values.shippingMethod}
              options={SHIPPING_METHOD_OPTIONS}
              placeholder="What shipping style do you use?"
              onChange={(value) => updateField("shippingMethod", value)}
              error={Boolean(errors.shippingMethod)}
            />
            <FieldError>{errors.shippingMethod}</FieldError>
          </div>

          <div>
            <FieldLabel required>Shipment Frequency</FieldLabel>
            <PartnerSelect
              id="shipmentFrequency"
              value={values.shipmentFrequency}
              options={SHIPMENT_FREQUENCY_OPTIONS}
              placeholder="Select an option"
              onChange={(value) => updateField("shipmentFrequency", value)}
              error={Boolean(errors.shipmentFrequency)}
            />
            <FieldError>{errors.shipmentFrequency}</FieldError>
          </div>
        </div>

        <div className="mt-7">
          <ApplicationSectionLabel>Pricing estimations</ApplicationSectionLabel>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <MoneyField
            id="pricePerKg"
            label="Price Per KG"
            value={values.pricePerKg}
            onChange={(value) => updateField("pricePerKg", value)}
            error={errors.pricePerKg}
          />
          <MoneyField
            id="pricePerBarrel"
            label="Price Per Barrel"
            value={values.pricePerBarrel}
            onChange={(value) => updateField("pricePerBarrel", value)}
            error={errors.pricePerBarrel}
          />

          <div>
            <FieldLabel required>Insurance Availability</FieldLabel>
            <PartnerSelect
              id="insuranceAvailable"
              value={values.insuranceAvailable}
              options={YES_NO_OPTIONS}
              placeholder="Select an option"
              onChange={(value) =>
                updateField(
                  "insuranceAvailable",
                  value as OperationalValues["insuranceAvailable"],
                )
              }
              error={Boolean(errors.insuranceAvailable)}
            />
            <FieldError>{errors.insuranceAvailable}</FieldError>
          </div>
        </div>

        <div className="mt-7">
          <ApplicationSectionLabel>Shipment requirement</ApplicationSectionLabel>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <NumberField
            id="maxLength"
            label="Max length"
            value={values.maxLength}
            onChange={(value) => updateField("maxLength", value)}
            error={errors.maxLength}
          />
          <NumberField
            id="maxHeight"
            label="Max Height"
            value={values.maxHeight}
            onChange={(value) => updateField("maxHeight", value)}
            error={errors.maxHeight}
          />
          <NumberField
            id="maxWidth"
            label="Max width"
            value={values.maxWidth}
            onChange={(value) => updateField("maxWidth", value)}
            error={errors.maxWidth}
          />

          <div>
            <FieldLabel required>Upfront Immigration Charge</FieldLabel>
            <PartnerSelect
              id="upfrontImmigrationCharge"
              value={values.upfrontImmigrationCharge}
              options={YES_NO_OPTIONS}
              placeholder="Select an option"
              onChange={(value) =>
                updateField(
                  "upfrontImmigrationCharge",
                  value as OperationalValues["upfrontImmigrationCharge"],
                )
              }
              error={Boolean(errors.upfrontImmigrationCharge)}
            />
            <FieldError>{errors.upfrontImmigrationCharge}</FieldError>
          </div>
        </div>

        {formError ? (
          <p className="zion-field-error mt-5 text-center">{formError}</p>
        ) : null}

        <div className="mt-9 flex items-center justify-between gap-4">
          <Link
            href={routes.web.partnerBusinessInformation}
            className="zion-btn zion-btn-outline-blue h-11 min-h-0 w-[144px] min-w-0 rounded-lg px-4 font-sans text-base font-normal"
          >
            <BackArrowIcon className="h-6 w-6" /> Back
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="zion-btn zion-btn-md zion-btn-blue w-[126px]"
          >
            {isSaving ? <LoadingSpinner /> : "Next"}
          </button>
        </div>
      </form>
    </PartnerApplicationShell>
  );
}

function MoneyField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} required>
        {label}
      </FieldLabel>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm text-neutral-10">
          €
        </span>
        <input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${INPUT_CLASS} pl-7`}
          aria-invalid={Boolean(error)}
        />
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} required>
        {label}
      </FieldLabel>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
        aria-invalid={Boolean(error)}
      />
      <FieldError>{error}</FieldError>
    </div>
  );
}
