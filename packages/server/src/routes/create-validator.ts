import { Router } from "express";
import { CreateValidatorRequest } from "@fireblocks/eth-staking-eth-link-types";
import { extractClientId } from "@fireblocks/eth-staking-eth-link-api-validator";
import { createHmacResponseMiddleware } from "../middleware/hmac-response";
import { EthLinkApiError } from "../middleware/error-handler";
import type { EthLinkProvider } from "../types";

export function createValidatorRoute(provider: EthLinkProvider, apiKey: string): Router {
  const router = Router();

  router.post(
    "/validators/create",
    createHmacResponseMiddleware(apiKey),
    async (req, res, next) => {
      try {
        const clientId = extractClientId(req.headers);
        if (!clientId) {
          throw EthLinkApiError.invalidRequest("Missing or invalid x-client-id header (must be UUID format)");
        }

        const parsed = CreateValidatorRequest.safeParse(req.body);
        if (!parsed.success) {
          throw EthLinkApiError.invalidArgument(parsed.error.issues[0]?.message ?? "Invalid request body");
        }

        const result = await provider.createValidator(parsed.data, clientId);
        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
