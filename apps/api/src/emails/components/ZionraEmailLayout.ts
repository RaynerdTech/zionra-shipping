/**
 * Responsibility:
 * Builds the shared, email-client-safe Zionra HTML shell used by transactional emails.
 */

export const ZIONRA_EMAIL_LOGO_CONTENT_ID = "zionra-logo";

export type ZionraEmailAction = {
  label: string;
  href: string;
};

type ZionraEmailLayoutInput = {
  preheader: string;
  title: string;
  bodyHtml: string;
  supportEmail: string;
  action?: ZionraEmailAction;
};

export function escapeEmailHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function sanitizeEmailHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function renderZionraEmailLayout({
  preheader,
  title,
  bodyHtml,
  supportEmail,
  action,
}: ZionraEmailLayoutInput) {
  const escapedPreheader = escapeEmailHtml(preheader);
  const escapedTitle = escapeEmailHtml(title);
  const escapedSupportEmail = escapeEmailHtml(supportEmail);
  const actionHtml = action
    ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0 8px;">
        <tr>
          <td align="center">
            <a href="${escapeEmailHtml(action.href)}" style="display: inline-block; border-radius: 10px; background: #286BDC; color: #FFFFFF; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 700; line-height: 20px; padding: 14px 24px; text-decoration: none;">
              ${escapeEmailHtml(action.label)}
            </a>
          </td>
        </tr>
      </table>
    `
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${escapedTitle}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #F4F6FA;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; line-height: 1px; font-size: 1px;">
      ${escapedPreheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background: #F4F6FA;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 600px;">
            <tr>
              <td style="padding: 0 8px 18px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="27" height="27" valign="middle" style="width: 27px; height: 27px;">
                      <img
                        src="cid:${ZIONRA_EMAIL_LOGO_CONTENT_ID}"
                        width="27"
                        height="27"
                        alt=""
                        style="display: block; width: 27px; height: 27px; border: 0; outline: none; text-decoration: none;"
                      />
                    </td>
                    <td valign="middle" style="padding-left: 9px; color: #07162C; font-family: Arial, Helvetica, sans-serif; font-size: 23px; font-weight: 800; line-height: 27px; letter-spacing: -0.5px;">
                      zionra
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="overflow: hidden; border: 1px solid #E4EAF2; border-radius: 18px; background: #FFFFFF; box-shadow: 0 8px 24px rgba(7, 22, 44, 0.06);">
                <div style="height: 5px; background: #FFA630; font-size: 0; line-height: 0;">&nbsp;</div>

                <div style="padding: 38px 40px 34px;">
                  <h1 style="margin: 0 0 18px; color: #07162C; font-family: Arial, Helvetica, sans-serif; font-size: 28px; font-weight: 800; line-height: 36px; letter-spacing: -0.4px;">
                    ${escapedTitle}
                  </h1>

                  <div style="color: #3E5775; font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: 400; line-height: 24px;">
                    ${bodyHtml}
                  </div>

                  ${actionHtml}
                </div>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 20px 20px 0; color: #6C7F98; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 19px;">
                Need help? Email
                <a href="mailto:${escapedSupportEmail}" style="color: #286BDC; text-decoration: none;">${escapedSupportEmail}</a>.
                <br />
                This is a transactional email from Zionra.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
