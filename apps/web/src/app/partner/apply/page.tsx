/** Defines the shipping-partner account creation route. */

import type { Metadata } from "next";
import CreateAccountGoogleStatusNotice from "@/components/auth/CreateAccountGoogleStatusNotice";
import PartnerCreateAccountForm from "@/components/auth/PartnerCreateAccountForm";

export const metadata: Metadata = {
  title: "Become a shipping partner | Zionra",
  description: "Create a Zionra shipping-partner account and begin onboarding.",
};

type Props = { searchParams: Promise<{ googleStatus?: string | string[] }> };

export default async function PartnerApplyPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = Array.isArray(params.googleStatus)
    ? params.googleStatus[0]
    : params.googleStatus;

  return (
    <>
      <CreateAccountGoogleStatusNotice status={status} />
      <PartnerCreateAccountForm />
    </>
  );
}
