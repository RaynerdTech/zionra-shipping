/**
 * Responsibility:
 * Contains customer authentication business logic.
 * This service creates accounts, sends and verifies email codes, manages rolling customer
 * sessions, and handles password recovery without knowing about Express request/response objects.
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
  createPasswordResetAuthorizationToken,
  createSixDigitCode,
  getPasswordResetAuthorizationExpiresAt,
  hashToken,
  minutesFromNow,
  securelyMatchesTokenHash,
} from "../lib/token.js";
import { env } from "../config/env.js";
import {
  sendCustomerPasswordChangedEmail,
  sendCustomerPasswordResetCodeEmail,
  sendCustomerVerificationEmail,
  sendCustomerWelcomeEmail,
} from "./email.service.js";
import type {
  EmailCodeInput,
  EmailInput,
  LoginCustomerInput,
  PasswordResetCodeInput,
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

async function createPasswordResetCode(customerId: string) {
  const code = createSixDigitCode();
  const now = new Date();

  const passwordResetCode = await prisma.$transaction(async (transaction) => {
    await transaction.customerPasswordResetAuthorization.updateMany({
      where: {
        customerId,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    await transaction.customerPasswordResetCode.updateMany({
      where: {
        customerId,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    return transaction.customerPasswordResetCode.create({
      data: {
        customerId,
        codeHash: hashToken(code),
        expiresAt: minutesFromNow(1),
      },
    });
  });

  return {
    code,
    passwordResetCodeId: passwordResetCode.id,
  };
}

const PASSWORD_RESET_SEND_COOLDOWN_MS = 60 * 1000;
const PASSWORD_RESET_MAX_EMAILS_PER_HOUR = 5;
const PASSWORD_RESET_MAX_FAILED_ATTEMPTS = 5;

async function canSendPasswordResetEmail(customerId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [latestCode, recentCodeCount] = await Promise.all([
    prisma.customerPasswordResetCode.findFirst({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    }),
    prisma.customerPasswordResetCode.count({
      where: {
        customerId,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    }),
  ]);

  if (
    latestCode &&
    Date.now() - latestCode.createdAt.getTime() <
      PASSWORD_RESET_SEND_COOLDOWN_MS
  ) {
    return false;
  }

  return recentCodeCount < PASSWORD_RESET_MAX_EMAILS_PER_HOUR;
}

function passwordResetCodeError() {
  return new HttpError(
    HTTP_STATUS.BAD_REQUEST,
    "Invalid or expired password reset code.",
    {
      code: "PASSWORD_RESET_CODE_INVALID",
    },
  );
}

function passwordResetAuthorizationError() {
  return new HttpError(
    HTTP_STATUS.UNAUTHORIZED,
    "Your password reset session has expired. Start again.",
    {
      code: "PASSWORD_RESET_SESSION_EXPIRED",
    },
  );
}

async function findValidPasswordResetAuthorization(
  resetAuthorizationToken: string | undefined,
) {
  if (!resetAuthorizationToken) {
    throw passwordResetAuthorizationError();
  }

  const authorization =
    await prisma.customerPasswordResetAuthorization.findFirst({
      where: {
        tokenHash: hashToken(resetAuthorizationToken),
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        customer: true,
      },
    });

  if (!authorization) {
    throw passwordResetAuthorizationError();
  }

  return authorization;
}

export async function createCustomerSession(customerId: string) {
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

export async function loginCustomer(input: LoginCustomerInput) {
  const customer = await prisma.customer.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!customer || !customer.passwordHash) {
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
  const genericMessage =
    "If an account exists for this email, a password reset code has been sent.";
  const customer = await prisma.customer.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!customer || !customer.passwordHash || !customer.emailVerifiedAt) {
    return {
      message: genericMessage,
    };
  }

  const emailCanBeSent = await canSendPasswordResetEmail(customer.id);

  if (!emailCanBeSent) {
    return {
      message: genericMessage,
    };
  }

  const passwordReset = await createPasswordResetCode(customer.id);

  try {
    await sendCustomerPasswordResetCodeEmail({
      customerId: customer.id,
      passwordResetCodeId: passwordReset.passwordResetCodeId,
      firstName: customer.firstName,
      email: customer.email,
      code: passwordReset.code,
    });
  } catch (error) {
    await prisma.customerPasswordResetCode.updateMany({
      where: {
        id: passwordReset.passwordResetCodeId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    console.error("Customer password-reset email delivery failed.", {
      customerId: customer.id,
      email: customer.email,
      error,
    });
  }

  return {
    message: genericMessage,
  };
}

export async function verifyCustomerPasswordResetCode(
  input: PasswordResetCodeInput,
) {
  const customer = await prisma.customer.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!customer || !customer.passwordHash || !customer.emailVerifiedAt) {
    throw passwordResetCodeError();
  }

  const passwordResetCode = await prisma.customerPasswordResetCode.findFirst({
    where: {
      customerId: customer.id,
      usedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!passwordResetCode || passwordResetCode.expiresAt <= new Date()) {
    throw passwordResetCodeError();
  }

  if (!securelyMatchesTokenHash(input.code, passwordResetCode.codeHash)) {
    const failedCode = await prisma.customerPasswordResetCode.update({
      where: {
        id: passwordResetCode.id,
      },
      data: {
        failedAttempts: {
          increment: 1,
        },
      },
    });

    if (failedCode.failedAttempts >= PASSWORD_RESET_MAX_FAILED_ATTEMPTS) {
      await prisma.customerPasswordResetCode.updateMany({
        where: {
          id: failedCode.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });
    }

    throw passwordResetCodeError();
  }

  const resetAuthorizationToken =
    createPasswordResetAuthorizationToken();
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const consumedCode = await transaction.customerPasswordResetCode.updateMany({
      where: {
        id: passwordResetCode.id,
        customerId: customer.id,
        usedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      data: {
        usedAt: now,
      },
    });

    if (consumedCode.count !== 1) {
      throw passwordResetCodeError();
    }

    await transaction.customerPasswordResetAuthorization.updateMany({
      where: {
        customerId: customer.id,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    await transaction.customerPasswordResetAuthorization.create({
      data: {
        customerId: customer.id,
        passwordResetCodeId: passwordResetCode.id,
        tokenHash: hashToken(resetAuthorizationToken),
        expiresAt: getPasswordResetAuthorizationExpiresAt(),
      },
    });
  });

  return {
    message: "Reset code verified.",
    resetAuthorizationToken,
  };
}

export async function getCustomerPasswordResetSession(
  resetAuthorizationToken: string | undefined,
) {
  await findValidPasswordResetAuthorization(resetAuthorizationToken);

  return {
    message: "Password reset session is valid.",
  };
}

export async function resetCustomerPassword(
  resetAuthorizationToken: string | undefined,
  input: ResetPasswordInput,
) {
  const authorization = await findValidPasswordResetAuthorization(
    resetAuthorizationToken,
  );
  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const consumedAuthorization =
      await transaction.customerPasswordResetAuthorization.updateMany({
        where: {
          id: authorization.id,
          usedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      });

    if (consumedAuthorization.count !== 1) {
      throw passwordResetAuthorizationError();
    }

    await transaction.customer.update({
      where: {
        id: authorization.customerId,
      },
      data: {
        passwordHash,
      },
    });

    await transaction.customerSession.updateMany({
      where: {
        customerId: authorization.customerId,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
      },
    });

    await transaction.customerPasswordResetCode.updateMany({
      where: {
        customerId: authorization.customerId,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });
  });

  try {
    await sendCustomerPasswordChangedEmail({
      customerId: authorization.customer.id,
      passwordResetCodeId: authorization.passwordResetCodeId,
      firstName: authorization.customer.firstName,
      email: authorization.customer.email,
    });
  } catch (error) {
    console.error("Customer password-change email delivery failed.", {
      customerId: authorization.customer.id,
      email: authorization.customer.email,
      error,
    });
  }

  return {
    message: "Password updated successfully. Please sign in again.",
  };
}
