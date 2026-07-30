/**
 * Responsibility:
 * Handles shipping-partner password reset codes, reset authorization,
 * password replacement, session revocation, and security notifications.
 */

import { HTTP_STATUS, HttpError } from "../../lib/httpError.js";
import {
  createPartnerPasswordResetAuthorizationToken,
  getPartnerPasswordResetAuthorizationExpiresAt,
} from "../../lib/partnerAuth.js";
import { hashPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import {
  createSixDigitCode,
  hashToken,
  minutesFromNow,
  securelyMatchesTokenHash,
} from "../../lib/token.js";
import type {
  PartnerEmailInput,
  PartnerPasswordResetCodeInput,
  ResetShippingPartnerPasswordInput,
} from "../../validators/partnerAuth.validators.js";
import {
  sendPartnerPasswordChangedEmail,
  sendPartnerPasswordResetCodeEmail,
} from "../email.service.js";

const PASSWORD_RESET_SEND_COOLDOWN_MS = 60 * 1000;
const PASSWORD_RESET_MAX_EMAILS_PER_HOUR = 5;
const PASSWORD_RESET_MAX_FAILED_ATTEMPTS = 5;

async function createPartnerPasswordResetCode(partnerId: string) {
  const code = createSixDigitCode();
  const now = new Date();

  const record = await prisma.$transaction(async (transaction) => {
    await transaction.shippingPartnerPasswordResetAuthorization.updateMany({
      where: { partnerId, usedAt: null },
      data: { usedAt: now },
    });

    await transaction.shippingPartnerPasswordResetCode.updateMany({
      where: { partnerId, usedAt: null },
      data: { usedAt: now },
    });

    return transaction.shippingPartnerPasswordResetCode.create({
      data: {
        partnerId,
        codeHash: hashToken(code),
        expiresAt: minutesFromNow(1),
      },
    });
  });

  return { code, passwordResetCodeId: record.id };
}

async function canSendPartnerPasswordResetEmail(partnerId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [latestCode, recentCodeCount] = await Promise.all([
    prisma.shippingPartnerPasswordResetCode.findFirst({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.shippingPartnerPasswordResetCode.count({
      where: { partnerId, createdAt: { gte: oneHourAgo } },
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

function partnerPasswordResetCodeError() {
  return new HttpError(
    HTTP_STATUS.BAD_REQUEST,
    "Invalid or expired password reset code.",
    { code: "PARTNER_PASSWORD_RESET_CODE_INVALID" },
  );
}

function partnerPasswordResetAuthorizationError() {
  return new HttpError(
    HTTP_STATUS.UNAUTHORIZED,
    "Your password reset session has expired. Start again.",
    { code: "PARTNER_PASSWORD_RESET_SESSION_EXPIRED" },
  );
}

async function findValidPartnerPasswordResetAuthorization(
  authorizationToken: string | undefined,
) {
  if (!authorizationToken) throw partnerPasswordResetAuthorizationError();

  const authorization =
    await prisma.shippingPartnerPasswordResetAuthorization.findFirst({
      where: {
        tokenHash: hashToken(authorizationToken),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { partner: true },
    });

  if (!authorization) throw partnerPasswordResetAuthorizationError();
  return authorization;
}

export async function sendPartnerPasswordResetCode(input: PartnerEmailInput) {
  const genericMessage =
    "If an account exists for this email, a password reset code has been sent.";
  const partner = await prisma.shippingPartner.findUnique({
    where: { email: input.email },
  });

  if (!partner || !partner.passwordHash || !partner.emailVerifiedAt) {
    return { message: genericMessage };
  }

  if (!(await canSendPartnerPasswordResetEmail(partner.id))) {
    return { message: genericMessage };
  }

  const reset = await createPartnerPasswordResetCode(partner.id);

  try {
    await sendPartnerPasswordResetCodeEmail({
      partnerId: partner.id,
      passwordResetCodeId: reset.passwordResetCodeId,
      firstName: partner.firstName,
      email: partner.email,
      code: reset.code,
    });
  } catch (error) {
    await prisma.shippingPartnerPasswordResetCode.updateMany({
      where: { id: reset.passwordResetCodeId, usedAt: null },
      data: { usedAt: new Date() },
    });

    console.error("Partner password-reset email delivery failed.", {
      partnerId: partner.id,
      email: partner.email,
      error,
    });
  }

  return { message: genericMessage };
}

export async function verifyPartnerPasswordResetCode(
  input: PartnerPasswordResetCodeInput,
) {
  const partner = await prisma.shippingPartner.findUnique({
    where: { email: input.email },
  });

  if (!partner || !partner.passwordHash || !partner.emailVerifiedAt) {
    throw partnerPasswordResetCodeError();
  }

  const resetCode = await prisma.shippingPartnerPasswordResetCode.findFirst({
    where: { partnerId: partner.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!resetCode || resetCode.expiresAt <= new Date()) {
    throw partnerPasswordResetCodeError();
  }

  if (!securelyMatchesTokenHash(input.code, resetCode.codeHash)) {
    const failedCode = await prisma.shippingPartnerPasswordResetCode.update({
      where: { id: resetCode.id },
      data: { failedAttempts: { increment: 1 } },
    });

    if (failedCode.failedAttempts >= PASSWORD_RESET_MAX_FAILED_ATTEMPTS) {
      await prisma.shippingPartnerPasswordResetCode.updateMany({
        where: { id: failedCode.id, usedAt: null },
        data: { usedAt: new Date() },
      });
    }

    throw partnerPasswordResetCodeError();
  }

  const resetAuthorizationToken =
    createPartnerPasswordResetAuthorizationToken();
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const consumed =
      await transaction.shippingPartnerPasswordResetCode.updateMany({
        where: {
          id: resetCode.id,
          partnerId: partner.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

    if (consumed.count !== 1) throw partnerPasswordResetCodeError();

    await transaction.shippingPartnerPasswordResetAuthorization.updateMany({
      where: { partnerId: partner.id, usedAt: null },
      data: { usedAt: now },
    });

    await transaction.shippingPartnerPasswordResetAuthorization.create({
      data: {
        partnerId: partner.id,
        passwordResetCodeId: resetCode.id,
        tokenHash: hashToken(resetAuthorizationToken),
        expiresAt: getPartnerPasswordResetAuthorizationExpiresAt(),
      },
    });
  });

  return {
    message: "Reset code verified.",
    resetAuthorizationToken,
  };
}

export async function getPartnerPasswordResetSession(
  authorizationToken: string | undefined,
) {
  await findValidPartnerPasswordResetAuthorization(authorizationToken);
  return { message: "Password reset session is valid." };
}

export async function resetPartnerPassword(
  authorizationToken: string | undefined,
  input: ResetShippingPartnerPasswordInput,
) {
  const authorization = await findValidPartnerPasswordResetAuthorization(
    authorizationToken,
  );
  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  await prisma.$transaction(async (transaction) => {
    const consumed =
      await transaction.shippingPartnerPasswordResetAuthorization.updateMany({
        where: {
          id: authorization.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

    if (consumed.count !== 1) {
      throw partnerPasswordResetAuthorizationError();
    }

    await transaction.shippingPartner.update({
      where: { id: authorization.partnerId },
      data: { passwordHash },
    });

    await transaction.shippingPartnerOnboardingSession.updateMany({
      where: { partnerId: authorization.partnerId, revokedAt: null },
      data: { revokedAt: now },
    });

    await transaction.shippingPartnerPasswordResetCode.updateMany({
      where: { partnerId: authorization.partnerId, usedAt: null },
      data: { usedAt: now },
    });
  });

  try {
    await sendPartnerPasswordChangedEmail({
      partnerId: authorization.partner.id,
      passwordResetCodeId: authorization.passwordResetCodeId,
      firstName: authorization.partner.firstName,
      email: authorization.partner.email,
    });
  } catch (error) {
    console.error("Partner password-change email delivery failed.", {
      partnerId: authorization.partner.id,
      email: authorization.partner.email,
      error,
    });
  }

  return { message: "Password updated successfully. Please sign in again." };
}
