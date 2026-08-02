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
import { installStaleChunkRecovery } from '../lib/swRegistration';

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
