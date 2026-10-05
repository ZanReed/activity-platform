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
    setClassYearEnd: vi.fn(),
}));
vi.mock('../lib/factProbe', async (orig) => ({
    ...(await orig<typeof import('../lib/factProbe')>()),
    ...api,
}));
const sprintApi = vi.hoisted(() => ({ fetchSprintOverview: vi.fn(), setFactSprint: vi.fn() }));
vi.mock('../lib/factSprint', () => sprintApi);
vi.mock('../lib/classes', () => ({
    listClasses: vi.fn(async () => [{ id: 'class-1', name: '9 Maths B' }]),
}));

import FactsTeacher, { familySummary, guessYearEnd, LIVE_POLL_MS, yearLength, yearLine } from '../routes/FactsTeacher';

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
        { family_id: 'fact.mult.to-12', name: 'Multiplication to 12 × 12', counted: 5, right: 5, met: 5, group: 'fluent', status: 'met' },
        { family_id: 'fact.div.to-12', name: 'Division to 144 ÷ 12', counted: 5, right: 4, met: 2, group: 'slow', status: 'not_met' },
    ],
    ...extra,
});

const overview = (probes: ProbeOverview['probes'] = [], school_year_ends_on: string | null = '2099-12-17'): ProbeOverview => ({
    join_code: 'ABC234',
    mirrored: true,
    school_year_ends_on,
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
        auto_closed: false, state: 'open', item_count: 40, keep_until: '2028-01-16', pruned_at: null, ...over,
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

const sprintOverview = (extra: Record<string, unknown> = {}) => ({
    on: false, on_at: null, blocked_by: null, year_level: 7, join_code: 'ABC234',
    in_class: 28, practised_today: 0, practised_week: 0, families: [], students: [], ...extra,
});

beforeEach(() => {
    Object.values(api).forEach((f) => f.mockReset());
    sprintApi.fetchSprintOverview.mockReset().mockResolvedValue(sprintOverview({ blocked_by: 'no_closed_check' }));
    sprintApi.setFactSprint.mockReset().mockResolvedValue({ on: true, on_at: '2027-02-10T00:00:00Z' });
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

    it('asks for the school-year end when the class has none, prefilled with a guess, and saves it before opening (RP-1, RP-2)', async () => {
        api.fetchOverview.mockResolvedValue(overview([], null));
        api.setClassYearEnd.mockResolvedValue('x');
        api.openProbe.mockResolvedValue({ probe_id: 'probe-1' });
        page();
        const field = (await screen.findByLabelText(/When does this class’s school year end\?/)) as HTMLInputElement;
        const guess = guessYearEnd(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone);
        expect(field.value).toBe(guess);
        expect(screen.getByText(/removed 30 days after the school year ends\. The class result is kept\./)).toBeTruthy();
        fireEvent.change(field, { target: { value: '2099-12-01' } });
        const openButton = screen.getByRole('button', { name: 'Open the snapshot' }) as HTMLButtonElement;
        fireEvent.click(screen.getAllByRole('radio')[0]!);
        expect(openButton.disabled).toBe(true); // 2099 is past the 400-day limit
        const inRange = new Date();
        inRange.setDate(inRange.getDate() + 60);
        const iso = `${inRange.getFullYear()}-${String(inRange.getMonth() + 1).padStart(2, '0')}-${String(inRange.getDate()).padStart(2, '0')}`;
        fireEvent.change(field, { target: { value: iso } });
        expect(openButton.disabled).toBe(false);
        await act(async () => {
            fireEvent.click(openButton);
        });
        expect(api.setClassYearEnd).toHaveBeenCalledWith('class-1', iso);
        expect(api.openProbe).toHaveBeenCalledWith('class-1', 7);
        expect(api.setClassYearEnd.mock.invocationCallOrder[0]!).toBeLessThan(api.openProbe.mock.invocationCallOrder[0]!);
    });

    it('a class with an end date shows it and opens without asking again; Change asks', async () => {
        const soon = new Date();
        soon.setDate(soon.getDate() + 30);
        const iso = `${soon.getFullYear()}-${String(soon.getMonth() + 1).padStart(2, '0')}-${String(soon.getDate()).padStart(2, '0')}`;
        api.fetchOverview.mockResolvedValue(overview([], iso));
        api.openProbe.mockResolvedValue({ probe_id: 'probe-1' });
        page();
        const shown = await screen.findByTestId('ft-year-end');
        expect(shown.textContent).toContain(`school year ends on ${soon.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`);
        expect(screen.queryByLabelText(/When does this class’s school year end\?/)).toBeNull();
        fireEvent.click(screen.getAllByRole('radio')[0]!);
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Open the snapshot' }));
        });
        expect(api.setClassYearEnd).not.toHaveBeenCalled();
        expect(api.openProbe).toHaveBeenCalledWith('class-1', 7);
        fireEvent.click(screen.getByRole('button', { name: 'Change' }));
        expect((screen.getByLabelText(/When does this class’s school year end\?/) as HTMLInputElement).value).toBe(iso);
    });

    it('guesses mid-December in New Zealand and late June in the north, never a past day', () => {
        expect(guessYearEnd(new Date(2026, 9, 6), 'Pacific/Auckland')).toBe('2026-12-18');
        expect(guessYearEnd(new Date(2026, 11, 20), 'Pacific/Auckland')).toBe('2027-12-18');
        expect(guessYearEnd(new Date(2026, 9, 6), 'Australia/Sydney')).toBe('2026-12-18');
        expect(guessYearEnd(new Date(2026, 9, 6), 'America/New_York')).toBe('2027-06-30');
        expect(guessYearEnd(new Date(2026, 2, 1), 'Europe/London')).toBe('2026-06-30');
    });

    it('composes a year line when the registry gives none', () => {
        expect(yearLine({ year: 9, description: null, adds: ['Multiplying integers', 'Dividing integers'], families: 13, items: 65 }))
            .toBe('adds Multiplying integers, Dividing integers');
    });

    it('a long year says it runs in two parts, with each part\'s size (migration 0047)', () => {
        expect(yearLength({ year: 7, description: null, adds: [], families: 8, items: 40, parts: [40] })).toBe('40 facts, about 7 minutes');
        expect(yearLength({ year: 10, description: null, adds: [], families: 13, items: 98, parts: [42, 56] })).toBe(
            '98 facts in two parts (42 + 56), each about 10 minutes or less, with a break between',
        );
        // A database without 0047 sends no `parts`.
        expect(yearLength({ year: 8, description: null, adds: [], families: 11, items: 55 })).toBe('55 facts, about 10 minutes');
    });

    it('says what to do when the fact lists are not loaded', async () => {
        api.fetchOverview.mockResolvedValue({ ...overview(), mirrored: false, years: [] });
        page();
        expect(await screen.findByText(/The fact lists have not been loaded yet/)).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Open the snapshot' })).toBeNull();
    });
});

describe('the live view', () => {
    const open = overview([{ id: 'probe-1', year_level: 7, opened_at: '2027-02-08T21:00:00Z', closed_at: null, auto_closed: false, state: 'open', item_count: 40, verdict: null, keep_until: '2028-01-16', pruned_at: null }]);
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
    const closed = overview([{ id: 'probe-1', year_level: 7, opened_at: '2027-02-08T21:00:00Z', closed_at: '2027-02-09T02:00:00Z', auto_closed: false, state: 'closed', item_count: 40, verdict: 'below', keep_until: '2028-01-16', pruned_at: null }]);
    const roster = [
        student(1, {
            name: 'Aroha', rate: 9, typing_flag: true,
            families: [
                { family_id: 'fact.mult.to-12', name: 'Multiplication to 12 × 12', counted: 5, right: 5, met: 4, group: 'fluent', status: 'met' },
                { family_id: 'fact.div.to-12', name: 'Division to 144 ÷ 12', counted: 5, right: 3, met: 1, group: 'needs_strategy', status: 'not_met' },
            ],
        }),
        student(2, { name: 'Ben', group: 'fluent', rate: 31 }),
        student(3, { name: 'Caleb', status: 'in_progress', done: 14, group: 'slow', rate: 12 }),
        student(4, { name: 'Dina', status: 'not_started', has_rate: false, rate: null, group: null, done: 0, families: [] }),
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
        expect(verdict.textContent).toContain('Daily 5-minute facts practice is recommended.');
        expect(verdict.textContent).toContain('Class median: 14 correct a minute. Floor: 20. Based on 20 of 28 students; 3 had too little to measure.');
        expect(verdict.textContent).toContain('You can switch daily facts practice on for this class');
        expect(verdict.textContent).not.toMatch(/sprint/i);
        expect(verdict.textContent).toContain('screen reader or switch');
        expect(api.fetchResults).toHaveBeenCalledTimes(1);
    });

    it('who needs what is a table of fact families by label, with no name until asked (DR-22)', async () => {
        const { container } = await openClosed();
        for (const name of ['Aroha', 'Ben', 'Caleb', 'Dina']) expect(container.textContent).not.toContain(name);
        // Counts per family: Aroha, Ben and Caleb started; Dina did not.
        const division = screen.getByRole('row', { name: /^Division to 144 ÷ 12/ });
        const cells = () => Array.from(division.querySelectorAll('td')).map((td) => td.textContent);
        expect(screen.getAllByRole('columnheader').slice(0, 5).map((h) => h.textContent!.replace(/(Too many|Right, but|No action).*/, ''))).toEqual(
            ['Fact family', 'Needs strategy', 'Slow', 'Fluent', 'Not judged'],
        );
        expect(cells()).toEqual(['1', '2', '0', '0']);
        fireEvent.click(screen.getByRole('button', { name: 'Show names' }));
        expect(cells()[0]).toBe('1Aroha (3 of 5 right, 1 quick)');
        expect(cells()[1]).toContain('Ben (4 of 5 right, 2 quick)');
        expect(cells()[1]).toContain('Caleb');
        expect(container.textContent).not.toContain('Dina');
        fireEvent.click(screen.getByRole('button', { name: 'Hide names' }));
        expect(container.textContent).not.toContain('Aroha');
        expect(screen.getByText(/Each fact family is judged on its own questions/)).toBeTruthy();
    });

    it('lists each student with the run words, and a row opens to the fact families (their item 23)', async () => {
        await openClosed();
        fireEvent.click(screen.getByRole('button', { name: 'Show students' }));
        const rows = screen.getAllByRole('row').map((r) => r.textContent);
        expect(rows.find((r) => r!.startsWith('StudentPer minute'))).toBe('StudentPer minuteRightQuick and rightSkippedFact familiesRun');
        expect(rows.find((r) => r!.startsWith('Aroha'))).toContain('1 fluent · 1 needs strategy');
        expect(rows.find((r) => r!.startsWith('Ben'))).toContain('1 fluent · 1 slow');
        expect(rows.find((r) => r!.startsWith('Ben'))).toContain('Finished');
        expect(rows.find((r) => r!.startsWith('Caleb'))).toContain('Stopped at 14 of 40');
        expect(rows.find((r) => r!.startsWith('Dina'))).toContain('Did not start');
        expect(rows.find((r) => r!.startsWith('Aroha'))).toContain('Typing speed could not be fully allowed for');
        fireEvent.click(screen.getByRole('button', { name: 'Ben' }));
        expect(screen.getByText(/Multiplication to 12 × 12:/).parentElement!.textContent).toContain('Fluent (5 of 5 right, 5 quick and right)');
        expect(screen.getByText(/Division to 144 ÷ 12:/).parentElement!.textContent).toContain('Slow (4 of 5 right, 2 quick and right)');
        // Slowest first
        fireEvent.click(screen.getByRole('checkbox', { name: 'Slowest first' }));
        // (the students table is the second table on the page)
        const studentsTable = screen.getAllByRole('table')[1]!;
        const order = Array.from(studentsTable.querySelectorAll('tbody th[scope="row"]')).map((r) => r.textContent!.trim());
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
        expect(ok.container.querySelector('.ft-verdict')!.textContent).toContain('No daily facts practice is needed.');
        expect(ok.container.querySelector('.ft-verdict')!.textContent).not.toContain('not in this app yet');
    });

    it('summarises a student by family labels, and a row shows the whole-run accuracy (author finding 2026-10-05)', async () => {
        expect(familySummary(roster[0]!)).toBe('1 fluent · 1 needs strategy');
        await openClosed();
        fireEvent.click(screen.getByRole('button', { name: 'Show students' }));
        fireEvent.click(screen.getByRole('button', { name: 'Ben' }));
        expect(screen.getByText(/36 of 40 right \(90%\); 3 wrong or too slow to count; 1 skipped\./)).toBeTruthy();
    });

    it('a database without migration 0046 still renders: not met is shown as not met, never guessed', async () => {
        const old = student(7, {
            name: 'Old shape',
            families: [
                { family_id: 'fact.mult.to-12', name: 'Multiplication to 12 × 12', counted: 5, met: 5, status: 'met' },
                { family_id: 'fact.div.to-12', name: 'Division to 144 ÷ 12', counted: 5, met: 2, status: 'not_met' },
            ],
        });
        expect(familySummary(old)).toBe('1 fluent · 1 not met');
    });

    it('a closed snapshot says until when the students\' answers are kept (RP-6)', async () => {
        await openClosed();
        expect(screen.getByTestId('ft-keep-until').textContent).toMatch(
            /Students’ answers and timings are kept until (16 January 2028|January 16, 2028), then removed\. This class result is kept\./,
        );
    });

    it('after the prune: the class result, a removed notice, and NO student panel or name (RP-6, 0048)', async () => {
        api.fetchOverview.mockResolvedValue(
            overview([{ ...closed.probes[0]!, pruned_at: '2028-01-17T03:00:00Z' }]),
        );
        // The server sends no student rows for a pruned check.
        api.fetchResults.mockResolvedValue(
            results({ state: 'closed', closed_at: '2027-02-09T02:00:00Z', pruned_at: '2028-01-17T03:00:00Z' }, {}, []),
        );
        const { container } = render(
            <MemoryRouter initialEntries={['/classes/class-1/facts?snapshot=probe-1']}>
                <Routes>
                    <Route path="/classes/:classId/facts" element={<FactsTeacher />} />
                </Routes>
            </MemoryRouter>,
        );
        const notice = await screen.findByTestId('ft-pruned');
        expect(notice.textContent).toMatch(/removed on (17 January 2028|January 17, 2028)/);
        expect(screen.getByText('This class is below the fluency floor.')).toBeTruthy();
        expect(screen.queryByText('Who needs what')).toBeNull();
        expect(screen.queryByText('Each student')).toBeNull();
        expect(screen.queryByTestId('ft-keep-until')).toBeNull();
        expect(container.textContent).not.toMatch(/No one has answered yet|Did not start/);
    });

    it('the earlier list marks a snapshot whose student results were removed', async () => {
        api.fetchOverview.mockResolvedValue(overview([{ ...closed.probes[0]!, pruned_at: '2028-01-17T03:00:00Z' }]));
        page();
        expect(await screen.findByText(/Below the floor · student results removed/)).toBeTruthy();
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

// ---- the daily practice panel (D43 slice 2; SP-2, SP-4) -----------------------------
describe('the daily facts practice panel', () => {
    const closedOverview = overview([{ id: 'probe-1', year_level: 7, opened_at: '2027-02-08T21:00:00Z', closed_at: '2027-02-09T02:00:00Z', auto_closed: false, state: 'closed', item_count: 40, verdict: 'below', keep_until: '2028-01-16', pruned_at: null }]);
    const ON = sprintOverview({
        on: true, on_at: '2027-02-10T00:00:00Z', practised_today: 12, practised_week: 20,
        families: [
            { family_id: 'fact.mult.to-12', name: 'Multiplication to 12 × 12', strategy: 5, practising: 14, fluent: 9 },
            { family_id: 'fact.div.to-12', name: 'Division to 144 ÷ 12', strategy: 9, practising: 12, fluent: 7 },
        ],
        students: [
            { student_id: 's1', name: 'Aroha Ngata', days_practised: 4, last_day: '2027-02-15', strategy: 1, practising: 1, fluent: 0 },
            { student_id: 's2', name: 'Ben Carter', days_practised: 0, last_day: null, strategy: 0, practising: 2, fluent: 0 },
        ],
    });

    it('before a snapshot: it says to run one, and cannot be switched on (SP-2)', async () => {
        api.fetchOverview.mockResolvedValue(overview());
        page();
        const panel = await screen.findByTestId('ft-sprint');
        expect(panel.textContent).toContain('Run a snapshot with this class first.');
        expect((screen.getByRole('button', { name: 'Switch daily practice on' }) as HTMLButtonElement).disabled).toBe(true);
    });

    it('off and allowed: says when the last snapshot recommends it; switching on asks the server and re-reads', async () => {
        api.fetchOverview.mockResolvedValue(closedOverview);
        sprintApi.fetchSprintOverview.mockResolvedValueOnce(sprintOverview()).mockResolvedValue(ON);
        page();
        const state = await screen.findByTestId('ft-sprint-state');
        expect(state.textContent).toBe('Off. The last snapshot recommends switching it on.');
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Switch daily practice on' }));
        });
        expect(sprintApi.setFactSprint).toHaveBeenCalledWith('class-1', true);
        await waitFor(() => expect(screen.getByTestId('ft-sprint-state').textContent).toMatch(/^On since /));
        expect(screen.getByTestId('ft-sprint-counts').textContent).toBe('Practised today 12 of 28 · In the last 7 days 20');
    });

    it('on: each fact family by state, and students only behind the disclosure, with no ranking or times (SP-4)', async () => {
        api.fetchOverview.mockResolvedValue(closedOverview);
        sprintApi.fetchSprintOverview.mockResolvedValue(ON);
        const { container } = page();
        const panel = await screen.findByTestId('ft-sprint');
        const row = screen.getByRole('row', { name: /Division to 144 ÷ 12/ });
        expect([...row.querySelectorAll('td')].map((td) => td.textContent)).toEqual(['9', '12', '7']);
        expect(panel.textContent).toContain('/facts/ABC234');
        expect(panel.textContent).not.toContain('Aroha Ngata');
        fireEvent.click(screen.getByRole('button', { name: 'Show students' }));
        const student = screen.getByRole('row', { name: /Aroha Ngata/ });
        expect([...student.querySelectorAll('td')].map((td) => td.textContent)).toEqual(['4', expect.stringMatching(/15/), '1', '1', '0']);
        expect(screen.getByRole('row', { name: /Ben Carter/ }).textContent).toContain('Not yet');
        expect(container.textContent).not.toMatch(/sprint|probe|per minute.*Aroha/i);
        fireEvent.click(screen.getByRole('button', { name: 'Switch daily practice off' }));
        await waitFor(() => expect(sprintApi.setFactSprint).toHaveBeenCalledWith('class-1', false));
    });

    it('a class with snapshots but no school-year end is asked for the date in the panel', async () => {
        api.fetchOverview.mockResolvedValue(closedOverview);
        api.setClassYearEnd.mockResolvedValue('x');
        sprintApi.fetchSprintOverview
            .mockResolvedValueOnce(sprintOverview({ blocked_by: 'school_year_end_missing' }))
            .mockResolvedValue(sprintOverview());
        page();
        const panel = await screen.findByTestId('ft-sprint');
        expect(panel.textContent).toContain('Give the date this class’s school year ends');
        expect((screen.getByRole('button', { name: 'Switch daily practice on' }) as HTMLButtonElement).disabled).toBe(true);
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Save the date' }));
        });
        expect(api.setClassYearEnd).toHaveBeenCalledWith('class-1', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
        await waitFor(() =>
            expect((screen.getByRole('button', { name: 'Switch daily practice on' }) as HTMLButtonElement).disabled).toBe(false));
    });
});
