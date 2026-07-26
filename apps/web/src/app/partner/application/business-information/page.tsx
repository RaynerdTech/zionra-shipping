/** Defines the protected first shipping-partner onboarding route. */

import type { Metadata } from "next";
import PartnerBusinessInformationPlaceholder from "@/components/auth/PartnerBusinessInformationPlaceholder";

export const metadata: Metadata = {
  title: "Business information | Zionra",
  description: "Continue your Zionra shipping-partner application.",
};

export default function PartnerBusinessInformationPage() {
  return <PartnerBusinessInformationPlaceholder />;
}
