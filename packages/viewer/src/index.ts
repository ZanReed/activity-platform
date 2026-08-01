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

export { blockBindings, bindingFor, boundBlockTypes } from './registry/bindings.js';
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

// S5 — the teacher's chosen worksheet font (the app's editor consumes this
// too, so there is one loader rather than two that drift).
export {
  activityFontFamily,
  ensureActivityFontLoaded,
  typographyVars,
  resetLoadedFonts,
} from './typography/fonts.js';

// S5 — the student's print action and the readiness barrier behind it.
export { PrintButton } from './print/PrintButton.js';
export type { PrintButtonProps } from './print/PrintButton.js';
export { awaitPrintReady } from './print/printReadiness.js';
export type { PrintReadyReport, PrintReadyOptions } from './print/printReadiness.js';
export { DefinitionGlossary } from './print/DefinitionGlossary.js';
export { collectDefinitions } from './print/definitions.js';
export type { GlossaryEntry } from './print/definitions.js';

// S5 — the print contract the parity gate asserts on BOTH surfaces. Imports
// FROM the registry, never into it, and is deliberately absent from
// server/index.ts: the get-activity bundle must not carry it (V9 lesson).
export {
  printExpectations,
  suppressedChecksFor,
  targetFor,
  blockPrintRoster,
  variantPrintRoster,
  structuralPrintRoster,
  documentPrintRoster,
  BLOCK_ROOT,
  PAPER_COLOURS,
} from './registry/printExpectations.js';
export type {
  PrintSurface,
  SurfaceTarget,
  SurfaceSelectors,
  PrintExpectation,
  PrintCheck,
  PrintInstanceContext,
} from './registry/printExpectations.js';

export {
  colorTokens,
  staticTokens,
  stateNames,
} from './tokens/tokens.js';
export type { ColorToken, StaticToken, DesignToken, StateName } from './tokens/tokens.js';

// S2 — the answer-key sanitizer + serve-time shuffles (server-side; bundled
// into the get-activity Edge Function via src/server/index.ts).
export { deriveQuestionShape } from './sanitize/sanitize.js';
export type { QuestionShape } from './sanitize/sanitize.js';
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

// S3 — the check wire contract (the frozen S4 seam), its scriptable mock, and
// the viewer store seam with the persisted-state version gate.
export {
  CHECK_WIRE_VERSION,
  emptySectionResponses,
} from './check/wire.js';
export type {
  CheckItemResult,
  CheckRequest,
  CheckService,
  ItemVerdict,
  ReleasedBlockFeedback,
  ReleasedFeedbackResult,
  SectionCheckResult,
  SectionResponses,
} from './check/wire.js';
export { createMockCheckService } from './check/mock.js';
export type { MockCheckScript, MockCheckService } from './check/mock.js';
export {
  VIEWER_STORE_SCHEMA_VERSION,
  emptyPersistedState,
  hydrateViewerState,
  serializeViewerState,
} from './store/persistence.js';
export type {
  PersistedViewerState,
  SectionStatus,
} from './store/persistence.js';
export { createViewerStore } from './store/store.js';
export type {
  SectionItemIds,
  ViewerStore,
  ViewerStoreOptions,
  ViewerStoreState,
} from './store/store.js';

// S3 V4 — the container shell: document indexing, the per-block error
// boundary, and the worksheet renderer that owns section checking.
export { indexDocument } from './container/blockIndex.js';
export type { DocumentIndex, SectionIndex } from './container/blockIndex.js';
export { BlockBoundary } from './container/BlockBoundary.js';
export type { BlockCrash, BlockBoundaryProps } from './container/BlockBoundary.js';
export { ViewerProvider, useViewer } from './container/context.js';
export type { BlockPhase, ViewerContextValue } from './container/context.js';
export { ViewerContainer } from './container/ViewerContainer.js';
export type {
  CheckShortfall,
  ViewerContainerProps,
} from './container/ViewerContainer.js';

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
  SanitizedQuestionShape,
} from './sanitize/sanitized-types.js';

// S3 V5 — the inline content renderer (every block inherits it), the lazy
// KaTeX seam, and the shared state-chrome pill.
export { InlineContent, InlineMath } from './inline/InlineContent.js';
export type {
  InlineContentProps,
  RenderableInlineNode,
} from './inline/InlineContent.js';
export {
  loadMathRenderer,
  residentMathRenderer,
  setMathRenderer,
} from './inline/math.js';
export type { MathRenderer } from './inline/math.js';
export {
  setGraphSurface,
  graphSurface,
  setNumberLineSurface,
  numberLineSurface,
  setDataPlotSurface,
  dataPlotSurface,
} from './blocks/kitSurfaces.js';
export type {
  GraphSurface,
  GraphSurfaceConfig,
  GraphSurfaceHandle,
  GraphSurfaceResponse,
  NumberLineSurface,
  NumberLineSurfaceConfig,
  NumberLineSurfaceHandle,
  NumberLineSurfaceResponse,
  DataPlotSurface,
  DataPlotSurfaceConfig,
  DataPlotSurfaceHandle,
  DataPlotSurfaceResponse,
} from './blocks/kitSurfaces.js';
export { StatePill } from './blocks/StatePill.js';
export type { PillState, StatePillProps } from './blocks/StatePill.js';
export type { BlockComponentBinding } from './registry/types.js';

// S3 route — the viewer's data source and the real grading client.
export { createReadClient, ViewerLoadError } from './client/readClient.js';
export type {
  ActivityMeta,
  ReadClientOptions,
  ServedActivity,
  ViewerErrorKind,
  ViewerReadClient,
} from './client/readClient.js';
export { createHttpCheckService } from './client/httpCheckService.js';
export type { HttpCheckServiceOptions } from './client/httpCheckService.js';
