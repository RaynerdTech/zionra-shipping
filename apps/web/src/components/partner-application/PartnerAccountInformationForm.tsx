/* eslint-disable @next/next/no-img-element */
"use client";

import {
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  APPLICATION_STEP_RANK,
  COLLECTION_METHOD_OPTIONS,
  DELIVERY_METHOD_OPTIONS,
  RESPONSE_TIME_OPTIONS,
  TEXTAREA_CLASS,
} from "./constants";
import {
  ApplicationLoadError,
  ApplicationLoading,
  ApplicationSectionLabel,
  BackArrowIcon,
  FieldError,
  FieldLabel,
  PartnerApplicationShell,
  PartnerSelect,
} from "./PartnerApplicationUI";
import type { ApiErrorResponse, PartnerApplicationResponse } from "./types";
import { usePartnerApplication } from "./usePartnerApplication";

type AccountValues = {
  companyBio: string;
  responseTime: string;
  collectionMethod: string;
  deliveryMethod: string;
};

function RemoveLogoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
      <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function buildAccountValues(
  data: PartnerApplicationResponse,
): AccountValues {
  return {
    companyBio: data.application.companyBio ?? "",
    responseTime: data.application.responseTime ?? "",
    collectionMethod: data.application.collectionMethod ?? "",
    deliveryMethod: data.application.deliveryMethod ?? "",
  };
}

export default function PartnerAccountInformationForm() {
  const router = useRouter();
  const {
    data,
    setData,
    error: loadError,
    isLoading,
  } = usePartnerApplication();

  useEffect(() => {
    if (!data) return;

    if (data.application.currentStep === "SUBMITTED") {
      router.replace(routes.web.partnerApplicationSubmitted);
      return;
    }

    if (APPLICATION_STEP_RANK[data.application.currentStep] < 3) {
      router.replace(
        data.application.currentStep === "BUSINESS_INFORMATION"
          ? routes.web.partnerBusinessInformation
          : routes.web.partnerOperationalDetails,
      );
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
    APPLICATION_STEP_RANK[data.application.currentStep] < 3
  ) {
    return <ApplicationLoading />;
  }

  return (
    <AccountInformationEditor
      key={data.application.id}
      data={data}
      setData={setData}
    />
  );
}

function AccountInformationEditor({
  data,
  setData,
}: {
  data: PartnerApplicationResponse;
  setData: Dispatch<
    SetStateAction<PartnerApplicationResponse | null>
  >;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<AccountValues>(() =>
    buildAccountValues(data),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isRemovingLogo, setIsRemovingLogo] = useState(false);

  const companyBio = values.companyBio.trim();
  const wordCount = companyBio ? companyBio.split(/\s+/).length : 0;

  function updateField(field: keyof AccountValues, value: string) {
    setValues((current) => current ? { ...current, [field]: value } : current);
    setErrors((current) => { const next = { ...current }; delete next[field]; return next; });
  }

  async function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isUploadingLogo || isRemovingLogo) return;

    if (!new Set(["image/jpeg", "image/png"]).has(file.type)) {
      setLogoError("Only JPG and PNG images are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("The logo must not exceed 5 MB.");
      return;
    }

    setIsUploadingLogo(true);
    setLogoError("");
    const body = new FormData();
    body.append("logo", file);

    try {
      const response = await fetch(buildApiUrl(routes.api.partnerAuth.companyLogo), {
        method: "POST",
        credentials: "include",
        body,
      });
      const result = (await response.json().catch(() => ({}))) as ApiErrorResponse & { application?: NonNullable<typeof data>["application"] };
      if (!response.ok || !result.application) throw new Error(result.errors?.logo ?? result.message ?? "Unable to upload the logo.");
      setData((current) => current ? { ...current, application: result.application! } : current);
    } catch (uploadError) {
      setLogoError(uploadError instanceof Error ? uploadError.message : "Unable to upload the logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  async function removeLogo() {
    if (!data?.application.companyLogoUrl || isUploadingLogo || isRemovingLogo) return;

    setIsRemovingLogo(true);
    setLogoError("");

    try {
      const response = await fetch(buildApiUrl(routes.api.partnerAuth.companyLogo), {
        method: "DELETE",
        credentials: "include",
      });
      const result = (await response.json().catch(() => ({}))) as ApiErrorResponse & {
        application?: NonNullable<typeof data>["application"];
      };

      if (!response.ok || !result.application) {
        throw new Error(result.errors?.logo ?? result.message ?? "Unable to remove the logo.");
      }

      setData((current) => current ? { ...current, application: result.application! } : current);
    } catch (removeError) {
      setLogoError(removeError instanceof Error ? removeError.message : "Unable to remove the logo.");
    } finally {
      setIsRemovingLogo(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values || isSaving) return;
    setIsSaving(true);
    setErrors({});
    setFormError("");

    try {
      const response = await fetch(buildApiUrl(routes.api.partnerAuth.accountInformation), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json().catch(() => ({}))) as ApiErrorResponse;
      if (!response.ok) {
        setErrors(result.errors ?? {});
        throw new Error(result.message ?? "Unable to save account information.");
      }
      router.push(routes.web.partnerApplicationReview);
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Unable to save account information.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PartnerApplicationShell activeStep={3} currentStep={data.application.currentStep} headerTitle="Final Step" headerDescription="Upload your company logo, add a business description, and complete your profile before submitting your application." pageTitle="Account Information">
      <form onSubmit={handleSubmit} noValidate>
        <ApplicationSectionLabel>Account Details</ApplicationSectionLabel>
        <div className="mt-4">
          <FieldLabel>Company Logo</FieldLabel>
          <div className="relative w-fit">
            <label className="relative flex h-[104px] w-[124px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-primary-04 bg-white text-center transition-colors hover:bg-primary-01 active:bg-primary-02">
              {data.application.companyLogoUrl ? (
                <img src={data.application.companyLogoUrl} alt="Company logo preview" className="h-full w-full object-contain p-2" />
              ) : (
                <>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-01 text-lg">🖼️</span>
                  <span className="mt-1 font-sans text-xs text-primary-06">Click to upload</span>
                  <span className="mt-0.5 font-sans text-[10px] text-neutral-05">JPG, PNG up to 5MB</span>
                </>
              )}
              {isUploadingLogo || isRemovingLogo ? (
                <span className="absolute inset-0 flex items-center justify-center bg-white/85 text-primary-06"><LoadingSpinner /></span>
              ) : null}
              <input type="file" accept="image/jpeg,image/png" onChange={uploadLogo} className="sr-only" disabled={isUploadingLogo || isRemovingLogo} />
            </label>

            {data.application.companyLogoUrl ? (
              <button
                type="button"
                aria-label="Remove company logo"
                title="Remove company logo"
                onClick={removeLogo}
                disabled={isUploadingLogo || isRemovingLogo}
                className="absolute right-1.5 top-1.5 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-primary-10/85 text-white shadow-sm transition-colors hover:bg-error active:bg-[#BF1A10] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RemoveLogoIcon />
              </button>
            ) : null}
          </div>
          <FieldError>{logoError}</FieldError>
        </div>

        <div className="mt-5">
          <FieldLabel htmlFor="companyBio" required>Company Bio</FieldLabel>
          <textarea id="companyBio" value={values.companyBio} onChange={(event) => updateField("companyBio", event.target.value)} placeholder="Input Text" className={TEXTAREA_CLASS} aria-invalid={Boolean(errors.companyBio)} />
          <div className="mt-1 flex items-center justify-between gap-4"><FieldError>{errors.companyBio}</FieldError><span className={`ml-auto font-sans text-xs ${wordCount > 160 ? "text-error" : "text-primary-06"}`}>{wordCount}/160 words</span></div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <div><FieldLabel required>Response Time</FieldLabel><PartnerSelect id="responseTime" value={values.responseTime} options={RESPONSE_TIME_OPTIONS} placeholder="Select response time" onChange={(value) => updateField("responseTime", value)} error={Boolean(errors.responseTime)} /><FieldError>{errors.responseTime}</FieldError></div>
          <div><FieldLabel required>Collection Method</FieldLabel><PartnerSelect id="collectionMethod" value={values.collectionMethod} options={COLLECTION_METHOD_OPTIONS} placeholder="Select option" onChange={(value) => updateField("collectionMethod", value)} error={Boolean(errors.collectionMethod)} /><FieldError>{errors.collectionMethod}</FieldError></div>
          <div><FieldLabel required>Delivery Method</FieldLabel><PartnerSelect id="deliveryMethod" value={values.deliveryMethod} options={DELIVERY_METHOD_OPTIONS} placeholder="Select option" onChange={(value) => updateField("deliveryMethod", value)} error={Boolean(errors.deliveryMethod)} /><FieldError>{errors.deliveryMethod}</FieldError></div>
        </div>

        {formError ? <p className="zion-field-error mt-5 text-center">{formError}</p> : null}
        <div className="mt-10 flex items-center justify-between gap-4">
          <Link href={routes.web.partnerOperationalDetails} className="zion-btn zion-btn-outline-blue h-11 min-h-0 w-[144px] min-w-0 rounded-lg px-4 font-sans text-base font-normal"><BackArrowIcon className="h-6 w-6" /> Back</Link>
          <button type="submit" disabled={isSaving} className="zion-btn zion-btn-md zion-btn-blue min-w-[126px]">{isSaving ? <LoadingSpinner /> : searchParams.get("returnTo") === "review" ? "Review" : "Review Document"}</button>
        </div>
      </form>
    </PartnerApplicationShell>
  );
}