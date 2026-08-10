/**
 * Responsibility:
 * Centralizes Zionra frontend paths and backend API paths.
 * Components reference these values instead of repeating route strings.
 */

export const routes = {
  web: {
    home: "/",
    getStarted: "/get-started",
    homeHowItWorks: "/#how-it-works",
    homeQuote: "/#get-quote",
    homeTrack: "/#track-shipment",
    homeReviews: "/#reviews",
    homePartners: "/#shipping-partners",

    customerLogin: "/login",
    customerLoginVerification: "/login/verify",
    customerCreateAccount: "/create-account",
    customerVerifyEmail: "/verify-email",
    customerForgotPassword: "/forgot-password",
    customerVerifyPasswordResetCode: "/forgot-password/verify",
    customerResetPassword: "/reset-password",
    customerCompleteProfile: "/complete-profile",
    customerLinkGoogleAccount: "/link-google-account",
    customerDashboard: "/dashboard",

    partnerLogin: "/partner/login",
    partnerLoginVerification: "/partner/login/verify",
    partnerForgotPassword: "/partner/forgot-password",
    partnerVerifyPasswordResetCode: "/partner/forgot-password/verify",
    partnerResetPassword: "/partner/reset-password",
    partnerApplication: "/partner/apply",
    partnerVerifyEmail: "/partner/verify-email",
    partnerCompleteProfile: "/partner/complete-profile",
    partnerLinkGoogleAccount: "/partner/link-google-account",
    partnerBusinessInformation:
      "/partner/application/business-information",
    partnerOperationalDetails:
      "/partner/application/operational-details",
    partnerAccountInformation:
      "/partner/application/account-information",
    partnerApplicationReview:
      "/partner/application/review",
    partnerApplicationProcessing:
      "/partner/application/processing",
    partnerApplicationSubmitted:
      "/partner/application/submitted",
    partnerDashboard: "/partner/dashboard",

    learnDifference: "/learn-the-difference",
    terms: "/terms",
    privacy: "/privacy",
  },

  api: {
    partnerAuth: {
      register: "/api/partner/auth/register",
      login: "/api/partner/auth/login",
      loginChallenge: "/api/partner/auth/login/challenge",
      verifyLoginCode: "/api/partner/auth/login/verify-code",
      resendLoginCode: "/api/partner/auth/login/resend-code",
      cancelLogin: "/api/partner/auth/login/cancel",
      forgotPassword: "/api/partner/auth/forgot-password",
      verifyPasswordResetCode:
        "/api/partner/auth/verify-password-reset-code",
      passwordResetSession:
        "/api/partner/auth/password-reset-session",
      resetPassword: "/api/partner/auth/reset-password",
      dashboard: "/api/partner/auth/dashboard",
      verifyEmail: "/api/partner/auth/verify-email",
      resendVerificationCode:
        "/api/partner/auth/resend-verification-code",
      me: "/api/partner/auth/me",
      logout: "/api/partner/auth/logout",
      google: "/api/partner/auth/google",
      googlePendingProfile:
        "/api/partner/auth/google/pending-profile",
      googleLinkExistingAccount:
        "/api/partner/auth/google/link-existing-account",
      googleCompleteProfile:
        "/api/partner/auth/google/complete-profile",
      application: "/api/partner/auth/application",
      businessInformation:
        "/api/partner/auth/application/business-information",
      operationalDetails:
        "/api/partner/auth/application/operational-details",
      accountInformation:
        "/api/partner/auth/application/account-information",
      companyLogo: "/api/partner/auth/application/logo",
      submitApplication: "/api/partner/auth/application/submit",
    },

    customerAuth: {
      register: "/api/customer/auth/register",
      verifyEmail: "/api/customer/auth/verify-email",
      resendVerificationCode:
        "/api/customer/auth/resend-verification-code",

      login: "/api/customer/auth/login",
      loginChallenge: "/api/customer/auth/login/challenge",
      verifyLoginCode: "/api/customer/auth/login/verify-code",
      resendLoginCode: "/api/customer/auth/login/resend-code",
      cancelLogin: "/api/customer/auth/login/cancel",
      logout: "/api/customer/auth/logout",
      me: "/api/customer/auth/me",

      forgotPassword: "/api/customer/auth/forgot-password",
      verifyPasswordResetCode:
        "/api/customer/auth/verify-password-reset-code",
      passwordResetSession:
        "/api/customer/auth/password-reset-session",
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