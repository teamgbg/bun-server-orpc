/**
 * @system orpc
 * @status handwritten
 * @edit edit directly
 *
 * procedureErrorReportInterceptor — the ORPC mount error hook. ORPC's own
 * error boundary converts any thrown procedure error into a stackless
 * INTERNAL_SERVER_ERROR response AFTER this interceptor sees it, so this is
 * the one point where the real error, its class and its stack are still
 * observable. The handler-level `interceptors` option wraps
 * match→decode→call INSIDE that boundary; adapter-level interceptors see
 * only the already-encoded response (the dead onError wiring measured in
 * service-runtime's orpc-mount).
 *
 * Every error crossing the boundary is shaped by buildErrorReport (the one
 * classifier — errorId, class, normalized code, stack head) and handed to
 * the configured recorder; the boot layer wires that recorder to
 * recordEvent, because orpc is primitives tier and cannot import
 * @teamscala/event-log across a same-tier edge. The original error is
 * ALWAYS rethrown: recording must never alter the response or swallow the
 * failure — which is also why the record path is guarded end-to-end; a
 * throwing hook must degrade to the plain rethrow, never mask the real
 * error with its own.
 */

import { buildErrorReport } from "@teamscala/os/errors/error-report";
import { getLogger, getProcedureErrorRecorder } from "./configure.ts";

export interface ProcedureErrorInterceptorOptions {
	prefix?: string;
	request?: {
		url: URL;
		headers: Record<string, string | string[] | undefined>;
	};
	next: () => Promise<unknown>;
}

/** `/api/rpc/fn/chatSession/load` + prefix `/api/rpc` → `fn.chatSession.load`. */
export function deriveProcedureName(pathname: string, prefix?: string): string {
	let rest = pathname;
	if (prefix && rest.startsWith(prefix)) rest = rest.slice(prefix.length);
	rest = rest.replace(/^\/+|\/+$/g, "");
	return rest ? rest.replaceAll("/", ".") : "unknown";
}

/** First header value, tolerating orpc's array-valued StandardHeaders. */
function firstHeaderValue(
	headers: Record<string, string | string[] | undefined>,
	name: string,
): string | undefined {
	const value = headers[name];
	return Array.isArray(value) ? value[0] : value;
}

function recordProcedureError(
	options: ProcedureErrorInterceptorOptions,
	error: unknown,
): void {
	const pathname = options.request?.url.pathname ?? "";
	const requestId = options.request
		? firstHeaderValue(options.request.headers, "x-request-id")
		: undefined;
	const report = buildErrorReport(error, {
		...(pathname ? { url: pathname } : {}),
		...(requestId ? { requestId } : {}),
	});
	const record = {
		procedure: deriveProcedureName(pathname, options.prefix),
		errorId: report.errorId,
		errorName: report.name,
		code: report.code,
		message: report.message,
		transient: report.transient,
		stackHead: report.stackHead,
		...(pathname ? { url: pathname } : {}),
	};
	try {
		getProcedureErrorRecorder()(record);
	} catch (recorderError) {
		getLogger().warn(
			`[orpc] procedure error recorder failed: ${recorderError instanceof Error ? recorderError.message : recorderError}`,
		);
	}
	// Capture once, project twice: the SAME record object is the single capture
	// of this error. The event_log projection above and the GlitchTip projection
	// below both derive from it (unified observability) — the GlitchTip side
	// carries the record as structured context, so the two projections cannot
	// disagree the way the old separately-formatted line and payload did.
	getLogger().error(
		`[orpc] ${record.procedure} failed: ${report.name}: ${report.message} (errorId=${report.errorId})`,
		{ ...record },
	);
}

export function procedureErrorReportInterceptor(): (
	options: ProcedureErrorInterceptorOptions,
) => Promise<unknown> {
	return async (options) => {
		try {
			return await options.next();
		} catch (error) {
			try {
				recordProcedureError(options, error);
			} catch (hookError) {
				getLogger().warn(
					`[orpc] procedure error hook failed: ${hookError instanceof Error ? hookError.message : hookError}`,
				);
			}
			throw error;
		}
	};
}
