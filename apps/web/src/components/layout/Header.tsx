"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { routes } from "@/config/routes";

const logoZionra = "/images/logo-zionra.png";

const navItems = [
  { label: "Home", href: routes.web.home },
  { label: "How it works", href: `${routes.web.home}#how-it-works` },
  { label: "Get quote", href: `${routes.web.home}#quote` },
  { label: "About us", href: `${routes.web.home}#about-us` },
  { label: "Support", href: `${routes.web.home}#support` },
] as const;

function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-y border-neutral-03/70 bg-neutral-01/95 px-4 py-3 font-sans backdrop-blur-sm sm:px-6 sm:py-4 lg:px-8 lg:py-5">
      <div className="relative mx-auto w-full max-w-[1320px]">
        <div className="flex h-[64px] items-center rounded-[16px] border border-neutral-03 bg-white px-4 shadow-[0_1px_2px_rgba(7,22,44,0.04)] sm:h-[68px] sm:px-5 xl:h-[72px] xl:pl-6 xl:pr-4">
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
              const active = item.href === routes.web.home && pathname === routes.web.home;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex h-11 items-center px-[14px] text-[14px] font-medium leading-[22px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 focus-visible:ring-offset-2 ${
                    active ? "text-primary-06" : "text-primary-10"
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-[4px] left-[14px] right-[14px] rounded-full transition-all duration-100 ${
                      active
                        ? "h-[1.4px] bg-primary-06"
                        : "h-px bg-transparent group-hover:!bg-primary-06 group-active:h-[1.4px] group-active:!bg-primary-08"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-[10px] xl:flex">
            <Link
              href={routes.web.getStarted}
              className="inline-flex h-10 items-center justify-center rounded-[10px] border-[1.5px] border-primary-06 bg-white px-4 text-[14px] font-bold leading-none text-primary-06 transition-colors hover:border-primary-07 hover:bg-primary-01 active:border-primary-08 active:bg-primary-02 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 focus-visible:ring-offset-2"
            >
              Log In
            </Link>

            <Link
              href={routes.web.partnerApplication}
              className="inline-flex h-10 items-center justify-center rounded-[10px] bg-primary-01 px-4 text-[14px] font-bold leading-none text-primary-08 transition-colors hover:bg-primary-02 active:bg-primary-03 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 focus-visible:ring-offset-2"
            >
              Become a shipping partner
            </Link>
          </div>

          <button
            type="button"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls={mobileMenuId}
            onClick={() => setIsOpen((value) => !value)}
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-primary-10 transition-colors hover:bg-primary-01 active:bg-primary-02 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 focus-visible:ring-offset-2 xl:hidden"
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        <div
          id={mobileMenuId}
          className={`absolute left-0 right-0 top-[72px] origin-top rounded-[16px] border border-neutral-03 bg-white p-4 shadow-[0_18px_40px_rgba(7,22,44,0.12)] transition duration-200 sm:top-[76px] xl:hidden ${
            isOpen
              ? "visible translate-y-0 scale-y-100 opacity-100"
              : "invisible -translate-y-2 scale-y-95 opacity-0 pointer-events-none"
          }`}
        >
          <nav aria-label="Mobile primary navigation" className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = item.href === routes.web.home && pathname === routes.web.home;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`relative flex min-h-11 items-center rounded-[10px] px-3 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 ${
                    active
                      ? "bg-primary-01 text-primary-06"
                      : "text-primary-10 hover:bg-neutral-01 active:bg-primary-01"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 grid gap-3 border-t border-neutral-02 pt-4 sm:grid-cols-2">
            <Link
              href={routes.web.getStarted}
              onClick={() => setIsOpen(false)}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] border-[1.5px] border-primary-06 bg-white px-4 text-[14px] font-bold text-primary-06 transition-colors hover:bg-primary-01 active:bg-primary-02 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35"
            >
              Log In
            </Link>

            <Link
              href={routes.web.partnerApplication}
              onClick={() => setIsOpen(false)}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-primary-01 px-4 text-center text-[14px] font-bold text-primary-08 transition-colors hover:bg-primary-02 active:bg-primary-03 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35"
            >
              Become a shipping partner
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={logoZionra}
        alt=""
        width={27}
        height={31}
        priority
        className="h-[31px] w-[27px] object-contain"
      />

      <span className="font-display text-[22px] font-bold leading-none tracking-[-0.5px] text-primary-06">
        zionra
      </span>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default Header;