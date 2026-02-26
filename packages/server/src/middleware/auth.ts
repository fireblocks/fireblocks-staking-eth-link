import type { Request, Response, NextFunction } from "express";
import * as crypto from "crypto";
import { extractApiKey } from "@fireblocks/eth-staking-eth-link-api-validator";

/**
 * Middleware that validates the x-api-key header against the configured key.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function createAuthMiddleware(apiKey: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const provided = extractApiKey(req.headers);

    if (!provided) {
      res.status(401).json({ message: "Unauthorized", code: "UNAUTHORIZED" });
      return;
    }

    const expectedBuf = Buffer.from(apiKey);
    const providedBuf = Buffer.from(provided);

    if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
      res.status(401).json({ message: "Unauthorized", code: "UNAUTHORIZED" });
      return;
    }

    next();
  };
}
