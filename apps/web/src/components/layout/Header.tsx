"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { routes } from "@/config/routes";

const logoZionra = "/images/logo-zionra.png";

const navItems = [
  { label: "Home", href: routes.web.home, icon: HomeIcon },
  { label: "How it works", href: routes.web.howItWorks, icon: NetworkIcon },
  { label: "Get quote", href: routes.web.quote, icon: CalculatorIcon },
  { label: "About us", href: routes.web.aboutUs, icon: AboutIcon },
  { label: "Support", href: `${routes.web.home}#support`, icon: SupportIcon },
] as const;

const accountItems = [
  {
    label: "Profile",
    description: "View and edit your profile",
    href: `${routes.web.customerDashboard}#profile`,
    icon: ProfileIcon,
  },
  {
    label: "Overview",
    description: "Your dashboard at a glance",
    href: routes.web.customerDashboard,
    icon: OverviewIcon,
  },
  {
    label: "Account settings",
    description: "Manage your account",
    href: `${routes.web.customerDashboard}#account-settings`,
    icon: SettingsIcon,
  },
  {
    label: "My shipments",
    description: "Track and manage shipments",
    href: `${routes.web.customerDashboard}#shipments`,
    icon: ShipmentIcon,
  },
  {
    label: "Payment & billing",
    description: "Cards, invoices and history",
    href: `${routes.web.customerDashboard}#billing`,
    icon: BillingIcon,
  },
] as const;

function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, status, signOut } = useCustomerAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const mobileMenuId = useId();
  const profileMenuId = useId();
  const profileRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const authenticated = status === "authenticated" && Boolean(customer);
  const fullName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : "";
  const initials = customer
    ? `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase() || "ZR"
    : "ZR";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsProfileOpen(false);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen || isProfileOpen) setIsHeaderVisible(true);
  }, [isOpen, isProfileOpen]);

  useEffect(() => {
    if (!authenticated || !isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [authenticated, isOpen]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function updateHeader() {
      const currentScrollY = Math.max(window.scrollY, 0);
      const previousScrollY = lastScrollY.current;
      const difference = currentScrollY - previousScrollY;

      if (currentScrollY <= 12) {
        setIsHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      if (Math.abs(difference) >= 8) {
        if (difference > 0) {
          if (!isOpen && !isProfileOpen) setIsHeaderVisible(false);
        } else {
          setIsHeaderVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }

      ticking.current = false;
    }

    function handleScroll() {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(updateHeader);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen, isProfileOpen]);

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await signOut();
      setIsOpen(false);
      setIsProfileOpen(false);
      router.replace(routes.web.home);
      router.refresh();
    } catch (error) {
      console.error("Customer sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-[transform,background-color] duration-[260ms] ease-[cubic-bezier(.22,.61,.36,1)] will-change-transform motion-reduce:transition-none ${
        authenticated && isOpen ? "bg-[#171717] xl:bg-neutral-01" : "bg-neutral-01"
      } ${isHeaderVisible || isOpen || isProfileOpen ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="relative mx-auto w-full max-w-[1276px] px-4 py-[15px] sm:px-6 xl:px-0">
        <div className="relative flex h-[64px] items-center rounded-[40px] bg-white px-5 shadow-[0_1px_2px_rgba(7,22,44,0.04)] sm:px-6 xl:px-10">
          <Link
            href={routes.web.home}
            aria-label="Zionra home"
            onClick={() => setIsOpen(false)}
            className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 focus-visible:ring-offset-2"
          >
            <Logo />
          </Link>

          <nav aria-label="Primary navigation" className="ml-[56px] hidden items-center gap-1 xl:flex 2xl:ml-[64px]">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex h-11 items-center px-[14px] text-[14px] font-medium leading-[22px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 focus-visible:ring-offset-2 ${active ? "text-primary-06" : "text-primary-10"}`}
                >
                  {item.label}
                  <span aria-hidden="true" className={`absolute bottom-[4px] left-[14px] right-[14px] rounded-full transition-all duration-100 ${active ? "h-[1.4px] bg-primary-06" : "h-px bg-transparent group-hover:!bg-primary-06 group-active:h-[1.4px] group-active:!bg-primary-08"}`} />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center xl:flex">
            {status === "loading" ? (
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="h-10 w-10 animate-pulse rounded-full bg-neutral-02" />
                <span className="h-4 w-4 animate-pulse rounded bg-neutral-02" />
              </div>
            ) : authenticated && customer ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  aria-expanded={isProfileOpen}
                  aria-controls={profileMenuId}
                  aria-label="Open account menu"
                  onClick={() => setIsProfileOpen((value) => !value)}
                  className="flex items-center gap-3 rounded-full px-1 py-1 text-primary-10 transition-colors hover:bg-primary-01 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-06 font-display text-[14px] font-semibold text-white">{initials}</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                <div
                  id={profileMenuId}
                  className={`absolute right-0 top-[56px] w-[326px] overflow-hidden rounded-[14px] border border-neutral-03 bg-white shadow-[0_18px_50px_rgba(7,22,44,0.18)] transition duration-150 ${isProfileOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0"}`}
                >
                  <div className="flex items-center gap-3 border-b border-neutral-02 px-4 py-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-06 font-display text-[14px] font-semibold text-white">{initials}</span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-[14px] font-semibold text-primary-10">{fullName}</p>
                      <p className="mt-0.5 truncate text-[12px] text-neutral-06">{customer.email}</p>
                    </div>
                  </div>

                  <div className="px-4 py-1">
                    {accountItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={`group flex items-center gap-3 border-b border-neutral-02 px-2 py-3.5 no-underline last:border-b-0 ${index === 0 ? "-mx-4 bg-primary-01 px-6 text-primary-06" : "text-primary-10"}`}
                        >
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border ${index === 0 ? "border-primary-03 bg-primary-01 text-primary-08" : "border-transparent bg-neutral-01 text-primary-10"}`}>
                            <Icon />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-[14px] font-semibold leading-5">{item.label}</span>
                            <span className="mt-0.5 block text-[12px] leading-[18px] text-neutral-06">{item.description}</span>
                          </span>
                          <span className="text-neutral-04 transition-transform group-hover:translate-x-0.5">›</span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t border-neutral-02 px-4 py-3">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex min-h-11 w-full items-center gap-3 rounded-[10px] px-2 text-left text-[14px] font-semibold text-error-bright transition-colors hover:bg-[#FFF1F0] disabled:cursor-wait disabled:opacity-60"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-[#FFF1F0]"><SignOutIcon /></span>
                      {isSigningOut ? "Signing out…" : "Sign out"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-[10px]">
                <Link href={routes.web.getStarted} className="inline-flex h-10 items-center justify-center rounded-[10px] border-[1.5px] border-primary-06 bg-white px-4 text-[14px] font-bold leading-none text-primary-06 transition-colors hover:border-primary-07 hover:bg-primary-01 active:border-primary-08 active:bg-primary-02 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 focus-visible:ring-offset-2">Log In</Link>
                <Link href={routes.web.partnerApplication} className="inline-flex h-10 items-center justify-center rounded-[10px] bg-primary-01 px-4 text-[14px] font-bold leading-none text-primary-08 transition-colors hover:bg-primary-02 active:bg-primary-03 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 focus-visible:ring-offset-2">Become a shipping partner</Link>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls={mobileMenuId}
            onClick={() => setIsOpen((value) => !value)}
            className={`ml-auto inline-flex h-11 w-11 items-center justify-center rounded-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 focus-visible:ring-offset-2 xl:hidden ${authenticated && isOpen ? "text-primary-06" : "text-primary-10 hover:bg-primary-01 active:bg-primary-02"}`}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {authenticated && isOpen ? (
          <div aria-hidden="true" className="absolute left-1/2 top-[79px] h-[calc(100dvh-79px)] w-screen -translate-x-1/2 bg-[#171717] xl:hidden" />
        ) : null}

        {authenticated && customer ? (
          <div
            id={mobileMenuId}
            className={`absolute left-4 right-4 top-[84px] z-[60] h-[calc(100dvh-84px)] origin-top overflow-y-auto rounded-t-[34px] bg-white px-5 pb-8 pt-7 shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition duration-200 sm:left-6 sm:right-6 xl:hidden ${isOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-3 opacity-0"}`}
          >
            <Link href={routes.web.customerDashboard} onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-[14px] px-2 py-3 no-underline">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-06 font-display text-[13px] font-semibold text-white">{initials}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[14px] font-semibold text-primary-10">{fullName}</span>
                <span className="mt-0.5 block truncate text-[12px] text-neutral-06">{customer.email}</span>
              </span>
              <ChevronDownIcon className="h-5 w-5 text-primary-10" />
            </Link>

            <nav aria-label="Mobile primary navigation" className="mt-4 flex flex-col">
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setIsOpen(false)}
                    className={`flex min-h-[58px] items-center gap-3 rounded-[12px] px-3 text-[16px] font-medium no-underline transition-colors ${active ? "bg-primary-01 text-primary-06" : "text-primary-10 hover:bg-neutral-01"}`}
                  >
                    <span className="grid h-8 w-8 place-items-center"><Icon /></span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-neutral-04 pt-5">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[8px] border border-error-bright bg-white px-4 text-[14px] font-medium text-error-bright transition-colors hover:bg-[#FFF1F0] disabled:cursor-wait disabled:opacity-60"
              >
                {isSigningOut ? "Signing out…" : "Sign out"}
              </button>
              <Link href={routes.web.partnerApplication} onClick={() => setIsOpen(false)} className="mt-5 flex min-h-11 items-center justify-center text-center text-[13px] font-medium text-primary-06 no-underline">Become a shipping partner</Link>
            </div>
          </div>
        ) : (
          <div
            id={mobileMenuId}
            className={`absolute left-4 right-4 top-[84px] origin-top rounded-[16px] border border-neutral-03 bg-white p-4 shadow-[0_18px_40px_rgba(7,22,44,0.12)] transition duration-200 sm:left-6 sm:right-6 xl:hidden ${isOpen ? "visible translate-y-0 scale-y-100 opacity-100" : "pointer-events-none invisible -translate-y-2 scale-y-95 opacity-0"}`}
          >
            <nav aria-label="Mobile primary navigation" className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setIsOpen(false)} className={`relative flex min-h-11 items-center rounded-[10px] px-3 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 ${active ? "bg-primary-01 text-primary-06" : "text-primary-10 hover:bg-neutral-01 active:bg-primary-01"}`}>{item.label}</Link>
                );
              })}
            </nav>

            <div className="mt-4 grid gap-3 border-t border-neutral-02 pt-4 sm:grid-cols-2">
              <Link href={routes.web.getStarted} onClick={() => setIsOpen(false)} className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] border-[1.5px] border-primary-06 bg-white px-4 text-[14px] font-bold text-primary-06 transition-colors hover:bg-primary-01 active:bg-primary-02 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35">Log In</Link>
              <Link href={routes.web.partnerApplication} onClick={() => setIsOpen(false)} className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-primary-01 px-4 text-center text-[14px] font-bold text-primary-08 transition-colors hover:bg-primary-02 active:bg-primary-03 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35">Become a shipping partner</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function isNavActive(pathname: string, href: string) {
  if (href === routes.web.home) return pathname === routes.web.home;
  if (href === routes.web.howItWorks) return pathname === routes.web.howItWorks;
  if (href === routes.web.aboutUs) return pathname === routes.web.aboutUs;
  if (href === routes.web.quote) return pathname.startsWith(routes.web.quote);
  return false;
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image src={logoZionra} alt="" width={26} height={26} priority className="h-[26px] w-[26px] object-contain" />
      <span className="font-display text-[22px] font-bold leading-none tracking-[-0.5px] text-primary-06">zionra</span>
    </div>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className={className} fill="none"><path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MenuIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></svg>;
}

function CloseIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12" /><path d="M18 6 6 18" /></svg>;
}

function BaseLineIcon({ children }: { children: ReactNode }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

function HomeIcon() { return <BaseLineIcon><path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" /></BaseLineIcon>; }
function NetworkIcon() { return <BaseLineIcon><circle cx="6" cy="7" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="17" cy="18" r="2" /><circle cx="6" cy="17" r="2" /><path d="m8 7 8-1M7 9l-1 6m2 2 7 1m2-10v8" /></BaseLineIcon>; }
function CalculatorIcon() { return <BaseLineIcon><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M8 7h8M8 11h1m3 0h1m3 0h1M8 15h1m3 0h1m3 0h1M8 18h1m3 0h1m3 0h1" /></BaseLineIcon>; }
function AboutIcon() { return <BaseLineIcon><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M9 8h6M9 12h6M9 16h4" /></BaseLineIcon>; }
function SupportIcon() { return <BaseLineIcon><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><path d="M4 13a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2zm16 0a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2z" /></BaseLineIcon>; }
function ProfileIcon() { return <BaseLineIcon><circle cx="12" cy="8" r="3" /><path d="M6.5 19c.8-3 2.6-4.5 5.5-4.5s4.7 1.5 5.5 4.5" /></BaseLineIcon>; }
function OverviewIcon() { return <BaseLineIcon><path d="M6 18V9m4 9V5m4 13v-7m4 7V8" /></BaseLineIcon>; }
function SettingsIcon() { return <BaseLineIcon><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 3.1h5l.3-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z" /></BaseLineIcon>; }
function ShipmentIcon() { return <BaseLineIcon><path d="m5 7 7-4 7 4v10l-7 4-7-4z" /><path d="m5 7 7 4 7-4m-7 4v10" /></BaseLineIcon>; }
function BillingIcon() { return <BaseLineIcon><path d="M5 7.5 11 4l8 8-6 6-8-8z" /><path d="m8 13 4 4m-1-9 4 4" /></BaseLineIcon>; }
function SignOutIcon() { return <BaseLineIcon><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M14 8l4 4-4 4m4-4H9" /></BaseLineIcon>; }

export default Header;
