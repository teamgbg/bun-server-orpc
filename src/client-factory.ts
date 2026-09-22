/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Browser ORPC client factory for scala-hub frontend. Creates an HTTP client that
 * injects the organisation ID from the URL path into X-Organisation-Id headers,
 * with SSR-safe proxying for TanStack Router loaders and client components.
 */

import { createORPCClient, type NestedClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { TypedORPCClient } from "./client-types.ts";
import { createCache } from "@teamscala/cache/create-cache";
import {
	ClientRetryPlugin,
	DedupeRequestsPlugin,
	RetryAfterPlugin,
} from "@orpc/client/plugins";

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const retryPlugin = new ClientRetryPlugin({
	default: {
		retry: 2,
		retryDelay: ({ attemptIndex }) => Math.min(1000 * 2 ** attemptIndex, 5000),
		shouldRetry: ({ error }) => {
			if (error instanceof Error && "status" in error) {
				const status = (error as { status?: number }).status;
				return !status || status >= 500;
			}
			return true;
		},
	},
});

const dedupePlugin = new DedupeRequestsPlugin({
	groups: [
		{
			condition: ({ request }) => request.method === "GET",
			context: {},
		},
	],
});

const retryAfterPlugin = new RetryAfterPlugin();

function getPortalOrgIdFromLocation(): string | null {
	if (typeof window === "undefined") return null;
	const segments = window.location.pathname.split("/").filter(Boolean);
	if (segments[0] !== "portal" || segments.length < 3) return null;
	const orgId = segments[2];
	return UUID_RE.test(orgId) ? orgId! : null;
}

const portalClientCache = createCache<NestedClient<any>>(
	"orpc:portal-client",
	{ ttlMs: Number.POSITIVE_INFINITY, maxSize: 1 },
);

function getClient(): NestedClient<any> {
	if (typeof window !== "undefined") {
		let cachedClient = portalClientCache.get("default");
		if (!cachedClient) {
			const link = new RPCLink({
				url: `${window.location.origin}/api/rpc`,
				fetch: (input, init) => {
					const headers = new Headers((init as RequestInit)?.headers);
					const orgId = getPortalOrgIdFromLocation();
					if (orgId) {
						headers.set("X-Organisation-Id", orgId);
					}
					return fetch(input, { ...init, headers });
				},
				plugins: [retryPlugin, dedupePlugin, retryAfterPlugin],
			});
			cachedClient = createORPCClient(link);
			portalClientCache.set("default", cachedClient);
		}
		return cachedClient;
	}

	return new Proxy(
		{},
		{
			get(_, prop) {
				return new Proxy(
					{},
					{
						get(_, method) {
							return () => {
								throw new Error(
									`ORPC client cannot be used on server. ` +
										`Attempted: ${String(prop)}.${String(method)}. ` +
										`Use route loaders with direct Prisma access for SSR data.`,
								);
							};
						},
					},
				);
			},
		},
	);
}

/** Create a lazy-evaluated ORPC client proxy */
export function createBrowserOrpcClient(): TypedORPCClient {
	// The proxy forwards every access to the real ORPC client (which carries the
	// generated router shape + the runtime-registered `fn` router), so at runtime
	// it IS a TypedORPCClient. TS cannot infer a proxy's forwarded type, so the
	// cast through `unknown` is the correct, unavoidable boundary annotation.
	return new Proxy(
		{},
		{
			get(_, prop, receiver) {
				return Reflect.get(getClient(), prop, receiver);
			},
		},
	) as unknown as TypedORPCClient;
}
