"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { LegalPageShell } from "./LegalDocumentPage";

type CookiePreferences = { analytics: boolean; functional: boolean; marketing: boolean };
const STORAGE_KEY = "zionra_cookie_prefs";
const optionalCategories: { key: keyof CookiePreferences; label: string; caption: string }[] = [
  { key: "analytics", label: "Performance and analytics", caption: "Help us understand how Zionra is used" },
  { key: "functional", label: "Functionality", caption: "Remember your choices and saved details" },
  { key: "marketing", label: "Marketing and advertising", caption: "Show relevant content and measure campaigns" },
];
const empty: CookiePreferences = { analytics: false, functional: false, marketing: false };
const emptySnapshot = JSON.stringify(empty);
let preferencesSnapshot =
  typeof window === "undefined" ? emptySnapshot : readSavedPreferencesSnapshot();
const preferenceListeners = new Set<() => void>();

function readSavedPreferencesSnapshot() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySnapshot;
    const loaded: unknown = JSON.parse(raw);
    if (typeof loaded !== "object" || loaded === null) return emptySnapshot;
    const value = loaded as Partial<CookiePreferences>;
    return JSON.stringify({
      analytics: value.analytics === true,
      functional: value.functional === true,
      marketing: value.marketing === true,
    });
  } catch {
    return emptySnapshot;
  }
}

function notifyPreferenceListeners() {
  preferenceListeners.forEach((listener) => listener());
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  const nextSnapshot = readSavedPreferencesSnapshot();
  if (nextSnapshot === preferencesSnapshot) return;
  preferencesSnapshot = nextSnapshot;
  notifyPreferenceListeners();
}

function subscribeToPreferences(listener: () => void) {
  preferenceListeners.add(listener);
  if (typeof window !== "undefined" && preferenceListeners.size === 1) {
    window.addEventListener("storage", handleStorageChange);
  }
  return () => {
    preferenceListeners.delete(listener);
    if (typeof window !== "undefined" && preferenceListeners.size === 0) {
      window.removeEventListener("storage", handleStorageChange);
    }
  };
}

function getPreferencesSnapshot() {
  return preferencesSnapshot;
}

function getServerPreferencesSnapshot() {
  return emptySnapshot;
}

function updateDraftPreferences(next: CookiePreferences) {
  const nextSnapshot = JSON.stringify(next);
  if (nextSnapshot === preferencesSnapshot) return;
  preferencesSnapshot = nextSnapshot;
  notifyPreferenceListeners();
}

const contents = [
  "What Are Cookies", "How We Use Cookies", "Types of Cookies We Use", "Third-Party Cookies", "Managing Your Preferences", "Changes to This Policy", "Contact Us",
].map((title, index) => ({ number: index + 1, title }));

function CookieSection({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return <section id={`section-${number}`} className="mt-10 scroll-mt-28 border-t border-neutral-02 pt-10"><h2 className="mb-4 flex gap-3 font-display text-xl font-semibold text-primary-10"><span className="shrink-0 text-[#3E5775]">{number}.</span>{title}</h2>{children}</section>;
}
function Bullets({ children }: { children: ReactNode }) {return <ul className="mt-3 ml-6 list-disc space-y-1">{children}</ul>;}

export default function CookiePolicyPage() {
  const snapshot = useSyncExternalStore(
    subscribeToPreferences,
    getPreferencesSnapshot,
    getServerPreferencesSnapshot,
  );
  const prefs = JSON.parse(snapshot) as CookiePreferences;
  const [status, setStatus] = useState("");

  function save(next: CookiePreferences, message: string) {
    updateDraftPreferences(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setStatus(message); }
    catch { setStatus("Preferences could not be saved in this browser."); }
    // Future optional scripts must check these preferences before activation.
  }
  return <LegalPageShell title="Cookie Policy" sections={contents}>
    <div className="space-y-3 text-lg leading-[30px] text-primary-10">
      <p>This Cookie Policy explains how Zionra uses cookies and similar technologies when you visit our website or use our platform and mobile services. It should be read alongside our <Link href={routes.web.privacy} className="text-primary-06 hover:underline">Privacy Policy</Link>.</p>
      <p>Where the law requires it, we ask for your consent before setting cookies that are not strictly necessary.</p>
      <p><strong className="font-medium">By using Zionra, you agree to our use of cookies as described in this policy.</strong></p>
    </div>
    <CookieSection number={1} title="What Are Cookies">
      <p>Cookies are small text files that are placed on your device when you visit a website. They help a website work properly, remember your preferences and understand how it is being used.</p>
      <p className="mt-3">We also use similar technologies, such as pixels, local storage and software development kits (SDKs). We refer to all of these as “cookies” in this policy.</p>
      <p className="mt-5 font-medium text-primary-10">Cookies can be:</p>
      <Bullets><li><strong>Session cookies</strong>, which are deleted when you close your browser</li><li><strong>Persistent cookies</strong>, which stay on your device until they expire or you delete them</li><li><strong>First-party cookies</strong>, which are set by Zionra</li><li><strong>Third-party cookies</strong>, which are set by other companies whose services we use</li></Bullets>
    </CookieSection>
    <CookieSection number={2} title="How We Use Cookies">
      <p className="font-medium text-primary-10">We use cookies to:</p>
      <Bullets><li>keep you signed in and your account secure</li><li>remember your preferences and shipment details</li><li>process payments securely and help prevent fraud</li><li>understand how customers use Zionra so we can improve it</li><li>measure how well our communications and marketing work, where you have agreed</li></Bullets>
      <p className="mt-4">How we use personal data collected through cookies is explained in our <Link href={routes.web.privacy} className="text-primary-06 hover:underline">Privacy Policy</Link>.</p>
    </CookieSection>
    <CookieSection number={3} title="Types of Cookies We Use">
      <p>The cookies we use fall into the following categories.</p>
      <div className="mt-5 overflow-hidden rounded-md border border-neutral-02">{[
        { name:"Strictly necessary",status:"Always active",desc:"Essential for Zionra to work. They keep you signed in, protect your account, support secure payments and fraud prevention, and remember your cookie choices. They cannot be switched off in our systems." },
        { name:"Performance and analytics",status:"Optional",desc:"Help us understand how visitors use Zionra, such as which pages are visited and whether errors occur. The information is aggregated and used to improve the platform." },
        { name:"Functionality",status:"Optional",desc:"Remember choices you make, such as your region or saved shipment details, to give you a more personal experience." },
        { name:"Marketing and advertising",status:"Optional",desc:"Used to show you relevant Zionra content and to measure the effectiveness of our campaigns. Some may be set by our advertising partners." },
      ].map((c,i)=><div key={c.name} className={`grid gap-2 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-6 sm:px-6 ${i?"border-t border-neutral-02":""}`}><p className="font-display font-semibold text-primary-10">{c.name}</p><span className={`text-[13px] ${i?"text-neutral-05":"text-primary-06"}`}>{c.status}</span><p className="text-[15px] leading-[25px] sm:col-start-1">{c.desc}</p></div>)}</div>
    </CookieSection>
    <CookieSection number={4} title="Third-Party Cookies">
      <p>Some cookies are set by third parties that provide services on our behalf.</p>
      <p className="mt-5 font-medium text-primary-10">These include:</p>
      <Bullets><li>payment providers, such as Stripe</li><li>analytics providers</li><li>advertising and social media partners</li></Bullets>
      <p className="mt-4">These third parties set their own cookies and are responsible for how they use them. Zionra does not control third-party cookies. Please refer to each provider’s own cookie and privacy policies for details.</p>
    </CookieSection>
    <CookieSection number={5} title="Managing Your Preferences">
      <p>You can choose which optional cookies we use. Strictly necessary cookies are always active. Optional cookies are off unless you turn them on.</p>
      <div className="mt-5 overflow-hidden rounded-md border border-neutral-02">
        <div className="flex items-center justify-between gap-6 p-5 sm:px-6"><div><h3 className="font-display text-[15px] font-semibold text-primary-10">Strictly necessary</h3><p className="mt-0.5 text-sm">Required for sign-in, security and payments</p></div><label className="relative inline-flex shrink-0 cursor-not-allowed opacity-55"><input type="checkbox" checked disabled aria-label="Strictly necessary cookies, always active" className="peer sr-only"/><span className="h-8 w-[52px] rounded-full bg-primary-06"/><span className="absolute left-6 top-1 h-6 w-6 rounded-full bg-white shadow"/></label></div>
        {optionalCategories.map(item=><div key={item.key} className="flex items-center justify-between gap-6 border-t border-neutral-02 p-5 sm:px-6"><div><h3 className="font-display text-[15px] font-semibold text-primary-10">{item.label}</h3><p className="mt-0.5 text-sm">{item.caption}</p></div><label className="relative inline-flex shrink-0 cursor-pointer"><input type="checkbox" aria-label={`${item.label} cookies`} checked={prefs[item.key]} onChange={event=>updateDraftPreferences({...prefs,[item.key]:event.target.checked})} className="peer sr-only"/><span className="h-8 w-[52px] rounded-full bg-neutral-02 transition peer-checked:bg-primary-06 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-06"/><span className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"/></label></div>)}
        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-02 bg-[#F9FAFB] p-4 sm:px-6"><button type="button" onClick={()=>save(prefs,"Your preferences have been saved.")} className="inline-flex min-h-11 items-center rounded-md bg-primary-06 px-5 text-sm text-white hover:bg-primary-07">Save preferences</button><button type="button" onClick={()=>save(empty,"Optional cookies are off.")} className="inline-flex min-h-11 items-center rounded-md border border-primary-06 px-4 text-sm text-primary-06 hover:bg-primary-01">Reject optional</button><span role="status" aria-live="polite" className="w-full text-sm text-[#3E5775] sm:ml-auto sm:w-auto">{status}</span></div>
      </div>
      <p className="mt-5 font-medium text-primary-10">Browser settings</p>
      <p className="mt-2">You can also control cookies through your browser settings. Most browsers let you block or delete cookies, and the steps differ between browsers, so check your browser’s help section. Blocking strictly necessary cookies may stop parts of Zionra, such as signing in or making payments, from working.</p>
      <p className="mt-3">To find out more about cookies, visit <a className="text-primary-06 hover:underline" href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a> or <a className="text-primary-06 hover:underline" href="https://allaboutcookies.org" target="_blank" rel="noopener noreferrer">allaboutcookies.org</a>.</p>
    </CookieSection>
    <CookieSection number={6} title="Changes to This Policy"><p>We may update this Cookie Policy from time to time, for example when the cookies we use change or when the law requires it.</p><p className="mt-3">Updated versions will be posted on our platform.</p></CookieSection>
    <CookieSection number={7} title="Contact Us"><p>If you have any questions about how we use cookies:</p><dl className="mt-3 divide-y divide-neutral-02 border-t border-neutral-02"><div className="flex flex-col py-4 sm:flex-row sm:gap-6"><dt className="w-[120px] shrink-0 text-sm text-neutral-05">Email</dt><dd><a href="mailto:hello@zionra.com" className="text-primary-06 hover:underline">hello@zionra.com</a></dd></div><div className="flex flex-col py-4 sm:flex-row sm:gap-6"><dt className="w-[120px] shrink-0 text-sm text-neutral-05">Website</dt><dd><a href="https://www.zionra.com" className="text-primary-06 hover:underline">www.zionra.com</a></dd></div></dl></CookieSection>
    <p className="mt-16 border-t border-neutral-02 pt-7 font-medium text-primary-10">By using Zionra, you acknowledge that you have read and understood this Cookie Policy.</p>
  </LegalPageShell>;
}
