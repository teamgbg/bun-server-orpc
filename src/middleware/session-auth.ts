/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * ORPC middleware for BetterAuth session validation. Extracts session tokens from
 * cookies, resolves user data via BetterAuth, and caches results with TTL to reduce
 * auth overhead across concurrent RPC calls in scala-hub.
 */

import { ORPCError, os } from "@orpc/server";
import { getAuth as getConfiguredAuth, getLogger } from "../configure";
import { ManagedCache } from "@teamscala/cache/cache";
import type { RpcInitialContext } from "./types";

const rpcLogger = getLogger();

type SessionData = {
	user: { id: string; name?: string | null; email: string };
	session?: {
		activeOrganizationId?: string | null;
		impersonatedBy?: string | null;
	} | null;
} | null;

export type { SessionData };

export const sessionCache = new ManagedCache<SessionData>("session-auth", {
	ttlMs: 300_000,
	maxSize: 200,
});
const sessionInflight = new Map<string, Promise<SessionData>>();

function extractSessionToken(headers: Headers): string | null {
	const cookie = headers.get("cookie") || "";
	const match = cookie.match(
		/(?:__Secure-)?better-auth\.session_token=([^;]+)/,
	);
	return match?.[1] || null;
}

export const sessionAuth = os
	.$context<
		RpcInitialContext & { user?: { userId: string }; isServiceCall?: boolean }
	>()
	.middleware(async ({ context, next }) => {
		// Skip if API key auth already provided a user
		if (context.user?.userId) return next({});

		const { headers } = context;
		const token = extractSessionToken(headers);

		if (token) {
			const cached = sessionCache.get(token);
			if (cached !== undefined) {
				if (!cached?.user?.id) {
					throw new ORPCError("UNAUTHORIZED");
				}
				return next({
					context: {
						sessionUser: cached.user,
						sessionState: cached.session,
					},
				});
			}

			// Dedup concurrent lookups for same token
			const inflight = sessionInflight.get(token);
			if (inflight) {
				const session = await inflight;
				if (!session?.user?.id) throw new ORPCError("UNAUTHORIZED");
				return next({
					context: { sessionUser: session.user, sessionState: session.session },
				});
			}
		}

		// Resolve session via the bootloader-injected auth provider (configured-
		// primitives surface — orpc is primitives-tier and must NOT import the
		// utilities-tier auth package directly). getConfiguredAuth() returns the
		// injected provider; its .getAuth() yields the BetterAuth instance.
		const auth = (await getConfiguredAuth().getAuth()) as {
			api: { getSession: (args: { headers: Headers }) => Promise<SessionData> };
		};

		const sessionPromise = auth.api.getSession({ headers });
		if (token) sessionInflight.set(token, sessionPromise);

		let session: SessionData;
		try {
			session = await sessionPromise;
		} catch (error) {
			rpcLogger.error("Session lookup failed", { error });
			throw new ORPCError("UNAUTHORIZED");
		} finally {
			if (token) sessionInflight.delete(token);
		}

		// Cache result
		if (token && session?.user?.id) {
			sessionCache.set(token, session);
		}

		if (!session?.user?.id) {
			throw new ORPCError("UNAUTHORIZED");
		}

		return next({
			context: {
				sessionUser: session.user,
				sessionState: session.session,
			},
		});
	});
