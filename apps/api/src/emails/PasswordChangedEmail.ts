/**
 * Responsibility:
 * Builds the HTML, plain-text, and subject content for customer password-change security emails.
 */

import {
  escapeEmailHtml,
  renderZionraEmailLayout,
} from "./components/ZionraEmailLayout.js";

type PasswordChangedEmailInput = {
  firstName: string;
  supportEmail: string;
  secureAccountUrl: string;
};

export function createPasswordChangedEmail({
  firstName,
  supportEmail,
  secureAccountUrl,
}: PasswordChangedEmailInput) {
  const safeFirstName = escapeEmailHtml(firstName.trim());
  const title = "Your password was changed";

  const bodyHtml = `
    <p style="margin: 0 0 16px;">Hi ${safeFirstName},</p>
    <p style="margin: 0 0 18px;">
      The password for your Zionra account was changed successfully. For your security, all existing sessions have been signed out.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 18px;">
      <tr>
        <td style="border: 1px solid #FFE4B3; border-radius: 12px; background: #FFF5E8; padding: 15px 16px; color: #664213; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 22px;">
          <strong>If you made this change:</strong> no further action is required. Sign in again using your new password.
        </td>
      </tr>
    </table>

    <p style="margin: 0;">
      If you did not change your password, secure your account immediately and contact Zionra support.
    </p>
  `;

  return {
    subject: "Your Zionra password was changed",
    html: renderZionraEmailLayout({
      preheader: "Your Zionra password has been updated.",
      title,
      bodyHtml,
      supportEmail,
      action: {
        label: "Secure your account",
        href: secureAccountUrl,
      },
    }),
    text: [
      `Hi ${firstName.trim()},`,
      "",
      "The password for your Zionra account was changed successfully.",
      "For your security, all existing sessions have been signed out.",
      "",
      "If you made this change, no further action is required. Sign in again using your new password.",
      "",
      "If you did not change your password, secure your account immediately:",
      secureAccountUrl,
      "",
      `Need help? Email ${supportEmail}.`,
    ].join("\n"),
  };
}
