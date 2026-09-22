// @system codegen
// @status generated
// @edit change the suite in the owned-suites band, then re-run codegen. Hand-edits are overwritten.
//
// This suite's assertions are OWNED by the codegen band: the band module
// carries them verbatim, this file is the emission, and hand edits here are
// overwritten on the next run. The rationale each assertion carries moved
// with it into the band.

import { describe, expect, it } from "bun:test";

/**
 * Extracted normalizer logic for testing.
 * This mirrors the normalization logic in src/routes/api/rpc.$.tsx
 * (lines 267-294) to test it in isolation.
 */
function normalizeRequestBody(bodyText: string): string {
	if (bodyText) {
		try {
			const parsed = JSON.parse(bodyText);
			// If body doesn't have 'json' key, wrap it
			if (parsed && typeof parsed === "object" && !("json" in parsed)) {
				return JSON.stringify({ json: parsed });
			}
			return bodyText;
		} catch {
			// Invalid JSON, return as-is (handler will deal with it)
			return bodyText;
		}
	}
	// Empty body - wrap as empty object
	return JSON.stringify({ json: {} });
}

describe("ORPC Request Body Normalizer", () => {
	describe("normal JSON body", () => {
		it("passes through already-wrapped body unchanged", () => {
			const input = JSON.stringify({ json: { input: { name: "test" } } });
			const result = normalizeRequestBody(input);
			expect(result).toBe(input);
		});

		it("passes through body with meta and json unchanged", () => {
			const input = JSON.stringify({
				json: { input: { id: "123" } },
				meta: { correlationId: "abc" },
			});
			const result = normalizeRequestBody(input);
			expect(result).toBe(input);
		});

		it("handles nested input structure", () => {
			const input = JSON.stringify({
				json: {
					input: {
						where: { id: "abc-123" },
						select: { name: true, email: true },
					},
				},
			});
			const result = normalizeRequestBody(input);
			expect(result).toBe(input);
		});
	});

	describe("unwrapped JSON body", () => {
		it("wraps simple object in json key", () => {
			const input = JSON.stringify({ input: { name: "test" } });
			const result = normalizeRequestBody(input);
			expect(result).toBe(
				JSON.stringify({ json: { input: { name: "test" } } }),
			);
		});

		it("wraps object with nested structure", () => {
			const input = JSON.stringify({
				where: { organisation_id: "org-123" },
				select: { id: true, name: true },
			});
			const result = normalizeRequestBody(input);
			const parsed = JSON.parse(result);
			expect(parsed).toEqual({
				json: {
					where: { organisation_id: "org-123" },
					select: { id: true, name: true },
				},
			});
		});

		it("wraps empty object", () => {
			const input = JSON.stringify({});
			const result = normalizeRequestBody(input);
			expect(result).toBe(JSON.stringify({ json: {} }));
		});
	});

	describe("empty body handling", () => {
		it("wraps empty string as empty json object", () => {
			const result = normalizeRequestBody("");
			expect(result).toBe(JSON.stringify({ json: {} }));
		});
	});

	describe("invalid JSON handling", () => {
		it("returns invalid JSON as-is for handler to deal with", () => {
			const invalidJson = "not valid json {{{";
			const result = normalizeRequestBody(invalidJson);
			expect(result).toBe(invalidJson);
		});

		it("returns truncated JSON as-is", () => {
			const truncated = '{"input": {"name": "test"';
			const result = normalizeRequestBody(truncated);
			expect(result).toBe(truncated);
		});
	});

	describe("edge cases", () => {
		it("handles null as valid JSON (not wrapped)", () => {
			const input = "null";
			const result = normalizeRequestBody(input);
			expect(result).toBe("null");
		});

		it("handles array (not wrapped - arrays dont have json key)", () => {
			const input = JSON.stringify([1, 2, 3]);
			const result = normalizeRequestBody(input);
			expect(result).toBe(JSON.stringify({ json: [1, 2, 3] }));
		});

		it("handles string primitive (returns as-is)", () => {
			const input = '"just a string"';
			const result = normalizeRequestBody(input);
			expect(result).toBe(input);
		});

		it("handles number primitive (returns as-is)", () => {
			const input = "42";
			const result = normalizeRequestBody(input);
			expect(result).toBe(input);
		});
	});
});
