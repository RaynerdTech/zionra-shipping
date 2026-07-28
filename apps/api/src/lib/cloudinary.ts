/**
 * Responsibility:
 * Configures Cloudinary and securely uploads partner company logos from memory.
 */

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env } from "../config/env.js";
import { HTTP_STATUS, HttpError } from "./httpError.js";

const configured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
);

if (configured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function isCloudinaryConfigured() {
  return configured;
}

export function uploadPartnerLogo(partnerId: string, buffer: Buffer) {
  if (!configured) {
    throw new HttpError(
      503,
      "Company-logo uploads are temporarily unavailable.",
      { code: "CLOUDINARY_NOT_CONFIGURED" },
    );
  }

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: `zionra/shipping-partners/${partnerId}`,
        public_id: "company-logo",
        overwrite: true,
        invalidate: true,
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary partner-logo upload failed.", error);
          reject(
            new HttpError(
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
              "Unable to upload the company logo. Please try again.",
              { code: "LOGO_UPLOAD_FAILED" },
            ),
          );
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}


export async function deletePartnerLogo(publicId: string) {
  if (!publicId) return;

  if (!configured) {
    throw new HttpError(
      503,
      "Company-logo removal is temporarily unavailable.",
      { code: "CLOUDINARY_NOT_CONFIGURED" },
    );
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Unexpected Cloudinary response: ${result.result}`);
    }
  } catch (error) {
    console.error("Cloudinary partner-logo deletion failed.", error);
    throw new HttpError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Unable to remove the company logo. Please try again.",
      { code: "LOGO_DELETE_FAILED" },
    );
  }
}