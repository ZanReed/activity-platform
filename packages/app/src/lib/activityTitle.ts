// =============================================================================
// activityTitle.ts — the one read the results header makes (UI review C-7):
// an activity's title, for pages that have no other reason to fetch it
// (Responses, Analytics). Its own module so a page test can stub it.
// =============================================================================

import { supabase } from './supabase';

/** The activity's title, or null if it can't be read (RLS, missing, offline). */
export async function fetchActivityTitle(activityId: string): Promise<string | null> {
    try {
        const { data } = await supabase.from('activities').select('title').eq('id', activityId).maybeSingle();
        return data && typeof data.title === 'string' ? data.title : null;
    } catch {
        return null;
    }
}
