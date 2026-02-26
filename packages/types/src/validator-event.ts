import { z } from "zod";
import { Bytes32 } from "./primitives";

/** Details for DEPOSIT_SUBMITTED events */
export const DepositSubmittedDetails = z.object({
  txHash: Bytes32,
  amount: z.string(),
});
export type DepositSubmittedDetails = z.infer<typeof DepositSubmittedDetails>;

/** Details for VALIDATOR_CANCELED events */
export const ValidatorCanceledDetails = z.object({
  reason: z.string().optional(),
});
export type ValidatorCanceledDetails = z.infer<typeof ValidatorCanceledDetails>;

/** Schema for POST /eth-link/validators/{pubkey}/events request body */
export const ValidatorEventRequest = z.object({
  eventType: z.enum(["DEPOSIT_SUBMITTED", "VALIDATOR_CANCELED"]),
  timestamp: z.string().datetime(),
  details: z.union([DepositSubmittedDetails, ValidatorCanceledDetails]),
});
export type ValidatorEventRequest = z.infer<typeof ValidatorEventRequest>;
