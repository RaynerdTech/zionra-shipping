import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Find your partner account | Zionra",
  description: "Start secure recovery for a Zionra shipping-partner account.",
};

type PageProps = {
  searchParams: Promise<{ email?: string | string[] }>;
};

export default async function PartnerForgotPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  return <ForgotPasswordForm accountType="partner" initialEmail={email ?? ""} />;
}
