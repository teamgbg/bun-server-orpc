/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * ORPC middleware propagating audit context via AsyncLocalStorage for Prisma queries.
 * Enables the audit extension to log user, organisation, and IP without explicit
 * context prop-drilling through the RPC call chain in scala-hub.
 */

import { os } from "@orpc/server";
import { runWithContext } from "@teamscala/os/runtime-contracts/request-context";
import type { RpcInitialContext, RpcUser } from "./types";

function getOptionalHeader(
	headers: Headers,
	...names: string[]
): string | undefined {
	for (const name of names) {
		const value = headers.get(name);
		if (value) return value;
	}
	return undefined;
}

export const auditContext = os
	.$context<RpcInitialContext & { user?: RpcUser }>()
	.middleware(async ({ context, next }) => {
		const { user, headers } = context;
		if (!user?.userId) return next({});

		const requestContext: Parameters<typeof runWithContext>[0] = {
			userId: user.userId,
			userName: user.name || user.email || "Anonymous",
			isSuperAdmin: user.isSuperAdmin || false,
			ipAddress: getOptionalHeader(headers, "x-forwarded-for", "x-real-ip"),
			userAgent: getOptionalHeader(headers, "user-agent"),
			isImpersonation: !!user.impersonatedBy,
			...(user.email ? { userEmail: user.email } : {}),
			...(user.organisationId ? { organisationId: user.organisationId } : {}),
			...(user.impersonatedBy
				? {
						impersonatorUserId: user.impersonatedBy,
						impersonatorUserName: user.impersonatedBy,
					}
				: {}),
			...(user.serviceSource ? { serviceSource: user.serviceSource } : {}),
			...(user.agentId ? { agentId: user.agentId } : {}),
		};

		return runWithContext(requestContext, () => next({}));
	});
