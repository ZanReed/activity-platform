// =============================================================================
// lib/helpRequests.ts — "Ask my teacher", the STUDENT's side (migration 0090,
// S9, docs/design/ask-my-teacher.md). Every class decision is made in SQL: an
// ask names only the version and the section (ST-3).
//
// Only `fetchHelpState` is in the student shell. The ask and withdraw calls
// ride with the lazy AskTeacher chunk, and the teacher's calls live in
// lib/classHelp.ts, so a student who has no one to ask pays for none of it.
// =============================================================================

import { supabase } from './supabase';

export const MY_HELP_STATE_RPC = 'my_help_state';
export const ASK_TEACHER_RPC = 'ask_teacher';
export const WITHDRAW_HELP_RPC = 'withdraw_help';

/** What the viewer draws per check group. */
export interface HelpState {
    /** A class holding this activity has the student and the switch on. */
    canAsk: boolean;
    /** Section ids asked about, still open, and visible to a teacher. */
    open: ReadonlySet<string>;
    /** Section ids a teacher marked Done today (the student's latest word). */
    done: ReadonlySet<string>;
}

export const NO_HELP: HelpState = { canAsk: false, open: new Set(), done: new Set() };

interface HelpStateRow {
    can_ask: boolean;
    open: string[];
    done: string[];
}

export function toHelpState(d: unknown): HelpState {
    const r = d as HelpStateRow | null;
    if (!r) return NO_HELP;
    return { canAsk: r.can_ask === true, open: new Set(r.open ?? []), done: new Set(r.done ?? []) };
}

export async function fetchHelpState(versionId: string): Promise<HelpState> {
    const { data, error } = await supabase.rpc(MY_HELP_STATE_RPC, { p_version_id: versionId });
    if (error) throw new Error(error.message);
    return toHelpState(data);
}
