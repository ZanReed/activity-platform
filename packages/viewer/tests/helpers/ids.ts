// =============================================================================
// tests/helpers/ids.ts — shared identity constants for store-bearing suites
// -----------------------------------------------------------------------------
// `createViewerStore` requires a `userId` (S6-1): a store that doesn't know
// whose work it holds cannot enforce the shared-device guard, so there is no
// sensible default to fall back on. Suites that don't care about identity
// still have to name one, and naming it ONCE here keeps a real uuid shape in
// front of the tests that DO care (the buffer key scheme and the foreign-blob
// refusal both parse these).
// =============================================================================

export const TEST_USER_ID = 'dddddddd-0000-4000-8000-000000000001';

/** A second student, for the shared-device contamination cases. */
export const OTHER_USER_ID = 'dddddddd-0000-4000-8000-000000000002';
