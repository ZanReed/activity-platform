// =============================================================================
// practiceBank.ts — the teacher's read of their practice-bank items (0058)
// -----------------------------------------------------------------------------
// docs/design/practice-banks.md (PB-11, BE-8, BE-11). One owner-scoped SELECT
// policy guards practice_item, so these reads return the caller's own rows
// only. Nothing here is reachable by a student: they own no rows, and no
// student surface imports this module.
// =============================================================================

import { supabase } from './supabase';

/** One practice-bank item as the chain page lists it. */
export interface BankItemRow {
    item_id: string;
    bank_path: string;
    role: 'skill' | 'discrimination';
    skill_id: string | null;
    discriminates: string[];
    status: 'draft' | 'ratified';
    position: number;
}

/**
 * The caller's live items for one chain, in file then template order. FAIL-SOFT
 * to [] on any error — including a database without 0058 — because the page
 * it feeds is the hook page, and a missing bank must never break the hooks.
 */
export async function listBankItems(chainId: string): Promise<BankItemRow[]> {
    try {
        const { data, error } = await supabase
            .from('practice_item')
            .select('item_id, bank_path, role, skill_id, discriminates, status, position')
            .eq('chain_id', chainId)
            .is('retired_at', null)
            .order('bank_path')
            .order('position');
        return error ? [] : ((data ?? []) as BankItemRow[]);
    } catch {
        return [];
    }
}

/** Bank items grouped by their file, in the order given (path order). */
export function groupBankItemsByFile(items: readonly BankItemRow[]): Array<[string, BankItemRow[]]> {
    const groups = new Map<string, BankItemRow[]>();
    for (const item of items) groups.set(item.bank_path, [...(groups.get(item.bank_path) ?? []), item]);
    return [...groups.entries()];
}
