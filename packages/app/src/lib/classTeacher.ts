// =============================================================================
// classTeacher.ts — class helpers only the teacher's Classes screens use
// -----------------------------------------------------------------------------
// Kept out of lib/classes.ts on purpose: students' Home loads that file, and
// its journey budget should not pay for the teacher's roster and join board.
// =============================================================================

import { supabase } from './supabase';

/**
 * Each class's count of current students (removed ones excluded), in one read:
 * PostgREST counts the embedded class_members rows, and the removed_at filter
 * applies to the count (checked against the local stack, 2026-11-15). RLS
 * scopes it to the teacher's own classes. Classes the answer leaves out have
 * no count, and the card shows none.
 */
export async function countActiveStudents(): Promise<Map<string, number>> {
    const { data, error } = await supabase
        .from('classes')
        .select('id, class_members(count)')
        .is('class_members.removed_at', null);
    if (error) throw new Error(error.message);
    const out = new Map<string, number>();
    for (const r of (data ?? []) as { id: string; class_members?: { count: number }[] }[]) {
        const n = r.class_members?.[0]?.count;
        if (typeof n === 'number') out.set(r.id, n);
    }
    return out;
}

/** The words a teacher posts for students. One definition, tested. */
export function joinInstructions(className: string, code: string, url: string): string {
    return `To join ${className}: open ${url} and sign in with your school Google account. The class code is ${code}.`;
}
