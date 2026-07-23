/**
 * Responsibility:
 * Renders and submits the responsive Zionra customer login experience.
 * It handles password login, Google login, verification feedback, loading
 * states, session recovery, and the desktop promotional panel.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "../ui/LoadingSpinner";
import AuthBackArrowIcon from "./shared/AuthBackArrowIcon";
import AuthDecorativeCircles from "./shared/AuthDecorativeCircles";
import AuthPasswordField from "./shared/AuthPasswordField";
import GoogleAuthButton from "./shared/GoogleAuthButton";

type CustomerLoginFormProps = {
  initialEmail?: string;
  wasVerified?: boolean;
};

type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};

type LoginApiResponse = {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
  redirectTo?: string;
};

function ForwardArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M4 10H16M11 5L16 10L11 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EllipseShape({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="174"
      height="172"
      viewBox="0 0 174 172"
      fill="none"
      className={className}
    >
      <path
        d="M153.414 48.2523C153.414 114.526 99.6885 168.252 33.4143 168.252C-32.8599 168.252 19.9142 189.526 19.9142 123.252C19.9142 56.978 73.64 3.2522 139.914 3.2522C206.188 3.2522 153.414 -18.0219 153.414 48.2523Z"
        fill="#286BDC"
        fillOpacity="0.08"
      />
    </svg>
  );
}

function TriangleAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-[60px] w-[68px] shrink-0 overflow-hidden [clip-path:polygon(50%_0%,100%_100%,0%_100%)]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="58px"
        className="object-cover object-top"
      />
    </div>
  );
}

function PromotionalPanel() {
  return (
    <aside
      className="relative hidden h-screen min-h-0 overflow-hidden bg-primary-10 px-[72px] pt-[116px] text-white xl:block"
      style={{
        backgroundImage:
          "radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "42px 42px",
      }}
    >
      <div className="pointer-events-none absolute -left-[135px] -top-[100px] h-[380px] w-[380px] rounded-full bg-[rgba(40,107,220,0.07)]" />

      <EllipseShape className="pointer-events-none absolute -right-[44px] top-[336px] h-[172px] w-[174px]" />

      <EllipseShape className="pointer-events-none absolute left-[112px] top-[490px] h-[172px] w-[174px]" />

      <div className="relative z-[1] w-[360px]">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo-zionra.png"
            alt=""
            width={27}
            height={27}
            className="h-[27px] w-[27px] object-contain"
            priority
          />
          <span className="font-display text-[22px] font-bold tracking-[-0.5px] text-white">
            zionra
          </span>
        </div>

        <h2 className="mt-6 font-display text-[40px] font-bold leading-[48px] tracking-[-1px] text-white">
          <span className="block whitespace-nowrap">Ship Smarter. Track</span>
          <span className="block whitespace-nowrap">With Confidence.</span>
        </h2>

        <div className="mt-3 h-1 w-16 rounded-full bg-tertiary-06" />

        <p className="mt-6 w-[330px] font-sans text-base font-normal leading-[26px] text-[#D4DAE0]">
          Compare verified shipping partners, access transparent pricing, and
          track shipments in real time with zionra.
        </p>

        <div className="mt-4 flex items-end">
          <TriangleAvatar src="/images/firstimage.jpg" alt="Zionra customer" />

          <div className="-ml-2">
            <TriangleAvatar src="/images/secondimage.jpg" alt="Zionra customer" />
          </div>

          <div className="-ml-2">
            <TriangleAvatar src="/images/thirdimage.jpg" alt="Zionra customer" />
          </div>
        </div>

        <div className="mt-2 font-display text-[24px] font-bold leading-none tracking-[2px] text-secondary-06">
          ★★★★★
        </div>

        <p className="mt-2 font-sans text-xs font-normal text-neutral-03">
          Trusted Logistics marketplace
        </p>
      </div>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[18px] left-[55px] h-[190px] w-[370px] max-w-none overflow-visible"
        viewBox="0 0 370 190"
        fill="none"
      >
        <path
          d="M28 50 130 135 248 32 340 77"
          stroke="#286BDC"
          strokeOpacity=".45"
        />

        <path
          d="M28 50 248 32"
          stroke="#286BDC"
          strokeOpacity=".28"
        />

        <circle cx="28" cy="50" r="16" fill="#286BDC" fillOpacity=".18" />
        <circle cx="28" cy="50" r="8" fill="#286BDC" />

        <circle cx="130" cy="135" r="16" fill="#286BDC" fillOpacity=".18" />
        <circle cx="130" cy="135" r="8" fill="#286BDC" />

        <circle cx="248" cy="32" r="16" fill="#FFA630" fillOpacity=".18" />
        <circle cx="248" cy="32" r="8" fill="#FFA630" />

        <circle cx="340" cy="77" r="16" fill="#2EC4B6" fillOpacity=".18" />
        <circle cx="340" cy="77" r="8" fill="#2EC4B6" />

        <g fill="#0F2C58">
          <rect x="3" y="64" width="50" height="17" rx="8.5" />
          <rect x="95" y="150" width="70" height="17" rx="8.5" />
          <rect x="224" y="46" width="48" height="17" rx="8.5" />
          <rect x="314" y="91" width="52" height="17" rx="8.5" />
        </g>

        <g
          fill="#C4CEDE"
          fontFamily="DM Sans, sans-serif"
          fontSize="8"
          textAnchor="middle"
        >
          <text x="28" y="76">
            London
          </text>
          <text x="130" y="162">
            Manchester
          </text>
          <text x="248" y="58">
            Lagos
          </text>
          <text x="340" y="103">
            Abuja
          </text>
        </g>
      </svg>
    </aside>
  );
}

export default function CustomerLoginForm({
  initialEmail = "",
  wasVerified = false,
}: CustomerLoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState(initialEmail.trim().toLowerCase());
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(buildApiUrl(routes.api.customerAuth.me), {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    })
      .then((response) => {
        if (response.ok) {
          router.replace(routes.web.customerDashboard);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      });

    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    function resetNavigationLoadingState() {
      setIsStartingGoogle(false);
      setIsSubmitting(false);
    }

    window.addEventListener("pageshow", resetNavigationLoadingState);

    return () => {
      window.removeEventListener("pageshow", resetNavigationLoadingState);
    };
  }, []);

  function validateForm() {
    const nextErrors: LoginErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      nextErrors.email = "This field can't be left empty.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "This field can't be left empty.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm() || isSubmitting || isStartingGoogle) {
      return;
    }

    setIsSubmitting(true);
    setRequiresVerification(false);
    setErrors({});

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.login),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        },
      );

      const result = (await response
        .json()
        .catch(() => ({}))) as LoginApiResponse;

      if (!response.ok) {
        const verificationRequired = result.code === "EMAIL_NOT_VERIFIED";

        setRequiresVerification(verificationRequired);

        setErrors({
          ...(result.errors ?? {}),
          form:
            result.message ??
            (verificationRequired
              ? "Please verify your email address before signing in."
              : "Unable to sign in. Check your details and try again."),
        });

        return;
      }

      setPassword("");
      router.replace(
        result.redirectTo ?? routes.web.customerLoginVerification,
      );
    } catch (error) {
      console.error("Customer login failed:", error);

      setErrors({
        form: "Unable to reach the server. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    if (isStartingGoogle || isSubmitting) {
      return;
    }

    setErrors({});
    setRequiresVerification(false);
    setIsStartingGoogle(true);

    try {
      window.location.assign(buildApiUrl(routes.api.customerAuth.google));
    } catch (error) {
      console.error("Google login could not start:", error);

      setIsStartingGoogle(false);

      setErrors({
        form: "Unable to start Google sign in. Please try again.",
      });
    }
  }

  const verificationHref = `${routes.web.customerVerifyEmail}?email=${encodeURIComponent(
    email.trim().toLowerCase(),
  )}`;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white md:bg-neutral-01 xl:grid xl:h-screen xl:min-h-0 xl:grid-cols-[36%_64%] xl:overflow-hidden">
      <PromotionalPanel />

      <section className="relative min-h-screen overflow-x-hidden bg-white px-[22px] pb-8 pt-4 md:flex md:items-start md:justify-center md:overflow-y-auto md:bg-neutral-01 md:px-8 md:py-10 xl:h-screen xl:min-h-0 xl:items-center xl:px-8 xl:py-8">
        <AuthDecorativeCircles className="pointer-events-none absolute right-[-6px] top-[-34px] z-10 h-[136px] w-[136px] md:h-[240px] md:w-[240px] xl:fixed xl:right-0 xl:-top-[56px]" />

        <div className="relative z-[20] mx-auto w-full max-w-[424px] md:max-w-[628px] md:rounded-[20px] md:bg-white md:px-10 md:pb-10 md:pt-8 xl:w-[628px] xl:max-w-[628px] xl:min-h-[742px] xl:px-5 xl:pb-[18px] xl:pt-[18px]">
          <Link
            href={routes.web.getStarted}
            className="inline-flex min-h-9 w-fit items-center gap-2 rounded-md border border-primary-06 px-2 py-1 font-sans text-base font-normal leading-6 text-primary-06 no-underline transition-colors duration-[180ms] hover:bg-primary-01 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03 md:border-0"
          >
            <AuthBackArrowIcon />

            <span className="md:hidden">Back</span>
            <span className="hidden md:inline">Back to home</span>
          </Link>

          <div className="mx-auto w-full max-w-[400px] md:max-w-[500px] xl:max-w-[400px]">
            <header className="mt-6 text-center md:mt-4 xl:mt-[32px]">
              <h1 className="font-display text-[24px] font-semibold leading-[34px] tracking-[-0.5px] text-neutral-10">
                Welcome back
              </h1>

              <p className="font-sans text-sm font-normal leading-[22px] text-text-body-light md:text-base md:leading-[26px]">
                Sign in to your Zionra customer account
              </p>

              <div className="mx-auto mt-1 h-px w-full bg-neutral-03" />
            </header>

            {wasVerified ? (
              <div
                role="status"
                className="mt-4 rounded-lg border border-tertiary-02 bg-tertiary-01 px-3 py-2 text-center font-sans text-sm leading-[22px] text-tertiary-09"
              >
                Your email has been verified. You can now log in.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate className="mt-5 md:mt-6">
              <label htmlFor="email" className="block">
                <span className="mb-2 block font-sans text-sm font-normal leading-[22px] text-neutral-10">
                  Email Address <span className="text-error">*</span>
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  placeholder="You@example.com"
                  aria-invalid={Boolean(errors.email)}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setRequiresVerification(false);

                    setErrors((current) => ({
                      ...current,
                      email: undefined,
                      form: undefined,
                    }));
                  }}
                  className="zion-input h-[52px] md:h-12"
                />

                {errors.email ? (
                  <p className="zion-field-error mt-1">{errors.email}</p>
                ) : null}
              </label>

              <AuthPasswordField
                id="password"
                className="mt-4 block md:mt-5"
                label="Password"
                value={password}
                placeholder="Min. 8 characters"
                visible={showPassword}
                error={errors.password}
                autoComplete="current-password"
                onChange={(value) => {
                  setPassword(value);

                  setErrors((current) => ({
                    ...current,
                    password: undefined,
                    form: undefined,
                  }));
                }}
                onToggle={() => setShowPassword((current) => !current)}
              />

              {errors.form ? (
                <div
                  aria-live="polite"
                  className="mt-4 text-center font-sans text-sm leading-[22px] text-error"
                >
                  <p>{errors.form}</p>

                  {requiresVerification && email.trim() ? (
                    <Link
                      href={verificationHref}
                      className="mt-1 inline-block font-medium text-primary-06 no-underline hover:text-primary-07"
                    >
                      Verify your email
                    </Link>
                  ) : null}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || isStartingGoogle}
                aria-busy={isSubmitting}
                className="zion-btn zion-btn-md zion-btn-blue mt-7 w-full min-w-0"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    <span className="sr-only">Signing in</span>
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <GoogleAuthButton
              onClick={handleGoogleLogin}
              disabled={isStartingGoogle || isSubmitting}
              loading={isStartingGoogle}
              className="zion-btn zion-btn-md zion-btn-outline-blue mt-5 w-full min-w-0"
            />

            <div className="mt-5 text-center">
              <Link
                href={routes.web.customerForgotPassword}
                className="font-sans text-sm font-normal leading-[22px] text-primary-06 no-underline hover:text-primary-07"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="mt-7 h-[3px] w-full bg-neutral-03" />

            <div className="mt-5 space-y-3 font-sans text-sm font-normal leading-[22px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-text-body-light">
                  Don&apos;t have an account?
                </span>

                <Link
                  href={routes.web.customerCreateAccount}
                  className="inline-flex items-center gap-2 whitespace-nowrap text-primary-06 no-underline hover:text-primary-07"
                >
                  Create Account
                  <ForwardArrowIcon />
                </Link>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-text-body-light">
                  Are you a shipping partner?
                </span>

                <Link
                  href={routes.web.partnerApplication}
                  className="inline-flex items-center gap-2 whitespace-nowrap text-secondary-06 no-underline hover:text-secondary-07"
                >
                  Become a shipping partner
                  <ForwardArrowIcon />
                </Link>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-primary-02 bg-primary-01 px-4 py-3 text-center font-sans text-xs font-normal leading-[18px] text-primary-04">
              Your data is protected with industry-standard security.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}