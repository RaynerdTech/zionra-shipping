/**
 * Responsibility:
 * Handles password login, login-code challenges, challenge resend, verification, and cancellation.
 */

import { prisma } from "../../lib/prisma.js";
import { verifyPassword } from "../../lib/password.js";
import {
  createCustomerSessionToken,
  getCustomerSessionExpiresAt,
  hashSessionToken,
} from "../../lib/auth.js";
import { HTTP_STATUS, HttpError } from "../../lib/httpError.js";
import {
  createCustomerLoginChallengeToken,
  createSixDigitCode,
  getCustomerLoginChallengeExpiresAt,
  getCustomerLoginCodeExpiresAt,
  hashToken,
  securelyMatchesTokenHash,
} from "../../lib/token.js";
import { sendCustomerLoginVerificationEmail } from "../email.service.js";
import type {
  LoginCustomerInput,
  LoginVerificationCodeInput,
} from "../../validators/customerAuth.validators.js";
import { toPublicCustomer } from "./customerAuth.shared.js";

const CUSTOMER_LOGIN_RESEND_COOLDOWN_MS = 30 * 1000;
const CUSTOMER_LOGIN_MAX_EMAILS = 5;
const CUSTOMER_LOGIN_MAX_CHALLENGES_PER_HOUR = 5;
const CUSTOMER_LOGIN_MAX_FAILED_ATTEMPTS = 5;

function maskCustomerEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return "Email address unavailable";
  }

  return `${localPart.slice(0, 1)}*****@${domain}`;
}

function customerLoginChallengeError() {
  return new HttpError(
    HTTP_STATUS.UNAUTHORIZED,
    "Your sign-in verification session has expired. Sign in again.",
    {
      code: "LOGIN_CHALLENGE_EXPIRED",
    },
  );
}

function customerLoginCodeError() {
  return new HttpError(
    HTTP_STATUS.BAD_REQUEST,
    "Invalid or expired sign-in code.",
    {
      code: "LOGIN_CODE_INVALID",
    },
  );
}

async function enforceCustomerLoginChallengeLimit(customerId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [latestChallenge, recentChallengeCount] = await Promise.all([
    prisma.customerLoginChallenge.findFirst({
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
    prisma.customerLoginChallenge.count({
      where: {
        customerId,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    }),
  ]);

  if (
    latestChallenge &&
    Date.now() - latestChallenge.createdAt.getTime() <
      CUSTOMER_LOGIN_RESEND_COOLDOWN_MS
  ) {
    throw new HttpError(
      429,
      "Please wait before requesting another sign-in code.",
      {
        code: "LOGIN_CHALLENGE_RATE_LIMITED",
      },
    );
  }

  if (recentChallengeCount >= CUSTOMER_LOGIN_MAX_CHALLENGES_PER_HOUR) {
    throw new HttpError(
      429,
      "Too many sign-in codes have been requested. Try again later.",
      {
        code: "LOGIN_CHALLENGE_RATE_LIMITED",
      },
    );
  }
}

async function findValidCustomerLoginChallenge(
  challengeToken: string | undefined,
) {
  if (!challengeToken) {
    throw customerLoginChallengeError();
  }

  const challenge = await prisma.customerLoginChallenge.findFirst({
    where: {
      tokenHash: hashToken(challengeToken),
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      customer: true,
    },
  });

  if (!challenge) {
    throw customerLoginChallengeError();
  }

  return challenge;
}

export async function startCustomerLogin(input: LoginCustomerInput) {
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

  await enforceCustomerLoginChallengeLimit(customer.id);

  const challengeToken = createCustomerLoginChallengeToken();
  const code = createSixDigitCode();
  const now = new Date();

  const challenge = await prisma.$transaction(async (transaction) => {
    await transaction.customerLoginChallenge.updateMany({
      where: {
        customerId: customer.id,
        usedAt: null,
      },
      data: {
        usedAt: now,
      },
    });

    return transaction.customerLoginChallenge.create({
      data: {
        customerId: customer.id,
        tokenHash: hashToken(challengeToken),
        codeHash: hashToken(code),
        codeExpiresAt: getCustomerLoginCodeExpiresAt(),
        expiresAt: getCustomerLoginChallengeExpiresAt(),
      },
    });
  });

  try {
    await sendCustomerLoginVerificationEmail({
      customerId: customer.id,
      loginChallengeId: challenge.id,
      emailSendCount: challenge.emailSendCount,
      firstName: customer.firstName,
      email: customer.email,
      code,
    });
  } catch (error) {
    await prisma.customerLoginChallenge.updateMany({
      where: {
        id: challenge.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    console.error("Customer login verification email delivery failed.", {
      customerId: customer.id,
      email: customer.email,
      error,
    });

    throw new HttpError(
      503,
      "We could not send a sign-in code right now. Please try again.",
      {
        code: "EMAIL_DELIVERY_FAILED",
      },
    );
  }

  return {
    message: "A sign-in verification code has been sent.",
    challengeToken,
  };
}

export async function getCustomerLoginChallenge(
  challengeToken: string | undefined,
) {
  const challenge = await findValidCustomerLoginChallenge(challengeToken);

  return {
    maskedEmail: maskCustomerEmail(challenge.customer.email),
    resendAvailableAt: new Date(
      challenge.updatedAt.getTime() + CUSTOMER_LOGIN_RESEND_COOLDOWN_MS,
    ).toISOString(),
  };
}

export async function verifyCustomerLoginCode(
  challengeToken: string | undefined,
  input: LoginVerificationCodeInput,
) {
  const challenge = await findValidCustomerLoginChallenge(challengeToken);

  if (challenge.codeExpiresAt <= new Date()) {
    throw customerLoginCodeError();
  }

  if (!securelyMatchesTokenHash(input.code, challenge.codeHash)) {
    const failedChallenge = await prisma.customerLoginChallenge.update({
      where: {
        id: challenge.id,
      },
      data: {
        failedAttempts: {
          increment: 1,
        },
      },
    });

    if (failedChallenge.failedAttempts >= CUSTOMER_LOGIN_MAX_FAILED_ATTEMPTS) {
      await prisma.customerLoginChallenge.updateMany({
        where: {
          id: challenge.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });
    }

    throw customerLoginCodeError();
  }

  const sessionToken = createCustomerSessionToken();
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const consumedChallenge =
      await transaction.customerLoginChallenge.updateMany({
        where: {
          id: challenge.id,
          usedAt: null,
          expiresAt: {
            gt: now,
          },
          codeExpiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      });

    if (consumedChallenge.count !== 1) {
      throw customerLoginChallengeError();
    }

    await transaction.customerSession.create({
      data: {
        customerId: challenge.customerId,
        tokenHash: hashSessionToken(sessionToken),
        expiresAt: getCustomerSessionExpiresAt(),
      },
    });
  });

  return {
    message: "Signed in successfully.",
    customer: toPublicCustomer(challenge.customer),
    sessionToken,
  };
}

export async function resendCustomerLoginCode(
  challengeToken: string | undefined,
) {
  const challenge = await findValidCustomerLoginChallenge(challengeToken);
  const cooldownEndsAt =
    challenge.updatedAt.getTime() + CUSTOMER_LOGIN_RESEND_COOLDOWN_MS;

  if (Date.now() < cooldownEndsAt) {
    throw new HttpError(
      429,
      "Please wait before requesting another sign-in code.",
      {
        code: "LOGIN_CODE_RESEND_COOLDOWN",
      },
    );
  }

  if (challenge.emailSendCount >= CUSTOMER_LOGIN_MAX_EMAILS) {
    throw new HttpError(
      429,
      "Too many sign-in codes have been requested. Sign in again later.",
      {
        code: "LOGIN_CODE_SEND_LIMIT",
      },
    );
  }

  const code = createSixDigitCode();

  const updatedChallenge = await prisma.customerLoginChallenge.update({
    where: {
      id: challenge.id,
    },
    data: {
      codeHash: hashToken(code),
      codeExpiresAt: getCustomerLoginCodeExpiresAt(),
      failedAttempts: 0,
      emailSendCount: {
        increment: 1,
      },
    },
  });

  try {
    await sendCustomerLoginVerificationEmail({
      customerId: challenge.customer.id,
      loginChallengeId: challenge.id,
      emailSendCount: updatedChallenge.emailSendCount,
      firstName: challenge.customer.firstName,
      email: challenge.customer.email,
      code,
    });
  } catch (error) {
    await prisma.customerLoginChallenge.updateMany({
      where: {
        id: challenge.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    console.error("Customer login verification email delivery failed.", {
      customerId: challenge.customer.id,
      email: challenge.customer.email,
      error,
    });

    throw new HttpError(
      503,
      "We could not send another sign-in code right now. Sign in again.",
      {
        code: "EMAIL_DELIVERY_FAILED",
      },
    );
  }

  return {
    message: "A new sign-in code has been sent.",
    resendAvailableAt: new Date(
      updatedChallenge.updatedAt.getTime() +
        CUSTOMER_LOGIN_RESEND_COOLDOWN_MS,
    ).toISOString(),
  };
}

export async function cancelCustomerLoginChallenge(
  challengeToken: string | undefined,
) {
  if (challengeToken) {
    await prisma.customerLoginChallenge.updateMany({
      where: {
        tokenHash: hashToken(challengeToken),
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }

  return {
    message: "Sign-in verification cancelled.",
  };
}
