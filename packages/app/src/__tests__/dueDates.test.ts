// =============================================================================
// dueDates.test.ts — due dates in words (docs/design/due-dates.md DD-3/DD-4/
// DD-6). "Today" is always the class's date from the server, so these are
// pure calendar sums; the TZ cases prove the device's zone can't move a day.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dueWords, isDueThisWeek, isPastDue, studentDueLabel } from '../lib/dueDates';

const DUE_WORDS = fileURLToPath(new URL('../lib/dueWords.ts', import.meta.url));

/** Run the pure helpers in a FRESH Node process with `tz` as its zone: Node
 *  caches its default timezone, so setting TZ inside this process proves
 *  nothing (the first version of this test was vacuous, found by mutation). */
function inZone(tz: string): Record<string, unknown> {
    const code = `
        import { daysUntil, dueWords, studentDueLabel } from ${JSON.stringify(DUE_WORDS)};
        console.log(JSON.stringify({
            zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            sat: dueWords('2026-11-14', '2026-11-13'),
            was: studentDueLabel('2026-11-12', '2026-11-13', false),
            one: daysUntil('2026-11-14', '2026-11-13'),
            usDst: daysUntil('2026-11-03', '2026-11-01'),
            nzDst: daysUntil('2026-09-28', '2026-09-26'),
        }));`;
    const out = execFileSync(process.execPath, ['--input-type=module', '-e', code], { env: { ...process.env, TZ: tz } });
    return JSON.parse(out.toString()) as Record<string, unknown>;
}

describe('due dates in words', () => {
    // 2026-11-13 is a Friday.
    it('today, this week by weekday, further out by date', () => {
        expect(dueWords('2026-11-13', '2026-11-13')).toBe('today');
        expect(dueWords('2026-11-17', '2026-11-13')).toBe('Tue');
        expect(dueWords('2026-11-19', '2026-11-13')).toBe('Thu');
        expect(dueWords('2026-11-20', '2026-11-13')).toBe('20 Nov');
    });

    it('a student sees "Due …", "Was due …" after it, and nothing once finished', () => {
        expect(studentDueLabel('2026-11-13', '2026-11-13', false)).toBe('Due today');
        expect(studentDueLabel('2026-11-17', '2026-11-13', false)).toBe('Due Tue');
        expect(studentDueLabel('2026-11-12', '2026-11-13', false)).toBe('Was due Thu 12 Nov');
        expect(studentDueLabel('2026-11-12', '2026-11-13', true)).toBeNull();
        expect(studentDueLabel(null, '2026-11-13', false)).toBeNull();
        // No "late" or "overdue", ever (DD-3).
        for (const d of ['2026-10-01', '2026-11-12', '2026-11-13', '2026-12-25']) {
            expect(studentDueLabel(d, '2026-11-13', false) ?? '').not.toMatch(/late|overdue/i);
        }
    });

    it('past due is after the date, not on it; "this week" is today plus six days', () => {
        expect(isPastDue('2026-11-13', '2026-11-13')).toBe(false);
        expect(isPastDue('2026-11-12', '2026-11-13')).toBe(true);
        expect(isDueThisWeek('2026-11-19', '2026-11-13')).toBe(true);
        expect(isDueThisWeek('2026-11-20', '2026-11-13')).toBe(false);
        expect(isDueThisWeek('2026-11-12', '2026-11-13')).toBe(false);
    });

    it("the device's timezone never moves a day (NZ and US, DD-9)", () => {
        for (const tz of ['Pacific/Auckland', 'America/Los_Angeles', 'America/New_York', 'UTC']) {
            const r = inZone(tz);
            expect(r.zone).toBe(tz); // the child really ran in that zone
            expect(r).toMatchObject({ sat: 'Sat', was: 'Was due Thu 12 Nov', one: 1, usDst: 2, nzDst: 2 });
        }
    });
});
