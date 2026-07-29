/**
 * Responsibility:
 * Builds the HTML, plain-text, and subject content for shipping-partner
 * application receipt emails.
 */

import {
  escapeEmailHtml,
  renderZionraEmailLayout,
} from "./components/ZionraEmailLayout.js";

type PartnerApplicationReceivedEmailInput = {
  firstName: string;
  applicationReference: string;
  supportEmail: string;
};

export function createPartnerApplicationReceivedEmail({
  firstName,
  applicationReference,
  supportEmail,
}: PartnerApplicationReceivedEmailInput) {
  const trimmedFirstName = firstName.trim();
  const safeFirstName = escapeEmailHtml(trimmedFirstName);
  const safeReference = escapeEmailHtml(applicationReference.trim());
  const title = "We’ve received your partner application";

  const bodyHtml = `
    <p style="margin: 0 0 16px;">Hi ${safeFirstName},</p>
    <p style="margin: 0 0 18px;">
      Thank you for applying to become a Zionra Shipping Partner. We’ve received your application and our team is now reviewing the information you submitted.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 18px;">
      <tr>
        <td style="border: 1px solid #C3D9F7; border-radius: 12px; background: #F4F8FE; padding: 15px 16px; color: #174184; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 22px;">
          <strong>Application reference:</strong><br />
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 700; letter-spacing: 0.4px;">${safeReference}</span>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 14px;">
      Reviews normally take <strong>2–3 business days</strong>. A Zionra partner specialist may contact you if we need to verify any details.
    </p>
    <p style="margin: 0;">
      No action is required from you at this time. We’ll email you when there is an update.
    </p>
  `;

  return {
    subject: "We’ve received your Zionra partner application",
    html: renderZionraEmailLayout({
      preheader: `Your Zionra partner application ${applicationReference.trim()} is now under review.`,
      title,
      bodyHtml,
      supportEmail,
    }),
    text: [
      `Hi ${trimmedFirstName},`,
      "",
      "Thank you for applying to become a Zionra Shipping Partner.",
      "",
      "We’ve received your application and our team is now reviewing the information you submitted.",
      "",
      `Application reference: ${applicationReference.trim()}`,
      "",
      "Reviews normally take 2–3 business days. A Zionra partner specialist may contact you if we need to verify any details.",
      "",
      "No action is required from you at this time. We’ll email you when there is an update.",
      "",
      `Need help? Email ${supportEmail}.`,
    ].join("\n"),
  };
}
