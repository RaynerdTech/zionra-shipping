-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE');

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CustomerOAuthAccount" (
    "id" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "CustomerOAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerOAuthSignup" (
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

    CONSTRAINT "CustomerOAuthSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerOAuthAccount_email_idx" ON "CustomerOAuthAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerOAuthAccount_provider_providerAccountId_key" ON "CustomerOAuthAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerOAuthAccount_provider_customerId_key" ON "CustomerOAuthAccount"("provider", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerOAuthSignup_tokenHash_key" ON "CustomerOAuthSignup"("tokenHash");

-- CreateIndex
CREATE INDEX "CustomerOAuthSignup_email_idx" ON "CustomerOAuthSignup"("email");

-- CreateIndex
CREATE INDEX "CustomerOAuthSignup_expiresAt_idx" ON "CustomerOAuthSignup"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerOAuthSignup_provider_providerAccountId_key" ON "CustomerOAuthSignup"("provider", "providerAccountId");

-- AddForeignKey
ALTER TABLE "CustomerOAuthAccount" ADD CONSTRAINT "CustomerOAuthAccount_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
