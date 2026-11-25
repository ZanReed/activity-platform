// The responses screen's two big reads (migration 0104, review A5). A module
// of its own, with no imports, so the e2e route mocks import the production
// constants instead of retyping them (policy P2) without pulling in the
// Supabase client.
//
// Both return ONE jsonb array. Do not call the row-set `list_grading_queue`
// or `list_grade_suggestions` from the app: PostgREST cuts a row set at
// max_rows (1,000) with no error, and both pass that for a large class
// (scripts/tests/rowset-rpc-bounds.test.mjs fails on an unbounded call).
export const GRADING_QUEUE_RPC = 'grading_queue';
export const GRADE_SUGGESTIONS_RPC = 'grade_suggestions';
