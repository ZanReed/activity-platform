// @vitest-environment jsdom
// =============================================================================
// useAutosave.test.ts — save status, retry and the conflict stop (UI review G-8)
// -----------------------------------------------------------------------------
// A failed save used to wait for the teacher's next keystroke. Now it retries
// on a back-off and when the browser comes back online. A save that finds the
// row changed under the tab (SaveConflictError) stops autosaving until the
// teacher chooses: reload, or overwrite() with this tab's version.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { PermanentSaveError, RETRY_DELAYS_MS, SaveConflictError, useAutosave } from '../lib/useAutosave';
import { rowWritesSettled, trackRowWrite } from '../lib/pendingRowWrites';

beforeEach(() => {
    vi.useFakeTimers();
});
afterEach(() => {
    vi.useRealTimers();
});

async function settle() {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

function setup(save: (opts?: { force?: boolean }) => Promise<void>) {
    const hook = renderHook(({ k }) => useAutosave(k, save, 1000), { initialProps: { k: 'k0' as string | null } });
    // k0 is the loaded baseline; k1 is an edit.
    hook.rerender({ k: 'k1' });
    return hook;
}

describe('useAutosave (G-8)', () => {
    it('a failed save retries on the back-off, then says Saved', async () => {
        const save = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
        const { result } = setup(save);
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        await settle();
        expect(result.current.status).toBe('error');
        expect(save).toHaveBeenCalledTimes(1);
        await act(async () => {
            vi.advanceTimersByTime(RETRY_DELAYS_MS[0]);
        });
        await settle();
        expect(save).toHaveBeenCalledTimes(2);
        expect(result.current.status).toBe('saved');
    });

    it('coming back online retries at once', async () => {
        const save = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
        const { result } = setup(save);
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        await settle();
        expect(result.current.status).toBe('error');
        await act(async () => {
            window.dispatchEvent(new Event('online'));
        });
        await settle();
        expect(save).toHaveBeenCalledTimes(2);
        expect(result.current.status).toBe('saved');
    });

    it('a conflict stops saving — no retries, flush reports not saved — until overwrite()', async () => {
        const save = vi.fn().mockRejectedValueOnce(new SaveConflictError()).mockResolvedValue(undefined);
        const { result, rerender } = setup(save);
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        await settle();
        expect(result.current.status).toBe('conflict');
        // Neither the back-off nor another edit saves over the other tab.
        rerender({ k: 'k2' });
        await act(async () => {
            vi.advanceTimersByTime(60_000);
        });
        await settle();
        expect(save).toHaveBeenCalledTimes(1);
        let flushed: boolean | undefined;
        await act(async () => {
            flushed = await result.current.flush();
        });
        expect(flushed).toBe(false);

        await act(async () => {
            result.current.overwrite();
        });
        await settle();
        expect(save).toHaveBeenCalledTimes(2);
        expect(save).toHaveBeenLastCalledWith({ force: true });
        expect(result.current.status).toBe('saved');
    });

    it('a permanent error is not retried, and says why', async () => {
        const save = vi.fn().mockRejectedValue(new PermanentSaveError('Document failed validation; not saved.'));
        const { result } = setup(save);
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        await settle();
        expect(result.current.status).toBe('error');
        expect(result.current.permanentError).toBe('Document failed validation; not saved.');
        await act(async () => {
            vi.advanceTimersByTime(120_000);
        });
        await settle();
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('an overwrite that fails on the network retries AS an overwrite', async () => {
        const save = vi
            .fn()
            .mockRejectedValueOnce(new SaveConflictError())
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValue(undefined);
        const { result, rerender } = setup(save);
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        await settle();
        await act(async () => {
            result.current.overwrite();
        });
        await settle();
        await act(async () => {
            vi.advanceTimersByTime(RETRY_DELAYS_MS[0]);
        });
        await settle();
        expect(save).toHaveBeenCalledTimes(3);
        expect(save).toHaveBeenLastCalledWith({ force: true });
        expect(result.current.status).toBe('saved');
        // Once it lands, saving is checked again: the next edit is not forced.
        rerender({ k: 'k9' });
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });
        await settle();
        expect(save).toHaveBeenCalledTimes(4);
        expect(save).toHaveBeenLastCalledWith(undefined);
    });
});

describe('pendingRowWrites (G-8: print view, then back to the editor)', () => {
    it('waits for a registered write to the same activity, and not for others', async () => {
        vi.useRealTimers();
        let finish!: () => void;
        const write = new Promise<void>((r) => (finish = r));
        trackRowWrite('a1', write);
        let waited = false;
        const wait = rowWritesSettled('a1').then(() => (waited = true));
        await rowWritesSettled('other');
        await Promise.resolve();
        expect(waited).toBe(false);
        finish();
        await wait;
        expect(waited).toBe(true);
    });
});
