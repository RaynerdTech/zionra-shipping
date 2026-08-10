"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { routes } from "@/config/routes";

const logoZionra = "/images/logo-zionra.png";

const navItems = [
  { label: "Home", href: routes.web.home },
  { label: "How it works", href: routes.web.howItWorks },
  { label: "Get quote", href: `${routes.web.home}#get-quote` },
  { label: "About us", href: routes.web.aboutUs },
  { label: "Support", href: `${routes.web.home}#support` },
] as const;

function Header() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const mobileMenuId = useId();

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsHeaderVisible(true);
    }
  }, [isOpen]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function updateHeader() {
      const currentScrollY = Math.max(window.scrollY, 0);
      const previousScrollY = lastScrollY.current;
      const difference = currentScrollY - previousScrollY;

      /*
       * Always keep the header visible near the top.
       */
      if (currentScrollY <= 12) {
        setIsHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      /*
       * Require enough movement before changing state.
       * This prevents tiny trackpad/momentum movements
       * from making the header flicker.
       */
      if (Math.abs(difference) >= 8) {
        if (difference > 0) {
          /*
           * Scrolling down:
           * hide the header unless the mobile menu is open.
           */
          if (!isOpen) {
            setIsHeaderVisible(false);
          }
        } else {
          /*
           * Scrolling up:
           * reveal the header immediately.
           */
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

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  return (
    <header
      className={`sticky top-0 z-50 bg-neutral-01 transition-transform duration-[260ms] ease-[cubic-bezier(.22,.61,.36,1)] will-change-transform motion-reduce:transition-none ${
        isHeaderVisible || isOpen
          ? "translate-y-0"
          : "-translate-y-full"
      }`}
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

          <nav
            aria-label="Primary navigation"
            className="ml-[56px] hidden items-center gap-1 xl:flex 2xl:ml-[64px]"
          >
            {navItems.map((item) => {
              const isHome = item.href === routes.web.home;
              const isHowItWorks =
                item.href === routes.web.howItWorks;
              const isAboutUs =
                item.href === routes.web.aboutUs;

              const active =
                (isHome && pathname === routes.web.home) ||
                (isHowItWorks &&
                  pathname === routes.web.howItWorks) ||
                (isAboutUs &&
                  pathname === routes.web.aboutUs);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex h-11 items-center px-[14px] text-[14px] font-medium leading-[22px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-06/35 focus-visible:ring-offset-2 ${
                    active
                      ? "text-primary-06"
                      : "text-primary-10"
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
            aria-label={
              isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
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
          className={`absolute left-4 right-4 top-[84px] origin-top rounded-[16px] border border-neutral-03 bg-white p-4 shadow-[0_18px_40px_rgba(7,22,44,0.12)] transition duration-200 sm:left-6 sm:right-6 xl:hidden ${
            isOpen
              ? "visible translate-y-0 scale-y-100 opacity-100"
              : "pointer-events-none invisible -translate-y-2 scale-y-95 opacity-0"
          }`}
        >
          <nav
            aria-label="Mobile primary navigation"
            className="flex flex-col gap-1"
          >
            {navItems.map((item) => {
              const isHome = item.href === routes.web.home;
              const isHowItWorks =
                item.href === routes.web.howItWorks;
              const isAboutUs =
                item.href === routes.web.aboutUs;

              const active =
                (isHome && pathname === routes.web.home) ||
                (isHowItWorks &&
                  pathname === routes.web.howItWorks) ||
                (isAboutUs &&
                  pathname === routes.web.aboutUs);

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
        width={26}
        height={26}
        priority
        className="h-[26px] w-[26px] object-contain"
      />

      <span className="font-display text-[22px] font-bold leading-none tracking-[-0.5px] text-primary-06">
        zionra
      </span>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export default Header;