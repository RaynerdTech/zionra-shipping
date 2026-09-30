import { Suspense } from "react";

import ShipmentDetailsPage from "@/components/quote/ShipmentDetailsPage";

export default function QuoteShipmentPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-neutral-01" />}>
      <ShipmentDetailsPage />
    </Suspense>
  );
}
