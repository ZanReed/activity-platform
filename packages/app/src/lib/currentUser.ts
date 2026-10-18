import { supabase } from './supabase';

/**
 * The signed-in user's id, from the client's stored session (no network), or
 * null when signed out. For narrowing reads to "mine" (efficiency audit #4)
 * and keying per-user caches — never as an authorization check: RLS and the
 * RPCs decide what a caller may read.
 */
export async function signedInUserId(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
}
