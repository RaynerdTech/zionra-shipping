-- AddTable
CREATE TABLE "ShippingPartnerLoginChallenge" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "codeExpiresAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "emailSendCount" INTEGER NOT NULL DEFAULT 1,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "ShippingPartnerLoginChallenge_pkey" PRIMARY KEY ("id")
);

-- AddTable
CREATE TABLE "ShippingPartnerPasswordResetCode" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "ShippingPartnerPasswordResetCode_pkey" PRIMARY KEY ("id")
);

-- AddTable
CREATE TABLE "ShippingPartnerPasswordResetAuthorization" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partnerId" TEXT NOT NULL,
    "passwordResetCodeId" TEXT NOT NULL,

    CONSTRAINT "ShippingPartnerPasswordResetAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingPartnerLoginChallenge_tokenHash_key" ON "ShippingPartnerLoginChallenge"("tokenHash");
CREATE INDEX "ShippingPartnerLoginChallenge_partnerId_idx" ON "ShippingPartnerLoginChallenge"("partnerId");
CREATE INDEX "ShippingPartnerLoginChallenge_expiresAt_idx" ON "ShippingPartnerLoginChallenge"("expiresAt");

CREATE INDEX "ShippingPartnerPasswordResetCode_partnerId_idx" ON "ShippingPartnerPasswordResetCode"("partnerId");
CREATE INDEX "ShippingPartnerPasswordResetCode_codeHash_idx" ON "ShippingPartnerPasswordResetCode"("codeHash");

CREATE UNIQUE INDEX "ShippingPartnerPasswordResetAuthorization_tokenHash_key" ON "ShippingPartnerPasswordResetAuthorization"("tokenHash");
CREATE UNIQUE INDEX "ShippingPartnerPasswordResetAuthorization_passwordResetCodeId_key" ON "ShippingPartnerPasswordResetAuthorization"("passwordResetCodeId");
CREATE INDEX "ShippingPartnerPasswordResetAuthorization_partnerId_idx" ON "ShippingPartnerPasswordResetAuthorization"("partnerId");
CREATE INDEX "ShippingPartnerPasswordResetAuthorization_expiresAt_idx" ON "ShippingPartnerPasswordResetAuthorization"("expiresAt");

-- AddForeignKey
ALTER TABLE "ShippingPartnerLoginChallenge" ADD CONSTRAINT "ShippingPartnerLoginChallenge_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "ShippingPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShippingPartnerPasswordResetCode" ADD CONSTRAINT "ShippingPartnerPasswordResetCode_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "ShippingPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShippingPartnerPasswordResetAuthorization" ADD CONSTRAINT "ShippingPartnerPasswordResetAuthorization_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "ShippingPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShippingPartnerPasswordResetAuthorization" ADD CONSTRAINT "ShippingPartnerPasswordResetAuthorization_passwordResetCodeId_fkey" FOREIGN KEY ("passwordResetCodeId") REFERENCES "ShippingPartnerPasswordResetCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
