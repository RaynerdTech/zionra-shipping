/**
 * Responsibility:
 * Builds the HTML, plain-text, and subject content for customer verification-code emails.
 */

import {
  escapeEmailHtml,
  renderZionraEmailLayout,
} from "./components/ZionraEmailLayout.js";

type VerificationCodeEmailInput = {
  firstName: string;
  code: string;
  supportEmail: string;
};

export function createVerificationCodeEmail({
  firstName,
  code,
  supportEmail,
}: VerificationCodeEmailInput) {
  const safeFirstName = escapeEmailHtml(firstName.trim());
  const safeCode = escapeEmailHtml(code);
  const title = "Verify your email address";

  const bodyHtml = `
    <p style="margin: 0 0 16px;">Hi ${safeFirstName},</p>
    <p style="margin: 0 0 22px;">
      Use the verification code below to confirm your email address and continue setting up your Zionra account.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 22px;">
      <tr>
        <td align="center" style="border: 1px solid #C3D9F7; border-radius: 14px; background: #F4F8FE; padding: 22px 16px;">
          <div style="color: #174184; font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; line-height: 42px; letter-spacing: 8px;">
            ${safeCode}
          </div>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 14px; color: #174184; font-weight: 700;">
      This code expires in 1 minute.
    </p>
    <p style="margin: 0;">
      If you did not create a Zionra account, you can safely ignore this email.
    </p>
  `;

  return {
    subject: "Your Zionra verification code",
    html: renderZionraEmailLayout({
      preheader: "Confirm your email address to finish setting up your Zionra account.",
      title,
      bodyHtml,
      supportEmail,
    }),
    text: [
      `Hi ${firstName.trim()},`,
      "",
      "Use this verification code to confirm your Zionra email address:",
      "",
      code,
      "",
      "This code expires in 1 minute.",
      "",
      "If you did not create a Zionra account, you can safely ignore this email.",
      "",
      `Need help? Email ${supportEmail}.`,
    ].join("\n"),
  };
}
