import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import { policyDocuments } from "@/components/legal/policyContent";
export const metadata: Metadata = { title: "Terms & Conditions | Zionra" };
export default function TermsPage() {return <><Header/><LegalDocumentPage document={policyDocuments.terms}/><Footer/></>;}
