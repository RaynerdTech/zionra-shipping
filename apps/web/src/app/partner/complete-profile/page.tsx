/** Defines the Google shipping-partner profile completion route. */

import type { Metadata } from "next";
import PartnerCompleteGoogleProfileForm from "@/components/auth/PartnerCompleteGoogleProfileForm";

export const metadata: Metadata = {
  title: "Complete your partner profile | Zionra",
  description: "Add the remaining details required for your Zionra partner application.",
};

export default function PartnerCompleteProfilePage() {
  return <PartnerCompleteGoogleProfileForm />;
}
