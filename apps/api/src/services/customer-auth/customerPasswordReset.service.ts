/**
 * Responsibility:
 * Handles customer password-reset codes, reset authorization, password replacement, and session revocation.
 */

import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/password.js";
import { HTTP_STATUS, HttpError } from "../../lib/httpError.js";
import {
  createPasswordResetAuthorizationToken,
  createSixDigitCode,
  getPasswordResetAuthorizationExpiresAt,
  hashToken,
  minutesFromNow,
  securelyMatchesTokenHash,
} from "../../lib/token.js";
import {
  sendCustomerPasswordChangedEmail,
  sendCustomerPasswordResetCodeEmail,
} from "../email.service.js";
import type {
  EmailInput,
  PasswordResetCodeInput,
  ResetPasswordInput,
} from "../../validators/customerAuth.validators.js";

const PASSWORD_RESET_SEND_COOLDOWN_MS = 60 * 1000;
const PASSWORD_RESET_MAX_EMAILS_PER_HOUR = 5;
const PASSWORD_RESET_MAX_FAILED_ATTEMPTS = 5;

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
    const consumedCode =
      await transaction.customerPasswordResetCode.updateMany({
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
