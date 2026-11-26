// =============================================================================
// lib/helpRequestsAsk.ts — the student's ask and withdraw (0090). Imported only
// by the lazy AskTeacher chunk, never by the shell (see lib/helpRequests.ts).
// =============================================================================

import { rpc } from './db';
import { ASK_TEACHER_RPC, WITHDRAW_HELP_RPC, toHelpState, type HelpState } from './helpRequests';

/** Why an ask failed, in words a student reads. Never "try again" where
 *  trying again cannot work. */
export function askErrorWords(message: string): string {
    if (/rate_limited/.test(message)) return 'You’ve asked a lot today. Put your hand up instead.';
    if (/no_class/.test(message)) return 'There’s no class to ask from this activity.';
    if (/not_during_assessment/.test(message)) return 'You can’t ask during a check like this one. Put your hand up instead.';
    if (/not_available/.test(message)) return 'This page is out of date. Reload it, then ask.';
    return 'That didn’t send. Try again, or put your hand up.';
}

export async function askTeacher(versionId: string, sectionId: string): Promise<HelpState> {
    const { data, error } = await rpc(ASK_TEACHER_RPC, {
        p_version_id: versionId,
        p_section_id: sectionId,
    });
    if (error) throw new Error(error.message);
    return toHelpState(data);
}

export async function withdrawHelp(versionId: string, sectionId: string): Promise<HelpState> {
    const { data, error } = await rpc(WITHDRAW_HELP_RPC, {
        p_version_id: versionId,
        p_section_id: sectionId,
    });
    if (error) throw new Error(error.message);
    return toHelpState(data);
}
