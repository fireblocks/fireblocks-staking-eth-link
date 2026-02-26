import type { Request, Response, NextFunction } from "express";
import type { ErrorCode } from "@fireblocks/eth-staking-eth-link-types";

/** Error class with an Eth-Link error code */
export class EthLinkApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "EthLinkApiError";
  }

  static unauthorized(message = "Unauthorized") {
    return new EthLinkApiError("UNAUTHORIZED", message, 401);
  }

  static invalidRequest(message: string) {
    return new EthLinkApiError("INVALID_REQUEST", message, 400);
  }

  static invalidArgument(message: string) {
    return new EthLinkApiError("INVALID_ARGUMENT", message, 400);
  }

  static notFound(message: string) {
    return new EthLinkApiError("NOT_FOUND", message, 404);
  }

  static conflict(message: string) {
    return new EthLinkApiError("CONFLICT", message, 409);
  }

  static rateLimited(message = "Rate limit exceeded") {
    return new EthLinkApiError("RATE_LIMITED", message, 429);
  }

  static dependencyFailure(message: string) {
    return new EthLinkApiError("DEPENDENCY_FAILURE", message, 502);
  }

  static internal(message = "Internal server error") {
    return new EthLinkApiError("INTERNAL_ERROR", message, 500);
  }

  static serviceUnavailable(message = "Service unavailable") {
    return new EthLinkApiError("SERVICE_UNAVAILABLE", message, 503);
  }
}

/**
 * Express error handler that formats errors into the Eth-Link ErrorResponse shape.
 */
export function ethLinkErrorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof EthLinkApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
    return;
  }

  // Unknown errors become INTERNAL_ERROR
  res.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}
