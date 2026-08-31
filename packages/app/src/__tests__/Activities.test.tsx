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
    within,
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

    it('renders one chip per tag in use, deduped and sorted, after the drafts chip', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Factoring Practice' });
        const chips = screen
            .getAllByRole('button', { pressed: false })
            .map((b) => b.textContent);
        // The drafts task-filter (D11) leads; the tag vocabulary follows.
        expect(chips).toEqual([
            'drafts',
            'factoring',
            'graphing',
            'word problems',
        ]);
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

    it('clear (in the count line) resets every active filter at once', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Factoring Practice' });

        fireEvent.click(screen.getByRole('button', { name: 'factoring' }));
        fireEvent.click(screen.getByRole('button', { name: 'drafts' }));
        fireEvent.click(screen.getByRole('button', { name: 'clear' }));

        expect(screen.getByRole('link', { name: 'Untagged Sheet' })).toBeTruthy();
        expect(
            screen.getByRole('button', { name: 'factoring' }).getAttribute('aria-pressed'),
        ).toBe('false');
    });

    it('renders no filter chrome at all when nothing is tagged and nothing is draft', async () => {
        h.listResult.current = {
            data: [{ ...TAGGED_ROWS[2], status: 'published' }],
            error: null,
        };
        renderList();
        await screen.findByRole('link', { name: 'Untagged Sheet' });
        expect(screen.queryByRole('button', { name: 'clear' })).toBeNull();
        expect(screen.queryByRole('button', { pressed: false })).toBeNull();
    });

    // The drafts chip is a task filter, so it appears on the strength of
    // drafts existing — independent of whether anything is tagged.
    it('shows the drafts chip when drafts exist but nothing is tagged', async () => {
        h.listResult.current = {
            data: [{ ...TAGGED_ROWS[2], status: 'draft' }],
            error: null,
        };
        renderList();
        await screen.findByRole('link', { name: 'Untagged Sheet' });
        expect(screen.getByRole('button', { name: 'drafts' })).toBeTruthy();
    });
});

// =============================================================================
// The curriculum outline (design review D3–D11)
// -----------------------------------------------------------------------------
// The list is the teacher's year: unit groups, natural-sorted, No-unit last;
// a recent strip for resume-work; search + drafts chip; empty groups hidden
// under filters. Row order inside a group stays recency.
// =============================================================================

const OUTLINE_ROWS = [
    {
        id: 'o1', title: 'Vertex Form Exit Ticket', status: 'published',
        updated_at: '2026-08-17T00:00:00Z', tags: ['vertex form'],
        pedagogical_role: 'lesson',
        course: 'Algebra II', unit: null,
        draft_course: null, draft_unit: 'Unit 2: Quadratics',
    },
    {
        id: 'o2', title: 'Factoring Trinomials', status: 'draft',
        updated_at: '2026-08-16T00:00:00Z', tags: ['factoring'],
        pedagogical_role: 'practice',
        course: 'Algebra II', unit: null,
        draft_course: null, draft_unit: 'Unit 2: Quadratics',
    },
    {
        id: 'o3', title: 'Radical Equations', status: 'published',
        updated_at: '2026-08-15T00:00:00Z', tags: [],
        pedagogical_role: null,
        course: 'Algebra II', unit: 'Unit 10: Radicals',
        draft_course: null, draft_unit: null,
    },
    {
        id: 'o4', title: 'Untitled activity', status: 'draft',
        updated_at: '2026-08-14T00:00:00Z', tags: null,
        pedagogical_role: null,
        course: 'Algebra II', unit: null,
        draft_course: null, draft_unit: null,
    },
];

describe('Activities curriculum outline', () => {
    beforeEach(() => {
        h.listResult.current = { data: OUTLINE_ROWS, error: null };
    });

    it('groups activities under natural-sorted unit headings, No unit last', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        const headings = screen
            .getAllByRole('heading', { level: 2 })
            .map((h2) => h2.textContent);
        // "Unit 2" before "Unit 10" is the natural-sort point (D5).
        expect(headings).toEqual([
            'Unit 2: Quadratics',
            'Unit 10: Radicals',
            'No unit',
        ]);
    });

    // The draft-first read: o1/o2 have unit ONLY in draft_unit (the column is
    // null because they are unpublished/edited). Grouping on the column alone
    // would file both under "No unit" — the bug this guards.
    it('groups by the DRAFT unit when the published column is still null', async () => {
        renderList();
        const quad = await screen.findByRole('heading', {
            name: 'Unit 2: Quadratics',
        });
        const section = quad.closest('section')!;
        // Each row carries a title link AND an Analytics link; the title is
        // the one whose href is the editor route.
        const titles = within(section)
            .getAllByRole('link')
            .filter((a) => !a.getAttribute('href')?.endsWith('/analytics'))
            .map((a) => a.textContent);
        expect(titles).toEqual(['Vertex Form Exit Ticket', 'Factoring Trinomials']);
    });

    it('counts activities and drafts in the group heading', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        const quad = screen
            .getByRole('heading', { name: 'Unit 2: Quadratics' })
            .closest('div')!;
        expect(quad.textContent).toContain('2 activities');
        expect(quad.textContent).toContain('1 draft');
    });

    it('does not name the course in headings when there is only one', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        expect(
            screen.queryByRole('heading', { name: /Algebra II/ }),
        ).toBeNull();
    });

    it('renders the recently-edited strip as a labelled nav, newest first', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        const nav = screen.getByRole('navigation', { name: 'Recently edited' });
        const titles = within(nav)
            .getAllByRole('link')
            .map((a) => a.getAttribute('aria-label'));
        expect(titles[0]).toBe('Vertex Form Exit Ticket — recently edited');
        expect(titles).toHaveLength(4);
    });

    it('filters by title substring, case-insensitively', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        fireEvent.change(screen.getByLabelText('Search activities'), {
            target: { value: 'radical' },
        });
        expect(screen.getByRole('link', { name: 'Radical Equations' })).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Factoring Trinomials' })).toBeNull();
    });

    // D6: a filtered view shows hits, not absences.
    it('hides unit groups that have no matches under a filter', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        fireEvent.change(screen.getByLabelText('Search activities'), {
            target: { value: 'radical' },
        });
        const headings = screen
            .getAllByRole('heading', { level: 2 })
            .map((h2) => h2.textContent);
        expect(headings).toEqual(['Unit 10: Radicals']);
    });

    // The strip is a shortcut back into work — a filter must never empty it.
    it('leaves the recent strip intact while a filter is active', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        fireEvent.change(screen.getByLabelText('Search activities'), {
            target: { value: 'radical' },
        });
        const nav = screen.getByRole('navigation', { name: 'Recently edited' });
        expect(within(nav).getAllByRole('link')).toHaveLength(4);
    });

    it('the drafts chip narrows to drafts and ANDs with search', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        fireEvent.click(screen.getByRole('button', { name: 'drafts' }));
        expect(screen.getByRole('link', { name: 'Factoring Trinomials' })).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Radical Equations' })).toBeNull();

        fireEvent.change(screen.getByLabelText('Search activities'), {
            target: { value: 'untitled' },
        });
        expect(screen.queryByRole('link', { name: 'Factoring Trinomials' })).toBeNull();
        expect(screen.getByRole('link', { name: 'Untitled activity' })).toBeTruthy();
    });

    it('announces the filtered count politely, and only while filtering', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        expect(screen.queryByText(/of 4 shown/)).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'drafts' }));
        const count = screen.getByRole('status');
        expect(count.getAttribute('aria-live')).toBe('polite');
        expect(count.textContent).toContain('2 of 4 shown');
    });

    it('Escape in the search box clears it', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        const box = screen.getByLabelText('Search activities') as HTMLInputElement;
        fireEvent.change(box, { target: { value: 'radical' } });
        fireEvent.keyDown(box, { key: 'Escape' });
        expect(box.value).toBe('');
        expect(screen.getByRole('link', { name: 'Factoring Trinomials' })).toBeTruthy();
    });

    it('`/` focuses the search box from the page body', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        const box = screen.getByLabelText('Search activities');
        expect(document.activeElement).not.toBe(box);
        fireEvent.keyDown(window, { key: '/' });
        expect(document.activeElement).toBe(box);
    });

    // The guard: a slash typed INTO a field must stay a slash.
    it('`/` does not steal focus while an input already has it', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        const box = screen.getByLabelText('Search activities') as HTMLInputElement;
        box.focus();
        const evt = new KeyboardEvent('keydown', { key: '/', cancelable: true, bubbles: true });
        window.dispatchEvent(evt);
        expect(evt.defaultPrevented).toBe(false);
    });

    it('shows the role badge only for classified activities', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Vertex Form Exit Ticket' });
        expect(screen.getByText('Lesson')).toBeTruthy();
        expect(screen.getByText('Practice')).toBeTruthy();
        // o3/o4 are unclassified — no placeholder chrome.
        expect(screen.queryByText('Unclassified')).toBeNull();
    });
});

// =============================================================================
// LANE B — the outline orders by catalogue path
// -----------------------------------------------------------------------------
// The comparator's own properties are pinned in activityGrouping.test.ts. These
// three are the ones that must bind to RENDERED OUTPUT, because each of them
// fails through a wiring mistake the library cannot see: the grouper being
// handed the filtered array as its order source, the sort reaching the group
// header, and the row order reaching the DOM.
//
// ⚠ These fixtures carry density the live database does not have — 4
// file-backed rows out of 51 planned parts, so a multi-chain unit and a mixed
// path/no-path group exist here and nowhere else yet.
// =============================================================================

const row = (o: Record<string, unknown>) => ({
    status: 'draft',
    tags: [],
    pedagogical_role: null,
    course: 'Year 8 Mathematics',
    unit: null,
    draft_course: null,
    draft_unit: null,
    source_path: null,
    ...o,
});

// Unit "Rates" is a MIXED group: one file-backed row (which carries the unit's
// only catalogue path) and one hand-made row. "Graphs" is file-backed. A
// search for "review" keeps the hand-made Rates row and the Graphs row, and
// drops the row that gives Rates its order key.
const PATH_ROWS = [
    row({
        id: 'p1', title: 'Proportional Intro', updated_at: '2026-08-01T00:00:00Z',
        draft_unit: 'Rates', source_path: '01-chain.rate.proportional/01-a.md',
    }),
    row({
        id: 'p2', title: 'Rates Review Sheet', updated_at: '2026-08-28T00:00:00Z',
        draft_unit: 'Rates',
    }),
    row({
        id: 'p3', title: 'Graph Review Sheet', updated_at: '2026-08-02T00:00:00Z',
        draft_unit: 'Graphs', source_path: '02-chain.graph.linear/01-a.md',
    }),
];

describe('Activities outline — catalogue-path order (Lane B)', () => {
    const headings = () =>
        screen.getAllByRole('heading', { level: 2 }).map((h2) => h2.textContent);

    beforeEach(() => {
        h.listResult.current = { data: PATH_ROWS, error: null };
    });

    // Within a group, catalogue path beats recency. p2 is three weeks newer
    // than p1 and still sorts second, because it has no place in the chain.
    it('orders rows by catalogue path, path-less rows last', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Proportional Intro' });
        const rates = screen.getByRole('region', { name: /Rates/ });
        const titles = within(rates)
            .getAllByRole('listitem')
            .map((li) => li.querySelector('a')?.textContent);
        expect(titles).toEqual(['Proportional Intro', 'Rates Review Sheet']);
    });

    // ── D6, bound to rendered output ────────────────────────────────────────
    // THE guard for the fork ruled on this slice. Group order is derived from
    // row data, and the grouper is called with the FILTERED array — so if its
    // order source is ever the filtered set, a search that removes the Rates
    // group's only path-bearing row relocates that group under the teacher's
    // fingers, mid-keystroke. D6 rules that group order stays stable among
    // survivors; the unfiltered outline is the stable spatial map.
    it('keeps group order stable when a filter removes a group\'s min-path row', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Proportional Intro' });
        expect(headings()).toEqual(['Rates', 'Graphs']);

        fireEvent.change(screen.getByLabelText('Search activities'), {
            target: { value: 'review' },
        });

        // "Proportional Intro" is gone — Rates now shows only its path-less
        // row — and the group has NOT moved.
        expect(screen.queryByRole('link', { name: 'Proportional Intro' })).toBeNull();
        expect(headings()).toEqual(['Rates', 'Graphs']);
    });

    // The recency strip must survive the outline's reordering: it reads the
    // full set and sorts for itself rather than inheriting the query's order.
    it('still shows the newest activity first in the recency strip', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Proportional Intro' });
        const strip = screen.getByRole('navigation', { name: 'Recently edited' });
        const first = within(strip).getAllByRole('link')[0];
        expect(first?.textContent).toBe('Rates Review Sheet');
    });
});

// A group whose rows carry more than one course has no single course to name.
// Before Lane B the header read courseOf(group.rows[0]) — whichever course the
// sort happened to put first — so changing the sort silently relabelled it.
const MIXED_COURSE_ROWS = [
    row({
        id: 'm1', title: 'Rates A', updated_at: '2026-08-01T00:00:00Z',
        draft_unit: 'Rates', course: 'Year 8 Mathematics',
        source_path: '01-chain.rate.proportional/01-a.md',
    }),
    row({
        id: 'm2', title: 'Rates B', updated_at: '2026-08-02T00:00:00Z',
        draft_unit: 'Rates', course: 'Year 9 Mathematics',
        source_path: '01-chain.rate.proportional/02-b.md',
    }),
    row({
        id: 'm3', title: 'Graphs A', updated_at: '2026-08-03T00:00:00Z',
        draft_unit: 'Graphs', course: 'Year 9 Mathematics',
        source_path: '02-chain.graph.linear/01-a.md',
    }),
];

describe('Activities outline — the group header names a course only when there is one', () => {
    beforeEach(() => {
        h.listResult.current = { data: MIXED_COURSE_ROWS, error: null };
    });

    it('omits the course on a mixed-course group and names it on a single-course one', async () => {
        renderList();
        await screen.findByRole('link', { name: 'Rates A' });
        const headings = screen
            .getAllByRole('heading', { level: 2 })
            .map((h2) => h2.textContent);
        // Two courses in the library, so headers name the course where they
        // can. "Rates" holds both, so it names neither.
        expect(headings).toEqual(['Rates', 'Year 9 Mathematics — Graphs']);
    });
});
