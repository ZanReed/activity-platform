// =============================================================================
// lib/classHelp.ts — "Ask my teacher", the TEACHER's side (migration 0090, S9):
// the class's open requests and Done (the class switch is in lib/classes.ts,
// with the Classes page's other writes). Kept apart from
// lib/helpRequests.ts so none of it reaches the student shell.
// =============================================================================

import { rpc } from './db';

export const CLASS_HELP_OPEN_RPC = 'class_help_open';
export const END_HELP_RPC = 'end_help';

export interface HelpRequest {
    id: string;
    studentId: string;
    name: string;
    activityId: string;
    activityTitle: string;
    sectionLabel: string;
    createdAt: string;
}

export interface ClassHelp {
    /** The class switch (ST-14). */
    on: boolean;
    /** Open requests, longest-waiting first. */
    requests: HelpRequest[];
}

interface ClassHelpRow {
    on: boolean;
    requests: {
        id: string;
        student_id: string;
        name: string;
        activity_id: string;
        activity_title: string;
        section_label: string;
        created_at: string;
    }[];
}

function toClassHelp(d: unknown): ClassHelp {
    const r = d as ClassHelpRow;
    return {
        on: r.on === true,
        requests: (r.requests ?? []).map((q) => ({
            id: q.id,
            studentId: q.student_id,
            name: q.name,
            activityId: q.activity_id,
            activityTitle: q.activity_title,
            sectionLabel: q.section_label,
            createdAt: q.created_at,
        })),
    };
}

export async function fetchClassHelp(classId: string): Promise<ClassHelp> {
    const { data, error } = await rpc(CLASS_HELP_OPEN_RPC, { p_class_id: classId });
    if (error) throw new Error(error.message);
    return toClassHelp(data);
}

export async function endHelp(requestId: string): Promise<ClassHelp> {
    const { data, error } = await rpc(END_HELP_RPC, { p_request_id: requestId });
    if (error) throw new Error(error.message);
    return toClassHelp(data);
}

/** "just now" · "4 min" · "1 h 5 min" — how long a hand has been up. */
export function waitedWords(iso: string, now: Date = new Date()): string {
    const ms = now.getTime() - new Date(iso).getTime();
    if (!Number.isFinite(ms)) return '';
    const mins = Math.max(0, Math.floor(ms / 60_000));
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
