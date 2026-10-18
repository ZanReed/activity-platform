// =============================================================================
// classProgress.ts — the teacher's class progress reads (migration 0061)
// -----------------------------------------------------------------------------
// docs/design/class-progress-view.md (CP-1..CP-9, D1–D8, DR-1..DR-11). Typed
// wrappers over the four SECURITY DEFINER reads, plus the pure rules the two
// pages share: what a cell says, the row and column counts, the sort, Hide
// names, and the validated `?from=` path Responses uses to go back (DR-8).
//
// Every scoping rule (live roster × assigned activities) lives in the SQL;
// verify-0061 owns it. This file only formats.
//
// ⚠ Called only from the LAZY progress routes (and Responses' back link) —
// keep it out of anything the student shell imports.
// =============================================================================

import { supabase } from './supabase';
import { getVersionContents, type VersionContent } from './versionContent';
import {
    ACTIVITY_FIRST_TRIES_RPC,
    ACTIVITY_PROGRESS_RPC,
    CLASS_MISCONCEPTIONS_RPC,
    CLASS_PROGRESS_RPC,
    CLASS_STUDENT_WORK_RPC,
} from './edgeFunctions';

// ---- Shapes (as 0061 returns them) -----------------------------------------

export interface ProgressStudent {
    student_id: string;
    name: string;
}

export interface ProgressActivity {
    activity_id: string;
    title: string;
    current_version_id: string;
    added_at: string;
}

/** The done fields of one student on one activity. sections_* are the CURRENT
 * version's (exactly my_activity_progress's); shown_* the version the cell
 * displays — current when checked, else their latest older one (CP-6). */
export interface ProgressSummary {
    sections_total: number | null;
    sections_checked: number;
    earlier_checked: boolean;
    earlier_done: boolean;
    shown_version_id: string | null;
    shown_total: number | null;
    shown_checked: number | null;
    to_grade: number;
    last_checked_at: string | null;
}

export interface ProgressCell extends ProgressSummary {
    student_id: string;
    activity_id: string;
    current_version_id: string;
    correct: number;
    marked: number;
}

export interface ClassProgress {
    class: { id: string; name: string; join_code: string };
    students: ProgressStudent[];
    activities: ProgressActivity[];
    cells: ProgressCell[];
    last_check_at: string | null;
}

export interface ActivityProgressStudent extends ProgressStudent, ProgressSummary {}

export interface ActivityProgressSection {
    student_id: string;
    version_id: string;
    section_id: string;
    attempts: number;
    correct: number;
    marked: number;
    checked_at: string;
}

export interface ActivityProgress {
    activity: { id: string; title: string; current_version_id: string | null };
    classes: { class_id: string; name: string; students: ActivityProgressStudent[] }[];
    sections: ActivityProgressSection[];
    last_check_at: string | null;
}

export interface WorkSection {
    section_id: string;
    attempts: number;
    attempt_number: number;
    checked_at: string;
    responses: unknown;
    verdicts: unknown;
    graded_block_ids: string[];
    /** Attempt 1 of this section (0062, FT-8); null when it is missing. */
    first?: { responses: unknown; verdicts: unknown; checked_at: string } | null;
}

export interface StudentWork {
    student: { id: string; name: string };
    activity: { id: string; title: string; current_version_id: string | null };
    versions: { version_id: string; version_num: number; is_current: boolean; sections: WorkSection[] }[];
}

export interface MisconceptionStudent {
    student_id: string;
    name: string;
    activity_id: string;
    still: boolean;
}

export interface MisconceptionRow {
    id: string;
    /** NULL when the id is not mirrored in misconception_registry. */
    description: string | null;
    ever: number;
    still: number;
    activities: { activity_id: string; title: string }[];
    students: MisconceptionStudent[];
}

export interface WrongAnswer {
    family: string | null;
    answer: unknown;
    count: number;
    misconception_ids: string[];
}

export interface WrongAnswerItem {
    version_id: string;
    section_id: string;
    item_id: string;
    wrong: number;
    answers: WrongAnswer[];
}

export interface ClassMisconceptions {
    misconceptions: MisconceptionRow[];
    wrong_answers: WrongAnswerItem[];
}

/** One answer group on a first try (0062): a picked choice id (multiple
 * choice), or a wrong answer grouped as the common wrong answers are. */
export interface FirstTryGroup {
    answer: unknown;
    family: string | null;
    count: number;
    /** Of these students, right on their latest attempt at this question. */
    right_now: number;
    misconception_ids: string[];
    students: { student_id: string; name: string; right_now: boolean }[];
}

export interface FirstTryItem {
    section_id: string;
    item_id: string;
    family: string | null;
    first: number;
    right_first: number;
    wrong_first: number;
    wrong_right_now: number;
    /** Multiple choice: students who ticked at least one choice. */
    picked: number;
    groups: FirstTryGroup[];
}

export interface FirstTries {
    activity: { id: string; title: string; current_version_id: string | null };
    /** Rostered students whose checks are all on older versions (not counted). */
    older_only: number;
    /** Students with later attempts but no attempt 1 kept (FT-9): not counted. */
    no_first: number;
    sections: { section_id: string; students: number }[];
    items: FirstTryItem[];
}

// ---- The reads ---------------------------------------------------------------

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
    const { data, error } = await supabase.rpc(name, args);
    if (error) throw new Error(error.message);
    return data as T;
}

export function fetchClassProgress(classId: string): Promise<ClassProgress> {
    return rpc(CLASS_PROGRESS_RPC, { p_class_id: classId });
}

export function fetchActivityProgress(activityId: string): Promise<ActivityProgress> {
    return rpc(ACTIVITY_PROGRESS_RPC, { p_activity_id: activityId });
}

/** classId NULL = the activity page's form (any class of the caller's). */
export function fetchStudentWork(
    classId: string | null,
    studentId: string,
    activityId: string,
): Promise<StudentWork> {
    return rpc(CLASS_STUDENT_WORK_RPC, {
        p_class_id: classId,
        p_student_id: studentId,
        p_activity_id: activityId,
    });
}

export function fetchMisconceptions(
    classId: string | null,
    activityId: string | null = null,
): Promise<ClassMisconceptions> {
    return rpc(CLASS_MISCONCEPTIONS_RPC, { p_class_id: classId, p_activity_id: activityId });
}

export function fetchFirstTries(activityId: string): Promise<FirstTries> {
    return rpc(ACTIVITY_FIRST_TRIES_RPC, { p_activity_id: activityId });
}

/** The versions' content, read under the teacher's OWN RLS (activity
 * ownership) — 0061 deliberately returns no document content. Read once per
 * page session (versions are immutable): versionContent.ts. */
export function fetchVersionContents(
    versionIds: readonly string[],
): Promise<Map<string, VersionContent>> {
    return getVersionContents(versionIds);
}

/** Registry descriptions for misconception ids (0042; readable when signed in). */
export async function fetchMisconceptionDescriptions(
    ids: readonly string[],
): Promise<Map<string, string | null>> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return new Map();
    const { data, error } = await supabase
        .from('misconception_registry')
        .select('id, description')
        .in('id', unique);
    if (error) throw new Error(error.message);
    return new Map(((data ?? []) as { id: string; description: string | null }[]).map((r) => [r.id, r.description]));
}

// ---- What a cell says (CP-2, CP-6, DR-9) -----------------------------------

export type CellKind = 'none' | 'started' | 'started_unknown' | 'done';

export interface CellStatus {
    kind: CellKind;
    checked: number;
    total: number | null;
    /** The student's shown work is on an older version (CP-6). */
    older: boolean;
    /** Whole percent, Done cells only, when anything was marked. */
    percent: number | null;
}

/** The same precedence as the student's own Home (classActivities.ts
 * progressLabel): the current version when checked, else the older one. */
export function cellStatus(s: (ProgressSummary & { correct?: number; marked?: number }) | null | undefined): CellStatus {
    if (!s || s.shown_version_id === null) {
        return { kind: 'none', checked: 0, total: null, older: false, percent: null };
    }
    const older = s.sections_checked === 0;
    const checked = older ? (s.shown_checked ?? 0) : s.sections_checked;
    const total = older ? s.shown_total : s.sections_total;
    let kind: CellKind;
    if (total === null) kind = 'started_unknown';
    else if (checked >= total) kind = 'done';
    else kind = 'started';
    const marked = s.marked ?? 0;
    const percent =
        kind === 'done' && marked > 0 ? Math.round(((s.correct ?? 0) / marked) * 100) : null;
    return { kind, checked, total, older, percent };
}

/** The words a screen reader hears for a cell (DR-10). */
export function cellWords(c: CellStatus): string {
    const tail = c.older ? ', on an older version' : '';
    switch (c.kind) {
        case 'none':
            return 'not started';
        case 'done':
            return `done${c.percent !== null ? `, ${c.percent} percent` : ''}${tail}`;
        case 'started':
            return `started, ${c.checked} of ${c.total} sections${tail}`;
        case 'started_unknown':
            return `started, total not recorded${tail}`;
    }
}

export interface Tally {
    done: number;
    started: number;
    notStarted: number;
}

export function tally(statuses: readonly CellStatus[]): Tally {
    const t: Tally = { done: 0, started: 0, notStarted: 0 };
    for (const s of statuses) {
        if (s.kind === 'done') t.done += 1;
        else if (s.kind === 'none') t.notStarted += 1;
        else t.started += 1;
    }
    return t;
}

export function tallyWords(t: Tally): string {
    return `${t.done} done · ${t.started} started · ${t.notStarted} not started`;
}

/** DR-7: fewest done, then fewest started, then by name (the incoming order). */
export function leastDoneFirst<T>(rows: readonly T[], tallyOf: (row: T) => Tally): T[] {
    return rows
        .map((row, i) => ({ row, i, t: tallyOf(row) }))
        .sort((a, b) => a.t.done - b.t.done || a.t.started - b.t.started || a.i - b.i)
        .map((x) => x.row);
}

// ---- Hide names (CP-5) -------------------------------------------------------

/** "Student 4": numbered by the roster's name order, so the number a teacher
 * sees does not change when they re-sort. */
export function pseudonyms(students: readonly ProgressStudent[]): Map<string, string> {
    const sorted = [...students].sort(
        (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()) || a.student_id.localeCompare(b.student_id),
    );
    const out = new Map<string, string>();
    sorted.forEach((s) => {
        if (!out.has(s.student_id)) out.set(s.student_id, `Student ${out.size + 1}`);
    });
    return out;
}

// ---- Device-remembered choices (CP-5, DR-7) --------------------------------

export const HIDE_NAMES_KEY = 'progress.hideNames';
export const LEAST_DONE_KEY = 'progress.leastDoneFirst';

export function readFlag(key: string): boolean {
    try {
        return window.localStorage.getItem(key) === '1';
    } catch {
        return false;
    }
}

export function writeFlag(key: string, on: boolean): void {
    try {
        if (on) window.localStorage.setItem(key, '1');
        else window.localStorage.removeItem(key);
    } catch {
        // Private mode or blocked storage: the choice simply isn't remembered.
    }
}

// ---- Back from Responses (DR-8) ---------------------------------------------

/** A `?from=` value is used only when it is an in-app progress path. */
export function safeProgressPath(from: string | null): string | null {
    if (!from) return null;
    if (!/^\/(classes|activity)\/[^/?#]/.test(from)) return null;
    if (from.includes('//') || from.includes('\\') || /[\s<>"]/.test(from)) return null;
    if (!/\/progress(\/|$|\?)/.test(from)) return null;
    return from;
}

export function responsesHref(activityId: string, fromPath: string): string {
    return `/activity/${activityId}/responses?from=${encodeURIComponent(fromPath)}`;
}

/** "9:41", or "Mon 9:41" when it is not today. */
export function clockTime(d: Date, now: Date = new Date()): string {
    const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return time;
    return `${d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} ${time}`;
}
