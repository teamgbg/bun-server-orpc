// @system codegen
// @status generated
// @edit change the suite in the owned-suites band, then re-run codegen. Hand-edits are overwritten.
//
// This suite's assertions are OWNED by the codegen band: the band module
// carries them verbatim, this file is the emission, and hand edits here are
// overwritten on the next run. The rationale each assertion carries moved
// with it into the band.

import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";

const { createPresenceGate } = await import("./presence");

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

describe("createPresenceGate", () => {
	beforeAll(() => GlobalRegistrator.register());
	afterAll(() => GlobalRegistrator.unregister());

	const setVisible = (visible: boolean): void => {
		Object.defineProperty(document, "visibilityState", {
			configurable: true,
			get: () => (visible ? "visible" : "hidden"),
		});
	};
	const fireVisibility = (): void =>
		document.dispatchEvent(new Event("visibilitychange"));

	test("does not fire onAway within the grace; a quick return cancels it", async () => {
		setVisible(true);
		const onAway = mock(() => {});
		const onActive = mock(() => {});
		const gate = createPresenceGate({ idleGraceMs: 30, onAway, onActive });
		expect(gate.isAway).toBe(false);

		setVisible(false);
		fireVisibility();
		await wait(15); // mid-grace
		setVisible(true);
		fireVisibility(); // return cancels the pending away
		await wait(50);

		expect(onAway).toHaveBeenCalledTimes(0);
		expect(onActive).toHaveBeenCalledTimes(0); // never went away
		gate.dispose();
	});

	test("fires onAway after the grace, then onActive on return", async () => {
		setVisible(true);
		const onAway = mock(() => {});
		const onActive = mock(() => {});
		const gate = createPresenceGate({ idleGraceMs: 30, onAway, onActive });

		setVisible(false);
		fireVisibility();
		await wait(50); // past grace
		expect(onAway).toHaveBeenCalledTimes(1);
		expect(gate.isAway).toBe(true);

		setVisible(true);
		fireVisibility();
		expect(onActive).toHaveBeenCalledTimes(1);
		expect(gate.isAway).toBe(false);
		gate.dispose();
	});

	test("onActive is not re-fired while already active (no spurious reconnect)", async () => {
		setVisible(true);
		const onActive = mock(() => {});
		const gate = createPresenceGate({ idleGraceMs: 30, onAway: () => {}, onActive });
		fireVisibility(); // visible event while active
		fireVisibility();
		expect(onActive).toHaveBeenCalledTimes(0);
		gate.dispose();
	});

	test("dispose mid-grace stops onAway firing and detaches listeners", async () => {
		setVisible(true);
		const onAway = mock(() => {});
		const onActive = mock(() => {});
		const gate = createPresenceGate({ idleGraceMs: 30, onAway, onActive });

		setVisible(false);
		fireVisibility();
		gate.dispose(); // mid-grace
		await wait(50);
		expect(onAway).toHaveBeenCalledTimes(0);

		// A return after dispose must not fire onActive — listeners removed.
		setVisible(true);
		fireVisibility();
		expect(onActive).toHaveBeenCalledTimes(0);
	});

	test("arms the grace when created while already hidden", async () => {
		setVisible(false);
		const onAway = mock(() => {});
		const gate = createPresenceGate({ idleGraceMs: 30, onAway, onActive: () => {} });
		await wait(50); // no event needed — armed at creation
		expect(onAway).toHaveBeenCalledTimes(1);
		gate.dispose();
		setVisible(true); // restore for subsequent tests
	});
});
