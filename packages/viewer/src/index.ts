// =============================================================================
// @activity/viewer — the student-viewer package (components-as-data arc)
// -----------------------------------------------------------------------------
// S0 surface: the block-registry contract + the design-token vocabulary. The
// container shell, store, and block components land in S3/T6 and export from
// here as they arrive. Adding new exports requires editing this file; that's
// intentional friction (schema package precedent).
// =============================================================================

export type {
  BlockType,
  CheckedStateFamily,
  Interactivity,
  BlockCategory,
  NumberingRule,
  SanitizeSpec,
  PrintTreatment,
  PrintSpec,
  A11ySpec,
  BlockComponentProps,
  LazyBlockComponent,
  BlockRegistryEntry,
  BlockRegistry,
} from './registry/types.js';

export {
  blockRegistry,
  registeredBlockTypes,
  familyOf,
  categoryOf,
  censusKeyOf,
  isPageNumbered,
  BLANK_SECRET_FIELDS,
  MATH_PROMPT_SECRET_FIELDS,
} from './registry/registry.js';

export {
  colorTokens,
  staticTokens,
  stateNames,
} from './tokens/tokens.js';
export type { ColorToken, StaticToken, DesignToken, StateName } from './tokens/tokens.js';

// S2 — the answer-key sanitizer + serve-time shuffles (server-side; bundled
// into the get-activity Edge Function via src/server/index.ts).
export {
  SANITIZER_ALGO_REV,
  SANITIZER_REV,
  sanitizeActivityDocument,
  sanitizeBlock,
} from './sanitize/sanitize.js';
export { applyServeShuffles, seededShuffle } from './sanitize/shuffle.js';

// S2 — the get-activity request handler (extracted from the Edge Function so
// its branching is unit-testable; the function is now thin wiring).
export {
  API_VERSION,
  META_MAX_PER_WINDOW,
  META_WINDOW_MS,
  createGetActivityHandler,
  createMetaRateLimiter,
  jwtSub,
} from './server/get-activity-handler.js';
export type {
  CorsKit,
  DbResult,
  GetActivityDb,
  GetActivityHandlerDeps,
  PublishedActivityRow,
} from './server/get-activity-handler.js';

export type {
  BlankSecretField,
  MathPromptSecretField,
  SanitizedBlankToken,
  SanitizedMathPrompt,
  SanitizedInlineMathNode,
  SanitizedInlineNode,
  SanitizedFillInBlankInline,
  SanitizedGraphInteraction,
  SanitizedNumberLineInteraction,
  SanitizedDataPlotInteraction,
  SanitizeBlockType,
  SanitizedBlock,
  SanitizedColumn,
  SanitizedRow,
  SanitizedSection,
  SanitizedActivityDocument,
} from './sanitize/sanitized-types.js';
