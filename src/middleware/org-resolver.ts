/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * ORPC middleware resolving authenticated user organisation membership and roles.
 * Validates BetterAuth session against the database with TTL caching and request
 * deduplication, injecting resolved org context for downstream procedures.
 */

import { os } from "@orpc/server";
import { getLogger } from "../configure";
import { ManagedCache } from "@teamscala/cache/cache";
import { resolveModelOrm } from "@teamscala/db/orm-adapter/model-orm";
import type { RpcInitialContext, RpcUser } from "./types";

const rpcLogger = getLogger();

export interface AuthCacheEntry {
	effectiveOrgId: string | null;
	membershipRole: string | null;
	isSuperAdmin: boolean;
}

export const authCache = new ManagedCache<AuthCacheEntry>("org-resolver", {
	ttlMs: 300_000,
	maxSize: 200,
});
const authInflight = new Map<string, Promise<AuthCacheEntry>>();

export const orgResolver = os
	.$context<
		RpcInitialContext & {
			user?: RpcUser;
			isServiceCall?: boolean;
			sessionUser?: { id: string; name?: string | null; email: string };
			sessionState?: {
				activeOrganizationId?: string | null;
				impersonatedBy?: string | null;
			} | null;
		}
	>()
	.middleware(async ({ context, next }) => {
		// Skip if API key auth already resolved user
		if (context.user?.userId) return next({});

		const { headers, prisma, db8, sessionUser, sessionState } = context;
		if (!sessionUser) return next({});

		const userId = sessionUser.id;
		const requestedOrgId = headers.get("X-Organisation-Id");
		const candidateOrgId =
			requestedOrgId || sessionState?.activeOrganizationId || null;
		const cacheKey = `${userId}:${candidateOrgId || "none"}`;

		// Check cache
		const cached = authCache.get(cacheKey);
		if (cached) {
			return next({
				context: { user: buildUser(cached, sessionUser, sessionState) },
			});
		}

		// Dedup concurrent lookups
		const inflight = authInflight.get(cacheKey);
		if (inflight) {
			const resolved = await inflight;
			return next({
				context: { user: buildUser(resolved, sessionUser, sessionState) },
			});
		}

		// Version-agnostic ORM: the v7 client itself when db8 is absent,
		// the adapter-bound v8 facade when present. The findFirst option
		// objects flow through unchanged — v7 honours `select`, v8 ignores
		// it and the consumed fields (id, role) exist on the full record.
		const orm = resolveModelOrm(db8, prisma);

		// Resolve membership + superadmin
		const authPromise = (async (): Promise<AuthCacheEntry> => {
			let effectiveOrgId = candidateOrgId;
			let membershipRole: string | null = null;

			const superAdminCheck = orm.user.findFirst({
				where: { id: userId, role: "super_admin" },
				select: { id: true },
			});

			let isSuperAdmin = false;

			if (candidateOrgId) {
				const [membership, superAdminUser] = await Promise.all([
					orm.member.findFirst({
						where: { user_id: userId, organization_id: candidateOrgId },
						select: { id: true, role: true },
					}) as Promise<{ id: string; role: string } | null>,
					superAdminCheck as Promise<{ id: string } | null>,
				]);
				if (!membership) {
					rpcLogger.warn("Session active org has no membership", {
						userId,
						candidateOrgId,
						requestedOrgId,
					});
					effectiveOrgId = null;
				} else {
					membershipRole = membership.role;
				}
				isSuperAdmin = !!superAdminUser;
			} else {
				isSuperAdmin = !!(await superAdminCheck);
			}

			const entry: AuthCacheEntry = {
				effectiveOrgId,
				membershipRole,
				isSuperAdmin,
			};

			authCache.set(cacheKey, entry);
			return entry;
		})();

		authInflight.set(cacheKey, authPromise);
		let resolved: AuthCacheEntry;
		try {
			resolved = await authPromise;
		} finally {
			authInflight.delete(cacheKey);
		}

		return next({
			context: { user: buildUser(resolved, sessionUser, sessionState) },
		});
	});

function buildUser(
	auth: AuthCacheEntry,
	sessionUser: { id: string; name?: string | null; email: string },
	sessionState?: { impersonatedBy?: string | null } | null,
): RpcUser {
	return {
		userId: sessionUser.id,
		organisationId: auth.effectiveOrgId,
		name: sessionUser.name,
		email: sessionUser.email,
		isSuperAdmin: auth.isSuperAdmin,
		isAdmin:
			auth.isSuperAdmin ||
			["owner", "admin"].includes(auth.membershipRole || ""),
		impersonatedBy: sessionState?.impersonatedBy || null,
	};
}
