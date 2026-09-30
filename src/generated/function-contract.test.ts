/**
 * @status generated — ts_function_contract_runner template (scala-test-suites
 * templates/ts_function_contract_runner.pkl @1.3.1) over @teamscala/orpc's
 * test_vector rows: one `it` per function_call row (args -> value or
 * expect_error) and one per fs_flow row (ordered steps in a temp
 * workspace). This runner carries NO facts: every case is the registry
 * row projected into ./function-contract-rows.json. Regenerate from
 * inputs/<repo>/function_contract_runner.json; hand edits are overwritten.
 */
import { describe, expect, it, mock } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import projected from "./function-contract-rows.json";

const ROWS = (projected.rows ?? projected) as Vector[];

// This file, and the one row a child process is selecting. Absent in the
// parent run: every row executes there, and a row with fixtures forks.
const SELF = import.meta.path;
const SELECTED = process.env.SCALA_CONTRACT_ROW;

if (!Array.isArray(ROWS)) {
	throw new Error("./function-contract-rows.json must project an array of rows — the runner executes registry rows, never a hand-written case list");
}

const PKG = "@teamscala/orpc";

// import.meta.dir is this FILE's directory (bun's own value, extension-
// independent) — row modules are repo-relative, so the package root is the
// nearest enclosing directory carrying a package.json, walked up: suites
// render CO-LOCATED at any depth (1.3.0), and a fixed two-levels-up guess
// resolves src/tier-selector/TierSelector/ suites against src/.
const ROOT = (() => {
	let dir = import.meta.dir;
	for (let depth = 0; depth < 8; depth++) {
		if (existsSync(join(dir, "package.json"))) return dir;
		dir = join(dir, "..");
	}
	throw new Error("no package.json above " + import.meta.dir + " — a contract suite renders inside a package");
})();

type Vector = Record<string, any> & { suite_type: string; slug: string };

// The ONE arg encoding: a declared error value is data, never a literal
// in the row's JSON — {"$error": {"class", "module"?, "args"}}.
// A JSON null at an ARG position is ABSENCE, never a value (row-writer
// convention 2026-09-28 19:50 #1): it decodes to `undefined`, which is what
// a Rust None and an omitted optional both mean. A null under `expect` is
// the opposite — a VALUE, asserted with toEqual(null).
async function decodeValue(value: unknown): Promise<unknown> {
	if (value === null) return undefined;
	if (value !== null && typeof value === "object" && "$error" in (value as object)) {
		const spec = (value as { $error: { class: string; module?: string; args?: unknown[] } }).$error;
		const ctor = spec.module
			? ((await import(spec.module)) as Record<string, any>)[spec.class]
			: (globalThis as Record<string, any>)[spec.class];
		if (typeof ctor !== "function") throw new Error("unconstructible error class: " + spec.class);
		return new ctor(...(spec.args ?? []));
	}
	// A FUNCTION-valued arg: a block export is built from thunks, and JSON
	// cannot spell one. {"$fn": {"returns": <any>}} is the zero-arg thunk
	// returning that value; {"$fn": {"throws": <any>}} is the one raising
	// it. Decoded HERE, at build time, so the closure captures a finished
	// value rather than an unresolved promise.
	if (typeof value === "object" && "$fn" in (value as object)) {
		const spec = (value as { $fn: { returns?: unknown; throws?: unknown } }).$fn;
		if (spec.returns !== undefined) return () => spec.returns;
		if (spec.throws !== undefined) {
			const raised = await decodeValue(spec.throws);
			return () => { throw raised; };
		}
		throw new Error("$fn declares neither returns nor throws — a function whose behaviour is undeclared is a case the runner cannot run");
	}
	if (Array.isArray(value)) return Promise.all(value.map(decodeValue));
	// Composite args are walked: a $error or $fn nested at a member position is
	// the same encoding one level down, not a literal object that happens to
	// contain one.
	if (typeof value === "object") {
		const walked: Record<string, unknown> = {};
		for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
			walked[key] = await decodeValue(inner);
		}
		return walked;
	}
	return value;
}

// Resolve the EXPORT, without calling it: the shape of a class, a frozen
// table or a namespace is a contract a call cannot state, so this is the
// half of the pair callExport below cannot do.
async function loadExport(modulePath: string, exportName: string): Promise<unknown> {
	const mod = (await import(join(ROOT, modulePath))) as Record<string, any>;
	if (!(exportName in mod)) throw new Error("no export " + exportName + " in " + modulePath);
	return mod[exportName];
}

async function callExport(modulePath: string, exportName: string, decodedArgs: unknown[]): Promise<unknown> {
	const fn = await loadExport(modulePath, exportName);
	if (typeof fn !== "function") throw new Error("export " + exportName + " in " + modulePath + " is not a function — a row that wants its shape declares expect.export_shape");
	// Decoding happened at the CALLER, once. Decoding here too would walk an
	// already-decoded $error instance a second time — an Error object has no
	// enumerable own keys, so the walk would collapse it to {} and the row
	// would assert against a value the subject never received.
	return await fn(...decodedArgs);
}

function applyEnv(env?: Record<string, string>): () => void {
	const before: Record<string, string | undefined> = {};
	for (const [key, value] of Object.entries(env ?? {})) {
		before[key] = process.env[key];
		process.env[key] = value;
	}
	return () => {
		for (const [key, value] of Object.entries(before)) {
			if (value === undefined) delete process.env[key];
			else process.env[key] = value;
		}
	};
}

function assertWellFormed(row: Vector): void {
	const bad = (msg: string): never => {
		throw new Error("row " + row.slug + " is malformed: " + msg);
	};
	if (PKG !== "*" && row.package !== PKG) bad("package " + JSON.stringify(row.package) + " — expected " + JSON.stringify(PKG));
	if (row.suite_type === "function_call") {
		if (typeof row.export !== "string" || row.export.length === 0) bad("export must be a non-empty string");
		if (row.args === null || row.env === null) bad("args and env must be arrays/objects, never null — null and an absent key are different states");
		if (row.args !== undefined && !Array.isArray(row.args)) bad("args must be a positional array (ruling 18:02 #1)");
		if (row.expect !== undefined && row.expect_error !== undefined) bad("declares both expect and expect_error — the arms are XOR");
		if (row.expect === undefined && row.expect_error === undefined) bad("declares neither expect nor expect_error — a row that asserts nothing asserts nothing");
		// null and an absent key are DIFFERENT states everywhere in a row: expect
		// null is a value (asserted with toEqual(null)), but a null args/env is a
		// malformed row — it is refused, never silently substituted.
		if (row.args === null || row.env === null) bad("args and env must be arrays/objects, never null");
		assertOneAxis("row " + row.slug, row.expect, row.args as unknown[] | undefined, row.expect_error);
	} else if (row.suite_type === "fs_flow") {
		if (!Array.isArray(row.steps) || (row.steps as unknown[]).length === 0) bad("fs_flow needs non-empty ordered steps");
		for (let i = 0; i < (row.steps as unknown[]).length; i++) {
			const step = (row.steps as any[])[i];
			if (typeof step.call !== "string" || step.call.length === 0) bad("steps[" + i + "].call must be a non-empty string");
			if (step.args === null) bad("steps[" + i + "].args must be a positional array, never null — null and an absent key are different states");
			if (step.args !== undefined && !Array.isArray(step.args)) bad("steps[" + i + "].args must be a positional array");
			if (step.expect === undefined && step.expect_error === undefined) bad("steps[" + i + "] asserts nothing");
			assertOneAxis("steps[" + i + "] of row " + row.slug, step.expect, step.args as unknown[] | undefined, step.expect_error);
		}
	} else {
		bad("unknown suite_type " + JSON.stringify(row.suite_type));
	}
}

async function expectCall(row: Vector, exportName: string, args: unknown[]): Promise<void> {
	const restore = applyEnv(row.env);
	try {
		await withStubs(row, async () => {
			if (isExportShape(row.expect)) {
				assertStructural(row.slug, await loadExport(row.module, exportName), (row.expect as Record<string, unknown>)[EXPORT_SHAPE]);
			} else if (row.expect_error === undefined) {
				const decoded = await Promise.all(args.map(decodeValue));
				if (isStructural(row.expect) && (row.expect as Record<string, unknown>)[ARG_SHAPE] !== undefined) argTarget(row.slug, row.expect as Record<string, unknown>, decoded);
				const value = await callExport(row.module, exportName, decoded);
				if (isStructural(row.expect)) {
					if ((row.expect as Record<string, unknown>)[ARG_SHAPE] !== undefined) assertArgShape(row.slug, row.expect as Record<string, unknown>, decoded);
					else assertStructural(row.slug, value, row.expect);
				}
				else if (isTextSpec(row.expect)) assertText(row.slug, value, row.expect as Record<string, unknown>);
				else expect(value).toEqual(row.expect);
			} else {
				const raised = callExport(row.module, exportName, await Promise.all(args.map(decodeValue)));
				await expect(raised).rejects.toThrow(row.expect_error);
			}
		});
	} finally {
		restore();
	}
}

// ------------------------------------------------------ structural expect
// A step names its own target: the live fs_flow rows spell call as
// "path/to/module.ts:exportName" and the arm admits no row module, so a
// step that declares no row module is split at its LAST colon. A call that
// can neither be split nor resolved is refused BY NAME.
function stepTarget(row: Vector, step: any): [string, string] {
	if (row.module !== undefined && row.module !== null && row.module !== "") return [String(row.module), String(step.call)];
	const spelled = String(step.call);
	const colon = spelled.lastIndexOf(":");
	if (colon <= 0 || colon === spelled.length - 1) {
		throw new Error("row " + row.slug + " is malformed: a step with no row module spells call as <module>:<export>, got " + JSON.stringify(spelled));
	}
	return [spelled.slice(0, colon), spelled.slice(colon + 1)];
}

const STRUCTURAL_VERBS = ["has_members", "member_is", "member_equals", "reads_resolve"] as const;
const EXPORT_SHAPE = "export_shape";
const ARG_SHAPE = "arg_shape";
const TEXT_VERBS = ["contains_text", "absent", "in_order", "repeated"] as const;

function isTextSpec(spec: unknown): boolean {
	return (
		spec !== null &&
		typeof spec === "object" &&
		!Array.isArray(spec) &&
		Object.keys(spec as object).some((key) => (TEXT_VERBS as readonly string[]).includes(key))
	);
}

function assertText(slug: string, value: unknown, spec: Record<string, unknown>): void {
	const bad = (msg: string): never => {
		throw new Error("row " + slug + " text expect did not hold: " + msg);
	};
	if (typeof value !== "string") {
		throw new Error("row " + slug + " is malformed: a text expect asserts a returned string, got " + (value === null ? "null" : typeof value));
	}
	const text = value as string;
	for (const verb of Object.keys(spec)) {
		if (!(TEXT_VERBS as readonly string[]).includes(verb)) {
			throw new Error("row " + slug + " is malformed: text expect " + verb + " is not a declared verb " + JSON.stringify(TEXT_VERBS) + " — a predicate this runner does not understand is a case it stopped asserting");
		}
		const needles = spec[verb];
		if (verb === "contains_text") {
			for (const needle of needles as string[]) if (!text.includes(needle)) bad("the text has no " + JSON.stringify(needle));
		} else if (verb === "absent") {
			for (const needle of needles as string[]) if (text.includes(needle)) bad("the text carries " + JSON.stringify(needle));
		} else if (verb === "in_order") {
			let after = -1;
			let previous = "the start";
			for (const marker of needles as string[]) {
				const at = text.indexOf(marker);
				if (at === -1) bad(JSON.stringify(marker) + " is not in the text at all");
				if (at <= after) bad(JSON.stringify(marker) + " is not after " + previous);
				after = at;
				previous = JSON.stringify(marker);
			}
		} else {
			const rep = needles as { pattern?: unknown; count?: unknown; group?: unknown };
			if (typeof rep.pattern !== "string" || typeof rep.count !== "number") {
				throw new Error("row " + slug + " is malformed: repeated needs {pattern, count} and an optional group — how many times the pattern matches, and which capture must not drift between the matches");
			}
			let matches: RegExpMatchArray[];
			try {
				matches = [...text.matchAll(new RegExp(rep.pattern, "g"))];
			} catch (err) {
				throw new Error("row " + slug + " is malformed: repeated.pattern is not a usable regex — " + String(err));
			}
			if (matches.length !== rep.count) bad("the pattern matched " + matches.length + " times, not the declared " + rep.count);
			if (rep.group !== undefined) {
				const group = rep.group as number;
				const first = matches[0]?.[group];
				if (first === undefined) bad("capture group " + group + " took no part in the first match");
				for (const match of matches) {
					if (match[group] !== first) bad("capture group " + group + " differs between matches: " + JSON.stringify(first) + " vs " + JSON.stringify(match[group]) + " — the two copies of this text must be the same set");
				}
			}
		}
	}
}


function isExportShape(spec: unknown): boolean {
	return (
		spec !== null &&
		typeof spec === "object" &&
		!Array.isArray(spec) &&
		(spec as Record<string, unknown>)[EXPORT_SHAPE] !== undefined
	);
}

function assertOneAxis(where: string, spec: unknown, args: unknown[] | undefined, expectError: unknown): void {
	const bad = (msg: string): never => {
		throw new Error(where + " is malformed: " + msg);
	};
	if (isExportShape(spec)) {
		const declared = (spec as Record<string, unknown>)[EXPORT_SHAPE];
		if (declared === null || typeof declared !== "object" || Array.isArray(declared)) bad(EXPORT_SHAPE + " must be a structural spec object");
		if (expectError !== undefined) bad(EXPORT_SHAPE + " with expect_error — no call is made, so nothing is raised to match");
		if (args !== undefined && args.length > 0) bad(EXPORT_SHAPE + " declares args — the export is not called, so nothing receives them");
		for (const verb of Object.keys(spec as object)) {
			if (verb !== EXPORT_SHAPE) bad("expect declares " + verb + " alongside " + EXPORT_SHAPE + " — one row states one axis; a row that wants both is two rows");
		}
		return;
	}
	if (isRenderRow(spec, args)) {
		if (args !== undefined && args.length > 1) bad("a render row takes at most one arg — the props object, not a positional list");
		if (spec === null || spec === undefined || typeof spec !== "object" || Array.isArray(spec)) return;
		for (const verb of Object.keys(spec as object)) {
			if (verb !== "render") bad("expect declares " + verb + " alongside render — one row states one axis; a row that wants both is two rows");
		}
		const renderSpec = (spec as Record<string, unknown>).render;
		if (renderSpec === null || typeof renderSpec !== "object" || Array.isArray(renderSpec)) bad("render must be a spec object");
		for (const verb of Object.keys(renderSpec as object)) {
			if (!(RENDER_VERBS as readonly string[]).includes(verb)) bad("render " + verb + " is not a declared verb " + JSON.stringify(RENDER_VERBS) + " — a predicate this runner does not understand is a case it stopped asserting");
		}
		const clickSelectors = (renderSpec as Record<string, unknown>).click;
		if (clickSelectors !== undefined) {
			if ((spec as Record<string, unknown>).expect_error !== undefined) bad("click beside expect_error — a row that expects the render to throw has nothing to click");
			const selectors = (Array.isArray(clickSelectors) ? clickSelectors : [clickSelectors]) as unknown[];
			if (selectors.length === 0) bad("click needs at least one selector");
			for (const selector of selectors) {
				if (typeof selector !== "string" || selector.length === 0) bad("click selectors must be non-empty strings, got " + JSON.stringify(selector));
			}
		}
		return;
	}
	if (spec === null || spec === undefined || typeof spec !== "object" || Array.isArray(spec)) return;
	if ((spec as Record<string, unknown>)[ARG_SHAPE] === undefined) return;
	const argSpec = (spec as Record<string, unknown>)[ARG_SHAPE];
	if (argSpec === null || typeof argSpec !== "object" || Array.isArray(argSpec)) bad(ARG_SHAPE + " must be a spec object");
	if (typeof (argSpec as { arg?: unknown }).arg !== "number") bad(ARG_SHAPE + ".arg must be declared — the positional index of the argument the subject mutates");
	for (const verb of Object.keys(spec as object)) {
		if (verb !== ARG_SHAPE) bad("expect declares " + verb + " alongside " + ARG_SHAPE + " — one row states one axis; a row that wants both is two rows");
	}
}

function isStructural(spec: unknown): boolean {
	return (
		isExportShape(spec) ||
		(spec !== null &&
		typeof spec === "object" &&
		!Array.isArray(spec) &&
		Object.keys(spec as object).some((key) =>
			(STRUCTURAL_VERBS as readonly string[]).includes(key) || key === ARG_SHAPE
		)
	)
	);
}

function argTarget(slug: string, spec: Record<string, unknown>, decoded: unknown[]): number {
	const target = (spec[ARG_SHAPE] as { arg?: unknown }).arg;
	if (typeof target !== "number" || !Number.isInteger(target) || target < 0 || target >= decoded.length) {
		throw new Error("row " + slug + " is malformed: " + ARG_SHAPE + ".arg must be an argument position this row declares (0.." + (decoded.length - 1) + "), got " + JSON.stringify(target));
	}
	return target;
}

function assertArgShape(slug: string, spec: Record<string, unknown>, decoded: unknown[]): void {
	assertStructural(slug, decoded[argTarget(slug, spec, decoded)], spec[ARG_SHAPE], "arg");
}

function memberAt(value: unknown, path: string): unknown {
	let at: any = value;
	for (const key of path.split(".")) {
		if (at === null || at === undefined) return undefined;
		at = at[key];
	}
	return at;
}

function assertStructural(slug: string, value: unknown, spec: any, declaration?: string): void {
	for (const verb of Object.keys(spec)) {
		if (verb === declaration) continue;
		if (!(STRUCTURAL_VERBS as readonly string[]).includes(verb)) {
			throw new Error(
			"row " + slug + " is malformed: structural expect " + verb +
			" is not a declared verb " + JSON.stringify(STRUCTURAL_VERBS) +
			" — a predicate this runner does not understand is a case it stopped asserting");
		}
	}
	const bad = (verb: string, detail: string): never => {
		throw new Error("row " + slug + " outcome " + verb + " did not hold: " + detail);
	};
	if (spec.has_members !== undefined) {
		for (const path of spec.has_members as string[]) {
			if (memberAt(value, path) === undefined) bad("has_members", path + " is not declared");
		}
	}
	if (spec.member_is !== undefined) {
		for (const [path, kind] of Object.entries(spec.member_is as Record<string, string>)) {
			const got = memberAt(value, path);
			if (got === undefined) bad("member_is", path + " is not declared");
			if (typeof got !== kind) bad("member_is", path + " is " + typeof got + ", the row declares " + kind);
		}
	}
	if (spec.member_equals !== undefined) {
		for (const [path, want] of Object.entries(spec.member_equals as Record<string, unknown>)) {
			expect(memberAt(value, path)).toEqual(want);
		}
	}
	if (spec.reads_resolve !== undefined) {
		for (const path of spec.reads_resolve as string[]) {
			try {
				memberAt(value, path);
			} catch (err) {
				bad("reads_resolve", "reading " + path + " threw " + String(err));
			}
		}
	}
}

const RENDER_VERBS = ["contains", "selector_present", "selector_absent", "click"] as const;
const ELEMENT_MARKER = "$throw_on_render";

function isRender(spec: unknown): boolean {
	return (
		spec !== null &&
		typeof spec === "object" &&
		!Array.isArray(spec) &&
		(spec as Record<string, unknown>).render !== undefined
	);
}

function hasMarker(value: unknown): boolean {
	if (Array.isArray(value)) return value.some(hasMarker);
	if (value !== null && typeof value === "object") {
		if (Object.keys(value as object).includes(ELEMENT_MARKER)) return true;
		for (const key of Object.keys(value as object)) {
			if (hasMarker((value as Record<string, unknown>)[key])) return true;
		}
	}
	return false;
}

function isRenderRow(spec: unknown, args: unknown[] | undefined): boolean {
	return isRender(spec) || (args !== undefined && args.some(hasMarker));
}

// The ONE element encoding: {"$throw_on_render": "<message>"} anywhere in
// the props tree becomes a component whose render raises that message — the
// throwing child a recovery contract is ABOUT. Anything else starting with $
// inside a render tree is refused: a marker this runner does not know would
// otherwise render as inert data and a case would silently stop asserting.
function buildElements(React: any, value: unknown, slug: string): unknown {
	if (Array.isArray(value)) return value.map((item, index) => {
		const builtItem = buildElements(React, item, slug);
		if (builtItem !== null && typeof builtItem === "object" && (builtItem as Record<string, unknown>).$$typeof !== undefined) return React.cloneElement(builtItem, { key: String(index) });
		return builtItem;
	});
	if (value !== null && typeof value === "object") {
		const record = value as Record<string, unknown>;
		if (Object.keys(record).includes(ELEMENT_MARKER)) {
			if (typeof record[ELEMENT_MARKER] !== "string") throw new Error("row " + slug + " is malformed: " + ELEMENT_MARKER + " takes the error message string, got " + JSON.stringify(record[ELEMENT_MARKER]));
			const message = record[ELEMENT_MARKER] as string;
			return React.createElement(function Thrower(): never {
				throw new Error(message);
			});
		}
		const built: Record<string, unknown> = {};
		for (const key of Object.keys(record)) {
			if (key.startsWith("$")) throw new Error("row " + slug + " is malformed: element marker " + key + " is not declared — a marker this runner does not know is a child that would render as inert data");
			built[key] = buildElements(React, record[key], slug);
		}
		return built;
	}
	return value;
}

function assertRenderSpec(slug: string, container: HTMLElement, spec: any): void {
	const text = container.textContent ?? "";
	const bad = (verb: string, detail: string): never => {
		throw new Error("row " + slug + " outcome " + verb + " did not hold: " + detail);
	};
	for (const needle of (spec.contains ?? []) as string[]) {
		if (!text.includes(needle)) bad("contains", "the rendered text has no " + JSON.stringify(needle));
	}
	for (const selector of (spec.selector_present ?? []) as string[]) {
		if (container.querySelector(selector) === null) bad("selector_present", "no element matches " + selector);
	}
	for (const selector of (spec.selector_absent ?? []) as string[]) {
		if (container.querySelector(selector) !== null) bad("selector_absent", selector + " is present");
	}
}

async function renderRow(row: Vector): Promise<void> {
	const restore = applyEnv(row.env);
	try {
		await withStubs(row, async () => {
			if (!globalThis.document) {
				const { GlobalRegistrator } = await import("@happy-dom/global-registrator");
				await GlobalRegistrator.register({ url: "http://localhost" });
			}
			(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
			const React = await import("react");
			const { createRoot } = await import("react-dom/client");
			const act = (React as unknown as { act: (run: () => Promise<void>) => Promise<void> }).act;
			const Component = await loadExport(row.module, row.export);
			if (typeof Component !== "function") throw new Error("export " + row.export + " in " + row.module + " is not a component — a render row needs a callable component export");
			const decoded = await Promise.all(((row.args ?? []) as unknown[]).map(decodeValue));
			const props = decoded.length === 0 ? {} : buildElements(React, decoded[0], row.slug);
			const host = document.createElement("div");
			document.body.appendChild(host);
			const root = createRoot(host);
			let caught: unknown;
			try {
				await act(async () => {
					root.render(React.createElement(Component, props as Record<string, unknown>));
				});
			} catch (err) {
				caught = err;
			}
			if (row.expect_error !== undefined) {
				if (caught === undefined) throw new Error("row " + row.slug + " expected the render to throw " + JSON.stringify(row.expect_error) + ", and it returned a tree");
				const message = caught instanceof Error ? caught.message : String(caught);
				if (!message.includes(String(row.expect_error))) throw new Error("row " + row.slug + " outcome expect_error did not hold: the render threw " + JSON.stringify(message));
				await act(async () => { root.unmount(); });
				host.remove();
				return;
			}
			if (caught !== undefined) throw caught instanceof Error ? caught : new Error(String(caught));
			const clickSelectors = ((row.expect as Record<string, unknown>).render as Record<string, unknown>).click;
			if (clickSelectors !== undefined) {
				for (const selector of (Array.isArray(clickSelectors) ? clickSelectors : [clickSelectors]) as string[]) {
					const target = host.querySelector(selector);
					if (target === null) throw new Error("row " + row.slug + " outcome click did not hold: no element matches " + selector);
					await act(async () => {
						target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
					});
				}
			}
			assertRenderSpec(row.slug, host, (row.expect as Record<string, unknown>).render);
			await act(async () => { root.unmount(); });
			host.remove();
		});
	} finally {
		restore();
	}
}
function runFsFlow(row: Vector): Promise<void> {
	return (async () => {
		const workspace = await mkdtemp(join(tmpdir(), "contract-"));
		const before = process.env.SCALA_WORKSPACE_ROOT;
		process.env.SCALA_WORKSPACE_ROOT = workspace;
		try {
			await withStubs(row, async () => {
				for (const step of row.steps as Vector[]) {
					const [modPath, stepExport] = stepTarget(row, step);
					const args = await Promise.all((step.args ?? []).map(decodeValue));
					if (isExportShape(step.expect)) {
						assertStructural(row.slug, await loadExport(modPath, stepExport), (step.expect as Record<string, unknown>)[EXPORT_SHAPE]);
					} else if (step.expect_error !== undefined) {
						await expect(callExport(modPath, stepExport, args)).rejects.toThrow(step.expect_error);
					} else {
						if (isStructural(step.expect) && (step.expect as Record<string, unknown>)[ARG_SHAPE] !== undefined) argTarget(row.slug, step.expect as Record<string, unknown>, args);
						const value = await callExport(modPath, stepExport, args);
						if (isStructural(step.expect)) {
							if ((step.expect as Record<string, unknown>)[ARG_SHAPE] !== undefined) assertArgShape(row.slug, step.expect as Record<string, unknown>, args);
							else assertStructural(row.slug, value, step.expect);
						}
						else if (isTextSpec(step.expect)) assertText(row.slug, value, step.expect as Record<string, unknown>);
						else expect(value).toEqual(step.expect);
					}
				}
			});
	} finally {
			if (before === undefined) delete process.env.SCALA_WORKSPACE_ROOT;
			else process.env.SCALA_WORKSPACE_ROOT = before;
			await rm(workspace, { recursive: true, force: true });
	}
	})();
}


// ------------------------------------------------------------- fixtures
// Stubs, recorded outcomes and seeded state are three different facts. This
// runner carries the FIRST two; seeded state is the db_flow arm's business.
//
// The CLOSED outcome vocabulary. A key outside it is refused by name: a
// predicate the runner does not understand is a row whose case silently
// stopped being asserted, which is the one failure this wave cannot have.
const OUTCOME_VERBS = ["count", "equals", "contains", "absent", "sql_contains", "sql_absent", "binds"] as const;

type Stub = Vector & { module: string; export: string; record?: string; returns?: unknown; error?: unknown; when_sql_contains?: string };
type Call = { args: unknown[] };

// A stub's `module` is the SUBJECT'S OWN IMPORT SPECIFIER — what the
// subject wrote in its import line — so it resolves against the subject
// file's directory, not the package root.
function stubPath(row: Vector, stub: Stub): string {
	return resolve(dirname(resolve(ROOT, String(row.module))), String(stub.module));
}

// A stub answers with the DATA the row declared, decoded SYNCHRONOUSLY: a
// subject may call its dependency without awaiting it, and an async stub
// hands that subject a Promise whose members are undefined — the row then
// asserts against a value no row declared. Awaiting a plain value is the
// value, so an async subject is unaffected. A stub return is a VALUE
// position: null is null here, the opposite of an ARG position.
function decodeStubReturn(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(decodeStubReturn);
	if (typeof value === "object" && value !== null) {
		if ("$fn" in value) {
			// A stubbed export may RETURN a contract whose members are FUNCTIONS —
			// an injected page client (getBrandColors: () => Record) is the measured
			// shape. {"$fn": {"returns": X}} decodes to the same SYNC zero-arg thunk
			// the arg side builds; a function member declared as plain data would be
			// called by the subject and fail as "not a function" against a stub that
			// answered with an inert object.
			const spec = (value as { $fn: { returns?: unknown; throws?: unknown } }).$fn;
			if (spec.returns !== undefined) return () => decodeStubReturn(spec.returns);
			if (spec.throws !== undefined) {
				const raised = decodeStubReturn(spec.throws);
				return () => {
					throw raised;
				};
			}
			throw new Error("a fixture stub return declares $fn with neither returns nor throws — a function whose behaviour is undeclared is a case the runner cannot run");
		}
		if ("$error" in value) {
			throw new Error("a fixture stub return declares $error — a stub's failure is the stub-level error key; a return is what the call answers with");
		}
		const walked: Record<string, unknown> = {};
		for (const [key, inner] of Object.entries(value as Record<string, unknown>)) {
			walked[key] = decodeStubReturn(inner);
		}
		return walked;
	}
	return value;
}

// Every stub sharing an export forms ONE group: a Db stub answers per SQL
// shape, and the first shape whose needle the call's SQL satisfies wins. A
// call matching no declared shape REFUSES — guessing an answer no row
// declared is how a test asserts something that was never true.
function stubReturn(slug: string, group: Stub[], call: Call): unknown {
	const sql = typeof call.args[0] === "string" ? (call.args[0] as string) : "";
	for (const stub of group) {
		if (stub.when_sql_contains !== undefined && !sql.includes(String(stub.when_sql_contains))) continue;
		if (stub.error !== undefined) throw stub.error;
		return stub.returns;
	}
	if (group.every((stub) => stub.when_sql_contains !== undefined)) {
		throw new Error(
			`row ${slug} is malformed: no fixture stub matches the SQL shape ${JSON.stringify(sql.slice(0, 120))} — ` +
			"declared shapes: " + group.map((stub) => JSON.stringify(stub.when_sql_contains)).join(", "));
	}
	return group[0].returns;
}

// Applies the row's stubs, runs the body, ASSERTS the recording on the
// success path, then RESTORES every mocked module with the exports it had —
// a stub that outlived its row would answer the rows after it with a value
// they never declared. Outcomes are NOT asserted when the body itself
// threw: the row already failed for a more specific reason than any
// predicate over a call that may never have completed.
async function withStubs<T>(row: Vector, fn: () => Promise<T>): Promise<T> {
	const stubs = (row.fixtures?.stubs ?? []) as Stub[];
	if (stubs.length === 0) return fn();
	const slug = row.slug;
	const recorders: Record<string, Call[]> = {};
	for (const stub of stubs) {
		if (stub.record !== undefined) (recorders[stub.record] ??= []);
	}
	const paths = [...new Set(stubs.map((stub) => stubPath(row, stub)))];
	for (const path of paths) {
		const group = stubs.filter((stub) => stubPath(row, stub) === path);
		const exported: Record<string, unknown> = {};
		for (const name of new Set(group.map((stub) => String(stub.export)))) {
			const arms = group.filter((stub) => String(stub.export) === name);
			exported[name] = (...args: unknown[]) => {
				const call: Call = { args };
				for (const arm of arms) {
					if (arm.record !== undefined) (recorders[arm.record] ??= []).push(call);
				}
				return decodeStubReturn(stubReturn(slug, arms, call));
			};
		}
		mock.module(path, () => exported);
	}
	const result = await fn();
	returnOutcome(slug, recorders, row.outcomes as Record<string, Vector[]> | undefined);
	return result;
}

// A STUB LIVES FOR THE WHOLE PROCESS — measured on bun 1.4.2, not assumed:
// mock.module(path, () => original) leaves the mock installed,
// mock.restore() does not restore module mocks, and the live namespace is
// readonly, so there is no in-process teardown that undoes a module mock.
// The honest consequence: a row with fixtures runs in its OWN PROCESS (
// runIsolated below), so no stub can answer a row that never declared it.
function hasFixtures(row: Vector): boolean {
	return Array.isArray(row.fixtures?.stubs) && (row.fixtures!.stubs as Stub[]).length > 0;
}

// Re-runs THIS FILE under `bun test` selecting only this row, in a fresh
// process. The child's exit code is the verdict and its output is the
// evidence, so a refusal inside the child (an undeclared SQL shape, an
// outcome verb the runner does not know) surfaces verbatim in the parent.
function runIsolated(row: Vector): void {
	const child = spawnSync("bun", ["test", SELF, "--test-name-pattern", row.slug], {
		cwd: ROOT,
		env: { ...process.env, SCALA_CONTRACT_ROW: row.slug },
		encoding: "utf8",
	});
	if (child.status !== 0) {
		const evidence = (child.stderr || child.stdout || "").trimEnd().split("\n").slice(-14).join("\n");
		throw new Error(`row ${row.slug} failed in its isolated run:\n${evidence}`);
	}
}

// ONE predicate vocabulary over what the stubs recorded: count is the number
// of calls; equals is the whole recording deep-equal to the declared value;
// contains/absent are substrings of it; sql_contains/sql_absent are over the
// recorded SQL; binds is the binds argument of the selected call (the one
// sql_contains names, or the first call when no SQL predicate is declared),
// deep-equal to the declared array. Every declared verb is checked — one the
// runner does not know is a refusal, never a skip.
function returnOutcome(slug: string, recorders: Record<string, Call[]>, outcomes?: Record<string, Vector[]>): void {
	if (outcomes === undefined) return;
	for (const [recorder, predicates] of Object.entries(outcomes)) {
		const calls = recorders[recorder] ?? [];
		for (const predicate of predicates) {
			for (const verb of Object.keys(predicate)) {
				if (!(OUTCOME_VERBS as readonly string[]).includes(verb)) {
					throw new Error(
						`row ${slug} is malformed: outcome ${recorder}.${verb} is not a declared verb ` +
						JSON.stringify(OUTCOME_VERBS) + " — a predicate this runner does not understand is a case it stopped asserting");
				}
			}
			const say = (verb: string): never => {
				throw new Error(`row ${slug} outcome ${recorder}.${verb} did not hold`);
			};
			if (predicate.count !== undefined && calls.length !== Number(predicate.count)) say("count");
			if (predicate.sql_absent !== undefined) {
				for (const call of calls) {
					if (typeof call.args[0] === "string" && (call.args[0] as string).includes(String(predicate.sql_absent))) say("sql_absent");
				}
			}
			const text = JSON.stringify(calls);
			if (predicate.contains !== undefined && !text.includes(String(predicate.contains))) say("contains");
			if (predicate.absent !== undefined && text.includes(String(predicate.absent))) say("absent");
			if (predicate.equals !== undefined && text !== JSON.stringify(predicate.equals)) say("equals");
			if (predicate.sql_contains !== undefined && !calls.some((call) => typeof call.args[0] === "string" && (call.args[0] as string).includes(String(predicate.sql_contains)))) say("sql_contains");
			if (predicate.binds !== undefined) {
				const selected = predicate.sql_contains === undefined
					? calls[0]
					: calls.find((call) => typeof call.args[0] === "string" && (call.args[0] as string).includes(String(predicate.sql_contains)));
				if (selected === undefined) say("binds");
				const binds = selected.args.find((arg) => Array.isArray(arg));
				if (JSON.stringify(binds) !== JSON.stringify(predicate.binds)) say("binds");
			}
		}
	}
}
function runRow(row: Vector): Promise<void> | void {
	// Refused BY NAME before any call: the failing `it` is the row's slug.
	assertWellFormed(row);
	if (SELECTED === undefined && hasFixtures(row)) return runIsolated(row);
	if (isRenderRow(row.expect, row.args as unknown[] | undefined)) return renderRow(row);
	if (row.suite_type === "fs_flow") return runFsFlow(row);
	return expectCall(row, row.export, row.args ?? []);
}

describe("@teamscala/orpc function_call contracts", () => {
	for (const row of ROWS) {
		if (SELECTED !== undefined && row.slug !== SELECTED) continue;
		it(row.slug, async () => {
			await runRow(row);
		});
	}
});
