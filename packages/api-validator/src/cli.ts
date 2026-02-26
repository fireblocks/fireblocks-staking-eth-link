#!/usr/bin/env node

import * as crypto from "crypto";
import {
  HealthResponse,
  CreateValidatorResponse,
  CreateValidatorRequest,
} from "@fireblocks/eth-staking-eth-link-types";
import { verifySignature } from "./hmac";

// ── ANSI colors ─────────────────────────────────────────────────────────────

const bold = (s: string) => `\x1b[1m\x1b[37m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m\x1b[1m${s}\x1b[0m`;

// ── Config ──────────────────────────────────────────────────────────────────

interface Config {
  baseUrl: string;
  apiKey: string;
  chain: "mainnet" | "hoodi";
  withdrawalAddress: string;
  amount: string;
  region?: "us" | "eu";
}

function loadConfig(): Config {
  const baseUrl = process.env.ETH_LINK_BASE_URL;
  const apiKey = process.env.ETH_LINK_API_KEY;

  if (!baseUrl || !apiKey) {
    console.error(red("Missing required environment variables:\n"));
    if (!baseUrl)
      console.error(red("  ETH_LINK_BASE_URL  - Provider base URL"));
    if (!apiKey)
      console.error(red("  ETH_LINK_API_KEY   - API key for authentication"));
    console.error(`
Optional:
  ETH_LINK_CHAIN                mainnet | hoodi (default: hoodi)
  ETH_LINK_WITHDRAWAL_ADDRESS   0x-prefixed Ethereum address
  ETH_LINK_AMOUNT               ETH amount (default: 32)
  ETH_LINK_REGION               us | eu

Usage:
  ETH_LINK_BASE_URL=https://provider.example.com ETH_LINK_API_KEY=secret eth-link-api-validator`);
    process.exit(1);
  }

  const chain = (process.env.ETH_LINK_CHAIN || "hoodi") as "mainnet" | "hoodi";
  if (chain !== "mainnet" && chain !== "hoodi") {
    console.error(red('ETH_LINK_CHAIN must be "mainnet" or "hoodi"'));
    process.exit(1);
  }

  const region = process.env.ETH_LINK_REGION as "us" | "eu" | undefined;
  if (region && region !== "us" && region !== "eu") {
    console.error(red('ETH_LINK_REGION must be "us" or "eu"'));
    process.exit(1);
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    apiKey,
    chain,
    withdrawalAddress:
      process.env.ETH_LINK_WITHDRAWAL_ADDRESS ||
      "0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1",
    amount: process.env.ETH_LINK_AMOUNT || "32",
    region,
  };
}

// ── HTTP helpers ────────────────────────────────────────────────────────────

interface RequestContext {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

interface ResponseContext {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: unknown;
}

function commonHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "x-request-id": crypto.randomUUID(),
  };
}

function redactHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const redacted = { ...headers };
  if (redacted["x-api-key"]) redacted["x-api-key"] = "***";
  return redacted;
}

function prettyJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

function extractResponseHeaders(response: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  response.headers.forEach((v, k) => {
    headers[k] = v;
  });
  return headers;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function httpGet(
  url: string,
  headers: Record<string, string>,
): Promise<{ req: RequestContext; res: ResponseContext }> {
  const req: RequestContext = { method: "GET", url, headers };
  const response = await fetch(url, { method: "GET", headers });
  const resHeaders = extractResponseHeaders(response);
  const body = await parseResponseBody(response);
  return {
    req,
    res: {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
      body,
    },
  };
}

async function httpPost(
  url: string,
  headers: Record<string, string>,
  data: unknown,
): Promise<{ req: RequestContext; res: ResponseContext }> {
  const req: RequestContext = { method: "POST", url, headers, body: data };
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  const resHeaders = extractResponseHeaders(response);
  const body = await parseResponseBody(response);
  return {
    req,
    res: {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
      body,
    },
  };
}

// ── Test harness ────────────────────────────────────────────────────────────

class SkippedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkippedError";
  }
}

interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
}

const results: TestResult[] = [];
let lastReq: RequestContext | undefined;
let lastRes: ResponseContext | undefined;

function printRequestResponse(): void {
  if (lastReq) {
    console.log(`    ${yellow("── Request ──")}`);
    console.log(`    ${dim("Method:")}  ${lastReq.method}`);
    console.log(`    ${dim("URL:")}     ${lastReq.url}`);
    console.log(
      `    ${dim("Headers:")} ${prettyJson(redactHeaders(lastReq.headers))}`,
    );
    if (lastReq.body) {
      console.log(`    ${dim("Body:")}    ${prettyJson(lastReq.body)}`);
    }
  }

  if (lastRes) {
    console.log(`    ${yellow("── Response ──")}`);
    console.log(
      `    ${dim("Status:")}  ${lastRes.status} ${lastRes.statusText}`,
    );
    console.log(`    ${dim("Headers:")} ${prettyJson(lastRes.headers)}`);
    if (lastRes.body) {
      console.log(`    ${dim("Body:")}    ${prettyJson(lastRes.body)}`);
    }
  } else if (lastReq) {
    console.log(`    ${yellow("── No Response (network error) ──")}`);
  }
}

function formatError(err: unknown): string {
  if (err instanceof TypeError && (err as any).cause) {
    // Node fetch wraps network errors in TypeError with a cause
    const cause = (err as any).cause;
    return `Network error: ${cause.message || err.message}`;
  }
  return err instanceof Error ? err.message : String(err);
}

async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  lastReq = undefined;
  lastRes = undefined;
  process.stdout.write(`  ${dim("Testing")} ${name}... `);
  try {
    await fn();
    const duration = Date.now() - start;
    results.push({ name, status: "passed", duration });
    console.log(`${green("PASS")} ${dim(`(${duration}ms)`)}`);
  } catch (err) {
    const duration = Date.now() - start;
    const message = formatError(err);
    if (err instanceof SkippedError) {
      results.push({ name, status: "skipped", duration, error: message });
      console.log(`${yellow("SKIP")} ${dim(`(${duration}ms)`)}`);
      console.log(`    ${yellow(message)}`);
    } else {
      results.push({ name, status: "failed", duration, error: message });
      console.log(`${red("FAIL")} ${dim(`(${duration}ms)`)}`);
      console.log(`    ${red(message)}`);
      printRequestResponse();
    }
  }
}

// ── Tests ───────────────────────────────────────────────────────────────────

let createdPubkey: string | undefined;

function assertRequestIdEcho(
  reqHeaders: Record<string, string>,
  resHeaders: Record<string, string>,
): void {
  const sent = reqHeaders["x-request-id"];
  const echoed = resHeaders["x-request-id"];
  if (sent && echoed && sent !== echoed) {
    throw new Error(`Request ID mismatch: sent ${sent}, got ${echoed}`);
  }
}

async function testHealthCheck(config: Config): Promise<void> {
  await runTest("GET /eth-link/health", async () => {
    const headers = commonHeaders(config.apiKey);
    const { req, res } = await httpGet(
      `${config.baseUrl}/eth-link/health`,
      headers,
    );
    lastReq = req;
    lastRes = res;

    if (res.status !== 200) {
      throw new Error(`Expected status 200, got ${res.status}`);
    }

    assertRequestIdEcho(req.headers, res.headers);

    const parsed = HealthResponse.safeParse(res.body);
    if (!parsed.success) {
      throw new Error(
        `Response validation failed: ${parsed.error.issues
          .map((i) => i.message)
          .join(", ")}`,
      );
    }

    if (!parsed.data.healthy) {
      throw new Error(
        `Provider reports unhealthy: ${parsed.data.message || "no message"}`,
      );
    }
  });
}

async function testCreateValidator(config: Config): Promise<void> {
  await runTest("POST /eth-link/validators/create", async () => {
    const headers: Record<string, string> = {
      ...commonHeaders(config.apiKey),
      "x-client-id": crypto.randomUUID(),
    };

    // Validate our own request body
    const reqParsed = CreateValidatorRequest.safeParse({
      blockchain: config.chain,
      withdrawalAddress: config.withdrawalAddress,
      amount: config.amount,
      region: config.region,
    });

    if (!reqParsed.success) {
      throw new Error(
        `Request body invalid: ${reqParsed.error.issues
          .map((i) => i.message)
          .join(", ")}`,
      );
    }

    const { req, res } = await httpPost(
      `${config.baseUrl}/eth-link/validators/create`,
      headers,
      reqParsed.data,
    );
    lastReq = req;
    lastRes = res;

    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Expected status 200 or 201, got ${res.status}`);
    }

    assertRequestIdEcho(req.headers, res.headers);

    const parsed = CreateValidatorResponse.safeParse(res.body);
    if (!parsed.success) {
      throw new Error(
        `Response validation failed: ${parsed.error.issues
          .map((i) => i.message)
          .join(", ")}`,
      );
    }

    // Verify amount matches request
    const responseAmountEth = (
      parsed.data.data.depositData.amount / 1e9
    ).toString();
    if (responseAmountEth !== config.amount) {
      throw new Error(
        `Amount mismatch: requested ${config.amount} ETH, got ${responseAmountEth} ETH`,
      );
    }

    // Verify HMAC signature
    const xSignature = res.headers["x-signature"];
    const xTimestamp = res.headers["x-timestamp"];
    const requestId = headers["x-request-id"];
    const depositDataRoot = parsed.data.data.depositData.depositDataRoot;

    if (!xSignature || !xTimestamp) {
      throw new Error("Missing x-signature or x-timestamp response headers");
    }

    const hmacValid = verifySignature(
      requestId,
      xTimestamp,
      depositDataRoot,
      config.apiKey,
      xSignature,
    );
    if (!hmacValid) {
      throw new Error("HMAC signature verification failed");
    }

    createdPubkey = parsed.data.data.depositData.pubkey;
  });
}

async function testDepositSubmittedEvent(config: Config): Promise<void> {
  await runTest(
    "POST /eth-link/validators/{pubkey}/events (DEPOSIT_SUBMITTED)",
    async () => {
      if (!createdPubkey)
        throw new SkippedError("No pubkey from createValidator");

      const headers = commonHeaders(config.apiKey);
      const body = {
        eventType: "DEPOSIT_SUBMITTED" as const,
        timestamp: new Date().toISOString(),
        details: {
          txHash: "0x" + "ab".repeat(32),
          amount: config.amount,
        },
      };

      const { req, res } = await httpPost(
        `${config.baseUrl}/eth-link/validators/${createdPubkey}/events`,
        headers,
        body,
      );
      lastReq = req;
      lastRes = res;

      if (res.status !== 200 && res.status !== 201) {
        throw new Error(`Expected status 200 or 201, got ${res.status}`);
      }

      assertRequestIdEcho(req.headers, res.headers);
    },
  );
}

async function testValidatorCanceledEvent(config: Config): Promise<void> {
  await runTest(
    "POST /eth-link/validators/{pubkey}/events (VALIDATOR_CANCELED)",
    async () => {
      if (!createdPubkey)
        throw new SkippedError("No pubkey from createValidator");

      const headers = commonHeaders(config.apiKey);
      const body = {
        eventType: "VALIDATOR_CANCELED" as const,
        timestamp: new Date().toISOString(),
        details: {
          reason: "CLI tester — automated test cancellation",
        },
      };

      const { req, res } = await httpPost(
        `${config.baseUrl}/eth-link/validators/${createdPubkey}/events`,
        headers,
        body,
      );
      lastReq = req;
      lastRes = res;

      if (res.status !== 200 && res.status !== 201) {
        throw new Error(`Expected status 200 or 201, got ${res.status}`);
      }

      assertRequestIdEcho(req.headers, res.headers);
    },
  );
}

// ── Summary ─────────────────────────────────────────────────────────────────

function printSummary(): void {
  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const total = results.length;

  console.log("");
  console.log(bold("─".repeat(60)));
  console.log(bold("  Summary"));
  console.log(bold("─".repeat(60)));

  for (const r of results) {
    if (r.status === "passed") {
      console.log(`  ${green("✓")} ${r.name} ${dim(`(${r.duration}ms)`)}`);
    } else if (r.status === "skipped") {
      console.log(
        `  ${yellow("○")} ${yellow(r.name)} ${dim(`(${r.duration}ms)`)}`,
      );
      if (r.error) console.log(`    ${yellow(`└─ ${r.error}`)}`);
    } else {
      console.log(`  ${red("✗")} ${red(r.name)} ${dim(`(${r.duration}ms)`)}`);
      if (r.error) console.log(`    ${red(`└─ ${r.error}`)}`);
    }
  }

  console.log(bold("─".repeat(60)));
  const parts: string[] = [green(`${passed} passed`)];
  if (skipped > 0) parts.push(yellow(`${skipped} skipped`));
  if (failed > 0) parts.push(red(`${failed} failed`));
  const status = `${parts.join(", ")} (${total} total)`;
  console.log(`  ${status}`);
  console.log(bold("─".repeat(60)));
  console.log("");

  if (failed > 0) process.exit(1);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const config = loadConfig();

  console.log("");
  console.log(cyan("  Eth-Link API Validator"));
  console.log(bold("─".repeat(60)));
  console.log(`  ${dim("Base URL:")}    ${config.baseUrl}`);
  console.log(`  ${dim("Chain:")}       ${config.chain}`);
  console.log(`  ${dim("Amount:")}      ${config.amount} ETH`);
  console.log(`  ${dim("Withdrawal:")}  ${config.withdrawalAddress}`);
  if (config.region) console.log(`  ${dim("Region:")}      ${config.region}`);
  console.log(bold("─".repeat(60)));
  console.log("");

  await testHealthCheck(config);
  await testCreateValidator(config);
  await testDepositSubmittedEvent(config);
  await testValidatorCanceledEvent(config);

  printSummary();
}

main().catch((err) => {
  console.error(red(`Unexpected error: ${formatError(err)}`));
  process.exit(1);
});
