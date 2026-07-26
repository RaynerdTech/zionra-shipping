/** Defines the shipping-partner email verification route. */

import type { Metadata } from "next";
import PartnerEmailVerificationForm from "@/components/auth/PartnerEmailVerificationForm";

export const metadata: Metadata = {
  title: "Verify your partner email | Zionra",
  description: "Verify the email address connected to your Zionra partner application.",
};

type Props = { searchParams: Promise<{ email?: string | string[] }> };

export default async function PartnerVerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  return <PartnerEmailVerificationForm email={email ?? ""} />;
}
