import type { Request, Response, NextFunction } from "express";
import { signResponse } from "@fireblocks/eth-staking-eth-link-api-validator";

/**
 * Middleware that intercepts JSON responses for the createValidator endpoint
 * and adds HMAC-SHA256 signature headers.
 *
 * Must be applied BEFORE the route handler for /eth-link/validators/create.
 */
export function createHmacResponseMiddleware(apiKey: string) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      // Only sign successful createValidator responses
      if (res.statusCode < 400 && body?.data?.depositData?.depositDataRoot) {
        const requestId = res.locals.requestId as string;
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const depositDataRoot = body.data.depositData.depositDataRoot;

        const signature = signResponse(requestId, timestamp, depositDataRoot, apiKey);

        res.setHeader("x-timestamp", timestamp);
        res.setHeader("x-signature", signature);
      }

      return originalJson(body);
    };

    next();
  };
}
