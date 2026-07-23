/**
 * Responsibility:
 * Confirms an existing customer's password before linking a pending Google
 * identity, creating the customer session, and continuing to the dashboard.
 */

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { routes } from "@/config/routes";
import { buildApiUrl } from "@/lib/api";
import LoadingSpinner from "../ui/LoadingSpinner";
import AuthDecorativeCircles from "./shared/AuthDecorativeCircles";
import AuthPasswordField from "./shared/AuthPasswordField";

type PendingGoogleProfile = {
  firstName: string;
  lastName: string;
  email: string;
};

type ApiResponse = {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
  profile?: PendingGoogleProfile;
  redirectTo?: string;
};

export default function LinkGoogleAccountForm() {
  const router = useRouter();

  const [profile, setProfile] = useState<PendingGoogleProfile | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestartingGoogle, setIsRestartingGoogle] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const response = await fetch(
          buildApiUrl(routes.api.customerAuth.googlePendingProfile),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const result = (await response.json().catch(() => ({}))) as ApiResponse;

        if (!response.ok || !result.profile) {
          setLoadError(
            result.message ??
              "Your Google sign-in session has expired. Start again with Google.",
          );
          return;
        }

        setProfile(result.profile);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Pending Google link could not be loaded:", error);
        setLoadError("Unable to reach the server. Start again with Google.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    function resetRestoredLoadingState() {
      setIsSubmitting(false);
      setIsRestartingGoogle(false);
    }

    window.addEventListener("pageshow", resetRestoredLoadingState);

    return () => {
      window.removeEventListener("pageshow", resetRestoredLoadingState);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPassword = password.trim();

    if (!normalizedPassword) {
      setPasswordError("This field can't be left empty.");
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setPasswordError("");
    setFormError("");

    try {
      const response = await fetch(
        buildApiUrl(routes.api.customerAuth.googleLinkExistingAccount),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: normalizedPassword,
          }),
        },
      );

      const result = (await response.json().catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        if (result.code === "GOOGLE_SIGNUP_EXPIRED") {
          setLoadError(
            result.message ??
              "Your Google sign-in session has expired. Start again with Google.",
          );
          return;
        }

        if (result.errors?.password) {
          setPasswordError(result.errors.password);
        }

        setFormError(
          result.errors?.password
            ? ""
            : result.message ?? "Unable to connect your Google Account.",
        );
        return;
      }

      router.replace(result.redirectTo ?? routes.web.customerDashboard);
      router.refresh();
    } catch (error) {
      console.error("Google account linking failed:", error);
      setFormError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function restartGoogle() {
    if (isRestartingGoogle) {
      return;
    }

    setIsRestartingGoogle(true);
    window.location.replace(buildApiUrl(routes.api.customerAuth.google));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-01 px-0 pt-3 md:flex md:items-center md:justify-center md:p-8">
      <AuthDecorativeCircles className="pointer-events-none absolute right-[-6px] top-[-34px] z-10 h-[136px] w-[136px] md:right-0 md:-top-[56px] md:h-[240px] md:w-[240px]" />

      <section className="relative min-h-[calc(100vh-12px)] w-full overflow-hidden rounded-t-[24px] bg-white px-6 pb-8 pt-7 shadow-[0_4px_4px_rgba(0,0,0,0.25)] md:min-h-0 md:max-w-[560px] md:rounded-2xl md:px-12 md:py-10 md:shadow-none">
        <div className="relative z-[1] mx-auto w-full max-w-[440px]">
          <div className="mx-auto flex w-fit items-center gap-2">
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

          <header className="mt-6 text-center">
            <h1 className="font-display text-2xl font-semibold leading-[34px] tracking-[-0.5px] text-neutral-10">
              Connect your Google Account
            </h1>
            <p className="mx-auto mt-2 max-w-[390px] font-sans text-sm font-normal leading-[22px] text-text-body-light md:text-base md:leading-[26px]">
              Enter your Zionra password to confirm this account belongs to you.
            </p>
            <div className="mx-auto mt-4 h-px w-full bg-primary-06" />
          </header>

          {isLoadingProfile ? (
            <div className="flex min-h-[280px] items-center justify-center text-primary-06">
              <LoadingSpinner />
              <span className="sr-only">Loading your Google profile</span>
            </div>
          ) : loadError ? (
            <div className="mt-8 rounded-xl border border-primary-02 bg-primary-01 px-5 py-6 text-center">
              <p className="font-sans text-sm font-normal leading-[22px] text-primary-09">
                {loadError}
              </p>
              <button
                type="button"
                onClick={restartGoogle}
                disabled={isRestartingGoogle}
                className="zion-btn zion-btn-md zion-btn-blue mt-5 w-full min-w-0"
              >
                {isRestartingGoogle ? (
                  <>
                    <LoadingSpinner />
                    <span className="sr-only">Starting Google sign in</span>
                  </>
                ) : (
                  "Start again with Google"
                )}
              </button>
            </div>
          ) : profile ? (
            <>
              <div className="mt-6 rounded-xl border border-primary-02 bg-primary-01 px-4 py-3">
                <p className="font-display text-base font-semibold leading-6 text-neutral-10">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="mt-1 break-all font-sans text-sm font-normal leading-[22px] text-text-body-light">
                  {profile.email}
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="mt-6">
                <AuthPasswordField
                  id="password"
                  label="Zionra Password"
                  value={password}
                  placeholder="Enter your password"
                  visible={showPassword}
                  error={passwordError}
                  autoComplete="current-password"
                  onChange={(value) => {
                    setPassword(value);
                    setPasswordError("");
                    setFormError("");
                  }}
                  onToggle={() => setShowPassword((current) => !current)}
                />

                {formError ? (
                  <p className="zion-field-error mt-4 text-center">
                    {formError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="zion-btn zion-btn-md zion-btn-blue mt-7 w-full min-w-0"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner />
                      <span className="sr-only">Connecting Google</span>
                    </>
                  ) : (
                    "Connect Google and Continue"
                  )}
                </button>
              </form>

              <p className="mt-5 text-center font-sans text-xs font-normal leading-[18px] text-primary-04">
                Google will only be connected after your Zionra password is confirmed.
              </p>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
