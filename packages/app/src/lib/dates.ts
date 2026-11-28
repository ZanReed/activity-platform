// =============================================================================
// dates.ts — the ONE place the app turns a time into words (review C10)
// -----------------------------------------------------------------------------
// There were ~14 formatters with two locale rules: `en-NZ` hard-coded in two
// files and the browser's locale in about ten. A US teacher could read
// "28 Nov" and "Nov 28" on one page, and a student "Added Nov 13" beside
// "Was due Thu 12 Nov" in one list. Every date and time a person reads now
// comes from a preset here, under ONE locale rule, DATE_LOCALE.
//
// THE RULE: the reader's own browser locale, students included (author
// ruling 2026-11-28).
// The author in New Zealand reads "28 Nov"; colleagues and students in the US
// read "Nov 28"; nobody reads both.
//
// Calendar days are not instants. A due date or a plan day is stored as
// 'YYYY-MM-DD' and means that day everywhere, so a string of exactly that
// shape is read at UTC midnight and formatted in UTC: it can never slide to
// the day before for a reader west of Greenwich. Anything else (a timestamp)
// is an instant, shown in the reader's own zone.
//
// Guarded by __tests__/dates.test.ts, which also fails when a new ad-hoc
// toLocaleDateString / toLocaleTimeString / Intl.DateTimeFormat appears
// outside this file. Add a preset here instead.
//
// ⚠ Reached by the student shell (Home's "Added …" / "Due …"): keep it small.
// =============================================================================

/** undefined = the reader's browser locale. Tests pin one (setDateLocaleForTests). */
let DATE_LOCALE: string | undefined = undefined;

/** Test seam: format as `locale` (undefined restores the browser's). */
export function setDateLocaleForTests(locale: string | undefined): void {
    DATE_LOCALE = locale;
}

/** A Date, an ISO timestamp, or a calendar day 'YYYY-MM-DD'. */
export type When = Date | string;

const CALENDAR_DAY = /^\d{4}-\d{2}-\d{2}$/;

// Terse on purpose: this module rides on the student landing's budget
// (scripts/perf-budgets.mjs, `journey: home`), so each preset is one options
// object and nothing else.
const N = 'numeric';
const S = 'short';

function fmt(when: When, opts: Intl.DateTimeFormatOptions): string {
    const day = typeof when == 'string' && CALENDAR_DAY.test(when);
    return new Date(day ? `${when}T00:00:00Z` : when).toLocaleString(DATE_LOCALE, day ? { ...opts, timeZone: 'UTC' } : opts);
}

/** "28 Nov" / "Nov 28". */
export const dayMonth = (when: When): string => fmt(when, { day: N, month: S });

/** "28 Nov 2026" / "Nov 28, 2026". */
export const dayMonthYear = (when: When): string => fmt(when, { day: N, month: S, year: N });

/** dayMonth, with the year only when it is not this year ("12 Nov" alone could be last year's). */
export const listDate = (when: When, now: Date = new Date()): string =>
    (fmt(when, { year: N }) == fmt(now, { year: N }) ? dayMonth : dayMonthYear)(when);

/** "28 November" / "November 28". */
export const dayMonthLong = (when: When): string => fmt(when, { day: N, month: 'long' });

/** "17 December 2027" / "December 17, 2027": a date the year matters for. */
export const longDate = (when: When): string => fmt(when, { day: N, month: 'long', year: N });

/** "Fri". */
export const weekday = (when: When): string => fmt(when, { weekday: S });

/** "Thu 12 Nov" / "Thu Nov 12" (composed, so no locale adds a comma). */
export const weekdayDayMonth = (when: When): string => `${weekday(when)} ${dayMonth(when)}`;

/** "9:41 am" / "9:41 AM". */
export const clock = (when: When): string => fmt(when, { hour: N, minute: '2-digit' });

/** "28 Nov, 9:41 am" / "Nov 28, 9:41 AM". */
export const dayMonthClock = (when: When): string => fmt(when, { day: N, month: S, hour: N, minute: '2-digit' });

/** Date and time in full, for a tooltip. */
export const fullDateTime = (when: When): string => fmt(when, { dateStyle: 'medium', timeStyle: S });
