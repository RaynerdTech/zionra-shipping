-- CreateEnum
CREATE TYPE "ShippingPartnerStatus" AS ENUM ('ONBOARDING', 'APPLICATION_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "ShippingPartner" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneCountryCode" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "passwordHash" TEXT,
    "countryOfResidence" TEXT NOT NULL,
    "referralSource" TEXT,
    "acceptedTermsAt" TIMESTAMP(3) NOT NULL,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "status" "ShippingPartnerStatus" NOT NULL DEFAULT 'ONBOARDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingPartnerEmailVerificationCode" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "ShippingPartnerEmailVerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingPartnerOnboardingSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "ShippingPartnerOnboardingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingPartnerOAuthAccount" (
    "id" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "ShippingPartnerOAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingPartnerOAuthSignup" (
    "id" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingPartnerOAuthSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingPartner_email_key" ON "ShippingPartner"("email");
CREATE INDEX "ShippingPartner_email_idx" ON "ShippingPartner"("email");
CREATE INDEX "ShippingPartner_phoneCountryCode_phoneNumber_idx" ON "ShippingPartner"("phoneCountryCode", "phoneNumber");
CREATE INDEX "ShippingPartner_status_idx" ON "ShippingPartner"("status");
CREATE INDEX "ShippingPartnerEmailVerificationCode_partnerId_idx" ON "ShippingPartnerEmailVerificationCode"("partnerId");
CREATE INDEX "ShippingPartnerEmailVerificationCode_codeHash_idx" ON "ShippingPartnerEmailVerificationCode"("codeHash");
CREATE UNIQUE INDEX "ShippingPartnerOnboardingSession_tokenHash_key" ON "ShippingPartnerOnboardingSession"("tokenHash");
CREATE INDEX "ShippingPartnerOnboardingSession_partnerId_idx" ON "ShippingPartnerOnboardingSession"("partnerId");
CREATE INDEX "ShippingPartnerOnboardingSession_expiresAt_idx" ON "ShippingPartnerOnboardingSession"("expiresAt");
CREATE INDEX "ShippingPartnerOAuthAccount_email_idx" ON "ShippingPartnerOAuthAccount"("email");
CREATE UNIQUE INDEX "ShippingPartnerOAuthAccount_provider_providerAccountId_key" ON "ShippingPartnerOAuthAccount"("provider", "providerAccountId");
CREATE UNIQUE INDEX "ShippingPartnerOAuthAccount_provider_partnerId_key" ON "ShippingPartnerOAuthAccount"("provider", "partnerId");
CREATE UNIQUE INDEX "ShippingPartnerOAuthSignup_tokenHash_key" ON "ShippingPartnerOAuthSignup"("tokenHash");
CREATE INDEX "ShippingPartnerOAuthSignup_email_idx" ON "ShippingPartnerOAuthSignup"("email");
CREATE INDEX "ShippingPartnerOAuthSignup_expiresAt_idx" ON "ShippingPartnerOAuthSignup"("expiresAt");
CREATE UNIQUE INDEX "ShippingPartnerOAuthSignup_provider_providerAccountId_key" ON "ShippingPartnerOAuthSignup"("provider", "providerAccountId");

-- AddForeignKey
ALTER TABLE "ShippingPartnerEmailVerificationCode" ADD CONSTRAINT "ShippingPartnerEmailVerificationCode_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "ShippingPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShippingPartnerOnboardingSession" ADD CONSTRAINT "ShippingPartnerOnboardingSession_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "ShippingPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShippingPartnerOAuthAccount" ADD CONSTRAINT "ShippingPartnerOAuthAccount_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "ShippingPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
