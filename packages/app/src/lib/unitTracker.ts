// =============================================================================
// unitTracker.ts — the student unit tracker's reads and write (migration 0074)
// -----------------------------------------------------------------------------
// docs/design/student-unit-tracker.md (UT-1…UT-12). Typed wrappers over the
// definer functions, plus the pure rules for what a row and a next line say.
// Every status and next-step rule lives in the SQL; verify-0074 owns them.
//
// ⚠ Called only from the LAZY tracker route. Keep it out of the student shell.
// =============================================================================

import { supabase } from './supabase';
import { UNIT_TRACKER_RPC } from './unitTrackerRpc';

export type TrackerStatus = 'not_started' | 'learning' | 'keep_practising' | 'passed';

/** UT-4, ruled: what a student reads. "Getting stuck" stays the teacher's word. */
export const TRACKER_WORDS: Record<TrackerStatus, string> = {
    not_started: 'Not started',
    learning: 'Learning',
    keep_practising: 'Keep practising',
    passed: 'Passed',
};

export const HARDER_NOTE = 'Harder questions are now in your practice';

export interface TeacherTrackerRow {
    skill_id: string;
    label: string;
    wording: string | null;
    letters: string[];
}

export interface StudentTrackerRow extends TeacherTrackerRow {
    status: TrackerStatus;
    harder: boolean;
}

export type TrackerNext =
    | { kind: 'check'; skill_id: string; activity_id: string; title: string }
    | { kind: 'practice'; skill_id: string; activity_id: string; version_id: string }
    | { kind: 'retake'; skill_id: string; activity_id: string }
    | { kind: 'wait'; skill_id: string }
    | { kind: 'all_passed' }
    | { kind: 'up_next'; activity_id: string; title: string };

export interface StudentTrackerUnit {
    unit: string;
    rows: StudentTrackerRow[];
    next: TrackerNext | null;
}

export interface TeacherTrackerUnit {
    unit: string;
    rows: TeacherTrackerRow[];
}

/** UT-7: the teacher's wording stands alone; the fallback is label + letters. */
export function rowText(row: TeacherTrackerRow): string {
    if (row.wording) return row.wording;
    return row.letters.length > 0 ? `${row.label} · ${row.letters.join(' ')}` : row.label;
}

/** UT-8 + UT-12: the unit's one next line, with where it goes (if anywhere). */
export function nextLine(unit: StudentTrackerUnit): { text: string; href: string | null } | null {
    const next = unit.next;
    if (!next) return null;
    const row = (skillId: string) => {
        const found = unit.rows.find((r) => r.skill_id === skillId);
        return found ? rowText(found) : 'this skill';
    };
    switch (next.kind) {
        case 'check':
            return { text: `Your next check: ${next.title}`, href: `/a/${next.activity_id}` };
        case 'practice':
            return {
                text: `Practise ${row(next.skill_id)} first`,
                href: `/a/${next.activity_id}/practice/${next.version_id}`,
            };
        case 'retake':
            return { text: 'Try the check again', href: `/a/${next.activity_id}` };
        case 'wait':
            return { text: 'Your new version of the check opens on your next practice day.', href: null };
        case 'all_passed':
            return { text: 'Everything you’ve been taught here is passed.', href: null };
        case 'up_next':
            return { text: `Next up: ${next.title}`, href: `/a/${next.activity_id}` };
    }
}

export async function fetchMyTracker(classId: string): Promise<StudentTrackerUnit[]> {
    const { data, error } = await supabase.rpc(UNIT_TRACKER_RPC.mine, { p_class_id: classId });
    if (error) throw error;
    return (data as { units: StudentTrackerUnit[] }).units;
}

export async function fetchClassTracker(classId: string): Promise<TeacherTrackerUnit[]> {
    const { data, error } = await supabase.rpc(UNIT_TRACKER_RPC.teacher, { p_class_id: classId });
    if (error) throw error;
    return (data as { units: TeacherTrackerUnit[] }).units;
}

/** Empty wording removes the row's wording, which returns it to the fallback. */
export async function saveTrackerWording(skillId: string, wording: string): Promise<void> {
    const { error } = await supabase.rpc(UNIT_TRACKER_RPC.setWording, {
        p_skill_id: skillId,
        p_wording: wording,
    });
    if (error) throw error;
}
