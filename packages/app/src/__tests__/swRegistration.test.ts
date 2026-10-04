// @vitest-environment jsdom
// =============================================================================
// swRegistration.test.ts — stale-chunk recovery (S6 V8)
// -----------------------------------------------------------------------------
// The bug this recovers from is not hypothetical and is not caused by the
// service worker: Cloudflare Pages replaces content-hashed assets on deploy, so
// a tab left open across a deploy asks for a filename that is now a 404 the
// first time the student opens something lazy — the calculator, a graph. What
// they see is a control that does nothing at all.
//
// The reload is the fix; the GUARD is the part worth testing, because a broken
// deploy that fails every load would otherwise put a student in a reload loop,
// which is meaningfully worse than one dead button.
// =============================================================================

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
    installStaleChunkRecovery,
    reloadOnceForStaleBuild,
    clearStaleBuildGuard,
} from '../lib/swRegistration';

function firePreloadError(): boolean {
    // Vite's real event is cancelable; preventDefault is how we stop it
    // rethrowing while the reload is in flight.
    const event = new Event('vite:preloadError', { cancelable: true });
    return window.dispatchEvent(event);
}

describe('stale-chunk recovery', () => {
    let installed: { stop: () => void } | null = null;

    /** One install per test, detached afterwards: listeners left on `window`
     * make an earlier test's guard swallow a later test's event. */
    function install(reload: () => void) {
        installed = installStaleChunkRecovery({ reload });
    }

    beforeEach(() => {
        sessionStorage.clear();
    });
    afterEach(() => {
        installed?.stop();
        installed = null;
    });

    it('reloads once when a chunk has vanished', () => {
        const reload = vi.fn();
        install(reload);

        const notCancelled = firePreloadError();

        expect(reload).toHaveBeenCalledTimes(1);
        // preventDefault called ⇒ dispatchEvent returns false.
        expect(notCancelled).toBe(false);
    });

    it('does NOT reload a second time — a broken deploy must not loop', () => {
        const reload = vi.fn();
        install(reload);

        firePreloadError();
        // The reload guard survives the reload itself, because sessionStorage
        // does. Simulating the second failure after the "reload" is the whole
        // point: this is the state a student would land in.
        firePreloadError();

        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('lets the error through once the guard is set, rather than swallowing it', () => {
        install(vi.fn());
        firePreloadError();

        // Second time: not cancelled, so Vite's own handling still happens and
        // the failure is at least visible instead of a silently dead page.
        expect(firePreloadError()).toBe(true);
    });

    it('a healthy load clears the guard, so a LATER deploy gets its own retry', () => {
        const reload = vi.fn();
        install(reload);

        firePreloadError();
        expect(reload).toHaveBeenCalledTimes(1);

        // The page loaded fine this time — that is the signal the previous
        // failure is behind us.
        window.dispatchEvent(new Event('load'));

        firePreloadError();
        expect(reload).toHaveBeenCalledTimes(2);
    });

    it('still reloads when sessionStorage is unavailable', () => {
        const reload = vi.fn();
        const original = Object.getOwnPropertyDescriptor(window, 'sessionStorage');
        Object.defineProperty(window, 'sessionStorage', {
            configurable: true,
            get() {
                throw new Error('blocked by policy');
            },
        });

        try {
            install(reload);
            firePreloadError();
            // Without a place to record the guard we lose loop protection, but
            // a locked-down profile must not lose the recovery itself.
            expect(reload).toHaveBeenCalledTimes(1);
        } finally {
            if (original) Object.defineProperty(window, 'sessionStorage', original);
        }
    });
});

// =============================================================================
// Stale-BUILD recovery — the sibling of the chunk case (2026-08-22)
// -----------------------------------------------------------------------------
// Found on a real teacher. index.html is the one PRECACHED file, so a load
// served from that precache after a deploy runs an entirely old, self-consistent
// build. If the deploy added a block type, that build's schema rejects a
// document whose stored bytes are perfectly valid, and the editor said
// "malformed" — which reads as "your content is corrupt" rather than "reload".
//
// The reload is the fix; as with the chunk case, the GUARD is the part worth
// testing. This trigger is more dangerous than that one: it fires during page
// LOAD, so an unguarded reload is an infinite loop rather than one wasted fetch.
// =============================================================================

describe('stale-build recovery', () => {
    beforeEach(() => {
        window.sessionStorage.clear();
    });

    it('reloads once when a stored document will not parse', () => {
        const reload = vi.fn();
        expect(reloadOnceForStaleBuild({ reload })).toBe(true);
        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('does NOT reload a second time — a genuinely bad document must not loop', () => {
        const reload = vi.fn();
        reloadOnceForStaleBuild({ reload });
        expect(reloadOnceForStaleBuild({ reload })).toBe(false);
        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('returns false the second time, so the caller shows its real error', () => {
        // The contract the route depends on: true means "a reload is in flight,
        // render nothing"; false means "this document really is broken, say so".
        reloadOnceForStaleBuild({ reload: vi.fn() });
        expect(reloadOnceForStaleBuild({ reload: vi.fn() })).toBe(false);
    });

    it('a parsed document clears the guard, so a LATER deploy gets its own retry', () => {
        const reload = vi.fn();
        reloadOnceForStaleBuild({ reload });
        clearStaleBuildGuard();
        expect(reloadOnceForStaleBuild({ reload })).toBe(true);
        expect(reload).toHaveBeenCalledTimes(2);
    });

    it('REFUSES without sessionStorage — deliberately unlike the chunk case', () => {
        // The chunk recovery reloads anyway, because its trigger is a student
        // opening something lazy and the cost of being wrong is one load. This
        // trigger fires on every page load, so no guard means no escape: the
        // teacher would never even reach the error message.
        const original = Object.getOwnPropertyDescriptor(window, 'sessionStorage');
        Object.defineProperty(window, 'sessionStorage', {
            configurable: true,
            get() {
                throw new Error('blocked');
            },
        });
        const reload = vi.fn();
        try {
            expect(reloadOnceForStaleBuild({ reload })).toBe(false);
            expect(reload).not.toHaveBeenCalled();
        } finally {
            if (original) Object.defineProperty(window, 'sessionStorage', original);
        }
    });

    it('uses its OWN guard key — the two recoveries must not swallow each other', () => {
        // Sharing a key would mean a chunk reload spends the build retry (and
        // vice versa), so whichever failure came first would mask the other.
        const reload = vi.fn();
        reloadOnceForStaleBuild({ reload });
        const keys = Object.keys(window.sessionStorage);
        expect(keys).toContain('activity-viewer:reloaded-for-stale-build');
        expect(keys).not.toContain('activity-viewer:reloaded-for-stale-chunk');
    });
});

// =============================================================================
// Job 4 — a new build arriving under an open tab (2026-10-04)
// =============================================================================

import {
    handleUpdateArrival,
    isUpdateReady,
    onUpdateReady,
    resetUpdateReadyForTests,
    scheduleUpdateChecks,
    trackInteraction,
    UPDATE_CHECK_INTERVAL_MS,
} from '../lib/swRegistration';

describe('a newer build arrives', () => {
    beforeEach(() => resetUpdateReadyForTests());

    it('reloads when the user has not touched the page yet', () => {
        const reload = vi.fn();
        expect(handleUpdateArrival({ interacted: () => false, reload })).toBe('reloaded');
        expect(reload).toHaveBeenCalledTimes(1);
        expect(isUpdateReady()).toBe(false);
    });

    it('NEVER reloads once the user has started working: it announces instead', () => {
        const reload = vi.fn();
        const heard = vi.fn();
        const stop = onUpdateReady(heard);
        expect(handleUpdateArrival({ interacted: () => true, reload })).toBe('announced');
        expect(reload).not.toHaveBeenCalled();
        expect(heard).toHaveBeenCalledTimes(1);
        expect(isUpdateReady()).toBe(true);
        stop();
    });

    it('a key press or a pointer press counts as started; nothing else does', () => {
        const t = trackInteraction();
        expect(t.interacted()).toBe(false);
        window.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('pointermove'));
        expect(t.interacted()).toBe(false);
        window.dispatchEvent(new Event('keydown'));
        expect(t.interacted()).toBe(true);
        t.stop();

        const p = trackInteraction();
        window.dispatchEvent(new Event('pointerdown'));
        expect(p.interacted()).toBe(true);
        p.stop();
    });
});

describe('looking for a newer build while the tab is open', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('checks every 15 minutes', async () => {
        const update = vi.fn(async () => {});
        const checks = scheduleUpdateChecks({ update } as never);
        expect(UPDATE_CHECK_INTERVAL_MS).toBe(15 * 60 * 1000);
        await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS - 1);
        expect(update).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);
        expect(update).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS);
        expect(update).toHaveBeenCalledTimes(2);
        checks.stop();
        await vi.advanceTimersByTimeAsync(UPDATE_CHECK_INTERVAL_MS);
        expect(update).toHaveBeenCalledTimes(2);
    });

    it('checks when the tab becomes visible, and survives a failed check', async () => {
        const update = vi.fn(async () => {
            throw new Error('offline');
        });
        const checks = scheduleUpdateChecks({ update } as never);
        document.dispatchEvent(new Event('visibilitychange')); // jsdom: visible
        await vi.advanceTimersByTimeAsync(0);
        expect(update).toHaveBeenCalledTimes(1);
        checks.stop();
        document.dispatchEvent(new Event('visibilitychange'));
        await vi.advanceTimersByTimeAsync(0);
        expect(update).toHaveBeenCalledTimes(1);
    });
});
