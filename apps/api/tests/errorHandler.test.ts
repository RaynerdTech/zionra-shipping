/**
 * Responsibility:
 * Protects the consistent API error response contract.
 */

import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../src/lib/httpError.js";
import { errorHandler } from "../src/middleware/errorHandler.js";

type ResponseState = {
  statusCode: number | null;
  body: unknown;
};

function createResponseDouble(headersSent = false) {
  const state: ResponseState = {
    statusCode: null,
    body: null,
  };

  const response = {
    headersSent,
    status(statusCode: number) {
      state.statusCode = statusCode;
      return this;
    },
    json(body: unknown) {
      state.body = body;
      return this;
    },
  } as unknown as Response;

  return {
    response,
    state,
  };
}

test("HttpError responses preserve status, code, and field errors", () => {
  const { response, state } = createResponseDouble();
  const error = new HttpError(422, "Validation failed.", {
    code: "VALIDATION_FAILED",
    errors: {
      email: "Enter a valid email address.",
    },
  });

  errorHandler(
    error,
    {} as Request,
    response,
    (() => undefined) as NextFunction,
  );

  assert.equal(state.statusCode, 422);
  assert.deepEqual(state.body, {
    message: "Validation failed.",
    code: "VALIDATION_FAILED",
    errors: {
      email: "Enter a valid email address.",
    },
  });
});

test("the error handler delegates when response headers were already sent", () => {
  const { response, state } = createResponseDouble(true);
  const error = new Error("stream failed");
  let forwardedError: unknown;

  errorHandler(
    error,
    {} as Request,
    response,
    ((receivedError: unknown) => {
      forwardedError = receivedError;
    }) as NextFunction,
  );

  assert.equal(forwardedError, error);
  assert.equal(state.statusCode, null);
  assert.equal(state.body, null);
});

test("unexpected errors return a generic 500 response", () => {
  const { response, state } = createResponseDouble();
  const originalConsoleError = console.error;
  let logged = false;

  console.error = () => {
    logged = true;
  };

  try {
    errorHandler(
      new Error("database credentials must not reach the client"),
      {} as Request,
      response,
      (() => undefined) as NextFunction,
    );
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(logged, true);
  assert.equal(state.statusCode, 500);
  assert.deepEqual(state.body, {
    message: "Something went wrong. Please try again.",
  });
});
