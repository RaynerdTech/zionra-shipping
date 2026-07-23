/**
 * Responsibility:
 * Centralizes API mount paths, cookie paths, and frontend redirect paths used by the API.
 * Keeping these values in one place prevents controllers, cookies, and email services
 * from drifting when a route changes.
 */

export const API_ROUTES = {
  health: "/health",
  customerAuthBase: "/api/customer/auth",
  customerLoginBase: "/api/customer/auth/login",
  customerGoogleBase: "/api/customer/auth/google",
} as const;

export const WEB_ROUTES = {
  customerCreateAccount: "/create-account",
  customerVerifyEmail: "/verify-email",
  customerLogin: "/login",
  customerLoginVerification: "/login/verify",
  customerForgotPassword: "/forgot-password",
  customerResetPassword: "/reset-password",
  customerCompleteProfile: "/complete-profile",
  customerLinkGoogleAccount: "/link-google-account",
  customerDashboard: "/dashboard",
} as const;
