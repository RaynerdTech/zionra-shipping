export const JOB_TITLE_OPTIONS = [
  "Founder",
  "CEO",
  "Operations Manager",
  "Logistics Manager",
  "Employee",
  "Other",
] as const;

export const ITEMS_HANDLED_OPTIONS = [
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

export const SHIPPING_METHOD_OPTIONS = ["Air cargo", "Sea cargo", "Both"] as const;

export const SHIPMENT_FREQUENCY_OPTIONS = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "On Demand / As Needed",
] as const;

export const RESPONSE_TIME_OPTIONS = [
  "Immediately",
  "Within 24 Hours",
  "Within 3 Days",
  "Within 1 Week",
  "Within 2 Weeks",
  "More Than 2 Weeks",
] as const;

export const COLLECTION_METHOD_OPTIONS = [
  "Pickup Only",
  "Drop-off Only",
  "Both Pickup & Drop-off",
] as const;

export const DELIVERY_METHOD_OPTIONS = [
  "Home delivery",
  "Depo Pickup",
  "Both",
] as const;

export const YES_NO_OPTIONS = ["Yes", "No"] as const;

export const APPLICATION_STEP_RANK = {
  BUSINESS_INFORMATION: 1,
  OPERATIONAL_DETAILS: 2,
  ACCOUNT_INFORMATION: 3,
  REVIEW: 4,
  SUBMITTED: 5,
} as const;

export const FIELD_LABEL_CLASS =
  "mb-2 block font-sans text-sm font-normal leading-[22px] text-neutral-10";
export const REQUIRED_CLASS = "text-error";
export const INPUT_CLASS = "zion-input h-[52px] min-w-0 md:h-12";
export const TEXTAREA_CLASS =
  "zion-input min-h-[170px] resize-y py-3 md:min-h-[190px]";