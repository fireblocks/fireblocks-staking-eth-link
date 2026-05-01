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

const DepositSubmittedEvent = z.object({
  eventType: z.literal("DEPOSIT_SUBMITTED"),
  timestamp: z.string().datetime(),
  details: DepositSubmittedDetails,
});

const ValidatorCanceledEvent = z.object({
  eventType: z.literal("VALIDATOR_CANCELED"),
  timestamp: z.string().datetime(),
  details: ValidatorCanceledDetails,
});

/** Schema for POST /eth-link/validators/{pubkey}/events request body */
export const ValidatorEventRequest = z.discriminatedUnion("eventType", [
  DepositSubmittedEvent,
  ValidatorCanceledEvent,
]);
export type ValidatorEventRequest = z.infer<typeof ValidatorEventRequest>;
