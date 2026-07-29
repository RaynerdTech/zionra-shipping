import type { Metadata } from "next";
import { Suspense } from "react";
import PartnerBusinessInformationForm from "@/components/partner-application/PartnerBusinessInformationForm";
import { ApplicationLoading } from "@/components/partner-application/PartnerApplicationUI";

export const metadata: Metadata = {
  title: "Business information | Zionra",
  description: "Tell Zionra about your shipping business.",
};

export default function PartnerBusinessInformationPage() {
  return <Suspense fallback={<ApplicationLoading />}><PartnerBusinessInformationForm /></Suspense>;
}
