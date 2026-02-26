import { z } from "zod";
import { EthereumAddress, BLSPublicKey, WithdrawalCredentials, Bytes32, BLSSignature } from "./primitives";

/** Schema for POST /eth-link/validators/create request body */
export const CreateValidatorRequest = z.object({
  blockchain: z.enum(["mainnet", "hoodi"]),
  withdrawalAddress: EthereumAddress,
  region: z.enum(["us", "eu"]).optional(),
  amount: z.string(),
});
export type CreateValidatorRequest = z.infer<typeof CreateValidatorRequest>;

/** Schema for deposit data in create-validator response */
export const DepositData = z.object({
  pubkey: BLSPublicKey,
  withdrawalCredentials: WithdrawalCredentials,
  depositDataRoot: Bytes32,
  signature: BLSSignature,
  amount: z.number().int(),
});
export type DepositData = z.infer<typeof DepositData>;

/** Schema for POST /eth-link/validators/create response body */
export const CreateValidatorResponse = z.object({
  data: z.object({
    depositData: DepositData,
  }),
});
export type CreateValidatorResponse = z.infer<typeof CreateValidatorResponse>;
