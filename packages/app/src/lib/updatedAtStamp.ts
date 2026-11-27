// =============================================================================
// lib/updatedAtStamp.ts — asking the server to stamp activities.updated_at
// -----------------------------------------------------------------------------
// Review C10 (migration 0110). `activities.updated_at` is the editor's conflict
// token and the order of My activities, so it is stamped on the SERVER's clock
// by a trigger. The trigger stamps a write that CHANGES the column, whatever
// value it was changed to, and leaves alone a write that does not touch it
// (the time estimate, a file move): putting this value in an update is how a
// write asks for the stamp. The value itself is discarded — read the stored
// one back with `.select('updated_at')` when you need it (the conflict token).
// =============================================================================

/** The `updated_at` field of an update that should move the row's clock. The
 * server replaces it with now(); only "it differs from the stored value"
 * matters, and a fresh ISO time always does. */
export function requestUpdatedAtStamp(): { updated_at: string } {
    return { updated_at: new Date().toISOString() };
}
