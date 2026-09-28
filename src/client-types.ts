/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Generic typed ORPC client, parameterized by a service's generated router. The
 * fully-typed router is per-service — each service's generated
 * `prisma/generated/orpc/routers/index.ts` exports `type AppRouter = typeof appRouter`,
 * so a shared primitive cannot carry every service's procedures in one concrete
 * type. Each service instantiates this with its own router
 * (`TypedORPCClient<typeof appRouter>`) for full procedure typing; the `AnyRouter`
 * default keeps unconstrained call sites compiling (sound, but no specific
 * procedures). Passing `any` is forbidden — against @orpc/server's RouterClient
 * definition `any` distributes through the conditional into a string-index
 * signature, collapsing every procedure to `unknown` (the prior bug).
 */

import type { AnyRouter, RouterClient } from "@orpc/server";

/**
 * Typed ORPC client. Instantiate with a service router for full procedures;
 * the `AnyRouter` default is sound but carries none.
 */
export type TypedOrpcFnMethod = (args?: unknown) => Promise<unknown>;

/**
 * One fn-tree node: BOTH callable (a bare procedure) and further indexable (a
 * namespace) — the generated tree contains both, so no two-level Record types
 * it (measured: the namespaced spelling failed with "Property 'health' does not
 * exist on type 'BlockOrpcClientMethod'" until the node intersection landed as
 * BlockOrpcClientNode in ui-foundation 1bb4f735, which this mirrors). The node
 * types path DEPTH, not that a NAME is served: the proof of a name is the
 * api_route row plus the regenerated router, never this type.
 */
export type TypedOrpcFnNode = TypedOrpcFnMethod & { [key: string]: TypedOrpcFnNode };

export type TypedORPCClient<TRouter extends AnyRouter = AnyRouter> = RouterClient<TRouter> & {
	/** Server fn procedures (orpc-bundle from api_route rows): a node, so a bare
	 * procedure (fn.chatHealth) and a namespace (fn.chat.transcribe) both type. */
	fn: TypedOrpcFnNode;
};

/**
 * Pick specific models from the client for narrow interfaces.
 * Usage: `PickModels<typeof appRouter, 'organisation_profile' | 'user'>`
 */
export type PickModels<
	TRouter extends AnyRouter = AnyRouter,
	K extends keyof TypedORPCClient<TRouter> = keyof TypedORPCClient<TRouter>,
> = Pick<TypedORPCClient<TRouter>, K>;
