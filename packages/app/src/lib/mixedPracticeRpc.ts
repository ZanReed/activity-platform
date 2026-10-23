// Mixed practice's student RPC names (migration 0066). A module of its own, with
// no imports, so the e2e route mocks can import the production constants
// instead of retyping them (policy P2) without pulling in the Supabase client.
export const MIXED_PRACTICE_RPC = {
    start: 'start_mixed_session',
    finish: 'finish_mixed_session',
} as const;
