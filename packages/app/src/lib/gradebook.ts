// =============================================================================
// gradebook.ts — the marks the class gradebook file adds to the progress grid
// (migration 0102, docs/design/gradebook-export.md GB-1..GB-13)
// -----------------------------------------------------------------------------
// One typed read. Every scoping and counting rule lives in the SQL (live
// roster × this class's activities; released grades only; closed graded
// practice sessions); verify-0102 owns them. lib/progressCsv only formats.
//
// ⚠ Called only from the LAZY class progress route, on the download click.
// =============================================================================

import { supabase } from './supabase';
import { CLASS_GRADEBOOK_RPC } from './edgeFunctions';

/** One student on one activity with hand-graded questions, on the version the
 * grid shows. `possible` is the rubric's whole total for that version. */
export interface GradebookHand {
    student_id: string;
    activity_id: string;
    /** Released points, the latest released grade per question across versions. */
    points: number;
    possible: number;
    /** POINTS of questions with no released grade yet. */
    pending: number;
    /** Released grades whose answer has changed since. */
    stale: number;
    /** Released grades carried from an earlier version. */
    from_older: number;
}

export interface GradebookPractice {
    student_id: string;
    review: boolean;
    right: number;
    planned: number;
    sessions: number;
    latest_right: number;
    latest_planned: number;
}

export interface ClassGradebook {
    students: { student_id: string; email: string | null }[];
    hand: GradebookHand[];
    hand_activities: string[];
    dol: { student_id: string; activity_id: string; source: 'auto' | 'teacher' }[];
    dol_activities: string[];
    practice: GradebookPractice[];
    practice_shown: boolean;
    /** The class's own date, 'YYYY-MM-DD'. */
    today: string;
}

export async function fetchClassGradebook(classId: string): Promise<ClassGradebook> {
    const { data, error } = await supabase.rpc(CLASS_GRADEBOOK_RPC, { p_class_id: classId });
    if (error) throw new Error(error.message);
    return data as ClassGradebook;
}
