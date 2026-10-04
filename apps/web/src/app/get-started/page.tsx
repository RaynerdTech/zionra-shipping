/**
 * Responsibility:
 * Renders the Zionra account-type selection route.
 * Interactive selection behaviour is handled by AccountTypeSelector.
 */

import type { Metadata } from "next";
import AccountTypeSelector from "@/components/auth/AccountTypeSelector";

export const metadata: Metadata = {
  title: "Choose your account type | Zionra",
  description:
    "Choose whether to continue as a Zionra customer or shipping partner.",
};

type GetStartedPageProps = {
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

export default async function GetStartedPage({ searchParams }: GetStartedPageProps) {
  const params = await searchParams;
  const returnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  return <AccountTypeSelector returnTo={returnTo ?? ""} />;
}
