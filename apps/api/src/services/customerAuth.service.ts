/**
 * Responsibility:
 * Contains customer authentication business logic.
 * This service creates accounts, verifies email codes, manages rolling customer sessions,
 * and handles password recovery without knowing about Express request/response objects.
 */

import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  createCustomerSessionToken,
  getCustomerSessionExpiresAt,
  hashSessionToken,
} from "../lib/auth.js";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";
import {
  createSixDigitCode,
  hashToken,
  minutesFromNow,
} from "../lib/token.js";
import { env } from "../config/env.js";
import type {
  EmailCodeInput,
  EmailInput,
  LoginCustomerInput,
  RegisterCustomerInput,
  ResetPasswordInput,
} from "../validators/customerAuth.validators.js";

type PublicCustomerInput = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  countryOfResidence: string;
  referralSource: string | null;
  marketingOptIn: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

function toPublicCustomer(customer: PublicCustomerInput) {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phoneCountryCode: customer.phoneCountryCode,
    phoneNumber: customer.phoneNumber,
    countryOfResidence: customer.countryOfResidence,
    referralSource: customer.referralSource,
    marketingOptIn: customer.marketingOptIn,
    emailVerified: Boolean(customer.emailVerifiedAt),
    createdAt: customer.createdAt,
  };
}

function developmentCodePayload(code: string) {
  if (env.NODE_ENV !== "development") {
    return {};
  }

  return {
    dev: {
      code,
    },
  };
}

async function createEmailVerificationCode(customerId: string) {
  const code = createSixDigitCode();

  await prisma.customerEmailVerificationCode.updateMany({
    where: {
      customerId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  await prisma.customerEmailVerificationCode.create({
    data: {
      customerId,
      codeHash: hashToken(code),
      expiresAt: minutesFromNow(1),
    },
  });

  return code;
}

async function createPasswordResetCode(customerId: string) {
  const code = createSixDigitCode();

  await prisma.customerPasswordResetCode.updateMany({
    where: {
      customerId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  await prisma.customerPasswordResetCode.create({
    data: {
      customerId,
      codeHash: hashToken(code),
      expiresAt: minutesFromNow(1),
    },
  });

  return code;
}

async function createCustomerSession(customerId: string) {
  const sessionToken = createCustomerSessionToken();

  await prisma.customerSession.create({
    data: {
      customerId,
      tokenHash: hashSessionToken(sessionToken),
      expiresAt: getCustomerSessionExpiresAt(),
    },
  });

  return sessionToken;
}

export async function registerCustomer(input: RegisterCustomerInput) {
  const existingCustomer = await prisma.customer.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingCustomer) {
    throw new HttpError(
      HTTP_STATUS.CONFLICT,
      "An account with this email already exists.",
      {
        errors: {
          email: "An account with this email already exists.",
        },
      },
    );
  }

  const passwordHash = await hashPassword(input.password);

  const customer = await prisma.customer.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phoneCountryCode: input.phoneCountryCode,
      phoneNumber: input.phoneNumber,
      passwordHash,
      countryOfResidence: input.countryOfResidence,
      referralSource: input.referralSource,
      acceptedTermsAt: new Date(),
      marketingOptIn: input.marketingOptIn,
    },
  });

  const code = await createEmailVerificationCode(customer.id);

  console.log(`Customer email verification code for ${input.email}: ${code}`);

  return {
    message: "Account created. Verify your email address to continue.",
    customer: toPublicCustomer(customer),
    ...developmentCodePayload(code),
  };
}

export async function verifyCustomerEmail(input: EmailCodeInput) {
  const customer = await prisma.customer.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!customer) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid or expired verification code.",
    );
  }

  const verificationCode = await prisma.customerEmailVerificationCode.findFirst({
    where: {
      customerId: customer.id,
      codeHash: hashToken(input.code),
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!verificationCode) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid or expired verification code.",
    );
  }

  await prisma.$transaction([
    prisma.customerEmailVerificationCode.update({
      where: {
        id: verificationCode.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    }),
  ]);

  return {
    message: "Email verified successfully.",
  };
}

export async function resendCustomerVerificationCode(input: EmailInput) {
  const customer = await prisma.customer.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!customer) {
    return {
      message:
        "If an account exists for this email, a verification code has been sent.",
    };
  }

  if (customer.emailVerifiedAt) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "This email address is already verified.",
    );
  }

  const code = await createEmailVerificationCode(customer.id);

  console.log(`Customer email verification code for ${input.email}: ${code}`);

  return {
    message: "Verification code sent.",
    ...developmentCodePayload(code),
  };
}

export async function loginCustomer(input: LoginCustomerInput) {
  const customer = await prisma.customer.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!customer) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password.");
  }

  const passwordIsValid = await verifyPassword(
    input.password,
    customer.passwordHash,
  );

  if (!passwordIsValid) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password.");
  }

  if (!customer.emailVerifiedAt) {
    throw new HttpError(
      HTTP_STATUS.FORBIDDEN,
      "Please verify your email address before signing in.",
      {
        code: "EMAIL_NOT_VERIFIED",
      },
    );
  }

  const sessionToken = await createCustomerSession(customer.id);

  return {
    message: "Signed in successfully.",
    customer: toPublicCustomer(customer),
    sessionToken,
  };
}

export async function logoutCustomer(sessionToken: string | undefined) {
  if (sessionToken) {
    await prisma.customerSession.updateMany({
      where: {
        tokenHash: hashSessionToken(sessionToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  return {
    message: "Signed out successfully.",
  };
}

export async function getCurrentCustomer(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {
    throw new HttpError(
      HTTP_STATUS.UNAUTHORIZED,
      "Customer account no longer exists.",
    );
  }

  return {
    customer: toPublicCustomer(customer),
  };
}

export async function sendCustomerPasswordResetCode(input: EmailInput) {
  const customer = await prisma.customer.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!customer) {
    return {
      message:
        "If an account exists for this email, a password reset code has been sent.",
    };
  }

  const code = await createPasswordResetCode(customer.id);

  console.log(`Customer password reset code for ${input.email}: ${code}`);

  return {
    message: "Password reset code sent.",
    ...developmentCodePayload(code),
  };
}

export async function resetCustomerPassword(input: ResetPasswordInput) {
  const customer = await prisma.customer.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!customer) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid or expired password reset code.",
    );
  }

  const passwordResetCode = await prisma.customerPasswordResetCode.findFirst({
    where: {
      customerId: customer.id,
      codeHash: hashToken(input.code),
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!passwordResetCode) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid or expired password reset code.",
    );
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.customerPasswordResetCode.update({
      where: {
        id: passwordResetCode.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        passwordHash,
      },
    }),
    prisma.customerSession.updateMany({
      where: {
        customerId: customer.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
  ]);

  return {
    message: "Password updated successfully. Please sign in again.",
  };
}