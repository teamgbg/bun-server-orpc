/**
 * @system orpc
 * @status handwritten — none derivable: the supplier's OpenAPIGenerator does the projection and no row or output supplies the wiring — searched the 405 codegen_output rows and the package catalogue, and none projects a live oRPC router into a document
 * @edit edit directly
 *
 * THE OpenAPI contract for a service's composed oRPC router — generated from
 * the SAME router object the RPC handler serves, so the document cannot
 * describe procedures the server does not have and cannot omit ones it does
 * (`information-exists-in-one-location`: the router is the one home of the
 * contract; this module is its projection, never a second declaration). The
 * caller passes the router it already holds — the mount site fetched it to
 * mount the handler, and a second lookup would only be a second chance to
 * disagree.
 *
 * The generator is the supplier's (`@orpc/openapi` OpenAPIGenerator) with the
 * supplier's valibot converter (`@orpc/valibot`) — our procedures validate
 * with valibot, so the JSON Schema in the document derives from the very
 * schemas the handler enforces at call time. OpenAPI 3.1.1 out.
 *
 * Procedures carry no `.route()` metadata (the generated CRUD router never
 * sets one), so the generator derives each path from the router structure
 * (`/registry_entries/findMany`) and defaults the method to POST — the exact
 * shape `RPCHandler` serves under the mount prefix. `servers` therefore names
 * the prefix the caller reaches us at; the mount site derives it from the
 * request so internal (`scala-portal.internal:5200`) and public hosts both
 * produce a callable document.
 */

import { OpenAPIGenerator } from "@orpc/openapi";
import { experimental_ValibotToJsonSchemaConverter } from "@orpc/valibot";

export interface OpenApiDocumentOptions {
	/** Document title — the mount site names its service. */
	title?: string;
	/** Document version — the mount site supplies the running build's id. */
	version?: string;
	/** Where the procedures are reachable; must include the RPC prefix. */
	servers?: { url: string; description?: string }[];
}

/**
 * Project a composed router into its OpenAPI document. Pure over the router
 * handed in — regenerated per call, because the tool-generator listener may
 * `clearAppRouterCache()` and hand out a new router, and a memoized document
 * would keep describing the retired one.
 */
export async function buildOpenApiDocument(
	router: Record<string, unknown>,
	options: OpenApiDocumentOptions = {},
): Promise<Record<string, unknown>> {
	const generator = new OpenAPIGenerator({
		schemaConverters: [new experimental_ValibotToJsonSchemaConverter()],
	});
	const document = await generator.generate(router as never, {
		info: {
			title: options.title ?? "Scala oRPC procedures",
			version: options.version ?? "0",
		},
		servers: options.servers ?? [],
	});
	return document as Record<string, unknown>;
}
