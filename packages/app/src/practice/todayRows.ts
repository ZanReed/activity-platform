// =============================================================================
// todayRows.ts — a student's short list for today, in the period's order
// (period assembly PA-5, PA-7; docs/design/period-assembly.md)
// -----------------------------------------------------------------------------
// §17's order: number facts, one hook, then each activity with its practice.
// Only what the class has on appears. The order is a suggestion: every row
// opens at any time, and nothing here locks anything (PA-6).
// =============================================================================

export type TodayRow =
    | { kind: 'facts'; minutes: number; done: boolean }
    | { kind: 'hook' }
    | { kind: 'activity'; id: string; title: string; status: string | null }
    | { kind: 'practice'; minutes: string | null; done: boolean };

export interface TodayInput {
    facts: { minutes: number; doneToday: number } | null;
    practice: { minutes: string | null; doneToday: number } | null;
    activities: readonly { id: string; title: string; status: string | null }[];
}

export function todayRows({ facts, practice, activities }: TodayInput): TodayRow[] {
    const rows: TodayRow[] = [];
    if (facts) rows.push({ kind: 'facts', minutes: facts.minutes, done: facts.doneToday > 0 });
    rows.push({ kind: 'hook' });
    activities.forEach((a, i) => {
        rows.push({ kind: 'activity', ...a });
        if (practice) {
            rows.push({ kind: 'practice', minutes: practice.minutes, done: practice.doneToday > i });
        }
    });
    return rows;
}

/**
 * The activity a done screen offers next. After number facts, the first not
 * yet done.
 * After `practiceDone` practice sessions, the one after that block, so a
 * double's first Practice leads to its second activity. Undefined means the
 * done screen offers the list instead.
 */
export function nextActivity(
    activities: readonly { id: string; title: string; status: string | null }[],
    practiceDone: number | null,
): { id: string; title: string } | undefined {
    if (practiceDone === null) return activities.find((a) => a.status !== 'Done ✓');
    return activities[practiceDone];
}
