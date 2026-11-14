// =============================================================================
// presentFrom.ts — where the present view was opened from (period planner PP-9)
// -----------------------------------------------------------------------------
// A leaf module, so Classes can name it without pulling the present route into
// its bundle. ClassPresent honours ONLY this exact value (no open redirect):
// with it, Back and Escape return to Classes; without it, to Today & practice.
// =============================================================================

export const PRESENT_FROM_CLASSES = '/classes';
