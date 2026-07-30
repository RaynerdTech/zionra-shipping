export type PartnerApplicationStep =
  | "BUSINESS_INFORMATION"
  | "OPERATIONAL_DETAILS"
  | "ACCOUNT_INFORMATION"
  | "REVIEW"
  | "SUBMITTED";

export type PartnerApplicationContact = {
  id?: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  isPrimary: boolean;
  position: number;
};

export type PartnerApplication = {
  id: string;
  currentStep: PartnerApplicationStep;
  registeredBusinessName: string | null;
  companyEmailAddress: string | null;
  businessAddress: string | null;
  companyHouseNumber: string | null;
  companyPhoneCountryCode: string | null;
  companyPhoneNumber: string | null;
  website: string | null;
  contacts: PartnerApplicationContact[];
  collectionCities: string[];
  itemsHandled: string[];
  operationalBusinessAddress: string | null;
  shippingMethod: string | null;
  shipmentFrequency: string | null;
  airCargoPricePerKg: string | null;
  seaCargoPricePerKg: string | null;
  pricePerBarrel: string | null;
  insuranceAvailable: boolean | null;
  upfrontImmigrationCharge: boolean | null;
  companyLogoUrl: string | null;
  companyLogoPublicId: string | null;
  companyLogoFormat: string | null;
  companyLogoBytes: number | null;
  companyBio: string | null;
  responseTime: string | null;
  collectionMethod: string | null;
  deliveryMethod: string | null;
  applicationReference: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PartnerSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  countryOfResidence: string;
  status: string;
};

export type PartnerApplicationResponse = {
  partner: PartnerSummary;
  application: PartnerApplication;
};

export type ApiErrorResponse = {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
  redirectTo?: string;
};
