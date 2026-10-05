// =============================================================================
// factProbe.ts — the number-facts check's six RPCs (migration 0045)
// -----------------------------------------------------------------------------
// D43 slice 1 (docs/design/practice-blocks.md). Thin, typed wrappers: every
// rule lives in the database functions. The RPC names live in factProbeRpc.ts
// so the e2e mocks import them rather than retyping (policy P2).
//
// ⚠ Called only from the LAZY /facts and /classes/:classId/facts routes — keep
// it out of anything the shell imports.
// =============================================================================

import { supabase } from './supabase';
import { FACT_PROBE_RPC } from './factProbeRpc';
import type { AttemptRecord, ProbeItem } from '../practice/factRun';
import type { Baselines } from '../practice/baseline';

export { FACT_PROBE_RPC };

// ---- the student ----------------------------------------------------------------

export interface OwnCounts {
    right: number;
    skipped: number;
    not_counted: number;
}

export type EntryState =
    | { state: 'teacher' }
    | { state: 'not_member' }
    | { state: 'none_open' }
    | { state: 'finished' | 'closed'; saved: number; total: number; counts: OwnCounts }
    | {
          state: 'ready' | 'resume';
          probe_id: string;
          total: number;
          ceiling_s: number;
          saved: number;
          next_n: number;
          counts: OwnCounts;
          baselines: Baselines;
          items: ProbeItem[];
      };

export async function fetchEntry(code: string): Promise<EntryState> {
    const { data, error } = await supabase.rpc(FACT_PROBE_RPC.entry, { p_code: code });
    if (error) throw new Error(error.message);
    return data as EntryState;
}

export interface SaveResult {
    state: 'saved' | 'closed';
    saved: number;
    finished: boolean;
}

export async function saveAttempts(
    probeId: string,
    attempts: AttemptRecord[],
    options: { baselines?: Baselines | null; finished?: boolean } = {},
): Promise<SaveResult> {
    const { data, error } = await supabase.rpc(FACT_PROBE_RPC.save, {
        p_probe_id: probeId,
        p_attempts: attempts.map((a) => ({
            n: a.n,
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
    return data as SaveResult;
}

// ---- the teacher ----------------------------------------------------------------

export type Verdict = 'below' | 'at_or_above' | 'not_enough';
export type Group = 'fluent' | 'slow' | 'needs_strategy';

export interface ClassStat {
    in_class: number;
    started: number;
    finished: number;
    with_rate: number;
    left_out: number;
    median_rate: number | null;
    floor: number;
    min_students: number;
    verdict: Verdict;
    groups: Record<Group, number>;
    closed_by?: 'teacher' | 'auto';
}

export interface FamilyReading {
    family_id: string;
    name: string;
    counted: number;
    met: number;
    status: 'met' | 'not_met' | 'not_judged';
    /** Since migration 0046: how many of `counted` were right, and the
     *  family's own label (null = not judged). Absent on a database that has
     *  not had 0046 applied — read them through familyLabel(). */
    right?: number;
    group?: Group | null;
}

/** A family's label as the page words it. 'not_met' appears only for a
 *  pre-0046 reading, which cannot say WHICH kind of not met it is. */
export type FamilyLabel = Group | 'not_met' | 'not_judged';

export function familyLabel(f: FamilyReading): FamilyLabel {
    if (f.group !== undefined) return f.group ?? 'not_judged';
    return f.status === 'met' ? 'fluent' : f.status;
}

export interface StudentRow {
    student_id: string;
    name: string;
    is_member: boolean;
    status: 'not_started' | 'in_progress' | 'finished';
    done: number;
    has_rate: boolean;
    rate: number | null;
    right: number;
    met: number;
    skipped: number;
    not_counted: number;
    counted: number;
    group: Group | null;
    typing_flag: boolean;
    families: FamilyReading[];
}

export interface ProbeInfo {
    id: string;
    class_id: string;
    join_code: string;
    year_level: number;
    opened_at: string;
    closes_at: string;
    closed_at: string | null;
    auto_closed: boolean;
    state: 'open' | 'closed';
    item_count: number;
}

export interface ProbeResults {
    probe: ProbeInfo;
    class: ClassStat;
    students: StudentRow[];
}

export interface YearOption {
    year: number;
    description: string | null;
    adds: string[];
    families: number;
    items: number;
}

export interface ProbeSummary {
    id: string;
    year_level: number;
    opened_at: string;
    closed_at: string | null;
    auto_closed: boolean;
    state: 'open' | 'closed';
    item_count: number;
    verdict: Verdict | null;
}

export interface ProbeOverview {
    join_code: string;
    mirrored: boolean;
    years: YearOption[];
    probes: ProbeSummary[];
}

async function call<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    const { data, error } = await supabase.rpc(fn, args);
    if (error) throw new Error(error.message);
    return data as T;
}

export const fetchOverview = (classId: string) =>
    call<ProbeOverview>(FACT_PROBE_RPC.overview, { p_class_id: classId });

export const fetchResults = (probeId: string) =>
    call<ProbeResults>(FACT_PROBE_RPC.results, { p_probe_id: probeId });

export const openProbe = (classId: string, yearLevel: number) =>
    call<{ probe_id: string }>(FACT_PROBE_RPC.open, { p_class_id: classId, p_year_level: yearLevel });

export const closeProbe = (probeId: string) =>
    call<ClassStat>(FACT_PROBE_RPC.close, { p_probe_id: probeId });

/** The student link for a class (DR-1): typeable from the board. */
export function factsLink(origin: string, joinCode: string): string {
    return `${origin}/facts/${joinCode}`;
}
