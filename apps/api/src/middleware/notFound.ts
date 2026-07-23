/**
 * Responsibility:
 * Returns the standard JSON response for API routes that do not exist.
 */

import type { RequestHandler } from "express";
import { HTTP_STATUS } from "../lib/httpError.js";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    message: "Route not found.",
  });
};
