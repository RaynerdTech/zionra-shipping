/**
 * Responsibility:
 * Centralizes Zionra frontend paths and backend API paths.
 * Components reference these values instead of repeating route strings.
 */

export const routes = {
  web: {
    home: "/",
    getStarted: "/get-started",

    customerLogin: "/login",
    customerCreateAccount: "/create-account",
    customerVerifyEmail: "/verify-email",
    customerForgotPassword: "/forgot-password",
    customerResetPassword: "/reset-password",
    customerCompleteProfile: "/complete-profile",
    customerLinkGoogleAccount: "/link-google-account",
    customerDashboard: "/dashboard",

    partnerLogin: "/partner/login",
    partnerApplication: "/partner/apply",

    learnDifference: "/learn-the-difference",
    terms: "/terms",
    privacy: "/privacy",
  },

  api: {
    customerAuth: {
      register: "/api/customer/auth/register",
      verifyEmail: "/api/customer/auth/verify-email",
      resendVerificationCode:
        "/api/customer/auth/resend-verification-code",

      login: "/api/customer/auth/login",
      logout: "/api/customer/auth/logout",
      me: "/api/customer/auth/me",

      forgotPassword: "/api/customer/auth/forgot-password",
      resetPassword: "/api/customer/auth/reset-password",

      google: "/api/customer/auth/google",
      googlePendingProfile:
        "/api/customer/auth/google/pending-profile",
      googleLinkExistingAccount:
        "/api/customer/auth/google/link-existing-account",
      googleCompleteProfile:
        "/api/customer/auth/google/complete-profile",
    },
  },
} as const;