import type { IncomingHttpHeaders } from "http";

/**
 * Extract and validate the x-request-id header from an incoming request.
 * Returns null if the header is missing or not a valid UUID.
 */
export function extractRequestId(headers: IncomingHttpHeaders): string | null {
  const value = headers["x-request-id"];
  if (typeof value !== "string") return null;

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return UUID_REGEX.test(value) ? value : null;
}

/**
 * Extract the x-api-key header from an incoming request.
 * Returns null if the header is missing.
 */
export function extractApiKey(headers: IncomingHttpHeaders): string | null {
  const value = headers["x-api-key"];
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Extract the x-client-id header from an incoming request.
 * Returns null if the header is missing or not a valid UUID.
 */
export function extractClientId(headers: IncomingHttpHeaders): string | null {
  const value = headers["x-client-id"];
  if (typeof value !== "string") return null;

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return UUID_REGEX.test(value) ? value : null;
}
