// =============================================================================
// mixedTeacher.ts — the teacher's mixed practice calls (D43, slice 4)
// -----------------------------------------------------------------------------
// docs/design/mixed-practice-teacher-panel.md and mixed-practice.md →
// "Slice 4 — as built". Thin, typed wrappers over 0066/0068's teacher reads
// and switches; every rule lives in the database.
//
// ⚠ Called only from the LAZY /classes/:classId/facts route — keep it out of
// anything the shell imports.
// =============================================================================

import { supabase } from './supabase';
import { MIXED_PRACTICE_RPC } from './mixedPracticeRpc';

/** A skill as the panel shows it: the mirrored label, else the id (W-6). */
export interface SkillRef {
    id: string;
    label: string | null;
}

export type MixedBlockedReason = 'mixed_settings_not_mirrored' | 'school_year_end_missing' | 'school_year_ended';

export interface MixedSummary {
    on_at: string | null;
    reason: MixedBlockedReason | null;
    items_per_session: number | null;
    default_items: number | null;
    graded: boolean;
    school_year_ends_on: string | null;
    has_bank: boolean;
    in_class: number;
    practised_today: number;
    practised_week: number;
    skills: {
        skill_id: string;
        label: string | null;
        students_practising: number;
        struggling: number;
        first_tries_right: number;
        first_tries: number;
        skips: number;
    }[];
}

export interface MixedStudentRow {
    student_id: string;
    name: string;
    days_this_week: number;
    struggling: SkillRef[];
    latest_score: { right: number; answered: number; planned: number; practice_day: string } | null;
    score_in_progress: boolean;
}

export interface WhoFirst {
    mixed_on: boolean;
    facts_on: boolean;
    started_today: number;
    stuck: { student_id: string; name: string; skills: SkillRef[] }[];
    facts: { student_id: string; name: string; families: string[] }[];
    same_mistake: {
        student_id: string;
        name: string;
        mistakes: { id: string; label: string | null; skills: SkillRef[] }[];
    }[];
    everyone_else: number;
}

export interface RecentTry {
    practice_day: string;
    kind: 'skill' | 'discrimination';
    skill_id: string;
    skill_label: string | null;
    correct: boolean;
    skipped: boolean;
    mistakes: { id: string; label: string | null }[];
}

async function call<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    const { data, error } = await supabase.rpc(fn, args);
    if (error) throw new Error(error.message);
    return data as T;
}

export const fetchMixedSummary = (classId: string) =>
    call<MixedSummary>(MIXED_PRACTICE_RPC.summary, { p_class_id: classId });
export const fetchMixedStudents = (classId: string) =>
    call<MixedStudentRow[]>(MIXED_PRACTICE_RPC.students, { p_class_id: classId });
export const fetchWhoFirst = (classId: string) =>
    call<WhoFirst>(MIXED_PRACTICE_RPC.whoFirst, { p_class_id: classId });
export const fetchStudentRecent = (classId: string, studentId: string) =>
    call<RecentTry[]>(MIXED_PRACTICE_RPC.studentRecent, { p_class_id: classId, p_student_id: studentId });
export const setMixedPractice = (classId: string, on: boolean) =>
    call<{ on: boolean; on_at: string | null }>(MIXED_PRACTICE_RPC.setOn, { p_class_id: classId, p_on: on });
export const setMixedSettings = (classId: string, items: number | null, graded: boolean) =>
    call<unknown>(MIXED_PRACTICE_RPC.setSettings, { p_class_id: classId, p_items: items, p_graded: graded });

/** A skill's words: the label, else its id (W-6's fallback). */
export const skillName = (s: SkillRef) => s.label ?? s.id;
