import type { Metadata } from "next";
import { Suspense } from "react";
import PartnerAccountInformationForm from "@/components/partner-application/PartnerAccountInformationForm";
import { ApplicationLoading } from "@/components/partner-application/PartnerApplicationUI";

export const metadata: Metadata = { title: "Account information | Zionra", description: "Complete your Zionra partner profile." };
export default function Page() { return <Suspense fallback={<ApplicationLoading />}><PartnerAccountInformationForm /></Suspense>; }
