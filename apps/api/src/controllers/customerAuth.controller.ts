/**
 * Responsibility:
 * Handles HTTP requests and responses for customer authentication.
 * Controllers validate incoming data, call services, set/clear cookies,
 * and return consistent API responses.
 */

import type { Request, Response } from "express";
import {
  clearCustomerAuthCookie,
  clearCustomerPasswordResetAuthorizationCookie,
  setCustomerAuthCookie,
  setCustomerPasswordResetAuthorizationCookie,
} from "../lib/cookies.js";
import { AUTH_COOKIE_NAME } from "../lib/auth.js";
import { CUSTOMER_PASSWORD_RESET_AUTH_COOKIE_NAME } from "../lib/token.js";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";
import {
  getCurrentCustomer,
  getCustomerPasswordResetSession,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  resendCustomerVerificationCode,
  resetCustomerPassword,
  sendCustomerPasswordResetCode,
  verifyCustomerEmail,
  verifyCustomerPasswordResetCode,
} from "../services/customerAuth.service.js";
import {
  validateEmailCodeInput,
  validateEmailInput,
  validateLoginCustomer,
  validatePasswordResetCode,
  validateRegisterCustomer,
  validateResetPassword,
} from "../validators/customerAuth.validators.js";

function sendValidationError(res: Response, errors: Record<string, string>) {
  res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
    message: "Validation failed.",
    errors,
  });
}

function handleControllerError(
  res: Response,
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
      ...(error.errors ? { errors: error.errors } : {}),
    });

    return;
  }

  console.error(fallbackMessage, error);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: fallbackMessage,
  });
}

export async function registerCustomerController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = validateRegisterCustomer(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const result = await registerCustomer(validation.data);

    res.status(HTTP_STATUS.CREATED).json(result);
  } catch (error) {
    handleControllerError(
      res,
      error,
      "Something went wrong while creating your account.",
    );
  }
}

export async function verifyCustomerEmailController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = validateEmailCodeInput(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const result = await verifyCustomerEmail(validation.data);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    handleControllerError(
      res,
      error,
      "Something went wrong while verifying your email.",
    );
  }
}

export async function resendCustomerVerificationCodeController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = validateEmailInput(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const result = await resendCustomerVerificationCode(validation.data);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    handleControllerError(
      res,
      error,
      "Something went wrong while sending the verification code.",
    );
  }
}

export async function loginCustomerController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = validateLoginCustomer(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const result = await loginCustomer(validation.data);

    setCustomerAuthCookie(res, result.sessionToken);

    res.status(HTTP_STATUS.OK).json({
      message: result.message,
      customer: result.customer,
    });
  } catch (error) {
    handleControllerError(
      res,
      error,
      "Something went wrong while signing in.",
    );
  }
}

export async function logoutCustomerController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

    await logoutCustomer(token);

    clearCustomerAuthCookie(res);

    res.status(HTTP_STATUS.OK).json({
      message: "Signed out successfully.",
    });
  } catch (error) {
    handleControllerError(
      res,
      error,
      "Something went wrong while signing out.",
    );
  }
}

export async function getCurrentCustomerController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const customerId = req.customerAuth?.customerId;

    if (!customerId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "Authentication required.",
      });

      return;
    }

    const result = await getCurrentCustomer(customerId);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    if (error instanceof HttpError && error.statusCode === HTTP_STATUS.UNAUTHORIZED) {
      clearCustomerAuthCookie(res);
    }

    handleControllerError(
      res,
      error,
      "Something went wrong while loading your account.",
    );
  }
}

export async function forgotPasswordController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = validateEmailInput(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    clearCustomerPasswordResetAuthorizationCookie(res);

    const result = await sendCustomerPasswordResetCode(validation.data);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    handleControllerError(
      res,
      error,
      "Something went wrong while sending the password reset code.",
    );
  }
}

export async function verifyPasswordResetCodeController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = validatePasswordResetCode(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const result = await verifyCustomerPasswordResetCode(validation.data);

    setCustomerPasswordResetAuthorizationCookie(
      res,
      result.resetAuthorizationToken,
    );

    res.status(HTTP_STATUS.OK).json({
      message: result.message,
      redirectTo: "/reset-password",
    });
  } catch (error) {
    handleControllerError(
      res,
      error,
      "Something went wrong while verifying the password reset code.",
    );
  }
}

export async function getPasswordResetSessionController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const resetAuthorizationToken = req.cookies?.[
      CUSTOMER_PASSWORD_RESET_AUTH_COOKIE_NAME
    ] as string | undefined;
    const result = await getCustomerPasswordResetSession(
      resetAuthorizationToken,
    );

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    clearCustomerPasswordResetAuthorizationCookie(res);

    handleControllerError(
      res,
      error,
      "Something went wrong while loading your password reset session.",
    );
  }
}

export async function resetPasswordController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const validation = validateResetPassword(req.body);

    if (!validation.success) {
      sendValidationError(res, validation.errors);
      return;
    }

    const resetAuthorizationToken = req.cookies?.[
      CUSTOMER_PASSWORD_RESET_AUTH_COOKIE_NAME
    ] as string | undefined;
    const result = await resetCustomerPassword(
      resetAuthorizationToken,
      validation.data,
    );

    clearCustomerPasswordResetAuthorizationCookie(res);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    if (
      error instanceof HttpError &&
      error.code === "PASSWORD_RESET_SESSION_EXPIRED"
    ) {
      clearCustomerPasswordResetAuthorizationCookie(res);
    }

    handleControllerError(
      res,
      error,
      "Something went wrong while resetting your password.",
    );
  }
}
