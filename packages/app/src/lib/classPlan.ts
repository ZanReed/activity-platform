// =============================================================================
// classPlan.ts — planning a class's days ahead (period planner PP-1–PP-6, 0088)
// -----------------------------------------------------------------------------
// The server owns "today" (the class's zone), the year-end limit, the six-a-day
// cap (visible rows only) and every refusal; this module names them and does
// the date and minutes arithmetic the Plan page shows. Nothing here schedules
// anything: a teacher places every day by hand (§18 as read in C-188).
// =============================================================================

import { supabase } from './supabase';

/** RPC names, exported so test mocks derive from them (policy P2). */
export const CLASS_PLAN_RPC = {
    read: 'class_plan',
    set: 'set_class_plan',
    move: 'move_class_plan_item',
    reorder: 'reorder_class_plan',
} as const;

export interface PlannedActivity {
    activity_id: string;
    title: string;
    minutes: number | null;
    position: number;
    /** False once unpublished or deleted: shown "no longer available · Remove". */
    available: boolean;
}

export interface PlanDay {
    on_date: string;
    activities: PlannedActivity[];
    hook_ids: string[];
}

export interface ClassPlan {
    today: string;
    /** The last day a teacher may ADD to (year end, or today + 365). */
    limit: string;
    days: PlanDay[];
    last_day: { on_date: string; activities: PlannedActivity[] } | null;
}

/** The server's day-cap (0084/0088): generous, not a model of a period. */
export const MAX_PER_DAY = 6;

/** How many school days the Plan page shows from its start (PP-1). */
export const PLAN_WINDOW_DAYS = 10;

// ---- dates (ISO yyyy-mm-dd, arithmetic in UTC so no zone can shift a day) ----

export function addDays(iso: string, n: number): string {
    const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function weekday(iso: string): number {
    const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isWeekend(iso: string): boolean {
    const w = weekday(iso);
    return w === 0 || w === 6;
}

/**
 * The days a Plan page shows from `start`: the next `count` Monday–Friday days,
 * plus any weekend day inside that span that has something planned (PP-1:
 * weekends appear only when something is on one).
 */
export function planDates(start: string, count: number, planned: ReadonlySet<string>): string[] {
    const out: string[] = [];
    let school = 0;
    let d = start;
    while (school < count) {
        // The first day always shows (it is today, or a day the teacher chose),
        // so a weekend today still has a card to add to.
        if (d === start || !isWeekend(d)) {
            out.push(d);
            school++;
        } else if (planned.has(d)) {
            out.push(d);
        }
        d = addDays(d, 1);
    }
    return out;
}

/** The calendar span `planDates` can cover: enough for `count` school days. */
export function windowEnd(start: string, count: number): string {
    return addDays(start, Math.ceil((count / 5) * 7) + 2);
}

/** "Tue 18 Nov" — the plan's own label, read in UTC from the ISO date. */
export function dayLabel(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-NZ', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
    }).replace(/,/g, '');
}

// ---- the day's total (PP-6) --------------------------------------------------

export interface DayShape {
    sprintOn: boolean;
    /** The fluency block's minutes, [low, high]. */
    sprint: [number, number];
    mixedOn: boolean;
    /** Mixed practice questions per session, and seconds a question [fast, slow]. */
    itemsPerSession: number;
    secondsPerItem: [number, number];
    /** The hook block's minutes, [low, high]. */
    hook: [number, number];
}

export const DEFAULT_SHAPE: DayShape = {
    sprintOn: false,
    sprint: [5, 5],
    mixedOn: false,
    itemsPerSession: 6,
    secondsPerItem: [60, 90],
    hook: [2, 3],
};

/** One practice after an activity, in whole minutes [low, high]. */
export function practiceRange(shape: DayShape): [number, number] {
    const low = Math.max(1, Math.round((shape.itemsPerSession * shape.secondsPerItem[0]) / 60));
    const high = Math.max(low, Math.round((shape.itemsPerSession * shape.secondsPerItem[1]) / 60));
    return [low, high];
}

export interface DayTotal {
    low: number;
    high: number;
    /** Titles of activities with no time: counted as "not set", never as zero. */
    unset: string[];
}

/**
 * §17's sum: number facts, one hook, then each activity with its practice.
 * Unavailable activities are left out (students don't see them).
 */
export function dayTotal(day: Pick<PlanDay, 'activities' | 'hook_ids'>, shape: DayShape): DayTotal {
    let low = 0;
    let high = 0;
    const unset: string[] = [];
    const shown = day.activities.filter((a) => a.available);
    if (shape.sprintOn && shown.length > 0) {
        low += shape.sprint[0];
        high += shape.sprint[1];
    }
    if (day.hook_ids.length > 0) {
        low += shape.hook[0];
        high += shape.hook[1];
    }
    const practice = practiceRange(shape);
    for (const a of shown) {
        if (a.minutes == null) unset.push(a.title);
        else {
            low += a.minutes;
            high += a.minutes;
        }
        if (shape.mixedOn) {
            low += practice[0];
            high += practice[1];
        }
    }
    return { low, high, unset };
}

/** "About 47–52 min", "About 15–20 min + Unit rates (time not set)". Never a clock. */
export function totalLine(t: DayTotal): string | null {
    if (t.low === 0 && t.high === 0 && t.unset.length === 0) return null;
    const range = t.low === t.high ? `${t.low}` : `${t.low}–${t.high}`;
    const base = t.low > 0 || t.high > 0 ? `About ${range} min` : '';
    if (t.unset.length === 0) return base;
    const rest = `${t.unset.join(', ')} (time not set)`;
    return base ? `${base} + ${rest}` : rest;
}

// ---- errors ------------------------------------------------------------------

/** The server's refusals, in words a teacher can act on. */
export function planErrorMessage(err: unknown): string {
    const m = err instanceof Error ? err.message : String(err ?? '');
    if (m.includes('day_full') || m.includes('today_full')) {
        return `A day holds ${MAX_PER_DAY} activities at most. Remove one first.`;
    }
    if (m.includes('past_day')) return 'That day has passed; past days are read-only.';
    if (m.includes('too_far')) return 'That day is past the end of the school year (or a year ahead).';
    if (m.includes('not_in_class')) return "That activity isn't available to this class any more.";
    if (m.includes('not_planned')) return 'That activity is no longer on that day. The plan has been refreshed.';
    if (m.includes('reorder_mismatch')) return 'The day changed in another tab. The plan has been refreshed.';
    if (m.includes('Not your class')) return "This isn't one of your classes.";
    return "That didn't save. Check your connection, then try again.";
}

// ---- the calls ---------------------------------------------------------------

async function call(fn: string, args: Record<string, unknown>): Promise<ClassPlan> {
    const { data, error } = await supabase.rpc(fn, args);
    if (error) throw new Error(error.message);
    return data as ClassPlan;
}

export const fetchClassPlan = (classId: string, from: string, to: string) =>
    call(CLASS_PLAN_RPC.read, { p_class_id: classId, p_from: from, p_to: to });

export const setClassPlan = (classId: string, onDate: string, activityId: string, on: boolean) =>
    call(CLASS_PLAN_RPC.set, { p_class_id: classId, p_on_date: onDate, p_activity_id: activityId, p_on: on });

export const moveClassPlanItem = (classId: string, fromDate: string, activityId: string, toDate: string) =>
    call(CLASS_PLAN_RPC.move, {
        p_class_id: classId,
        p_from_date: fromDate,
        p_activity_id: activityId,
        p_to_date: toDate,
    });

export const reorderClassPlan = (classId: string, onDate: string, activityIds: string[]) =>
    call(CLASS_PLAN_RPC.reorder, { p_class_id: classId, p_on_date: onDate, p_activity_ids: activityIds });

/**
 * The day's shape from the class's two practice reads (either may be missing:
 * a failed read leaves that part of the total out, it never invents one).
 * Block minutes come from the mirrored `period_shapes` (0083), first length
 * listed; the defaults are §17's 5 / 2–3 / 60–90 s.
 */
export function shapeFrom(
    sprint: { on: boolean } | null,
    mixed: {
        on_at: string | null;
        items_per_session: number | null;
        default_items: number | null;
        period_shapes?: { lengths: Record<string, { kind: string; minutes: [number, number] | string }[]> } | null;
        seconds_per_item?: [number, number] | null;
    } | null,
): DayShape {
    const blocks = Object.values(mixed?.period_shapes?.lengths ?? {})[0] ?? [];
    const range = (kind: string, fallback: [number, number]): [number, number] => {
        const m = blocks.find((b) => b.kind === kind)?.minutes;
        return Array.isArray(m) && m.length === 2 ? [m[0], m[1]] : fallback;
    };
    return {
        sprintOn: sprint?.on === true,
        // P1 (review): the student list says the sprint's own minutes, 5 when
        // unset, and practice at 60–90 s a question (practiceMinutes): the plan
        // uses the same numbers, never period_shapes' copies, so they agree.
        sprint: DEFAULT_SHAPE.sprint,
        mixedOn: mixed?.on_at != null,
        itemsPerSession: mixed?.items_per_session ?? mixed?.default_items ?? DEFAULT_SHAPE.itemsPerSession,
        secondsPerItem: DEFAULT_SHAPE.secondsPerItem,
        hook: range('hook', DEFAULT_SHAPE.hook),
    };
}
