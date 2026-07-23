/**
 * Responsibility:
 * Preserves the public customer-auth service API while delegating each auth area
 * to a focused service module.
 */

export {
  registerCustomer,
  resendCustomerVerificationCode,
  verifyCustomerEmail,
} from "./customer-auth/customerRegistration.service.js";

export {
  cancelCustomerLoginChallenge,
  getCustomerLoginChallenge,
  resendCustomerLoginCode,
  startCustomerLogin,
  verifyCustomerLoginCode,
} from "./customer-auth/customerLogin.service.js";

export {
  createCustomerSession,
  getCurrentCustomer,
  logoutCustomer,
} from "./customer-auth/customerSession.service.js";

export {
  getCustomerPasswordResetSession,
  resetCustomerPassword,
  sendCustomerPasswordResetCode,
  verifyCustomerPasswordResetCode,
} from "./customer-auth/customerPasswordReset.service.js";
