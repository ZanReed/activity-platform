// =============================================================================
// server/grading-entry.ts — the grading bundle's public surface (S4 T4/T9)
// -----------------------------------------------------------------------------
// Bundled by `pnpm bundle:grading-server` into
// supabase/functions/_shared/grading-server.bundle.js, which the check-activity
// Edge Function imports. Kept SEPARATE from viewer-server.bundle.js (ruling
// S4-1): grading needs the math engine, and the read path's bundle carries a
// deliberate size ceiling so opening an activity never waits on code that only
// checking needs. One bundle for both would make every activity OPEN pay the
// grader's cold start.
//
// Everything re-exported here is covered by the viewer package's vitest suite,
// and CI regenerates this bundle on every push and fails on drift — so the
// deployed function can never be running code the tests didn't see.
// =============================================================================

export {
  createCheckActivityHandler,
  validateCheckRequest,
  jwtSubject,
} from './check-activity-handler.js';
export type {
  CheckActivityDb,
  CheckActivityHandlerDeps,
  RecordCheckResult,
  VersionForCheckRow,
} from './check-activity-handler.js';

export { gradeSection, SectionNotFoundError } from './grading/index.js';
export type { GradeSectionInput } from './grading/index.js';

export {
  computeServedOrderings,
  serveSeed,
} from './grading/servedOrder.js';

// The wire contract itself, so the Deno file and the client agree by import
// rather than by convention.
export { CHECK_WIRE_VERSION } from '../check/wire.js';
export type {
  CheckRequest,
  SectionCheckResult,
  SectionResponses,
} from '../check/wire.js';
