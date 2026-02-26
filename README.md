# Eth-Link

Reference implementation and example code for the Eth-Link protocol — a provider-agnostic API for creating compounding ETH validators (post-Pectra).

> **Note:** This is not an official SDK. The packages and examples in this repo are provided as reference implementations to help providers and clients integrate with the Eth-Link protocol.

## Packages

| Package | Description |
|---------|-------------|
| [`@fireblocks/eth-staking-eth-link-spec`](packages/spec/) | OpenAPI 3.0 specification (source of truth) |
| [`@fireblocks/eth-staking-eth-link-types`](packages/types/) | Zod schemas + TypeScript types |
| [`@fireblocks/eth-staking-eth-link-api-validator`](packages/api-validator/) | CLI tool for testing provider endpoints + HMAC utilities |
| [`@fireblocks/eth-staking-eth-link-server`](packages/server/) | Express middleware for providers |

## Validate a Provider

```bash
ETH_LINK_BASE_URL=http://localhost:3000 ETH_LINK_API_KEY=your-key yarn validate
```

## OpenAPI Spec

The source-of-truth specification lives in [`packages/spec/`](packages/spec/). Reference it directly in your OpenAPI tooling:

```yaml
$ref: "node_modules/@fireblocks/eth-staking-eth-link-spec/eth-link-spec.yaml"
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/eth-link/validators/create` | Create a compounding validator, return signed deposit data |
| `POST` | `/eth-link/validators/{pubkey}/events` | Receive validator lifecycle events |
| `GET` | `/eth-link/health` | Health check (polled every ~60s) |

## Examples

- [Express Provider](examples/express-provider/) — Using `@fireblocks/eth-staking-eth-link-server` middleware
- [Standalone Provider](examples/standalone-provider/) — Using only `@fireblocks/eth-staking-eth-link-api-validator` with Node.js `http`

## Development

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Type check
yarn typecheck

# Validate a running provider
ETH_LINK_BASE_URL=http://localhost:3000 ETH_LINK_API_KEY=dev-api-key-for-testing yarn validate
```

## License

MIT
