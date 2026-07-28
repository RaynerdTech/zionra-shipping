/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import {
  APPLICATION_STEP_RANK,
} from "./constants";
import {
  ApplicationLoadError,
  ApplicationLoading,
  ApplicationSectionLabel,
  BackArrowIcon,
  PartnerApplicationShell,
} from "./PartnerApplicationUI";
import { usePartnerApplication } from "./usePartnerApplication";

function ReviewValue({ label, value, required = false }: { label: string; value: ReactNode; required?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="font-sans text-sm font-normal leading-[22px] text-neutral-10">{label}{required ? <span className="text-error"> *</span> : null}</p>
      <div className="mt-2 break-words font-sans text-base font-normal leading-[26px] text-neutral-08">{value || "—"}</div>
    </div>
  );
}

function EditLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="zion-btn zion-btn-outline-blue mt-6 h-9 min-h-0 min-w-[96px] rounded-md px-4 text-sm"
    >
      Edit
    </Link>
  );
}

export default function PartnerApplicationReview() {
  const router = useRouter();
  const { data, error, isLoading } = usePartnerApplication();

  useEffect(() => {
    if (!data) return;
    if (data.application.currentStep === "SUBMITTED") {
      router.replace(routes.web.partnerApplicationSubmitted);
      return;
    }
    if (APPLICATION_STEP_RANK[data.application.currentStep] < 4) {
      const destination = data.application.currentStep === "BUSINESS_INFORMATION"
        ? routes.web.partnerBusinessInformation
        : data.application.currentStep === "OPERATIONAL_DETAILS"
          ? routes.web.partnerOperationalDetails
          : routes.web.partnerAccountInformation;
      router.replace(destination);
    }
  }, [data, router]);

  if (isLoading || !data) return error ? <ApplicationLoadError message={error} /> : <ApplicationLoading />;

  const application = data.application;
  const primaryContact = application.contacts[0];
  const additionalContacts = application.contacts.slice(1);
  const priceRows = [
    application.airCargoPricePerKg ? ["Price Per KG (Air cargo)", `$ ${application.airCargoPricePerKg}`] : null,
    application.seaCargoPricePerKg ? ["Price Per KG (Sea cargo)", `$ ${application.seaCargoPricePerKg}`] : null,
    ["Price Per Barrel", application.pricePerBarrel ? `$ ${application.pricePerBarrel}` : "—"],
  ].filter(Boolean) as [string, string][];

  return (
    <PartnerApplicationShell currentStep={application.currentStep} headerTitle="Document Review" showSteps={false} pageTitle="Review Information" pageSubtitle="Review the information you entered">
      <section>
        <ApplicationSectionLabel>Company Details</ApplicationSectionLabel>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <ReviewValue label="Registered Business Name" value={application.registeredBusinessName} required />
          <ReviewValue label="Company Email Address" value={application.companyEmailAddress} required />
          <ReviewValue label="Business Address" value={application.businessAddress} required />
          <ReviewValue label="Company House Number" value={application.companyHouseNumber} required />
          <ReviewValue label="Phone Number" value={`${application.companyPhoneCountryCode ?? ""} ${application.companyPhoneNumber ?? ""}`} required />
          <ReviewValue label="Website (Optional)" value={application.website} />
        </div>

        <div className="mt-8"><ApplicationSectionLabel>Company Contact Person</ApplicationSectionLabel></div>
        {primaryContact ? (
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <ReviewValue label="Full Name" value={primaryContact.fullName} required />
            <ReviewValue label="Job Title" value={primaryContact.jobTitle} required />
            <ReviewValue label="Email Address" value={primaryContact.email} required />
            <ReviewValue label="Phone Number" value={`${primaryContact.phoneCountryCode} ${primaryContact.phoneNumber}`} required />
          </div>
        ) : null}
        {additionalContacts.map((contact, index) => (
          <div key={contact.id ?? index} className="mt-6 rounded-xl border border-neutral-02 p-4">
            <p className="font-display text-sm font-semibold text-primary-10">Additional Contact {index + 1}</p>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <ReviewValue label="Full Name" value={contact.fullName} />
              <ReviewValue label="Job Title" value={contact.jobTitle} />
              <ReviewValue label="Email Address" value={contact.email} />
              <ReviewValue label="Phone Number" value={`${contact.phoneCountryCode} ${contact.phoneNumber}`} />
            </div>
          </div>
        ))}
        <EditLink href={`${routes.web.partnerBusinessInformation}?returnTo=review`} />
      </section>

      <section className="mt-12">
        <div className="text-center"><h2 className="font-display text-2xl font-semibold text-primary-10">Operational Details</h2><p className="font-sans text-sm text-neutral-06">Fill all the required fields</p></div>
        <div className="mt-5"><ApplicationSectionLabel>Operational Details</ApplicationSectionLabel></div>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <ReviewValue label="Collection Cities" value={<div className="flex flex-wrap gap-1.5">{application.collectionCities.map((city) => <span key={city} className="rounded bg-primary-01 px-2 py-1 text-[11px] text-primary-08">{city}</span>)}</div>} required />
          <ReviewValue label="Items Handled" value={<div className="flex flex-wrap gap-1.5">{application.itemsHandled.map((item) => <span key={item} className="rounded bg-primary-01 px-2 py-1 text-[11px] text-primary-08">{item}</span>)}</div>} required />
          <ReviewValue label="Business Address" value={application.operationalBusinessAddress} required />
          <ReviewValue label="Shipping Method" value={application.shippingMethod} required />
          <ReviewValue label="Shipment Frequency" value={application.shipmentFrequency} required />
          {priceRows.map(([label, value]) => <ReviewValue key={label} label={label} value={value} required />)}
          <ReviewValue label="Insurance Availability" value={application.insuranceAvailable ? "Yes" : "No"} required />
          <ReviewValue label="Upfront Immigration Charge" value={application.upfrontImmigrationCharge ? "Yes" : "No"} required />
        </div>
        <EditLink href={`${routes.web.partnerOperationalDetails}?returnTo=review`} />
      </section>

      <section className="mt-12">
        <div className="text-center"><h2 className="font-display text-2xl font-semibold text-primary-10">Account Information</h2><p className="font-sans text-sm text-neutral-06">Fill all the required fields</p></div>
        <div className="mt-5"><ApplicationSectionLabel>Account Details</ApplicationSectionLabel></div>
        <div className="mt-4">
          <ReviewValue label="Company Logo" value={application.companyLogoUrl ? <img src={application.companyLogoUrl} alt="Company logo" className="h-16 w-16 rounded-full border border-primary-02 object-contain p-1" /> : "Not uploaded"} />
          <div className="mt-6"><ReviewValue label="Company Bio" value={<div className="zion-input h-auto min-h-[150px] whitespace-pre-wrap py-3">{application.companyBio}</div>} required /></div>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <ReviewValue label="Response Time" value={application.responseTime} required />
            <ReviewValue label="Collection Method" value={application.collectionMethod} required />
            <ReviewValue label="Delivery Method" value={application.deliveryMethod} required />
          </div>
        </div>
        <EditLink href={`${routes.web.partnerAccountInformation}?returnTo=review`} />
      </section>

      <div className="mt-14 flex items-center justify-between gap-3">
        <Link
          href={routes.web.partnerAccountInformation}
          className="zion-btn zion-btn-outline-blue h-10 min-h-0 min-w-[96px] rounded-md px-4 text-sm"
        >
          <BackArrowIcon className="h-4 w-4" />
          Back
        </Link>
        <Link
          href={routes.web.partnerApplicationProcessing}
          className="zion-btn zion-btn-blue h-11 min-h-0 min-w-[154px] rounded-md px-4 text-sm"
        >
          Submit Application
        </Link>
      </div>
    </PartnerApplicationShell>
  );
}