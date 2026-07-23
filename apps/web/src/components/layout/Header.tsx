"use client";

import { useState } from "react";

const logoZionra = "/images/logo-zionra.png";

const navItems = ["Home", "How It Works", "Get quote", "About Us", "Support"];

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-03 bg-white font-sans">
      <div className="mx-auto flex h-[64px] w-full max-w-[1440px] items-center px-[18px] sm:px-8 lg:px-[28px]">
        <a href="#" className="flex shrink-0 items-center">
          <Logo />
        </a>

        <nav className="ml-[56px] hidden items-center justify-start gap-[31px] md:flex lg:ml-[72px]">
          {navItems.map((item) => {
            const active = item === "Home";

            return (
              <a
                key={item}
                href="#"
                className={`relative pb-[5px] text-[15px] font-medium leading-none transition-colors ${
                  active
                    ? "text-primary-06"
                    : "text-neutral-08 hover:text-primary-06"
                }`}
              >
                {item}

                {active && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-primary-06" />
                )}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-[10px] md:flex">
          <a href="/get-started" className="zion-btn zion-btn-sm zion-btn-outline-blue">
            Log In
          </a>

          <a href="#" className="zion-btn zion-btn-sm zion-btn-orange">
            Become an Agent
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-md text-primary-10 md:hidden"
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-[64px] z-40 w-full border-b border-neutral-03 bg-white px-[18px] pb-5 pt-2 shadow-[0_18px_40px_rgba(7,22,44,0.08)] md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = item === "Home";

              return (
                <a
                  key={item}
                  href="#"
                  onClick={() => setIsOpen(false)}
                  className={`flex h-[44px] items-center text-[15px] font-medium ${
                    active ? "text-primary-06" : "text-primary-10"
                  }`}
                >
                  {item}
                </a>
              );
            })}
          </nav>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <a
              href="/get-started"
              onClick={() => setIsOpen(false)}
              className="zion-btn zion-btn-sm zion-btn-outline-blue w-full"
            >
              Log In
            </a>

            <a
              href="#"
              onClick={() => setIsOpen(false)}
              className="zion-btn zion-btn-sm zion-btn-orange w-full"
            >
              Become an Agent
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-[4px]">
      <img
        src={logoZionra}
        alt="Zionra logo mark"
        className="h-[27.337px] w-[22.913px]"
      />

      <span className="font-sans text-[20px] font-extrabold leading-none tracking-[-0.5px] text-primary-10">
        zionra
      </span>
    </div>
  );
}

export default Header;