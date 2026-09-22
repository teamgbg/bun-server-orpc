/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Shared type definitions for the ORPC middleware chain. Defines RpcInitialContext
 * (Prisma client and request headers) and RpcUser (resolved user identity
 * injected by auth middleware for downstream procedures).
 */

import type { PrismaClient } from "@teamscala/db/client";
import type { InjectedDb8 } from "../configure";

interface OrpcBaseContext {
	prisma: PrismaClient;
	/** Prisma 8 chained client — optional during the v7/v8 coexistence window. Present only when the boot layer created it (service contract + @prisma/orm-postgres available). Generated v8 procedures must throw a loud, actionable error when absent. */
	db8?: InjectedDb8;
}

/** Initial context passed from the Hono mount to RPCHandler.handle() */
export interface RpcInitialContext {
	prisma: OrpcBaseContext["prisma"];
	db8?: OrpcBaseContext["db8"];
	headers: Headers;
}

/** User context injected by auth middleware */
export interface RpcUser {
	userId: string;
	organisationId?: string | null;
	name?: string | null;
	email?: string | null;
	isSuperAdmin?: boolean;
	isAdmin?: boolean;
	impersonatedBy?: string | null;
	serviceSource?: string | null;
	agentId?: string | null;
}
