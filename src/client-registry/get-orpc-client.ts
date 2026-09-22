/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Returns the registered browser ORPC client.
 */

import { state } from "./state";
import type { ORPCClient } from "./types";

export function getOrpcClient(): ORPCClient {
	if (!state._client) {
		throw new Error(
			"ORPC client not registered. Ensure src/lib/orpc/client.ts is imported before use.",
		);
	}
	return state._client;
}
