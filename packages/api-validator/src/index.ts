export {
  // Primitives
  EthereumAddress,
  BLSPublicKey,
  WithdrawalCredentials,
  Bytes32,
  BLSSignature,
  // Request/Response schemas + types
  CreateValidatorRequest,
  DepositData,
  CreateValidatorResponse,
  ValidatorEventRequest,
  DepositSubmittedDetails,
  ValidatorCanceledDetails,
  HealthResponse,
  ErrorCode,
  ErrorResponse,
} from "@fireblocks/eth-staking-eth-link-types";

export { signResponse, verifySignature } from "./hmac";
export { extractRequestId, extractApiKey, extractClientId } from "./headers";
