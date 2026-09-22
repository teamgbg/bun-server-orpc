/**
 * @system runtime-orpc-ws
 * @status handwritten
 * @edit edit directly
 *
 * Browser-side ORPC client over WebSocket. Creates a fresh plain WebSocket
 * per call to `createOrpcWsConnection()`, each wrapped in its own RPCLink.
 * The caller (runStream) owns reconnection — on stream end it disposes the
 * old client and calls `createOrpcWsConnection()` again. This avoids the
 * incompatibility between ReconnectingWebSocket and @orpc/client/websocket's
 * RPCLink, which permanently closes the ClientPeer on any close event
 * (including reconnection intermediates).
 *
 * Telemetry: every close/error event emits durable telemetry via
 * @teamscala/logger (reaches GlitchTip) and @teamscala/event-log (durable
 * Postgres audit). A clean intentional dispose (code 1000, wasClean=true)
 * is logged at info; unexpected closes (any other code, !wasClean) and
 * errors are logged at error — so a WS death is always observable, never
 * silent. The event-log write is fire-and-forget via dynamic import so
 * the orpc package has no static dep on @teamscala/event-log (same tier).
 */

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/websocket";
import type { RouterClient } from "@orpc/server";
import { createLogger } from "@teamscala/logger/creator";

const _logger = createLogger({ service: "orpc-ws-client" });

export interface CreateOrpcWsClientOptions {
	url: string;
	onStatus?: (status: OrpcWsConnectionStatus) => void;
}

export type OrpcWsConnectionStatus =
	| {
			status: "connecting";
			url: string;
	  }
	| {
			status: "open";
			url: string;
	  }
	| {
			status: "closed";
			url: string;
			code: number;
			wasClean: boolean;
	  }
	| {
			status: "error";
			url: string;
			error: Event;
	  };

export interface OrpcWsClientHandle {
	client: RouterClient<any>;
	dispose: () => void;
}

async function recordWsEvent(kind: string, payload: Record<string, unknown>): Promise<void> {
	try {
		// Dynamic import of optional peer — @teamscala/event-log may not be
		// installed (browser context, or consumer doesn't use it). The
		// concatenation prevents TypeScript from resolving the module at
		// compile time, matching the runtime-optional contract.
		const modPath = "@teamscala/event-log/record-event";
		const { recordEvent } = await import(modPath);
		recordEvent({ kind, payload });
	} catch {
		// @teamscala/event-log not available. The logger call above already
		// covers observability via GlitchTip.
	}
}

export function createOrpcWsConnection<_TRouter>(
	options: CreateOrpcWsClientOptions,
): OrpcWsClientHandle {
	options.onStatus?.({ status: "connecting", url: options.url });
	const websocket = new WebSocket(options.url);

	websocket.addEventListener("open", () => {
		options.onStatus?.({ status: "open", url: options.url });
	});

	websocket.addEventListener("close", (event) => {
		const payload = {
			url: options.url,
			code: event.code,
			wasClean: event.wasClean,
		};
		options.onStatus?.({
			status: "closed",
			...payload,
		});
		if (event.wasClean && event.code === 1000) {
			_logger.info("ws.close", payload);
		} else {
			_logger.error("ws.unexpected-close", payload);
			void recordWsEvent("ws.client.unexpected-close", payload);
		}
	});

	websocket.addEventListener("error", (event) => {
		const payload = { url: options.url };
		_logger.error("ws.error", payload);
		options.onStatus?.({ status: "error", url: options.url, error: event });
		void recordWsEvent("ws.client.error", payload);
	});

	const link = new RPCLink({ websocket: websocket as never });
	const client = createORPCClient(link) as RouterClient<any>;

	return {
		client,
		dispose: () => {
			if (
				websocket.readyState === WebSocket.OPEN ||
				websocket.readyState === WebSocket.CONNECTING
			) {
				websocket.close(1000, "client dispose");
			}
		},
	};
}
