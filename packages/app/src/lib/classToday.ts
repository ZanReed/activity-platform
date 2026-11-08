// =============================================================================
// classToday.ts — which activity a class is doing today (period assembly,
// docs/design/period-assembly.md PA-3, PA-4; migration 0082)
// -----------------------------------------------------------------------------
// The server decides what "today" is, from the class's timezone. A pick is
// never automatic and gates nothing (PA-6).
// =============================================================================

import { CLASS_TODAY_RPC, SET_CLASS_TODAY_RPC } from './classTodayRpc';
import { supabase } from './supabase';

export interface TodayActivity {
    activity_id: string;
    title: string;
}

export interface ClassToday {
    on_date: string;
    activities: TodayActivity[];
}

/** The most a class picks for one day (0084): generous, not a model of a period. */
export const MAX_TODAY = 6;

export async function fetchClassToday(classId: string): Promise<ClassToday> {
    const { data, error } = await supabase.rpc(CLASS_TODAY_RPC, { p_class_id: classId });
    if (error) throw new Error(error.message);
    return data as ClassToday;
}

export async function setClassToday(
    classId: string,
    activityId: string,
    on: boolean,
): Promise<ClassToday> {
    const { data, error } = await supabase.rpc(SET_CLASS_TODAY_RPC, {
        p_class_id: classId,
        p_activity_id: activityId,
        p_on: on,
    });
    if (error) throw new Error(error.message);
    return data as ClassToday;
}
