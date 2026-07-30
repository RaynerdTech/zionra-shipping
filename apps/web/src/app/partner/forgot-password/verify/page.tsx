import type { Metadata } from "next";
import VerifyPasswordResetCodeForm from "@/components/auth/VerifyPasswordResetCodeForm";

export const metadata: Metadata = {
  title: "Verify partner reset code | Zionra",
  description: "Verify the secure code sent for partner password recovery.",
};

type PageProps = {
  searchParams: Promise<{ email?: string | string[] }>;
};

export default async function PartnerVerifyPasswordResetPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  return <VerifyPasswordResetCodeForm accountType="partner" email={email ?? ""} />;
}
