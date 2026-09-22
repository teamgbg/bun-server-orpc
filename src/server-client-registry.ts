/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Registry for the server-side ORPC client used by scala-hub packages.
 * Lazy-initialises an authenticated client bound to the app router for internal
 * cross-service procedure calls without HTTP round-trips.
 */

/**
 * Get a TYPED ORPC server client bound to a caller-supplied router.
 *
 * `getServerClient()` is intentionally `AnyRouter` (the app router is
 * runtime-discovered via getAppRouter, so AnyRouter is the static truth and a
 * typed default regresses consumers). A caller that wants typed model access
 * passes its OWN typed router (e.g. a per-service generated appRouter, or one
 * built from @teamscala/db via createPrismaModelRouter) and gets a
 * RouterClient<typeof router> with the same system-authed context — opt-in,
 * no global change. Used only at call-sites that want typed model.method.
 */

export interface ServerClientUserContext {
	userId: string;
	organisationId?: string | null;
	isSuperAdmin?: boolean;
	email?: string;
	name?: string;
}

import type { AnyRouter, RouterClient } from "@orpc/server";
import type {
	TypedORPCClient,
} from "./client-types.ts";

/**
 * Typed ORPC server client. Instantiate with a service router for full
 * procedures; the `AnyRouter` default is sound but carries none.
 */
export type ServerClient<
	TRouter extends AnyRouter = AnyRouter,
> = TypedORPCClient<TRouter>;

type ServerClientFactory = (
	user?: ServerClientUserContext,
) => Promise<ServerClient>;

let _factory: ServerClientFactory | null = null;

/** Register the server client factory (called once at boot) */
export function registerServerClientFactory(
	factory: ServerClientFactory,
): void {
	_factory = factory;
}

async function ensureFactory(): Promise<ServerClientFactory> {
	if (_factory) return _factory;
	const { createServerClientFactory } = await import(
		"./server-client-factory.ts"
	);
	const { getAppRouter } = await import("./app-router.ts");
	// createServerClientFactory produces RouterClient<AnyRouter> (the router is
	// runtime-discovered via getAppRouter, so AnyRouter is the static truth at this
	// layer); ServerClient adds the runtime-registered `fn` router. The runtime
	// client carries `fn`, so cast at this factory-boundary.
	_factory = createServerClientFactory(
		getAppRouter,
	) as unknown as ServerClientFactory;
	return _factory;
}

/** Get an authenticated ORPC server client */
export async function getServerClient(
	user?: ServerClientUserContext,
): Promise<ServerClient> {
	const factory = await ensureFactory();
	return factory(user);
}

export async function getTypedServerClient<TRouter extends AnyRouter>(
	router: TRouter,
	user?: ServerClientUserContext,
): Promise<RouterClient<TRouter>> {
	const { buildServerClient } = await import("./server-client-factory.ts");
	return buildServerClient<TRouter>(router, user);
}
