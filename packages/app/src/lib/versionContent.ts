// =============================================================================
// versionContent.ts — the teacher pages' one copy of each version's document
// -----------------------------------------------------------------------------
// Efficiency audit 2026-10 #8 + #12 (decision 2, ruled 2026-10-18). A published
// version's content NEVER changes (activity_versions rows are immutable), yet
// Responses re-downloaded every version in its queue on every grade save, and
// the progress answer panel re-downloaded the document for every student
// opened. Each version is now read once per page session.
//
//   • In memory only — never localStorage: these are answer-key documents read
//     under the teacher's own RLS, and nothing here should outlive the tab.
//   • Keyed by (signed-in user, version). A different user in the same tab
//     starts from empty, so one account's reads never serve another's.
//   • One request per batch of unseen ids; a concurrent ask for an id already
//     in flight waits on that request instead of starting another.
//   • A failed request is forgotten, so the next ask tries again.
//   • An id the read did not return (not visible to this user) is reported
//     absent, exactly as the uncached read reported it, and is NOT remembered:
//     access can be granted later in the same tab.
// =============================================================================

import { signedInUserId } from './currentUser';
import { supabase } from './supabase';

export interface VersionContent {
    version_num: number;
    content: unknown;
}

let cacheUser: string | null = null;
const cache = new Map<string, Promise<VersionContent | null>>();

/** Test seam: forget everything (the module outlives a single test). */
export function resetVersionContentCache(): void {
    cache.clear();
    cacheUser = null;
}

/** The documents for `versionIds`, from memory where already read. */
export async function getVersionContents(
    versionIds: readonly string[],
): Promise<Map<string, VersionContent>> {
    const ids = [...new Set(versionIds)];
    const out = new Map<string, VersionContent>();
    if (ids.length === 0) return out;

    const user = (await signedInUserId()) ?? '';
    if (user !== cacheUser) {
        cache.clear();
        cacheUser = user;
    }

    const missing = ids.filter((id) => !cache.has(id));
    if (missing.length > 0) {
        const batch = (async () => {
            const { data, error } = await supabase
                .from('activity_versions')
                .select('id, version_num, content')
                .in('id', missing);
            if (error) throw new Error(error.message);
            return new Map(
                ((data ?? []) as { id: string; version_num: number; content: unknown }[]).map((r) => [
                    r.id,
                    { version_num: r.version_num, content: r.content },
                ]),
            );
        })();
        for (const id of missing) {
            const entry = batch.then((rows) => rows.get(id) ?? null);
            cache.set(id, entry);
            // Forget a failed read, and an absent one — but only if it is still
            // this entry (a user switch may already have cleared and refilled
            // the map).
            const forget = () => {
                if (cache.get(id) === entry) cache.delete(id);
            };
            entry.then((found) => {
                if (!found) forget();
            }, forget);
        }
    }

    const results = await Promise.all(ids.map(async (id) => [id, await cache.get(id)!] as const));
    for (const [id, row] of results) if (row) out.set(id, row);
    return out;
}
