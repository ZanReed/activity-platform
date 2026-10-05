// The class's school-year end (migration 0048, RP-1/RP-2): date helpers shared
// by the open-snapshot screen and the daily-practice panel. Lazy with them.

/** A DATE (yyyy-mm-dd) as a local calendar day. `new Date('2027-12-17')` is
 *  UTC midnight, which reads as the 16th west of Greenwich. */
function localDay(date: string): Date {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** "17 December 2027": a date the year matters for. A timestamp is read as
 *  the local day it falls on. */
export function longDay(dateOrIso: string): string {
    const when = dateOrIso.length > 10 ? new Date(dateOrIso) : localDay(dateOrIso);
    return when.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function isoDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** The furthest end date the server accepts (set_class_year_end, RP-8). */
export const YEAR_END_MAX_DAYS = 400;

/** A FIRST GUESS at the school-year end, for the teacher to confirm (RP-2):
 *  NZ and Australia end in mid-December, most northern-hemisphere schools in
 *  late June. Only ever a prefill; the stored date is the teacher's. */
export function guessYearEnd(today: Date, timeZone: string): string {
    const south = /^(Pacific\/(Auckland|Chatham)|Australia\/|Antarctica\/McMurdo)/.test(timeZone);
    const [month, dayOfMonth] = south ? [11, 18] : [5, 30];
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const guess = new Date(today.getFullYear(), month, dayOfMonth);
    return isoDate(guess < start ? new Date(today.getFullYear() + 1, month, dayOfMonth) : guess);
}

/** Today and today + 400 days, the date input's bounds. */
export function yearEndBounds(today: Date): { min: string; max: string } {
    const max = new Date(today.getFullYear(), today.getMonth(), today.getDate() + YEAR_END_MAX_DAYS);
    return { min: isoDate(today), max: isoDate(max) };
}
