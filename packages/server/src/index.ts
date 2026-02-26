import { Router, json } from "express";
import { createAuthMiddleware, requestIdMiddleware, ethLinkErrorHandler } from "./middleware";
import { createValidatorRoute, validatorEventsRoute, healthRoute } from "./routes";
import type { EthLinkServerConfig } from "./types";

export type { EthLinkProvider, EthLinkServerConfig } from "./types";
export { EthLinkApiError } from "./middleware/error-handler";

/**
 * Create a fully configured Express router for an Eth-Link provider.
 *
 * Mounts all three Eth-Link endpoints under `/eth-link/` with:
 * - JSON body parsing
 * - API key authentication (timing-safe comparison)
 * - x-request-id validation and echo
 * - HMAC-SHA256 response signing for createValidator
 * - Request body validation via Zod schemas
 * - Structured error responses
 *
 * @example
 * ```typescript
 * import express from "express";
 * import { createEthLinkRouter } from "@fireblocks/eth-staking-eth-link-server";
 *
 * const app = express();
 *
 * app.use(createEthLinkRouter({
 *   apiKey: process.env.API_KEY!,
 *   provider: {
 *     async createValidator(request, clientId) {
 *       // Your validator creation logic here
 *       return { data: { depositData: { ... } } };
 *     },
 *     async onValidatorEvent(pubkey, event) {
 *       // Handle DEPOSIT_SUBMITTED / VALIDATOR_CANCELED
 *     },
 *     async healthCheck() {
 *       return { healthy: true, timestamp: new Date().toISOString() };
 *     },
 *   },
 * }));
 *
 * app.listen(3000);
 * ```
 */
export function createEthLinkRouter(config: EthLinkServerConfig): Router {
  const { apiKey, provider } = config;
  const router = Router();

  // Global middleware for all eth-link routes
  router.use("/eth-link", json());
  router.use("/eth-link", createAuthMiddleware(apiKey));
  router.use("/eth-link", requestIdMiddleware);

  // Mount route handlers
  router.use("/eth-link", createValidatorRoute(provider, apiKey));
  router.use("/eth-link", validatorEventsRoute(provider));
  router.use("/eth-link", healthRoute(provider));

  // Error handler (must be last)
  router.use("/eth-link", ethLinkErrorHandler);

  return router;
}
