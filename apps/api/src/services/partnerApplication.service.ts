/**
 * Responsibility:
 * Persists the multi-step shipping-partner application, restores saved drafts,
 * uploads company-logo metadata, and submits a validated application.
 */

import crypto from "node:crypto";
import type { ShippingPartnerApplicationStep } from "../generated/prisma/enums.js";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";
import { hashPartnerOnboardingToken } from "../lib/partnerAuth.js";
import { prisma } from "../lib/prisma.js";
import type {
  PartnerAccountInformationInput,
  PartnerBusinessInformationInput,
  PartnerOperationalDetailsInput,
} from "../validators/partnerApplication.validators.js";
import {
  validatePartnerAccountInformation,
  validatePartnerBusinessInformation,
  validatePartnerOperationalDetails,
} from "../validators/partnerApplication.validators.js";
import { getPartnerFromOnboardingToken } from "./partnerAuth.service.js";

const STEP = {
  BUSINESS_INFORMATION: "BUSINESS_INFORMATION",
  OPERATIONAL_DETAILS: "OPERATIONAL_DETAILS",
  ACCOUNT_INFORMATION: "ACCOUNT_INFORMATION",
  REVIEW: "REVIEW",
  SUBMITTED: "SUBMITTED",
} as const satisfies Record<string, ShippingPartnerApplicationStep>;

type LogoUpload = {
  secureUrl: string;
  publicId: string;
  format: string | null;
  bytes: number;
};

function decimalToString(value: unknown) {
  if (value === null || value === undefined) return null;
  return String(value);
}

function toPublicApplication(application: any) {
  return {
    id: application.id,
    currentStep: application.currentStep,
    registeredBusinessName: application.registeredBusinessName,
    companyEmailAddress: application.companyEmailAddress,
    businessAddress: application.businessAddress,
    companyHouseNumber: application.companyHouseNumber,
    companyPhoneCountryCode: application.companyPhoneCountryCode,
    companyPhoneNumber: application.companyPhoneNumber,
    website: application.website,
    contacts: [...(application.contacts ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((contact) => ({
        id: contact.id,
        fullName: contact.fullName,
        jobTitle: contact.jobTitle,
        email: contact.email,
        phoneCountryCode: contact.phoneCountryCode,
        phoneNumber: contact.phoneNumber,
        isPrimary: contact.isPrimary,
        position: contact.position,
      })),
    collectionCities: application.collectionCities ?? [],
    itemsHandled: application.itemsHandled ?? [],
    operationalBusinessAddress: application.operationalBusinessAddress,
    shippingMethod: application.shippingMethod,
    shipmentFrequency: application.shipmentFrequency,
    airCargoPricePerKg: decimalToString(application.airCargoPricePerKg),
    seaCargoPricePerKg: decimalToString(application.seaCargoPricePerKg),
    pricePerBarrel: decimalToString(application.pricePerBarrel),
    insuranceAvailable: application.insuranceAvailable,
    upfrontImmigrationCharge: application.upfrontImmigrationCharge,
    companyLogoUrl: application.companyLogoUrl,
    companyLogoPublicId: application.companyLogoPublicId,
    companyLogoFormat: application.companyLogoFormat,
    companyLogoBytes: application.companyLogoBytes,
    companyBio: application.companyBio,
    responseTime: application.responseTime,
    collectionMethod: application.collectionMethod,
    deliveryMethod: application.deliveryMethod,
    applicationReference: application.applicationReference,
    submittedAt: application.submittedAt,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}

async function requirePartner(token: string | undefined) {
  return getPartnerFromOnboardingToken(token);
}

async function getOrCreateApplication(
  partner: Awaited<ReturnType<typeof requirePartner>>,
) {
  const existing = await prisma.shippingPartnerApplication.findUnique({
    where: { partnerId: partner.id },
    include: { contacts: { orderBy: { position: "asc" } } },
  });

  if (existing) return existing;

  return prisma.shippingPartnerApplication.create({
    data: {
      partnerId: partner.id,
      companyEmailAddress: partner.email,
      companyPhoneCountryCode: partner.phoneCountryCode,
      companyPhoneNumber: partner.phoneNumber,
      contacts: {
        create: {
          fullName: `${partner.firstName} ${partner.lastName}`.trim(),
          jobTitle: "",
          email: partner.email,
          phoneCountryCode: partner.phoneCountryCode,
          phoneNumber: partner.phoneNumber,
          isPrimary: true,
          position: 0,
        },
      },
    },
    include: { contacts: { orderBy: { position: "asc" } } },
  });
}

function assertEditable(application: {
  currentStep: ShippingPartnerApplicationStep;
  submittedAt: Date | null;
}) {
  if (application.currentStep === STEP.SUBMITTED || application.submittedAt) {
    throw new HttpError(
      HTTP_STATUS.CONFLICT,
      "This application has already been submitted and can no longer be edited.",
      { code: "APPLICATION_ALREADY_SUBMITTED" },
    );
  }
}

function advanceStep(
  currentStep: ShippingPartnerApplicationStep,
  nextStep: ShippingPartnerApplicationStep,
): ShippingPartnerApplicationStep {
  return currentStep === STEP.REVIEW ? STEP.REVIEW : nextStep;
}

export async function getPartnerApplication(token: string | undefined) {
  const partner = await requirePartner(token);
  const application = await getOrCreateApplication(partner);

  return {
    partner,
    application: toPublicApplication(application),
  };
}

export async function savePartnerBusinessInformation(
  token: string | undefined,
  input: PartnerBusinessInformationInput,
) {
  const partner = await requirePartner(token);
  const application = await getOrCreateApplication(partner);
  assertEditable(application);

  const currentStep = advanceStep(
    application.currentStep,
    STEP.OPERATIONAL_DETAILS,
  );

  const updated = await prisma.$transaction(async (transaction) => {
    await transaction.shippingPartnerApplicationContact.deleteMany({
      where: { applicationId: application.id },
    });

    return transaction.shippingPartnerApplication.update({
      where: { id: application.id },
      data: {
        registeredBusinessName: input.registeredBusinessName,
        companyEmailAddress: input.companyEmailAddress,
        businessAddress: input.businessAddress,
        companyHouseNumber: input.companyHouseNumber,
        companyPhoneCountryCode: input.companyPhoneCountryCode,
        companyPhoneNumber: input.companyPhoneNumber,
        website: input.website,
        currentStep,
        contacts: {
          create: input.contacts.map((contact) => ({
            fullName: contact.fullName,
            jobTitle: contact.jobTitle,
            email: contact.email,
            phoneCountryCode: contact.phoneCountryCode,
            phoneNumber: contact.phoneNumber,
            isPrimary: contact.isPrimary,
            position: contact.position,
          })),
        },
      },
      include: { contacts: { orderBy: { position: "asc" } } },
    });
  });

  return toPublicApplication(updated);
}

export async function savePartnerOperationalDetails(
  token: string | undefined,
  input: PartnerOperationalDetailsInput,
) {
  const partner = await requirePartner(token);
  const application = await getOrCreateApplication(partner);
  assertEditable(application);

  const updated = await prisma.shippingPartnerApplication.update({
    where: { id: application.id },
    data: {
      collectionCities: input.collectionCities,
      itemsHandled: input.itemsHandled,
      operationalBusinessAddress: input.operationalBusinessAddress,
      shippingMethod: input.shippingMethod,
      shipmentFrequency: input.shipmentFrequency,
      airCargoPricePerKg: input.airCargoPricePerKg,
      seaCargoPricePerKg: input.seaCargoPricePerKg,
      pricePerBarrel: input.pricePerBarrel,
      insuranceAvailable: input.insuranceAvailable,
      upfrontImmigrationCharge: input.upfrontImmigrationCharge,
      currentStep: advanceStep(
        application.currentStep,
        STEP.ACCOUNT_INFORMATION,
      ),
    },
    include: { contacts: { orderBy: { position: "asc" } } },
  });

  return toPublicApplication(updated);
}

export async function savePartnerAccountInformation(
  token: string | undefined,
  input: PartnerAccountInformationInput,
) {
  const partner = await requirePartner(token);
  const application = await getOrCreateApplication(partner);
  assertEditable(application);

  const updated = await prisma.shippingPartnerApplication.update({
    where: { id: application.id },
    data: {
      companyBio: input.companyBio,
      responseTime: input.responseTime,
      collectionMethod: input.collectionMethod,
      deliveryMethod: input.deliveryMethod,
      currentStep: STEP.REVIEW,
    },
    include: { contacts: { orderBy: { position: "asc" } } },
  });

  return toPublicApplication(updated);
}

export async function savePartnerCompanyLogo(
  token: string | undefined,
  logo: LogoUpload,
) {
  const partner = await requirePartner(token);
  const application = await getOrCreateApplication(partner);
  assertEditable(application);

  const updated = await prisma.shippingPartnerApplication.update({
    where: { id: application.id },
    data: {
      companyLogoUrl: logo.secureUrl,
      companyLogoPublicId: logo.publicId,
      companyLogoFormat: logo.format,
      companyLogoBytes: logo.bytes,
    },
    include: { contacts: { orderBy: { position: "asc" } } },
  });

  return toPublicApplication(updated);
}

function buildBusinessValidationBody(application: any) {
  return {
    registeredBusinessName: application.registeredBusinessName,
    companyEmailAddress: application.companyEmailAddress,
    businessAddress: application.businessAddress,
    companyHouseNumber: application.companyHouseNumber,
    companyPhoneCountryCode: application.companyPhoneCountryCode,
    companyPhoneNumber: application.companyPhoneNumber,
    website: application.website,
    contacts: application.contacts,
  };
}

function buildOperationalValidationBody(application: any) {
  return {
    collectionCities: application.collectionCities,
    itemsHandled: application.itemsHandled,
    operationalBusinessAddress: application.operationalBusinessAddress,
    shippingMethod: application.shippingMethod,
    shipmentFrequency: application.shipmentFrequency,
    airCargoPricePerKg: decimalToString(application.airCargoPricePerKg),
    seaCargoPricePerKg: decimalToString(application.seaCargoPricePerKg),
    pricePerBarrel: decimalToString(application.pricePerBarrel),
    insuranceAvailable: application.insuranceAvailable,
    upfrontImmigrationCharge: application.upfrontImmigrationCharge,
  };
}

function buildAccountValidationBody(application: any) {
  return {
    companyBio: application.companyBio,
    responseTime: application.responseTime,
    collectionMethod: application.collectionMethod,
    deliveryMethod: application.deliveryMethod,
  };
}

function mergeValidationErrors(
  ...validations: Array<{
    success: boolean;
    errors?: Record<string, string>;
  }>
) {
  return validations.reduce<Record<string, string>>(
    (errors, validation) => {
      if (!validation.success && validation.errors) {
        Object.assign(errors, validation.errors);
      }

      return errors;
    },
    {},
  );
}

async function generateApplicationReference() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = crypto.randomInt(10000, 100000);
    const reference = `ZNR-AGENT-${suffix}`;

    const exists = await prisma.shippingPartnerApplication.findUnique({
      where: { applicationReference: reference },
      select: { id: true },
    });

    if (!exists) return reference;
  }

  return `ZNR-AGENT-${Date.now().toString().slice(-8)}`;
}

export async function submitPartnerApplication(token: string | undefined) {
  const partner = await requirePartner(token);

  const application = await prisma.shippingPartnerApplication.findUnique({
    where: { partnerId: partner.id },
    include: { contacts: { orderBy: { position: "asc" } } },
  });

  if (!application) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "Complete your application before submitting it.",
      { code: "APPLICATION_INCOMPLETE" },
    );
  }

  if (application.submittedAt && application.applicationReference) {
    return {
      application: toPublicApplication(application),
      reference: application.applicationReference,
    };
  }

  const businessValidation = validatePartnerBusinessInformation(
    buildBusinessValidationBody(application),
  );

  const operationalValidation = validatePartnerOperationalDetails(
    buildOperationalValidationBody(application),
  );

  const accountValidation = validatePartnerAccountInformation(
    buildAccountValidationBody(application),
  );

  const errors = mergeValidationErrors(
    businessValidation,
    operationalValidation,
    accountValidation,
  );

  if (Object.keys(errors).length > 0) {
    throw new HttpError(
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      "Complete all required application fields before submitting.",
      {
        code: "APPLICATION_INCOMPLETE",
        errors,
      },
    );
  }

  const reference = await generateApplicationReference();
  const submittedAt = new Date();

  const updated = await prisma.$transaction(async (transaction) => {
    const claimed = await transaction.shippingPartnerApplication.updateMany({
      where: {
        id: application.id,
        submittedAt: null,
      },
      data: {
        currentStep: STEP.SUBMITTED,
        applicationReference: reference,
        submittedAt,
      },
    });

    if (claimed.count === 1) {
      await transaction.shippingPartner.update({
        where: { id: partner.id },
        data: { status: "APPLICATION_SUBMITTED" },
      });
    }

    return transaction.shippingPartnerApplication.findUnique({
      where: { id: application.id },
      include: { contacts: { orderBy: { position: "asc" } } },
    });
  });

  if (!updated?.applicationReference) {
    throw new HttpError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Unable to finalise the application submission.",
    );
  }

  return {
    application: toPublicApplication(updated),
    reference: updated.applicationReference,
  };
}

export async function cancelPartnerApplication(token: string | undefined) {
  const partner = await requirePartner(token);

  const application = await prisma.shippingPartnerApplication.findUnique({
    where: { partnerId: partner.id },
  });

  if (application?.submittedAt) {
    throw new HttpError(
      HTTP_STATUS.CONFLICT,
      "A submitted application cannot be cancelled from onboarding.",
      { code: "APPLICATION_ALREADY_SUBMITTED" },
    );
  }

  await prisma.$transaction([
    prisma.shippingPartnerApplication.deleteMany({
      where: { partnerId: partner.id },
    }),
    prisma.shippingPartnerOnboardingSession.updateMany({
      where: {
        partnerId: partner.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
    prisma.shippingPartner.update({
      where: { id: partner.id },
      data: { status: "ONBOARDING" },
    }),
  ]);

  return {
    message: "Application cancelled.",
  };
}

export async function revokeCurrentPartnerSession(
  token: string | undefined,
) {
  if (!token) return;

  await prisma.shippingPartnerOnboardingSession.updateMany({
    where: {
      tokenHash: hashPartnerOnboardingToken(token),
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}