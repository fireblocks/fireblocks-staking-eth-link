# Express Provider Example

> Reference implementation — not an official SDK. Use as a starting point for your own provider.

Minimal Eth-Link provider using `@fireblocks/eth-staking-eth-link-server` middleware.

## Quick Start

```bash
yarn install
yarn dev
```

```typescript
import express from "express";
import { createEthLinkRouter } from "@fireblocks/eth-staking-eth-link-server";

const app = express();

app.use(createEthLinkRouter({
  apiKey: process.env.API_KEY!,
  provider: {
    async createValidator(request, clientId) {
      // Generate BLS keys, sign deposit data, return it
      return { data: { depositData: { pubkey, withdrawalCredentials, signature, depositDataRoot, amount } } };
    },
    async onValidatorEvent(pubkey, event) {
      // Handle DEPOSIT_SUBMITTED / VALIDATOR_CANCELED
    },
    async healthCheck() {
      return { healthy: true, timestamp: new Date().toISOString() };
    },
  },
}));

app.listen(3000);
```

## Validate with the API tester

```bash
# In another terminal, from the repo root:
ETH_LINK_BASE_URL=http://localhost:3000 ETH_LINK_API_KEY=dev-api-key-for-testing yarn validate
```

## What this example demonstrates

- Using `createEthLinkRouter()` to handle all protocol concerns (auth, validation, HMAC signing, error formatting)
- Implementing the `EthLinkProvider` interface with three methods
- The provider only needs to focus on business logic — the middleware handles the rest
