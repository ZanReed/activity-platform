// =============================================================================
// dueDates.ts — due dates in words (docs/design/due-dates.md, DD-3/DD-4/DD-6)
// -----------------------------------------------------------------------------
// A due date is a DATE ('YYYY-MM-DD') in the class's timezone, and "today" is
// the class's today from the server (list_class_activities' class_today, or
// class_local_date) — never the device's clock, so a student in another zone
// and the teacher see the same day. All arithmetic here is on calendar dates
// (UTC midnight), so no timezone can shift a day.
//
// A label, never a lock (DD-3). The student's words never say "late" or
// "overdue"; after the date an unfinished activity says "Was due …" in the
// normal muted colour.
// =============================================================================

import { supabase } from './supabase';

export { daysUntil, dueWords, isDueThisWeek, isPastDue, studentDueLabel } from './dueWords';

/** Set or clear (null) a class activity's due date (0087, audited). */
export async function setClassActivityDue(classId: string, activityId: string, dueOn: string | null): Promise<string | null> {
    const { data, error } = await supabase.rpc('set_class_activity_due', {
        p_class_id: classId,
        p_activity_id: activityId,
        p_due_on: dueOn,
    });
    if (error) throw new Error(error.message);
    return (data as string | null) ?? null;
}

/** A class's today, 'YYYY-MM-DD', in its timezone (0087). A teacher's classes
 *  share the teacher's zone, so one call serves a whole Classes page. */
export async function classLocalDate(classId: string): Promise<string> {
    const { data, error } = await supabase.rpc('class_local_date', { p_class_id: classId });
    if (error) throw new Error(error.message);
    return data as string;
}

export interface ClassDue {
    /** activity id → due date, for the activities that have one. */
    byActivity: ReadonlyMap<string, string>;
    /** The class's today; null when no activity has a date (not fetched). */
    today: string | null;
}

/** One class's due dates (teacher: class_activities' SELECT policy covers
 *  the column) and, if any are set, the class's today. */
export async function fetchClassDue(classId: string): Promise<ClassDue> {
    const { data, error } = await supabase
        .from('class_activities')
        .select('activity_id, due_on')
        .eq('class_id', classId)
        .not('due_on', 'is', null)
        // A GET retries by default (1 s + 2 s + 4 s on a network blip); the
        // labels are optional, so fail fast instead (Fable review, DD-4).
        .retry(false);
    if (error) throw new Error(error.message);
    const byActivity = new Map(((data ?? []) as { activity_id: string; due_on: string }[]).map((r) => [r.activity_id, r.due_on]));
    return { byActivity, today: byActivity.size > 0 ? await classLocalDate(classId) : null };
}
