/**
 * @system mcp-infrastructure
 * @status handwritten
 * @edit edit directly
 *
 * Lazy-loaded ORPC app router composition for scala-hub. Combines auto-generated Prisma
 * CRUD routers composed from the service's generated Prisma router plus
 * The fn namespace (auth, tasks, plans, guards) is registered by
 * the row-composed fn namespace (orpc-bundle from api_route rows).
 */

		// The generated router is ABSENT. Two very different situations share that shape, and conflating them is what hid a fleet-wide outage:
		//
		//   (a) this service genuinely has no models (no prisma schema) — an empty router IS complete here, so caching it is correct;
		//   (b) the service HAS a Prisma schema, so codegen was supposed to emit routers and did not. That is a BUILD FAILURE.
		//
		// Case (b) previously took the same path as (a): it cached `{fn, ...custom}` for the process lifetime and reported success. MEASURED 2026-08-10 —
		// scala-mcp's Railway build ran codegen-runner, failed with a DNS error reaching the database, and shipped an image with no generated router. The
		// service booted "healthy" and EVERY generated model tool returned "Unknown model router". Task creation was impossible fleet-wide, and
		// because the empty router was cached, nothing ever retried.
		//
		// The discriminator is local and needs no database: a prisma schema next to a missing router index can only mean generation did not run.

import { join } from "node:path";

export type AppRouter = Record<string, unknown>;

let _appRouter: AppRouter | null = null;

export async function getAppRouter(): Promise<AppRouter> {
	if (!_appRouter) {
		const orpcPath = join(
			process.cwd(),
			"prisma/generated/orpc/routers/index.ts",
		);
		if (await Bun.file(orpcPath).exists()) {
			let mod: Record<string, unknown>;
			try {
				mod = await import(orpcPath) as Record<string, unknown>;
			} catch (err) {
				// File EXISTS but the import FAILED. That is NEVER "this service
				// has no models" — it is a broken artifact, and serving a
				// model-less router would report a state we have not verified.
				// Fail closed.
				const msg = err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err);
				throw new Error(
					`[orpc:getAppRouter] generated router exists but failed to import at ${orpcPath}: ${msg}\n` +
						`Refusing to serve a router with no model namespaces. Every model tool would ` +
						`fail with "Unknown model router: <name>" while this process reported healthy. ` +
						`Fix the generated artifact, then restart.`,
				);
			}
			let generated =
				(mod as { appRouter?: Record<string, unknown> }).appRouter;
			if (!generated) {
				// Fallback: reconstruct appRouter from the module's named model
				// router exports (the index.ts exports both `appRouter` AND
				// individual `modelRouter` constants). If the composed `appRouter`
				// export is unavailable (module partially evaluated, or a
				// generator version produced a different export shape), the
				// individual exports are still present and can be reassembled.
				const reconstructed: Record<string, unknown> = {};
				for (const [key, value] of Object.entries(
					mod as Record<string, unknown>,
				)) {
					if (
						(key.endsWith("Router") || key === "fn") &&
						value &&
						typeof value === "object" &&
						key !== "appRouter"
					) {
						reconstructed[key.replace(/Router$/, "")] = value;
					}
				}
				if (Object.keys(reconstructed).length > 0) {
					generated = reconstructed;
				}
			}
			const declaredModels = await readDeclaredSchemaModelCount();
			if (generated) {
				// A router that resolves ZERO model namespaces while the schema
				// declares models is never servable — it fails every model tool
				// while the process reports healthy (the fleet-wide MCP outage
				// shape). Refuse instead of serving or caching it, so a regen
				// wave that dropped every namespace is loud here rather than
				// silent at dispatch.
				const modelNamespaces = countModelNamespaces(generated);
				if (declaredModels > 0 && modelNamespaces === 0) {
					throw new Error(
						`[orpc:getAppRouter] ${orpcPath} resolved to a router with ZERO model namespaces ` +
							`while prisma/schema.prisma declares ${declaredModels}. Refusing to serve: every ` +
							`model tool would fail with "no model namespace" while this process reported ` +
							`healthy. Fix the generated artifact (regenerate the ORPC bundle) and restart.`,
					);
				}
				// The fn namespace is row-composed ONLY: orpc-bundle emits it from
				// api_route rows, and the registerCustomRouter admission this
				// merge once served is deleted (its last caller, service-boot's
				// registerFnRouters, retired with the fn-routers module). A
				// handwritten procedure has no path into the app router — write
				// the api_route row and regenerate.
				_appRouter = {
					...generated,
					fn: (((generated as Record<string, unknown>).fn ??
						{}) as Record<string, unknown>),
				} as unknown as AppRouter;
				return _appRouter;
			}
			// Import resolved but exported neither appRouter nor any model
			// router. The previous behaviour LOGGED this and served a model-less
			// {fn} router — one bad regen emptied every model namespace while
			// the service stayed "healthy". That state now refuses to serve.
			throw new Error(
				`[orpc:getAppRouter] ${orpcPath} imported but exported neither appRouter nor any model routers ` +
					`(prisma/schema.prisma declares ${declaredModels}). Serving a model-less router would fail ` +
					`every model tool while this process reported healthy. Refusing to serve; fix the generated ` +
					`artifact, then restart.`,
			);
		}

		const schemaPath = join(process.cwd(), "prisma/schema.prisma");
		if (await Bun.file(schemaPath).exists()) {
			throw new Error(
				`[orpc:getAppRouter] ${schemaPath} exists but the generated ORPC router is ` +
					`missing at ${orpcPath}. Codegen did not run for this build — do NOT ` +
					`serve a router with no model namespaces. Every model tool would fail ` +
					`with "Unknown model router: <name>" while this process reported healthy. ` +
					`Regenerate the ORPC bundle through the generated Railway build contract, ` +
					`then redeploy.`,
			);
		}

		// Genuinely no models and no generated bundle: the router is EMPTY.
		// mountOrpcRouter treats an empty router as no ORPC surface (the
		// daemon-only case), which is the complete answer here.
		_appRouter = {} as unknown as AppRouter;
	}
	if (!_appRouter) throw new Error("App router failed to initialize");
	return _appRouter;
}

/**
 * Count `model`/`view` blocks declared in the service's Prisma schema — the
 * floor the generated router must clear. A missing schema counts as zero
 * (DB-less service); an existing schema's declared models are the contract
 * the router may not silently serve nothing against.
 */
async function readDeclaredSchemaModelCount(): Promise<number> {
	const schemaPath = join(process.cwd(), "prisma/schema.prisma");
	if (!(await Bun.file(schemaPath).exists())) return 0;
	const text = (await Bun.file(schemaPath).text()).trim();
	const matches = text.match(/^(model|view)\s+\w+/gm);
	return matches ? matches.length : 0;
}

function countModelNamespaces(router: Record<string, unknown>): number {
	return Object.keys(router).filter((key) => key !== "fn").length;
}

/** Force reload the app router (call after bundle:orpc regeneration) */
export function clearAppRouterCache() {
	_appRouter = null;
}
