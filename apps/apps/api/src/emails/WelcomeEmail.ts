/**
 * Responsibility:
 * Builds the HTML, plain-text, and subject content for new-customer welcome emails.
 */

import {
  escapeEmailHtml,
  renderZionraEmailLayout,
  sanitizeEmailHeader,
} from "./components/ZionraEmailLayout.js";

type WelcomeEmailInput = {
  firstName: string;
  supportEmail: string;
  accountMethod: "password" | "google";
  actionUrl: string;
};

export function createWelcomeEmail({
  firstName,
  supportEmail,
  accountMethod,
  actionUrl,
}: WelcomeEmailInput) {
  const trimmedFirstName = firstName.trim();
  const safeFirstName = escapeEmailHtml(trimmedFirstName);
  const actionLabel =
    accountMethod === "google" ? "Go to your dashboard" : "Log in to Zionra";
  const title = `Welcome to Zionra, ${trimmedFirstName}`;

  const bodyHtml = `
    <p style="margin: 0 0 16px;">Hi ${safeFirstName},</p>
    <p style="margin: 0 0 22px;">
      Your Zionra account is ready. You can now compare verified shipping partners, keep shipment activity organised, and ship with greater visibility.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 8px;">
      <tr>
        <td style="padding: 12px 14px; border-radius: 10px; background: #F4F8FE; color: #174184; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 21px;">
          <strong>Compare confidently:</strong> review verified shipping partners before choosing who handles your shipment.
        </td>
      </tr>
      <tr><td height="10" style="height: 10px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
      <tr>
        <td style="padding: 12px 14px; border-radius: 10px; background: #F4F8FE; color: #174184; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 21px;">
          <strong>Stay informed:</strong> follow your shipping activity and important updates in one place.
        </td>
      </tr>
      <tr><td height="10" style="height: 10px; font-size: 0; line-height: 0;">&nbsp;</td></tr>
      <tr>
        <td style="padding: 12px 14px; border-radius: 10px; background: #F4F8FE; color: #174184; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 21px;">
          <strong>Ship securely:</strong> manage account and shipment information through Zionra's protected platform.
        </td>
      </tr>
    </table>

    <p style="margin: 22px 0 0;">
      We are glad to have you on board.
    </p>
  `;

  return {
    subject: sanitizeEmailHeader(title),
    html: renderZionraEmailLayout({
      preheader: "Your Zionra account is ready.",
      title,
      bodyHtml,
      supportEmail,
      action: {
        label: actionLabel,
        href: actionUrl,
      },
    }),
    text: [
      `Hi ${trimmedFirstName},`,
      "",
      "Your Zionra account is ready.",
      "",
      "With Zionra, you can:",
      "- Compare verified shipping partners.",
      "- Follow shipment activity and important updates.",
      "- Manage shipping information through a protected platform.",
      "",
      `${actionLabel}: ${actionUrl}`,
      "",
      "We are glad to have you on board.",
      "",
      `Need help? Email ${supportEmail}.`,
    ].join("\n"),
  };
}
