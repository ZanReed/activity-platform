// =============================================================================
// misconceptionList.ts — the course's misconception list, for the editor's
// picker (misconception-ids GUI amendment 2026-11-12, M-2/M-3/M-5)
// -----------------------------------------------------------------------------
// `misconception_registry` (0042) mirrors the curriculum side's list: an id and
// a description each (115 rows at 2026-11-12; none carries a skill yet).
// Teachers read it and never write it: binding one of their own wrong answers
// to an id is authoring their activity, but the list itself is curriculum data.
// Fetched once per page load, and only when an editor field needs it.
// =============================================================================

import { supabase } from './supabase';

export interface MisconceptionEntry {
    id: string;
    description: string | null;
}

let cached: Promise<MisconceptionEntry[]> | null = null;

export function fetchMisconceptionList(): Promise<MisconceptionEntry[]> {
    cached ??= (async () => {
        const { data, error } = await supabase.from('misconception_registry').select('id, description').order('id');
        if (error) {
            cached = null;
            throw new Error(error.message);
        }
        return (data ?? []) as MisconceptionEntry[];
    })();
    return cached;
}

/** The entries a search matches, best first: the description or the id
 *  contains every word typed (case-insensitive). */
export function searchMisconceptions(
    list: readonly MisconceptionEntry[],
    query: string,
    limit = 8,
): MisconceptionEntry[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return list.slice(0, limit);
    const hay = (e: MisconceptionEntry) => `${e.description ?? ''} ${e.id}`.toLowerCase();
    return list.filter((e) => words.every((w) => hay(e).includes(w))).slice(0, limit);
}

/** M-6: when a binding takes effect, said where it is set. */
export const MISCONCEPTION_HELP =
    'Recorded with a student’s wrong answer from the next publish, and grouped on the class’s misconception view.';
