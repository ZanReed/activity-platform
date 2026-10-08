// =============================================================================
// chainHooks.ts — the chain hook view's data layer (0057;
// docs/design/chain-hooks-view.md)
// -----------------------------------------------------------------------------
// Hooks are teacher-only (their notes carry answers). Every read goes through
// ONE definer RPC, my_chain_hooks (D1): pools for every chain the caller owns
// an activity in, own or a Bank copy's original (D2), the caller's own pool
// winning. The "used" marks are plain rows in class_hook_use, which RLS scopes
// to the class's teacher (CH-9).
//
// Every caller treats a FAILED read as "no hooks", never as an error that
// stops its own page (D3): the Activities list stays exactly as it was.
// =============================================================================

import { supabase } from './supabase';
import { formatListDate } from './classActivities';
import { MY_CHAIN_HOOKS_RPC } from './edgeFunctions';

/** One hook, as the curriculum authored it (C-97). Text is PLAIN: render it
 *  literally, never through the markdown/math pipeline ("$4" is money). */
export interface ChainHook {
    id: string;
    connects_to: { id: string; label: string }[];
    prompt: string;
    note: string;
}

export interface MyChainHooks {
    /** activity id → chain id, for every chained activity the caller owns. */
    activityChains: Record<string, string>;
    /** chain id → its live pool in authored order (only chains WITH a pool). */
    chains: Record<string, ChainHook[]>;
}

export const NO_CHAIN_HOOKS: MyChainHooks = { activityChains: {}, chains: {} };

export async function fetchMyChainHooks(): Promise<MyChainHooks> {
    const { data, error } = await supabase.rpc(MY_CHAIN_HOOKS_RPC);
    if (error) throw new Error(error.message);
    const d = (data ?? {}) as Partial<MyChainHooks>;
    return { activityChains: d.activityChains ?? {}, chains: d.chains ?? {} };
}

/** The chains (with a live pool) among these activities, in first-seen order.
 *  Usually one per unit; a unit string shared by two chains gets two (Section
 *  1 #3 of the eng review). */
export function chainsWithHooks(data: MyChainHooks, activityIds: readonly string[]): string[] {
    const out: string[] = [];
    for (const id of activityIds) {
        const chain = data.activityChains[id];
        if (chain && (data.chains[chain]?.length ?? 0) > 0 && !out.includes(chain)) out.push(chain);
    }
    return out;
}

/** The chain page's URL. Chain ids are dotted slugs, safe in a path segment. */
export function chainHooksPath(chainId: string): string {
    return `/chains/${encodeURIComponent(chainId)}`;
}

// ---- used marks (CH-9) ----------------------------------------------------------

export interface HookMark {
    hook_id: string;
    /** A `date` column: 'YYYY-MM-DD', no time, no zone. */
    used_on: string;
}

export async function listHookMarks(classId: string): Promise<HookMark[]> {
    const { data, error } = await supabase
        .from('class_hook_use')
        .select('hook_id, used_on')
        .eq('class_id', classId);
    if (error) throw new Error(error.message);
    return (data ?? []) as HookMark[];
}

/** Mark used, or change the date: ONE row per (class, hook) — an upsert. */
export async function markHookUsed(
    classId: string,
    hookId: string,
    usedOn: string,
    teacherId: string,
): Promise<void> {
    const { error } = await supabase
        .from('class_hook_use')
        .upsert(
            { class_id: classId, hook_id: hookId, used_on: usedOn, marked_by: teacherId },
            { onConflict: 'class_id,hook_id' },
        );
    if (error) throw new Error(error.message);
}

/** Unmark: the row goes (CH-9d — planning state, not student work). */
export async function unmarkHook(classId: string, hookId: string): Promise<void> {
    const { error } = await supabase
        .from('class_hook_use')
        .delete()
        .eq('class_id', classId)
        .eq('hook_id', hookId);
    if (error) throw new Error(error.message);
}

// ---- dates --------------------------------------------------------------------------

/**
 * A `date` value as a LOCAL date. `new Date('2026-02-12')` parses as UTC
 * midnight, so a US browser would show Feb 11 — the trap the design review
 * found (Pass 5) and the eng re-run pinned to this pure helper (S2 #2).
 */
export function dateOnlyToLocalDate(value: string): Date {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Today in the BROWSER's zone, as a `date` value (eng review scope finding 4:
 *  never the server's UTC date). */
export function localToday(now: Date = new Date()): string {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** "12 Feb" / "Feb 12" by the viewer's locale, year only when not this year —
 *  the shared list date (formatListDate), fed a local date. */
export function formatUsedOn(value: string): string {
    return formatListDate(dateOnlyToLocalDate(value).toISOString());
}

/** A hook's short name for accessible labels and announcements (RT1): its
 *  first eight words, with an ellipsis when cut. */
export function hookShortName(prompt: string): string {
    const words = prompt.trim().split(/\s+/);
    return words.length <= 8 ? words.join(' ') : `${words.slice(0, 8).join(' ')}…`;
}
