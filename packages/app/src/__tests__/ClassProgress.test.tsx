// @vitest-environment jsdom
// The class progress pages (0061; class-progress-view.md CP-2, CP-5, CP-7,
// CP-8, DR-1, DR-4, DR-7, DR-8, DR-10, DR-11), bound to rendered output. The
// RPC payloads are typed by the lib's own shapes, which verify-0061 asserts
// against the real functions; SQL correctness is verify-0061's, not this file's.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import type {
    ActivityProgress,
    ClassMisconceptions,
    ClassProgress as Grid,
    ProgressCell,
} from '../lib/classProgress';

const api = vi.hoisted(() => ({
    fetchClassProgress: vi.fn(),
    fetchActivityProgress: vi.fn(),
    fetchMisconceptions: vi.fn(),
    fetchStudentWork: vi.fn(),
    fetchVersionContents: vi.fn(async () => new Map()),
    fetchMisconceptionDescriptions: vi.fn(async () => new Map()),
}));
vi.mock('../lib/classProgress', async (orig) => ({
    ...(await orig<typeof import('../lib/classProgress')>()),
    ...api,
}));

import ClassProgress from '../routes/ClassProgress';
import ActivityProgressPage from '../routes/ActivityProgress';
import ActivityResponses from '../routes/ActivityResponses';
import {
    cellStatus,
    leastDoneFirst,
    pseudonyms,
    safeProgressPath,
    tally,
    HIDE_NAMES_KEY,
    LEAST_DONE_KEY,
} from '../lib/classProgress';

const A1 = 'act-1';
const A2 = 'act-2';
const cell = (student_id: string, activity_id: string, extra: Partial<ProgressCell>): ProgressCell => ({
    student_id, activity_id, current_version_id: `${activity_id}-v2`,
    sections_total: 4, sections_checked: 4, earlier_checked: false, earlier_done: false,
    shown_version_id: `${activity_id}-v2`, shown_total: 4, shown_checked: 4,
    correct: 4, marked: 5, to_grade: 0, last_checked_at: '2027-02-09T09:41:00Z',
    ...extra,
});

const grid = (over: Partial<Grid> = {}): Grid => ({
    class: { id: 'class-1', name: '9 Maths B', join_code: 'ABC234' },
    students: [
        { student_id: 's1', name: 'Ana Lee' },
        { student_id: 's2', name: 'Ben Carter' },
        { student_id: 's3', name: 'Caleb Wu' },
    ],
    activities: [
        { activity_id: A1, title: 'Fractions 2', current_version_id: `${A1}-v2`, added_at: '2027-02-08T00:00:00Z' },
        { activity_id: A2, title: 'Decimals', current_version_id: `${A2}-v2`, added_at: '2027-02-01T00:00:00Z' },
    ],
    cells: [
        cell('s1', A1, { to_grade: 3 }),
        cell('s1', A2, { sections_checked: 0, sections_total: null, earlier_checked: true, shown_version_id: `${A2}-v1`, shown_total: 5, shown_checked: 2 }),
        cell('s2', A1, { sections_checked: 2, shown_checked: 2 }),
        cell('s2', A2, { sections_total: null, sections_checked: 1, shown_total: null, shown_checked: 1 }),
    ],
    last_check_at: '2027-02-09T09:41:00Z',
    ...over,
});

const noMis: ClassMisconceptions = { misconceptions: [], wrong_answers: [] };

function classPage(path = '/classes/class-1/progress') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/classes/:classId/progress" element={<ClassProgress />}>
                    <Route path=":studentId/:activityId" element={<p>panel</p>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    window.localStorage.clear();
    api.fetchMisconceptions.mockResolvedValue(noMis);
});
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('the class grid (CP-2, DR-1, DR-9, DR-10)', () => {
    it('shows each status in glyph + words, with full accessible names', async () => {
        api.fetchClassProgress.mockResolvedValue(grid());
        classPage();
        const done = await screen.findByRole('link', { name: 'Ana Lee, Fractions 2: done, 80 percent' });
        expect(done.textContent).toContain('Done 80%');
        expect(screen.getByRole('link', { name: 'Ana Lee, Decimals: started, 2 of 5 sections, on an older version' }).textContent).toContain('older');
        expect(screen.getByRole('link', { name: 'Ben Carter, Fractions 2: started, 2 of 4 sections' }).textContent).toContain('2/4');
        const unknown = screen.getByRole('link', { name: 'Ben Carter, Decimals: started, total not recorded' });
        expect(unknown.textContent).toContain('Started · ?');
        expect(unknown.getAttribute('title')).toBe('Checked before progress totals were recorded');
        // A cell without work is text, not a control.
        const caleb = screen.getByRole('row', { name: /Caleb Wu/ });
        expect(within(caleb).queryAllByRole('link')).toHaveLength(0);
        expect(within(caleb).getAllByText('not started')).toHaveLength(2);
    });

    it('leads with counts: three stats, column tallies, row totals', async () => {
        api.fetchClassProgress.mockResolvedValue(grid());
        classPage();
        await screen.findByText('Activities assigned');
        expect(screen.getByRole('columnheader', { name: /Fractions 2/ }).textContent).toContain(
            '1 done · 1 started · 1 not started',
        );
        expect(screen.getByRole('columnheader', { name: /Decimals/ }).textContent).toContain(
            '0 done · 2 started · 1 not started',
        );
        expect(within(screen.getByRole('row', { name: /Ana Lee/ })).getByText('done 1 of 2')).toBeTruthy();
    });

    it('"N to grade" names its activity and links to Responses with a ?from= back (CP-7, DR-8)', async () => {
        api.fetchClassProgress.mockResolvedValue(grid());
        classPage();
        const chip = await screen.findByRole('link', { name: '3 to grade in Fractions 2' });
        expect(chip.getAttribute('href')).toBe(
            `/activity/${A1}/responses?from=${encodeURIComponent('/classes/class-1/progress')}`,
        );
    });

    it('Hide names takes every name out of the DOM, titles and link names included (CP-5, DR-10)', async () => {
        api.fetchClassProgress.mockResolvedValue(grid());
        api.fetchMisconceptions.mockResolvedValue({
            misconceptions: [{ id: 'mis.x', description: 'Adds the tops', ever: 1, still: 1,
                activities: [{ activity_id: A1, title: 'Fractions 2' }],
                students: [{ student_id: 's2', name: 'Ben Carter', activity_id: A1, still: true }] }],
            wrong_answers: [],
        });
        const { container } = classPage();
        await screen.findByRole('link', { name: /Ana Lee, Fractions 2/ });
        const sw = screen.getByRole('switch', { name: 'Hide names' });
        expect(sw.getAttribute('aria-checked')).toBe('false');
        fireEvent.click(sw);
        expect(sw.getAttribute('aria-checked')).toBe('true');
        fireEvent.click(screen.getByRole('button', { name: /Adds the tops/ }));
        for (const name of ['Ana Lee', 'Ben Carter', 'Caleb Wu']) {
            expect(container.innerHTML).not.toContain(name);
        }
        expect(screen.getByRole('link', { name: 'Student 1, Fractions 2: done, 80 percent' })).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Student 2 · Fractions 2' })).toBeTruthy();
        expect(window.localStorage.getItem(HIDE_NAMES_KEY)).toBe('1');
    });

    it('remembers Hide names on this device', async () => {
        window.localStorage.setItem(HIDE_NAMES_KEY, '1');
        api.fetchClassProgress.mockResolvedValue(grid());
        const { container } = classPage();
        await screen.findByRole('link', { name: /Student 1, Fractions 2/ });
        expect(container.innerHTML).not.toContain('Ana Lee');
    });

    it('Least done first: fewest done, then fewest started, then name (DR-7)', async () => {
        api.fetchClassProgress.mockResolvedValue(grid());
        classPage();
        await screen.findByRole('link', { name: /Ana Lee, Fractions 2/ });
        const order = () => screen.getAllByRole('rowheader').map((th) => th.textContent);
        expect(order()).toEqual(['Ana Lee', 'Ben Carter', 'Caleb Wu']);
        fireEvent.click(screen.getByRole('checkbox', { name: 'Least done first' }));
        expect(order()).toEqual(['Caleb Wu', 'Ben Carter', 'Ana Lee']);
        expect(window.localStorage.getItem(LEAST_DONE_KEY)).toBe('1');
    });
});

describe('the nine states (DR-4)', () => {
    it('1. loading', () => {
        api.fetchClassProgress.mockReturnValue(new Promise(() => {}));
        classPage();
        expect(screen.getByRole('status').textContent).toBe('Loading…');
    });

    it('2. a failed first load says so and offers Try again', async () => {
        api.fetchClassProgress.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(grid());
        classPage();
        expect((await screen.findByRole('alert')).textContent).toContain("Couldn't load progress");
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
        expect(await screen.findByRole('link', { name: /Ana Lee, Fractions 2/ })).toBeTruthy();
    });

    it('3. a failed refresh keeps the grid and says what it is showing', async () => {
        api.fetchClassProgress.mockResolvedValueOnce(grid()).mockRejectedValueOnce(new Error('boom'));
        classPage();
        await screen.findByRole('link', { name: /Ana Lee, Fractions 2/ });
        fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
        await waitFor(() => expect(screen.getByText(/Couldn't refresh · showing/)).toBeTruthy());
        expect(screen.getByRole('link', { name: /Ana Lee, Fractions 2/ })).toBeTruthy();
    });

    it('4. no students: the join code with Copy', async () => {
        api.fetchClassProgress.mockResolvedValue(grid({ students: [], cells: [] }));
        classPage();
        expect(await screen.findByText('No students yet')).toBeTruthy();
        expect(screen.getByText('ABC234')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy();
    });

    it('5. nothing assigned: a link to Activities', async () => {
        api.fetchClassProgress.mockResolvedValue(grid({ activities: [], cells: [] }));
        classPage();
        expect(await screen.findByText('Nothing assigned yet')).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Activities' }).getAttribute('href')).toBe('/activities');
    });

    it('6. nobody started: the full roster of dashes and one line', async () => {
        api.fetchClassProgress.mockResolvedValue(grid({ cells: [], last_check_at: null }));
        classPage();
        expect(await screen.findByText('No one has checked any work yet.')).toBeTruthy();
        expect(screen.getAllByRole('rowheader')).toHaveLength(3);
        expect(screen.getByText('None yet')).toBeTruthy();
    });

    it('7 + 8. a student with no checks reads "—"; a NULL total reads "Started · ?"', async () => {
        api.fetchClassProgress.mockResolvedValue(grid());
        classPage();
        await screen.findByRole('link', { name: /Ana Lee, Fractions 2/ });
        expect(within(screen.getByRole('row', { name: /Caleb Wu/ })).getAllByText('—')).toHaveLength(2);
        expect(screen.getByText(/Started · \?/)).toBeTruthy();
    });

    it('9. a misconception the registry does not mirror shows its id', async () => {
        api.fetchClassProgress.mockResolvedValue(grid());
        api.fetchMisconceptions.mockResolvedValue({
            misconceptions: [{ id: 'mis.not.mirrored', description: null, ever: 7, still: 3, activities: [], students: [] }],
            wrong_answers: [],
        });
        classPage();
        expect(await screen.findByText('mis.not.mirrored')).toBeTruthy();
        expect(screen.getByText(/Unknown misconception/)).toBeTruthy();
        expect(screen.getByText('7 students showed it, 3 still do')).toBeTruthy();
    });

    it('10. an untitled section reads "Section N" on the activity page', async () => {
        const doc = (await import('@activity/schema')).createEmptyDocument();
        const vid = 'v-current';
        api.fetchActivityProgress.mockResolvedValue({
            activity: { id: A1, title: 'Fractions 2', current_version_id: vid },
            classes: [{ class_id: 'class-1', name: '9 Maths B', students: [] }],
            sections: [],
            last_check_at: null,
        } satisfies ActivityProgress);
        api.fetchMisconceptions.mockResolvedValue(noMis);
        api.fetchVersionContents.mockResolvedValue(new Map([[vid, { version_num: 1, content: doc }]]));
        render(
            <MemoryRouter initialEntries={[`/activity/${A1}/progress`]}>
                <Routes>
                    <Route path="/activity/:id/progress" element={<ActivityProgressPage />} />
                </Routes>
            </MemoryRouter>,
        );
        expect(await screen.findByText('No students in this class yet.')).toBeTruthy();
        expect(screen.getByRole('heading', { name: /9 Maths B/ }).textContent).toContain('0 done · 0 started · 0 not started');
    });
});

describe('the activity page (D5, DR-2, DR-3, DR-11)', () => {
    it('groups by class with counts, puts wrong answers above the grid, opens only the first three', async () => {
        const schema = await import('@activity/schema');
        const doc = schema.createEmptyDocument();
        const blocks = Array.from({ length: 4 }, () => {
            const b = schema.createFillInBlankBlock();
            const blank = schema.createBlankToken('1');
            b.content = [blank];
            return { b, blank };
        });
        doc.sections[0]!.rows[0]!.columns[0]!.blocks = blocks.map((x) => x.b);
        const vid = 'v-current';
        const student = (id: string, name: string, checked: number) => ({
            student_id: id, name, sections_total: 1, sections_checked: checked, earlier_checked: false, earlier_done: false,
            shown_version_id: checked > 0 ? vid : null, shown_total: checked > 0 ? 1 : null, shown_checked: checked > 0 ? checked : null,
            to_grade: 0, last_checked_at: null,
        });
        api.fetchActivityProgress.mockResolvedValue({
            activity: { id: A1, title: 'Fractions 2', current_version_id: vid },
            classes: [
                { class_id: 'c1', name: '9 Maths A', students: [student('s1', 'Ana Lee', 1)] },
                { class_id: 'c2', name: '9 Maths B', students: [student('s2', 'Ben Carter', 0)] },
            ],
            sections: [{ student_id: 's1', version_id: vid, section_id: doc.sections[0]!.id, attempts: 1, correct: 0, marked: 4, checked_at: '2027-02-09T09:41:00Z' }],
            last_check_at: null,
        } satisfies ActivityProgress);
        api.fetchMisconceptions.mockResolvedValue({
            misconceptions: [],
            wrong_answers: blocks.map((x, i) => ({
                version_id: vid, section_id: doc.sections[0]!.id, item_id: x.blank.id, wrong: 5 - i,
                answers: [{ family: 'blanks', answer: ` ${i}.75`, count: 2, misconception_ids: [] }],
            })),
        });
        api.fetchVersionContents.mockResolvedValue(new Map([[vid, { version_num: 1, content: doc }]]));
        render(
            <MemoryRouter initialEntries={[`/activity/${A1}/progress`]}>
                <Routes>
                    <Route path="/activity/:id/progress" element={<ActivityProgressPage />} />
                </Routes>
            </MemoryRouter>,
        );
        expect((await screen.findByRole('heading', { name: /9 Maths A/ })).textContent).toContain('1 done · 0 started · 0 not started');
        expect(screen.getByRole('heading', { name: /9 Maths B/ }).textContent).toContain('0 done · 0 started · 1 not started');
        const disclosures = screen.getAllByRole('button', { name: /wrong · most common/ });
        expect(disclosures.map((d) => d.getAttribute('aria-expanded'))).toEqual(['true', 'true', 'true', 'false']);
        expect(disclosures[0]!.textContent).toContain('Q1 · 5 wrong · most common: 0.75 (2)');
        // DR-3: the wrong answers come BEFORE the grid in the page.
        const wrongHead = screen.getByRole('heading', { name: 'Common wrong answers' });
        const table = screen.getAllByRole('table')[0]!;
        expect(wrongHead.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(screen.getByRole('link', { name: 'Ana Lee, Section 1: checked, 0 percent, 1 attempt' })).toBeTruthy();
    });
});

describe('Responses: Back to progress (DR-8)', () => {
    function responses(path: string) {
        return render(
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/activity/:id/responses" element={<ActivityResponses />} />
                </Routes>
            </MemoryRouter>,
        );
    }

    it('a valid ?from= replaces Back to editor', () => {
        responses(`/activity/${A1}/responses?from=${encodeURIComponent('/classes/class-1/progress')}`);
        const back = screen.getByRole('link', { name: 'Back to progress' });
        expect(back.getAttribute('href')).toBe('/classes/class-1/progress');
    });

    it('anything else is ignored', () => {
        responses(`/activity/${A1}/responses?from=${encodeURIComponent('https://evil.example/progress')}`);
        expect(screen.getByRole('link', { name: 'Back to editor' })).toBeTruthy();
        expect(screen.queryByRole('link', { name: 'Back to progress' })).toBeNull();
    });
});

describe('the pure rules', () => {
    it('safeProgressPath accepts only in-app progress paths', () => {
        expect(safeProgressPath('/classes/c1/progress')).toBe('/classes/c1/progress');
        expect(safeProgressPath('/activity/a1/progress/s1')).toBe('/activity/a1/progress/s1');
        for (const bad of [null, '', 'https://x/progress', '//x/classes/progress', '/classes//progress', '/activity/a1/responses',
            '/settings/progress', '/classes/c1/progress"><script>', 'javascript:alert(1)']) {
            expect(safeProgressPath(bad)).toBeNull();
        }
    });

    it('cellStatus follows the student Home precedence (current first, else older)', () => {
        expect(cellStatus(null).kind).toBe('none');
        expect(cellStatus(cell('s', 'a', {}))).toMatchObject({ kind: 'done', percent: 80, older: false });
        expect(cellStatus(cell('s', 'a', { marked: 0, correct: 0 })).percent).toBeNull();
        expect(cellStatus(cell('s', 'a', { sections_checked: 0, shown_checked: 2, shown_total: 2 }))).toMatchObject({
            kind: 'done', older: true,
        });
        expect(cellStatus(cell('s', 'a', { sections_total: null })).kind).toBe('started_unknown');
    });

    it('pseudonyms number by name, stable under re-sorting', () => {
        const p = pseudonyms([{ student_id: 'b', name: 'Zoe' }, { student_id: 'a', name: 'amy' }]);
        expect([p.get('a'), p.get('b')]).toEqual(['Student 1', 'Student 2']);
    });

    it('leastDoneFirst keeps name order among ties', () => {
        const rows = ['x', 'y', 'z'];
        const t = { x: tally([]), y: tally([cellStatus(cell('s', 'a', {}))]), z: tally([]) } as const;
        expect(leastDoneFirst(rows, (r) => t[r as 'x' | 'y' | 'z'])).toEqual(['x', 'z', 'y']);
    });
});
