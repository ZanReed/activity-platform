// @vitest-environment jsdom
// =============================================================================
// AddToClass.test.tsx — adding activities to a class from My activities
// -----------------------------------------------------------------------------
// docs/design/assign-to-class.md (A1–A6, ruled 2026-10-14). Bound to the REAL
// Activities page and the REAL data layer: only lib/supabase and lib/classes
// are mocked, so the share RPC calls asserted here are the ones the page
// actually sends. The headline row is the ORDER one (A4(a)): a unit is sent
// last-first, because students' Home lists newest first; sent first-first,
// students would see the unit reversed.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

interface Held {
    class_id: string;
    activity_id: string;
}

const h = vi.hoisted(() => {
    const state = {
        activities: [] as unknown[],
        held: [] as { class_id: string; activity_id: string }[],
        classes: [] as { id: string; name: string }[],
        failIds: new Set<string>(),
    };
    const rpcCalls: { name: string; args: Record<string, string> }[] = [];
    const from = vi.fn((table: string) => {
        const result = () =>
            table === 'class_activities'
                ? {
                      data: state.held.map((r, i) => ({
                          ...r,
                          added_at: `2026-10-14T00:00:${String(i).padStart(2, '0')}Z`,
                          activities: { title: r.activity_id, status: 'published', deleted_at: null, current_version_id: 'v' },
                      })),
                      error: null,
                  }
                : { data: state.activities, error: null };
        const qb: Record<string, unknown> = {
            select: () => qb,
            is: () => qb,
            eq: () => qb,
            order: () => qb,
            then: (resolve: (v: unknown) => unknown) => resolve(result()),
        };
        return qb;
    });
    const rpc = vi.fn((name: string, args: Record<string, string>) => {
        rpcCalls.push({ name, args });
        const { p_class_id: c, p_activity_id: a } = args;
        if (state.failIds.has(a ?? '')) return Promise.resolve({ error: { message: 'network' } });
        if (name === 'share_activity_to_class') {
            if (!state.held.some((r) => r.class_id === c && r.activity_id === a)) {
                state.held.push({ class_id: c ?? '', activity_id: a ?? '' });
            }
        } else if (name === 'unshare_activity_from_class') {
            state.held = state.held.filter((r) => !(r.class_id === c && r.activity_id === a));
        }
        return Promise.resolve({ data: null, error: null });
    });
    return { state, rpcCalls, from, rpc };
});

vi.mock('../lib/supabase', () => ({
    supabase: {
        from: h.from,
        rpc: h.rpc,
        // listTeacherClassActivities narrows to the signed-in teacher (audit #4).
        auth: { getSession: async () => ({ data: { session: { user: { id: 'teacher-1' } } } }) },
    },
}));
vi.mock('../lib/classes', () => ({
    listClasses: () => Promise.resolve(h.state.classes),
}));
vi.mock('../lib/bank', () => ({
    isBankLister: () => Promise.resolve(false),
    setActivityListing: vi.fn(),
}));
vi.mock('../lib/chainHooks', async (importActual) => {
    const real = await importActual<typeof import('../lib/chainHooks')>();
    return { ...real, fetchMyChainHooks: () => Promise.resolve(real.NO_CHAIN_HOOKS) };
});
vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({ session: { user: { id: 'owner-1' } }, loading: false }),
}));

const { default: Activities } = await import('../routes/Activities');

const row = (id: string, title: string, status: string, path: string) => ({
    id,
    title,
    status,
    updated_at: '2026-10-01T00:00:00Z',
    tags: [],
    pedagogical_role: 'lesson',
    course: 'Y7',
    unit: 'Integers',
    draft_course: null,
    draft_unit: null,
    source_path: path,
    visibility: 'private',
    copied_from_activity_id: null,
});

// Teaching order is the catalogue path: first, second, then a draft third.
const FIRST = row('a1', 'Integers 1: Opposites', 'published', 'y7/integers/01.md');
const SECOND = row('a2', 'Integers 2: Adding', 'published', 'y7/integers/02.md');
const DRAFT = row('a3', 'Integers 3: Subtracting', 'draft', 'y7/integers/03.md');

const SHARE = 'share_activity_to_class';
const UNSHARE = 'unshare_activity_from_class';
const sent = (name: string) => h.rpcCalls.filter((c) => c.name === name).map((c) => c.args.p_activity_id);

beforeEach(() => {
    // Rows arrive in RECENCY order, the opposite of teaching order, so a page
    // that used the fetch order instead of the outline would fail the order row.
    h.state.activities = [DRAFT, SECOND, FIRST];
    h.state.held = [];
    h.state.classes = [
        { id: 'c7b', name: '7B' },
        { id: 'c7a', name: '7A' },
    ];
    h.state.failIds = new Set();
    h.rpcCalls.length = 0;
});
afterEach(cleanup);

function renderPage() {
    return render(
        <MemoryRouter>
            <Activities />
        </MemoryRouter>,
    );
}

async function openUnitPanel() {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Add unit Integers to a class' }));
    return screen.getByRole('group', { name: 'Add Integers to a class' });
}

describe('add a unit to a class from My activities (A1–A4)', () => {
    it('sends the unit LAST-FIRST, skips the draft, and says so', async () => {
        const panel = await openUnitPanel();
        expect(within(panel).getByText('1 draft skipped (publish it first).')).toBeInTheDocument();
        fireEvent.click(await within(panel).findByRole('checkbox', { name: /7B/ }));
        expect(
            await within(panel).findByText('Added 2 to 7B ✓ · 1 draft skipped (publish it first)'),
        ).toBeInTheDocument();
        // Second lesson first, so the FIRST lesson is the newest and tops
        // the student's newest-first Home. The draft is never sent.
        expect(sent(SHARE)).toEqual(['a2', 'a1']);
        expect(h.rpcCalls.every((c) => c.args.p_class_id === 'c7b')).toBe(true);
    });

    it('lists classes by name, and shows a partly-added unit as mixed', async () => {
        h.state.held = [{ class_id: 'c7a', activity_id: 'a1' }];
        const panel = await openUnitPanel();
        const boxes = await within(panel).findAllByRole('checkbox');
        expect(boxes.map((b) => b.closest('label')?.textContent)).toEqual([
            expect.stringMatching(/^7A1 of 2/),
            expect.stringMatching(/^7B/),
        ]);
        expect(boxes[0]).toHaveAttribute('aria-checked', 'mixed');
        // Ticking a mixed class adds only what is missing.
        fireEvent.click(boxes[0]!);
        await within(panel).findByText(/Added 1 to 7A/);
        expect(sent(SHARE)).toEqual(['a2']);
    });

    it('unticking removes the unit, and Undo restores it in teaching order', async () => {
        h.state.held = [
            { class_id: 'c7b', activity_id: 'a1' },
            { class_id: 'c7b', activity_id: 'a2' },
        ];
        const panel = await openUnitPanel();
        const box = await within(panel).findByRole('checkbox', { name: /7B/ });
        await waitFor(() => expect(box).toBeChecked());
        fireEvent.click(box);
        await within(panel).findByText(/Removed 2 from 7B\./);
        expect(new Set(sent(UNSHARE))).toEqual(new Set(['a1', 'a2']));
        fireEvent.click(within(panel).getByRole('button', { name: 'Undo' }));
        await within(panel).findByText('Restored to 7B ✓');
        expect(sent(SHARE)).toEqual(['a2', 'a1']);
    });

    it('names a partial failure and does not stop the rest', async () => {
        h.state.failIds = new Set(['a2']);
        const panel = await openUnitPanel();
        fireEvent.click(await within(panel).findByRole('checkbox', { name: /7B/ }));
        expect(
            await within(panel).findByText("Couldn't add 1 of 2 to 7B just now. Tick it again to retry."),
        ).toBeInTheDocument();
        expect(h.state.held).toEqual([{ class_id: 'c7b', activity_id: 'a1' }]);
    });

    it('a teacher with no classes is sent to My classes', async () => {
        h.state.classes = [];
        const panel = await openUnitPanel();
        expect(await within(panel).findByText('You have no classes yet.')).toBeInTheDocument();
        expect(within(panel).getByRole('link', { name: 'Create one in My classes' })).toHaveAttribute('href', '/classes');
    });
});

describe('class membership on My activities (A6) and the row door', () => {
    it('a unit header names the classes holding it, with a count when partial', async () => {
        h.state.held = [
            { class_id: 'c7b', activity_id: 'a1' },
            { class_id: 'c7b', activity_id: 'a2' },
            { class_id: 'c7a', activity_id: 'a1' },
        ] satisfies Held[];
        renderPage();
        const line = await waitFor(() => {
            const el = document.querySelector('[data-unit-membership]');
            if (!el) throw new Error('no membership line yet');
            return el;
        });
        expect(line).toHaveTextContent('In 7A (1/2) · 7B');
    });

    it('a published row names its classes; a draft row has no door', async () => {
        h.state.held = [{ class_id: 'c7b', activity_id: 'a1' }];
        renderPage();
        const door = await screen.findByRole('button', {
            name: "Integers 1: Opposites: on Home in 7B. Change classes",
        });
        expect(door).toHaveTextContent('7B');
        expect(screen.getByRole('button', { name: 'Add Integers 2: Adding to a class' })).toHaveTextContent('Add to class');
        expect(screen.queryByRole('button', { name: /Integers 3: Subtracting to a class/ })).toBeNull();
    });

    it('the row door adds just that activity', async () => {
        renderPage();
        fireEvent.click(await screen.findByRole('button', { name: 'Add Integers 2: Adding to a class' }));
        const panel = screen.getByRole('group', { name: 'Add Integers 2: Adding to a class' });
        fireEvent.click(await within(panel).findByRole('checkbox', { name: /7A/ }));
        await within(panel).findByText('Added to 7A ✓');
        expect(sent(SHARE)).toEqual(['a2']);
    });
});
