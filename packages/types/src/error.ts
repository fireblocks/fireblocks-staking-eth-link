import { z } from "zod";

/** All valid Eth-Link error codes */
export const ErrorCode = z.enum([
  "UNAUTHORIZED",
  "INVALID_REQUEST",
  "INVALID_ARGUMENT",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "DEPENDENCY_FAILURE",
  "INTERNAL_ERROR",
  "SERVICE_UNAVAILABLE",
]);
export type ErrorCode = z.infer<typeof ErrorCode>;

/** Schema for error responses returned by all endpoints */
export const ErrorResponse = z.object({
  message: z.string(),
  code: ErrorCode,
});
export type ErrorResponse = z.infer<typeof ErrorResponse>;
