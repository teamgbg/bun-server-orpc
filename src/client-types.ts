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
export type TypedORPCClient<
	TRouter extends AnyRouter = AnyRouter,
> = RouterClient<TRouter> & {
	/**
	 * Server function procedures (non-Prisma) registered at runtime via
	 * the generated bundle's fn namespace (orpc-bundle from api_route rows).
	 * Most members are ROUTERS — two access levels, fn.<router>.<procedure>
	 * (auth, chatSession, publicAgreement, publicGptSession, ...). A few
	 * members are BARE procedures registered directly on fn (aiHealth,
	 * messagingWhatsappSend) and listed explicitly below.
	 */
	fn: Record<
		string,
		Record<string, (...args: unknown[]) => Promise<unknown>>
	> & {
		aiHealth: (...args: unknown[]) => Promise<unknown>;
		communityJoin: (...args: unknown[]) => Promise<unknown>;
		messagingWhatsappSend: (...args: unknown[]) => Promise<unknown>;
	};
};

/**
 * Pick specific models from the client for narrow interfaces.
 * Usage: `PickModels<typeof appRouter, 'organisation_profile' | 'user'>`
 */
export type PickModels<
	TRouter extends AnyRouter = AnyRouter,
	K extends keyof TypedORPCClient<TRouter> = keyof TypedORPCClient<TRouter>,
> = Pick<TypedORPCClient<TRouter>, K>;
