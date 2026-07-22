-- AlterTable
ALTER TABLE "CustomerPasswordResetCode" ADD COLUMN     "failedAttempts" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CustomerPasswordResetAuthorization" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,
    "passwordResetCodeId" TEXT NOT NULL,

    CONSTRAINT "CustomerPasswordResetAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPasswordResetAuthorization_tokenHash_key" ON "CustomerPasswordResetAuthorization"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPasswordResetAuthorization_passwordResetCodeId_key" ON "CustomerPasswordResetAuthorization"("passwordResetCodeId");

-- CreateIndex
CREATE INDEX "CustomerPasswordResetAuthorization_customerId_idx" ON "CustomerPasswordResetAuthorization"("customerId");

-- CreateIndex
CREATE INDEX "CustomerPasswordResetAuthorization_expiresAt_idx" ON "CustomerPasswordResetAuthorization"("expiresAt");

-- AddForeignKey
ALTER TABLE "CustomerPasswordResetAuthorization" ADD CONSTRAINT "CustomerPasswordResetAuthorization_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPasswordResetAuthorization" ADD CONSTRAINT "CustomerPasswordResetAuthorization_passwordResetCodeId_fkey" FOREIGN KEY ("passwordResetCodeId") REFERENCES "CustomerPasswordResetCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
