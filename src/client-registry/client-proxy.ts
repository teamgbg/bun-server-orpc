/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Lazy proxy — safe at module scope, resolves on first property access.
 */

import { state } from "./state";
import type { ORPCClient } from "./types";

export const client: ORPCClient = new Proxy({} as ORPCClient, {
	get(_, prop, receiver) {
		if (!state._client) {
			throw new Error(
				"ORPC client not registered. Ensure src/lib/orpc/client.ts is imported before use.",
			);
		}
		return Reflect.get(state._client, prop, receiver);
	},
});
