// @vitest-environment jsdom
// =============================================================================
// Activities.test.tsx — delete-with-undo flow (design-review, 2026-07-18)
// -----------------------------------------------------------------------------
// The activity list deletes optimistically: the row soft-deletes and leaves
// the list immediately, and a toast offers a brief Undo (restore_activity).
// These tests pin that behavior — delete removes + toasts, Undo restores,
// a failed restore keeps the row deleted, and the toast self-dismisses after
// its window. First component test in the suite to mock the Supabase client;
// the query-builder + rpc mocks live in vi.hoisted so the module factory can
// close over them.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';

const h = vi.hoisted(() => {
    // The list load: from('activities').select().is().order() → this result.
    const listResult: { current: { data: unknown; error: unknown } } = {
        current: { data: [], error: null },
    };
    const from = vi.fn(() => {
        const qb: Record<string, unknown> = {
            select: () => qb,
            is: () => qb,
            order: () => Promise.resolve(listResult.current),
        };
        return qb;
    });
    const rpc = vi.fn(
        (): Promise<{ error: { message: string } | null }> =>
            Promise.resolve({ error: null }),
    );
    return { listResult, from, rpc };
});

vi.mock('../lib/supabase', () => ({
    supabase: { from: h.from, rpc: h.rpc },
}));
vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({
        session: { user: { id: 'owner-1' } },
        loading: false,
    }),
}));

import Activities from '../routes/Activities';

const ROWS = [
    { id: 'a1', title: 'Warm Up', status: 'draft', updated_at: '2026-07-10T00:00:00Z' },
    { id: 'a2', title: 'Review', status: 'published', updated_at: '2026-07-09T00:00:00Z' },
];

function renderList() {
    return render(
        <MemoryRouter>
            <Activities />
        </MemoryRouter>,
    );
}

beforeEach(() => {
    h.listResult.current = { data: ROWS, error: null };
    h.rpc.mockClear();
    h.rpc.mockImplementation(() => Promise.resolve({ error: null }));
});
afterEach(cleanup);

describe('Activities delete-with-undo', () => {
    it('delete removes the row, calls soft_delete, and shows an Undo toast', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Warm Up' });

        fireEvent.click(screen.getByRole('button', { name: 'Delete Warm Up' }));

        // Row leaves the list; a toast appears offering Undo.
        await screen.findByRole('button', { name: 'Undo' });
        expect(screen.queryByRole('link', { name: 'Warm Up' })).toBeNull();
        expect(h.rpc).toHaveBeenCalledWith('soft_delete_activity', {
            p_activity_id: 'a1',
        });
        // The untouched row stays.
        expect(screen.getByRole('link', { name: 'Review' })).toBeTruthy();
    });

    it('Undo restores the row via restore_activity and clears the toast', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Warm Up' });
        fireEvent.click(screen.getByRole('button', { name: 'Delete Warm Up' }));
        await screen.findByRole('button', { name: 'Undo' });

        fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

        await screen.findByRole('link', { name: 'Warm Up' });
        expect(h.rpc).toHaveBeenCalledWith('restore_activity', {
            p_activity_id: 'a1',
        });
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('a failed restore keeps the row deleted and surfaces an error', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Warm Up' });
        fireEvent.click(screen.getByRole('button', { name: 'Delete Warm Up' }));
        await screen.findByRole('button', { name: 'Undo' });

        // restore_activity fails (e.g. migration not deployed yet).
        h.rpc.mockImplementationOnce(() =>
            Promise.resolve({ error: { message: 'not found' } }),
        );
        fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

        await screen.findByText(/is still deleted/);
        expect(screen.queryByRole('link', { name: 'Warm Up' })).toBeNull();
    });

    it('the toast self-dismisses after its window with no server call', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        try {
            renderList();
            await screen.findByRole('link', { name: 'Warm Up' });
            fireEvent.click(
                screen.getByRole('button', { name: 'Delete Warm Up' }),
            );
            await screen.findByRole('button', { name: 'Undo' });

            act(() => {
                vi.advanceTimersByTime(7100);
            });

            await waitFor(() =>
                expect(screen.queryByRole('status')).toBeNull(),
            );
            // Only the delete hit the server — no restore, no re-delete.
            expect(h.rpc).toHaveBeenCalledTimes(1);
            expect(h.rpc).toHaveBeenCalledWith('soft_delete_activity', {
                p_activity_id: 'a1',
            });
        } finally {
            vi.useRealTimers();
        }
    });

    it('a failed delete keeps the row and shows an error (no toast)', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Warm Up' });

        h.rpc.mockImplementationOnce(() =>
            Promise.resolve({ error: { message: 'boom' } }),
        );
        fireEvent.click(screen.getByRole('button', { name: 'Delete Warm Up' }));

        await screen.findByText(/Couldn't delete "Warm Up"/);
        expect(screen.getByRole('link', { name: 'Warm Up' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
    });
});
