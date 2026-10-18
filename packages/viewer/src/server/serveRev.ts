// =============================================================================
// server/serveRev.ts — the served-form revision (efficiency audit 2026-10 #9;
// TODOS item 3, decisions 1–8 ruled 2026-10-18)
// -----------------------------------------------------------------------------
// Everything that decides how a version's served document looks, other than
// the version id itself:
//
//   API_VERSION             the read API's own shape
//   ACTIVITY_SCHEMA_VERSION the schema every document is upgraded to on serve
//   SERVE_TRANSFORM_REV     the per-student serve transforms: applyServeShuffles,
//                           deriveSeedValues, substituteSeedValues (they run
//                           OUTSIDE SANITIZER_REV by design, R10)
//   SANITIZER_REV           what is stripped (also the read cache's key)
//
// A student's device keeps every document it was served. It may reuse that
// copy instead of downloading again ONLY when the version AND this revision
// match, so a change to any of the four forces a fresh download. Clients treat
// the value as opaque: equality only.
//
// ⚠ BUMP SERVE_TRANSFORM_REV whenever a serve transform's OUTPUT changes. A
// device copy made under the old transform would otherwise keep showing a
// student the old shuffle or the old seeded numbers while the grader derives
// the new ones. tests/get-activity-handler.test.ts holds a golden fingerprint of the
// transforms' output and fails, naming this constant, when it moves.
//
// NOT this constant: an upgrader fix at the SAME schema version, or a sanitize
// ALGORITHM change, bumps SANITIZER_ALGO_REV (sanitize.ts) — which also orphans
// the server's read cache, the other long-lived copy with the same key.
// =============================================================================

import { ACTIVITY_SCHEMA_VERSION } from '@activity/schema';
import { SANITIZER_REV } from '../sanitize/sanitize.js';

/** The read API's response shape. Bump on any breaking change to it. */
export const API_VERSION = 1;

/** The per-student serve transforms' output (see the header). */
export const SERVE_TRANSFORM_REV = 1;

export const SERVE_REV = `${API_VERSION}.${ACTIVITY_SCHEMA_VERSION}.${SERVE_TRANSFORM_REV}.${SANITIZER_REV}`;
