/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Factory creating lazy-loaded TanStack Query utilities from an ORPC client.
 * Wraps @orpc/tanstack-query with a proxy that defers client initialization
 * until first property access, avoiding circular dependency issues at boot.
 */

import { createTanstackQueryUtils, type RouterUtils } from "@orpc/tanstack-query";
import type { NestedClient } from "@orpc/client";

/** Create lazy-loaded TanStack Query utils from an ORPC client */
export function createOrpcQueryUtils(
	client: NestedClient<any>,
): RouterUtils<NestedClient<any>> {
	let _orpc: RouterUtils<NestedClient<any>> | null = null;

	// Lazy proxy: the target is `{}` at compile time but forwards every access to
	// the real TanStack Query utils at runtime. TS cannot infer a proxy's
	// forwarded type, so cast through `unknown` at this boundary.
	return new Proxy(
		{},
		{
			get(_, prop) {
				if (!_orpc) {
					_orpc = createTanstackQueryUtils(client);
				}
				return (_orpc as unknown as Record<string | symbol, unknown>)[prop];
			},
		},
	) as unknown as RouterUtils<NestedClient<any>>;
}
