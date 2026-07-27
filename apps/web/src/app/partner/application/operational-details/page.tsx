import type { Metadata } from "next";
import { Suspense } from "react";
import PartnerOperationalDetailsForm from "@/components/partner-application/PartnerOperationalDetailsForm";
import { ApplicationLoading } from "@/components/partner-application/PartnerApplicationUI";

export const metadata: Metadata = { title: "Operational details | Zionra", description: "Add your shipping-partner operational details." };
export default function Page() { return <Suspense fallback={<ApplicationLoading />}><PartnerOperationalDetailsForm /></Suspense>; }
