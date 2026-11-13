// =============================================================================
// progressCsv.test.ts — E-1's class progress CSV (ui-review-group-e.md, E-9:
// a name with a comma and a quote in it survives).
// =============================================================================

import { describe, expect, it } from 'vitest';
import { classProgressCsv, classProgressFileName, csvField } from '../lib/progressCsv';
import type { ClassProgress } from '../lib/classProgress';

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

const parse = (csv: string) => csv.replace(/^\uFEFF/, '').trimEnd().split('\r\n');

describe('classProgressCsv', () => {
    it('one row per student, three columns per activity (due, sections, % right), quoted', () => {
        const lines = parse(classProgressCsv(grid, new Map([['a1', '2026-11-20']])));
        expect(lines[0]).toBe(
            '"Student","Fractions, part 1 — due","Fractions, part 1 — sections checked","Fractions, part 1 — % right","Ratios — due","Ratios — sections checked","Ratios — % right"',
        );
        // A comma and quotes in a name survive: quotes doubled, field quoted.
        expect(lines[1]).toBe('"O\'Neil, ""Sam""","2026-11-20","5 of 5","70","","2 of 4 (older version)",""');
    });

    it('defuses a name a spreadsheet would run as a formula', () => {
        const lines = parse(classProgressCsv(grid));
        expect(lines[2]!.startsWith('"\'=HYPERLINK(""x"")"')).toBe(true);
        // A started cell carries no percent; an unknown total says so.
        // No due dates in this class: no due columns (two per activity).
        expect(lines[2]).toBe('"\'=HYPERLINK(""x"")","started (total not recorded)","","1 of 5",""');
    });

    it('starts with a BOM and uses CRLF, for Excel', () => {
        const csv = classProgressCsv(grid);
        expect(csv.charCodeAt(0)).toBe(0xfeff);
        expect(csv).toContain('\r\n');
    });
});

describe('csvField and the file name', () => {
    it('numbers are not defused; negative-looking text is', () => {
        expect(csvField(-3)).toBe('"-3"');
        expect(csvField('-3')).toBe('"\'-3"');
        expect(csvField(null)).toBe('""');
    });
    it('names the file for the class and day, filesystem-safe', () => {
        expect(classProgressFileName('Algebra I / P3', new Date('2026-11-13T10:00:00Z'))).toBe('Algebra I   P3 progress 2026-11-13.csv');
    });
});
