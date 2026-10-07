// =============================================================================
// bank.ts — the Activity Bank's data layer (0054; docs/design/activity-bank.md)
// -----------------------------------------------------------------------------
// Copy-on-use: a teacher browses the LISTED activities and adds a copy they
// OWN, so every owner surface (share, Responses, analytics, print, editor)
// then works for it unchanged. Every call here is a SECURITY DEFINER RPC with
// a fixed column set; nothing reads another teacher's rows directly, and
// can_read_activity is never widened.
// =============================================================================

import type { TeacherGuide } from '@activity/schema';
import { supabase } from './supabase';
import {
    BANK_TEACHER_GUIDE_RPC,
    COPY_BANK_ACTIVITY_RPC,
    IS_BANK_LISTER_RPC,
    LIST_BANK_RPC,
    SET_ACTIVITY_LISTING_RPC,
    SET_PUBLIC_NAME_RPC,
} from './edgeFunctions';

/** One listed activity, as list_bank returns it (catalogue-safe columns). */
export interface BankEntry {
    id: string;
    title: string;
    description: string | null;
    course: string;
    unit: string | null;
    tags: string[];
    pedagogical_role: string | null;
    activity_type: string;
    source_path: string | null;
    has_guide: boolean;
    version_num: number;
    published_at: string;
    /** The author's name, ONLY if they opted in (0055, BK-13); else null. */
    author_name: string | null;
}

export async function listBank(): Promise<BankEntry[]> {
    const { data, error } = await supabase.rpc(LIST_BANK_RPC);
    if (error) throw new Error(error.message);
    return (data ?? []) as BankEntry[];
}

/** The current version's teacher guide, or null (none, or not listed). */
export async function getBankTeacherGuide(activityId: string): Promise<TeacherGuide | null> {
    const { data, error } = await supabase.rpc(BANK_TEACHER_GUIDE_RPC, {
        p_activity_id: activityId,
    });
    if (error) throw new Error(error.message);
    return (data ?? null) as TeacherGuide | null;
}

/** Copy a listed activity into the caller's library; returns the new id.
 *  The copy arrives PUBLISHED (BK-2), ready to share to a class. */
export async function copyBankActivity(activityId: string): Promise<string> {
    const { data, error } = await supabase.rpc(COPY_BANK_ACTIVITY_RPC, {
        p_activity_id: activityId,
    });
    if (error) throw new Error(error.message);
    return data as string;
}

/** List or unlist one of the caller's activities (curator only to list). */
export async function setActivityListing(activityId: string, listed: boolean): Promise<void> {
    const { error } = await supabase.rpc(SET_ACTIVITY_LISTING_RPC, {
        p_activity_id: activityId,
        p_listed: listed,
    });
    if (error) throw new Error(error.message);
}

/** Whether the signed-in teacher may list (BK-3: caps-exempt or admin). */
export async function isBankLister(): Promise<boolean> {
    const { data, error } = await supabase.rpc(IS_BANK_LISTER_RPC);
    if (error) return false;
    return data === true;
}

/** The signed-in teacher's Bank name, and whether it is shown (opted in). */
export interface PublicName {
    name: string | null;
    optedIn: boolean;
}

export async function getMyPublicName(userId: string): Promise<PublicName> {
    const { data, error } = await supabase
        .from('users')
        .select('display_name, name_opt_in_at')
        .eq('id', userId)
        .maybeSingle();
    if (error) throw new Error(error.message);
    const row = data as { display_name: string | null; name_opt_in_at: string | null } | null;
    return { name: row?.display_name ?? null, optedIn: Boolean(row?.name_opt_in_at) };
}

/** Opt in with a name, or opt out with an empty string (0055, BK-13). */
export async function setPublicName(name: string): Promise<PublicName> {
    const { data, error } = await supabase.rpc(SET_PUBLIC_NAME_RPC, { p_name: name });
    if (error) throw new Error(error.message);
    const out = data as { display_name: string | null; opted_in: boolean };
    return { name: out.display_name, optedIn: out.opted_in };
}

/** The licence the Bank names on its header (BK-10; the July red-team's A6). */
export const BANK_LICENSE = 'CC BY-NC-SA 4.0';
