// @vitest-environment jsdom
// =============================================================================
// ChainHooks.test.tsx — the chain hook page (0057; docs/design/chain-hooks-view.md)
// -----------------------------------------------------------------------------
// Bound to RENDERED OUTPUT (the orphan rule): literal hook text ("$4" stays
// "$4"), pool order, the header named for the unit (1A), every state of the
// Pass 2 table (empty pool 2.1A, no class 2.2A, read failure D3), the used look
// (5.1A: muted prompt + check + words, never opacity), plain mark buttons with
// no aria-pressed (RT1), the optimistic write with an honest revert (2.3A),
// "Change date" disabled while a write is in flight (RT2), and the inline date
// swap with Esc (7.2A). Print is proven in a real browser by
// e2e/a11y/chain-hooks.e2e.ts (D3-rerun); jsdom cannot evaluate @media print.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

const CHAIN = 'chain.geom.parallel-lines';

const m = vi.hoisted(() => ({
    fetch: vi.fn(),
    listMarks: vi.fn(),
    mark: vi.fn(),
    unmark: vi.fn(),
    listClasses: vi.fn(),
    activities: { current: { data: [] as unknown[], error: null as unknown } },
}));

vi.mock('../lib/chainHooks', async (importActual) => ({
    ...(await importActual<typeof import('../lib/chainHooks')>()),
    fetchMyChainHooks: m.fetch,
    listHookMarks: m.listMarks,
    markHookUsed: m.mark,
    unmarkHook: m.unmark,
}));
vi.mock('../lib/classes', () => ({ listClasses: m.listClasses }));
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: () => {
            const qb: Record<string, unknown> = {
                select: () => qb,
                in: () => qb,
                is: () => Promise.resolve(m.activities.current),
            };
            return qb;
        },
    },
}));
vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({ session: { user: { id: 'teacher-1' } }, loading: false }),
}));

import ChainHooks from '../routes/ChainHooks';
import { localToday } from '../lib/chainHooks';

const POOL = {
    activityChains: { act1: CHAIN, act2: CHAIN },
    chains: {
        [CHAIN]: [
            {
                id: 'hook.angles.squashed-x',
                connects_to: [{ id: 'geom.angles.relationships', label: 'Use angle relationships' }],
                prompt: 'Draw two long straight lines that cross, like a squashed X. Is Kiri right?',
                note: 'Sets up the vertical-angles error.',
            },
            {
                id: 'hook.rate.better-value',
                connects_to: [],
                prompt: 'A bag of 5 for $4 or a bag of 12 for $10: which is better value?',
                note: '80c vs about 83c. Not $4 math: plain money.',
            },
        ],
    },
};
const ACTS = [
    { id: 'act2', title: 'Parallel lines', status: 'draft', updated_at: '2026-10-07T00:00:00Z',
      unit: 'Angles and Parallel Lines', draft_unit: null, source_path: '713-chain.geom.parallel-lines/02.md' },
    { id: 'act1', title: 'Angle relationships', status: 'published', updated_at: '2026-10-08T00:00:00Z',
      unit: 'Angles and Parallel Lines', draft_unit: null, source_path: '713-chain.geom.parallel-lines/01.md' },
];
const CLASSES = [{ id: 'c1', name: '9MAT2' }, { id: 'c2', name: '10MAT1' }];

function renderPage() {
    return render(
        <MemoryRouter initialEntries={[`/chains/${CHAIN}`]}>
            <Routes>
                <Route path="/chains/:chainId" element={<ChainHooks />} />
            </Routes>
        </MemoryRouter>,
    );
}

async function chooseClass(name = '9MAT2') {
    const select = await screen.findByRole('combobox', { name: /class/i });
    const option = within(select).getByRole('option', { name });
    fireEvent.change(select, { target: { value: (option as HTMLOptionElement).value } });
    await waitFor(() => expect(m.listMarks).toHaveBeenCalled());
}

beforeEach(() => {
    m.fetch.mockReset().mockResolvedValue(POOL);
    m.listMarks.mockReset().mockResolvedValue([]);
    m.mark.mockReset().mockResolvedValue(undefined);
    m.unmark.mockReset().mockResolvedValue(undefined);
    m.listClasses.mockReset().mockResolvedValue(CLASSES);
    m.activities.current = { data: ACTS, error: null };
    try {
        window.localStorage.clear();
    } catch {
        /* jsdom always has it */
    }
});
afterEach(cleanup);

describe('ChainHooks page — content (1A, CH-8, C-97 (d))', () => {
    it('is named for the unit, with a crumb back to Activities', async () => {
        renderPage();
        expect(await screen.findByRole('heading', { level: 1, name: 'Angles and Parallel Lines' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Activities' }).getAttribute('href')).toBe('/activities');
        expect(document.title).toBe('Angles and Parallel Lines — Hooks');
    });

    it('renders hook text LITERALLY — "$4" stays "$4" — each hook an article headed by its prompt', async () => {
        renderPage();
        const heading = await screen.findByRole('heading', {
            level: 3,
            name: 'A bag of 5 for $4 or a bag of 12 for $10: which is better value?',
        });
        expect(heading.closest('article')).toBeTruthy();
        expect(screen.getByText('80c vs about 83c. Not $4 math: plain money.')).toBeTruthy();
    });

    it('keeps pool order, shows "Opens: <skill>", the notes, and the count', async () => {
        renderPage();
        const articles = await screen.findAllByRole('article');
        expect(articles.map((a) => within(a).getByRole('heading', { level: 3 }).textContent)).toEqual([
            POOL.chains[CHAIN][0]!.prompt,
            POOL.chains[CHAIN][1]!.prompt,
        ]);
        expect(within(articles[0]!).getByText('Opens: Use angle relationships')).toBeTruthy();
        expect(within(articles[0]!).getByText('Teacher notes')).toBeTruthy();
        expect(screen.getByRole('heading', { level: 2, name: 'Hooks · 2' })).toBeTruthy();
    });

    it("lists the unit's activities in teaching order (catalogue path)", async () => {
        renderPage();
        const section = (await screen.findByRole('heading', { name: 'Activities in this unit' })).closest('section')!;
        await waitFor(() => expect(within(section).getAllByRole('link')).toHaveLength(2));
        expect(within(section).getAllByRole('link').map((a) => a.textContent)).toEqual([
            'Angle relationships',
            'Parallel lines',
        ]);
    });
});

describe('ChainHooks page — states (Pass 2)', () => {
    it('a unit with no live pool says so, and still lists its activities (2.1A)', async () => {
        m.fetch.mockResolvedValue({ activityChains: POOL.activityChains, chains: {} });
        renderPage();
        expect(await screen.findByText('No hooks for this unit yet.')).toBeTruthy();
        expect(screen.getByText(/Hooks come with the curriculum import/)).toBeTruthy();
        expect(await screen.findByRole('link', { name: 'Angle relationships' })).toBeTruthy();
    });

    it('a failed read says so and Retry reads again (D3)', async () => {
        m.fetch.mockRejectedValueOnce(new Error('offline'));
        renderPage();
        const alert = await screen.findByRole('alert');
        expect(alert.textContent).toMatch(/Couldn't load hooks\. Check your connection, then try again\./);
        fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
        expect(await screen.findAllByRole('article')).toHaveLength(2);
        expect(m.fetch).toHaveBeenCalledTimes(2);
    });

    it('a teacher with no classes reads the hooks with no mark controls, and one line to My classes (2.2A)', async () => {
        m.listClasses.mockResolvedValue([]);
        renderPage();
        await screen.findAllByRole('article');
        const link = await screen.findByRole('link', { name: 'My classes' });
        expect(link.getAttribute('href')).toBe('/classes');
        expect(screen.queryByRole('combobox')).toBeNull();
        expect(screen.queryByRole('button', { name: /^Mark used/ })).toBeNull();
    });

    it('with classes but none chosen, the picker says so and the controls stay hidden', async () => {
        renderPage();
        const select = await screen.findByRole('combobox', { name: /class/i });
        expect((select as HTMLSelectElement).value).toBe('');
        expect(within(select).getByRole('option', { name: 'Choose a class' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: /^Mark used/ })).toBeNull();
    });

    it('remembers the last class chosen (per viewer)', async () => {
        window.localStorage.setItem('chainHooks.classId', 'c2');
        renderPage();
        const select = await screen.findByRole('combobox', { name: /class/i });
        await waitFor(() => expect((select as HTMLSelectElement).value).toBe('c2'));
        await waitFor(() => expect(m.listMarks).toHaveBeenCalledWith('c2'));
    });
});

describe('ChainHooks page — used marks (CH-9, 2.3A, 5.1A, RT1, RT2, 7.2A)', () => {
    it('marking is optimistic: the prompt goes muted, "Used <date>" shows with a check, the button reads Unmark', async () => {
        renderPage();
        await chooseClass();
        const markBtn = await screen.findByRole('button', { name: /^Mark used: Draw two long straight lines/ });
        expect(markBtn.hasAttribute('aria-pressed')).toBe(false);
        fireEvent.click(markBtn);
        const article = markBtn.closest('article') ?? screen.getAllByRole('article')[0]!;
        expect(within(article).getByRole('heading', { level: 3 }).className).toMatch(/ch-prompt--used/);
        expect(within(article).getByText(/Used /)).toBeTruthy();
        expect(within(article).getByText('✓')).toBeTruthy();
        const unmark = within(article).getByRole('button', { name: /^Unmark: Draw two long straight lines/ });
        expect(unmark.hasAttribute('aria-pressed')).toBe(false);
        expect(m.mark).toHaveBeenCalledWith('c1', 'hook.angles.squashed-x', localToday(), 'teacher-1');
        await waitFor(() => expect(screen.getByRole('status', { hidden: true }).textContent).toBe('Marked used for 9MAT2'));
    });

    it('the used look never uses opacity (5.1A)', async () => {
        m.listMarks.mockResolvedValue([{ hook_id: 'hook.angles.squashed-x', used_on: '2026-02-12' }]);
        renderPage();
        await chooseClass();
        const h3 = await screen.findByRole('heading', { level: 3, name: /squashed X/ });
        await waitFor(() => expect(h3.className).toMatch(/ch-prompt--used/));
        expect(h3.getAttribute('style')).toBeNull();
        expect(h3.closest('article')!.getAttribute('style')).toBeNull();
    });

    it('a failed write reverts the card and says "Couldn\'t save · Try again"; Try again repeats it', async () => {
        m.mark.mockRejectedValueOnce(new Error('offline'));
        renderPage();
        await chooseClass();
        fireEvent.click(await screen.findByRole('button', { name: /^Mark used: Draw two/ }));
        expect(await screen.findByText(/Couldn't save/)).toBeTruthy();
        expect(screen.getByRole('button', { name: /^Mark used: Draw two/ })).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
        await waitFor(() => expect(m.mark).toHaveBeenCalledTimes(2));
        expect(await screen.findByRole('button', { name: /^Unmark: Draw two/ })).toBeTruthy();
        expect(screen.queryByText(/Couldn't save/)).toBeNull();
    });

    it('"Change date" is disabled while the mark is still saving, and enables when it lands (RT2)', async () => {
        let land: () => void = () => {};
        m.mark.mockImplementationOnce(() => new Promise<void>((r) => (land = r)));
        renderPage();
        await chooseClass();
        fireEvent.click(await screen.findByRole('button', { name: /^Mark used: Draw two/ }));
        const change = await screen.findByRole('button', { name: 'Change date' });
        expect(change.getAttribute('aria-disabled')).toBe('true');
        fireEvent.click(change);
        expect(screen.queryByLabelText(/Used on/)).toBeNull();
        await act(async () => land());
        await waitFor(() => expect(screen.getByRole('button', { name: 'Change date' }).getAttribute('aria-disabled')).toBeNull());
    });

    it('"Change date" swaps in a labelled date field; Esc restores the line unchanged (7.2A)', async () => {
        m.listMarks.mockResolvedValue([{ hook_id: 'hook.angles.squashed-x', used_on: '2026-02-12' }]);
        renderPage();
        await chooseClass();
        fireEvent.click(await screen.findByRole('button', { name: 'Change date' }));
        const input = screen.getByLabelText(/Used on/) as HTMLInputElement;
        expect(input.type).toBe('date');
        expect(input.value).toBe('2026-02-12');
        expect(input.max).toBe(localToday());
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(screen.queryByLabelText(/Used on/)).toBeNull();
        expect(screen.getByRole('button', { name: 'Change date' })).toBeTruthy();
        expect(m.mark).not.toHaveBeenCalled();
    });

    it('picking a new date saves it as an upsert of the same hook', async () => {
        m.listMarks.mockResolvedValue([{ hook_id: 'hook.angles.squashed-x', used_on: '2026-02-12' }]);
        renderPage();
        await chooseClass();
        fireEvent.click(await screen.findByRole('button', { name: 'Change date' }));
        fireEvent.change(screen.getByLabelText(/Used on/), { target: { value: '2026-02-10' } });
        expect(m.mark).toHaveBeenCalledWith('c1', 'hook.angles.squashed-x', '2026-02-10', 'teacher-1');
    });

    it('Unmark deletes the mark', async () => {
        m.listMarks.mockResolvedValue([{ hook_id: 'hook.angles.squashed-x', used_on: '2026-02-12' }]);
        renderPage();
        await chooseClass();
        fireEvent.click(await screen.findByRole('button', { name: /^Unmark: Draw two/ }));
        expect(m.unmark).toHaveBeenCalledWith('c1', 'hook.angles.squashed-x');
        expect(await screen.findByRole('button', { name: /^Mark used: Draw two/ })).toBeTruthy();
    });
});
