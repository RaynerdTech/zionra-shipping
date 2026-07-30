/**
 * Responsibility:
 * Renders the responsive Zionra shipping-partner login experience.
 * Password login starts an email-code challenge, while Google login reuses
 * the existing partner OAuth flow and both paths honor application status.
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
import AuthDeliveryNetwork from "./shared/AuthDeliveryNetwork";
import AuthPasswordField from "./shared/AuthPasswordField";
import GoogleAuthButton from "./shared/GoogleAuthButton";

type PartnerLoginFormProps = {
  initialEmail?: string;
  wasVerified?: boolean;
  passwordWasReset?: boolean;
  googleStatus?: string;
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


function getGoogleStatusMessage(status?: string) {
  switch (status) {
    case "cancelled":
      return "Google sign in was cancelled.";
    case "expired":
      return "Your Google sign-in session expired. Please try again.";
    case "email-unverified":
      return "Your Google email address must be verified before you can sign in.";
    case "link-unavailable":
      return "This Google Account cannot be connected to the partner account.";
    case "failed":
      return "Google sign in could not be completed. Please try again.";
    default:
      return undefined;
  }
}

function ForwardArrowIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 10H16M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LeftEllipse() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="167" height="172" viewBox="0 0 167 172" fill="none" className="h-full w-full">
      <path d="M146.414 48.2523C146.414 114.526 92.6885 168.252 26.4143 168.252C-39.8599 168.252 12.9142 189.526 12.9142 123.252C12.9142 56.978 66.64 3.2522 132.914 3.2522C199.188 3.2522 146.414 -18.0219 146.414 48.2523Z" fill="#286BDC" fillOpacity="0.08" />
    </svg>
  );
}

function RightEllipse() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="173" height="172" viewBox="0 0 173 172" fill="none" className="h-full w-full">
      <path d="M19.9143 48.2523C19.9143 114.526 73.6401 168.252 139.914 168.252C206.188 168.252 153.414 189.526 153.414 123.252C153.414 56.978 99.6886 3.2522 33.4145 3.2522C-32.8597 3.2522 19.9143 -18.0219 19.9143 48.2523Z" fill="#286BDC" fillOpacity="0.08" />
    </svg>
  );
}

function DesktopPartnerPanel() {
  return (
    <aside
      className="relative hidden h-screen min-h-0 overflow-hidden bg-primary-10 px-[66px] pt-[112px] text-white xl:block"
      style={{
        backgroundImage: "radial-gradient(circle at center, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "42px 42px",
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -left-[164px] -top-[154px] h-[400px] w-[400px] rounded-full bg-primary-06/[0.06]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[48px] -left-[24px] h-[172px] w-[167px]"><LeftEllipse /></div>
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[48px] -right-[8px] h-[172px] w-[173px]"><RightEllipse /></div>

      <div className="relative z-[1] flex h-full flex-col">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/images/logo-zionra.png" alt="" width={26} height={26} className="h-[26px] w-[26px] object-contain" priority />
            <span className="font-display text-xl font-bold tracking-[-0.5px] text-white">zionra</span>
          </div>

          <h2 className="mt-5 font-display text-[32px] font-bold leading-[42px] tracking-[-0.8px] text-white">
            Back to your deliveries
          </h2>
          <div className="mt-2 h-[3px] w-16 rounded-full bg-tertiary-06" />
          <p className="mt-5 max-w-[320px] font-sans text-base font-normal leading-[26px] text-neutral-03">
            Sign in to your Zionra account to view and manage your shipments.
          </p>
        </div>

        <div className="mt-10 w-[370px] max-w-full">
          <AuthDeliveryNetwork
            londonTone="light"
            className="h-[190px] w-full overflow-visible"
          />
        </div>
      </div>
    </aside>
  );
}

export default function PartnerLoginForm({
  initialEmail = "",
  wasVerified = false,
  passwordWasReset = false,
  googleStatus,
}: PartnerLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail.trim().toLowerCase());
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>(() => ({
    form: getGoogleStatusMessage(googleStatus),
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(buildApiUrl(routes.api.partnerAuth.me), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const result = (await response.json().catch(() => ({}))) as {
          redirectTo?: string;
        };
        router.replace(result.redirectTo ?? routes.web.partnerBusinessInformation);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      });

    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    function resetNavigationState() {
      setIsStartingGoogle(false);
      setIsSubmitting(false);
    }

    window.addEventListener("pageshow", resetNavigationState);
    return () => window.removeEventListener("pageshow", resetNavigationState);
  }, []);

  function validateForm() {
    const nextErrors: LoginErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) nextErrors.email = "This field can't be left empty.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) nextErrors.password = "This field can't be left empty.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateForm() || isSubmitting || isStartingGoogle) return;

    setIsSubmitting(true);
    setRequiresVerification(false);
    setErrors({});

    try {
      const response = await fetch(buildApiUrl(routes.api.partnerAuth.login), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          marketingOptIn,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as LoginApiResponse;

      if (!response.ok) {
        const verificationRequired = result.code === "EMAIL_NOT_VERIFIED";
        setRequiresVerification(verificationRequired);
        setErrors({
          ...(result.errors ?? {}),
          form: result.message ?? "Unable to sign in. Check your details and try again.",
        });
        return;
      }

      setPassword("");
      router.replace(result.redirectTo ?? routes.web.partnerLoginVerification);
    } catch (error) {
      console.error("Partner login failed:", error);
      setErrors({ form: "Unable to reach the server. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    if (isStartingGoogle || isSubmitting) return;
    setErrors({});
    setRequiresVerification(false);
    setIsStartingGoogle(true);

    try {
      window.location.assign(`${buildApiUrl(routes.api.partnerAuth.google)}?source=login`);
    } catch (error) {
      console.error("Partner Google login could not start:", error);
      setIsStartingGoogle(false);
      setErrors({ form: "Unable to start Google sign in. Please try again." });
    }
  }

  const verificationHref = `${routes.web.partnerVerifyEmail}?email=${encodeURIComponent(email.trim().toLowerCase())}`;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white md:bg-neutral-01 xl:grid xl:h-screen xl:min-h-0 xl:grid-cols-[36%_64%] xl:overflow-hidden">
      <DesktopPartnerPanel />

      <section className="relative min-h-screen overflow-x-hidden bg-white px-[20px] pb-10 pt-5 md:flex md:items-start md:justify-center md:overflow-y-auto md:bg-neutral-01 md:px-8 md:py-10 xl:h-screen xl:min-h-0 xl:items-center xl:px-8 xl:py-8">
        <AuthDecorativeCircles className="pointer-events-none absolute right-[-6px] top-[-34px] z-10 h-[136px] w-[136px] md:h-[240px] md:w-[240px] xl:fixed xl:right-0 xl:-top-[56px]" />

        <div className="relative z-[20] mx-auto w-full max-w-[424px] md:max-w-[628px] md:rounded-[20px] md:bg-white md:px-10 md:pb-8 md:pt-7 xl:w-[628px] xl:max-w-[628px] xl:px-16 xl:pb-5 xl:pt-6">
          <Link href={routes.web.getStarted} className="inline-flex min-h-9 w-fit items-center gap-2 rounded-md border border-primary-06 px-2 py-1 font-sans text-base font-normal leading-6 text-primary-06 no-underline transition-colors hover:bg-primary-01 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-03 md:border-0 md:px-0">
            <AuthBackArrowIcon />
            <span className="md:hidden">Back</span>
            <span className="hidden md:inline">Back to home</span>
          </Link>

          <div className="mx-auto w-full max-w-[500px] xl:max-w-[400px]">
            <header className="mt-7 text-center md:mt-5">
              <h1 className="font-display text-[24px] font-semibold leading-[34px] tracking-[-0.5px] text-neutral-10">
                Back to your deliveries
              </h1>
              <p className="font-sans text-base font-normal leading-[26px] text-text-body-light">
                Sign in to your Zionra account
              </p>
              <div className="mx-auto mt-1 h-px w-full bg-neutral-03" />
            </header>

            {wasVerified || passwordWasReset ? (
              <div role="status" className="mt-4 rounded-lg border border-tertiary-02 bg-tertiary-01 px-3 py-2 text-center font-sans text-sm leading-[22px] text-tertiary-09">
                {passwordWasReset
                  ? "Your password has been updated. You can now sign in."
                  : "Your email has been verified. You can now sign in."}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate className="mt-5 md:mt-6">
              <label htmlFor="partner-email" className="block">
                <span className="mb-2 block font-sans text-sm font-normal leading-[22px] text-neutral-10">
                  Email Address <span className="text-error">*</span>
                </span>
                <input
                  id="partner-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  placeholder="You@example.com"
                  aria-invalid={Boolean(errors.email)}
                  disabled={isSubmitting || isStartingGoogle}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setRequiresVerification(false);
                    setErrors((current) => ({ ...current, email: undefined, form: undefined }));
                  }}
                  className="zion-input h-[52px] md:h-12"
                />
                {errors.email ? <p className="zion-field-error mt-1">{errors.email}</p> : null}
              </label>

              <AuthPasswordField
                id="partner-password"
                className="mt-4 block md:mt-5"
                label="Password"
                value={password}
                placeholder="Min. 8 characters"
                visible={showPassword}
                error={errors.password}
                disabled={isSubmitting || isStartingGoogle}
                autoComplete="current-password"
                onChange={(value) => {
                  setPassword(value);
                  setErrors((current) => ({ ...current, password: undefined, form: undefined }));
                }}
                onToggle={() => setShowPassword((current) => !current)}
              />

              <label className="mt-5 flex cursor-pointer items-start gap-2.5 font-sans text-sm leading-[22px] text-text-body-light">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  disabled={isSubmitting || isStartingGoogle}
                  onChange={(event) => setMarketingOptIn(event.target.checked)}
                  className="mt-[2px] h-[18px] w-[18px] shrink-0 accent-primary-06"
                />
                <span>Send me Zionra news, shipping tips and exclusive offers</span>
              </label>

              {errors.form ? (
                <div aria-live="polite" className="mt-4 text-center font-sans text-sm leading-[22px] text-error">
                  <p>{errors.form}</p>
                  {requiresVerification && email.trim() ? (
                    <Link href={verificationHref} className="mt-1 inline-block font-medium text-primary-06 no-underline hover:text-primary-07">
                      Verify your email
                    </Link>
                  ) : null}
                </div>
              ) : null}

              <button type="submit" disabled={isSubmitting || isStartingGoogle} aria-busy={isSubmitting} className="zion-btn zion-btn-md zion-btn-blue mt-8 w-full min-w-0">
                {isSubmitting ? <><LoadingSpinner /><span className="sr-only">Signing in</span></> : "Sign in"}
              </button>
            </form>

            <GoogleAuthButton
              onClick={handleGoogleLogin}
              disabled={isStartingGoogle || isSubmitting}
              loading={isStartingGoogle}
              className="zion-btn zion-btn-md zion-btn-outline-blue mt-5 w-full min-w-0"
            />

            <div className="mt-5 text-center">
              <Link href={routes.web.partnerForgotPassword} className="font-sans text-sm font-normal leading-[22px] text-primary-06 no-underline hover:text-primary-07">
                Forgot your password?
              </Link>
            </div>

            <div className="mt-7 h-[3px] w-full bg-neutral-03" />

            <div className="mt-5 space-y-3 font-sans text-sm font-normal leading-[22px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-text-body-light">Become a shipping partner</span>
                <Link href={routes.web.partnerApplication} className="inline-flex items-center gap-2 whitespace-nowrap text-primary-06 no-underline hover:text-primary-07">
                  Create Account <ForwardArrowIcon />
                </Link>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-text-body-light">Are you a customer?</span>
                <Link href={routes.web.customerLogin} className="inline-flex items-center gap-2 whitespace-nowrap text-secondary-06 no-underline hover:text-secondary-07">
                  Login <ForwardArrowIcon />
                </Link>
              </div>
            </div>

            <div className="mt-9 rounded-xl border border-primary-02 bg-primary-01 px-4 py-3 text-center font-sans text-xs font-normal leading-[18px] text-primary-04">
              Your data is protected with industry-standard security.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
