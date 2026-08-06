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
    watchIdleSignOut,
} from '../lib/studentAuth';
// The prefix comes from its OWNER (S6-V1); studentAuth's redundant re-export
// was deleted (A17).
import {
    VIEWER_SHELL_CACHE,
    VIEWER_STORAGE_PREFIX,
    viewerContentCacheName,
} from '@activity/viewer';

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

describe('signOutEverything — the offline hole (ruling S6-6)', () => {
    /** Minimal CacheStorage stand-in; jsdom has none. */
    function installCaches(names: string[]) {
        const state = { names: [...names] };
        (globalThis as unknown as { caches: unknown }).caches = {
            keys: async () => [...state.names],
            delete: async (n: string) => {
                state.names = state.names.filter((x) => x !== n);
                return true;
            },
        };
        return state;
    }

    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        signOutMock.mockReset().mockResolvedValue({ error: null });
        delete (globalThis as unknown as { caches?: unknown }).caches;
    });

    it('falls back to a LOCAL sign-out when the network call fails', async () => {
        signOutMock
            .mockResolvedValueOnce({ error: { message: 'network down' } })
            .mockResolvedValueOnce({ error: null });

        await expect(signOutEverything()).rejects.toThrow('network down');

        // Verified against the installed auth-js: the first call returns early
        // on a network failure WITHOUT clearing the stored session, so without
        // this second, local-scope call the next student inherits a live
        // session belonging to someone who believes they signed out.
        expect(signOutMock).toHaveBeenCalledTimes(2);
        expect(signOutMock.mock.calls[1]?.[0]).toEqual({ scope: 'local' });
    });

    it('does not make the local call when the network sign-out worked', async () => {
        await signOutEverything();
        expect(signOutMock).toHaveBeenCalledTimes(1);
    });

    it('purges every student’s cached documents but keeps the app shell', async () => {
        const caches = installCaches([
            viewerContentCacheName('student-a'),
            viewerContentCacheName('student-b'),
            VIEWER_SHELL_CACHE,
        ]);

        await signOutEverything();

        expect(caches.names).toEqual([VIEWER_SHELL_CACHE]);
    });

    it('still ends the session when there is no CacheStorage at all', async () => {
        await expect(signOutEverything()).resolves.toBeUndefined();
        expect(signOutMock).toHaveBeenCalledTimes(1);
    });
});

describe('watchIdleSignOut (ruling S6-6)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('prompts after the quiet stretch, then signs out if nobody answers', () => {
        const onPrompt = vi.fn();
        const onEscalate = vi.fn();
        const watcher = watchIdleSignOut({
            onPrompt,
            onEscalate,
            idleMs: 1000,
            graceMs: 500,
        });

        vi.advanceTimersByTime(1000);
        expect(onPrompt).toHaveBeenCalledOnce();
        expect(onEscalate).not.toHaveBeenCalled();

        // The prompt assumes someone is there to read it. On a shared cart at
        // the end of a period, nobody is.
        vi.advanceTimersByTime(500);
        expect(onEscalate).toHaveBeenCalledOnce();
        watcher.stop();
    });

    it('a student who comes back mid-grace is NOT signed out', () => {
        const onEscalate = vi.fn();
        const onDismiss = vi.fn();
        const watcher = watchIdleSignOut({
            onPrompt: vi.fn(),
            onEscalate,
            onDismiss,
            idleMs: 1000,
            graceMs: 500,
        });

        vi.advanceTimersByTime(1000); // prompted
        vi.advanceTimersByTime(300);
        window.dispatchEvent(new Event('keydown')); // they came back
        expect(onDismiss).toHaveBeenCalledOnce();

        vi.advanceTimersByTime(500); // the old grace window would have fired here
        expect(onEscalate).not.toHaveBeenCalled();
        watcher.stop();
    });

    it('re-prompts after another quiet stretch', () => {
        const onPrompt = vi.fn();
        const watcher = watchIdleSignOut({
            onPrompt,
            onEscalate: vi.fn(),
            idleMs: 1000,
            graceMs: 5000,
        });

        vi.advanceTimersByTime(1000);
        window.dispatchEvent(new Event('keydown'));
        vi.advanceTimersByTime(1000);
        expect(onPrompt).toHaveBeenCalledTimes(2);
        watcher.stop();
    });

    it('stop() prevents a pending escalation from firing', () => {
        const onEscalate = vi.fn();
        const watcher = watchIdleSignOut({
            onPrompt: vi.fn(),
            onEscalate,
            idleMs: 1000,
            graceMs: 500,
        });

        vi.advanceTimersByTime(1000);
        watcher.stop(); // the student navigated away
        vi.advanceTimersByTime(5000);
        expect(onEscalate).not.toHaveBeenCalled();
    });
});
