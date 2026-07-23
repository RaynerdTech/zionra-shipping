/**
 * Responsibility:
 * Renders the responsive Zionra customer/partner account selector.
 * It preserves the existing mobile interaction while providing the approved
 * desktop role-selection card and role-specific actions.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import NavigationButtonContent from "../ui/NavigationButtonContent";

type AccountType = "customer" | "partner";

const ROUTES = {
  home: "/",
  customerLogin: "/login",
  customerCreateAccount: "/create-account",
  partnerLogin: "/partner/login",
  partnerApplication: "/partner/apply",
  learnDifference: "/learn-the-difference",
} as const;

function BackArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6 shrink-0"
    >
      <path
        d="M19 12H5M11 18L5 12L11 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RightArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-[15px] w-[15px] shrink-0"
    >
      <path
        d="M5 12H19M13 6L19 12L13 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 22C11.1818 22 10.4002 21.6698 8.83693 21.0095C4.94564 19.3657 3 18.5438 3 17.1613C3 16.7742 3 10.0645 3 7M12 22C12.8182 22 13.5998 21.6698 15.1631 21.0095C19.0544 19.3657 21 18.5438 21 17.1613V7M12 22V11.3548"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8.32592 9.69138L5.40472 8.27785C3.80157 7.5021 3 7.11423 3 6.5C3 5.88577 3.80157 5.4979 5.40472 4.72215L8.32592 3.30862C10.1288 2.43621 11.0303 2 12 2C12.9697 2 13.8712 2.4362 15.6741 3.30862L18.5953 4.72215C20.1984 5.4979 21 5.88577 21 6.5C21 7.11423 20.1984 7.5021 18.5953 8.27785L15.6741 9.69138C13.8712 10.5638 12.9697 11 12 11C11.0303 11 10.1288 10.5638 8.32592 9.69138Z"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6 12L8 13"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M17 4L7 9"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShippingPartnerIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M17 20C18.1046 20 19 19.1046 19 18C19 16.8954 18.1046 16 17 16C15.8954 16 15 16.8954 15 18C15 19.1046 15.8954 20 17 20Z"
        stroke="#141B34"
        strokeWidth="1.5"
      />

      <path
        d="M7 20C8.10457 20 9 19.1046 9 18C9 16.8954 8.10457 16 7 16C5.89543 16 5 16.8954 5 18C5 19.1046 5.89543 20 7 20Z"
        stroke="#141B34"
        strokeWidth="1.5"
      />

      <path
        d="M11 17H15M13.5 7H14.4429C15.7533 7 16.4086 7 16.9641 7.31452C17.5196 7.62904 17.89 8.20972 18.6308 9.37107C19.1502 10.1854 19.6955 10.7765 20.4622 11.3024C21.2341 11.8318 21.6012 12.0906 21.8049 12.506C22 12.9038 22 13.375 22 14.3173C22 15.5596 22 16.1808 21.651 16.5755C21.636 16.5925 21.6207 16.609 21.6049 16.625C21.2375 17 20.6594 17 19.503 17H19"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13 7L13.9942 9.48556C14.4813 10.7034 14.7249 11.3123 15.2328 11.6561C15.7407 12 16.3965 12 17.7081 12H21"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M4.86957 17C3.51684 17 2.84048 17 2.42024 16.5607C2 16.1213 2 15.4142 2 14V7C2 5.58579 2 4.87868 2.42024 4.43934C2.84048 4 3.51684 4 4.86957 4H10.1304C11.4832 4 12.1595 4.43934 12.5798 4.43934C13 4.87868 13 5.58579 13 7V17H8.69565"
        stroke="#141B34"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DesktopCustomerIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      className="h-11 w-11 shrink-0"
    >
      <rect width="40" height="40" rx="10" fill="#EBF2FC" />

      <rect
        x="8"
        y="12"
        width="24"
        height="16"
        rx="3"
        fill="#174184"
        fillOpacity="0.8"
      />

      <rect
        x="12"
        y="17"
        width="16"
        height="6"
        rx="2"
        fill="#174184"
        fillOpacity="0.6"
      />
    </svg>
  );
}

function DesktopPartnerIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      className="h-11 w-11 shrink-0"
    >
      <rect width="40" height="40" rx="10" fill="#FFF0D6" />

      <rect
        x="4"
        y="12"
        width="22"
        height="14"
        rx="2"
        fill="#99631D"
        fillOpacity="0.8"
      />

      <rect
        x="24"
        y="16"
        width="12"
        height="10"
        rx="2"
        fill="#99631D"
        fillOpacity="0.7"
      />

      <circle cx="11" cy="27" r="5" fill="#99631D" fillOpacity="0.9" />
      <circle cx="27" cy="27" r="5" fill="#99631D" fillOpacity="0.9" />
    </svg>
  );
}

function DecorativeCircles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-6px] top-[-34px] z-10 h-[136px] w-[136px] md:right-0 md:-top-[56px] md:h-[240px] md:w-[240px]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-[-20px] top-0 h-[136px] w-[136px] md:h-[240px] md:w-[240px]"
        viewBox="0 0 220 160"
        fill="none"
      >
        <circle
          cx="120"
          cy="40"
          r="120"
          fill="#286BDC"
          fillOpacity="0.05"
        />
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-[-6px] top-[-6px] h-[95.2px] w-[95.2px] md:right-0 md:top-0 md:h-[150px] md:w-[150px]"
        viewBox="0 0 150 150"
        fill="none"
      >
        <circle
          cx="75"
          cy="75"
          r="75"
          fill="#286BDC"
          fillOpacity="0.04"
        />
      </svg>
    </div>
  );
}

function DesktopBottomCircle() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-[58px] -left-[58px] hidden h-[160px] w-[160px] rounded-full bg-[rgba(255,166,48,0.035)] lg:block"
    />
  );
}

type ActionPanelProps = {
  type: AccountType;
};

function ActionPanel({ type }: ActionPanelProps) {
  const isCustomer = type === "customer";

  return (
    <div
      className={`mt-5 flex w-full flex-col gap-[18px] rounded-r-xl border border-primary-02 border-l-4 bg-primary-01/40 px-4 pb-3 pt-[10px] md:mt-5 md:px-4 ${
        isCustomer ? "border-l-primary-06" : "border-l-secondary-06"
      }`}
    >
      <p className="m-0 text-center font-sans text-base font-normal leading-6 text-primary-08">
        Continue as {isCustomer ? "a customer" : "a partner"}
      </p>

      <Link
        href={isCustomer ? ROUTES.customerLogin : ROUTES.partnerLogin}
        prefetch={false}
        className={`zion-btn zion-btn-md w-full min-w-0 ${
          isCustomer ? "zion-btn-blue" : "zion-btn-orange"
        }`}
      >
        <NavigationButtonContent label="Login" />
      </Link>

      <Link
        href={
          isCustomer
            ? ROUTES.customerCreateAccount
            : ROUTES.partnerApplication
        }
        prefetch={false}
        className="zion-btn zion-btn-md zion-btn-outline-blue w-full min-w-0"
      >
        <NavigationButtonContent
          label={isCustomer ? "Create an Account" : "Start Application"}
        />
      </Link>
    </div>
  );
}

function DesktopActionPanel({ type }: ActionPanelProps) {
  const isCustomer = type === "customer";

  return (
    <div
      className={`mt-4 rounded-r-[13px] border border-primary-02 border-l-4 bg-primary-01/50 px-[14px] pb-5 pt-[9px] ${
        isCustomer ? "border-l-primary-06" : "border-l-secondary-06"
      }`}
    >
      <p className="m-0 text-center font-sans text-base font-normal leading-6 text-primary-08">
        Continue as {isCustomer ? "a customer" : "a shipping agent"}
      </p>

      <div className="mx-auto mt-[13px] grid w-[592px] max-w-full grid-cols-2 gap-1">
        <Link
          href={isCustomer ? ROUTES.customerLogin : ROUTES.partnerLogin}
          prefetch={false}
          className={`inline-flex h-[50px] items-center justify-center rounded-lg border px-4 font-sans text-base font-normal no-underline transition-colors ${
            isCustomer
              ? "border-primary-06 bg-primary-06 text-white hover:bg-primary-07"
              : "border-secondary-06 bg-secondary-06 text-primary-10 hover:bg-secondary-07"
          }`}
        >
          Log in
        </Link>

        <Link
          href={
            isCustomer
              ? ROUTES.customerCreateAccount
              : ROUTES.partnerApplication
          }
          prefetch={false}
          className={`inline-flex h-[50px] items-center justify-center rounded-lg border bg-white px-4 font-sans text-base font-normal no-underline transition-colors ${
            isCustomer
              ? "border-primary-06 text-primary-06 hover:bg-primary-01"
              : "border-secondary-06 text-secondary-07 hover:bg-secondary-01"
          }`}
        >
          {isCustomer ? "Create account" : "Start application"}
        </Link>
      </div>
    </div>
  );
}

type DesktopRoleOptionProps = {
  type: AccountType;
  selected: boolean;
  title: string;
  description: string;
  onSelect: (type: AccountType) => void;
};

function DesktopRoleOption({
  type,
  selected,
  title,
  description,
  onSelect,
}: DesktopRoleOptionProps) {
  const isCustomer = type === "customer";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(type)}
      className={`flex h-[72px] min-w-0 items-center gap-[10px] rounded-[13px] border bg-white pl-4 pr-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-03 focus-visible:ring-offset-2 ${
        selected
          ? isCustomer
            ? "border-2 border-primary-06 bg-primary-01/40"
            : "border-2 border-secondary-06 bg-secondary-01/30"
          : "border-neutral-03 hover:border-primary-03"
      }`}
    >
      {isCustomer ? <DesktopCustomerIcon /> : <DesktopPartnerIcon />}

      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-base font-semibold leading-6 text-neutral-10">
          {title}
        </span>

        <span className="block truncate font-sans text-xs font-normal leading-[18px] text-text-body-light">
          {description}
        </span>
      </span>

      <span
        aria-hidden="true"
        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          selected
            ? isCustomer
              ? "border-primary-06"
              : "border-secondary-06"
            : "border-neutral-04"
        }`}
      >
        {selected ? (
          <span
            className={`h-[14px] w-[14px] rounded-full ${
              isCustomer ? "bg-primary-06" : "bg-secondary-06"
            }`}
          />
        ) : null}
      </span>
    </button>
  );
}

export default function AccountTypeSelector() {
  const [mobileOpenType, setMobileOpenType] =
    useState<AccountType | null>(null);

  const [desktopSelectedType, setDesktopSelectedType] =
    useState<AccountType>("customer");

  function toggleMobileType(type: AccountType) {
    setMobileOpenType((currentType) =>
      currentType === type ? null : type,
    );
  }

  const mobileBaseCardClasses =
    "flex w-full min-h-[177px] cursor-pointer flex-col items-start rounded-xl border-2 border-neutral-02 bg-primary-01/40 p-[14px] text-left outline-none transition-colors duration-[180ms] focus-visible:ring-2 focus-visible:ring-primary-03 focus-visible:ring-offset-2 md:min-h-[202px] md:rounded-[13px] md:px-4 md:py-5";

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-01 pt-6 lg:flex lg:items-center lg:justify-center lg:p-8">
      <DecorativeCircles />
      <DesktopBottomCircle />

      <section
        className={`relative mx-auto flex min-h-[calc(100dvh-24px)] w-full flex-col overflow-hidden rounded-[16px] bg-white px-6 pb-6 pt-4 lg:hidden ${
          mobileOpenType
            ? "md:h-auto md:min-h-[638px]"
            : "md:h-[638px] md:min-h-0"
        } md:m-0 md:w-[840px] md:max-w-full md:px-9 md:pb-6 md:pt-11`}
      >
        <Link
          href={ROUTES.home}
          className="z-[1] -m-2 mb-7 ml-1 inline-flex w-fit items-center gap-2 rounded-md bg-transparent p-2 font-sans text-base font-normal leading-6 text-primary-06 no-underline transition-colors duration-[180ms] hover:bg-primary-01 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03 md:absolute md:left-9 md:top-11 md:m-0"
        >
          <BackArrowIcon />
          <span>Back to home</span>
        </Link>

        <header className="mx-auto mb-7 hidden w-full max-w-[646px] text-center md:block">
          <div className="mx-auto mb-[9px] flex w-fit items-center gap-2">
            <Image
              src="/images/logo-zionra.png"
              alt=""
              width={28}
              height={28}
              priority
              className="h-7 w-7 object-contain"
            />

            <span className="font-display text-xl font-bold leading-normal tracking-[-0.5px] text-primary-10">
              zionra
            </span>
          </div>

          <h1 className="m-0 text-center font-display text-2xl font-semibold leading-[34px] tracking-[-0.5px] text-neutral-10">
            Welcome to Zionra
          </h1>

          <p className="m-0 text-center font-sans text-base font-normal leading-[26px] text-text-body-light">
            Choose your account type to get started
          </p>

          <div className="mt-[14px] h-px w-full bg-white" />
        </header>

        <div className="mx-auto grid w-full max-w-[700px] grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-7">
          <div className="min-w-0">
            <button
              type="button"
              className={`${mobileBaseCardClasses} hover:border-primary-06 ${
                mobileOpenType === "customer" ? "border-primary-06" : ""
              }`}
              onClick={() => toggleMobileType("customer")}
              aria-expanded={mobileOpenType === "customer"}
              aria-controls="mobile-customer-actions"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-02 md:h-[54px] md:w-[54px] md:rounded-[9px]">
                <PackageIcon />
              </span>

              <span className="mt-4 flex flex-col gap-1 md:mt-5 md:gap-[6px]">
                <span className="font-display text-xl font-semibold leading-[30px] tracking-[-0.3px] text-neutral-10 md:text-2xl md:leading-[34px] md:tracking-[-0.5px]">
                  I&apos;m a customer
                </span>

                <span className="max-w-[294px] font-display text-sm font-bold leading-[22px] text-text-body-light">
                  Send packages from the UK to Nigeria with verified shipping
                  agents
                </span>
              </span>
            </button>

            {mobileOpenType === "customer" ? (
              <div id="mobile-customer-actions">
                <ActionPanel type="customer" />
              </div>
            ) : null}
          </div>

          <div className="min-w-0">
            <button
              type="button"
              className={`${mobileBaseCardClasses} hover:border-secondary-06 ${
                mobileOpenType === "partner" ? "border-secondary-06" : ""
              }`}
              onClick={() => toggleMobileType("partner")}
              aria-expanded={mobileOpenType === "partner"}
              aria-controls="mobile-partner-actions"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-02 md:h-[54px] md:w-[54px] md:rounded-[9px]">
                <ShippingPartnerIcon />
              </span>

              <span className="mt-4 flex flex-col gap-1 md:mt-5 md:gap-[6px]">
                <span className="font-display text-xl font-semibold leading-[30px] tracking-[-0.3px] text-neutral-10 md:text-2xl md:leading-[34px] md:tracking-[-0.5px]">
                  I&apos;m a shipping partner
                </span>

                <span className="max-w-[294px] font-display text-sm font-bold leading-[22px] text-text-body-light">
                  Become a verified Zionra partner and access more clients.
                </span>
              </span>
            </button>

            {mobileOpenType === "partner" ? (
              <div id="mobile-partner-actions">
                <ActionPanel type="partner" />
              </div>
            ) : null}
          </div>
        </div>

        <p
          className={`mx-auto flex items-center justify-center gap-1 font-sans text-[13px] font-normal leading-normal text-[#8FA3BF] ${
            mobileOpenType
              ? "mb-auto mt-12 md:mb-0 md:mt-10"
              : "mb-auto mt-9 md:mb-0 md:mt-auto"
          }`}
        >
          <span>Not sure which one?</span>

          <Link
            href={ROUTES.learnDifference}
            className="inline-flex items-center gap-[3px] rounded text-primary-06 no-underline hover:text-primary-07 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03"
          >
            Learn the difference
            <RightArrowIcon />
          </Link>
        </p>
      </section>

      <section className="relative z-[20] hidden min-h-[596px] w-full max-w-[752px] flex-col rounded-[18px] border border-neutral-03 bg-white px-[52px] pb-[42px] pt-11 lg:flex">
        <header className="text-center">
          <div className="mx-auto flex w-fit items-center gap-2">
            <Image
              src="/images/logo-zionra.png"
              alt=""
              width={28}
              height={28}
              priority
              className="h-7 w-7 object-contain"
            />

            <span className="font-display text-xl font-bold leading-7 tracking-[-0.5px] text-primary-10">
              zionra
            </span>
          </div>

          <h1 className="mt-3 font-display text-[28px] font-semibold leading-[38px] tracking-[-0.6px] text-neutral-10">
            Welcome to Zionra
          </h1>

          <p className="m-0 font-sans text-[17px] font-normal leading-[26px] text-text-body-light">
            Choose your account type to get started
          </p>

          <div className="mt-4 h-px w-full bg-neutral-02" />
        </header>

        <div
          className="mt-7"
          role="radiogroup"
          aria-label="Choose your account type"
        >
          <div className="grid grid-cols-2 gap-3">
            <DesktopRoleOption
              type="customer"
              selected={desktopSelectedType === "customer"}
              title="Customer"
              description="Send packages"
              onSelect={setDesktopSelectedType}
            />

            <DesktopRoleOption
              type="partner"
              selected={desktopSelectedType === "partner"}
              title="Shipping agent"
              description="Manage shipments"
              onSelect={setDesktopSelectedType}
            />
          </div>

          <DesktopActionPanel type={desktopSelectedType} />
        </div>

        <p className="mx-auto mt-auto flex items-center justify-center gap-1 font-sans text-sm font-normal leading-5 text-[#8FA3BF]">
          <span>Not sure which one?</span>

          <Link
            href={ROUTES.learnDifference}
            className="inline-flex items-center gap-[2px] rounded text-primary-06 no-underline hover:text-primary-07 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03"
          >
            Learn the difference
            <RightArrowIcon />
          </Link>
        </p>
      </section>
    </main>
  );
}