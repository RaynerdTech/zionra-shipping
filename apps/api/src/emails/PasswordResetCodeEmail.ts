/**
 * Responsibility:
 * Builds the HTML, plain-text, and subject content for customer password-reset code emails.
 */

import {
  escapeEmailHtml,
  renderZionraEmailLayout,
} from "./components/ZionraEmailLayout.js";

type PasswordResetCodeEmailInput = {
  firstName: string;
  code: string;
  supportEmail: string;
};

export function createPasswordResetCodeEmail({
  firstName,
  code,
  supportEmail,
}: PasswordResetCodeEmailInput) {
  const safeFirstName = escapeEmailHtml(firstName.trim());
  const safeCode = escapeEmailHtml(code);
  const title = "Reset your password";

  const bodyHtml = `
    <p style="margin: 0 0 16px;">Hi ${safeFirstName},</p>
    <p style="margin: 0 0 22px;">
      We received a request to reset the password for your Zionra account. Enter the code below to continue.
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
      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  `;

  return {
    subject: "Your Zionra password reset code",
    html: renderZionraEmailLayout({
      preheader: "Use this code to reset your Zionra password.",
      title,
      bodyHtml,
      supportEmail,
    }),
    text: [
      `Hi ${firstName.trim()},`,
      "",
      "We received a request to reset the password for your Zionra account.",
      "",
      "Use this password reset code:",
      "",
      code,
      "",
      "This code expires in 1 minute.",
      "",
      "If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.",
      "",
      `Need help? Email ${supportEmail}.`,
    ].join("\n"),
  };
}
