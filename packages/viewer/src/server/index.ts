// =============================================================================
// server/index.ts — the read-API server surface (S2)
// -----------------------------------------------------------------------------
// The entry point scripts/bundle-viewer-server.mjs bundles into
// supabase/functions/_shared/viewer-server.bundle.js for the get-activity Edge
// Function. Everything the function needs from the workspace crosses HERE —
// upgrade-on-read (schema), sanitize + serve shuffles + the cache revision
// (viewer) — so the function never imports the far larger renderer bundle.
// Same committed-bundle discipline as renderer.bundle.js: re-run
// `pnpm bundle:viewer-server` after changing anything this file re-exports
// (CI regenerates and fails on drift).
// =============================================================================

export {
  ACTIVITY_SCHEMA_VERSION,
  UpgradeError,
  upgradeActivityDocument,
} from '@activity/schema';
export type { UpgradeResult } from '@activity/schema';

export {
  SANITIZER_REV,
  sanitizeActivityDocument,
  sanitizeBlock,
} from '../sanitize/sanitize.js';
export { applyServeShuffles, seededShuffle } from '../sanitize/shuffle.js';
export type {
  SanitizedActivityDocument,
  SanitizedBlock,
} from '../sanitize/sanitized-types.js';

export { UNKNOWN_CENSUS_KEY, censusOfDocument } from '../census/census.js';
export type {
  CensusCount,
  CensusItem,
  VersionCensus,
} from '../census/census.js';

// ONLY the handler factory: the Deno file imports createGetActivityHandler +
// one type; every other symbol that used to ride here was test-only surface
// shipping in the production bundle (A17, 2026-08-06 — tests import the
// module file directly).
export { createGetActivityHandler } from './get-activity-handler.js';
export type {
  CorsKit,
  DbResult,
  GetActivityDb,
  GetActivityHandlerDeps,
  PublishedActivityRow,
} from './get-activity-handler.js';
