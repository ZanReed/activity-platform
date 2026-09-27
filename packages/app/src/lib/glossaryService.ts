/**
 * glossaryService.ts — the student route's course-glossary read (migration
 * 0043, docs/design/glossary.md R1, R6, EN-9).
 *
 * The viewer package has no Supabase client and must not grow one, so the
 * route injects this, exactly as it injects the check service. The read is
 * ONE PostgREST RPC returning one jsonb (never a row set — the 1,000-row
 * default would truncate a big glossary silently, EN-1); the viewer's cache
 * owns everything after the wire: joining in-flight reads, the single retry,
 * the developer signal, and validation (lazy, so zod stays off the shell).
 *
 * THROWS ON FAILURE, on purpose (grading.ts's rule): the degrade — activity-
 * local terms only, silent to the student, one console.warn — lives in the
 * cache, so every implementation of the port degrades identically.
 */
import { createGlossaryCache, type GlossaryCache, type GlossaryService } from '@activity/viewer';
import { GLOSSARY_FOR_ACTIVITY_RPC } from './edgeFunctions';
import { supabase } from './supabase';

export const glossaryService: GlossaryService = {
  async load(activityId) {
    const { data, error } = await supabase.rpc(GLOSSARY_FOR_ACTIVITY_RPC, {
      p_activity_id: activityId,
    });
    if (error) throw new Error(error.message);
    return data as unknown;
  },
};

let cache: GlossaryCache | null = null;

/**
 * The page's one cache (R6): one read per activity per page load, no TTL, no
 * localStorage. A module singleton rather than route state so a remount of
 * the viewer (a version refresh, a takeover) never re-fetches.
 */
export function studentGlossaryCache(): GlossaryCache {
  cache ??= createGlossaryCache(glossaryService);
  return cache;
}
