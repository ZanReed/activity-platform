// =============================================================================
// classActivities.ts — the S9 Drop 2 content-surface data layer
// -----------------------------------------------------------------------------
// "Share = discovery, published = open" (OV-9): these calls decide what
// appears on students' Home, never who may read — any signed-in admitted
// student can open any published activity by UUID, unchanged from
// link-sharing reality. Teacher copy must not imply an access wall.
//
// Writes go through the 0030 audited DEFINER RPCs (deny-by-default posture;
// client INSERT/DELETE on class_activities are denied at both the policy and
// grant layers). The student list is ONE round trip through the
// list_class_activities DEFINER RPC (E-6/OV-1 — a student cannot read
// activity titles under RLS, and can_read_activity must not widen).
// =============================================================================

import { functionsBase, supabase } from './supabase';
import {
    LIST_CLASS_ACTIVITIES_RPC,
    SHARE_ACTIVITY_RPC,
    UNSHARE_ACTIVITY_RPC,
} from './edgeFunctions';

/** One row of the student Home list (server-filtered: published, non-deleted,
 * live class, live membership — the client never sees a row it shouldn't
 * render). */
export interface StudentClassActivity {
    classId: string;
    activityId: string;
    title: string;
    addedAt: string;
}

export async function listClassActivities(): Promise<StudentClassActivity[]> {
    const { data, error } = await supabase.rpc(LIST_CLASS_ACTIVITIES_RPC);
    if (error) throw new Error(error.message);
    interface Row {
        class_id: string;
        activity_id: string;
        title: string;
        added_at: string;
    }
    return ((data ?? []) as Row[]).map((r) => ({
        classId: r.class_id,
        activityId: r.activity_id,
        title: r.title,
        addedAt: r.added_at,
    }));
}

/** One row of a teacher's per-class list. `published` false = DR-7's muted
 * dead row ("No longer published — students don't see this"): the teacher
 * CAN see status through their own activities RLS; students never get the
 * row at all (server-filtered in the list RPC). */
export interface TeacherClassActivity {
    classId: string;
    activityId: string;
    title: string;
    addedAt: string;
    published: boolean;
}

/**
 * Every class-activity row across ALL of the teacher's classes, one query
 * (RLS: class_activities_select via is_class_teacher; the embedded activities
 * row rides activities_select_own — share requires ownership, so it is always
 * visible to this reader). Newest first with the DR-1 tiebreak, mirroring the
 * student list — a deliberate verification affordance.
 */
export async function listTeacherClassActivities(): Promise<TeacherClassActivity[]> {
    const { data, error } = await supabase
        .from('class_activities')
        .select('class_id, activity_id, added_at, activities(title, status, deleted_at, current_version_id)')
        .order('added_at', { ascending: false })
        .order('activity_id', { ascending: false });
    if (error) throw new Error(error.message);
    interface Row {
        class_id: string;
        activity_id: string;
        added_at: string;
        activities:
            | { title: string; status: string; deleted_at: string | null; current_version_id: string | null }
            | { title: string; status: string; deleted_at: string | null; current_version_id: string | null }[]
            | null;
    }
    return ((data ?? []) as Row[]).map((r) => {
        const a = Array.isArray(r.activities) ? r.activities[0] : r.activities;
        return {
            classId: r.class_id,
            activityId: r.activity_id,
            addedAt: r.added_at,
            title: a?.title ?? '(activity)',
            published:
                a != null &&
                a.status === 'published' &&
                a.deleted_at === null &&
                a.current_version_id !== null,
        };
    });
}

/** A picker option: one of the teacher's published activities. `publishedAt`
 * is the CURRENT VERSION's mint time (DR-16's "— published <date>" — dedupes
 * identical titles at zero schema cost); activities.updated_at would drift to
 * the last draft edit, which is not what "published" means. */
export interface PublishedActivityOption {
    id: string;
    title: string;
    publishedAt: string | null;
}

export async function listPublishedActivities(): Promise<PublishedActivityOption[]> {
    const { data, error } = await supabase
        .from('activities')
        .select(
            'id, title, current_version:activity_versions!activities_current_version_id_fkey(created_at)',
        )
        .eq('status', 'published')
        .is('deleted_at', null)
        .not('current_version_id', 'is', null);
    if (error) throw new Error(error.message);
    interface Row {
        id: string;
        title: string;
        current_version: { created_at: string } | { created_at: string }[] | null;
    }
    const rows = ((data ?? []) as Row[]).map((r) => {
        const v = Array.isArray(r.current_version) ? r.current_version[0] : r.current_version;
        return { id: r.id, title: r.title, publishedAt: v?.created_at ?? null };
    });
    // Newest-published-first (DR-1); a null date (shouldn't happen for a
    // published row) sorts last rather than throwing.
    return rows.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

/** Errors from both write doors carry the RPC's raise text; callers render
 * the DR-9 copy, not the raw message — EXCEPT the not-published refusal,
 * which callers detect via isNotPublishedError for DR-9(f)'s honest copy. */
export async function shareActivityToClass(
    classId: string,
    activityId: string,
): Promise<void> {
    const { error } = await supabase.rpc(SHARE_ACTIVITY_RPC, {
        p_class_id: classId,
        p_activity_id: activityId,
    });
    if (error) throw new Error(error.message);
}

export async function unshareActivityFromClass(
    classId: string,
    activityId: string,
): Promise<void> {
    const { error } = await supabase.rpc(UNSHARE_ACTIVITY_RPC, {
        p_class_id: classId,
        p_activity_id: activityId,
    });
    if (error) throw new Error(error.message);
}

/** The share door's one distinguishable refusal (the unpublished race). */
export function isNotPublishedError(error: unknown): boolean {
    return error instanceof Error && error.message.includes('not published');
}

/**
 * The join gate's pre-auth class-name lookup (D-3/E-2), through get-activity's
 * anonymous meta branch. THREE outcomes, deliberately (DR-6): a name, a
 * DEFINITIVE no-such-class (the pre-OAuth warning), or an indistinct failure
 * (network/5xx — the gate keeps its silent neutral state).
 */
export type ClassMetaResult =
    | { kind: 'name'; name: string }
    | { kind: 'none' }
    | { kind: 'error' };

export async function fetchClassMeta(code: string): Promise<ClassMetaResult> {
    try {
        const res = await fetch(
            `${functionsBase()}/get-activity?join_code=${encodeURIComponent(code)}&meta=1`,
        );
        if (res.status === 404) return { kind: 'none' };
        if (!res.ok) return { kind: 'error' };
        const data = (await res.json()) as { class_name?: unknown };
        return typeof data.class_name === 'string'
            ? { kind: 'name', name: data.class_name }
            : { kind: 'error' };
    } catch {
        return { kind: 'error' };
    }
}

/** DR-15: absolute, viewer-local, year only when not current, never relative
 * (the read-aloud test). Shared by both sides of the mirror so the teacher's
 * "Added Aug 13" and the student's are the same string. */
export function formatListDate(iso: string): string {
    const d = new Date(iso);
    const withYear = d.getFullYear() !== new Date().getFullYear();
    return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        ...(withYear ? { year: 'numeric' as const } : {}),
    });
}
