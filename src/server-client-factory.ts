/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Server-side ORPC client factory for scala-hub route loaders and actions.
 * Bypasses HTTP transport to call procedures directly with Prisma and user/org
 * context injected, enabling authenticated internal service calls.
 */

import { createRouterClient, type AnyRouter, type RouterClient } from "@orpc/server";
import { getPrisma } from "./configure";

interface UserContext {
	userId: string;
	organisationId?: string | null;
	isSuperAdmin?: boolean;
	email?: string;
	name?: string;
}

export async function buildServerClient<T extends AnyRouter>(
	router: T,
	user?: UserContext,
): Promise<RouterClient<T>> {
	const prisma = getPrisma();

	// The context is a fixed runtime contract ({ prisma, user }) that the
	// generated routers expect. The generic <T> narrows only the return type;
	// createRouterClient cannot verify a concrete context against an unresolved
	// generic InferRouterInitialContext<T>, so construct at the AnyRouter level
	// (where InferRouterInitialContext<AnyRouter> resolves and the context is
	// statically sound) and assert the return — the same boundary-assertion
	// shape used by createServerClientFactory's internal build wrapper below.
	const context = user
		? {
				prisma,
				user: {
					userId: user.userId,
					organisationId: user.organisationId || null,
					isSuperAdmin: user.isSuperAdmin || false,
					email: user.email || null,
					name: user.name || null,
				},
			}
		: // No explicit user → SYSTEM super-admin context, mirroring the
			// page-server client registration in service-boot (register-page-server-client.ts). This is an IN-PROCESS server
			// client — its callers are the service's own trusted code (state-machine updateAgentFields, loga, cli-session), and the
			// registry's contract is "Get an authenticated ORPC server client". The previous bare `{ prisma }` context made every
			// generated-router call through a no-arg getServerClient() throw ORPCError UNAUTHORIZED ("Authentication required") — nothing
			// anywhere ever called registerServerClientFactory, so the unauthenticated fallback was the ONLY client that existed, and
			// fleet assign_work spawns died at updateAgentFields after the
			// prompt was already delivered (observed 2026-06-04/05, every
			// dispatch failing). Code acting on behalf of a real user must
			// keep passing that user explicitly — this default is only the
			// no-arg system path.
			{
				prisma,
				user: {
					userId: "system",
					organisationId: null,
					isSuperAdmin: true,
					email: null,
					name: "system",
				},
			};

	return createRouterClient(router as AnyRouter, { context }) as unknown as Promise<RouterClient<T>>;
}

function createBrowserServerClient(): RouterClient<AnyRouter> {
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
									`ORPC server client cannot be used in the browser. ` +
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

/**
 * Create a server client factory bound to a router getter.
 *
 * Returns a getServerClient function that lazily builds and caches the client.
 * Uses a promise-based lock to prevent cache stampede. `TRouter` defaults to
 * `AnyRouter` (the router is runtime-discovered via getRouter, so AnyRouter is
 * the static truth here); a caller that binds a typed router narrows it.
 */
export function createServerClientFactory<TRouter extends AnyRouter = AnyRouter>(
	getRouter: () => Promise<unknown>,
) {
	let cachedClient: RouterClient<TRouter> | null = null;
	let clientPromise: Promise<RouterClient<TRouter>> | null = null;

	// The router is runtime-discovered via getRouter, so buildServerClient yields
	// RouterClient<AnyRouter>; the caller's TRouter narrows it for downstream
	// procedure typing (same boundary-assertion shape as createBrowserOrpcClient).
	const build = (
		router: AnyRouter,
		user?: UserContext,
	): Promise<RouterClient<TRouter>> =>
		buildServerClient(router, user) as unknown as Promise<RouterClient<TRouter>>;

	return async function getServerClient(user?: UserContext): Promise<RouterClient<TRouter>> {
		if (typeof window !== "undefined") {
			return createBrowserServerClient() as unknown as RouterClient<TRouter>;
		}

		const router = (await getRouter()) as AnyRouter;

		if (user) {
			return build(router, user);
		}

		// Always build fresh from the current router. The router itself is cached
		// by getAppRouter() (after the 2.6.98 fix that avoids caching an incomplete
		// router at boot). Building a RouterClient is lightweight — just
		// createRouterClient(router, { context }) — so the per-call cost is
		// negligible. The previous cache poisoned the client for the process
		// lifetime when the first call landed at boot against an incomplete router,
		// making every model namespace permanently undefined.
		return build(router);
	};
}
