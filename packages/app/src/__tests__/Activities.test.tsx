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

// =============================================================================
// Tag filter (taxonomy R6) — the P1 caller for the tags column
// -----------------------------------------------------------------------------
// The tags column and its reader ship together on purpose: a write-only column
// is the meta.skills pattern (a field that round-trips everywhere and is read
// by nothing), which is exactly what the taxonomy review existed to end.
// =============================================================================

const TAGGED_ROWS = [
    {
        id: 't1',
        title: 'Factoring Practice',
        status: 'draft',
        updated_at: '2026-07-10T00:00:00Z',
        tags: ['factoring', 'word problems'],
    },
    {
        id: 't2',
        title: 'Graphing Lines',
        status: 'published',
        updated_at: '2026-07-09T00:00:00Z',
        tags: ['graphing'],
    },
    {
        id: 't3',
        title: 'Untagged Sheet',
        status: 'draft',
        updated_at: '2026-07-08T00:00:00Z',
        tags: null,
    },
];

describe('Activities tag filter', () => {
    beforeEach(() => {
        h.listResult.current = { data: TAGGED_ROWS, error: null };
    });

    it('renders one chip per tag in use, deduped and sorted', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Factoring Practice' });
        const chips = screen
            .getAllByRole('button', { pressed: false })
            .map((b) => b.textContent);
        expect(chips).toEqual(['factoring', 'graphing', 'word problems']);
    });

    it('filters the list to activities carrying the picked tag', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Factoring Practice' });

        fireEvent.click(screen.getByRole('button', { name: 'graphing' }));

        expect(screen.getByRole('link', { name: 'Graphing Lines' })).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Factoring Practice' })).toBeNull();
        expect(screen.queryByRole('link', { name: 'Untagged Sheet' })).toBeNull();
    });

    it('ANDs multiple tags — each chip narrows', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Factoring Practice' });

        fireEvent.click(screen.getByRole('button', { name: 'factoring' }));
        expect(screen.getByRole('link', { name: 'Factoring Practice' })).toBeTruthy();

        // Adding a tag the row does NOT carry empties the list, rather than
        // widening it the way an OR would.
        fireEvent.click(screen.getByRole('button', { name: 'graphing' }));
        expect(screen.queryByRole('link', { name: 'Factoring Practice' })).toBeNull();
    });

    it('marks an active chip pressed, and toggles it back off', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Factoring Practice' });

        const chip = screen.getByRole('button', { name: 'graphing' });
        fireEvent.click(chip);
        expect(chip.getAttribute('aria-pressed')).toBe('true');

        fireEvent.click(chip);
        expect(chip.getAttribute('aria-pressed')).toBe('false');
        expect(screen.getByRole('link', { name: 'Factoring Practice' })).toBeTruthy();
    });

    // Filtered-to-nothing is a DIFFERENT state from an empty library, and it
    // must offer a way back out rather than looking like a broken page.
    it('shows a filtered-to-nothing message with a way to clear', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Factoring Practice' });

        fireEvent.click(screen.getByRole('button', { name: 'factoring' }));
        fireEvent.click(screen.getByRole('button', { name: 'graphing' }));

        expect(screen.getByText(/No activities match/)).toBeTruthy();
        expect(screen.queryByText(/No activities yet/)).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Clear the filter' }));
        expect(screen.getByRole('link', { name: 'Factoring Practice' })).toBeTruthy();
    });

    it('Clear resets every active chip at once', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Factoring Practice' });

        fireEvent.click(screen.getByRole('button', { name: 'factoring' }));
        fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

        expect(screen.getByRole('link', { name: 'Untagged Sheet' })).toBeTruthy();
    });

    it('renders no filter chrome at all when nothing is tagged', async () => {
        h.listResult.current = {
            data: [{ ...TAGGED_ROWS[2] }],
            error: null,
        };
        renderList();
        await screen.findByRole('link', { name: 'Untagged Sheet' });
        expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
        expect(screen.queryByRole('button', { pressed: false })).toBeNull();
    });
});
