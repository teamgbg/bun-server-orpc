/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Central registry for TanStack Query ORPC utilities, consumed by packages that
 * need typed query options without importing from the app layer. Implements a
 * lazy proxy that throws until the query utils are registered at boot.
 */

type OrpcQueryUtils = Record<string, unknown>;

let _orpc: OrpcQueryUtils | null = null;

/** Register the TanStack Query ORPC utils (called once at boot) */
export function registerOrpcQuery(orpc: OrpcQueryUtils): void {
	_orpc = orpc;
}

/** Lazy proxy — safe to use at module scope, resolves on first access */
export const orpc: OrpcQueryUtils = new Proxy({} as OrpcQueryUtils, {
	get(_, prop, receiver) {
		if (!_orpc) {
			throw new Error(
				"ORPC query utils not registered. Ensure src/lib/orpc/query.ts is imported before use.",
			);
		}
		return Reflect.get(_orpc, prop, receiver);
	},
});
