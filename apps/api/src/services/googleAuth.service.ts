/**
 * Responsibility:
 * Implements Google customer authentication, explicit account linking,
 * and new-account profile completion.
 */

import { CodeChallengeMethod } from "google-auth-library";
import { env } from "../config/env.js";
import {
  createGoogleOAuthNonce,
  createGoogleOAuthState,
  createGoogleSignupToken,
  getGoogleSignupExpiresAt,
  hashGoogleSignupToken,
  securelyMatches,
} from "../lib/googleAuth.js";
import {
  GOOGLE_OAUTH_SCOPES,
  googleOAuthClient,
} from "../lib/googleOAuth.js";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";
import { verifyPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
import { createCustomerSession } from "./customerAuth.service.js";
import type {
  CompleteGoogleProfileInput,
  LinkGoogleAccountInput,
} from "../validators/customerAuth.validators.js";

const GOOGLE_PROVIDER = "GOOGLE" as const;

type GoogleIdentity = {
  providerAccountId: string;
  email: string;
  firstName: string;
  lastName: string;
};

function googleAuthError(
  statusCode: number,
  message: string,
  code: string,
  errors?: Record<string, string>,
) {
  return new HttpError(statusCode, message, {
    code,
    ...(errors ? { errors } : {}),
  });
}

function getGoogleIdentityNames(payload: {
  given_name?: string;
  family_name?: string;
  name?: string;
}) {
  const fullNameParts = payload.name?.trim().split(/\s+/).filter(Boolean) ?? [];
  const firstName = payload.given_name?.trim() || fullNameParts[0] || "";
  const lastName =
    payload.family_name?.trim() || fullNameParts.slice(1).join(" ") || "";

  if (!firstName || !lastName) {
    throw googleAuthError(
      HTTP_STATUS.BAD_REQUEST,
      "Google did not provide enough profile information to create this account.",
      "GOOGLE_PROFILE_INCOMPLETE",
    );
  }

  return {
    firstName,
    lastName,
  };
}

async function exchangeCodeForGoogleIdentity(
  code: string,
  codeVerifier: string,
  expectedNonce: string,
): Promise<GoogleIdentity> {
  const { tokens } = await googleOAuthClient.getToken({
    code,
    codeVerifier,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
  });

  if (!tokens.id_token) {
    throw googleAuthError(
      HTTP_STATUS.UNAUTHORIZED,
      "Google did not return a valid identity token.",
      "GOOGLE_ID_TOKEN_MISSING",
    );
  }

  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw googleAuthError(
      HTTP_STATUS.UNAUTHORIZED,
      "Google did not return the required account information.",
      "GOOGLE_IDENTITY_INVALID",
    );
  }

  if (!payload.nonce || !securelyMatches(payload.nonce, expectedNonce)) {
    throw googleAuthError(
      HTTP_STATUS.UNAUTHORIZED,
      "Google returned an invalid authentication response.",
      "GOOGLE_NONCE_INVALID",
    );
  }

  if (payload.email_verified !== true) {
    throw googleAuthError(
      HTTP_STATUS.FORBIDDEN,
      "Your Google email address must be verified.",
      "GOOGLE_EMAIL_NOT_VERIFIED",
    );
  }

  const names = getGoogleIdentityNames(payload);

  return {
    providerAccountId: payload.sub,
    email: payload.email.trim().toLowerCase(),
    firstName: names.firstName,
    lastName: names.lastName,
  };
}

async function createPendingGoogleHandoff(identity: GoogleIdentity) {
  const signupToken = createGoogleSignupToken();

  await prisma.customerOAuthSignup.upsert({
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

async function findValidPendingGoogleHandoff(signupToken: string) {
  return prisma.customerOAuthSignup.findFirst({
    where: {
      provider: GOOGLE_PROVIDER,
      tokenHash: hashGoogleSignupToken(signupToken),
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
}

export async function createGoogleAuthorizationRequest() {
  const state = createGoogleOAuthState();
  const nonce = createGoogleOAuthNonce();
  const { codeVerifier, codeChallenge } =
    await googleOAuthClient.generateCodeVerifierAsync();

  if (!codeChallenge) {
    throw googleAuthError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Unable to start Google authentication.",
      "GOOGLE_PKCE_ERROR",
    );
  }

  const authorizationUrl = googleOAuthClient.generateAuthUrl({
    scope: GOOGLE_OAUTH_SCOPES,
    state,
    prompt: "select_account",
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: CodeChallengeMethod.S256,
  });

  return {
    authorizationUrl,
    state,
    nonce,
    codeVerifier,
  };
}

export async function processGoogleCallback(input: {
  code: string;
  codeVerifier: string;
  expectedNonce: string;
}) {
  const identity = await exchangeCodeForGoogleIdentity(
    input.code,
    input.codeVerifier,
    input.expectedNonce,
  );

  const linkedGoogleAccount = await prisma.customerOAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: GOOGLE_PROVIDER,
        providerAccountId: identity.providerAccountId,
      },
    },
  });

  if (linkedGoogleAccount) {
    if (linkedGoogleAccount.email !== identity.email) {
      await prisma.customerOAuthAccount.update({
        where: {
          id: linkedGoogleAccount.id,
        },
        data: {
          email: identity.email,
        },
      });
    }

    const sessionToken = await createCustomerSession(
      linkedGoogleAccount.customerId,
    );

    return {
      outcome: "authenticated" as const,
      sessionToken,
    };
  }

  const customerWithMatchingEmail = await prisma.customer.findUnique({
    where: {
      email: identity.email,
    },
  });

  const signupToken = await createPendingGoogleHandoff(identity);

  if (!customerWithMatchingEmail) {
    return {
      outcome: "profile_required" as const,
      signupToken,
    };
  }

  if (!customerWithMatchingEmail.emailVerifiedAt) {
    return {
      outcome: "verification_required" as const,
      signupToken,
      email: identity.email,
    };
  }

  if (!customerWithMatchingEmail.passwordHash) {
    throw googleAuthError(
      HTTP_STATUS.CONFLICT,
      "This account cannot be linked with a password.",
      "GOOGLE_ACCOUNT_LINK_UNAVAILABLE",
    );
  }

  return {
    outcome: "link_required" as const,
    signupToken,
  };
}

export async function getPendingGoogleProfile(signupToken: string | undefined) {
  if (!signupToken) {
    throw googleAuthError(
      HTTP_STATUS.UNAUTHORIZED,
      "Your Google signup session has expired. Start again with Google.",
      "GOOGLE_SIGNUP_EXPIRED",
    );
  }

  const pendingSignup = await findValidPendingGoogleHandoff(signupToken);

  if (!pendingSignup) {
    throw googleAuthError(
      HTTP_STATUS.UNAUTHORIZED,
      "Your Google signup session has expired. Start again with Google.",
      "GOOGLE_SIGNUP_EXPIRED",
    );
  }

  return {
    profile: {
      firstName: pendingSignup.firstName,
      lastName: pendingSignup.lastName,
      email: pendingSignup.email,
    },
  };
}

export async function linkGoogleToExistingCustomer(
  signupToken: string | undefined,
  input: LinkGoogleAccountInput,
) {
  if (!signupToken) {
    throw googleAuthError(
      HTTP_STATUS.UNAUTHORIZED,
      "Your Google sign-in session has expired. Start again with Google.",
      "GOOGLE_SIGNUP_EXPIRED",
    );
  }

  const pendingSignup = await findValidPendingGoogleHandoff(signupToken);

  if (!pendingSignup) {
    throw googleAuthError(
      HTTP_STATUS.UNAUTHORIZED,
      "Your Google sign-in session has expired. Start again with Google.",
      "GOOGLE_SIGNUP_EXPIRED",
    );
  }

  const customer = await prisma.customer.findUnique({
    where: {
      email: pendingSignup.email,
    },
  });

  if (!customer) {
    throw googleAuthError(
      HTTP_STATUS.NOT_FOUND,
      "The Zionra account connected to this email no longer exists.",
      "CUSTOMER_NOT_FOUND",
    );
  }

  if (!customer.emailVerifiedAt) {
    throw googleAuthError(
      HTTP_STATUS.FORBIDDEN,
      "Verify your Zionra email address before connecting Google.",
      "EMAIL_NOT_VERIFIED",
    );
  }

  const passwordHash = customer.passwordHash;

  if (!passwordHash) {
    throw googleAuthError(
      HTTP_STATUS.CONFLICT,
      "This Zionra account does not use password sign-in.",
      "PASSWORD_SIGN_IN_UNAVAILABLE",
    );
  }

  const passwordIsValid = await verifyPassword(
    input.password,
    passwordHash,
  );

  if (!passwordIsValid) {
    throw googleAuthError(
      HTTP_STATUS.UNAUTHORIZED,
      "The password you entered is incorrect.",
      "INVALID_PASSWORD",
      {
        password: "The password you entered is incorrect.",
      },
    );
  }

  const customerId = await prisma.$transaction(async (transaction) => {
    const currentPendingSignup =
      await transaction.customerOAuthSignup.findFirst({
        where: {
          id: pendingSignup.id,
          tokenHash: hashGoogleSignupToken(signupToken),
          usedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

    if (!currentPendingSignup) {
      throw googleAuthError(
        HTTP_STATUS.UNAUTHORIZED,
        "Your Google sign-in session has expired. Start again with Google.",
        "GOOGLE_SIGNUP_EXPIRED",
      );
    }

    const providerAccount =
      await transaction.customerOAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: GOOGLE_PROVIDER,
            providerAccountId: currentPendingSignup.providerAccountId,
          },
        },
      });

    if (providerAccount && providerAccount.customerId !== customer.id) {
      throw googleAuthError(
        HTTP_STATUS.CONFLICT,
        "This Google Account is already linked to another Zionra account.",
        "GOOGLE_ACCOUNT_ALREADY_LINKED",
      );
    }

    const customerGoogleAccount =
      await transaction.customerOAuthAccount.findUnique({
        where: {
          provider_customerId: {
            provider: GOOGLE_PROVIDER,
            customerId: customer.id,
          },
        },
      });

    if (
      customerGoogleAccount &&
      customerGoogleAccount.providerAccountId !==
        currentPendingSignup.providerAccountId
    ) {
      throw googleAuthError(
        HTTP_STATUS.CONFLICT,
        "A different Google Account is already linked to this Zionra account.",
        "GOOGLE_ACCOUNT_ALREADY_LINKED",
      );
    }

    const consumedSignup = await transaction.customerOAuthSignup.updateMany({
      where: {
        id: currentPendingSignup.id,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(),
      },
    });

    if (consumedSignup.count !== 1) {
      throw googleAuthError(
        HTTP_STATUS.UNAUTHORIZED,
        "Your Google sign-in session has expired. Start again with Google.",
        "GOOGLE_SIGNUP_EXPIRED",
      );
    }

    if (!providerAccount && !customerGoogleAccount) {
      await transaction.customerOAuthAccount.create({
        data: {
          provider: GOOGLE_PROVIDER,
          providerAccountId: currentPendingSignup.providerAccountId,
          email: currentPendingSignup.email,
          customerId: customer.id,
        },
      });
    }

    return customer.id;
  });

  const sessionToken = await createCustomerSession(customerId);

  return {
    message: "Google Account connected successfully.",
    sessionToken,
  };
}

export async function completeGoogleSignup(
  signupToken: string | undefined,
  input: CompleteGoogleProfileInput,
) {
  if (!signupToken) {
    throw googleAuthError(
      HTTP_STATUS.UNAUTHORIZED,
      "Your Google signup session has expired. Start again with Google.",
      "GOOGLE_SIGNUP_EXPIRED",
    );
  }

  const tokenHash = hashGoogleSignupToken(signupToken);

  const customerId = await prisma.$transaction(async (transaction) => {
    const pendingSignup = await transaction.customerOAuthSignup.findFirst({
      where: {
        provider: GOOGLE_PROVIDER,
        tokenHash,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!pendingSignup) {
      throw googleAuthError(
        HTTP_STATUS.UNAUTHORIZED,
        "Your Google signup session has expired. Start again with Google.",
        "GOOGLE_SIGNUP_EXPIRED",
      );
    }

    const linkedGoogleAccount =
      await transaction.customerOAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: GOOGLE_PROVIDER,
            providerAccountId: pendingSignup.providerAccountId,
          },
        },
      });

    if (linkedGoogleAccount) {
      throw googleAuthError(
        HTTP_STATUS.CONFLICT,
        "This Google Account is already connected to a Zionra account.",
        "GOOGLE_ACCOUNT_ALREADY_LINKED",
      );
    }

    const existingCustomer = await transaction.customer.findUnique({
      where: {
        email: pendingSignup.email,
      },
    });

    if (existingCustomer) {
      if (!existingCustomer.emailVerifiedAt) {
        throw googleAuthError(
          HTTP_STATUS.CONFLICT,
          "Verify your Zionra email address before connecting Google.",
          "EMAIL_NOT_VERIFIED",
        );
      }

      throw googleAuthError(
        HTTP_STATUS.CONFLICT,
        "A Zionra account already exists with this email. Confirm your password to connect Google.",
        "GOOGLE_LINK_REQUIRED",
      );
    }

    const consumedSignup = await transaction.customerOAuthSignup.updateMany({
      where: {
        id: pendingSignup.id,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(),
      },
    });

    if (consumedSignup.count !== 1) {
      throw googleAuthError(
        HTTP_STATUS.UNAUTHORIZED,
        "Your Google signup session has expired. Start again with Google.",
        "GOOGLE_SIGNUP_EXPIRED",
      );
    }

    const customer = await transaction.customer.create({
      data: {
        firstName: pendingSignup.firstName,
        lastName: pendingSignup.lastName,
        email: pendingSignup.email,
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
            providerAccountId: pendingSignup.providerAccountId,
            email: pendingSignup.email,
          },
        },
      },
    });

    return customer.id;
  });

  const sessionToken = await createCustomerSession(customerId);

  return {
    message: "Your Zionra account is ready.",
    sessionToken,
  };
}
