import { z } from "zod";

/** Schema for GET /eth-link/health response body */
export const HealthResponse = z.object({
  healthy: z.boolean(),
  timestamp: z.string().datetime(),
  message: z.string().optional(),
});
export type HealthResponse = z.infer<typeof HealthResponse>;
