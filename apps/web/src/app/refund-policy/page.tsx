import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import { policyDocuments } from "@/components/legal/policyContent";
export const metadata: Metadata = { title: "Refund Policy | Zionra" };
export default function RefundPage() {return <><Header/><LegalDocumentPage document={policyDocuments.refund}/><Footer/></>;}
