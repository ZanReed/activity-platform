// =============================================================================
// republishImpact.ts — what a republish does to students (UI review G-3)
// -----------------------------------------------------------------------------
// Checks are recorded per version (0040, 0060), so on a new version every
// section starts unchecked — locked and DoL ones included. Answers a student
// hasn't checked are NOT lost: S6-9 keeps them on the version they started
// until they check them. The editor asks first only when someone has started.
// =============================================================================

import { fetchActivityProgress } from './classProgress';

/** Students (across the teacher's classes) with any section checked on the
 *  current version; null when the read fails. */
export async function startedStudentCount(activityId: string): Promise<number | null> {
    try {
        const progress = await fetchActivityProgress(activityId);
        const started = new Set<string>();
        for (const c of progress.classes) {
            for (const s of c.students) if (s.sections_checked > 0) started.add(s.student_id);
        }
        return started.size;
    } catch {
        return null;
    }
}

/** Does this document lock sections (submission mode) or carry a DoL? */
export function hasLockedOrDol(doc: unknown): boolean {
    if (typeof doc !== 'object' || doc === null) return false;
    const d = doc as { meta?: { submissionMode?: unknown } };
    if (d.meta?.submissionMode === 'locked') return true;
    let found = false;
    const walk = (v: unknown): void => {
        if (found || typeof v !== 'object' || v === null) return;
        if (Array.isArray(v)) return v.forEach(walk);
        const o = v as Record<string, unknown>;
        if (typeof o.dol === 'object' && o.dol !== null) {
            found = true;
            return;
        }
        Object.values(o).forEach(walk);
    };
    walk(doc);
    return found;
}

/**
 * "No changes" (G-3): the activity is live, no draft is held, the document's
 * change key is the one it had at the last clean point (loaded with no draft,
 * or the key flushed for the last successful publish), and nothing is saving.
 * Any of those false and Republish has something to send.
 */
export function isNoChanges(s: {
    live: boolean;
    hasDraft: boolean;
    changeKey: string | null;
    cleanKey: string | null;
    saving: boolean;
}): boolean {
    return s.live && !s.hasDraft && s.changeKey !== null && s.changeKey === s.cleanKey && !s.saving;
}

export const REPUBLISH_COPY = {
    title: 'Republish for your students?',
    started: (n: number | null) =>
        n === null ? 'Students may have started this.' : `${n} student${n === 1 ? ' has' : 's have'} started this.`,
    body: 'On the new version their sections start unchecked. Answers they haven’t checked stay with the version they started until they check them.',
    locked: 'Locked and DoL sections start again for everyone.',
    confirm: 'Republish',
    cancel: 'Keep editing',
    noChanges: 'No changes',
    noChangesTitle: 'Students already have the latest version',
} as const;
