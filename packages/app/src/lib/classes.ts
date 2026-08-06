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

// The assertion text version stored on class rows is the privacy-policy
// version the teacher saw when asserting. Same string by construction.
export const ASSERTION_TEXT_VERSION = POLICY_VERSION;

// The exact text the teacher asserts to (rendered next to the checkbox).
// Changing this wording = bump POLICY_VERSION (the stored assertion must be
// reconstructable from the version string).
export const ASSERTION_TEXT =
    'I confirm that every student in this class is 13 or older, or that my ' +
    'school has authorized younger students to use this platform.';

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
    /** auth.uid() — pinned by RLS WITH CHECK (teacher_id AND age_assertion_by). */
    teacherId: string;
}

/**
 * Create a class carrying the 13+ assertion record. join_code is generated
 * DB-side (default); the rare code collision (unique violation) is retried.
 */
export async function createClass(input: CreateClassInput): Promise<ClassInfo> {
    if (!input.ageAsserted) {
        throw new Error('Cannot create a class without the age assertion');
    }
    const name = input.name.trim();
    if (name.length === 0) throw new Error('Class name is required');

    const row = {
        name,
        teacher_id: input.teacherId,
        expected_domain: normalizeExpectedDomain(input.expectedDomain),
        age_assertion_by: input.teacherId,
        assertion_text_version: ASSERTION_TEXT_VERSION,
    };

    // Up to 3 attempts: a join_code collision surfaces as 23505 on the unique
    // constraint; a fresh insert draws a fresh default code.
    let lastError = '';
    for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase
            .from('classes')
            .insert(row)
            .select(CLASS_COLUMNS)
            .single();
        if (!error) return rowToClass(data as ClassRow);
        lastError = error.message;
        if (error.code !== '23505') break;
    }
    throw new Error(lastError);
}

/**
 * Draw a fresh join code (invalidates the old one — the lockout path after
 * remove-student or a leaked code). Collision-retried like createClass.
 */
export async function regenerateJoinCode(classId: string): Promise<string> {
    let lastError = '';
    for (let attempt = 0; attempt < 3; attempt++) {
        const { data: code, error: genError } = await supabase.rpc(
            'generate_join_code',
        );
        if (genError) throw new Error(genError.message);
        const { data, error } = await supabase
            .from('classes')
            .update({ join_code: code as string, updated_at: new Date().toISOString() })
            .eq('id', classId)
            .select('join_code')
            .single();
        if (!error) return (data as { join_code: string }).join_code;
        lastError = error.message;
        if (error.code !== '23505') break;
    }
    throw new Error(lastError);
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
