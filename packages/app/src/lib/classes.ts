// =============================================================================
// classes.ts — teacher-side class/roster data layer (S1, identity lane)
// -----------------------------------------------------------------------------
// Classes are the AGE-STATEMENT carrier (ruling 3.1C, widened by U-1 on
// 2026-10-06): a class row cannot exist without age_assertion_at/by/
// text_version, and since migration 0053 it records WHICH of two statements
// its teacher confirmed (includes_under_13). The choice in the form that
// feeds createClass is required, with nothing picked by default. Students enter via join_class (RPC, not
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

// The two statements a teacher chooses between (U-1; the author approved
// this wording 2026-10-06, POLICY_VERSION 2026-10-06-draft-4). History: the
// single 13+ sentence stood from 2026-08-07, when an earlier under-13 clause
// was dropped because nothing behind it existed (DECISIONS → "The 13+
// floor"); counsel's answer to the D24 packet, as the author reported it,
// is what brought the second statement back (DECISIONS → "Under-13 use, by
// school authorization").
// Changing either wording = bump POLICY_VERSION (the stored statement must
// be reconstructable from the version string).
export const AGE_STATEMENT_PROMPT = 'Confirm one of these for this class:';
export const AGE_STATEMENTS = {
    thirteenPlus: 'Every student in this class is 13 or older.',
    under13:
        'This class includes students under 13, and my school has authorized their use of this platform.',
} as const;

export interface ClassInfo {
    id: string;
    name: string;
    joinCode: string;
    expectedDomain: string | null;
    ageAssertionAt: string;
    assertionTextVersion: string;
    /** Which statement the teacher confirmed (migration 0053): true = the
     *  class includes students under 13, by school authorization. */
    includesUnder13: boolean;
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
    includes_under_13: boolean;
    created_at: string;
}

const CLASS_COLUMNS =
    'id, name, join_code, expected_domain, age_assertion_at, assertion_text_version, includes_under_13, created_at';

function rowToClass(r: ClassRow): ClassInfo {
    return {
        id: r.id,
        name: r.name,
        joinCode: r.join_code,
        expectedDomain: r.expected_domain,
        ageAssertionAt: r.age_assertion_at,
        assertionTextVersion: r.assertion_text_version,
        includesUnder13: r.includes_under_13 === true,
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
    /** Which statement the teacher confirmed: false = every student is 13 or
     *  older, true = includes under-13 by school authorization. NULL means
     *  nothing was chosen, and the throw below is the real gate. */
    includesUnder13: boolean | null;
}

/**
 * Create a class carrying the 13+ assertion record — via the audited
 * create_class DEFINER RPC (0027, ruling E-2): validation, join-code
 * collision retry, and the class.create audit row all live server-side.
 * The direct INSERT died with 0027 (grant revoked; the RPC is the only door).
 */
export async function createClass(input: CreateClassInput): Promise<ClassInfo> {
    if (input.includesUnder13 !== true && input.includesUnder13 !== false) {
        throw new Error('Cannot create a class without the age assertion');
    }
    const name = input.name.trim();
    if (name.length === 0) throw new Error('Class name is required');

    const { data, error } = await supabase.rpc('create_class', {
        p_name: name,
        p_expected_domain: normalizeExpectedDomain(input.expectedDomain),
        p_assertion_text_version: ASSERTION_TEXT_VERSION,
        p_includes_under_13: input.includesUnder13,
    });
    if (error) throw new Error(error.message);
    return rowToClass(data as ClassRow);
}

/**
 * Confirm the OTHER age statement for an existing class (U-2) — or the same
 * one again, against the current wording. Audited server-side with the old
 * values; the time, the teacher and the policy version are re-stamped.
 */
export async function reconfirmClassAge(
    classId: string,
    includesUnder13: boolean,
): Promise<Pick<ClassInfo, 'includesUnder13' | 'ageAssertionAt' | 'assertionTextVersion'>> {
    const { data, error } = await supabase.rpc('reconfirm_class_age', {
        p_class_id: classId,
        p_includes_under_13: includesUnder13,
        p_assertion_text_version: ASSERTION_TEXT_VERSION,
    });
    if (error) throw new Error(error.message);
    const r = data as { includes_under_13: boolean; age_assertion_at: string; assertion_text_version: string };
    return {
        includesUnder13: r.includes_under_13 === true,
        ageAssertionAt: r.age_assertion_at,
        assertionTextVersion: r.assertion_text_version,
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
    /** The class's join code when its daily number-facts practice is switched
     *  on (migration 0050, SP-1) — the student's link is /facts/CODE. */
    factsCode?: string | null;
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
        .select('class_id, joined_at, classes(name, join_code, fact_sprint_on_at)')
        .is('removed_at', null)
        .order('joined_at', { ascending: true });
    if (error) throw new Error(error.message);
    interface MembershipRow {
        class_id: string;
        joined_at: string;
        classes: ClassBits | ClassBits[] | null;
    }
    interface ClassBits {
        name: string;
        join_code?: string | null;
        fact_sprint_on_at?: string | null;
    }
    return ((data ?? []) as MembershipRow[]).map((r) => {
        const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
        return {
            classId: r.class_id,
            name: cls?.name ?? '(class)',
            joinedAt: r.joined_at,
            factsCode: cls?.fact_sprint_on_at ? cls.join_code ?? null : null,
        };
    });
}
