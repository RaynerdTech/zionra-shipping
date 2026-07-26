/**
 * Responsibility:
 * Implements shipping-partner registration, email verification, onboarding
 * sessions, and the Google signup handoff.
 */

import { env } from "../config/env.js";
import {
  createGoogleSignupToken,
  getGoogleSignupExpiresAt,
  hashGoogleSignupToken,
} from "../lib/googleAuth.js";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";
import {
  createPartnerOnboardingToken,
  getPartnerOnboardingExpiresAt,
  hashPartnerOnboardingToken,
} from "../lib/partnerAuth.js";
import { hashPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
import {
  createSixDigitCode,
  hashToken,
  minutesFromNow,
} from "../lib/token.js";
import type {
  CompleteGoogleShippingPartnerProfileInput,
  PartnerEmailCodeInput,
  PartnerEmailInput,
  RegisterShippingPartnerInput,
} from "../validators/partnerAuth.validators.js";
import { sendPartnerVerificationEmail } from "./email.service.js";
import type { GoogleIdentity } from "./googleAuth.service.js";

const GOOGLE_PROVIDER = "GOOGLE" as const;

function developmentCodePayload(code: string) {
  return env.NODE_ENV === "development" ? { dev: { code } } : {};
}

function toPublicPartner(partner: {
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
  status: string;
  createdAt: Date;
}) {
  return {
    id: partner.id,
    firstName: partner.firstName,
    lastName: partner.lastName,
    email: partner.email,
    phoneCountryCode: partner.phoneCountryCode,
    phoneNumber: partner.phoneNumber,
    countryOfResidence: partner.countryOfResidence,
    referralSource: partner.referralSource,
    marketingOptIn: partner.marketingOptIn,
    emailVerified: Boolean(partner.emailVerifiedAt),
    status: partner.status,
    createdAt: partner.createdAt,
  };
}

async function createVerificationCode(partnerId: string) {
  const code = createSixDigitCode();

  await prisma.shippingPartnerEmailVerificationCode.updateMany({
    where: { partnerId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const record = await prisma.shippingPartnerEmailVerificationCode.create({
    data: {
      partnerId,
      codeHash: hashToken(code),
      expiresAt: minutesFromNow(1),
    },
  });

  return { code, verificationCodeId: record.id };
}

export async function createPartnerOnboardingSession(partnerId: string) {
  const token = createPartnerOnboardingToken();

  await prisma.shippingPartnerOnboardingSession.create({
    data: {
      partnerId,
      tokenHash: hashPartnerOnboardingToken(token),
      expiresAt: getPartnerOnboardingExpiresAt(),
    },
  });

  return token;
}

export async function registerShippingPartner(
  input: RegisterShippingPartnerInput,
) {
  const existing = await prisma.shippingPartner.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new HttpError(
      HTTP_STATUS.CONFLICT,
      "A shipping-partner account with this email already exists.",
      { errors: { email: "An account with this email already exists." } },
    );
  }

  const partner = await prisma.shippingPartner.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phoneCountryCode: input.phoneCountryCode,
      phoneNumber: input.phoneNumber,
      passwordHash: await hashPassword(input.password),
      countryOfResidence: input.countryOfResidence,
      referralSource: input.referralSource,
      acceptedTermsAt: new Date(),
      marketingOptIn: input.marketingOptIn,
    },
  });

  const verification = await createVerificationCode(partner.id);
  let verificationEmailSent = true;

  try {
    await sendPartnerVerificationEmail({
      partnerId: partner.id,
      verificationCodeId: verification.verificationCodeId,
      firstName: partner.firstName,
      email: partner.email,
      code: verification.code,
    });
  } catch (error) {
    verificationEmailSent = false;
    console.error("Partner verification email delivery failed.", {
      partnerId: partner.id,
      email: partner.email,
      error,
    });
  }

  return {
    message: verificationEmailSent
      ? "Account created. Verify your email address to continue."
      : "Account created, but the verification email could not be delivered. Request a new code.",
    partner: toPublicPartner(partner),
    verificationEmailSent,
    ...developmentCodePayload(verification.code),
  };
}

export async function verifyShippingPartnerEmail(
  input: PartnerEmailCodeInput,
) {
  const partner = await prisma.shippingPartner.findUnique({
    where: { email: input.email },
  });

  if (!partner) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid or expired verification code.",
    );
  }

  if (partner.emailVerifiedAt) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "This email address is already verified.",
      { code: "EMAIL_ALREADY_VERIFIED" },
    );
  }

  const verificationCode =
    await prisma.shippingPartnerEmailVerificationCode.findFirst({
      where: {
        partnerId: partner.id,
        codeHash: hashToken(input.code),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

  if (!verificationCode) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid or expired verification code.",
    );
  }

  await prisma.$transaction([
    prisma.shippingPartnerEmailVerificationCode.update({
      where: { id: verificationCode.id },
      data: { usedAt: new Date() },
    }),
    prisma.shippingPartner.update({
      where: { id: partner.id },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);

  return {
    message: "Email verified successfully.",
    sessionToken: await createPartnerOnboardingSession(partner.id),
  };
}

export async function resendShippingPartnerVerificationCode(
  input: PartnerEmailInput,
) {
  const partner = await prisma.shippingPartner.findUnique({
    where: { email: input.email },
  });

  if (!partner) {
    return {
      message:
        "If an account exists for this email, a verification code has been sent.",
    };
  }

  if (partner.emailVerifiedAt) {
    throw new HttpError(
      HTTP_STATUS.BAD_REQUEST,
      "This email address is already verified.",
      { code: "EMAIL_ALREADY_VERIFIED" },
    );
  }

  const verification = await createVerificationCode(partner.id);

  try {
    await sendPartnerVerificationEmail({
      partnerId: partner.id,
      verificationCodeId: verification.verificationCodeId,
      firstName: partner.firstName,
      email: partner.email,
      code: verification.code,
    });
  } catch (error) {
    console.error("Partner verification email delivery failed.", error);
    throw new HttpError(
      503,
      "We could not send a verification code right now. Please try again.",
      { code: "EMAIL_DELIVERY_FAILED" },
    );
  }

  return {
    message: "Verification code sent.",
    ...developmentCodePayload(verification.code),
  };
}

export async function getPartnerFromOnboardingToken(token: string | undefined) {
  if (!token) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Partner session required.");
  }

  const session = await prisma.shippingPartnerOnboardingSession.findFirst({
    where: {
      tokenHash: hashPartnerOnboardingToken(token),
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { partner: true },
  });

  if (!session || !session.partner.emailVerifiedAt) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Partner session expired.");
  }

  await prisma.shippingPartnerOnboardingSession.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });

  return toPublicPartner(session.partner);
}

async function createPendingPartnerGoogleHandoff(identity: GoogleIdentity) {
  const signupToken = createGoogleSignupToken();

  await prisma.shippingPartnerOAuthSignup.upsert({
    where: {
      provider_providerAccountId: {
        provider: GOOGLE_PROVIDER,
        providerAccountId: identity.providerAccountId,
      },
    },
    create: {
      provider: GOOGLE_PROVIDER,
      providerAccountId: identity.providerAccountId,
      tokenHash: hashGoogleSignupToken(signupToken),
      email: identity.email,
      firstName: identity.firstName,
      lastName: identity.lastName,
      expiresAt: getGoogleSignupExpiresAt(),
    },
    update: {
      tokenHash: hashGoogleSignupToken(signupToken),
      email: identity.email,
      firstName: identity.firstName,
      lastName: identity.lastName,
      expiresAt: getGoogleSignupExpiresAt(),
      usedAt: null,
    },
  });

  return signupToken;
}

export async function processPartnerGoogleIdentity(identity: GoogleIdentity) {
  const linked = await prisma.shippingPartnerOAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: GOOGLE_PROVIDER,
        providerAccountId: identity.providerAccountId,
      },
    },
  });

  if (linked) {
    return {
      outcome: "authenticated" as const,
      sessionToken: await createPartnerOnboardingSession(linked.partnerId),
    };
  }

  const existingPartner = await prisma.shippingPartner.findUnique({
    where: { email: identity.email },
  });

  if (existingPartner) {
    throw new HttpError(
      HTTP_STATUS.CONFLICT,
      "A shipping-partner account already exists with this email.",
      { code: "GOOGLE_ACCOUNT_LINK_UNAVAILABLE" },
    );
  }

  return {
    outcome: "profile_required" as const,
    signupToken: await createPendingPartnerGoogleHandoff(identity),
  };
}

async function findValidPendingPartnerGoogleSignup(token: string) {
  return prisma.shippingPartnerOAuthSignup.findFirst({
    where: {
      provider: GOOGLE_PROVIDER,
      tokenHash: hashGoogleSignupToken(token),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
}

export async function getPendingPartnerGoogleProfile(
  signupToken: string | undefined,
) {
  if (!signupToken) {
    throw new HttpError(
      HTTP_STATUS.UNAUTHORIZED,
      "Your Google signup session has expired. Start again with Google.",
      { code: "GOOGLE_SIGNUP_EXPIRED" },
    );
  }

  const pending = await findValidPendingPartnerGoogleSignup(signupToken);
  if (!pending) {
    throw new HttpError(
      HTTP_STATUS.UNAUTHORIZED,
      "Your Google signup session has expired. Start again with Google.",
      { code: "GOOGLE_SIGNUP_EXPIRED" },
    );
  }

  return {
    profile: {
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
    },
  };
}

export async function completePartnerGoogleSignup(
  signupToken: string | undefined,
  input: CompleteGoogleShippingPartnerProfileInput,
) {
  if (!signupToken) {
    throw new HttpError(
      HTTP_STATUS.UNAUTHORIZED,
      "Your Google signup session has expired. Start again with Google.",
      { code: "GOOGLE_SIGNUP_EXPIRED" },
    );
  }

  const tokenHash = hashGoogleSignupToken(signupToken);

  const partner = await prisma.$transaction(async (transaction) => {
    const pending = await transaction.shippingPartnerOAuthSignup.findFirst({
      where: {
        provider: GOOGLE_PROVIDER,
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!pending) {
      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        "Your Google signup session has expired. Start again with Google.",
        { code: "GOOGLE_SIGNUP_EXPIRED" },
      );
    }

    if (
      await transaction.shippingPartner.findUnique({
        where: { email: pending.email },
      })
    ) {
      throw new HttpError(
        HTTP_STATUS.CONFLICT,
        "A shipping-partner account already exists with this email.",
        { code: "GOOGLE_ACCOUNT_LINK_UNAVAILABLE" },
      );
    }

    const consumed = await transaction.shippingPartnerOAuthSignup.updateMany({
      where: {
        id: pending.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    });

    if (consumed.count !== 1) {
      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        "Your Google signup session has expired. Start again with Google.",
        { code: "GOOGLE_SIGNUP_EXPIRED" },
      );
    }

    return transaction.shippingPartner.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: pending.email,
        phoneCountryCode: input.phoneCountryCode,
        phoneNumber: input.phoneNumber,
        passwordHash: null,
        countryOfResidence: input.countryOfResidence,
        referralSource: input.referralSource,
        acceptedTermsAt: new Date(),
        marketingOptIn: input.marketingOptIn,
        emailVerifiedAt: new Date(),
        oauthAccounts: {
          create: {
            provider: GOOGLE_PROVIDER,
            providerAccountId: pending.providerAccountId,
            email: pending.email,
          },
        },
      },
    });
  });

  return {
    message: "Your shipping-partner account is ready for onboarding.",
    sessionToken: await createPartnerOnboardingSession(partner.id),
  };
}
