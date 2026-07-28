// @vitest-environment jsdom
// =============================================================================
// studentAuth.test.ts — shared-device auth primitives (S1, ruling 2.4A)
// -----------------------------------------------------------------------------
// The two behaviors that matter on a shared Chromebook: sign-out purges every
// viewer-namespaced key (and ONLY those) even when the network signOut fails,
// and the idle watcher fires after a quiet stretch but not while active.
// =============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const signOutMock = vi.fn();
vi.mock('../lib/supabase', () => ({
    supabase: { auth: { signOut: (...args: unknown[]) => signOutMock(...args) } },
}));

import {
    signOutEverything,
    watchIdle,
    VIEWER_STORAGE_PREFIX,
} from '../lib/studentAuth';

describe('signOutEverything', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        signOutMock.mockReset().mockResolvedValue({ error: null });
    });

    it('purges viewer-namespaced keys from both storages, leaves others', async () => {
        localStorage.setItem(`${VIEWER_STORAGE_PREFIX}buffer:abc`, 'work');
        localStorage.setItem(`${VIEWER_STORAGE_PREFIX}last-activity`, 'xyz');
        localStorage.setItem('theme', 'dark'); // app preference — NOT purged
        sessionStorage.setItem(`${VIEWER_STORAGE_PREFIX}tab-lock`, '1');
        sessionStorage.setItem('unrelated', 'stays');

        await signOutEverything();

        expect(localStorage.getItem(`${VIEWER_STORAGE_PREFIX}buffer:abc`)).toBeNull();
        expect(localStorage.getItem(`${VIEWER_STORAGE_PREFIX}last-activity`)).toBeNull();
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(sessionStorage.getItem(`${VIEWER_STORAGE_PREFIX}tab-lock`)).toBeNull();
        expect(sessionStorage.getItem('unrelated')).toBe('stays');
        expect(signOutMock).toHaveBeenCalledOnce();
    });

    it('purges storage BEFORE a failing signOut throws', async () => {
        localStorage.setItem(`${VIEWER_STORAGE_PREFIX}buffer:abc`, 'work');
        signOutMock.mockResolvedValue({ error: { message: 'network down' } });

        await expect(signOutEverything()).rejects.toThrow('network down');
        // The next student must not see this even though signOut failed.
        expect(localStorage.getItem(`${VIEWER_STORAGE_PREFIX}buffer:abc`)).toBeNull();
    });
});

describe('watchIdle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('fires after the quiet stretch', () => {
        const onIdle = vi.fn();
        const watcher = watchIdle(onIdle, 1000);
        vi.advanceTimersByTime(999);
        expect(onIdle).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(onIdle).toHaveBeenCalledOnce();
        watcher.stop();
    });

    it('activity resets the clock', () => {
        const onIdle = vi.fn();
        const watcher = watchIdle(onIdle, 1000);
        vi.advanceTimersByTime(900);
        window.dispatchEvent(new Event('pointermove'));
        vi.advanceTimersByTime(900);
        expect(onIdle).not.toHaveBeenCalled();
        vi.advanceTimersByTime(100);
        expect(onIdle).toHaveBeenCalledOnce();
        watcher.stop();
    });

    it('re-arms after firing (re-idle re-prompts)', () => {
        const onIdle = vi.fn();
        const watcher = watchIdle(onIdle, 1000);
        vi.advanceTimersByTime(2000);
        expect(onIdle).toHaveBeenCalledTimes(2);
        watcher.stop();
    });

    it('stop() detaches everything', () => {
        const onIdle = vi.fn();
        const watcher = watchIdle(onIdle, 1000);
        watcher.stop();
        window.dispatchEvent(new Event('pointermove'));
        vi.advanceTimersByTime(5000);
        expect(onIdle).not.toHaveBeenCalled();
    });
});
