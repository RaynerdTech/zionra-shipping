import type { Metadata } from "next";
import PartnerLoginForm from "@/components/auth/PartnerLoginForm";

export const metadata: Metadata = {
  title: "Shipping partner login | Zionra",
  description: "Sign in to your Zionra shipping-partner account.",
};

type PageProps = {
  searchParams: Promise<{
    verified?: string | string[];
    email?: string | string[];
    passwordReset?: string | string[];
    googleStatus?: string | string[];
  }>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnerLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <PartnerLoginForm
      initialEmail={first(params.email) ?? ""}
      wasVerified={first(params.verified) === "1"}
      passwordWasReset={first(params.passwordReset) === "1"}
      googleStatus={first(params.googleStatus)}
    />
  );
}
