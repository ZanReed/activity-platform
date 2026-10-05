// =============================================================================
// factSprint.ts — the daily number-facts practice's RPCs (migration 0050)
// -----------------------------------------------------------------------------
// D43 slice 2 (docs/design/practice-blocks.md → "Slice 2, the sprint"). Thin,
// typed wrappers: every rule lives in the database functions.
//
// ⚠ Called only from the LAZY /facts and /classes/:classId/facts routes — keep
// it out of anything the shell imports.
// =============================================================================

import { supabase } from './supabase';
import { FACT_PROBE_RPC } from './factProbeRpc';
import type { AttemptRecord, ProbeItem, SprintFamily } from '../practice/factRun';
import type { Baselines } from '../practice/baseline';

/** One session, as fact_sprint_payload returns it. */
export interface SprintSession {
    session_id: string;
    minutes: number;
    reask_gap: number;
    ceiling_s: number;
    total: number;
    baselines: Baselines;
    families: SprintFamily[];
    items: (ProbeItem & { family_id: string })[];
    saved: { n: number; reask: boolean; missed: boolean }[];
    best_before: number | null;
}

interface Common {
    done_today: number;
    best: number | null;
    class_name: string;
}

export type SprintEntry =
    | { state: 'teacher' | 'not_member' | 'off' }
    | (Common & { state: 'nothing_due' })
    | (Common & { state: 'resume'; session: SprintSession })
    /** `session` is present only when the call asked to start. */
    | (Common & { state: 'ready'; due: number; minutes?: number; session?: SprintSession });

export async function fetchSprintEntry(code: string, start = false): Promise<SprintEntry> {
    const { data, error } = await supabase.rpc(FACT_PROBE_RPC.sprintEntry, {
        p_code: code,
        p_start: start,
    });
    if (error) throw new Error(error.message);
    return data as SprintEntry;
}

export interface SprintSaveResult {
    state: 'saved' | 'closed';
    saved: number;
    finished: boolean;
    /** Quick and right in this session so far (first asks). */
    quick_right?: number;
    /** The student's best over their other finished sessions, or null. */
    best_before?: number | null;
}

export async function saveSprintAttempts(
    sessionId: string,
    attempts: AttemptRecord[],
    options: { baselines?: Baselines | null; finished?: boolean } = {},
): Promise<SprintSaveResult> {
    const { data, error } = await supabase.rpc(FACT_PROBE_RPC.sprintSave, {
        p_session_id: sessionId,
        p_attempts: attempts.map((a) => ({
            n: a.n,
            reask: a.reask === true,
            typed: a.typed,
            skipped: a.skipped,
            interrupted: a.interrupted,
            rt_ms: a.rtMs,
            offset_ms: a.offsetMs,
            modality: a.modality,
        })),
        p_baselines: options.baselines ?? null,
        p_finished: options.finished ?? false,
        p_app_build: typeof __APP_BUILD__ === 'string' ? __APP_BUILD__ : null,
    });
    if (error) throw new Error(error.message);
    return data as SprintSaveResult;
}

/** The teacher's switch (SP-2). Throws the server's reason by name. */
export async function setFactSprint(classId: string, on: boolean): Promise<{ on: boolean; on_at: string | null }> {
    const { data, error } = await supabase.rpc(FACT_PROBE_RPC.sprintSwitch, {
        p_class_id: classId,
        p_on: on,
    });
    if (error) throw new Error(error.message);
    return data as { on: boolean; on_at: string | null };
}

// ---- the teacher's view (migration 0051, SP-4) -------------------------------------

/** Students per state, for one family or one student. */
export interface StateCounts {
    strategy: number;
    practising: number;
    fluent: number;
}

export interface SprintOverview {
    on: boolean;
    on_at: string | null;
    /** Why the practice cannot be switched on, by the server's name; else null. */
    blocked_by:
        | null
        | 'no_closed_check'
        | 'sprint_settings_not_mirrored'
        | 'year_not_available'
        | 'school_year_end_missing'
        | 'school_year_ended';
    year_level: number | null;
    join_code: string;
    in_class: number;
    practised_today: number;
    practised_week: number;
    families: ({ family_id: string; name: string } & StateCounts)[];
    students: ({ student_id: string; name: string; days_practised: number; last_day: string | null } & StateCounts)[];
}

export async function fetchSprintOverview(classId: string): Promise<SprintOverview> {
    const { data, error } = await supabase.rpc(FACT_PROBE_RPC.sprintOverview, { p_class_id: classId });
    if (error) throw new Error(error.message);
    return data as SprintOverview;
}
