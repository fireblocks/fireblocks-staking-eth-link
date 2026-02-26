import express from "express";
import { createEthLinkRouter } from "@fireblocks/eth-staking-eth-link-server";
import type { EthLinkProvider } from "@fireblocks/eth-staking-eth-link-server";
import type {
  CreateValidatorRequest,
  CreateValidatorResponse,
  ValidatorEventRequest,
  HealthResponse,
} from "@fireblocks/eth-staking-eth-link-types";
import * as crypto from "crypto";

const API_KEY = process.env.API_KEY ?? "dev-api-key-for-testing";
const PORT = parseInt(process.env.PORT ?? "3000", 10);

/**
 * Example Eth-Link provider implementation.
 *
 * Replace the mock logic below with your actual validator creation
 * and key management implementation.
 */
const provider: EthLinkProvider = {
  async createValidator(
    request: CreateValidatorRequest,
    clientId: string,
  ): Promise<CreateValidatorResponse> {
    console.log(`Creating validator for client ${clientId} on ${request.blockchain}`);
    console.log(`  Withdrawal address: ${request.withdrawalAddress}`);
    console.log(`  Amount: ${request.amount} ETH`);

    // TODO: Replace with real BLS key generation and deposit data signing
    const pubkey = "0x" + crypto.randomBytes(48).toString("hex");
    const signature = "0x" + crypto.randomBytes(96).toString("hex");
    const depositDataRoot = "0x" + crypto.randomBytes(32).toString("hex");

    // Build 0x02 withdrawal credentials from the withdrawal address
    const addressHex = request.withdrawalAddress.replace("0x", "").toLowerCase();
    const withdrawalCredentials = "02" + "0".repeat(22) + addressHex;

    const amountGwei = Math.round(parseFloat(request.amount) * 1e9);

    return {
      data: {
        depositData: {
          pubkey,
          withdrawalCredentials,
          depositDataRoot,
          signature,
          amount: amountGwei,
        },
      },
    };
  },

  async onValidatorEvent(pubkey: string, event: ValidatorEventRequest): Promise<void> {
    console.log(`Received ${event.eventType} for validator ${pubkey}`);

    // TODO: Handle events — track deposit confirmations, clean up canceled validators
    if (event.eventType === "DEPOSIT_SUBMITTED") {
      const details = event.details as { txHash: string; amount: string };
      console.log(`  TX Hash: ${details.txHash}, Amount: ${details.amount} ETH`);
    }
  },

  async healthCheck(): Promise<HealthResponse> {
    return {
      healthy: true,
      timestamp: new Date().toISOString(),
      message: "Example provider running",
    };
  },
};

const app = express();
app.use(createEthLinkRouter({ apiKey: API_KEY, provider }));

app.listen(PORT, () => {
  console.log(`Eth-Link example provider listening on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/eth-link/health`);
  console.log(`  API Key: ${API_KEY}`);
});
