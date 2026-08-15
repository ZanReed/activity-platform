// =============================================================================
// classes.ts — teacher-side class/roster data layer (S1, identity lane)
// -----------------------------------------------------------------------------
// Classes are the 13+ assertion carrier (ruling 3.1C): a class row cannot
// exist without age_assertion_at/by/text_version, and the UI checkbox that
// feeds createClass is required. Students enter via join_class (RPC, not
// modeled here — student surfaces land with the viewer, S3); teachers read
// rosters via list_class_members (RPC — users RLS is self-only, so a client
// join can't fetch student names).
// =============================================================================

import { supabase } from './supabase';
import { POLICY_VERSION } from './policyVersion';
import { AUTH_CONTRACT } from './authMessages';

// The assertion text version stored on class rows is the privacy-policy
// version the teacher saw when asserting. Same string by construction.
export const ASSERTION_TEXT_VERSION = POLICY_VERSION;

// The educator attestation (0033 R3/D6) rides the same version by the same
// construction — a reworded attestation is distinguishable in the record.
export const ATTESTATION_TEXT_VERSION = POLICY_VERSION;

// RPC names come from the contract, never retyped (P2 — the same rule that
// made PUBLISH_ACTIVITY_RPC a constant at S9 Drop 1).
const REDEEM_JOIN_CODE_RPC = AUTH_CONTRACT.rpcNames.redeemJoinCode;
const CLAIM_TEACHER_RPC = AUTH_CONTRACT.rpcNames.claimTeacher;

// The exact text the teacher asserts to (rendered next to the checkbox).
// The under-13 school-authorization clause was DROPPED 2026-08-07 (eng
// review D2, POLICY_VERSION 2026-08-07-draft-2): the platform declines
// under-13 sign-ins unconditionally, so the one sentence a teacher legally
// attests to must not offer an escape hatch the rest of the pack disclaims.
// v1's age floor is a recorded MARKET constraint (DECISIONS → "The 13+
// floor"): under-13 use returns only with a real school-authorization arc.
// Changing this wording = bump POLICY_VERSION (the stored assertion must be
// reconstructable from the version string).
export const ASSERTION_TEXT =
    'I confirm that every student in this class is 13 or older.';

export interface ClassInfo {
    id: string;
    name: string;
    joinCode: string;
    expectedDomain: string | null;
    ageAssertionAt: string;
    assertionTextVersion: string;
    createdAt: string;
}

export interface ClassMember {
    studentId: string;
    displayName: string | null;
    email: string;
    joinedAt: string;
    removedAt: string | null;
}

interface ClassRow {
    id: string;
    name: string;
    join_code: string;
    expected_domain: string | null;
    age_assertion_at: string;
    assertion_text_version: string;
    created_at: string;
}

const CLASS_COLUMNS =
    'id, name, join_code, expected_domain, age_assertion_at, assertion_text_version, created_at';

function rowToClass(r: ClassRow): ClassInfo {
    return {
        id: r.id,
        name: r.name,
        joinCode: r.join_code,
        expectedDomain: r.expected_domain,
        ageAssertionAt: r.age_assertion_at,
        assertionTextVersion: r.assertion_text_version,
        createdAt: r.created_at,
    };
}

/**
 * Normalize a teacher-entered domain: trimmed, lowercased, tolerant of a
 * pasted "@domain" or full email. Empty input → null (no domain pin).
 */
export function normalizeExpectedDomain(input: string): string | null {
    const trimmed = input.trim().toLowerCase();
    if (trimmed.length === 0) return null;
    const afterAt = trimmed.includes('@')
        ? (trimmed.split('@').pop() ?? '')
        : trimmed;
    return afterAt.length > 0 ? afterAt : null;
}

/** The teacher's own classes, newest first. RLS scopes rows to the caller. */
export async function listClasses(): Promise<ClassInfo[]> {
    const { data, error } = await supabase
        .from('classes')
        .select(CLASS_COLUMNS)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as ClassRow[]).map(rowToClass);
}

// Unexported (A17): zero external importers — the shape is visible through
// createClass's signature, which is how every caller consumes it.
interface CreateClassInput {
    name: string;
    /** Raw teacher input; normalized here. */
    expectedDomain: string;
    /** Must be true — the required 3.1C checkbox. The type says boolean so the
     *  call site reads honestly; the throw is the real gate. */
    ageAsserted: boolean;
}

/**
 * Create a class carrying the 13+ assertion record — via the audited
 * create_class DEFINER RPC (0027, ruling E-2): validation, join-code
 * collision retry, and the class.create audit row all live server-side.
 * The direct INSERT died with 0027 (grant revoked; the RPC is the only door).
 */
export async function createClass(input: CreateClassInput): Promise<ClassInfo> {
    if (!input.ageAsserted) {
        throw new Error('Cannot create a class without the age assertion');
    }
    const name = input.name.trim();
    if (name.length === 0) throw new Error('Class name is required');

    const { data, error } = await supabase.rpc('create_class', {
        p_name: name,
        p_expected_domain: normalizeExpectedDomain(input.expectedDomain),
        p_assertion_text_version: ASSERTION_TEXT_VERSION,
    });
    if (error) throw new Error(error.message);
    const r = data as {
        id: string; name: string; join_code: string; expected_domain: string | null;
        created_at: string; age_assertion_at: string; assertion_text_version: string;
    };
    return {
        id: r.id,
        name: r.name,
        joinCode: r.join_code,
        expectedDomain: r.expected_domain,
        ageAssertionAt: r.age_assertion_at,
        assertionTextVersion: r.assertion_text_version,
        createdAt: r.created_at,
    };
}

/**
 * Draw a fresh join code (invalidates the old one — the lockout path after
 * remove-student or a leaked code). Audited server-side since 0027 (ruling
 * E-3: the class.update row carries old/new, so the trail reconstructs which
 * posted link died); collision retry moved into the RPC.
 */
export async function regenerateJoinCode(classId: string): Promise<string> {
    const { data, error } = await supabase.rpc('regenerate_join_code', {
        p_class_id: classId,
    });
    if (error) throw new Error(error.message);
    return (data as { join_code: string }).join_code;
}

/**
 * Change (or clear) the class's domain pin — via the audited RPC (0027,
 * ruling T4): widening/nulling the domain LOOSENS the admission boundary, so
 * it must leave a trace. Raw teacher input tolerated ("@domain", full email).
 */
export async function updateClassDomain(
    classId: string,
    rawDomain: string,
): Promise<string | null> {
    const { data, error } = await supabase.rpc('update_class_domain', {
        p_class_id: classId,
        p_domain: normalizeExpectedDomain(rawDomain),
    });
    if (error) throw new Error(error.message);
    return (data as { expected_domain: string | null }).expected_domain;
}

/** Roster via the DEFINER RPC (ownership-gated server-side). */
export async function listClassMembers(classId: string): Promise<ClassMember[]> {
    const { data, error } = await supabase.rpc('list_class_members', {
        p_class_id: classId,
    });
    if (error) throw new Error(error.message);
    interface MemberRow {
        student_id: string;
        display_name: string | null;
        email: string;
        joined_at: string;
        removed_at: string | null;
    }
    return ((data ?? []) as MemberRow[]).map((r) => ({
        studentId: r.student_id,
        displayName: r.display_name,
        email: r.email,
        joinedAt: r.joined_at,
        removedAt: r.removed_at,
    }));
}

/**
 * Soft-remove a student from the roster. NOTE: a still-valid join code lets
 * them rejoin — pair with regenerateJoinCode for an actual lockout.
 */
export async function removeClassMember(
    classId: string,
    studentId: string,
): Promise<void> {
    const { error } = await supabase
        .from('class_members')
        .update({ removed_at: new Date().toISOString() })
        .eq('class_id', classId)
        .eq('student_id', studentId);
    if (error) throw new Error(error.message);
}

/** Soft delete via RPC (same 0008 pattern as activities). */
export async function softDeleteClass(classId: string): Promise<void> {
    const { error } = await supabase.rpc('soft_delete_class', {
        p_class_id: classId,
    });
    if (error) throw new Error(error.message);
}

// =============================================================================
// Student-side surface (identity slice B12 — the join flow + joined classes)
// =============================================================================

export interface JoinedClass {
    classId: string;
    name: string;
    joinedAt: string;
}

/**
 * Join a class by code (the student's one write path — join_class RPC).
 * Errors carry the 0027 wire strings; callers classify with
 * classifyJoinError() and render JOIN_ERROR_COPY, never the raw message.
 */
export async function joinClass(code: string): Promise<JoinedClass> {
    const { data, error } = await supabase.rpc('join_class', {
        p_join_code: code.trim().toUpperCase(),
    });
    if (error) throw new Error(error.message);
    const r = data as { class_id: string; class_name: string; joined_at: string };
    return { classId: r.class_id, name: r.class_name, joinedAt: r.joined_at };
}

/**
 * Redeem a class code (0033 R2) — the SELF-SERVE student door.
 *
 * Distinct from joinClass() on purpose: this one promotes a `pending` account
 * to student and joins in one audited transaction, and it is what an account
 * with no role calls. joinClass() stays the path for an ALREADY-student
 * (district SSO), and remains the only writer into class_members underneath —
 * redeem calls it after promoting rather than inlining an insert.
 *
 * Errors carry the 0033 wire strings; callers classify with
 * classifyRedeemError() and render REDEEM_ERROR_COPY, never the raw message.
 */
export async function redeemJoinCode(code: string): Promise<JoinedClass> {
    const { data, error } = await supabase.rpc(REDEEM_JOIN_CODE_RPC, {
        p_join_code: code.trim().toUpperCase(),
    });
    if (error) throw new Error(error.message);
    const r = data as { class_id: string; class_name: string; joined_at: string };
    return { classId: r.class_id, name: r.class_name, joinedAt: r.joined_at };
}

/**
 * Claim a teacher account (0033 R3) — attestation is required by the RPC, and
 * the version stored is the policy version the teacher actually saw, the same
 * construction ASSERTION_TEXT_VERSION uses for the per-class age assertion.
 */
export async function claimTeacher(): Promise<void> {
    const { error } = await supabase.rpc(CLAIM_TEACHER_RPC, {
        p_attestation_version: ATTESTATION_TEXT_VERSION,
    });
    if (error) throw new Error(error.message);
}

/**
 * The student's joined classes (active memberships), in JOIN ORDER (DR-1:
 * stable, matches the student's own history — first class first). Reads ride
 * class_members' student-select-self policy + classes_select_member.
 */
export async function listMyClasses(): Promise<JoinedClass[]> {
    const { data, error } = await supabase
        .from('class_members')
        .select('class_id, joined_at, classes(name)')
        .is('removed_at', null)
        .order('joined_at', { ascending: true });
    if (error) throw new Error(error.message);
    interface MembershipRow {
        class_id: string;
        joined_at: string;
        classes: { name: string } | { name: string }[] | null;
    }
    return ((data ?? []) as MembershipRow[]).map((r) => {
        const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
        return { classId: r.class_id, name: cls?.name ?? '(class)', joinedAt: r.joined_at };
    });
}
