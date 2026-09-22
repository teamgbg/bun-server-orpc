// @system codegen
// @status generated
// @edit change the suite in the owned-suites band, then re-run codegen. Hand-edits are overwritten.
//
// This suite's assertions are OWNED by the codegen band: the band module
// carries them verbatim, this file is the emission, and hand edits here are
// overwritten on the next run. The rationale each assertion carries moved
// with it into the band.

import { afterEach, describe, expect, test } from "bun:test";
import { RPCHandler } from "@orpc/server/fetch";
import { os } from "@orpc/server";
import {
	configure,
	getProcedureErrorRecorder,
	type ProcedureErrorRecord,
} from "./configure.ts";
import {
	deriveProcedureName,
	procedureErrorReportInterceptor,
} from "./procedure-error-report.ts";

const captured: ProcedureErrorRecord[] = [];

afterEach(() => {
	captured.length = 0;
	configure({ procedureErrorRecorder: () => {} });
});

function throwProcedure(): unknown {
	return os.handler(async () => {
		throw new ReferenceError("generated procedure exploded");
	});
}

describe("procedureErrorReportInterceptor", () => {
	test("a throwing procedure produces a durable record with procedure, class and stack", async () => {
		configure({ procedureErrorRecorder: (record) => captured.push(record) });
		const router = { fn: { test: { boom: throwProcedure() } } };
		const handler = new RPCHandler(router as never, {
			interceptors: [procedureErrorReportInterceptor()] as never,
		});

		const response = await handler.handle(
			new Request("http://localhost/api/rpc/fn/test/boom", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({}),
			}),
			{ prefix: "/api/rpc", context: {} },
		);

		expect(response.matched).toBe(true);
		expect(response.response?.status).toBe(500);

		expect(captured).toHaveLength(1);
		const record = captured[0];
		expect(record.procedure).toBe("fn.test.boom");
		expect(record.errorName).toBe("ReferenceError");
		expect(record.message).toContain("generated procedure exploded");
		expect(record.errorId).toBeTruthy();
		expect(record.code).toBe("UNKNOWN");
		expect(record.transient).toBe(false);
		expect(record.url).toBe("/api/rpc/fn/test/boom");
		const stackLines = record.stackHead.split("\n");
		expect(stackLines.length).toBeGreaterThanOrEqual(2);
		expect(stackLines[0]).toContain("ReferenceError");
		expect(stackLines.join("\n")).toContain("procedure-error-report.test.ts");
	});

	test("the error still surfaces as ORPC's INTERNAL_SERVER_ERROR body (hook rethrows)", async () => {
		configure({ procedureErrorRecorder: (record) => captured.push(record) });
		const handler = new RPCHandler(
			{ fn: { test: { boom: throwProcedure() } } } as never,
			{ interceptors: [procedureErrorReportInterceptor()] as never },
		);

		const response = await handler.handle(
			new Request("http://localhost/api/rpc/fn/test/boom", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({}),
			}),
			{ prefix: "/api/rpc", context: {} },
		);

		const body = await new Response(response.response?.body).json();
		expect(body.json.code).toBe("INTERNAL_SERVER_ERROR");
	});

	test("both projections derive from the ONE capture (log context IS the record)", async () => {
		const logErrors: Array<{ msg: string; ctx?: Record<string, unknown> }> = [];
		configure({
			procedureErrorRecorder: (record) => captured.push(record),
			logger: {
				error: (msg, ctx) => logErrors.push({ msg, ctx }),
				warn: () => {},
				info: () => {},
				debug: () => {},
			},
		});
		const handler = new RPCHandler(
			{ fn: { test: { boom: throwProcedure() } } } as never,
			{ interceptors: [procedureErrorReportInterceptor()] as never },
		);

		await handler.handle(
			new Request("http://localhost/api/rpc/fn/test/boom", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({}),
			}),
			{ prefix: "/api/rpc", context: {} },
		);

		expect(captured).toHaveLength(1);
		expect(logErrors).toHaveLength(1);
		const record = captured[0];
		const { ctx } = logErrors[0];
		// The GlitchTip projection carries the SAME structured facts the
		// event_log projection recorded — one capture, two projections.
		expect(ctx?.errorId).toBe(record.errorId);
		expect(ctx?.procedure).toBe(record.procedure);
		expect(ctx?.code).toBe(record.code);
		expect(ctx?.transient).toBe(record.transient);
		expect(ctx?.errorName).toBe(record.errorName);
		expect(ctx?.message).toBe(record.message);
		expect(ctx?.stackHead).toBe(record.stackHead);
	});

	test("successful procedures record nothing", async () => {
		configure({ procedureErrorRecorder: (record) => captured.push(record) });
		const handler = new RPCHandler(
			{
				fn: { test: { ok: os.handler(async () => ({ ok: true })) } },
			} as never,
			{ interceptors: [procedureErrorReportInterceptor()] as never },
		);

		const response = await handler.handle(
			new Request("http://localhost/api/rpc/fn/test/ok", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({}),
			}),
			{ prefix: "/api/rpc", context: {} },
		);

		expect(response.matched).toBe(true);
		expect(captured).toHaveLength(0);
	});

	test("an unconfigured recorder still rethrows (recording never blocks the response)", async () => {
		expect(getProcedureErrorRecorder()).toBeDefined();
		const handler = new RPCHandler(
			{ fn: { test: { boom: throwProcedure() } } } as never,
			{ interceptors: [procedureErrorReportInterceptor()] as never },
		);

		const response = await handler.handle(
			new Request("http://localhost/api/rpc/fn/test/boom", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({}),
			}),
			{ prefix: "/api/rpc", context: {} },
		);

		expect(response.response?.status).toBe(500);
	});
});

describe("deriveProcedureName", () => {
	test("strips the prefix and joins with dots", () => {
		expect(deriveProcedureName("/api/rpc/fn/chatSession/load", "/api/rpc")).toBe(
			"fn.chatSession.load",
		);
	});

	test("without a prefix the full path is the name", () => {
		expect(deriveProcedureName("/fn/regions/loadPage")).toBe(
			"fn.regions.loadPage",
		);
	});

	test("an empty path names the record unknown rather than empty", () => {
		expect(deriveProcedureName("", "/api/rpc")).toBe("unknown");
	});
});
