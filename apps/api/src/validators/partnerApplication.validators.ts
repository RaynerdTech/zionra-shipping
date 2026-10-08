/**
 * Responsibility:
 * Validates and normalizes every shipping-partner application step.
 */

import { normalizeUkCities } from "../constants/ukCities.js";
import type { FieldErrors } from "../lib/httpError.js";

const REQUIRED_MESSAGE = "This field can't be left empty.";

export const PARTNER_JOB_TITLES = [
  "Founder",
  "CEO",
  "Operations Manager",
  "Logistics Manager",
  "Employee",
  "Other",
] as const;

export const PARTNER_ITEMS_HANDLED = [
  "Documents & Paperwork",
  "Personal Items & Luggage",
  "Electronics & Technology",
  "Retail & Commercial Goods",
  "Household Goods",
  "Furniture",
  "Machinery & Equipment",
  "Automotive Parts",
  "Palletised Goods",
  "Building Materials",
  "Vehicles",
  "Other",
] as const;

export const PARTNER_SHIPPING_METHODS = ["Air cargo", "Sea cargo", "Both"] as const;
export const PARTNER_SHIPMENT_FREQUENCIES = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "On Demand / As Needed",
] as const;
export const PARTNER_RESPONSE_TIMES = [
  "Immediately",
  "Within 24 Hours",
  "Within 3 Days",
  "Within 1 Week",
  "Within 2 Weeks",
  "More Than 2 Weeks",
] as const;
export const PARTNER_COLLECTION_METHODS = [
  "Pickup Only",
  "Drop-off Only",
  "Both Pickup & Drop-off",
] as const;
export const PARTNER_DELIVERY_METHODS = ["Home delivery", "Depo Pickup", "Both"] as const;

export type PartnerApplicationContactInput = {
  fullName: string;
  jobTitle: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  isPrimary: boolean;
  position: number;
};

export type PartnerBusinessInformationInput = {
  registeredBusinessName: string;
  companyEmailAddress: string;
  businessAddress: string;
  companyHouseNumber: string;
  companyPhoneCountryCode: string;
  companyPhoneNumber: string;
  website: string | null;
  contacts: PartnerApplicationContactInput[];
};

export type PartnerOperationalDetailsInput = {
  collectionCities: string[];
  itemsHandled: string[];
  operationalBusinessAddress: string;
  shippingMethod: (typeof PARTNER_SHIPPING_METHODS)[number];
  shipmentFrequency: (typeof PARTNER_SHIPMENT_FREQUENCIES)[number];
  pricePerKg: string;
  pricePerBarrel: string;
  insuranceAvailable: boolean;
  maxLength: string;
  maxHeight: string;
  maxWidth: string;
  upfrontImmigrationCharge: boolean;
};

export type PartnerAccountInformationInput = {
  companyBio: string;
  responseTime: (typeof PARTNER_RESPONSE_TIMES)[number];
  collectionMethod: (typeof PARTNER_COLLECTION_METHODS)[number];
  deliveryMethod: (typeof PARTNER_DELIVERY_METHODS)[number];
};

type RequestBody = Record<string, unknown>;
type ValidationSuccess<T> = { success: true; data: T };
type ValidationFailure = { success: false; errors: FieldErrors };
export type PartnerApplicationValidationResult<T> =
  | ValidationSuccess<T>
  | ValidationFailure;

function toBody(value: unknown): RequestBody {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as RequestBody;
}

function getString(body: RequestBody, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function getStringArray(body: RequestBody, key: string) {
  const value = body[key];
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))];
}

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  if (!value) return true;
  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(normalized);
    return Boolean(url.hostname && url.hostname.includes("."));
  } catch {
    return false;
  }
}

function normalizeUrl(value: string) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function isAllowed<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return options.includes(value as T[number]);
}

function validateContact(value: unknown, index: number) {
  const body = toBody(value);
  const errors: FieldErrors = {};
  const prefix = `contacts.${index}`;
  const fullName = getString(body, "fullName");
  const jobTitle = getString(body, "jobTitle");
  const email = getString(body, "email").toLowerCase();
  const phoneCountryCode = getString(body, "phoneCountryCode");
  const phoneNumber = normalizePhoneNumber(getString(body, "phoneNumber"));

  if (!fullName) errors[`${prefix}.fullName`] = REQUIRED_MESSAGE;
  if (!jobTitle) errors[`${prefix}.jobTitle`] = REQUIRED_MESSAGE;
  else if (!isAllowed(jobTitle, PARTNER_JOB_TITLES)) errors[`${prefix}.jobTitle`] = "Select a valid job title.";
  if (!email) errors[`${prefix}.email`] = REQUIRED_MESSAGE;
  else if (!isValidEmail(email)) errors[`${prefix}.email`] = "Enter a valid email address.";
  if (!phoneCountryCode) errors[`${prefix}.phoneCountryCode`] = REQUIRED_MESSAGE;
  if (!phoneNumber) errors[`${prefix}.phoneNumber`] = REQUIRED_MESSAGE;
  else if (phoneNumber.length < 7) errors[`${prefix}.phoneNumber`] = "Enter a valid phone number.";

  return {
    errors,
    data: {
      fullName,
      jobTitle,
      email,
      phoneCountryCode,
      phoneNumber,
      isPrimary: index === 0,
      position: index,
    } satisfies PartnerApplicationContactInput,
  };
}

export function validatePartnerBusinessInformation(
  requestBody: unknown,
): PartnerApplicationValidationResult<PartnerBusinessInformationInput> {
  const body = toBody(requestBody);
  const errors: FieldErrors = {};
  const registeredBusinessName = getString(body, "registeredBusinessName");
  const companyEmailAddress = getString(body, "companyEmailAddress").toLowerCase();
  const businessAddress = getString(body, "businessAddress");
  const companyHouseNumber = getString(body, "companyHouseNumber");
  const companyPhoneCountryCode = getString(body, "companyPhoneCountryCode");
  const companyPhoneNumber = normalizePhoneNumber(getString(body, "companyPhoneNumber"));
  const website = getString(body, "website");
  const rawContacts = Array.isArray(body.contacts) ? body.contacts : [];

  if (!registeredBusinessName) errors.registeredBusinessName = REQUIRED_MESSAGE;
  if (!companyEmailAddress) errors.companyEmailAddress = REQUIRED_MESSAGE;
  else if (!isValidEmail(companyEmailAddress)) errors.companyEmailAddress = "Enter a valid company email address.";
  if (!businessAddress) errors.businessAddress = REQUIRED_MESSAGE;
  if (!companyHouseNumber) errors.companyHouseNumber = REQUIRED_MESSAGE;
  else if (companyHouseNumber.length < 8) errors.companyHouseNumber = "Company House Number must be at least 8 characters.";
  if (!companyPhoneCountryCode) errors.companyPhoneCountryCode = REQUIRED_MESSAGE;
  if (!companyPhoneNumber) errors.companyPhoneNumber = REQUIRED_MESSAGE;
  else if (companyPhoneNumber.length < 7) errors.companyPhoneNumber = "Enter a valid phone number.";
  if (website && !isValidUrl(website)) errors.website = "Enter a valid website address.";
  if (rawContacts.length === 0) errors.contacts = "Add at least one company contact.";
  if (rawContacts.length > 6) errors.contacts = "You can add up to 6 contacts.";

  const contacts = rawContacts.slice(0, 6).map((contact, index) => validateContact(contact, index));
  contacts.forEach((contact) => Object.assign(errors, contact.errors));

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      registeredBusinessName,
      companyEmailAddress,
      businessAddress,
      companyHouseNumber,
      companyPhoneCountryCode,
      companyPhoneNumber,
      website: normalizeUrl(website),
      contacts: contacts.map((contact) => contact.data),
    },
  };
}

function normalizeMoney(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  return Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : null;
}

export function validatePartnerOperationalDetails(
  requestBody: unknown,
): PartnerApplicationValidationResult<PartnerOperationalDetailsInput> {
  const body = toBody(requestBody);
  const errors: FieldErrors = {};
  const collectionCities = getStringArray(body, "collectionCities");
  const rawItemsHandled = getStringArray(body, "itemsHandled");
  const otherItemsHandled = getString(body, "otherItemsHandled");
  const operationalBusinessAddress = getString(body, "operationalBusinessAddress");
  const shippingMethod = getString(body, "shippingMethod");
  const shipmentFrequency = getString(body, "shipmentFrequency");
  const rawPricePerKg = getString(body, "pricePerKg");
  const rawBarrelPrice = getString(body, "pricePerBarrel");
  const insuranceAvailable = body.insuranceAvailable;
  const rawMaxLength = getString(body, "maxLength");
  const rawMaxHeight = getString(body, "maxHeight");
  const rawMaxWidth = getString(body, "maxWidth");
  const upfrontImmigrationCharge = body.upfrontImmigrationCharge;

  const normalizedCollectionCities = normalizeUkCities(collectionCities);
  if (collectionCities.length === 0) {
    errors.collectionCities = "Add at least one collection city.";
  } else if (!normalizedCollectionCities) {
    errors.collectionCities = "Select valid UK cities from the suggestions.";
  }

  const hasOtherSelection = rawItemsHandled.includes("Other");
  const storedCustomItems = rawItemsHandled.filter((item) => item.startsWith("Other: "));
  const invalidItems = rawItemsHandled.filter(
    (item) => !isAllowed(item, PARTNER_ITEMS_HANDLED) && !item.startsWith("Other: "),
  );

  if (rawItemsHandled.length === 0) {
    errors.itemsHandled = "Select at least one item category.";
  } else if (invalidItems.length > 0) {
    errors.itemsHandled = "Select valid item categories.";
  }

  if (hasOtherSelection && !otherItemsHandled) {
    errors.otherItemsHandled = "Tell us what other items you handle.";
  } else if (otherItemsHandled.length > 120) {
    errors.otherItemsHandled = "Keep the other item description under 120 characters.";
  }

  const malformedStoredCustomItem = storedCustomItems.some(
    (item) => item.slice("Other: ".length).trim().length === 0,
  );
  if (malformedStoredCustomItem) {
    errors.itemsHandled = "Select valid item categories.";
  }

  if (!operationalBusinessAddress) {
    errors.operationalBusinessAddress = REQUIRED_MESSAGE;
  }
  if (!isAllowed(shippingMethod, PARTNER_SHIPPING_METHODS)) {
    errors.shippingMethod = "Select a valid shipping method.";
  }
  if (!isAllowed(shipmentFrequency, PARTNER_SHIPMENT_FREQUENCIES)) {
    errors.shipmentFrequency = "Select a valid shipment frequency.";
  }

  const pricePerKg = normalizeMoney(rawPricePerKg);
  const pricePerBarrel = normalizeMoney(rawBarrelPrice);
  const maxLength = normalizeMoney(rawMaxLength);
  const maxHeight = normalizeMoney(rawMaxHeight);
  const maxWidth = normalizeMoney(rawMaxWidth);

  if (!pricePerKg) errors.pricePerKg = "Enter a valid price per KG.";
  if (!pricePerBarrel) errors.pricePerBarrel = "Enter a valid price per barrel.";
  if (typeof insuranceAvailable !== "boolean") {
    errors.insuranceAvailable = "Select an option.";
  }
  if (!maxLength) errors.maxLength = "Enter a valid maximum length.";
  if (!maxHeight) errors.maxHeight = "Enter a valid maximum height.";
  if (!maxWidth) errors.maxWidth = "Enter a valid maximum width.";
  if (typeof upfrontImmigrationCharge !== "boolean") {
    errors.upfrontImmigrationCharge = "Select an option.";
  }

  if (Object.keys(errors).length > 0) return { success: false, errors };

  const normalizedItemsHandled = [
    ...rawItemsHandled.filter(
      (item) => item !== "Other" && isAllowed(item, PARTNER_ITEMS_HANDLED),
    ),
    ...storedCustomItems,
    ...(hasOtherSelection ? [`Other: ${otherItemsHandled}`] : []),
  ];

  return {
    success: true,
    data: {
      collectionCities: normalizedCollectionCities!,
      itemsHandled: [...new Set(normalizedItemsHandled)],
      operationalBusinessAddress,
      shippingMethod: shippingMethod as PartnerOperationalDetailsInput["shippingMethod"],
      shipmentFrequency: shipmentFrequency as PartnerOperationalDetailsInput["shipmentFrequency"],
      pricePerKg: pricePerKg!,
      pricePerBarrel: pricePerBarrel!,
      insuranceAvailable: insuranceAvailable as boolean,
      maxLength: maxLength!,
      maxHeight: maxHeight!,
      maxWidth: maxWidth!,
      upfrontImmigrationCharge: upfrontImmigrationCharge as boolean,
    },
  };
}

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function validatePartnerAccountInformation(
  requestBody: unknown,
): PartnerApplicationValidationResult<PartnerAccountInformationInput> {
  const body = toBody(requestBody);
  const errors: FieldErrors = {};
  const companyBio = getString(body, "companyBio");
  const responseTime = getString(body, "responseTime");
  const collectionMethod = getString(body, "collectionMethod");
  const deliveryMethod = getString(body, "deliveryMethod");

  if (!companyBio) errors.companyBio = REQUIRED_MESSAGE;
  else if (countWords(companyBio) > 160) errors.companyBio = "Company bio must not exceed 160 words.";
  if (!isAllowed(responseTime, PARTNER_RESPONSE_TIMES)) errors.responseTime = "Select a valid response time.";
  if (!isAllowed(collectionMethod, PARTNER_COLLECTION_METHODS)) errors.collectionMethod = "Select a valid collection method.";
  if (!isAllowed(deliveryMethod, PARTNER_DELIVERY_METHODS)) errors.deliveryMethod = "Select a valid delivery method.";

  if (Object.keys(errors).length > 0) return { success: false, errors };

  return {
    success: true,
    data: {
      companyBio,
      responseTime: responseTime as PartnerAccountInformationInput["responseTime"],
      collectionMethod: collectionMethod as PartnerAccountInformationInput["collectionMethod"],
      deliveryMethod: deliveryMethod as PartnerAccountInformationInput["deliveryMethod"],
    },
  };
}
