# @fireblocks/eth-staking-eth-link-spec

OpenAPI 3.0 specification for the Eth-Link protocol.

## What is Eth-Link?

Eth-Link is a provider-agnostic API for creating and managing compounding ETH validators (post-Pectra). It defines a minimal interface that any staking provider can implement to integrate with the Eth-Link platform.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/eth-link/validators/create` | Create a new compounding validator |
| `POST` | `/eth-link/validators/{pubkey}/events` | Send validator lifecycle events |
| `GET` | `/eth-link/health` | Health check |

## Usage

Reference the spec directly:

```yaml
# In your OpenAPI tooling
$ref: "node_modules/@fireblocks/eth-staking-eth-link-spec/eth-link-spec.yaml"
```

Or use the companion packages for TypeScript types and runtime validation:

- `@fireblocks/eth-staking-eth-link-types` — TypeScript type definitions
- `@fireblocks/eth-staking-eth-link-api-validator` — Zod schemas + HMAC utilities
- `@fireblocks/eth-staking-eth-link-server` — Express middleware for providers
- `@fireblocks/eth-staking-eth-link-testing` — Conformance test suite
