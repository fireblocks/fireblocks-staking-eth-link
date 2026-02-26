# Standalone Provider Example

> Reference implementation — not an official SDK. Use as a starting point for your own provider.

Eth-Link provider using only Node.js `http` module + `@fireblocks/eth-staking-eth-link-api-validator`.

No Express dependency — shows how to implement the protocol with any framework.

## Run

```bash
yarn install
yarn dev
```

## Validate with the API tester

```bash
# In another terminal, from the repo root:
ETH_LINK_BASE_URL=http://localhost:3001 ETH_LINK_API_KEY=dev-api-key-for-testing yarn validate
```

## When to use this approach

- You're using a framework other than Express (Fastify, Koa, Hapi, etc.)
- You want full control over the HTTP layer
- You only need the validation schemas and HMAC utilities
