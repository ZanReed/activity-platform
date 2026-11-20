// @vitest-environment jsdom
// =============================================================================
// Bank.test.tsx — the Activity Bank page (0054; docs/design/activity-bank.md)
// -----------------------------------------------------------------------------
// Bound to what a teacher SEES: rows in the catalogue's teaching order, grouped
// by unit; search removes rows and never reorders them; "Add to my library"
// copies and stays on the page, with a link to the teacher's OWN copy; "Add
// unit" adds the unit's missing entries, last lesson first; the guide panel shows
// the guide text; a failed add says so. The data layer is mocked at lib/bank
// (its RPCs are proven against the database by scripts/verify-0054.sql).
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

const h = vi.hoisted(() => ({
    listBank: vi.fn(),
    copyBankActivity: vi.fn(),
    getBankTeacherGuide: vi.fn(),
    lister: { current: false },
    myCopies: { current: new Map<string, string>() },
    // When set, listMyBankCopies returns this instead (a read that lands late).
    myCopiesPromise: { current: null as Promise<Map<string, string>> | null },
    publicName: { current: { name: null as string | null, optedIn: false } },
    setPublicName: vi.fn(),
}));

vi.mock('../lib/bank', () => ({
    BANK_LICENSE: 'CC BY-NC-SA 4.0',
    listBank: h.listBank,
    copyBankActivity: h.copyBankActivity,
    listMyBankCopies: () => h.myCopiesPromise.current ?? Promise.resolve(h.myCopies.current),
    getBankTeacherGuide: h.getBankTeacherGuide,
    isBankLister: () => Promise.resolve(h.lister.current),
    getMyPublicName: () => Promise.resolve(h.publicName.current),
    setPublicName: h.setPublicName,
}));
vi.mock('../lib/SessionContext', () => ({
    useSession: () => ({ session: { user: { id: 'teacher-1' } }, loading: false }),
}));
// The preview pulls in the whole viewer; it has its own reason to exist (print
// mode) documented in its header. Here it only has to be reachable.
vi.mock('../components/BankPreview', () => ({
    default: ({ activityId }: { activityId: string }) => <p>PREVIEW {activityId}</p>,
}));

const { default: Bank } = await import('../routes/Bank');

const entry = (over: Record<string, unknown>) => ({
    id: 'id',
    title: 't',
    description: null,
    course: 'Y7',
    unit: 'Unit',
    tags: [],
    pedagogical_role: 'lesson',
    activity_type: 'worksheet',
    source_path: null,
    has_guide: true,
    version_num: 1,
    published_at: '2026-10-07T00:00:00Z',
    author_name: null,
    ...over,
});

const ROWS = [
    entry({ id: 'a1', title: 'Naming Triangles', unit: 'Triangles and Angle Sums', tags: ['geometry'] }),
    entry({ id: 'a2', title: 'Angle Sums', unit: 'Triangles and Angle Sums', has_guide: false }),
    entry({ id: 'b1', title: 'Unit Rates', unit: 'Rates and Proportional Relationships' }),
];

function EditorStub() {
    const loc = useLocation();
    return <p>EDITOR {loc.pathname} {(loc.state as { fromBank?: string } | null)?.fromBank}</p>;
}

function renderBank() {
    return render(
        <MemoryRouter initialEntries={['/bank']}>
            <Routes>
                <Route path="/bank" element={<Bank />} />
                <Route path="/activity/:id" element={<EditorStub />} />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    h.lister.current = false;
    h.publicName.current = { name: null, optedIn: false };
    h.setPublicName.mockReset();
    h.listBank.mockResolvedValue(ROWS);
    h.copyBankActivity.mockReset();
    h.getBankTeacherGuide.mockReset();
});
afterEach(cleanup);

describe('Activity Bank page', () => {
    it('lists the entries in teaching order, grouped by unit', async () => {
        renderBank();
        await screen.findByText('Naming Triangles');
        const sections = screen.getAllByRole('region');
        expect(sections.map((s) => s.getAttribute('aria-label'))).toEqual([
            'Y7 — Triangles and Angle Sums',
            'Y7 — Rates and Proportional Relationships',
        ]);
        const titles = [...document.querySelectorAll('[data-bank-entry]')].map((li) =>
            li.getAttribute('data-bank-entry'),
        );
        expect(titles).toEqual(['a1', 'a2', 'b1']);
        expect(screen.getByText(/CC BY-NC-SA 4.0/)).toBeInTheDocument();
    });

    it('search removes rows (titles, units, tags) and never reorders them', async () => {
        renderBank();
        await screen.findByText('Naming Triangles');
        const search = screen.getByLabelText('Search the Activity Bank');
        fireEvent.change(search, { target: { value: 'geometry' } });
        expect(screen.getByText('Naming Triangles')).toBeInTheDocument();
        expect(screen.queryByText('Angle Sums')).toBeNull();
        fireEvent.change(search, { target: { value: 'rates' } });
        expect(screen.getByText('Unit Rates')).toBeInTheDocument();
        expect(screen.queryByText('Naming Triangles')).toBeNull();
        fireEvent.change(search, { target: { value: 'zzz' } });
        expect(screen.getByText('No activities match.')).toBeInTheDocument();
    });

    it('"Add to my library" copies, stays in the Bank, and links to the copy', async () => {
        h.copyBankActivity.mockResolvedValue('new-copy-id');
        renderBank();
        await screen.findByText('Naming Triangles');
        fireEvent.click(screen.getAllByRole('button', { name: /^Add to my library: / })[0]!);
        const open = await screen.findByRole('link', { name: 'Open your copy of Naming Triangles' });
        expect(h.copyBankActivity).toHaveBeenCalledWith('a1');
        expect(screen.getByText('Unit Rates')).toBeInTheDocument(); // still in the Bank
        expect(document.querySelector('[data-bank-announce]')?.textContent).toBe(
            'Added “Naming Triangles” to your library.',
        );
        // Other rows can still be added straight away.
        expect(screen.getAllByRole('button', { name: /^Add to my library: / })[1]).toBeEnabled();
        // Opening it lands in the editor with the "added from the Bank" note.
        fireEvent.click(open);
        expect(await screen.findByText(/EDITOR \/activity\/new-copy-id Naming Triangles/)).toBeInTheDocument();
    });

    it('a second add of a just-added entry asks first', async () => {
        h.copyBankActivity.mockResolvedValue('new-copy-id');
        renderBank();
        await screen.findByText('Naming Triangles');
        fireEvent.click(screen.getAllByRole('button', { name: /^Add to my library: / })[0]!);
        await screen.findByRole('link', { name: 'Open your copy of Naming Triangles' });
        fireEvent.click(screen.getAllByRole('button', { name: /^Add to my library: / })[0]!);
        expect(screen.getByText('You already have a copy. Add another?')).toBeInTheDocument();
        expect(h.copyBankActivity).toHaveBeenCalledTimes(1);
    });

    // E-1 (ui-review-group-e.md): already copied → a marker, and adding again asks.
    it('an entry already copied says "In your library", links to the copy, and asks before another', async () => {
        h.myCopies.current = new Map([['a1', 'my-copy-id']]);
        h.copyBankActivity.mockResolvedValue('second-copy-id');
        renderBank();
        await screen.findByText('Naming Triangles');
        const marker = await screen.findByRole('link', { name: /^In your library: / });
        expect(marker).toHaveAttribute('href', '/activity/my-copy-id');
        fireEvent.click(screen.getAllByRole('button', { name: /^Add to my library: / })[0]!);
        expect(h.copyBankActivity).not.toHaveBeenCalled();
        expect(screen.getByText('You already have a copy. Add another?')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(h.copyBankActivity).not.toHaveBeenCalled();
        fireEvent.click(screen.getAllByRole('button', { name: /^Add to my library: / })[0]!);
        fireEvent.click(screen.getByRole('button', { name: 'Add another' }));
        expect(await screen.findByRole('link', { name: 'Open your copy of Naming Triangles' })).toHaveAttribute(
            'href',
            '/activity/second-copy-id',
        );
        h.myCopies.current = new Map();
    });

    it('a failed add says so and stays on the page', async () => {
        h.copyBankActivity.mockRejectedValue(new Error('That activity is not in the Activity Bank'));
        renderBank();
        await screen.findByText('Naming Triangles');
        fireEvent.click(screen.getAllByRole('button', { name: /^Add to my library: / })[1]!);
        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Couldn’t add “Angle Sums”: That activity is not in the Activity Bank',
        );
    });

    it('offers the guide only where there is one, and shows its text', async () => {
        // The guide panel imports lib/serialize on demand (shell-size review
        // TR1), and that module graph (MathLive, mathjs) takes longer than
        // waitFor's 1 s to transform under a full parallel run. Warm it first,
        // so the row tests the panel, not the transformer's speed.
        await import('../lib/serialize');
        // The panel renders through the lazy TeacherGuideEditor (Tiptap), whose
        // first import under jsdom can pass waitFor's 1s on a loaded CI runner
        // (failed CI run 44715656864): warm it too.
        await import('../editor/TeacherGuideEditor');
        h.getBankTeacherGuide.mockResolvedValue({
            blocks: [
                {
                    id: '11111111-1111-4111-8111-111111111111',
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'GUIDE_TEXT watch for', marks: [] }],
                },
            ],
        });
        renderBank();
        await screen.findByText('Naming Triangles');
        const guideButtons = screen.getAllByRole('button', { name: /^Teacher guide: / });
        expect(guideButtons).toHaveLength(2); // a2 has no guide
        fireEvent.click(guideButtons[0]!);
        await waitFor(() =>
            expect(document.querySelector('[data-bank-guide]')?.textContent).toContain('GUIDE_TEXT'),
        );
        expect(h.getBankTeacherGuide).toHaveBeenCalledWith('a1');
    });

    it('opens the preview for the row asked', async () => {
        renderBank();
        await screen.findByText('Unit Rates');
        fireEvent.click(screen.getAllByRole('button', { name: /^Preview: / })[2]!);
        expect(await screen.findByText('PREVIEW b1')).toBeInTheDocument();
    });

    it('shows the server\'s refusal (non-teachers) and the empty Bank plainly', async () => {
        h.listBank.mockRejectedValueOnce(new Error('The Activity Bank is for teachers'));
        renderBank();
        expect(await screen.findByRole('alert')).toHaveTextContent('The Activity Bank is for teachers');
        cleanup();
        h.listBank.mockResolvedValueOnce([]);
        renderBank();
        expect(await screen.findByText('Nothing is in the Activity Bank yet.')).toBeInTheDocument();
    });
});

describe('Activity Bank filters and authors (0055)', () => {
    const MIXED = [
        entry({ id: 'm1', title: 'Lesson A', course: 'Year 7 Mathematics', unit: 'U1', tags: ['triangles', 'angles'], pedagogical_role: 'lesson', author_name: 'Ms Rivera' }),
        entry({ id: 'm2', title: 'Review B', course: 'Year 7 Mathematics', unit: 'U1', tags: ['angles'], pedagogical_role: 'review', has_guide: false }),
        entry({ id: 'm3', title: 'Practice C', course: 'Year 8 Mathematics', unit: 'U2', tags: ['rates'], pedagogical_role: 'practice', author_name: 'Mr Okafor' }),
    ];
    const shown = () =>
        [...document.querySelectorAll('[data-bank-entry]')].map((li) => li.getAttribute('data-bank-entry'));

    beforeEach(() => {
        h.listBank.mockResolvedValue(MIXED);
    });

    it('filters by subject, role, tag (any of), guide and author; AND across filters', async () => {
        renderBank();
        await screen.findByText('Lesson A');
        fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Year 7 Mathematics' } });
        expect(shown()).toEqual(['m1', 'm2']);
        fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'review' } });
        expect(shown()).toEqual(['m2']);
        fireEvent.click(screen.getByText('Clear filters'));
        expect(shown()).toEqual(['m1', 'm2', 'm3']);

        // F-1: topics live behind one button, grouped by unit, with counts.
        fireEvent.click(screen.getByRole('button', { name: /^Topics/ }));
        const panel = await screen.findByRole('dialog', { name: 'Filter by topic' });
        fireEvent.click(within(panel).getAllByLabelText(/^triangles \(/)[0]!);
        fireEvent.click(within(panel).getAllByLabelText(/^rates \(/)[0]!);
        expect(shown()).toEqual(['m1', 'm3']); // any of the chosen tags
        expect(screen.getByRole('button', { name: 'Remove topic rates' })).toBeInTheDocument();
        fireEvent.click(screen.getByLabelText('Has a teacher guide'));
        expect(shown()).toEqual(['m1', 'm3']);
        fireEvent.change(screen.getByLabelText('Author'), { target: { value: 'Mr Okafor' } });
        expect(shown()).toEqual(['m3']);
        expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 3.');
    });

    it('shows "by" only for opted-in authors, and an Unnamed author option', async () => {
        renderBank();
        await screen.findByText('Lesson A');
        expect(screen.getByText('by Ms Rivera')).toBeInTheDocument();
        expect(screen.queryByText(/^by $/)).toBeNull();
        fireEvent.change(screen.getByLabelText('Author'), { target: { value: '\u0000no-author' } });
        expect(shown()).toEqual(['m2']);
    });

    it('the name control appears only for listers, and saves an opt-in', async () => {
        renderBank();
        await screen.findByText('Lesson A');
        expect(document.querySelector('[data-bank-name]')).toBeNull();
        cleanup();
        h.lister.current = true;
        h.setPublicName.mockResolvedValue({ name: 'Ms Rivera', optedIn: true });
        renderBank();
        fireEvent.click(await screen.findByRole('button', { name: 'Add your name' }));
        fireEvent.change(screen.getByLabelText('Your name on activities you list'), { target: { value: 'Ms Rivera' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        expect(await screen.findByText('by Ms Rivera', { selector: 'strong' })).toBeInTheDocument();
        expect(h.setPublicName).toHaveBeenCalledWith('Ms Rivera');
    });

    describe('Add unit', () => {
        const UNIT = [
            entry({ id: 'u1', title: 'Lesson 1', unit: 'Ratios' }),
            entry({ id: 'u2', title: 'Lesson 2', unit: 'Ratios' }),
            entry({ id: 'u3', title: 'Lesson 3', unit: 'Ratios' }),
            entry({ id: 'solo', title: 'Alone', unit: 'Solo unit' }),
        ];
        beforeEach(() => {
            h.listBank.mockResolvedValue(UNIT);
            h.copyBankActivity.mockImplementation((id: string) => Promise.resolve(`copy-${id}`));
        });
        afterEach(() => {
            h.myCopies.current = new Map();
        });
        const ratios = () => screen.getByRole('region', { name: 'Y7 — Ratios' });

        it('asks, then adds only the missing entries, last lesson first', async () => {
            h.myCopies.current = new Map([['u2', 'old-copy']]);
            renderBank();
            await screen.findByText('Lesson 1');
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add unit to my library: Ratios' }));
            expect(h.copyBankActivity).not.toHaveBeenCalled();
            expect(within(ratios()).getByRole('group')).toHaveTextContent(
                'Add 2 activities to your library? 1 already there is skipped.',
            );
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add 2' }));
            await within(ratios()).findByText(/Added 2 activities\. They are in/);
            // Last first, so My activities' newest-first order is teaching order.
            expect(h.copyBankActivity.mock.calls.map((c) => c[0])).toEqual(['u3', 'u1']);
            expect(within(ratios()).getByText('All in your library')).toBeInTheDocument();
            expect(within(ratios()).getByRole('link', { name: 'Open your copy of Lesson 1' })).toHaveAttribute(
                'href',
                '/activity/copy-u1',
            );
            expect(document.querySelector('[data-bank-announce]')?.textContent).toBe(
                'Added 2 activities from Ratios to your library.',
            );
        });

        it('Cancel adds nothing', async () => {
            renderBank();
            await screen.findByText('Lesson 1');
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add unit to my library: Ratios' }));
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Cancel' }));
            expect(within(ratios()).queryByRole('group')).toBeNull();
            expect(h.copyBankActivity).not.toHaveBeenCalled();
        });

        it('stops at a failure, says how far it got, and a second run adds the rest', async () => {
            h.copyBankActivity.mockImplementation((id: string) =>
                id === 'u2' ? Promise.reject(new Error('Network down')) : Promise.resolve(`copy-${id}`),
            );
            renderBank();
            await screen.findByText('Lesson 1');
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add unit to my library: Ratios' }));
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add 3' }));
            expect(await within(ratios()).findByRole('alert')).toHaveTextContent(
                'Added 1 of 3. Couldn’t add “Lesson 2”: Network down. Choose the unit’s add button again to add the rest.',
            );
            expect(h.copyBankActivity.mock.calls.map((c) => c[0])).toEqual(['u3', 'u2']);

            h.copyBankActivity.mockImplementation((id: string) => Promise.resolve(`copy-${id}`));
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add unit to my library: Ratios' }));
            expect(within(ratios()).getByRole('group')).toHaveTextContent('1 already there is skipped.');
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add 2' }));
            await within(ratios()).findByText('All in your library');
            expect(h.copyBankActivity.mock.calls.map((c) => c[0])).toEqual(['u3', 'u2', 'u2', 'u1']);
        });

        it('a filter narrows it, and the button says so', async () => {
            renderBank();
            await screen.findByText('Lesson 1');
            fireEvent.change(screen.getByLabelText('Search the Activity Bank'), { target: { value: 'Lesson 1' } });
            expect(within(ratios()).queryByRole('button', { name: /to my library: Ratios$/ })).toBeNull(); // one row: no unit button
            fireEvent.change(screen.getByLabelText('Search the Activity Bank'), { target: { value: 'ratios' } });
            expect(within(ratios()).getByRole('button', { name: 'Add these 3 to my library: Ratios' })).toBeInTheDocument();
        });

        it('under a filter, only the shown entries are added', async () => {
            h.listBank.mockResolvedValue([
                entry({ id: 'u1', title: 'Lesson 1', unit: 'Ratios', tags: ['core'] }),
                entry({ id: 'u2', title: 'Lesson 2', unit: 'Ratios' }),
                entry({ id: 'u3', title: 'Lesson 3', unit: 'Ratios', tags: ['core'] }),
            ]);
            renderBank();
            await screen.findByText('Lesson 1');
            fireEvent.change(screen.getByLabelText('Search the Activity Bank'), { target: { value: 'core' } });
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add these 2 to my library: Ratios' }));
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add 2' }));
            await within(ratios()).findByText(/Added 2 activities\./);
            expect(h.copyBankActivity.mock.calls.map((c) => c[0])).toEqual(['u3', 'u1']);
        });

        it('a filter that hides the unit drops its pending ask', async () => {
            renderBank();
            await screen.findByText('Lesson 1');
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add unit to my library: Ratios' }));
            const search = screen.getByLabelText('Search the Activity Bank');
            fireEvent.change(search, { target: { value: 'Alone' } });
            fireEvent.change(search, { target: { value: '' } });
            expect(within(ratios()).queryByRole('group')).toBeNull();
        });

        it('a copies read that lands after an add does not erase it', async () => {
            let resolveCopies: (m: Map<string, string>) => void = () => undefined;
            const late = new Promise<Map<string, string>>((r) => (resolveCopies = r));
            h.myCopiesPromise.current = late;
            renderBank();
            await screen.findByText('Lesson 1');
            fireEvent.click(screen.getByRole('button', { name: 'Add to my library: Lesson 1' }));
            await screen.findByRole('link', { name: 'Open your copy of Lesson 1' });
            resolveCopies(new Map([['u2', 'old-copy']]));
            await screen.findByRole('link', { name: /^In your library: .*Lesson 2/ });
            expect(screen.getByRole('link', { name: 'Open your copy of Lesson 1' })).toHaveAttribute(
                'href',
                '/activity/copy-u1',
            );
            h.myCopiesPromise.current = null;
        });

        it('a one-activity unit has no unit button (the row button is enough)', async () => {
            renderBank();
            await screen.findByText('Alone');
            const solo = screen.getByRole('region', { name: 'Y7 — Solo unit' });
            expect(within(solo).queryByRole('button', { name: /to my library: Solo unit$/ })).toBeNull();
        });

        it('while a unit is adding, every other add waits', async () => {
            let release: (v: string) => void = () => undefined;
            h.copyBankActivity.mockImplementation(() => new Promise<string>((r) => (release = r)));
            renderBank();
            await screen.findByText('Lesson 1');
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add unit to my library: Ratios' }));
            fireEvent.click(within(ratios()).getByRole('button', { name: 'Add 3' }));
            expect(within(ratios()).getByText('Adding 1 of 3…')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Add to my library: Alone' })).toBeDisabled();
            release('copy-u3');
            await within(ratios()).findByText('Adding 2 of 3…');
        });
    });
});
