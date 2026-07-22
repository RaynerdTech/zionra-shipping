/**
 * Responsibility:
 * Builds the HTML, plain-text, and subject content for customer login verification emails.
 */

import {
  escapeEmailHtml,
  renderZionraEmailLayout,
} from "./components/ZionraEmailLayout.js";

type LoginVerificationCodeEmailInput = {
  firstName: string;
  code: string;
  supportEmail: string;
};

export function createLoginVerificationCodeEmail({
  firstName,
  code,
  supportEmail,
}: LoginVerificationCodeEmailInput) {
  const trimmedFirstName = firstName.trim();
  const safeFirstName = escapeEmailHtml(trimmedFirstName);
  const safeCode = escapeEmailHtml(code);
  const title = "Verify your Zionra sign-in";

  const bodyHtml = `
    <p style="margin: 0 0 16px;">Hi ${safeFirstName},</p>
    <p style="margin: 0 0 22px;">
      Use the verification code below to finish signing in to your Zionra customer account.
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
      If you did not try to sign in, change your password immediately and contact Zionra Support.
    </p>
  `;

  return {
    subject: "Your Zionra sign-in code",
    html: renderZionraEmailLayout({
      preheader: "Use this code to finish signing in to your Zionra account.",
      title,
      bodyHtml,
      supportEmail,
    }),
    text: [
      `Hi ${trimmedFirstName},`,
      "",
      "Use this verification code to finish signing in to your Zionra customer account:",
      "",
      code,
      "",
      "This code expires in 1 minute.",
      "",
      "If you did not try to sign in, change your password immediately and contact Zionra Support.",
      "",
      `Need help? Email ${supportEmail}.`,
    ].join("\n"),
  };
}