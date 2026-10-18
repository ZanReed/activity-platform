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
import { signedInUserId } from './currentUser';
import {
    LIST_CLASS_ACTIVITIES_RPC,
    MY_ACTIVITY_PROGRESS_RPC,
    SHARE_ACTIVITY_RPC,
    UNSHARE_ACTIVITY_RPC,
    GET_ACTIVITY_FUNCTION,
    edgeFunctionUrl,
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
    // Narrowed through the caller's own classes (efficiency audit #4): the
    // unfiltered read seq-scanned every class_activities row on the platform,
    // running the DEFINER policy helpers per row. RLS still applies to what is
    // left.
    const uid = await signedInUserId();
    if (!uid) return [];
    const { data, error } = await supabase
        .from('class_activities')
        .select(
            'class_id, activity_id, added_at, activities(title, status, deleted_at, current_version_id), classes!inner(teacher_id)',
        )
        .eq('classes.teacher_id', uid)
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
    // The outline keys (assign-to-class A5): the class-page picker groups by
    // unit in teaching order, like My activities. A published row's course/unit
    // columns ARE the truth (stamped at publish), so no draft-first read here.
    course: string | null;
    unit: string | null;
    source_path: string | null;
    updated_at: string;
}

export async function listPublishedActivities(): Promise<PublishedActivityOption[]> {
    const { data, error } = await supabase
        .from('activities')
        .select(
            'id, title, course, unit, source_path, updated_at, current_version:activity_versions!activities_current_version_id_fkey(created_at)',
        )
        .eq('status', 'published')
        .is('deleted_at', null)
        .not('current_version_id', 'is', null);
    if (error) throw new Error(error.message);
    interface Row {
        id: string;
        title: string;
        course: string | null;
        unit: string | null;
        source_path: string | null;
        updated_at: string;
        current_version: { created_at: string } | { created_at: string }[] | null;
    }
    const rows = ((data ?? []) as Row[]).map((r) => {
        const v = Array.isArray(r.current_version) ? r.current_version[0] : r.current_version;
        return {
            id: r.id,
            title: r.title,
            publishedAt: v?.created_at ?? null,
            course: r.course ?? null,
            unit: r.unit ?? null,
            source_path: r.source_path ?? null,
            updated_at: r.updated_at,
        };
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

/** What a several-activity add did (assign-to-class A3/A4). */
export interface AddManyResult {
    added: string[];
    /** Ids that failed, in the order they were tried. */
    failed: string[];
    /** True when any failure was the not-published refusal (the race). */
    refused: boolean;
}

/**
 * Add several activities to one class, given in TEACHING order (assign-to-class
 * A4(a), ruled 2026-10-14). Students' Home lists newest first (DR-1), so the
 * adds are sent LAST-FIRST and ONE AT A TIME: each add is newer than the one
 * before, and the unit reads in teaching order on the student's Home. Sent in
 * parallel or first-first, the unit would show reversed, which is the bug this
 * exists to fix. Guard: classActivities.test.ts.
 *
 * Each call is the audited, idempotent 0030 RPC, so a retry after a partial
 * failure is safe; a failure does not stop the rest.
 */
export async function addActivitiesToClass(
    classId: string,
    idsInTeachingOrder: readonly string[],
): Promise<AddManyResult> {
    const result: AddManyResult = { added: [], failed: [], refused: false };
    for (const id of [...idsInTeachingOrder].reverse()) {
        try {
            await shareActivityToClass(classId, id);
            result.added.push(id);
        } catch (err) {
            result.failed.push(id);
            if (isNotPublishedError(err)) result.refused = true;
        }
    }
    return result;
}

/** One activity's status for the signed-in student (0059 my_activity_progress). */
export interface ActivityProgress {
    activityId: string;
    /** Sections in the current version, or null when every check predates 0059. */
    sectionsTotal: number | null;
    /** Distinct sections checked on the CURRENT version. */
    sectionsChecked: number;
    /** An older version has this student's checks / was finished. */
    earlierChecked: boolean;
    earlierDone: boolean;
    /** A grade on the student's work in this activity has been released. */
    feedbackReleased: boolean;
}

/** The student Home's status read (S2). THROWS on failure; Home treats a
 * failure as "no status" and keeps the plain list (degraded, not broken). */
export async function listMyActivityProgress(): Promise<ActivityProgress[]> {
    const { data, error } = await supabase.rpc(MY_ACTIVITY_PROGRESS_RPC);
    if (error) throw new Error(error.message);
    interface Row {
        activity_id: string;
        sections_total: number | null;
        sections_checked: number;
        earlier_checked: boolean;
        earlier_done: boolean;
        feedback_released: boolean;
    }
    return ((data ?? []) as Row[]).map((r) => ({
        activityId: r.activity_id,
        sectionsTotal: r.sections_total ?? null,
        sectionsChecked: r.sections_checked ?? 0,
        earlierChecked: Boolean(r.earlier_checked),
        earlierDone: Boolean(r.earlier_done),
        feedbackReleased: Boolean(r.feedback_released),
    }));
}

/**
 * The words a student reads on Home (S1/S2/S3, D3). "Done" needs a total the
 * server wrote; a NULL total (checks from before 0059) is "Started", never
 * guessed done. Earlier-version work speaks only when the current version is
 * untouched — once they start the new one, that is the status that matters.
 */
export function progressLabel(p: ActivityProgress): string {
    if (p.sectionsChecked > 0) {
        if (p.sectionsTotal !== null && p.sectionsChecked >= p.sectionsTotal) return 'Done ✓';
        if (p.sectionsTotal !== null) return `In progress (${p.sectionsChecked} of ${p.sectionsTotal})`;
        return 'Started';
    }
    if (p.earlierDone) return 'Done (earlier version)';
    if (p.earlierChecked) return 'Started (earlier version)';
    return 'Not started';
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
            edgeFunctionUrl(functionsBase(), GET_ACTIVITY_FUNCTION, { join_code: code, meta: '1' }),
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
