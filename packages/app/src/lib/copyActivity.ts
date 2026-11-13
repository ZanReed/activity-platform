// =============================================================================
// copyActivity.ts — "Make a copy" of a teacher's own activity (UI review E-1,
// docs/design/ui-review-group-e.md)
// -----------------------------------------------------------------------------
// A new DRAFT owned by the same teacher: the source's draft (or, if it has
// none, its published version), titled "… (copy)". It is not published and
// is in no class. Ruled: a catalogue (file-backed) activity's copy is a normal
// editable activity — `source_path`/`source_key`/`source_fingerprint` are NOT
// carried, so the importer never treats the copy as its file. Bank provenance
// (`copied_from_*`) is not set either: that marks a copy OF A LISTED activity,
// and the Bank's "In your library" reads it.
// =============================================================================

import { supabase } from './supabase';
import { slugify, slugWithSuffix } from './slug';

interface SourceRow {
    title: string;
    course: string | null;
    unit: string | null;
    description: string | null;
    tags: string[] | null;
    pedagogical_role: string | null;
    draft_content: unknown;
    current_version_id: string | null;
}

export function copyTitle(title: string): string {
    return `${title} (copy)`;
}

/** Copy activity `sourceId` for `ownerId`; returns the new activity's id. */
export async function copyOwnActivity(sourceId: string, ownerId: string): Promise<string> {
    const { data: src, error } = await supabase
        .from('activities')
        .select('title, course, unit, description, tags, pedagogical_role, draft_content, current_version_id')
        .eq('id', sourceId)
        .single();
    if (error) throw new Error(error.message);
    const row = src as SourceRow;

    let content = row.draft_content;
    if (content == null && row.current_version_id) {
        const { data: v, error: vErr } = await supabase
            .from('activity_versions')
            .select('content')
            .eq('id', row.current_version_id)
            .single();
        if (vErr) throw new Error(vErr.message);
        content = (v as { content: unknown }).content;
    }
    if (content == null || typeof content !== 'object') {
        throw new Error('This activity has nothing to copy yet.');
    }

    const title = copyTitle(row.title);
    const doc = content as { meta?: Record<string, unknown> };
    const draft = { ...doc, meta: { ...(doc.meta ?? {}), title } };
    const base = slugify(title);
    for (let attempt = 0; attempt < 10; attempt++) {
        const { data, error: insErr } = await supabase
            .from('activities')
            .insert({
                owner_id: ownerId,
                title,
                slug: slugWithSuffix(base, attempt),
                course: row.course,
                unit: row.unit,
                description: row.description,
                tags: row.tags ?? [],
                pedagogical_role: row.pedagogical_role,
                draft_content: draft,
            })
            .select('id')
            .single();
        if (insErr) {
            if (insErr.code === '23505') continue; // slug taken — next suffix
            throw new Error(insErr.message);
        }
        if (!data) throw new Error('The copy was not created.');
        return (data as { id: string }).id;
    }
    throw new Error('Could not make the copy. Please try again.');
}
