// =============================================================================
// recentlyDeleted.ts — what a teacher deleted, and putting it back (UI review
// G-5 / G-6; migration 0086)
// -----------------------------------------------------------------------------
// Classes and activities are soft-deleted; the list queries and RLS hide them,
// so these go through 0086's owner-scoped DEFINER RPCs. A failed read is
// reported to the caller, which hides the section (the page still works —
// and before 0086 is applied the RPCs simply don't exist yet).
// =============================================================================

import { supabase } from './supabase';

export interface DeletedItem {
    id: string;
    label: string;
    deletedAt: string;
    /** When it is removed for good; null when nothing removes it (classes). */
    purgeAfter: string | null;
}

export async function listDeletedClasses(): Promise<DeletedItem[]> {
    const { data, error } = await supabase.rpc('list_deleted_classes');
    if (error) throw new Error(error.message);
    return ((data ?? []) as { id: string; name: string; deleted_at: string }[]).map((r) => ({
        id: r.id,
        label: r.name,
        deletedAt: r.deleted_at,
        purgeAfter: null,
    }));
}

export async function listDeletedActivities(): Promise<DeletedItem[]> {
    const { data, error } = await supabase.rpc('list_deleted_activities');
    if (error) throw new Error(error.message);
    return ((data ?? []) as { id: string; title: string; deleted_at: string; purge_after: string }[]).map((r) => ({
        id: r.id,
        label: r.title,
        deletedAt: r.deleted_at,
        purgeAfter: r.purge_after,
    }));
}

export async function restoreClass(classId: string): Promise<void> {
    const { error } = await supabase.rpc('restore_class', { p_class_id: classId });
    if (error) throw new Error(error.message);
}

export async function restoreActivity(activityId: string): Promise<void> {
    const { error } = await supabase.rpc('restore_activity', { p_activity_id: activityId });
    if (error) throw new Error(error.message);
}
