// =============================================================================
// dueWords.ts — the pure half of due dates (docs/design/due-dates.md): calendar
// sums and the words for them. NO imports, on purpose: dueDates.test.ts runs
// this file in fresh Node processes under different TZ values, which only a
// fresh process can prove (Node caches its default timezone).
// =============================================================================

const DAY = 86_400_000;
const toUtc = (d: string): number => Date.parse(`${d}T00:00:00Z`);

/** Whole days from `today` to `due` (negative = the date has passed). */
export function daysUntil(due: string, today: string): number {
    return Math.round((toUtc(due) - toUtc(today)) / DAY);
}

const weekday = (d: string) => new Date(toUtc(d)).toLocaleDateString('en-NZ', { weekday: 'short', timeZone: 'UTC' });
const dayMonth = (d: string) =>
    new Date(toUtc(d)).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** The short form a column header or a Home row uses: "today", "Fri", "28 Nov". */
export function dueWords(due: string, today: string): string {
    const n = daysUntil(due, today);
    if (n === 0) return 'today';
    if (n > 0 && n < 7) return weekday(due);
    return dayMonth(due);
}

/**
 * What a STUDENT's Home row says, or null for nothing (DD-3): no date, or the
 * work is finished. "Due today" / "Due Fri" / "Due 28 Nov"; after the date,
 * "Was due Tue 12 Nov".
 */
export function studentDueLabel(due: string | null, today: string | null, finished: boolean): string | null {
    if (!due || !today || finished) return null;
    if (daysUntil(due, today) < 0) return `Was due ${weekday(due)} ${dayMonth(due)}`;
    return `Due ${dueWords(due, today)}`;
}

/** Has the date passed (the class's day is after it)? */
export function isPastDue(due: string | null, today: string | null): boolean {
    return !!due && !!today && daysUntil(due, today) < 0;
}

/** Due within the next 7 days, today included (the class card's "due this week"). */
export function isDueThisWeek(due: string | null, today: string | null): boolean {
    if (!due || !today) return false;
    const n = daysUntil(due, today);
    return n >= 0 && n < 7;
}

