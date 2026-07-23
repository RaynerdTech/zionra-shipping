/**
 * Responsibility:
 * Handles customer registration, email-verification code creation, verification, and resend logic.
 */

import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/password.js";
import { HTTP_STATUS, HttpError } from "../../lib/httpError.js";
import {
  createSixDigitCode,
  hashToken,
  minutesFromNow,
} from "../../lib/token.js";
import {
  sendCustomerVerificationEmail,
  sendCustomerWelcomeEmail,
} from "../email.service.js";
import type {
  EmailCodeInput,
  EmailInput,
  RegisterCustomerInput,
} from "../../validators/customerAuth.validators.js";
import {
  developmentCodePayload,
  toPublicCustomer,
} from "./customerAuth.shared.js";

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

  const verificationCode = await prisma.customerEmailVerificationCode.create({
    data: {
      customerId,
      codeHash: hashToken(code),
      expiresAt: minutesFromNow(1),
    },
  });

  return {
    code,
    verificationCodeId: verificationCode.id,
  };
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

  const verification = await createEmailVerificationCode(customer.id);
  let verificationEmailSent = true;

  try {
    await sendCustomerVerificationEmail({
      customerId: customer.id,
      verificationCodeId: verification.verificationCodeId,
      firstName: customer.firstName,
      email: customer.email,
      code: verification.code,
    });
  } catch (error) {
    verificationEmailSent = false;
    console.error("Customer verification email delivery failed.", {
      customerId: customer.id,
      email: customer.email,
      error,
    });
  }

  return {
    message: verificationEmailSent
      ? "Account created. Verify your email address to continue."
      : "Account created, but the verification email could not be delivered. Request a new code.",
    customer: toPublicCustomer(customer),
    verificationEmailSent,
    ...developmentCodePayload(verification.code),
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

  if (customer.emailVerifiedAt) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "This email address is already verified.",
      {
        code: "EMAIL_ALREADY_VERIFIED",
      },
    );
  }

  const verificationCode =
    await prisma.customerEmailVerificationCode.findFirst({
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

  try {
    await sendCustomerWelcomeEmail({
      customerId: customer.id,
      firstName: customer.firstName,
      email: customer.email,
      accountMethod: "password",
    });
  } catch (error) {
    console.error("Customer welcome email delivery failed.", {
      customerId: customer.id,
      email: customer.email,
      error,
    });
  }

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

  const verification = await createEmailVerificationCode(customer.id);

  try {
    await sendCustomerVerificationEmail({
      customerId: customer.id,
      verificationCodeId: verification.verificationCodeId,
      firstName: customer.firstName,
      email: customer.email,
      code: verification.code,
    });
  } catch (error) {
    console.error("Customer verification email delivery failed.", {
      customerId: customer.id,
      email: customer.email,
      error,
    });

    throw new HttpError(
      503,
      "We could not send a verification code right now. Please try again.",
      {
        code: "EMAIL_DELIVERY_FAILED",
      },
    );
  }

  return {
    message: "Verification code sent.",
    ...developmentCodePayload(verification.code),
  };
}
