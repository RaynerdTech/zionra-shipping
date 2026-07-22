-- CreateTable
CREATE TABLE "CustomerLoginChallenge" (
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
    "customerId" TEXT NOT NULL,

    CONSTRAINT "CustomerLoginChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerLoginChallenge_tokenHash_key" ON "CustomerLoginChallenge"("tokenHash");

-- CreateIndex
CREATE INDEX "CustomerLoginChallenge_customerId_idx" ON "CustomerLoginChallenge"("customerId");

-- CreateIndex
CREATE INDEX "CustomerLoginChallenge_expiresAt_idx" ON "CustomerLoginChallenge"("expiresAt");

-- AddForeignKey
ALTER TABLE "CustomerLoginChallenge" ADD CONSTRAINT "CustomerLoginChallenge_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
