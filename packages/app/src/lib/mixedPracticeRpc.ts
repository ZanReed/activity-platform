// Mixed practice's RPC names (migrations 0066, 0068). A module of its own, with
// no imports, so the e2e route mocks can import the production constants
// instead of retyping them (policy P2) without pulling in the Supabase client.
export const MIXED_PRACTICE_RPC = {
    start: 'start_mixed_session',
    finish: 'finish_mixed_session',
    // The teacher's panel (slice 4).
    summary: 'mixed_class_summary',
    students: 'mixed_class_students',
    whoFirst: 'mixed_who_first',
    studentRecent: 'mixed_student_recent',
    setOn: 'set_mixed_practice',
    setSettings: 'set_mixed_settings',
} as const;
