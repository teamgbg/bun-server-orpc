/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Module-level state — holds the singleton ORPC client instance.
 */
import type { ORPCClient } from "./types";

export const state = { _client: null as ORPCClient | null };
