import * as http from "http";
import * as crypto from "crypto";
import { CreateValidatorRequest, ValidatorEventRequest, BLSPublicKey } from "@fireblocks/eth-staking-eth-link-types";
import { signResponse, extractRequestId, extractApiKey, extractClientId } from "@fireblocks/eth-staking-eth-link-api-validator";

const API_KEY = process.env.API_KEY ?? "dev-api-key-for-testing";
const PORT = parseInt(process.env.PORT ?? "3001", 10);

/**
 * Standalone Eth-Link provider using only Node.js http + the validation package.
 *
 * This example shows how to implement the Eth-Link protocol without the
 * server middleware package — useful if you're using a different framework
 * (Fastify, Koa, Hapi) or want full control over the HTTP layer.
 */

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

function sendJson(res: http.ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}): void {
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function sendError(res: http.ServerResponse, status: number, code: string, message: string, requestId?: string): void {
  const headers: Record<string, string> = {};
  if (requestId) headers["x-request-id"] = requestId;
  sendJson(res, status, { message, code }, headers);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const method = req.method ?? "GET";

  // Auth check
  const apiKey = extractApiKey(req.headers);
  if (!apiKey || apiKey !== API_KEY) {
    sendError(res, 401, "UNAUTHORIZED", "Unauthorized");
    return;
  }

  // Request ID
  const requestId = extractRequestId(req.headers);
  if (!requestId) {
    sendError(res, 400, "INVALID_REQUEST", "Missing or invalid x-request-id");
    return;
  }

  // Route: GET /eth-link/health
  if (method === "GET" && url.pathname === "/eth-link/health") {
    sendJson(res, 200, {
      healthy: true,
      timestamp: new Date().toISOString(),
      message: "Standalone provider running",
    }, { "x-request-id": requestId });
    return;
  }

  // Route: POST /eth-link/validators/create
  if (method === "POST" && url.pathname === "/eth-link/validators/create") {
    const clientId = extractClientId(req.headers);
    if (!clientId) {
      sendError(res, 400, "INVALID_REQUEST", "Missing or invalid x-client-id", requestId);
      return;
    }

    const raw = await readBody(req);
    const parsed = CreateValidatorRequest.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      sendError(res, 400, "INVALID_ARGUMENT", parsed.error.issues[0]?.message ?? "Invalid request", requestId);
      return;
    }

    // TODO: Replace with real BLS key generation
    const pubkey = "0x" + crypto.randomBytes(48).toString("hex");
    const signature = "0x" + crypto.randomBytes(96).toString("hex");
    const depositDataRoot = "0x" + crypto.randomBytes(32).toString("hex");
    const addressHex = parsed.data.withdrawalAddress.replace("0x", "").toLowerCase();
    const withdrawalCredentials = "02" + "0".repeat(22) + addressHex;
    const amountGwei = Math.round(parseFloat(parsed.data.amount) * 1e9);

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const hmacSignature = signResponse(requestId, timestamp, depositDataRoot, API_KEY);

    const body = {
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

    sendJson(res, 200, body, {
      "x-request-id": requestId,
      "x-timestamp": timestamp,
      "x-signature": hmacSignature,
    });
    return;
  }

  // Route: POST /eth-link/validators/{pubkey}/events
  const eventsMatch = url.pathname.match(/^\/eth-link\/validators\/([^/]+)\/events$/);
  if (method === "POST" && eventsMatch) {
    const pubkey = eventsMatch[1];

    if (!BLSPublicKey.safeParse(pubkey).success) {
      sendError(res, 400, "INVALID_ARGUMENT", "Invalid validator public key format", requestId);
      return;
    }

    const raw = await readBody(req);
    const parsed = ValidatorEventRequest.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      sendError(res, 400, "INVALID_ARGUMENT", parsed.error.issues[0]?.message ?? "Invalid request", requestId);
      return;
    }

    console.log(`Received ${parsed.data.eventType} for ${pubkey}`);
    sendJson(res, 200, {}, { "x-request-id": requestId });
    return;
  }

  // 404 for unmatched routes
  sendError(res, 404, "NOT_FOUND", `Unknown route: ${method} ${url.pathname}`, requestId);
});

server.listen(PORT, () => {
  console.log(`Eth-Link standalone provider listening on port ${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/eth-link/health`);
});
