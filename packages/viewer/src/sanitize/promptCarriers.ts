// =============================================================================
// promptCarriers.ts — the ONE list of inline types whose `prompts` carry keys
// -----------------------------------------------------------------------------
// A math node's `prompts` array holds in-band answer material, so both the
// sanitizer's deep strip (layer 3) and the grading walk's key collection must
// agree on exactly which node types carry prompts. Until 2026-08-06 this Set
// was declared twice with identical contents (sanitize.ts and grading/walk.ts
// — s4-retro finding 10, fixed by eng-review A7): two spellings of a security-
// relevant roster, bonded by nothing. A type added to one and not the other
// would either leak a prompt key to students (sanitize side missing) or grade
// against a key the wire never carried (walk side missing) — both silent.
//
// This module is a dependency-free leaf ON PURPOSE: it is imported by the read
// bundle (via sanitize.ts) AND the grading bundle (via walk.ts), so it must
// never grow an import that either bundle can't afford.
// =============================================================================

/** Inline node types whose `prompts` arrays carry in-band answer keys. */
export const PROMPT_CARRIER_TYPES: ReadonlySet<string> = new Set([
  'math_inline',
  'math_block',
]);
