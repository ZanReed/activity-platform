// @vitest-environment jsdom
// The teacher's number-facts page (D43 slice 1; DR-17 to DR-23, S-4, S-5),
// bound to rendered output. The server's numbers are mocked in the exact shape
// fact_probe_results / fact_probe_overview return (verify-0045 asserts those
// shapes against the real functions).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import type { ProbeOverview, ProbeResults, StudentRow } from '../lib/factProbe';

const api = vi.hoisted(() => ({
    fetchOverview: vi.fn(),
    fetchResults: vi.fn(),
    openProbe: vi.fn(),
    closeProbe: vi.fn(),
}));
vi.mock('../lib/factProbe', async (orig) => ({
    ...(await orig<typeof import('../lib/factProbe')>()),
    ...api,
}));
vi.mock('../lib/classes', () => ({
    listClasses: vi.fn(async () => [{ id: 'class-1', name: '9 Maths B' }]),
}));

import FactsTeacher, { groupReason, LIVE_POLL_MS, yearLine } from '../routes/FactsTeacher';

const student = (i: number, extra: Partial<StudentRow> = {}): StudentRow => ({
    student_id: `s${i}`,
    name: `Student ${i}`,
    is_member: true,
    status: 'finished',
    done: 40,
    has_rate: true,
    rate: 20,
    right: 36,
    met: 30,
    skipped: 1,
    not_counted: 0,
    counted: 40,
    group: 'fluent',
    typing_flag: false,
    families: [
        { family_id: 'fact.mult.to-12', name: 'Multiplication to 12 × 12', counted: 5, met: 5, status: 'met' },
        { family_id: 'fact.div.to-12', name: 'Division to 144 ÷ 12', counted: 5, met: 2, status: 'not_met' },
    ],
    ...extra,
});

const overview = (probes: ProbeOverview['probes'] = []): ProbeOverview => ({
    join_code: 'ABC234',
    mirrored: true,
    years: [
        { year: 7, description: 'Times tables, squares and cubes', adds: ['Multiplication'], families: 8, items: 40 },
        { year: 8, description: 'adds cube roots', adds: ['Cube roots'], families: 11, items: 55 },
        { year: 10, description: null, adds: [], families: 13, items: 65 },
    ],
    probes,
});

const results = (over: Partial<ProbeResults['probe']>, cls: Partial<ProbeResults['class']>, students: StudentRow[]): ProbeResults => ({
    probe: {
        id: 'probe-1', class_id: 'class-1', join_code: 'ABC234', year_level: 7,
        opened_at: '2027-02-08T21:00:00Z', closes_at: '2027-02-15T21:00:00Z', closed_at: null,
        auto_closed: false, state: 'open', item_count: 40, ...over,
    },
    class: {
        in_class: 28, started: 23, finished: 17, with_rate: 20, left_out: 3, median_rate: 14,
        floor: 20, min_students: 5, verdict: 'below',
        groups: { fluent: 6, slow: 9, needs_strategy: 5 }, ...cls,
    },
    students,
});

function page() {
    return render(
        <MemoryRouter initialEntries={['/classes/class-1/facts']}>
            <Routes>
                <Route path="/classes/:classId/facts" element={<FactsTeacher />} />
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    Object.values(api).forEach((f) => f.mockReset());
});
afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('opening a snapshot', () => {
    it('lists one line per year, picks nothing by default, and opens the year chosen (DR-18)', async () => {
        api.fetchOverview.mockResolvedValue(overview());
        api.openProbe.mockResolvedValue({ probe_id: 'probe-1' });
        const { container } = page();
        await screen.findByText('Run a snapshot with this class');
        const radios = screen.getAllByRole('radio') as HTMLInputElement[];
        expect(radios).toHaveLength(3);
        expect(radios.some((r) => r.checked)).toBe(false);
        const openButton = screen.getByRole('button', { name: 'Open the snapshot' }) as HTMLButtonElement;
        expect(openButton.disabled).toBe(true);
        expect(screen.getByText(/Times tables, squares and cubes\. 40 facts, about 7 minutes\./)).toBeTruthy();
        expect(screen.getByText(/adds nothing new: the same facts as the year before\. 65 facts/)).toBeTruthy();
        expect(screen.getByText('No snapshot has been run with this class.')).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Try the demo first' }).getAttribute('href')).toBe('/facts/demo');
        fireEvent.click(radios[1]!);
        expect(openButton.disabled).toBe(false);
        await act(async () => {
            fireEvent.click(openButton);
        });
        expect(api.openProbe).toHaveBeenCalledWith('class-1', 8);
        expect(container.textContent).not.toMatch(/probe/i);
    });

    it('composes a year line when the registry gives none', () => {
        expect(yearLine({ year: 9, description: null, adds: ['Multiplying integers', 'Dividing integers'], families: 13, items: 65 }))
            .toBe('adds Multiplying integers, Dividing integers');
    });

    it('says what to do when the fact lists are not loaded', async () => {
        api.fetchOverview.mockResolvedValue({ ...overview(), mirrored: false, years: [] });
        page();
        expect(await screen.findByText(/The fact lists have not been loaded yet/)).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Open the snapshot' })).toBeNull();
    });
});

describe('the live view', () => {
    const open = overview([{ id: 'probe-1', year_level: 7, opened_at: '2027-02-08T21:00:00Z', closed_at: null, auto_closed: false, state: 'open', item_count: 40, verdict: null }]);
    const roster = [student(1), student(2, { status: 'not_started', has_rate: false, rate: null, group: null, done: 0 })];

    it('shows the typeable link and the three counts, with names hidden until asked (DR-19)', async () => {
        api.fetchOverview.mockResolvedValue(open);
        api.fetchResults.mockResolvedValue(results({}, {}, roster));
        const { container } = page();
        await screen.findByText('Progress');
        expect(container.querySelector('.ft-linkbig')!.textContent).toMatch(/\/facts\/ABC234$/);
        expect(container.querySelector('.ft-linkbig')!.textContent).not.toMatch(/^https?:/);
        expect(container.querySelector('.ft-counts')!.textContent).toBe('In class 28 · Started 23 · Finished 17');
        expect(container.textContent).not.toContain('Student 2');
        fireEvent.click(screen.getByRole('button', { name: 'Show who has not started' }));
        expect(screen.getByText('Student 2')).toBeTruthy();
        expect(container.textContent).not.toContain('Student 1');
    });

    it('the full-screen view shows only the link and the counts', async () => {
        api.fetchOverview.mockResolvedValue(open);
        api.fetchResults.mockResolvedValue(results({}, {}, roster));
        const { container } = page();
        await screen.findByText('Progress');
        fireEvent.click(screen.getByRole('button', { name: 'Full screen for the board' }));
        const projector = container.querySelector('.ft-projector')!;
        expect(projector.textContent).toContain('/facts/ABC234');
        expect(projector.textContent).toContain('In class 28 · Started 23 · Finished 17');
        expect(screen.queryByRole('button', { name: 'Show who has not started' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Close the snapshot…' })).toBeNull();
    });

    it('polls every 5 seconds; a failed poll keeps the last numbers and says so', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        api.fetchOverview.mockResolvedValue(open);
        api.fetchResults.mockResolvedValueOnce(results({}, {}, roster));
        const { container } = page();
        await screen.findByText('Progress');
        api.fetchResults.mockResolvedValueOnce(results({}, { started: 24, finished: 19 }, roster));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(LIVE_POLL_MS + 50);
        });
        expect(container.querySelector('.ft-counts')!.textContent).toBe('In class 28 · Started 24 · Finished 19');
        api.fetchResults.mockRejectedValueOnce(new Error('fetch failed'));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(LIVE_POLL_MS + 50);
        });
        expect(container.querySelector('.ft-counts')!.textContent).toBe('In class 28 · Started 24 · Finished 19');
        expect(screen.getByText(/refresh\. Retrying\./)).toBeTruthy();
    });

    it('closing asks first, says who is still working, and defaults to keeping it open (DR-20)', async () => {
        api.fetchOverview.mockResolvedValue(open);
        api.fetchResults.mockResolvedValue(results({}, {}, roster));
        api.closeProbe.mockResolvedValue(results({}, {}, roster).class);
        page();
        await screen.findByText('Progress');
        fireEvent.click(screen.getByRole('button', { name: 'Close the snapshot…' }));
        const dialog = screen.getByRole('alertdialog');
        expect(dialog.textContent).toContain('6 students are still working');
        expect(dialog.textContent).toContain('It cannot be reopened');
        expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Keep it open' }));
        expect(api.closeProbe).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Keep it open' }));
        expect(screen.queryByRole('alertdialog')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Close the snapshot…' }));
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Close it' }));
        });
        expect(api.closeProbe).toHaveBeenCalledWith('probe-1');
    });

    it('after closing, the page shows that snapshot\'s results, not the open screen', async () => {
        api.fetchOverview.mockResolvedValue(open);
        api.fetchResults.mockResolvedValue(results({}, {}, roster));
        api.closeProbe.mockImplementation(async () => {
            // From here the server reports it closed, in both reads.
            api.fetchOverview.mockResolvedValue(
                overview([{ ...open.probes[0]!, state: 'closed', closed_at: '2027-02-09T02:00:00Z', verdict: 'below' }]),
            );
            api.fetchResults.mockResolvedValue(results({ state: 'closed', closed_at: '2027-02-09T02:00:00Z' }, {}, roster));
            return results({}, {}, roster).class;
        });
        page();
        await screen.findByText('Progress');
        fireEvent.click(screen.getByRole('button', { name: 'Close the snapshot…' }));
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Close it' }));
        });
        expect(await screen.findByText('Who needs what')).toBeTruthy();
        expect(screen.getByText('This class is below the fluency floor.', { exact: false })).toBeTruthy();
        expect(screen.queryByText('Run a snapshot with this class')).toBeNull();
    });
});

describe('the results', () => {
    const closed = overview([{ id: 'probe-1', year_level: 7, opened_at: '2027-02-08T21:00:00Z', closed_at: '2027-02-09T02:00:00Z', auto_closed: false, state: 'closed', item_count: 40, verdict: 'below' }]);
    const roster = [
        student(1, { name: 'Aroha', group: 'needs_strategy', rate: 9, typing_flag: true }),
        student(2, { name: 'Ben', group: 'fluent', rate: 31 }),
        student(3, { name: 'Caleb', status: 'in_progress', done: 14, group: 'slow', rate: 12 }),
        student(4, { name: 'Dina', status: 'not_started', has_rate: false, rate: null, group: null, done: 0 }),
    ];

    async function openClosed(cls: Partial<ProbeResults['class']> = {}, over: Partial<ProbeResults['probe']> = {}) {
        api.fetchOverview.mockResolvedValue(closed);
        api.fetchResults.mockResolvedValue(results({ state: 'closed', closed_at: '2027-02-09T02:00:00Z', ...over }, cls, roster));
        const view = render(
            <MemoryRouter initialEntries={['/classes/class-1/facts?snapshot=probe-1']}>
                <Routes>
                    <Route path="/classes/:classId/facts" element={<FactsTeacher />} />
                </Routes>
            </MemoryRouter>,
        );
        await screen.findByText('Who needs what');
        return view;
    }

    it('leads with the verdict as a sentence, the two numbers, who was left out and the stopgap (DR-21)', async () => {
        const { container } = await openClosed();
        const verdict = container.querySelector('.ft-verdict')!;
        expect(verdict.getAttribute('data-verdict')).toBe('below');
        expect(verdict.textContent).toContain('This class is below the fluency floor.');
        expect(verdict.textContent).toContain('A daily 5-minute facts sprint is recommended.');
        expect(verdict.textContent).toContain('Class median: 14 correct a minute. Floor: 20. Based on 20 of 28 students; 3 had too little to measure.');
        expect(verdict.textContent).toContain('The fluency sprint is not in this app yet.');
        expect(verdict.textContent).toContain('screen reader or switch');
        expect(api.fetchResults).toHaveBeenCalledTimes(1);
    });

    it('no student name is in the page until a disclosure is opened (DR-22)', async () => {
        const { container } = await openClosed();
        for (const name of ['Aroha', 'Ben', 'Caleb', 'Dina']) expect(container.textContent).not.toContain(name);
        fireEvent.click(screen.getByRole('button', { name: 'Show names' }));
        const needs = screen.getByRole('region', { name: 'Needs strategy' });
        expect(needs.textContent).toContain('Strategy first');
        expect(needs.textContent).toContain('Aroha');
        expect(needs.textContent).toContain('typing speed could not be fully allowed for');
        expect(screen.getByRole('region', { name: 'Fluent' }).textContent).toContain('Ben');
        fireEvent.click(screen.getByRole('button', { name: 'Hide names' }));
        expect(container.textContent).not.toContain('Aroha');
    });

    it('lists each student with the run words, and a row opens to the fact families (their item 23)', async () => {
        await openClosed();
        fireEvent.click(screen.getByRole('button', { name: 'Show students' }));
        const rows = screen.getAllByRole('row').map((r) => r.textContent);
        expect(rows[0]).toBe('StudentPer minuteRightQuick and rightSkippedRun');
        expect(rows.find((r) => r!.startsWith('Ben'))).toContain('Finished');
        expect(rows.find((r) => r!.startsWith('Caleb'))).toContain('Stopped at 14 of 40');
        expect(rows.find((r) => r!.startsWith('Dina'))).toContain('Did not start');
        expect(rows.find((r) => r!.startsWith('Aroha'))).toContain('Typing speed could not be fully allowed for');
        fireEvent.click(screen.getByRole('button', { name: 'Ben' }));
        expect(screen.getByText(/Multiplication to 12 × 12:/).parentElement!.textContent).toContain('Met');
        expect(screen.getByText(/Division to 144 ÷ 12:/).parentElement!.textContent).toContain('Not met');
        // Slowest first
        fireEvent.click(screen.getByRole('checkbox', { name: 'Slowest first' }));
        const order = screen.getAllByRole('rowheader').map((r) => r.textContent!.trim());
        expect(order.slice(0, 3)).toEqual(['Aroha', 'Caleb', 'Ben']);
    });

    it('says so when there are too few results, when nobody started, and when it closed by itself', async () => {
        const few = await openClosed({ verdict: 'not_enough', with_rate: 3, median_rate: null });
        expect(few.container.querySelector('.ft-verdict')!.textContent).toContain(
            'Not enough results to judge the class.3 students have a result; 5 are needed.',
        );
        cleanup();
        const none = await openClosed({ verdict: 'not_enough', started: 0, with_rate: 0, median_rate: null }, { auto_closed: true });
        expect(none.container.querySelector('.ft-verdict')!.textContent).toContain('No one started this snapshot.');
        expect(none.container.textContent).toMatch(/closed automatically on/);
        cleanup();
        const ok = await openClosed({ verdict: 'at_or_above', median_rate: 24 });
        expect(ok.container.querySelector('.ft-verdict')!.textContent).toContain('No daily sprint is needed.');
        expect(ok.container.querySelector('.ft-verdict')!.textContent).not.toContain('not in this app yet');
    });

    it('says WHY a student is in their group, in their own numbers (author finding 2026-10-05)', async () => {
        // The live case: 61 a minute, 55 quick and right, but 58 of 65 right —
        // 89%, so "needs strategy". The page must show the 89%.
        const fast = student(9, { name: 'Ashton', group: 'needs_strategy', rate: 61.63, right: 58, met: 55, skipped: 0, counted: 65 });
        expect(groupReason(fast)).toBe('58 of 65 right (89%)');
        expect(groupReason(student(1, { group: 'fluent', right: 36, met: 30, counted: 40 }))).toBe(
            '36 of 40 right (90%), 30 quick and right (75%)',
        );
        await openClosed();
        fireEvent.click(screen.getByRole('button', { name: 'Show names' }));
        const needs = screen.getByRole('region', { name: 'Needs strategy' });
        expect(needs.textContent).toContain('36 of 40 right (90%)');
        expect(screen.getByText(/Accuracy comes first/)).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Show students' }));
        fireEvent.click(screen.getByRole('button', { name: 'Ben' }));
        expect(screen.getByText(/36 of 40 right \(90%\); 3 wrong or too slow to count; 1 skipped\./)).toBeTruthy();
    });

    it('never polls a closed snapshot', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        await openClosed();
        await act(async () => {
            await vi.advanceTimersByTimeAsync(LIVE_POLL_MS * 3);
        });
        await waitFor(() => expect(api.fetchResults).toHaveBeenCalledTimes(1));
    });
});
