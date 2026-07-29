-- CreateEnum
CREATE TYPE "ShippingPartnerApplicationStep" AS ENUM ('BUSINESS_INFORMATION', 'OPERATIONAL_DETAILS', 'ACCOUNT_INFORMATION', 'REVIEW', 'SUBMITTED');

-- CreateTable
CREATE TABLE "ShippingPartnerApplication" (
    "id" TEXT NOT NULL,
    "currentStep" "ShippingPartnerApplicationStep" NOT NULL DEFAULT 'BUSINESS_INFORMATION',
    "registeredBusinessName" TEXT,
    "companyEmailAddress" TEXT,
    "businessAddress" TEXT,
    "companyHouseNumber" TEXT,
    "companyPhoneCountryCode" TEXT,
    "companyPhoneNumber" TEXT,
    "website" TEXT,
    "collectionCities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "itemsHandled" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "operationalBusinessAddress" TEXT,
    "shippingMethod" TEXT,
    "shipmentFrequency" TEXT,
    "airCargoPricePerKg" DECIMAL(12,2),
    "seaCargoPricePerKg" DECIMAL(12,2),
    "pricePerBarrel" DECIMAL(12,2),
    "insuranceAvailable" BOOLEAN,
    "upfrontImmigrationCharge" BOOLEAN,
    "companyLogoUrl" TEXT,
    "companyLogoPublicId" TEXT,
    "companyLogoFormat" TEXT,
    "companyLogoBytes" INTEGER,
    "companyBio" TEXT,
    "responseTime" TEXT,
    "collectionMethod" TEXT,
    "deliveryMethod" TEXT,
    "applicationReference" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "ShippingPartnerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingPartnerApplicationContact" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneCountryCode" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "ShippingPartnerApplicationContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingPartnerApplication_applicationReference_key" ON "ShippingPartnerApplication"("applicationReference");
CREATE UNIQUE INDEX "ShippingPartnerApplication_partnerId_key" ON "ShippingPartnerApplication"("partnerId");
CREATE INDEX "ShippingPartnerApplication_currentStep_idx" ON "ShippingPartnerApplication"("currentStep");
CREATE INDEX "ShippingPartnerApplication_submittedAt_idx" ON "ShippingPartnerApplication"("submittedAt");
CREATE INDEX "ShippingPartnerApplicationContact_applicationId_position_idx" ON "ShippingPartnerApplicationContact"("applicationId", "position");
CREATE INDEX "ShippingPartnerApplicationContact_email_idx" ON "ShippingPartnerApplicationContact"("email");

-- AddForeignKey
ALTER TABLE "ShippingPartnerApplication" ADD CONSTRAINT "ShippingPartnerApplication_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "ShippingPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShippingPartnerApplicationContact" ADD CONSTRAINT "ShippingPartnerApplicationContact_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ShippingPartnerApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
