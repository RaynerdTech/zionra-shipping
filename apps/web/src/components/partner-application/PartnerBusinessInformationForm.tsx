"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CountryCode } from "libphonenumber-js";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { INPUT_CLASS, JOB_TITLE_OPTIONS } from "./constants";
import {
  AddContactButton,
  ApplicationLoadError,
  ApplicationLoading,
  ApplicationSectionLabel,
  FieldError,
  FieldLabel,
  PartnerApplicationShell,
  PartnerSelect,
  PhoneField,
} from "./PartnerApplicationUI";
import type {
  ApiErrorResponse,
  PartnerApplicationContact,
  PartnerApplicationResponse,
} from "./types";
import { usePartnerApplication } from "./usePartnerApplication";

type BusinessValues = {
  registeredBusinessName: string;
  companyEmailAddress: string;
  businessAddress: string;
  companyHouseNumber: string;
  companyPhoneCountryCode: string;
  companyPhoneNumber: string;
  website: string;
  contacts: PartnerApplicationContact[];
};

const EMPTY_CONTACT: PartnerApplicationContact = {
  fullName: "",
  jobTitle: "",
  email: "",
  phoneCountryCode: "+44",
  phoneNumber: "",
  isPrimary: false,
  position: 0,
};

function countryFromCallingCode(value: string | null | undefined): CountryCode {
  if (value === "+44") return "GB";
  return COUNTRY_OPTIONS.find((country) => country.callingCode === value)?.code ?? "GB";
}

function buildBusinessValues(
  data: PartnerApplicationResponse,
): BusinessValues {
  const primaryContact = data.application.contacts[0] ?? {
    ...EMPTY_CONTACT,
    fullName: `${data.partner.firstName} ${data.partner.lastName}`.trim(),
    email: data.partner.email,
    phoneCountryCode: data.partner.phoneCountryCode,
    phoneNumber: data.partner.phoneNumber,
    isPrimary: true,
  };

  return {
    registeredBusinessName:
      data.application.registeredBusinessName ?? "",
    companyEmailAddress:
      data.application.companyEmailAddress ?? data.partner.email,
    businessAddress: data.application.businessAddress ?? "",
    companyHouseNumber: data.application.companyHouseNumber ?? "",
    companyPhoneCountryCode:
      data.application.companyPhoneCountryCode ??
      data.partner.phoneCountryCode,
    companyPhoneNumber:
      data.application.companyPhoneNumber ?? data.partner.phoneNumber,
    website: data.application.website ?? "",
    contacts: [
      { ...primaryContact, isPrimary: true, position: 0 },
      ...data.application.contacts.slice(1).map((contact, index) => ({
        ...contact,
        isPrimary: false,
        position: index + 1,
      })),
    ],
  };
}

export default function PartnerBusinessInformationForm() {
  const router = useRouter();
  const { data, error: loadError, isLoading } = usePartnerApplication();

  useEffect(() => {
    if (data?.application.currentStep === "SUBMITTED") {
      router.replace(routes.web.partnerApplicationSubmitted);
    }
  }, [data, router]);

  if (isLoading || !data) {
    return loadError ? (
      <ApplicationLoadError message={loadError} />
    ) : (
      <ApplicationLoading />
    );
  }

  if (data.application.currentStep === "SUBMITTED") {
    return <ApplicationLoading />;
  }

  return (
    <BusinessInformationEditor
      key={data.application.id}
      data={data}
    />
  );
}

function BusinessInformationEditor({
  data,
}: {
  data: PartnerApplicationResponse;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<BusinessValues>(() =>
    buildBusinessValues(data),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof Omit<BusinessValues, "contacts">>(field: K, value: BusinessValues[K]) {
    setValues((current) => (current ? { ...current, [field]: value } : current));
    setErrors((current) => { const next = { ...current }; delete next[field]; return next; });
  }

  function updateContact(index: number, field: keyof PartnerApplicationContact, value: string | boolean | number) {
    setValues((current) => current ? {
      ...current,
      contacts: current.contacts.map((contact, contactIndex) => contactIndex === index ? { ...contact, [field]: value } : contact),
    } : current);
    setErrors((current) => { const next = { ...current }; delete next[`contacts.${index}.${field}`]; return next; });
  }

  function addContact() {
    setValues((current) => current && current.contacts.length < 6 ? {
      ...current,
      contacts: [...current.contacts, { ...EMPTY_CONTACT, position: current.contacts.length }],
    } : current);
  }

  function removeContact(index: number) {
    setValues((current) => current ? {
      ...current,
      contacts: current.contacts.filter((_, contactIndex) => contactIndex !== index).map((contact, position) => ({ ...contact, position })),
    } : current);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values || isSaving) return;
    setIsSaving(true);
    setErrors({});
    setFormError("");

    try {
      const response = await fetch(buildApiUrl(routes.api.partnerAuth.businessInformation), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json().catch(() => ({}))) as ApiErrorResponse;
      if (!response.ok) {
        setErrors(result.errors ?? {});
        throw new Error(result.message ?? "Unable to save business information.");
      }
      router.push(searchParams.get("returnTo") === "review" ? routes.web.partnerApplicationReview : routes.web.partnerOperationalDetails);
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Unable to save business information.");
    } finally {
      setIsSaving(false);
    }
  }

  const companyCountry = countryFromCallingCode(values.companyPhoneCountryCode);

  return (
    <PartnerApplicationShell activeStep={1} currentStep={data.application.currentStep} headerTitle="Lets Get Started" headerDescription="Tell us about your business. We’ll use these details to create your account and begin the verification process." pageTitle="Business Information">
      <form onSubmit={handleSubmit} noValidate>
        <ApplicationSectionLabel>Company Details</ApplicationSectionLabel>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <div><FieldLabel htmlFor="registeredBusinessName" required>Registered Business Name</FieldLabel><input id="registeredBusinessName" value={values.registeredBusinessName} onChange={(event) => updateField("registeredBusinessName", event.target.value)} placeholder="e.g Zionra" className={INPUT_CLASS} aria-invalid={Boolean(errors.registeredBusinessName)} /><FieldError>{errors.registeredBusinessName}</FieldError></div>
          <div><FieldLabel htmlFor="companyEmailAddress" required>Company Email Address</FieldLabel><input id="companyEmailAddress" type="email" value={values.companyEmailAddress} onChange={(event) => updateField("companyEmailAddress", event.target.value)} placeholder="e.g. Company@gmail.com" className={INPUT_CLASS} aria-invalid={Boolean(errors.companyEmailAddress)} /><FieldError>{errors.companyEmailAddress}</FieldError></div>
          <div><FieldLabel htmlFor="businessAddress" required>Business Address</FieldLabel><input id="businessAddress" value={values.businessAddress} onChange={(event) => updateField("businessAddress", event.target.value)} placeholder="Search business address" className={INPUT_CLASS} aria-invalid={Boolean(errors.businessAddress)} /><FieldError>{errors.businessAddress}</FieldError></div>
          <div><FieldLabel htmlFor="companyHouseNumber" required>Company House Number</FieldLabel><input id="companyHouseNumber" value={values.companyHouseNumber} onChange={(event) => updateField("companyHouseNumber", event.target.value)} placeholder="e.g. 12345678" className={INPUT_CLASS} aria-invalid={Boolean(errors.companyHouseNumber)} /><FieldError>{errors.companyHouseNumber}</FieldError></div>
          <div><FieldLabel required>Company Phone Number</FieldLabel><PhoneField id="companyPhoneNumber" country={companyCountry} phoneNumber={values.companyPhoneNumber} onCountryChange={(_, callingCode) => updateField("companyPhoneCountryCode", callingCode)} onPhoneChange={(value) => updateField("companyPhoneNumber", value)} error={Boolean(errors.companyPhoneNumber)} /><FieldError>{errors.companyPhoneNumber}</FieldError></div>
          <div><FieldLabel htmlFor="website">Website (Optional)</FieldLabel><input id="website" value={values.website} onChange={(event) => updateField("website", event.target.value)} placeholder="e.g. https://zionra.com" className={INPUT_CLASS} aria-invalid={Boolean(errors.website)} /><FieldError>{errors.website}</FieldError></div>
        </div>

        <div className="mt-7"><ApplicationSectionLabel><span className="md:hidden">Primary Contact</span><span className="hidden md:inline">Company Contact Person</span></ApplicationSectionLabel></div>
        <div className="mt-4 space-y-7">
          {values.contacts.map((contact, index) => {
            const country = countryFromCallingCode(contact.phoneCountryCode);
            return (
              <section key={contact.id ?? `contact-${index}`} className={index ? "rounded-xl border border-neutral-02 p-4" : ""}>
                {index ? <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-base font-semibold text-primary-10">Additional Contact {index}</h3><button type="button" onClick={() => removeContact(index)} className="font-sans text-sm text-error hover:underline active:underline">Remove</button></div> : null}
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  <div><FieldLabel htmlFor={`contactName-${index}`} required>{index === 0 ? "Primary Contacts Name" : "Contact Name"}</FieldLabel><input id={`contactName-${index}`} value={contact.fullName} onChange={(event) => updateContact(index, "fullName", event.target.value)} placeholder="e.g. Jane Okonkwo" className={INPUT_CLASS} aria-invalid={Boolean(errors[`contacts.${index}.fullName`])} /><FieldError>{errors[`contacts.${index}.fullName`]}</FieldError></div>
                  <div><FieldLabel required>Job Title</FieldLabel><PartnerSelect id={`contactJobTitle-${index}`} value={contact.jobTitle} options={JOB_TITLE_OPTIONS} placeholder="e.g. Founder" onChange={(value) => updateContact(index, "jobTitle", value)} error={Boolean(errors[`contacts.${index}.jobTitle`])} /><FieldError>{errors[`contacts.${index}.jobTitle`]}</FieldError></div>
                  <div><FieldLabel htmlFor={`contactEmail-${index}`} required>Email Address</FieldLabel><input id={`contactEmail-${index}`} type="email" value={contact.email} onChange={(event) => updateContact(index, "email", event.target.value)} placeholder="janeOkonkwo@gmail.com" className={INPUT_CLASS} aria-invalid={Boolean(errors[`contacts.${index}.email`])} /><FieldError>{errors[`contacts.${index}.email`]}</FieldError></div>
                  <div><FieldLabel required>Phone Number</FieldLabel><PhoneField id={`contactPhone-${index}`} country={country} phoneNumber={contact.phoneNumber} onCountryChange={(_, callingCode) => updateContact(index, "phoneCountryCode", callingCode)} onPhoneChange={(value) => updateContact(index, "phoneNumber", value)} error={Boolean(errors[`contacts.${index}.phoneNumber`])} /><FieldError>{errors[`contacts.${index}.phoneNumber`]}</FieldError></div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-5"><AddContactButton onClick={addContact} /></div>
        {errors.contacts ? <FieldError>{errors.contacts}</FieldError> : null}
        {formError ? <p className="zion-field-error mt-5 text-center">{formError}</p> : null}
        <div className="mt-8 flex justify-end md:mt-10"><button type="submit" disabled={isSaving} className="zion-btn zion-btn-blue zion-btn-md w-full md:w-[126px]">{isSaving ? <LoadingSpinner /> : "Next"}</button></div>
      </form>
    </PartnerApplicationShell>
  );
}