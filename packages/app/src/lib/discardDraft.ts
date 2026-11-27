// =============================================================================
// discardDraft.ts — "Discard changes": back to the published version
// (2026-11-15)
// -----------------------------------------------------------------------------
// A published activity with no draft opens from its current version
// (ActivityEditor's load order: draft > published version > empty), so going
// back is clearing `draft_content`. Two more things ride the same UPDATE:
//   - `title`, from the published version: autosave keeps the column equal to
//     the draft's title, and the Activities list reads the column;
//   - G-8's conflict guard: only over the version of the row this tab last
//     saw, so a newer edit from another tab or device is never thrown away
//     unseen.
// Tags, type and time estimate are row columns the published copy does not
// hold, so they stay as they are.
// =============================================================================

import { supabase } from './supabase';
import { requestUpdatedAtStamp } from './updatedAtStamp';

export const DISCARD_COPY = {
    button: 'Discard changes',
    title: 'Discard your changes?',
    body: 'The activity goes back to the version students have now. Everything you changed since it was last published is lost, and this can’t be undone.',
    kept: 'Tags, type and time estimate stay as they are.',
    confirm: 'Discard changes',
    cancel: 'Keep editing',
    conflict: 'This activity changed in another tab or on another device. Reload to see the latest, then try again.',
    gone: 'Couldn’t find the published version of this activity.',
    unsaved: 'Your latest edits haven’t saved yet, so nothing was discarded. Check your connection and try again.',
} as const;

/**
 * Clear the draft. `knownUpdatedAt` is the row's updated_at as this tab last
 * saw it (null = unchecked, the state just after a publish). Throws with the
 * teacher-facing message when it cannot.
 */
export async function discardDraft(activityId: string, knownUpdatedAt: string | null): Promise<void> {
    const { data: row, error: rowErr } = await supabase
        .from('activities')
        .select('current_version_id')
        .eq('id', activityId)
        .maybeSingle();
    if (rowErr) throw new Error(rowErr.message);
    const versionId = (row as { current_version_id: string | null } | null)?.current_version_id;
    if (!versionId) throw new Error(DISCARD_COPY.gone);

    const { data: version, error: vErr } = await supabase
        .from('activity_versions')
        .select('title:content->meta->>title')
        .eq('id', versionId)
        .maybeSingle();
    if (vErr) throw new Error(vErr.message);
    const title = (version as { title: string | null } | null)?.title;
    if (!title) throw new Error(DISCARD_COPY.gone);

    let query = supabase
        .from('activities')
        .update({ draft_content: null, title, ...requestUpdatedAtStamp() })
        .eq('id', activityId);
    if (knownUpdatedAt !== null) query = query.eq('updated_at', knownUpdatedAt);
    const { data, error } = await query.select('updated_at');
    if (error) throw new Error(error.message);
    if ((data ?? []).length === 0) throw new Error(DISCARD_COPY.conflict);
}
