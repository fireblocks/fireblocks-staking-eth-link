import { Router } from "express";
import type { EthLinkProvider } from "../types";

export function healthRoute(provider: EthLinkProvider): Router {
  const router = Router();

  router.get(
    "/health",
    async (_req, res, next) => {
      try {
        const result = await provider.healthCheck();
        const statusCode = result.healthy ? 200 : 503;
        res.status(statusCode).json(result);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
