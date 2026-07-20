/**
 * Responsibility:
 * Defines metadata and renders the Google customer profile-completion route.
 */

import type { Metadata } from "next";
import CompleteGoogleProfileForm from "@/components/auth/CompleteGoogleProfileForm";

export const metadata: Metadata = {
  title: "Complete your profile | Zionra",
  description: "Complete the remaining details for your Zionra account.",
};

export default function CompleteProfilePage() {
  return <CompleteGoogleProfileForm />;
}
