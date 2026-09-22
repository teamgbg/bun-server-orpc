/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * ORPC middleware for machine-to-machine authentication via X-API-Key or Bearer token.
 * Validates against SCALA_DEV_KEY and marks the call as a trusted internal service
 * call. It does NOT inject a user identity — per `no-client-controlled-trust-signals`
 * + `identity-from-session-not-headers` (scala-os/security.md), a service call that
 * must act AS a user resolves that user through `session-auth` (a validated
 * .scala.business session), never from an X-User-Id header on this path.
 */

import { timingSafeEqual } from "node:crypto";
import { os } from "@orpc/server";
import type { RpcInitialContext } from "./types";
import { getServiceApiKey } from "../configure.ts";

export const apiKeyAuth = os
	.$context<RpcInitialContext>()
	.middleware(async ({ context, next }) => {
		const { headers } = context;

		const authorization = headers.get("Authorization");
		const bearerToken = authorization?.startsWith("Bearer ")
			? authorization.slice(7)
			: null;
		const apiKey = headers.get("X-API-Key") || bearerToken;
		// SERVICE_API_KEY is the dedicated internal-auth credential (secret/shared-env).
		const expectedKeys = [getServiceApiKey()].filter(
			(k): k is string => Boolean(k),
		);

		const apiKeyValid =
			apiKey &&
			expectedKeys.some(
				(expectedKey) =>
					apiKey.length === expectedKey.length &&
					timingSafeEqual(Buffer.from(apiKey), Buffer.from(expectedKey)),
			);

		if (apiKeyValid) {
			// Static-key validation authenticates the CALLER as a trusted internal
			// service. It must NOT inject a user identity from a header — the prior
			// shape read X-User-Id and returned { isSuperAdmin: true, isAdmin: true },
			// the super-admin impersonation primitive (any caller with the static key
			// became any user). Identity now comes from `session-auth`, not this path.
			return next({ context: { isServiceCall: true } });
		}

		// Not an API key call — pass through without user context
		return next({ context: { isServiceCall: false } });
	});

