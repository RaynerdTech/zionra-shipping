import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookiePolicyPage from "@/components/legal/CookiePolicyPage";
export const metadata: Metadata = { title: "Cookie Policy | Zionra" };
export default function CookieRoute() {return <><Header/><CookiePolicyPage/><Footer/></>;}
