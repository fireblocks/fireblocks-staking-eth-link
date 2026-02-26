# Eth-Link

Provider-agnostic API for creating compounding ETH validators (post-Pectra).

Eth-Link defines a minimal interface that staking providers implement to integrate with the Eth-Link platform. This monorepo contains the specification, TypeScript SDK packages, and conformance tests.

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| [`@fireblocks/eth-staking-eth-link-spec`](packages/spec/) | — | OpenAPI 3.0 specification (source of truth) |
| [`@fireblocks/eth-staking-eth-link-types`](packages/types/) | — | TypeScript type definitions |
| [`@fireblocks/eth-staking-eth-link-api-validator`](packages/api-validator/) | — | Zod schemas + HMAC signing utilities |
| [`@fireblocks/eth-staking-eth-link-server`](packages/server/) | — | Express middleware for providers |
| [`@fireblocks/eth-staking-eth-link-testing`](packages/testing/) | — | Conformance test CLI |

## Quick Start

### For Providers (implementing Eth-Link)

```bash
yarn add @fireblocks/eth-staking-eth-link-server @fireblocks/eth-staking-eth-link-types express
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

### Run Conformance Tests

```bash
npx @fireblocks/eth-staking-eth-link-testing --url http://localhost:3000 --api-key your-key
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/eth-link/validators/create` | Create a compounding validator, return signed deposit data |
| `POST` | `/eth-link/validators/{pubkey}/events` | Receive validator lifecycle events |
| `GET` | `/eth-link/health` | Health check (polled every ~60s) |

## Documentation

- [Integration Guide](docs/integration-guide.md) — Step-by-step onboarding
- [Security](docs/security.md) — HMAC signing, API keys, idempotency
- [Deposit Data](docs/deposit-data.md) — BLS keys, SSZ, 0x02 credentials
- [Troubleshooting](docs/troubleshooting.md) — Common issues and fixes

## Examples

- [Express Provider](examples/express-provider/) — Using `@fireblocks/eth-staking-eth-link-server` middleware
- [Standalone Provider](examples/standalone-provider/) — Using only `@fireblocks/eth-staking-eth-link-api-validator` with Node.js `http`

## Development

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run tests
yarn test

# Type check
yarn typecheck
```

## License

MIT
