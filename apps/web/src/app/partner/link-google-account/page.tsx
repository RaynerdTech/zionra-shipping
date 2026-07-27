/**
 * Responsibility:
 * Renders the password-confirmation step used to connect Google to an existing
 * Zionra shipping-partner account.
 */

import type { Metadata } from "next";
import LinkGoogleAccountForm from "@/components/auth/LinkGoogleAccountForm";

export const metadata: Metadata = {
  title: "Connect Google | Zionra Partner",
  description:
    "Confirm your Zionra shipping-partner password before connecting Google.",
};

export default function PartnerLinkGoogleAccountPage() {
  return <LinkGoogleAccountForm accountType="partner" />;
}
