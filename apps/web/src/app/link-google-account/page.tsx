/**
 * Responsibility:
 * Defines metadata and renders the explicit Google account-linking route.
 */

import type { Metadata } from "next";
import LinkGoogleAccountForm from "@/components/auth/LinkGoogleAccountForm";

export const metadata: Metadata = {
  title: "Connect Google | Zionra",
  description: "Confirm your Zionra password before connecting Google.",
};

export default function LinkGoogleAccountPage() {
  return <LinkGoogleAccountForm />;
}
