/**
 * Responsibility:
 * Defines reusable HTTP status constants and an HTTP error class.
 * Services can throw HttpError instances, and controllers can convert them into consistent API responses.
 */

export type FieldErrors = Record<string, string>;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export class HttpError extends Error {
  statusCode: number;
  errors?: FieldErrors;
  code?: string;

  constructor(
    statusCode: number,
    message: string,
    options?: {
      errors?: FieldErrors;
      code?: string;
    },
  ) {
    super(message);

    this.name = "HttpError";
    this.statusCode = statusCode;
    this.errors = options?.errors;
    this.code = options?.code;
  }
}