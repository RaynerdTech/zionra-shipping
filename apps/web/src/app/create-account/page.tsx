/**
 * Responsibility:
 * Defines metadata, Google recovery feedback, and the customer account creation route.
 */

import type { Metadata } from "next";
import CreateAccountGoogleStatusNotice from "@/components/auth/CreateAccountGoogleStatusNotice";
import CreateCustomerAccountForm from "@/components/auth/CreateCustomerAccountForm";

export const metadata: Metadata = {
  title: "Create your account | Zionra",
  description: "Create a Zionra customer account.",
};

type CreateAccountPageProps = {
  searchParams: Promise<{
    googleStatus?: string | string[];
    returnTo?: string | string[];
  }>;
};

export default async function CreateAccountPage({
  searchParams,
}: CreateAccountPageProps) {
  const params = await searchParams;
  const googleStatus = Array.isArray(params.googleStatus)
    ? params.googleStatus[0]
    : params.googleStatus;
  const returnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;

  return (
    <>
      <CreateAccountGoogleStatusNotice status={googleStatus} />
      <CreateCustomerAccountForm returnTo={returnTo ?? ""} />
    </>
  );
}
