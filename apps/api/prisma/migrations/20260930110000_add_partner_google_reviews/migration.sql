CREATE TYPE "ShippingPartnerReviewSource" AS ENUM ('GOOGLE');

CREATE TABLE "ShippingPartnerReview" (
    "id" TEXT NOT NULL,
    "source" "ShippingPartnerReviewSource" NOT NULL DEFAULT 'GOOGLE',
    "externalReviewId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorPhotoUrl" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "partnerId" TEXT NOT NULL,

    CONSTRAINT "ShippingPartnerReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShippingPartnerReview_source_externalReviewId_key"
ON "ShippingPartnerReview"("source", "externalReviewId");

CREATE INDEX "ShippingPartnerReview_partnerId_reviewedAt_idx"
ON "ShippingPartnerReview"("partnerId", "reviewedAt");

ALTER TABLE "ShippingPartnerReview"
ADD CONSTRAINT "ShippingPartnerReview_partnerId_fkey"
FOREIGN KEY ("partnerId") REFERENCES "ShippingPartner"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
