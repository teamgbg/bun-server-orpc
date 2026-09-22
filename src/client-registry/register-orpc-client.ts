/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Registers the browser ORPC client (called once at boot).
 */

import { state } from "./state";
import type { ORPCClient } from "./types";

export function registerOrpcClient(client: ORPCClient): void {
	state._client = client;
}
