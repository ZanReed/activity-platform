// =============================================================================
// progressCsv.test.ts — the class gradebook file: E-1's progress columns
// (ui-review-group-e.md, E-9: a name with a comma and a quote survives) plus
// the marks gradebook-export.md adds (GB-2 hand points, GB-4 DoL, GB-5
// practice, GB-8 email).
// =============================================================================

import { describe, expect, it } from 'vitest';
import { gradebookCsv, gradebookFileName, csvField } from '../lib/progressCsv';
import type { ClassProgress } from '../lib/classProgress';
import type { ClassGradebook } from '../lib/gradebook';

const cell = (student_id: string, activity_id: string, over: Partial<ClassProgress['cells'][number]> = {}) => ({
    student_id, activity_id, current_version_id: 'v', sections_total: 5, sections_checked: 0, earlier_checked: false,
    earlier_done: false, shown_version_id: null, shown_total: null, shown_checked: null, to_grade: 0, last_checked_at: null,
    correct: 0, marked: 0, ...over,
});

const grid: ClassProgress = {
    class: { id: 'c1', name: 'Algebra I', join_code: 'ABC123' },
    students: [
        { student_id: 's1', name: 'O\'Neil, "Sam"' },
        { student_id: 's2', name: '=HYPERLINK("x")' },
    ],
    activities: [
        { activity_id: 'a1', title: 'Fractions, part 1', current_version_id: 'v', added_at: '' },
        { activity_id: 'a2', title: 'Ratios', current_version_id: 'v', added_at: '' },
    ],
    cells: [
        // done on the current version, 7 of 10 marked right
        cell('s1', 'a1', { sections_checked: 5, shown_version_id: 'v', shown_checked: 5, shown_total: 5, correct: 7, marked: 10 }),
        // started, 1 of 5: no percent, as the grid (it shows one on done cells only)
        cell('s2', 'a2', { sections_checked: 1, shown_version_id: 'v', shown_checked: 1, shown_total: 5, correct: 1, marked: 1 }),
        // work only on an older version (CP-6): the shown fields, flagged
        cell('s1', 'a2', { sections_checked: 0, shown_version_id: 'old', shown_checked: 2, shown_total: 4, correct: 3, marked: 4 }),
        // total not recorded
        cell('s2', 'a1', { sections_checked: 2, sections_total: null, shown_version_id: 'v', shown_checked: 2, shown_total: null }),
    ],
    last_check_at: null,
};

/** A class with no hand-graded questions, no DoL and no practice scores. */
const plain: ClassGradebook = {
    students: [
        { student_id: 's1', email: 'sam@school.example' },
        { student_id: 's2', email: null },
    ],
    hand: [], hand_activities: [], dol: [], dol_activities: [], practice: [], practice_shown: false,
    today: '2026-11-21',
};

const parse = (csv: string) => csv.replace(/^\uFEFF/, '').trimEnd().split('\r\n');

describe('gradebookCsv: the progress columns (E-1)', () => {
    it('one row per student, name and email, then due, sections, % right per activity, quoted', () => {
        const lines = parse(gradebookCsv(grid, plain, new Map([['a1', '2026-11-20']])));
        expect(lines[0]).toBe(
            '"Student","Email","Fractions, part 1 — due","Fractions, part 1 — sections checked","Fractions, part 1 — % right","Ratios — due","Ratios — sections checked","Ratios — % right"',
        );
        // A comma and quotes in a name survive: quotes doubled, field quoted.
        expect(lines[1]).toBe('"O\'Neil, ""Sam""","sam@school.example","2026-11-20","5 of 5","70","","2 of 4 (older version)",""');
    });

    it('defuses a name a spreadsheet would run as a formula; a missing email is blank', () => {
        const lines = parse(gradebookCsv(grid, plain));
        expect(lines[2]!.startsWith('"\'=HYPERLINK(""x"")"')).toBe(true);
        // No due dates in this class: no due columns.
        expect(lines[2]).toBe('"\'=HYPERLINK(""x"")","","started (total not recorded)","","1 of 5",""');
    });

    it('starts with a BOM and uses CRLF, for Excel', () => {
        const csv = gradebookCsv(grid, plain);
        expect(csv.charCodeAt(0)).toBe(0xfeff);
        expect(csv).toContain('\r\n');
    });
});

describe('gradebookCsv: the marks (gradebook-export.md)', () => {
    const book: ClassGradebook = {
        ...plain,
        hand: [
            { student_id: 's1', activity_id: 'a1', points: 4, possible: 10, pending: 6, stale: 1, from_older: 0 },
            { student_id: 's1', activity_id: 'a2', points: 2.5, possible: 3, pending: 0, stale: 0, from_older: 0 },
        ],
        hand_activities: ['a1', 'a2'],
        dol: [{ student_id: 's2', activity_id: 'a2', source: 'teacher' }],
        dol_activities: ['a2'],
        practice: [
            { student_id: 's1', review: false, right: 4, planned: 12, sessions: 2, latest_right: 3, latest_planned: 6 },
            { student_id: 's1', review: true, right: 2, planned: 4, sessions: 1, latest_right: 2, latest_planned: 4 },
        ],
        practice_shown: true,
    };
    const lines = parse(gradebookCsv(grid, book));
    const header = lines[0]!.split('","');

    it('GB-2: points, possible and pending as NUMBERS, with notes in their own column', () => {
        expect(header).toContain('Fractions, part 1 — points');
        expect(header).toContain('Fractions, part 1 — points possible');
        expect(header).toContain('Fractions, part 1 — points pending');
        expect(header).toContain('Fractions, part 1 — notes');
        // s1 on a1: 4 of 10, 6 points pending, a changed answer noted.
        expect(lines[1]).toContain('"70","4","10","6","answer changed since graded"');
        // s1 on a2 (older version): a decimal mark survives, the version is noted.
        expect(lines[1]).toContain('"2.5","3","0","older version"');
        // s2 has no hand row: four blanks, never zeros.
        expect(lines[2]).toContain('"started (total not recorded)","","","","",""');
    });

    it('GB-3: no combined score column', () => {
        expect(header.some((h) => /total|weighted|overall/i.test(h))).toBe(false);
    });

    it('GB-4: a DoL column only where the DoL names a skill, with the pass source', () => {
        expect(header.filter((h) => h.endsWith('DoL passed'))).toEqual(['Ratios — DoL passed']);
        expect(lines[2]).toContain('"Passed (teacher)"');
    });

    it('GB-5: practice and review scores last, pooled percents, labelled apart', () => {
        expect(header.slice(-5).map((h) => h.replace(/"/g, ''))).toEqual([
            'Practice score — average %',
            'Practice score — sessions',
            'Practice score — latest %',
            'Review score — average %',
            'Review score — sessions',
        ]);
        expect(lines[1]!.endsWith('"33","2","50","50","1"')).toBe(true);
        expect(lines[2]!.endsWith('"","","","",""')).toBe(true);
    });

    it('a class that never recorded practice scores gets no practice columns', () => {
        const h = parse(gradebookCsv(grid, { ...book, practice_shown: false }))[0]!;
        expect(h).not.toContain('Practice score');
    });
});

describe('csvField and the file name', () => {
    it('numbers are not defused; negative-looking text is', () => {
        expect(csvField(-3)).toBe('"-3"');
        expect(csvField('-3')).toBe('"\'-3"');
        expect(csvField(null)).toBe('""');
    });
    it('names the file for the class and the class\'s own day, filesystem-safe', () => {
        expect(gradebookFileName('Algebra I / P3', '2026-11-13')).toBe('Algebra I   P3 gradebook 2026-11-13.csv');
    });
});
