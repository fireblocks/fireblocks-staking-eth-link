import type { Request, Response, NextFunction } from "express";
import { extractRequestId } from "@fireblocks/eth-staking-eth-link-api-validator";

/**
 * Middleware that validates the x-request-id header (must be a UUID)
 * and echoes it back in the response.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = extractRequestId(req.headers);

  if (!requestId) {
    res.status(400).json({
      message: "Missing or invalid x-request-id header (must be UUID format)",
      code: "INVALID_REQUEST",
    });
    return;
  }

  // Store for downstream use and echo in response
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  next();
}
