"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import { useCustomerAuth, type CustomerAccount } from "@/components/auth/CustomerAuthProvider";
import DateOfBirthField from "@/components/auth/shared/DateOfBirthField";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import { withCustomerReturnTo } from "@/lib/authReturn";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type Address = {
  id: string;
  label: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string | null;
  country: string;
  isDefault: boolean;
};

type ProfileResponse = {
  customer?: CustomerAccount;
  addresses?: Address[];
  totalShipments?: number;
  message?: string;
};

type ProfileForm = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  phoneCountryCode: string;
  phoneNumber: string;
  countryOfResidence: string;
};

type AddressForm = Omit<Address, "id">;

const EMPTY_ADDRESS: AddressForm = {
  label: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  isDefault: false,
};

function isoDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function initials(customer: CustomerAccount | null) {
  if (!customer) return "ZR";
  return `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase() || "ZR";
}

export default function CustomerProfilePage() {
  const router = useRouter();
  const { customer, status, refreshCustomer } = useCustomerAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [totalShipments, setTotalShipments] = useState(0);
  const [form, setForm] = useState<ProfileForm | null>(null);
  const [initialForm, setInitialForm] = useState<ProfileForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [activeSection, setActiveSection] = useState<"personal" | "addresses">("personal");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [addressEditor, setAddressEditor] = useState<{ id?: string; values: AddressForm } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(withCustomerReturnTo(routes.web.customerLogin, routes.web.customerProfile));
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const controller = new AbortController();

    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(buildApiUrl(routes.api.customerAuth.profile), {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json().catch(() => ({}))) as ProfileResponse;
        if (!response.ok || !result.customer) throw new Error(result.message ?? "Unable to load your profile.");

        const values: ProfileForm = {
          firstName: result.customer.firstName,
          lastName: result.customer.lastName,
          dateOfBirth: isoDate(result.customer.dateOfBirth),
          nationality: result.customer.nationality ?? "",
          phoneCountryCode: result.customer.phoneCountryCode,
          phoneNumber: result.customer.phoneNumber,
          countryOfResidence: result.customer.countryOfResidence,
        };
        setForm(values);
        setInitialForm(values);
        setAddresses(result.addresses ?? []);
        setTotalShipments(result.totalShipments ?? 0);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "Unable to load your profile.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, [status]);

  const dirty = useMemo(
    () => Boolean(form && initialForm && JSON.stringify(form) !== JSON.stringify(initialForm)),
    [form, initialForm],
  );

  function updateForm<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setMessage("");
    setError("");
  }

  async function saveProfile() {
    if (!form || saving) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(buildApiUrl(routes.api.customerAuth.profile), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string> };
      if (!response.ok) throw new Error(result.errors ? Object.values(result.errors)[0] : result.message ?? "Unable to update profile.");

      setInitialForm(form);
      setEditingPhone(false);
      setMessage(result.message ?? "Profile updated successfully.");
      await refreshCustomer();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function shareProfile() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("Profile link copied.");
    } catch {
      setMessage("Profile ready to share.");
    }
  }

  function scrollToSection(section: "personal" | "addresses") {
    setActiveSection(section);
    const id = section === "personal" ? "personal-details" : "saved-addresses";
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];

  if (status === "loading" || loading || !form || !customer) {
    return (
      <main className="min-h-screen bg-neutral-01">
        <Header />
        <div className="grid min-h-[60vh] place-items-center text-primary-06"><LoadingSpinner /></div>
      </main>
    );
  }

  const profileLocation = defaultAddress
    ? [defaultAddress.city, defaultAddress.country].filter(Boolean).join(", ")
    : customer.countryOfResidence;

  return (
    <main className="min-h-screen bg-neutral-01 text-primary-10">
      <Header />

      <section className="bg-neutral-01">
        <div className="mx-auto flex w-full max-w-[1276px] flex-col gap-5 px-5 pb-6 pt-8 sm:px-8 lg:flex-row lg:items-center lg:px-0 lg:pb-6 lg:pt-9">
          <div className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full border-4 border-white bg-primary-06 font-display text-2xl font-semibold text-white">
            {initials(customer)}
          </div>
          <div className="min-w-0 lg:ml-0">
            <h1 className="truncate font-display text-2xl font-semibold tracking-[-0.4px] text-primary-10">{customer.firstName} {customer.lastName}</h1>
            <p className="mt-1 truncate text-sm text-neutral-07">{customer.email} <span className="px-1">·</span> {profileLocation}</p>
          </div>
          <button type="button" onClick={shareProfile} className="zion-btn zion-btn-md zion-btn-outline-blue lg:ml-auto">Share profile</button>
        </div>
      </section>

      <div className="h-px bg-neutral-02" />

      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-[1276px] px-5 py-8 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-0 lg:py-10">
        <aside className="mb-8 flex flex-col gap-4 lg:mb-0 lg:pr-12">
          <div>
            <p className="font-display text-[32px] font-semibold leading-[44px] text-primary-10">{totalShipments}</p>
            <p className="mt-0.5 text-sm text-neutral-05">Total shipments</p>
          </div>
          <div className="h-px bg-neutral-02" />
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            <button
              type="button"
              onClick={() => scrollToSection("personal")}
              className={`flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-left text-base transition-colors ${
                activeSection === "personal"
                  ? "border-[1.8px] border-primary-06 bg-primary-01 text-primary-10"
                  : "text-neutral-07 hover:bg-neutral-01"
              }`}
            >
              <UserIcon />Personal details
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("addresses")}
              className={`flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-left text-base transition-colors ${
                activeSection === "addresses"
                  ? "border-[1.8px] border-primary-06 bg-primary-01 text-primary-10"
                  : "text-neutral-07 hover:bg-neutral-01"
              }`}
            >
              <PinIcon />Saved addresses
            </button>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col gap-10">
          <section id="personal-details" className="scroll-mt-28 space-y-5">
            <h2 className="font-display text-base font-bold leading-9">Personal details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileInput label="First name" required value={form.firstName} onChange={(value) => updateForm("firstName", value)} />
              <ProfileInput label="Last name" required value={form.lastName} onChange={(value) => updateForm("lastName", value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <DateOfBirthField value={form.dateOfBirth} onChange={(value) => updateForm("dateOfBirth", value)} label="Date of birth" />
              <ProfileInput label="Country of residence" value={form.countryOfResidence} onChange={(value) => updateForm("countryOfResidence", value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileInput label="Email address" value={customer.email} readOnly />
              <div>
                <label className="mb-2 block text-sm">Phone number<span className="text-error-bright"> *</span></label>
                {editingPhone ? (
                  <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-2">
                    <input
                      aria-label="Phone country code"
                      value={form.phoneCountryCode}
                      onChange={(event) => updateForm("phoneCountryCode", event.target.value)}
                      className="h-12 rounded-[10px] border-2 border-primary-04 bg-white px-3 text-sm outline-none"
                    />
                    <input
                      aria-label="Phone number"
                      value={form.phoneNumber}
                      onChange={(event) => updateForm("phoneNumber", event.target.value)}
                      className="h-12 min-w-0 rounded-[10px] border-2 border-primary-04 bg-white px-3 text-sm outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 items-center gap-2 rounded-[10px] border-2 border-primary-04 bg-white px-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-01 text-[14px] leading-none">{phoneFlag(form.phoneCountryCode)}</span>
                    <span className="min-w-0 flex-1 truncate text-sm">{form.phoneCountryCode} {form.phoneNumber}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-end">
                  <button type="button" onClick={() => setEditingPhone((value) => !value)} className="zion-btn zion-btn-sm border border-neutral-03 bg-white text-primary-10 hover:bg-neutral-01">{editingPhone ? "Done" : "Edit Phone number"}</button>
                </div>
              </div>
            </div>

            {dirty ? (
              <div className="flex justify-end">
                <button type="button" disabled={saving} onClick={saveProfile} className="zion-btn zion-btn-md zion-btn-blue min-w-[150px] disabled:opacity-60">{saving ? <><LoadingSpinner /> Saving…</> : "Save changes"}</button>
              </div>
            ) : null}
            {message ? <p className="text-sm text-success">{message}</p> : null}
            {error ? <p className="text-sm text-error-bright">{error}</p> : null}
          </section>

          <div className="h-px bg-neutral-02" />

          <section id="saved-addresses" className="scroll-mt-28 space-y-5">
            <h2 className="font-display text-base font-bold leading-9">Saved addresses</h2>

            <div className="flex flex-col gap-2.5">
              {addresses.length ? addresses.map((address) => (
                <div key={address.id} className={`flex items-start gap-3.5 rounded-xl p-4 ${address.isDefault ? "border-2 border-primary-06 bg-[#F7FAFF]" : "bg-neutral-01"}`}>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] ${address.isDefault ? "bg-primary-06 text-white" : "bg-neutral-02 text-neutral-06"}`}><HomeIcon /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 font-display text-sm font-bold">
                      <span>{address.label}{address.city ? ` — ${address.city}` : ""}</span>
                      {address.isDefault ? <span className="rounded-full bg-primary-01 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[1.4px] text-primary-06">Default</span> : null}
                    </div>
                    <p className="mt-1 text-sm leading-[22px] text-neutral-07">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}<br />{address.postcode ? `${address.postcode}, ` : ""}{address.country}</p>
                  </div>
                  <button type="button" onClick={() => setAddressEditor({ id: address.id, values: { ...address, addressLine2: address.addressLine2 ?? "", postcode: address.postcode ?? "" } })} className="zion-btn zion-btn-sm border border-neutral-03 bg-white text-primary-10 hover:bg-neutral-01 shrink-0">Edit</button>
                </div>
              )) : (
                <div className="rounded-xl bg-neutral-01 px-5 py-8 text-center">
                  <p className="font-display text-sm font-semibold text-primary-10">No saved addresses yet</p>
                  <p className="mt-1 text-sm text-neutral-06">Save an address here for faster shipment details later.</p>
                  <button type="button" onClick={() => setAddressEditor({ values: EMPTY_ADDRESS })} className="zion-btn zion-btn-sm zion-btn-outline-blue mt-4">Add address</button>
                </div>
              )}
            </div>
          </section>
        </div>
        </div>
      </section>

      {addressEditor ? (
        <AddressModal
          editor={addressEditor}
          onClose={() => setAddressEditor(null)}
          onSaved={(address) => {
            setAddresses((current) => {
              const next = addressEditor.id ? current.map((item) => item.id === address.id ? address : item) : [...current, address];
              return next.map((item) => item.id === address.id ? address : address.isDefault ? { ...item, isDefault: false } : item).sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
            });
            setAddressEditor(null);
          }}
          onDeleted={addressEditor.id ? (id) => {
            setAddresses((current) => current.filter((item) => item.id !== id));
            setAddressEditor(null);
          } : undefined}
        />
      ) : null}
    </main>
  );
}

function ProfileInput({ label, value, onChange, readOnly = false, placeholder = "", required = false }: { label: string; value: string; onChange?: (value: string) => void; readOnly?: boolean; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-primary-10">{label}{required ? <span className="text-error-bright"> *</span> : null}</span>
      <input value={value} readOnly={readOnly} placeholder={placeholder} onChange={(event) => onChange?.(event.target.value)} className={`h-12 w-full rounded-[10px] border-2 border-neutral-03 bg-white px-3 text-sm text-primary-10 outline-none transition-colors ${readOnly ? "cursor-default" : "focus:border-primary-04"}`} />
    </label>
  );
}

function AddressModal({ editor, onClose, onSaved, onDeleted }: { editor: { id?: string; values: AddressForm }; onClose: () => void; onSaved: (address: Address) => void; onDeleted?: (id: string) => void }) {
  const [values, setValues] = useState(editor.values);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      const endpoint = editor.id ? `${routes.api.customerAuth.profileAddresses}/${editor.id}` : routes.api.customerAuth.profileAddresses;
      const response = await fetch(buildApiUrl(endpoint), { method: editor.id ? "PATCH" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = (await response.json().catch(() => ({}))) as { message?: string; address?: Address; errors?: Record<string, string> };
      if (!response.ok || !result.address) throw new Error(result.errors ? Object.values(result.errors)[0] : result.message ?? "Unable to save address.");
      onSaved(result.address);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save address."); }
    finally { setSaving(false); }
  }

  async function remove() {
    if (!editor.id || !onDeleted || saving) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(buildApiUrl(`${routes.api.customerAuth.profileAddresses}/${editor.id}`), { method: "DELETE", credentials: "include" });
      const result = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Unable to remove address.");
      onDeleted(editor.id);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to remove address."); setSaving(false); }
  }

  function change<K extends keyof AddressForm>(key: K, value: AddressForm[K]) { setValues((current) => ({ ...current, [key]: value })); }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-primary-10/50 p-4" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-[20px] bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-center justify-between gap-4"><h2 className="font-display text-xl font-semibold">{editor.id ? "Edit address" : "Add address"}</h2><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-neutral-01">×</button></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ProfileInput label="Label" required value={values.label} placeholder="Home" onChange={(v) => change("label", v)} />
          <ProfileInput label="City" required value={values.city} placeholder="Croydon" onChange={(v) => change("city", v)} />
          <div className="sm:col-span-2"><ProfileInput label="Address line 1" required value={values.addressLine1} placeholder="3 Fell Road" onChange={(v) => change("addressLine1", v)} /></div>
          <div className="sm:col-span-2"><ProfileInput label="Address line 2" value={values.addressLine2 ?? ""} placeholder="Apartment, suite, etc. (optional)" onChange={(v) => change("addressLine2", v)} /></div>
          <ProfileInput label="Postcode" value={values.postcode ?? ""} placeholder="CR0 1AT" onChange={(v) => change("postcode", v)} />
          <ProfileInput label="Country" required value={values.country} onChange={(v) => change("country", v)} />
        </div>
        <label className="mt-5 flex items-center gap-3 text-sm"><input type="checkbox" checked={values.isDefault} onChange={(e) => change("isDefault", e.target.checked)} className="h-4 w-4 accent-[#286BDC]" />Set as default address</label>
        {error ? <p className="mt-4 text-sm text-error-bright">{error}</p> : null}
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          {editor.id ? <button type="button" onClick={remove} disabled={saving} className="zion-btn zion-btn-md border border-neutral-03 bg-white text-primary-10 hover:bg-neutral-01 text-error-bright">Delete</button> : <span />}
          <div className="ml-auto flex gap-3"><button type="button" onClick={onClose} className="zion-btn zion-btn-md border border-neutral-03 bg-white text-primary-10 hover:bg-neutral-01">Cancel</button><button type="submit" disabled={saving} className="zion-btn zion-btn-md zion-btn-blue min-w-[120px] disabled:opacity-60">{saving ? "Saving…" : "Save"}</button></div>
        </div>
      </form>
    </div>
  );
}

function phoneFlag(countryCode: string) {
  const normalized = countryCode.replace(/\s+/g, "");
  if (normalized === "+44") return "🇬🇧";
  if (normalized === "+234") return "🇳🇬";
  if (normalized === "+1") return "🇺🇸";
  if (normalized === "+33") return "🇫🇷";
  if (normalized === "+49") return "🇩🇪";
  return "🌐";
}

function UserIcon() { return <Icon><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3 3.6-5 8-5s8 2 8 5"/></Icon>; }
function PinIcon() { return <Icon><path d="M12 22s7-7.8 7-13a7 7 0 1 0-14 0c0 5.2 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></Icon>; }
function HomeIcon() { return <Icon><path d="M3 11 12 3l9 8v9H3v-9Z"/><path d="M9 20v-6h6v6"/></Icon>; }
function Icon({ children }: { children: React.ReactNode }) { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>; }
