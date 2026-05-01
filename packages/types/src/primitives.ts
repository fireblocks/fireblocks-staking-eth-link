import { z } from "zod";

/** Ethereum address: 20 bytes, hex-encoded with 0x prefix */
export const EthereumAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
  message: "Must be a valid Ethereum address (0x followed by 40 hex characters)",
});

/** BLS12-381 public key: 48 bytes, hex-encoded with 0x prefix */
export const BLSPublicKey = z.string().regex(/^0x[a-fA-F0-9]{96}$/, {
  message: "Must be a valid BLS public key (0x followed by 96 hex characters)",
});

/** Pectra withdrawal credentials: 32 bytes starting with 02 (no 0x prefix) */
export const WithdrawalCredentials = z.string().regex(/^02[a-fA-F0-9]{62}$/, {
  message: "Must be valid Pectra withdrawal credentials (02 followed by 62 hex characters)",
});

/** 32-byte hash: hex-encoded with 0x prefix */
export const Bytes32 = z.string().regex(/^0x[a-fA-F0-9]{64}$/, {
  message: "Must be a 32-byte hash (0x followed by 64 hex characters)",
});

/** BLS12-381 signature: 96 bytes, hex-encoded with 0x prefix */
export const BLSSignature = z.string().regex(/^0x[a-fA-F0-9]{192}$/, {
  message: "Must be a valid BLS signature (0x followed by 192 hex characters)",
});
