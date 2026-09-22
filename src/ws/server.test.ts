// @system codegen
// @status generated
// @edit change the suite in the owned-suites band, then re-run codegen. Hand-edits are overwritten.
//
// This suite's assertions are OWNED by the codegen band: the band module
// carries them verbatim, this file is the emission, and hand edits here are
// overwritten on the next run. The rationale each assertion carries moved
// with it into the band.

import { describe, expect, mock, test } from "bun:test";

// Stub @orpc/server/bun-ws BEFORE importing server.ts (which constructs
// RPCHandler at mount time). The stub's message/close are no-ops — the ping
// test never exercises oRPC dispatch.
mock.module("@orpc/server/bun-ws", () => ({
	RPCHandler: class {
		message() {}
		close() {}
	},
}));

// Dynamic import so the mock.module above is registered before server.ts
// resolves its @orpc/server/bun-ws import.
const { mountOrpcWs } = await import("./server.ts");

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Mounts mountOrpcWs against a fake Hono app + fake upgradeWebSocket and
 * returns a handle to the captured per-connection events (onOpen/onClose). */
function mountCapturingEvents(pingIntervalMs: number): {
	onOpen?: (e: unknown, wsc: { raw: unknown }) => void;
	onClose?: (
		e: { code: number; reason: string },
		wsc: { raw: unknown },
	) => void;
} {
	let events: {
		onOpen?: (e: unknown, wsc: { raw: unknown }) => void;
		onClose?: (
			e: { code: number; reason: string },
			wsc: { raw: unknown },
		) => void;
	} = {};
	// upgradeWebSocket(factory) returns a handler(ctx); calling handler(ctx)
	// calls factory(ctx) and yields the events object mountOrpcWs defined.
	const fakeUpgrade = (
		factory: (c: unknown) => Record<string, unknown>,
	) => (c: unknown) => {
		events = factory(c) as typeof events;
		return undefined as never;
	};
	const fakeApp = {
		get: (
			_path: string,
			registered: (c: unknown) => unknown,
		) => {
			registered({}); // simulate the WS upgrade invoking the handler
		},
	} as never;
	mountOrpcWs(fakeApp, {} as never, fakeUpgrade as never, { pingIntervalMs });
	return events;
}

describe("mountOrpcWs keepalive", () => {
	test("pings on the interval while the socket is open", async () => {
		const events = mountCapturingEvents(20);
		const ping = mock(() => {});
		const raw = { ping }; // same raw ref across open + close (Hono invariant)
		events.onOpen?.({}, { raw });
		await wait(65); // ~3 pings at 20ms
		expect(ping.mock.calls.length).toBeGreaterThanOrEqual(2);
		events.onClose?.({ code: 1000, reason: "clean" }, { raw });
	});

	test("stops pinging after close — no timer leak (clean close)", async () => {
		const events = mountCapturingEvents(20);
		const ping = mock(() => {});
		const raw = { ping };
		events.onOpen?.({}, { raw });
		await wait(45);
		events.onClose?.({ code: 1000, reason: "" }, { raw });
		const countAtClose = ping.mock.calls.length;
		expect(countAtClose).toBeGreaterThanOrEqual(1);
		await wait(65);
		expect(ping.mock.calls.length).toBe(countAtClose); // no further pings
	});

	test("stops pinging after abrupt close (code 1006)", async () => {
		const events = mountCapturingEvents(20);
		const ping = mock(() => {});
		const raw = { ping };
		events.onOpen?.({}, { raw });
		await wait(45);
		events.onClose?.({ code: 1006, reason: "abrupt" }, { raw });
		const countAtClose = ping.mock.calls.length;
		await wait(65);
		expect(ping.mock.calls.length).toBe(countAtClose);
	});

	test("a ping that throws on a dead socket does not crash the interval", async () => {
		const events = mountCapturingEvents(20);
		let attempts = 0;
		const ping = () => {
			attempts++;
			throw new Error("socket closed");
		};
		const raw = { ping };
		events.onOpen?.({}, { raw });
		await wait(65);
		expect(attempts).toBeGreaterThanOrEqual(1); // ping was attempted
		// The try/catch cleared the timer so the throw did not propagate; close
		// for cleanliness.
		events.onClose?.({ code: 1006, reason: "" }, { raw });
	});
});
