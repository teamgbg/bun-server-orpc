// @system codegen
// @status generated
// @edit change the suite in the owned-suites band, then re-run codegen. Hand-edits are overwritten.
//
// This suite's assertions are OWNED by the codegen band: the band module
// carries them verbatim, this file is the emission, and hand edits here are
// overwritten on the next run. The rationale each assertion carries moved
// with it into the band.

import { rm } from "node:fs/promises";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { clearAppRouterCache, getAppRouter } from "./app-router.ts";

const originalCwd = process.cwd();
const tempDirs: string[] = [];

afterEach(async () => {
	process.chdir(originalCwd);
	clearAppRouterCache();
	for (const directory of tempDirs.splice(0)) await rm(directory, { recursive: true, force: true });
});

function createService(options: { schema?: boolean | string; generated?: string }): string {
	const service = mkdtempSync(join(tmpdir(), "orpc-app-router-test-"));
	tempDirs.push(service);
	if (options.schema) {
		mkdirSync(join(service, "prisma"), { recursive: true });
		const schema = options.schema === true
			? "datasource db { provider = \"postgresql\" }"
			: options.schema;
		writeFileSync(join(service, "prisma/schema.prisma"), schema);
	}
	if (options.generated !== undefined) {
		const generatedDirectory = join(service, "prisma/generated/orpc/routers");
		mkdirSync(generatedDirectory, { recursive: true });
		writeFileSync(join(generatedDirectory, "index.ts"), options.generated);
	}
	process.chdir(service);
	return service;
}

const SCHEMA_WITH_MODELS = [
	"datasource db { provider = \"postgresql\" }",
	"model work_items { id String @id }",
	"model comments { id String @id }",
	"",
].join("\n");

describe("getAppRouter", () => {
	test("returns an empty router when no Prisma schema exists (daemon-only service)", async () => {
		createService({});

		const router = await getAppRouter();

		// No generated bundle and no models: the ORPC surface is empty and
		// mountOrpcRouter treats that as no mount - the daemon-only case.
		expect(Object.keys(router)).toHaveLength(0);
	});

	test("fails closed when a Prisma schema has no generated router", async () => {
		const service = createService({ schema: true });

		await expect(getAppRouter()).rejects.toThrow(
			`${service}/prisma/schema.prisma exists but the generated ORPC router is missing`,
		);
	});

	test("fails closed when the generated router cannot be imported", async () => {
		createService({ generated: 'throw new Error("generated router is broken");' });

		await expect(getAppRouter()).rejects.toThrow(
			"generated router exists but failed to import",
		);
	});

	test("composes a successfully imported generated router with fn", async () => {
		createService({ generated: "export const appRouter = { users: { list: {} } };" });

		const router = await getAppRouter();

		expect(router.users).toEqual({ list: {} });
		expect(router.fn).toBeDefined();
	});

	test("keeps the generated fn namespace through reconstruction (the fn key does not end in Router)", async () => {
		createService({
			generated: [
				"export const usersRouter = { users: { list: {} } };",
				"export const fn = { auth: { isOrgAdmin: {} }, cacheAdmin: { flush: {} }, userPreferences: { get: {} } };",
				"export const appRouter = { users: { list: {} }, fn: { auth: { isOrgAdmin: {} }, cacheAdmin: { flush: {} }, userPreferences: { get: {} } } };",
			].join("\n"),
		});

		const router = await getAppRouter() as Record<string, Record<string, unknown>>;

		expect(router.users).toEqual({ list: {} });
		expect(router.fn.auth).toEqual({ isOrgAdmin: {} });
		expect(router.fn.cacheAdmin).toEqual({ flush: {} });
		expect(router.fn.userPreferences).toEqual({ get: {} });
	});

	test("refuses to serve a router with ZERO model namespaces while the schema declares models", async () => {
		createService({
			schema: SCHEMA_WITH_MODELS,
			generated: "export const appRouter = { fn: { auth: { isOrgAdmin: {} } } };",
		});

		await expect(getAppRouter()).rejects.toThrow(
			"ZERO model namespaces while prisma/schema.prisma declares 2",
		);
	});

	test("serves an fn-only router only when the schema itself declares no models", async () => {
		createService({
			schema: true,
			generated: "export const appRouter = { fn: { auth: { isOrgAdmin: {} } } };",
		});

		const router = await getAppRouter();

		expect(router.fn).toBeDefined();
	});

	test("refuses to serve when the router exports neither appRouter nor model routers", async () => {
		createService({
			schema: SCHEMA_WITH_MODELS,
			generated: "export const somethingElse = {};",
		});

		await expect(getAppRouter()).rejects.toThrow(
			"exported neither appRouter nor any model routers",
		);
	});

	test("reconstruction alone satisfies the schema floor", async () => {
		createService({
			schema: SCHEMA_WITH_MODELS,
			generated: "export const work_itemsRouter = { work_items: { list: {} } };",
		});

		const router = await getAppRouter();

		expect(router.work_items).toEqual({ work_items: { list: {} } });
	});
});
