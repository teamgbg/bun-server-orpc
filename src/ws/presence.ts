/**
 * @system runtime-orpc-ws
 * @status handwritten
 * @edit edit directly
 *
 * Browser presence gate: fires `onAway` when the tab has been hidden (or its
 * window unfocused) past a grace period, and `onActive` when it is viewed
 * again. A reusable primitive so every ORPC-over-WS streaming UI can bind its
 * connection lifecycle to presence — the caller decides what to do on each
 * transition (typically dispose the WS on away, reconnect on active).
 *
 * WHY THIS EXISTS. The ORPC WS server sends a keepalive PING every
 * `pingIntervalMs` so a quiet event stream isn't starved into an idle close.
 * That ping is also perpetual wire traffic, which defeats `scale-to-zero`:
 * its idle model counts traffic in EITHER direction, so a streaming UI parked
 * in a background tab keeps its app awake 24/7 (incident: scala-agents-ui
 * online 16h with zero sleeps, 901 `/api/rpc/ws` hits from parked tabs that no
 * human was viewing — the keepalive alone re-armed the 45s idle timer forever).
 *
 * This is the seam `the-severe-bugs-live-at-seams` names: two primitives each
 * correct in isolation (the ping prevents silent proxy idle-drops; the
 * activator sleeps on silence) disagreeing at the boundary. It is closed here,
 * at the connection's owner: an UNWATCHED tab drops its connection so no ping
 * flows and the app sleeps; refocusing reconnects. The keepalive is unchanged
 * and stays correct for genuinely active connections.
 *
 * Presence = tab visibility + window focus. `visibilitychange` covers
 * tab-switch and minimise; `blur`/`focus` covers a walk-away where the page
 * stays "visible" but the window lost focus (alt-tab to another app). The
 * away transition is DEFERRED by the grace: a hide-then-show within the grace
 * cancels it entirely, so ordinary tab flips while working never tear the
 * connection down.
 */

export interface PresenceGateOptions {
	/** Hide/unfocus grace in ms before `onAway` fires. Default 60_000. */
	idleGraceMs?: number;
	/** Fired once when the tab has been hidden/unfocused past the grace. */
	onAway: () => void;
	/** Fired once when the tab is viewed again after an away transition. */
	onActive: () => void;
}

export interface PresenceGate {
	/** True while in the away state (`onAway` fired, `onActive` has not). */
	readonly isAway: boolean;
	/** Remove all listeners and clear any pending grace timer. Idempotent. */
	dispose: () => void;
}

const DEFAULT_IDLE_GRACE_MS = 60_000;

/**
 * Create a browser presence gate. Adds listeners to `document` and `window`;
 * call `dispose()` when the owning subscription ends so no listener or timer
 * survives (`no-uncontrolled-repetition-or-cascade`). Safe to call only in a
 * browser context — the caller (a React effect / page-client hook) guarantees
 * `document` and `window` exist.
 */
export function createPresenceGate(options: PresenceGateOptions): PresenceGate {
	const grace = options.idleGraceMs ?? DEFAULT_IDLE_GRACE_MS;
	let away = false;
	let disposed = false;
	let graceTimer: ReturnType<typeof setTimeout> | null = null;

	const clearGrace = (): void => {
		if (graceTimer !== null) {
			clearTimeout(graceTimer);
			graceTimer = null;
		}
	};

	const fireAway = (): void => {
		graceTimer = null;
		if (disposed || away) return;
		away = true;
		options.onAway();
	};

	const goActive = (): void => {
		if (disposed) return;
		clearGrace();
		if (!away) return; // never went away — nothing to signal
		away = false;
		options.onActive();
	};

	const potentiallyAway = (): boolean => {
		if (document.visibilityState !== "visible") return true;
		try {
			return !document.hasFocus();
		} catch {
			// hasFocus() can throw in some embedded contexts; treat as present.
			return false;
		}
	};

	const onPresenceChange = (): void => {
		if (potentiallyAway()) {
			// Defer: a return to visible within the grace cancels the away.
			if (graceTimer === null && !away) {
				graceTimer = setTimeout(fireAway, grace);
			}
		} else {
			goActive();
		}
	};

	document.addEventListener("visibilitychange", onPresenceChange);
	window.addEventListener("blur", onPresenceChange);
	window.addEventListener("focus", onPresenceChange);

	// Arm the grace if created while already hidden/unfocused (e.g. mounted in
	// a background tab) — otherwise the first away only registers on the next
	// state change.
	if (potentiallyAway()) {
		graceTimer = setTimeout(fireAway, grace);
	}

	return {
		get isAway() {
			return away;
		},
		dispose: () => {
			if (disposed) return;
			disposed = true;
			clearGrace();
			document.removeEventListener("visibilitychange", onPresenceChange);
			window.removeEventListener("blur", onPresenceChange);
			window.removeEventListener("focus", onPresenceChange);
		},
	};
}
