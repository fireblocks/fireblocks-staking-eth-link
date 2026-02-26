import type {
  CreateValidatorRequest,
  CreateValidatorResponse,
  ValidatorEventRequest,
  HealthResponse,
} from "@fireblocks/eth-staking-eth-link-types";

/**
 * Interface that providers must implement.
 *
 * This is the core contract: implement these three methods and the
 * Eth-Link server middleware handles everything else (auth, validation,
 * HMAC signing, error formatting, header propagation).
 */
export interface EthLinkProvider {
  /**
   * Create a new compounding validator and return signed deposit data.
   *
   * @param request - Validated request body
   * @param clientId - The x-client-id header value (opaque tenant identifier)
   * @returns Deposit data to be submitted to the Ethereum Deposit Contract
   */
  createValidator(
    request: CreateValidatorRequest,
    clientId: string,
  ): Promise<CreateValidatorResponse>;

  /**
   * Handle a validator lifecycle event (DEPOSIT_SUBMITTED or VALIDATOR_CANCELED).
   *
   * @param pubkey - BLS public key of the validator (0x-prefixed)
   * @param event - Validated event request body
   */
  onValidatorEvent(
    pubkey: string,
    event: ValidatorEventRequest,
  ): Promise<void>;

  /**
   * Return the current health status of the provider.
   * Called approximately every 60 seconds by the platform.
   */
  healthCheck(): Promise<HealthResponse>;
}

/** Configuration for the Eth-Link server middleware */
export interface EthLinkServerConfig {
  /** The API key that clients must present in x-api-key header */
  apiKey: string;

  /** The provider implementation */
  provider: EthLinkProvider;
}
