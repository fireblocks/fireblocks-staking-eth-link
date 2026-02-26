import { Router } from "express";
import { ValidatorEventRequest, BLSPublicKey } from "@fireblocks/eth-staking-eth-link-types";
import { EthLinkApiError } from "../middleware/error-handler";
import type { EthLinkProvider } from "../types";

export function validatorEventsRoute(provider: EthLinkProvider): Router {
  const router = Router();

  router.post(
    "/validators/:pubkey/events",
    async (req, res, next) => {
      try {
        const { pubkey } = req.params;

        if (!BLSPublicKey.safeParse(pubkey).success) {
          throw EthLinkApiError.invalidArgument("Invalid validator public key format");
        }

        const parsed = ValidatorEventRequest.safeParse(req.body);
        if (!parsed.success) {
          throw EthLinkApiError.invalidArgument(parsed.error.issues[0]?.message ?? "Invalid request body");
        }

        await provider.onValidatorEvent(pubkey, parsed.data);
        res.status(200).json({});
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
