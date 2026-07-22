/**
 * Responsibility:
 * Sends Zionra customer transactional emails through Resend and enforces duplicate-send protection.
 */

import { env } from "../config/env.js";
import { createVerificationCodeEmail } from "../emails/VerificationCodeEmail.js";
import { createWelcomeEmail } from "../emails/WelcomeEmail.js";
import { resend } from "../lib/resend.js";

type SendTransactionalEmailInput = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  category: string;
};

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
