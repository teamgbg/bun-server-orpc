/**
 * @system orpc
 * @status handwritten
 * @edit edit directly
 *
 * configured-primitives template (per principles/coding-philosophy.md). The
 * orpc package never imports @teamscala/auth, @teamscala/logger,
 * or @teamscala/db directly — instead it accepts injected providers via
 * configure() at boot. Bootloader injection lives in service-runtime per
 * bootloader-injection-contract.
 */

// 1. Locally-defined contracts — NEVER import from upstream packages.
export interface InjectedAuth {
	getAuth: (...args: unknown[]) => unknown;
}

export interface InjectedLogger {
	error: (msg: string, ctx?: Record<string, unknown>) => void;
	warn: (msg: string, ctx?: Record<string, unknown>) => void;
	info: (msg: string, ctx?: Record<string, unknown>) => void;
	debug: (msg: string, ctx?: Record<string, unknown>) => void;
}

// Loose Prisma surface — only the shapes orpc actually calls. Avoids importing
// @prisma/client (which would chain to a generated client that lives in db).
export interface InjectedPrisma {
	user: {
		findFirst: (args: unknown) => Promise<{ id: string } | null>;
	};
	member: {
		findFirst: (args: unknown) => Promise<{ id: string; role: string } | null>;
	};
	[key: string]: unknown;
}

export type InjectedRegistryConfigLoader = (
	type: string,
	slug: string,
) => Promise<unknown>;
// Async-returning to match the registered `get-entries-by-type` resolver in
// service-runtime (which async-wraps the underlying sync @teamscala/db reader).
export type InjectedGetEntriesByType = (type: string) => Promise<unknown[]>;

// Loose Prisma 8 chained-builder surface — only the shape the generated v8
// procedures call (`db8.orm.<schema>.<Model>.<chained builder>`). The concrete
// type derives from the service's emitted contract; keeping it structural here
// avoids importing @prisma/orm-postgres (the v8 runtime lives in db).
export interface InjectedDb8 {
	orm: Record<string, Record<string, unknown>>;
}

/**
 * The durable record one thrown procedure produces, shaped by buildErrorReport
 * (the platform's ONE error classifier: errorId, error class, normalized code,
 * stack head). The recorder is injected by the boot layer — the runtime tier
 * owns the @teamscala/event-log edge, which a primitives-tier package cannot
 * import (vertical-dependency-only).
 */
export interface ProcedureErrorRecord {
	procedure: string;
	errorId: string;
	/** The error class (err.name), e.g. ReferenceError. */
	errorName: string;
	/** Normalized code from the rule engine (e.g. UNKNOWN). */
	code: string;
	message: string;
	transient: boolean;
	stackHead: string;
	url?: string;
}

export type InjectedProcedureErrorRecorder = (
	record: ProcedureErrorRecord,
) => void;

// 2. Default fallbacks. No-ops so primitives load cleanly when bootloader
//    hasn't called configure() yet (tests, CLI invocations, etc.).
const noopAuth: InjectedAuth = {
	getAuth: () => {
		throw new Error("auth not configured");
	},
};

const noopLogger: InjectedLogger = {
	error: () => {},
	warn: () => {},
	info: () => {},
	debug: () => {},
};

const noopPrismaProvider: () => InjectedPrisma = () => {
	throw new Error(
		"orpc: prisma provider not configured — bootloader must call orpcConfigure({ getPrisma })",
	);
};

const noopRegistryConfigLoader: InjectedRegistryConfigLoader = () => {
	throw new Error(
		"orpc: registry config loader not configured — bootloader must call orpcConfigure({ loadRegistryConfig })",
	);
};

const noopGetEntriesByType: InjectedGetEntriesByType = () =>
	Promise.reject(
		new Error(
			"orpc: getEntriesByType not configured — bootloader must call orpcConfigure({ getEntriesByType })",
		),
	);

const noopProcedureErrorRecorder: InjectedProcedureErrorRecorder = () => {};

// 3. Module-level state. Method-table injections (_auth, _logger) keep
//    their default singleton's identity for the process lifetime (capture
//    invariant, reference/configured-primitives.md): modules capture
//    `const x = getX()` at import time — BEFORE configure() — so configure()
//    MUTATES them in place, never rebinds. Provider functions and value
//    state rebind; their getters are called at call sites only.
const _auth: InjectedAuth = noopAuth;
const _logger: InjectedLogger = noopLogger;
let _getPrisma: () => InjectedPrisma = noopPrismaProvider;
let _loadRegistryConfig: InjectedRegistryConfigLoader =
	noopRegistryConfigLoader;
let _getEntriesByType: InjectedGetEntriesByType = noopGetEntriesByType;
let _scalaDevKey: string | undefined;
let _serviceApiKey: string | undefined;
let _procedureErrorRecorder: InjectedProcedureErrorRecorder =
	noopProcedureErrorRecorder;

// 4. Bootloader calls this exactly once before any tier-1+ code runs.
export function configure(opts: {
	auth?: InjectedAuth;
	logger?: InjectedLogger;
	getPrisma?: () => InjectedPrisma;
	loadRegistryConfig?: InjectedRegistryConfigLoader;
	getEntriesByType?: InjectedGetEntriesByType;
	scalaDevKey?: string;
	serviceApiKey?: string;
	procedureErrorRecorder?: InjectedProcedureErrorRecorder;
}): void {
	if (opts.auth) Object.assign(_auth, opts.auth);
	if (opts.logger) Object.assign(_logger, opts.logger);
	if (opts.getPrisma) _getPrisma = opts.getPrisma;
	if (opts.loadRegistryConfig) _loadRegistryConfig = opts.loadRegistryConfig;
	if (opts.getEntriesByType) _getEntriesByType = opts.getEntriesByType;
	if (opts.scalaDevKey !== undefined) _scalaDevKey = opts.scalaDevKey;
	if (opts.serviceApiKey !== undefined) _serviceApiKey = opts.serviceApiKey;
	if (opts.procedureErrorRecorder)
		_procedureErrorRecorder = opts.procedureErrorRecorder;
}

// 5. Internal getters — ALL orpc call sites use these.
export function getAuth(): InjectedAuth {
	return _auth;
}

export function getLogger(): InjectedLogger {
	return _logger;
}

export function getPrisma(): InjectedPrisma {
	return _getPrisma();
}

export function loadRegistryConfig<T = unknown>(
	type: string,
	slug: string,
): Promise<T> {
	return _loadRegistryConfig(type, slug) as Promise<T>;
}

export function getEntriesByType<T = unknown>(type: string): Promise<T[]> {
	return _getEntriesByType(type) as Promise<T[]>;
}

export function getScalaDevKey(): string | undefined {
	return _scalaDevKey;
}

export function getServiceApiKey(): string | undefined {
	return _serviceApiKey;
}

export function getProcedureErrorRecorder(): InjectedProcedureErrorRecorder {
	return _procedureErrorRecorder;
}
