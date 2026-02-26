# Standalone Provider Example

Eth-Link provider using only Node.js `http` module + `@fireblocks/eth-staking-eth-link-api-validator`.

No Express dependency — shows how to implement the protocol with any framework.

## Run

```bash
yarn install
yarn dev
```

## Test with the conformance suite

```bash
npx @fireblocks/eth-staking-eth-link-testing --url http://localhost:3001 --api-key dev-api-key-for-testing
```

## When to use this approach

- You're using a framework other than Express (Fastify, Koa, Hapi, etc.)
- You want full control over the HTTP layer
- You only need the validation schemas and HMAC utilities
