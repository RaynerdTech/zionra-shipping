/**
 * Responsibility:
 * Sends Zionra customer transactional emails through Resend and enforces duplicate-send protection.
 */

import { readFileSync } from "node:fs";
import { env } from "../config/env.js";
import {
  ZIONRA_EMAIL_LOGO_CONTENT_ID,
} from "../emails/components/ZionraEmailLayout.js";
import { createLoginVerificationCodeEmail } from "../emails/LoginVerificationCodeEmail.js";
import { createPasswordChangedEmail } from "../emails/PasswordChangedEmail.js";
import { createPasswordResetCodeEmail } from "../emails/PasswordResetCodeEmail.js";
import { createVerificationCodeEmail } from "../emails/VerificationCodeEmail.js";
import { createWelcomeEmail } from "../emails/WelcomeEmail.js";
import { resend } from "../lib/resend.js";

type TransactionalEmailAttachment = {
  filename: string;
  content: string;
  contentId: string;
};

type SendTransactionalEmailInput = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  category: string;
};

let cachedZionraLogoBase64: string | undefined;

function getZionraLogoAttachment(): TransactionalEmailAttachment {
  if (!cachedZionraLogoBase64) {
    const logoPath = new URL(
      "../../assets/email/logo-zionra.png",
      import.meta.url,
    );

    cachedZionraLogoBase64 = readFileSync(logoPath).toString("base64");
  }

  return {
    filename: "zionra-logo.png",
    content: cachedZionraLogoBase64,
    contentId: ZIONRA_EMAIL_LOGO_CONTENT_ID,
  };
}

async function sendTransactionalEmail({
  from,
  to,
  subject,
  html,
  text,
  idempotencyKey,
  category,
}: SendTransactionalEmailInput) {
  const { data, error } = await resend.emails.send(
    {
      from,
      to,
      replyTo: env.EMAIL_REPLY_TO,
      subject,
      html,
      text,
      attachments: [getZionraLogoAttachment()],
      tags: [
        {
          name: "category",
          value: category,
        },
      ],
    },
    {
      idempotencyKey,
    },
  );

  if (error) {
    throw new Error(`Resend email delivery failed: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error("Resend did not return an email identifier.");
  }

  return data.id;
}

export async function sendCustomerVerificationEmail(input: {
  customerId: string;
  verificationCodeId: string;
  firstName: string;
  email: string;
  code: string;
}) {
  const content = createVerificationCodeEmail({
    firstName: input.firstName,
    code: input.code,
    supportEmail: env.EMAIL_REPLY_TO,
  });

  return sendTransactionalEmail({
    from: env.EMAIL_ACCOUNTS_FROM,
    to: input.email,
    subject: content.subject,
    html: content.html,
    text: content.text,
    idempotencyKey: `customer-verification/${input.verificationCodeId}`,
    category: "customer_verification",
  });
}

export async function sendCustomerWelcomeEmail(input: {
  customerId: string;
  firstName: string;
  email: string;
  accountMethod: "password" | "google";
}) {
  const destination =
    input.accountMethod === "google" ? "/dashboard" : "/login";
  const actionUrl = new URL(destination, env.WEB_APP_URL).toString();
  const content = createWelcomeEmail({
    firstName: input.firstName,
    supportEmail: env.EMAIL_REPLY_TO,
    accountMethod: input.accountMethod,
    actionUrl,
  });

  return sendTransactionalEmail({
    from: env.EMAIL_WELCOME_FROM,
    to: input.email,
    subject: content.subject,
    html: content.html,
    text: content.text,
    idempotencyKey: `customer-welcome/${input.customerId}`,
    category: "customer_welcome",
  });
}

export async function sendCustomerPasswordResetCodeEmail(input: {
  customerId: string;
  passwordResetCodeId: string;
  firstName: string;
  email: string;
  code: string;
}) {
  const content = createPasswordResetCodeEmail({
    firstName: input.firstName,
    code: input.code,
    supportEmail: env.EMAIL_REPLY_TO,
  });

  return sendTransactionalEmail({
    from: env.EMAIL_ACCOUNTS_FROM,
    to: input.email,
    subject: content.subject,
    html: content.html,
    text: content.text,
    idempotencyKey: `customer-password-reset/${input.passwordResetCodeId}`,
    category: "customer_password_reset",
  });
}

export async function sendCustomerPasswordChangedEmail(input: {
  customerId: string;
  passwordResetCodeId: string;
  firstName: string;
  email: string;
}) {
  const secureAccountUrl = new URL(
    `/forgot-password?email=${encodeURIComponent(input.email)}`,
    env.WEB_APP_URL,
  ).toString();
  const content = createPasswordChangedEmail({
    firstName: input.firstName,
    supportEmail: env.EMAIL_REPLY_TO,
    secureAccountUrl,
  });

  return sendTransactionalEmail({
    from: env.EMAIL_ACCOUNTS_FROM,
    to: input.email,
    subject: content.subject,
    html: content.html,
    text: content.text,
    idempotencyKey: `customer-password-changed/${input.passwordResetCodeId}`,
    category: "customer_password_changed",
  });
}


export async function sendCustomerLoginVerificationEmail(input: {
  customerId: string;
  loginChallengeId: string;
  emailSendCount: number;
  firstName: string;
  email: string;
  code: string;
}) {
  const content = createLoginVerificationCodeEmail({
    firstName: input.firstName,
    code: input.code,
    supportEmail: env.EMAIL_REPLY_TO,
  });

  return sendTransactionalEmail({
    from: env.EMAIL_ACCOUNTS_FROM,
    to: input.email,
    subject: content.subject,
    html: content.html,
    text: content.text,
    idempotencyKey: `customer-login-verification/${input.loginChallengeId}/${input.emailSendCount}`,
    category: "customer_login_verification",
  });
}