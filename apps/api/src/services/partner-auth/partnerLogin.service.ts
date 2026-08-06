/**
 * Responsibility:
 * Handles shipping-partner password login, email-code challenges, resend,
 * verification, cancellation, and the authenticated partner session handoff.
 */

import { HTTP_STATUS, HttpError } from "../../lib/httpError.js";
import {
  createPartnerLoginChallengeToken,
  createPartnerOnboardingToken,
  getPartnerLoginChallengeExpiresAt,
  getPartnerLoginCodeExpiresAt,
  getPartnerOnboardingExpiresAt,
  hashPartnerOnboardingToken,
} from "../../lib/partnerAuth.js";
import { verifyPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import {
  createSixDigitCode,
  hashToken,
  securelyMatchesTokenHash,
} from "../../lib/token.js";
import type {
  LoginShippingPartnerInput,
  PartnerLoginVerificationCodeInput,
} from "../../validators/partnerAuth.validators.js";
import { sendPartnerLoginVerificationEmail } from "../email.service.js";
import { resolvePartnerDestination } from "./partnerDestination.service.js";

const PARTNER_LOGIN_RESEND_COOLDOWN_MS = 30 * 1000;
const PARTNER_LOGIN_MAX_EMAILS = 5;
const PARTNER_LOGIN_MAX_CHALLENGES_PER_HOUR = 5;
const PARTNER_LOGIN_MAX_FAILED_ATTEMPTS = 5;

function maskPartnerEmail(email: string) {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "Email address unavailable";
  return `${localPart.slice(0, 1)}*****@${domain}`;
}

function partnerLoginChallengeError() {
  return new HttpError(
    HTTP_STATUS.UNAUTHORIZED,
    "Your sign-in verification session has expired. Sign in again.",
    { code: "PARTNER_LOGIN_CHALLENGE_EXPIRED" },
  );
}

function partnerLoginCodeError() {
  return new HttpError(
    HTTP_STATUS.BAD_REQUEST,
    "Invalid or expired sign-in code.",
    { code: "PARTNER_LOGIN_CODE_INVALID" },
  );
}

async function enforcePartnerLoginChallengeLimit(partnerId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [latestChallenge, recentChallengeCount] = await Promise.all([
    prisma.shippingPartnerLoginChallenge.findFirst({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.shippingPartnerLoginChallenge.count({
      where: { partnerId, createdAt: { gte: oneHourAgo } },
    }),
  ]);

  if (
    latestChallenge &&
    Date.now() - latestChallenge.createdAt.getTime() <
      PARTNER_LOGIN_RESEND_COOLDOWN_MS
  ) {
    throw new HttpError(
      429,
      "Please wait before requesting another sign-in code.",
      { code: "PARTNER_LOGIN_CHALLENGE_RATE_LIMITED" },
    );
  }

  if (recentChallengeCount >= PARTNER_LOGIN_MAX_CHALLENGES_PER_HOUR) {
    throw new HttpError(
      429,
      "Too many sign-in codes have been requested. Try again later.",
      { code: "PARTNER_LOGIN_CHALLENGE_RATE_LIMITED" },
    );
  }
}

async function findValidPartnerLoginChallenge(
  challengeToken: string | undefined,
) {
  if (!challengeToken) throw partnerLoginChallengeError();

  const challenge = await prisma.shippingPartnerLoginChallenge.findFirst({
    where: {
      tokenHash: hashToken(challengeToken),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { partner: true },
  });

  if (!challenge) throw partnerLoginChallengeError();
  return challenge;
}


export async function startPartnerLogin(input: LoginShippingPartnerInput) {
  let partner = await prisma.shippingPartner.findUnique({
    where: { email: input.email },
  });

  if (!partner || !partner.passwordHash) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password.");
  }

  if (!(await verifyPassword(input.password, partner.passwordHash))) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password.");
  }

  if (!partner.emailVerifiedAt) {
    throw new HttpError(
      HTTP_STATUS.FORBIDDEN,
      "Please verify your email address before signing in.",
      { code: "EMAIL_NOT_VERIFIED" },
    );
  }

  if (input.marketingOptIn && !partner.marketingOptIn) {
    partner = await prisma.shippingPartner.update({
      where: { id: partner.id },
      data: { marketingOptIn: true },
    });
  }

  await enforcePartnerLoginChallengeLimit(partner.id);

  const challengeToken = createPartnerLoginChallengeToken();
  const code = createSixDigitCode();
  const now = new Date();

  const challenge = await prisma.$transaction(async (transaction) => {
    await transaction.shippingPartnerLoginChallenge.updateMany({
      where: { partnerId: partner.id, usedAt: null },
      data: { usedAt: now },
    });

    return transaction.shippingPartnerLoginChallenge.create({
      data: {
        partnerId: partner.id,
        tokenHash: hashToken(challengeToken),
        codeHash: hashToken(code),
        codeExpiresAt: getPartnerLoginCodeExpiresAt(),
        expiresAt: getPartnerLoginChallengeExpiresAt(),
      },
    });
  });

  try {
    await sendPartnerLoginVerificationEmail({
      partnerId: partner.id,
      loginChallengeId: challenge.id,
      emailSendCount: challenge.emailSendCount,
      firstName: partner.firstName,
      email: partner.email,
      code,
    });
  } catch (error) {
    await prisma.shippingPartnerLoginChallenge.updateMany({
      where: { id: challenge.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    console.error("Partner login verification email delivery failed.", {
      partnerId: partner.id,
      email: partner.email,
      error,
    });

    throw new HttpError(
      503,
      "We could not send a sign-in code right now. Please try again.",
      { code: "EMAIL_DELIVERY_FAILED" },
    );
  }

  return {
    message: "A sign-in verification code has been sent.",
    challengeToken,
  };
}

export async function getPartnerLoginChallenge(
  challengeToken: string | undefined,
) {
  const challenge = await findValidPartnerLoginChallenge(challengeToken);

  return {
    maskedEmail: maskPartnerEmail(challenge.partner.email),
    resendAvailableAt: new Date(
      challenge.updatedAt.getTime() + PARTNER_LOGIN_RESEND_COOLDOWN_MS,
    ).toISOString(),
  };
}

export async function verifyPartnerLoginCode(
  challengeToken: string | undefined,
  input: PartnerLoginVerificationCodeInput,
) {
  const challenge = await findValidPartnerLoginChallenge(challengeToken);

  if (challenge.codeExpiresAt <= new Date()) throw partnerLoginCodeError();

  if (!securelyMatchesTokenHash(input.code, challenge.codeHash)) {
    const failedChallenge = await prisma.shippingPartnerLoginChallenge.update({
      where: { id: challenge.id },
      data: { failedAttempts: { increment: 1 } },
    });

    if (failedChallenge.failedAttempts >= PARTNER_LOGIN_MAX_FAILED_ATTEMPTS) {
      await prisma.shippingPartnerLoginChallenge.updateMany({
        where: { id: challenge.id, usedAt: null },
        data: { usedAt: new Date() },
      });
    }

    throw partnerLoginCodeError();
  }

  const sessionToken = createPartnerOnboardingToken();
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const consumed =
      await transaction.shippingPartnerLoginChallenge.updateMany({
        where: {
          id: challenge.id,
          usedAt: null,
          expiresAt: { gt: now },
          codeExpiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

    if (consumed.count !== 1) throw partnerLoginChallengeError();

    await transaction.shippingPartnerOnboardingSession.create({
      data: {
        partnerId: challenge.partnerId,
        tokenHash: hashPartnerOnboardingToken(sessionToken),
        expiresAt: getPartnerOnboardingExpiresAt(),
      },
    });
  });

  return {
    message: "Signed in successfully.",
    sessionToken,
    redirectTo: await resolvePartnerDestination(challenge.partner),
  };
}

export async function resendPartnerLoginCode(
  challengeToken: string | undefined,
) {
  const challenge = await findValidPartnerLoginChallenge(challengeToken);
  const cooldownEndsAt =
    challenge.updatedAt.getTime() + PARTNER_LOGIN_RESEND_COOLDOWN_MS;

  if (Date.now() < cooldownEndsAt) {
    throw new HttpError(
      429,
      "Please wait before requesting another sign-in code.",
      { code: "PARTNER_LOGIN_CODE_RESEND_COOLDOWN" },
    );
  }

  if (challenge.emailSendCount >= PARTNER_LOGIN_MAX_EMAILS) {
    throw new HttpError(
      429,
      "Too many sign-in codes have been requested. Sign in again later.",
      { code: "PARTNER_LOGIN_CODE_SEND_LIMIT" },
    );
  }

  const code = createSixDigitCode();
  const updatedChallenge = await prisma.shippingPartnerLoginChallenge.update({
    where: { id: challenge.id },
    data: {
      codeHash: hashToken(code),
      codeExpiresAt: getPartnerLoginCodeExpiresAt(),
      failedAttempts: 0,
      emailSendCount: { increment: 1 },
    },
  });

  try {
    await sendPartnerLoginVerificationEmail({
      partnerId: challenge.partner.id,
      loginChallengeId: challenge.id,
      emailSendCount: updatedChallenge.emailSendCount,
      firstName: challenge.partner.firstName,
      email: challenge.partner.email,
      code,
    });
  } catch (error) {
    await prisma.shippingPartnerLoginChallenge.updateMany({
      where: { id: challenge.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    console.error("Partner login verification email delivery failed.", {
      partnerId: challenge.partner.id,
      email: challenge.partner.email,
      error,
    });

    throw new HttpError(
      503,
      "We could not send another sign-in code right now. Sign in again.",
      { code: "EMAIL_DELIVERY_FAILED" },
    );
  }

  return {
    message: "A new sign-in code has been sent.",
    resendAvailableAt: new Date(
      updatedChallenge.updatedAt.getTime() +
        PARTNER_LOGIN_RESEND_COOLDOWN_MS,
    ).toISOString(),
  };
}

export async function cancelPartnerLoginChallenge(
  challengeToken: string | undefined,
) {
  if (challengeToken) {
    await prisma.shippingPartnerLoginChallenge.updateMany({
      where: { tokenHash: hashToken(challengeToken), usedAt: null },
      data: { usedAt: new Date() },
    });
  }

  return { message: "Sign-in verification cancelled." };
}
