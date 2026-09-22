/**
 * @system runtime-orpc-ws
 * @status handwritten
 * @edit edit directly
 *
 * ORPC over WebSocket as a Hono integration. Registers `/api/rpc/ws` (or a
 * configurable path) on a Hono app via `upgradeWebSocket()` from
 * @teamscala/service-runtime/serve. Inside the upgrade handler, ORPC's bun-ws
 * RPCHandler dispatches messages from the underlying Bun ServerWebSocket.
 * After this is mounted, any ORPC procedure with `output: eventIterator(...)`
 * is consumable from the client via `for await (const e of client.x.watch())`
 * over WebSocket — same procedure shape, different transport.
 */

	/**
	 * Per-connection WS keepalive interval in ms. The server sends a WS PING
	 * frame on this cadence; browsers auto-respond with PONG (WebSocket spec,
	 * handled at the platform layer — no client JS), so traffic always flows in
	 * both directions and no idle-timeout fires at any layer (Bun's
	 * `idleTimeout`, Cloudflare Tunnel, the browser). This is the correct fix
	 * for a stream like `watchTick` that only yields on real events: a quiet
	 * fleet no longer starves the socket into an idle close, and a silent
	 * proxy idle-drop can ONLY be prevented by real traffic on the wire (no
	 * server timeout setting fixes that).
	 *
	 * Source of truth is the `config/orpc-ws` registry row (read by the
	 * caller, e.g. service-boot's register-ws-routes, via `loadRegistryConfig`)
	 * — changing the interval is a `registry_edit`, never a republish of this
	 * package. This default is a fallback for consumers that don't pass it.
	 */

/**
 * Start the per-connection WS keepalive: send a PING frame every `intervalMs`
 * so traffic always flows and no idle-timeout fires at any layer (Bun
 * `idleTimeout`, Cloudflare Tunnel, the browser). Browsers auto-pong (WS
 * spec), so this needs no client JS and is transparent to oRPC's RPCHandler
 * (data-frames only). Real traffic is the ONLY thing that prevents a silent
 * proxy idle-drop — no server timeout setting fixes that — so this is the
 * correct fix, not a papering-over of `idleTimeout: 120`.
 *
 * Why `setInterval` and not a platform primitive:
 *  - `watchdog-is-the-only-watchdog`'s `createWatchdog` is a health probe
 *    (`check() -> { healthy }`) that auto-registers into the global watchdog
 *    registry — one per WS connection would flood it, and a keepalive ping is
 *    a transport action, not a health decision.
 *  - `timing-is-the-only-timing`'s `createTimer` measures duration and emits
 *    OTel spans; a ping is a scheduled transport action, not a measurement.
 * This is the sanctioned "data pump in a foundational primitive" class (same
 * as an exporter's flush timer): a named `start*` owner, explicit cleanup in
 * `stopPingKeepalive`, and the ping's own try/catch so a half-dead socket
 * never leaves a hot interval (`no-uncontrolled-repetition-or-cascade`).
 */

import type { Context, Router } from "@orpc/server";
import { RPCHandler } from "@orpc/server/bun-ws";
import { procedureErrorReportInterceptor } from "../procedure-error-report.ts";
import type {
	UpgradeWebSocket,
	WSEvents,
} from "@teamscala/hono-boundary/websocket-upgrade";
import type { Hono } from "hono";

// The caller supplies the `upgradeWebSocket` whose sibling `websocket`
// config is the one wired into Bun.serve — constructing one here would be a
// separate unpaired instance whose config never reaches Bun, silently 404-ing
// every upgrade. Per `configured-primitives` this foundational primitive
// accepts the upgrade function as injection; its TYPE is the identity hono
// declares, read from the generated boundary package, never re-spelled here.

export interface MountOrpcWsOptions {
	/** Path to register on the Hono app. Default: "/api/rpc/ws". */
	path?: string;
	/**
	 * Per-request initial context passed to ORPC handlers. Use this to inject
	 * auth/RLS/prisma the same way the HTTP RPC mount does. Default: empty.
	 */
	context?: () => Record<string, unknown>;
	pingIntervalMs?: number;
}

/** Fallback keepalive cadence when the caller doesn't pass `pingIntervalMs`. */
const DEFAULT_PING_INTERVAL_MS = 25_000;

/**
 * Per-connection ping timers, keyed by the raw Bun `ServerWebSocket`. O(1)
 * cleanup on close. A `WeakMap` (not mutation of `ws.data`) so bookkeeping is
 * self-contained and never escapes this module. The timer is ALWAYS cleared
 * in `onClose` (clean AND abnormal close — Bun fires `close` for both); the
 * ping's own try/catch is a belt-and-braces clear if `ping()` throws on a
 * half-dead socket, so no interval survives a dropped connection
 * (`no-uncontrolled-repetition-or-cascade`).
 */
const pingTimers = new WeakMap<object, ReturnType<typeof setInterval>>();

function startPingKeepalive(
	ws: { ping: (data?: string | ArrayBufferLike | ArrayBufferView) => void },
	intervalMs: number,
): void {
	const timer = setInterval(() => {
		try {
			ws.ping();
		} catch {
			// Socket dead/closing — stop the timer so a half-dead socket doesn't
			// keep a hot interval. `stopPingKeepalive` (onClose) owns final
			// cleanup; this is the belt-and-braces clear.
			stopPingKeepalive(ws as object);
		}
	}, intervalMs);
	pingTimers.set(ws as object, timer);
}

/** Clear the per-connection keepalive. Idempotent; called from onClose (clean
 * AND abnormal — Bun fires `close` for both) so the timer never outlives the
 * connection. */
function stopPingKeepalive(ws: object): void {
	const timer = pingTimers.get(ws);
	if (timer) {
		clearInterval(timer);
		pingTimers.delete(ws);
	}
}

export function mountOrpcWs<TContext extends Context>(
	app: Hono,
	router: Router<any, TContext>,
	upgradeWebSocket: UpgradeWebSocket,
	options: MountOrpcWsOptions = {},
): void {
	const path = options.path ?? "/api/rpc/ws";
	const handler = new RPCHandler(router as never, {
		interceptors: [procedureErrorReportInterceptor()] as never,
	});
	const buildContext = options.context ?? (() => ({}));
	const pingIntervalMs = options.pingIntervalMs ?? DEFAULT_PING_INTERVAL_MS;

	app.get(
		path,
		upgradeWebSocket(
			(): WSEvents => ({
				onOpen(_event, wsc) {
					startPingKeepalive(
						wsc.raw as unknown as {
							ping: (data?: string | ArrayBufferLike | ArrayBufferView) => void;
						},
						pingIntervalMs,
					);
				},
				onMessage(event, wsc) {
					const ws = wsc.raw as never;
					const data =
						typeof event.data === "string"
							? event.data
							: new Uint8Array(event.data as ArrayBuffer);
					void handler.message(ws, data, { context: buildContext() as never });
				},
				onClose(_event, wsc) {
					// Clean AND abnormal close: Bun fires `close` for both, so the
					// timer never outlives the connection.
					stopPingKeepalive(wsc.raw as unknown as object);
					handler.close(wsc.raw as never);
				},
			}),
		),
	);
}
