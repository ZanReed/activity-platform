// @vitest-environment jsdom
// Mixed practice's teacher side (D43 slice 4), bound to rendered output: the
// panel (DM-3, 8, 9, 18, 20; W-6 labels; S4-5 scores) and "Who to see first"
// (W-2, 3, 4, 7, 8, 9; S4-1, S4-3). The server's shapes are the ones
// verify-0068 asserts the real functions return.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { MixedStudentRow, MixedSummary, WhoFirst as WhoFirstData } from '../lib/mixedTeacher';

const api = vi.hoisted(() => ({
    fetchMixedSummary: vi.fn(),
    fetchMixedStudents: vi.fn(),
    fetchWhoFirst: vi.fn(),
    fetchStudentRecent: vi.fn(),
    setMixedPractice: vi.fn(),
    setMixedSettings: vi.fn(),
}));
vi.mock('../lib/mixedTeacher', async (orig) => ({
    ...(await orig<typeof import('../lib/mixedTeacher')>()),
    ...api,
}));
const probe = vi.hoisted(() => ({ setClassYearEnd: vi.fn() }));
vi.mock('../lib/factProbe', async (orig) => ({ ...(await orig<typeof import('../lib/factProbe')>()), ...probe }));

import MixedPanel from '../practice/MixedPanel';
import WhoFirst, { WHO_FIRST_POLL_MS } from '../practice/WhoFirst';

const LONG = 'Identify the constant of proportionality k in y = kx from a table, graph, or context';

const summary = (over: Partial<MixedSummary> = {}): MixedSummary => ({
    on_at: '2027-02-10T00:00:00Z', reason: null, items_per_session: null, default_items: 6, graded: false,
    school_year_ends_on: '2099-12-17', has_bank: true, in_class: 28, practised_today: 18, practised_week: 24,
    skills: [
        { skill_id: 'rate.unit-rate', label: 'Compute a unit rate from a ratio', students_practising: 20, struggling: 3, first_tries_right: 61, first_tries: 90, skips: 4 },
        { skill_id: 'rate.constant-of-proportionality', label: LONG, students_practising: 9, struggling: 1, first_tries_right: 20, first_tries: 30, skips: 0 },
        { skill_id: 'rate.unlabelled', label: null, students_practising: 2, struggling: 0, first_tries_right: 4, first_tries: 4, skips: 0 },
    ],
    ...over,
});

const students: MixedStudentRow[] = [
    { student_id: 's1', name: 'Aroha Ngata', days_this_week: 3, struggling: [{ id: 'rate.unit-rate', label: 'Compute a unit rate from a ratio' }],
      latest_score: { right: 4, answered: 5, planned: 6, practice_day: '2027-02-14' }, score_in_progress: false },
    { student_id: 's2', name: 'Ben Carter', days_this_week: 1, struggling: [], latest_score: null, score_in_progress: true },
];

const who = (over: Partial<WhoFirstData> = {}): WhoFirstData => ({
    mixed_on: true, facts_on: true, started_today: 12,
    stuck: [{ student_id: 's1', name: 'Aroha Ngata', skills: [
        { id: 'rate.unit-rate', label: 'Compute a unit rate from a ratio' },
        { id: 'rate.constant-of-proportionality', label: LONG },
        { id: 'rate.proportional-graph', label: 'Recognise a proportional relationship as a line through the origin' },
    ] }],
    facts: [{ student_id: 's3', name: 'Ana Lee', families: ['Multiplication to 12 × 12'] }],
    same_mistake: [{ student_id: 's2', name: 'Ben Carter', mistakes: [
        { id: 'mis.rate.additive', label: 'Adds instead of scaling', skills: [{ id: 'rate.unit-rate', label: 'Compute a unit rate from a ratio' }] },
    ] }],
    everyone_else: 9,
    ...over,
});

beforeEach(() => {
    Object.values(api).forEach((f) => f.mockReset());
    probe.setClassYearEnd.mockReset().mockResolvedValue(undefined);
    api.fetchMixedSummary.mockResolvedValue(summary());
    api.fetchMixedStudents.mockResolvedValue(students);
    api.fetchWhoFirst.mockResolvedValue(who());
    api.setMixedPractice.mockResolvedValue({ on: true, on_at: '2027-02-10T00:00:00Z' });
    api.setMixedSettings.mockResolvedValue({});
});
afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

const panel = (onState = vi.fn()) => render(<MixedPanel classId="class-1" joinCode="ABC234" onState={onState} />);

describe('the mixed practice panel', () => {
    it('on: since when, the counts, and each skill by label (full label = name + tooltip), counts only (DM-3, DM-18, W-6)', async () => {
        const onState = vi.fn();
        const view = panel(onState);
        await screen.findByText(/Practised today 18 of 28/);
        expect(screen.getByTestId('ft-mixed-state').textContent).toBe('On since February 10');
        expect(onState).toHaveBeenCalledWith(true);
        for (const col of ['Skill', 'Students practising', 'Getting stuck', 'First tries right (last 5)', 'Skips']) {
            expect(screen.getByRole('columnheader', { name: col })).toBeTruthy();
        }
        const long = screen.getByRole('rowheader', { name: LONG });
        expect(long.querySelector('.ft-trunc')?.getAttribute('title')).toBe(LONG);
        expect(screen.getByRole('rowheader', { name: 'rate.unlabelled' })).toBeTruthy(); // the id, until mirrored
        expect(screen.getByText('61 of 90')).toBeTruthy();
        // DM-18: no student name in the page until the list is opened.
        expect(view.container.textContent).not.toContain('Aroha');
        expect(api.fetchMixedStudents).not.toHaveBeenCalled();
        expect(view.container.textContent).toContain('Students already practising can finish.');
    });

    it('"Show students" fetches and shows names, getting stuck on, and the latest FINISHED score; closing removes them (DM-20, S4-5)', async () => {
        api.fetchMixedSummary.mockResolvedValue(summary({ graded: true }));
        const view = panel();
        fireEvent.click(await screen.findByRole('button', { name: 'Show students' }));
        const table = await screen.findByTestId('ft-mixed-students');
        expect(api.fetchMixedStudents).toHaveBeenCalledWith('class-1');
        expect(table.textContent).toContain('Aroha Ngata');
        expect(table.textContent).toContain('Compute a unit rate from a ratio');
        expect(table.textContent).toContain('4 of 6');
        expect(table.textContent).toContain('In progress');
        expect(screen.getByRole('columnheader', { name: 'Getting stuck on' })).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Hide students' }));
        expect(view.container.textContent).not.toContain('Aroha');
    });

    it('an ungraded class shows no score column', async () => {
        panel();
        fireEvent.click(await screen.findByRole('button', { name: 'Show students' }));
        await screen.findByTestId('ft-mixed-students');
        expect(screen.queryByRole('columnheader', { name: 'Latest practice score' })).toBeNull();
    });

    it('says why it cannot switch on, in words, and asks for the end date here (DM-9)', async () => {
        api.fetchMixedSummary.mockResolvedValue(summary({ on_at: null, reason: 'school_year_end_missing', practised_week: 0, practised_today: 0, skills: [] }));
        panel();
        await screen.findByText(/Give the date this class’s school year ends/);
        expect((screen.getByRole('button', { name: 'Switch mixed practice on' }) as HTMLButtonElement).disabled).toBe(true);
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save the date' })));
        expect(probe.setClassYearEnd).toHaveBeenCalledWith('class-1', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
        cleanup();
        api.fetchMixedSummary.mockResolvedValue(summary({ on_at: null, reason: 'mixed_settings_not_mirrored', skills: [], practised_week: 0 }));
        panel();
        await screen.findByText(/The practice settings have not been loaded yet/);
    });

    it('no bank yet says so, and the switch still works (DM-9, MP-14); switching on re-reads', async () => {
        api.fetchMixedSummary.mockResolvedValue(summary({ on_at: null, has_bank: false, skills: [], practised_week: 0, practised_today: 0 }));
        panel();
        await screen.findByText('None of the skills your class has worked on has a practice bank yet.');
        const on = screen.getByRole('button', { name: 'Switch mixed practice on' }) as HTMLButtonElement;
        expect(on.disabled).toBe(false);
        await act(async () => fireEvent.click(on));
        expect(api.setMixedPractice).toHaveBeenCalledWith('class-1', true);
        expect(api.fetchMixedSummary).toHaveBeenCalledTimes(2);
    });

    it('on with no one yet: says so with the class link (DM-9)', async () => {
        api.fetchMixedSummary.mockResolvedValue(summary({ practised_week: 0, practised_today: 0, skills: [] }));
        panel();
        const line = await screen.findByTestId('ft-mixed-none-yet');
        expect(line.textContent).toContain('No one has practised yet. Students start from the class link');
        expect(line.textContent).toContain('/practice/ABC234');
    });

    it('settings: "Record a practice score" and items per session save through the server', async () => {
        panel();
        const graded = await screen.findByRole('checkbox', { name: 'Record a practice score' });
        await act(async () => fireEvent.click(graded));
        expect(api.setMixedSettings).toHaveBeenLastCalledWith('class-1', null, true);
        fireEvent.change(screen.getByRole('spinbutton', { name: 'Items per session' }), { target: { value: '8' } });
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save' })));
        expect(api.setMixedSettings).toHaveBeenLastCalledWith('class-1', 8, false);
    });

    it('an unsaved items number survives the score toggle\'s re-read (Fable review P3-1)', async () => {
        panel();
        const items = (await screen.findByRole('spinbutton', { name: 'Items per session' })) as HTMLInputElement;
        fireEvent.change(items, { target: { value: '8' } });
        await act(async () => fireEvent.click(screen.getByRole('checkbox', { name: 'Record a practice score' })));
        expect(api.fetchMixedSummary).toHaveBeenCalledTimes(2); // it did re-read
        expect(items.value).toBe('8');
        expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
    });
});

describe('"Who to see first"', () => {
    const list = () => render(<WhoFirst classId="class-1" />);

    it('closed: nothing fetched, no name in the page; open: the two groups in name order, rows apart; closed again: gone (W-2)', async () => {
        const view = list();
        expect(api.fetchWhoFirst).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Show the list' }));
        const stuck = await screen.findByRole('region', { name: 'Getting stuck on a skill' });
        // Ana (number facts) and Aroha (mixed) are separate rows, in name order.
        const rows = [...stuck.querySelectorAll('li')].map((li) => li.textContent);
        expect(rows).toEqual([
            'Ana LeeNumber facts: needs a strategy (Multiplication to 12 × 12)',
            'Aroha NgataCompute a unit rate from a ratio; ' + LONG + ' +1',
        ]);
        const same = screen.getByRole('region', { name: 'Same mistake twice' });
        expect(same.textContent).toContain('Ben Carter');
        // W-8: the misconception AND the skill it showed on (Fable review P2-2).
        expect(same.textContent).toContain('Same mistake: Adds instead of scaling (Compute a unit rate from a ratio)');
        expect(view.container.textContent).toContain('Everyone else (9)');
        fireEvent.click(screen.getByRole('button', { name: 'Hide the list' }));
        expect(view.container.textContent).not.toMatch(/Aroha|Ben|Ana/);
    });

    it('a row\'s accessible name carries every full label (W-6: truncated on screen only)', async () => {
        list();
        fireEvent.click(screen.getByRole('button', { name: 'Show the list' }));
        const row = await screen.findByRole('button', { name: /^Aroha Ngata:/ });
        expect(row.getAttribute('aria-label')).toBe(
            'Aroha Ngata: Compute a unit rate from a ratio; ' + LONG + '; Recognise a proportional relationship as a line through the origin',
        );
    });

    it('the states in words: not started today, and no one needs you (W-9)', async () => {
        api.fetchWhoFirst.mockResolvedValue(who({ started_today: 0, stuck: [], facts: [], same_mistake: [], everyone_else: 28 }));
        list();
        fireEvent.click(screen.getByRole('button', { name: 'Show the list' }));
        await screen.findByText('Students haven’t started today’s practice.');
        cleanup();
        api.fetchWhoFirst.mockResolvedValue(who({ stuck: [], facts: [], same_mistake: [], everyone_else: 12 }));
        list();
        fireEvent.click(screen.getByRole('button', { name: 'Show the list' }));
        await screen.findByText('No one needs you right now.');
    });

    it('re-reads every 5 s while open; a failed read keeps the list and says when it was last updated (W-7)', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        list();
        fireEvent.click(screen.getByRole('button', { name: 'Show the list' }));
        await screen.findByRole('region', { name: 'Getting stuck on a skill' });
        expect(api.fetchWhoFirst).toHaveBeenCalledTimes(1);
        api.fetchWhoFirst.mockRejectedValue(new Error('offline'));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(WHO_FIRST_POLL_MS);
        });
        expect(api.fetchWhoFirst).toHaveBeenCalledTimes(2);
        expect(screen.getByText(/^Not updated since /)).toBeTruthy();
        expect(screen.getByRole('region', { name: 'Getting stuck on a skill' }).textContent).toContain('Aroha');
        fireEvent.click(screen.getByRole('button', { name: 'Hide the list' }));
        await act(async () => {
            await vi.advanceTimersByTimeAsync(WHO_FIRST_POLL_MS * 3);
        });
        expect(api.fetchWhoFirst).toHaveBeenCalledTimes(2); // closed: no polling
    });

    it('a row opens the student\'s last first tries, with the full skill label and the mistake (W-8)', async () => {
        api.fetchStudentRecent.mockResolvedValue([
            { practice_day: '2027-02-15', kind: 'skill', skill_id: 'rate.unit-rate', skill_label: 'Compute a unit rate from a ratio', correct: false, skipped: false, mistakes: [{ id: 'mis.rate.additive', label: 'Adds instead of scaling' }] },
            { practice_day: '2027-02-14', kind: 'skill', skill_id: 'rate.constant-of-proportionality', skill_label: LONG, correct: true, skipped: false, mistakes: [] },
            { practice_day: '2027-02-13', kind: 'skill', skill_id: 'rate.unit-rate', skill_label: null, correct: false, skipped: true, mistakes: [] },
        ]);
        list();
        fireEvent.click(screen.getByRole('button', { name: 'Show the list' }));
        const row = await screen.findByRole('button', { name: /^Ben Carter:/ });
        expect(row.getAttribute('aria-expanded')).toBe('false');
        fireEvent.click(row);
        const drawer = await screen.findByTestId('ft-who-drawer');
        expect(api.fetchStudentRecent).toHaveBeenCalledWith('class-1', 's2');
        expect(row.getAttribute('aria-expanded')).toBe('true');
        expect(drawer.textContent).toContain('✕ Not right');
        expect(drawer.textContent).toContain('Adds instead of scaling');
        expect(drawer.textContent).toContain(LONG); // the FULL label in the drawer
        expect(drawer.textContent).toContain('✓ Right');
        expect(drawer.textContent).toContain('Skipped');
        expect(drawer.textContent).toContain('rate.unit-rate'); // the id until mirrored
    });

    it('a read that lands after the list was closed is dropped: reopening never shows it (Fable review P3-2)', async () => {
        let land: (v: WhoFirstData) => void = () => {};
        api.fetchWhoFirst.mockImplementationOnce(() => new Promise((r) => { land = r; }));
        const view = list();
        fireEvent.click(screen.getByRole('button', { name: 'Show the list' }));
        fireEvent.click(screen.getByRole('button', { name: 'Hide the list' }));
        await act(async () => land(who()));
        // Reopen with the next read held: the old list must not appear meanwhile.
        api.fetchWhoFirst.mockImplementationOnce(() => new Promise(() => {}));
        fireEvent.click(screen.getByRole('button', { name: 'Show the list' }));
        await act(async () => {});
        expect(view.container.textContent).not.toContain('Aroha');
        expect(screen.getByText('Loading…')).toBeTruthy();
    });

    it('number-facts rows open nothing (the drawer is mixed practice\'s)', async () => {
        list();
        fireEvent.click(screen.getByRole('button', { name: 'Show the list' }));
        await screen.findByRole('region', { name: 'Getting stuck on a skill' });
        expect(screen.queryByRole('button', { name: /^Ana Lee/ })).toBeNull();
    });
});

describe('W-9 / DM-13: the words a teacher never sees on these screens', () => {
    const BANNED = /\b(struggling|steps?|discrimination|behind|weak|at risk|slow)\b/i;
    const words = (root: HTMLElement) =>
        [root.textContent ?? '', ...[...root.querySelectorAll('[aria-label],[title]')].flatMap((e) => [e.getAttribute('aria-label') ?? '', e.getAttribute('title') ?? ''])].join(' ');

    it('the panel, open, closed, blocked; the list with every group and a drawer', async () => {
        api.fetchMixedSummary.mockResolvedValue(summary({ graded: true }));
        let view = panel();
        fireEvent.click(await screen.findByRole('button', { name: 'Show students' }));
        await screen.findByTestId('ft-mixed-students');
        expect(words(view.container)).not.toMatch(BANNED);
        cleanup();
        api.fetchMixedSummary.mockResolvedValue(summary({ on_at: null, reason: 'school_year_ended', has_bank: false, skills: [], practised_week: 0 }));
        view = panel();
        await screen.findByText(/school year has ended/);
        expect(words(view.container)).not.toMatch(BANNED);
        cleanup();
        api.fetchStudentRecent.mockResolvedValue([]);
        view = render(<WhoFirst classId="class-1" />);
        fireEvent.click(screen.getByRole('button', { name: 'Show the list' }));
        fireEvent.click(await screen.findByRole('button', { name: /^Ben Carter:/ }));
        await screen.findByText('No practice yet in this class.');
        expect(words(view.container)).not.toMatch(BANNED);
    });
});

it('W-10: no student route reaches the teacher reads (import graph from the student entries)', async () => {
    const { readFileSync, existsSync } = await import('node:fs');
    const { dirname, resolve } = await import('node:path');
    const root = resolve(__dirname, '..');
    const seen = new Set<string>();
    const reach = (file: string) => {
        if (seen.has(file)) return;
        seen.add(file);
        const text = readFileSync(file, 'utf8');
        for (const m of text.matchAll(/(?:import|from)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
            const base = resolve(dirname(file), m[1]!);
            const hit = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'].map((x) => base + x).find((p) => existsSync(p) && !p.endsWith('/'));
            if (hit && /\.(ts|tsx)$/.test(hit)) reach(hit);
        }
    };
    for (const entry of ['routes/FactsEntry.tsx', 'routes/StudentViewer.tsx', 'routes/Home.tsx', 'practice/MixedRunner.tsx']) {
        reach(resolve(root, entry));
    }
    const reached = [...seen].map((f) => f.slice(root.length + 1));
    expect(reached).toContain('practice/MixedRunner.tsx'); // anti-vacuity: the walk follows imports
    expect(reached.filter((f) => f === 'lib/mixedTeacher.ts' || f.startsWith('practice/WhoFirst') || f.startsWith('practice/MixedPanel'))).toEqual([]);
    for (const f of reached) {
        const text = readFileSync(resolve(root, f), 'utf8');
        // The constants module names every RPC; what matters is that no
        // student-reached file USES a teacher one.
        if (f !== 'lib/mixedPracticeRpc.ts') {
            expect(text, f).not.toMatch(/mixed_who_first|mixed_student_recent|mixed_class_students|mixed_class_summary/);
        }
        expect(text, f).not.toMatch(/MIXED_PRACTICE_RPC\.(whoFirst|studentRecent|students|summary|setOn|setSettings)/);
    }
});
