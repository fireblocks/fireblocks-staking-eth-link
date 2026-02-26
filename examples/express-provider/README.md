# Express Provider Example

Minimal Eth-Link provider using `@fireblocks/eth-staking-eth-link-server` middleware.

## Run

```bash
yarn install
yarn dev
```

## Test with the conformance suite

```bash
# In another terminal:
npx @fireblocks/eth-staking-eth-link-testing --url http://localhost:3000 --api-key dev-api-key-for-testing
```

## What this example demonstrates

- Using `createEthLinkRouter()` to handle all protocol concerns (auth, validation, HMAC signing, error formatting)
- Implementing the `EthLinkProvider` interface with three methods
- The provider only needs to focus on business logic — the middleware handles the rest
