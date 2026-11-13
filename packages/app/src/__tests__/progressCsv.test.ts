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
    cells: [cell('s1', 'a1', { sections_checked: 3, correct: 7, marked: 10 }), cell('s2', 'a2', { sections_checked: 1, correct: 0, marked: 0 })],
    last_check_at: null,
};

const parse = (csv: string) => csv.replace(/^\uFEFF/, '').trimEnd().split('\r\n');

describe('classProgressCsv', () => {
    it('one row per student, two columns per activity, quoted', () => {
        const lines = parse(classProgressCsv(grid));
        expect(lines[0]).toBe(
            '"Student","Fractions, part 1 — sections checked","Fractions, part 1 — % right","Ratios — sections checked","Ratios — % right"',
        );
        // A comma and quotes in a name survive: quotes doubled, field quoted.
        expect(lines[1]).toBe('"O\'Neil, ""Sam""","3 of 5","70","",""');
    });

    it('defuses a name a spreadsheet would run as a formula', () => {
        const lines = parse(classProgressCsv(grid));
        expect(lines[2]!.startsWith('"\'=HYPERLINK(""x"")"')).toBe(true);
        // Checked but nothing computer-marked: sections shown, % blank.
        expect(lines[2]).toBe('"\'=HYPERLINK(""x"")","","","1 of 5",""');
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
