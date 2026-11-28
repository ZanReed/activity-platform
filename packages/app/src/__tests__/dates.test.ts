// =============================================================================
// dates.test.ts — one date formatter, one locale rule (review C10)
// -----------------------------------------------------------------------------
// 1. The presets read the same in either order under ONE rule: a reader in
//    New Zealand and one in the US each see one order, never both.
// 2. A calendar day ('YYYY-MM-DD') is never moved by the reader's zone.
// 3. THE RATCHET: no ad-hoc toLocaleDateString / toLocaleTimeString /
//    toLocaleString / Intl.DateTimeFormat outside lib/dates.ts, in the app or
//    the student viewer. Add a preset there instead. (A NUMBER formatted with
//    toLocaleString would trip it too; none exists, and one belongs in its own
//    helper with an entry in ALLOWED below, stating why.)
// =============================================================================

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
    clock,
    dayMonth,
    dayMonthYear,
    listDate,
    longDate,
    setDateLocaleForTests,
    weekdayDayMonth,
} from '../lib/dates';
import { studentDueLabel } from '../lib/dueWords';
import { formatListDate } from '../lib/classActivities';

afterEach(() => setDateLocaleForTests('en-NZ')); // the setup file's pin

describe('one locale rule (C10)', () => {
    it('a New Zealand reader sees day-month everywhere', () => {
        setDateLocaleForTests('en-NZ');
        expect(dayMonth('2026-11-28')).toBe('28 Nov');
        expect(dayMonthYear('2026-11-28')).toBe('28 Nov 2026');
        expect(weekdayDayMonth('2026-11-12')).toBe('Thu 12 Nov');
        expect(longDate('2027-12-17')).toBe('17 December 2027');
    });

    it('a US reader sees month-day everywhere, the student Home row included', () => {
        setDateLocaleForTests('en-US');
        expect(dayMonth('2026-11-28')).toBe('Nov 28');
        expect(dayMonthYear('2026-11-28')).toBe('Nov 28, 2026');
        expect(weekdayDayMonth('2026-11-12')).toBe('Thu Nov 12');
        // Home's two dates in one list used to disagree ("Added Nov 13" beside
        // "Was due Thu 12 Nov"); both are now the reader's order.
        expect(studentDueLabel('2026-11-12', '2026-11-13', false)).toBe('Was due Thu Nov 12');
        expect(formatListDate(`${new Date().getFullYear()}-11-13T09:00:00Z`)).toMatch(/^Nov 1[34]$/);
    });

    it('a calendar day is read in UTC: it is that day for every reader', () => {
        // Midnight UTC is the evening BEFORE in the US; the day must not move.
        setDateLocaleForTests('en-US');
        expect(dayMonth('2026-03-01')).toBe('Mar 1');
        expect(weekdayDayMonth('2026-03-01')).toBe('Sun Mar 1');
    });

    it('the year shows only when it is not this year', () => {
        const now = new Date(2026, 10, 28, 12);
        expect(listDate(new Date(2026, 1, 3, 12), now)).toBe('3 Feb');
        expect(listDate(new Date(2025, 1, 3, 12), now)).toBe('3 Feb 2025');
        expect(listDate('2025-02-03', now)).toBe('3 Feb 2025');
    });

    it('a time reads in the reader’s clock style', () => {
        const at = new Date(2026, 10, 28, 9, 41);
        expect(clock(at)).toMatch(/^9:41\s?am$/i);
        setDateLocaleForTests('en-US');
        expect(clock(at)).toMatch(/^9:41\s?AM$/);
    });
});

/** Files that may format a date themselves, each with its reason. Empty: keep it so. */
const ALLOWED: Record<string, string> = {
    'packages/app/src/lib/dates.ts': 'the one formatter',
    'packages/app/src/lib/timeZone.ts': 'reads the browser zone (Intl.DateTimeFormat().resolvedOptions()); formats nothing',
};

const REPO = resolve(__dirname, '../../../..');
const TREES = ['packages/app/src', 'packages/viewer/src'];
const AD_HOC = /\b(toLocaleDateString|toLocaleTimeString|toLocaleString)\s*\(|\bIntl\.DateTimeFormat\b/;

function sources(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
            if (name !== '__tests__' && name !== 'test' && name !== 'node_modules') sources(path, out);
        } else if (/\.(ts|tsx)$/.test(name) && !/\.(test|spec|e2e)\.tsx?$/.test(name)) out.push(path);
    }
    return out;
}

describe('the ratchet (C10)', () => {
    it('no date is formatted outside lib/dates.ts', () => {
        const found: string[] = [];
        let scanned = 0;
        for (const tree of TREES) {
            for (const file of sources(join(REPO, tree))) {
                scanned++;
                const rel = relative(REPO, file);
                if (ALLOWED[rel]) continue;
                readFileSync(file, 'utf8')
                    .split('\n')
                    .forEach((line, i) => {
                        if (/^\s*(\/\/|\*)/.test(line)) return; // prose
                        if (AD_HOC.test(line)) found.push(`${rel}:${i + 1}: ${line.trim()}`);
                    });
            }
        }
        expect(scanned).toBeGreaterThan(300); // the scan is reading the trees
        expect(found).toEqual([]);
    });

    it('the pattern catches each ad-hoc form', () => {
        for (const line of [
            "d.toLocaleDateString(undefined, { month: 'short' })",
            'at.toLocaleTimeString([], {})',
            'new Date(at).toLocaleString()',
            'Intl.DateTimeFormat().resolvedOptions().timeZone',
        ]) {
            expect(AD_HOC.test(line), line).toBe(true);
        }
        expect(AD_HOC.test("import { dayMonth } from '../lib/dates';")).toBe(false);
    });
});
