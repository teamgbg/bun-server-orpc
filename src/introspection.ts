/**
 * @system orpc
 * @status handwritten
 * @edit edit directly
 */

import { getAppRouter } from "./app-router";
import { getLogger } from "./configure";
import { getServerClient } from "./server-client-registry";

interface AuthSessionGetter {
	getSession: (args: {
		headers: Headers;
	}) => Promise<{ user?: { id?: string } } | null>;
}

type RouterRecord = Record<string, unknown>;
type ModelClient = {
	findFirst: () => Promise<Record<string, unknown> | null>;
};

function readRouterRecord(value: unknown): RouterRecord {
	return value && typeof value === "object" ? (value as RouterRecord) : {};
}

function readModelClient(value: unknown): ModelClient | null {
	if (!value || typeof value !== "object") return null;
	const candidate = value as { findFirst?: unknown };
	const findFirst = candidate.findFirst;
	return typeof findFirst === "function"
		? ({
				findFirst: () => findFirst() as Promise<Record<string, unknown> | null>,
			} satisfies ModelClient)
		: null;
}

/**
 * Introspect the ORPC router for model names or field names.
 * Requires authentication via session.
 */
export async function introspectRouter(
	request: Request,
	authApi: AuthSessionGetter,
): Promise<Response> {
	try {
		// Get session for authentication — caller injects auth so orpc stays
		// foundational and does not depend on the auth package.
		const headers = request.headers;
		const session = await authApi.getSession({ headers });

		if (!session?.user?.id) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const url = new URL(request.url);
		const modelForFields = url.searchParams.get("fields");

		// ─── MODEL INTROSPECTION ──────────────────────────────────────────
		if (modelForFields) {
			const router = readRouterRecord(await getAppRouter());
			if (!(modelForFields in router)) {
				return Response.json(
					{ error: "Model not found in router" },
					{ status: 404 },
				);
			}

			// Get fields by querying one record (limit 1) via ORPC server client
			const serverClient = readRouterRecord(await getServerClient());
			const modelClient = readModelClient(serverClient[modelForFields]);
			if (!modelClient) {
				return Response.json(
					{ error: "Model not found in router" },
					{ status: 404 },
				);
			}
			const record = await modelClient.findFirst();
			const fields = record ? Object.keys(record) : [];

			return Response.json({ fields });
		}

		// ─── ROUTER INTROSPECTION ─────────────────────────────────────────
		const router = readRouterRecord(await getAppRouter());
		// Filter out 'custom' and internal helper keys if any
		const models = Object.keys(router).filter(
			(key) => key !== "custom" && !key.startsWith("_"),
		);

		return Response.json({ models: models.sort() });
	} catch (error) {
		getLogger().error("core-generated-orpc", {
			error: error instanceof Error ? error.message : String(error),
		});
		return Response.json(
			{ error: error instanceof Error ? error.message : String(error) },
			{ status: 500 },
		);
	}
}
