/**
 * Responsibility:
 * Converts errors forwarded by routes and middleware into one consistent API response.
 * Known HttpError instances keep their intended status, code, and field errors.
 * Unexpected errors are logged server-side without exposing internal details to clients.
 */

import type { ErrorRequestHandler } from "express";
import { HTTP_STATUS, HttpError } from "../lib/httpError.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
      ...(error.errors ? { errors: error.errors } : {}),
    });

    return;
  }

  console.error("Unhandled API error.", error);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: "Something went wrong. Please try again.",
  });
};
