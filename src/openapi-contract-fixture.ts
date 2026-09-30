/**
 * @system orpc
 * @status handwritten — none derivable: a row argument is JSON and an oRPC procedure carries valibot schemas, which have no JSON spelling — searched the function_call and fs_flow row arms (args, $error, $fn, fixtures.stubs) and none of them can construct a router
 * @edit edit directly
 *
 * THE ROUTER THE OPENAPI CONTRACT ROWS PROJECT, and the projection itself
 * called over it.
 *
 * WHY A MODULE AND NOT A ROW ARGUMENT: an oRPC procedure's contract IS its
 * valibot schemas, so this router has no JSON spelling and a function_call
 * row cannot carry it in `args`. The CASES are registry rows (suite_type
 * function_call, package @teamscala/orpc) rendered by
 * ts_function_contract_runner; this file is the fixture those rows call, and
 * nothing else. The subject is this file's second export rather than
 * `openapi.ts`'s own because a row names a module and an export, and the
 * production function is reached through the wrapper in one call.
 *
 * THE FIXTURE SHAPE IS THE ONE THAT MUST BE RIGHT: a valibot record input and
 * NO `.route()` metadata, exactly as the generated CRUD routers declare
 * themselves, because structure-derived path derivation is what a router
 * carrying no paths of its own exercises.
 */

import { os } from "@orpc/server";
import * as v from "valibot";
import {
	buildOpenApiDocument,
	type OpenApiDocumentOptions,
} from "./openapi.ts";

const recordArgs = v.record(v.string(), v.unknown());
const procedure = os.$context<Record<string, unknown>>();

/** The CRUD-shaped router the portal generates, with an un-namespaced procedure beside it. */
export function fixtureRouter(): Record<string, unknown> {
	return {
		registry_entries: {
			findMany: procedure.input(recordArgs).handler(async () => []),
			create: procedure.input(recordArgs).handler(async () => ({})),
		},
		fn: {
			signInFlow: procedure.handler(async () => ({})),
		},
	};
}

/** The fixture router through the production projection — what the rows assert. */
export async function documentForFixtureRouter(
	options: OpenApiDocumentOptions = {},
): Promise<Record<string, unknown>> {
	return buildOpenApiDocument(fixtureRouter(), options);
}

/**
 * The same projection with the options the mount supplies, one scalar per
 * position: a row's args are a JSON array, and the registry writer unwraps a
 * one-element array of objects (measured 2026-09-30: `args: [{…}]` reached
 * the schema as `args: {…}` and was refused as not-an-array), so the options
 * arrive positionally and are assembled here, where the production option
 * shape lives.
 */
export async function documentForFixtureRouterWith(
	title: string,
	version: string,
	serverUrl: string,
): Promise<Record<string, unknown>> {
	return buildOpenApiDocument(fixtureRouter(), {
		title,
		version,
		servers: [{ url: serverUrl }],
	});
}
