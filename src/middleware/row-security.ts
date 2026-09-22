/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * ORPC middleware enforcing row-level security on CRUD inputs. Validates where/data
 * clauses against the user's organisation or user scope for protected tables,
 * throwing FORBIDDEN for out-of-scope access attempts.
 */

import { ORPCError, os } from "@orpc/server";
import { getLogger, loadRegistryConfig } from "../configure";
import type { OrgScope } from "@teamscala/os/contracts/org-scope";
import type { RpcInitialContext, RpcUser } from "./types";
import { createCache } from "@teamscala/cache/create-cache";
import { getAppLogger } from "@teamscala/logger/app-loggers";

const rpcLogger = getLogger();

const orgScopeCache = createCache<OrgScope>("orpc:org-scope-config", {
	ttlMs: Number.POSITIVE_INFINITY,
	maxSize: 1,
});

async function getOrgScopeConfig(): Promise<OrgScope> {
	const hit = orgScopeCache.getWithMeta("default");
	if (hit) return hit.value;
	const runtimeConfig = await loadRegistryConfig<{
		rowSecurityCacheTtlMs: number;
	}>("config", "orpc-runtime");
	const config = await loadRegistryConfig<OrgScope>("config", "org-scope");
	orgScopeCache.set("default", config, runtimeConfig.rowSecurityCacheTtlMs);
	return config;
}

function requiresOrgScope(model: string, config: OrgScope): boolean {
	return config.relationChains.some((c) => c.model === model);
}

function requiresUserScope(model: string, config: OrgScope): boolean {
	return config.userScopedAllowlist.includes(model);
}

function validateRowAccess(
	model: string,
	input: Record<string, unknown>,
	ctx: {
		userId: string;
		organisationId: string | null;
		isSuperAdmin: boolean;
		impersonatedBy: string | null | undefined;
	},
	config: OrgScope,
): string | null {
	if (config.authProtectedModels.includes(model)) {
		return `Model "${model}" is auth-protected — writes must go through Better Auth APIs`;
	}

	if (requiresUserScope(model, config)) {
		const where = input.where as Record<string, unknown> | undefined;
		if (where?.user_id && where.user_id !== ctx.userId) {
			return `User-scoped model "${model}" — cannot access another user's data`;
		}
	}

	if (config.protectedWriteFields.length > 0) {
		const data = input.data as Record<string, unknown> | undefined;
		if (data) {
			for (const field of config.protectedWriteFields) {
				if (field in data && !ctx.isSuperAdmin && !ctx.impersonatedBy) {
					return `Field "${field}" on model "${model}" is write-protected for non-admins`;
				}
			}
		}
	}

	return null;
}

export const rowSecurity = os
	.$context<RpcInitialContext & { user?: RpcUser }>()
	.middleware(async ({ context, next, path }, input: unknown) => {
		const { user } = context;
		if (!user?.userId) return next({});

		if (user.isSuperAdmin || user.impersonatedBy) {
			return next({ context: { orgId: user.organisationId || null } });
		}

		const model = path[0];
		if (!model) {
			return next({ context: { orgId: user.organisationId || null } });
		}

		let config: OrgScope | undefined;
		let configFailed = false;
		try {
			config = await getOrgScopeConfig();
		} catch (error) {
			// Config unavailable degrades scoping to the user's own org — a
			// declared fail-open, never a silent one.
			getAppLogger().error(`[row-security] org-scope config unavailable — degraded to own-org: ${String(error)}`);
			configFailed = true;
		}
		if (configFailed || !config) {
			return next({ context: { orgId: user.organisationId || null } });
		}

		if (!requiresOrgScope(model, config) && !requiresUserScope(model, config)) {
			return next({ context: { orgId: user.organisationId || null } });
		}

		if (input && typeof input === "object") {
			const accessError = validateRowAccess(
				model,
				input as Record<string, unknown>,
				{
					userId: user.userId,
					organisationId: user.organisationId ?? null,
					isSuperAdmin: user.isSuperAdmin ?? false,
					impersonatedBy: user.impersonatedBy,
				},
				config,
			);

			if (accessError) {
				rpcLogger.warn("ORPC row-level access denied", {
					model,
					operation: path[1],
					error: accessError,
					userId: user.userId,
				});
				throw new ORPCError("FORBIDDEN", { message: accessError });
			}
		}

		return next({ context: { orgId: user.organisationId || null } });
	});
