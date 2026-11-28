// @vitest-environment jsdom
// =============================================================================
// UpdateNotice.test.tsx — the notice says what is true (2026-11-28)
// -----------------------------------------------------------------------------
// The notice used to say "This page has been updated" for a chunk that failed
// to load, which is just as often a dropped connection as a deploy. Bound to
// RENDERED output: each row raises the notice through the real path
// (swRegistration's chunk recovery, or a newer build arriving) and reads what a
// student would read. The button is the same in both cases; nothing reloads.
// =============================================================================

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import UpdateNotice from '../components/UpdateNotice';
import {
    handleUpdateArrival,
    installStaleChunkRecovery,
    resetUpdateReadyForTests,
} from '../lib/swRegistration';

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    resetUpdateReadyForTests();
});

function failAChunk() {
    const reload = vi.fn();
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    const recovery = installStaleChunkRecovery({ reload, inUse: () => true });
    act(() => {
        window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }));
        vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    recovery.stop();
    return reload;
}

describe('the refresh notice’s words', () => {
    it('a part that would not load does not claim the page was updated', () => {
        resetUpdateReadyForTests();
        render(<UpdateNotice />);
        const reload = failAChunk();
        const notice = screen.getByRole('status');
        expect(notice.textContent).toContain('Part of this page didn’t load.');
        expect(notice.textContent).not.toMatch(/updated/);
        expect(screen.getByRole('button', { name: 'Refresh now' })).toBeTruthy();
        expect(reload).not.toHaveBeenCalled();
    });

    it('a newer build says updated, and outranks a part that failed first', () => {
        resetUpdateReadyForTests();
        render(<UpdateNotice />);
        failAChunk();
        act(() => {
            handleUpdateArrival({ interacted: () => true, reload: vi.fn() });
        });
        expect(screen.getByRole('status').textContent).toContain('This page has been updated.');
    });

    it('a part failing AFTER an update keeps the update’s words (the deploy is the likely cause)', () => {
        resetUpdateReadyForTests();
        render(<UpdateNotice />);
        act(() => {
            handleUpdateArrival({ interacted: () => true, reload: vi.fn() });
        });
        failAChunk();
        expect(screen.getByRole('status').textContent).toContain('This page has been updated.');
    });

    it('“Later” on a failed part does not hide a real update that comes after it', () => {
        resetUpdateReadyForTests();
        render(<UpdateNotice />);
        failAChunk();
        fireEvent.click(screen.getByRole('button', { name: 'Later' }));
        expect(screen.queryByRole('status')).toBeNull();
        act(() => {
            handleUpdateArrival({ interacted: () => true, reload: vi.fn() });
        });
        expect(screen.getByRole('status').textContent).toContain('This page has been updated.');
        fireEvent.click(screen.getByRole('button', { name: 'Later' }));
        expect(screen.queryByRole('status')).toBeNull();
    });
});
