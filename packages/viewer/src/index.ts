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
  PrintExpectation,
  PrintCheck,
  PrintInstanceContext,
} from './registry/printExpectations.js';

// S5.5 — the teacher answer key (ruling D3A). Extracted from the AUTHORED
// document and carried BESIDE the sanitized one, so components stay typed
// against a shape with no answers in it. Like printExpectations above, this
// imports FROM the registry and is deliberately absent from server/index.ts:
// the get-activity bundle must never carry answer-reading code (V9 lesson).
export { extractAnswerKey, extractBlockAnswerKey } from './answer-key/extract.js';
export { AnswerKeyProvider, useBlockAnswerKey } from './answer-key/context.js';
// S5.5 D15A — print-side shuffles, declared on the PrintSpec and applied here.
// Separate from the serve shuffle on purpose: this moves no wire and no
// SANITIZER_REV (see printShuffle.ts).
export { applyPrintShuffles, printSeed } from './print/printShuffle.js';
// The document-level print custom properties. Exported because the foldable
// measures captured blocks in a SEPARATE document (T5) and has to rebuild the
// `.viewer` wrapper they were laid out inside — without these vars every
// measured height is wrong, and wrong heights are mis-paginated panels.
export { printVars } from './container/PrintDocumentLayer.js';
export type { AnswerKeyProviderProps } from './answer-key/context.js';
export { ANSWER_KEY_COVERAGE, ANSWER_KEY_INK } from './answer-key/types.js';
export type {
  AnswerKeyMap,
  BlockAnswerKey,
  AnswerKeyCoverage,
} from './answer-key/types.js';

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
  fingerprintResponses,
  hydrateViewerState,
  serializeViewerState,
} from './store/persistence.js';
export type {
  InFlightCheck,
  PendingCheck,
  PersistedViewerState,
  SectionStatus,
} from './store/persistence.js';

// S6 V1 — the local-first buffer: the key scheme that makes the shared-device
// purge complete, the write policy, and the two sweeps.
export {
  BUFFER_KEY_PREFIX,
  DEFAULT_BUFFER_DEBOUNCE_MS,
  VIEWER_STORAGE_PREFIX,
  bufferHasUnsentWork,
  bufferKey,
  createViewerBuffer,
  findUnsentWork,
  parseBufferKey,
  parseScopedKey,
  scopedKey,
  sweepForeignStorage,
  sweepOrphanVersions,
} from './store/buffer.js';
export type {
  BufferKeyParts,
  BufferStatus,
  ScopedKeyParts,
  ScopedKind,
  StorageLike,
  ViewerBuffer,
  ViewerBufferOptions,
} from './store/buffer.js';

// S6 V6 — the served document kept on-device, for offline boot and for the
// republish path that must render the version a student's work belongs to.
export {
  documentKey,
  loadAnyCachedDocument,
  loadCachedDocument,
  saveCachedDocument,
} from './store/documentCache.js';
export type { CachedDocument } from './store/documentCache.js';
export {
  alwaysOnlineConnectivity,
  createBrowserConnectivity,
  createDocumentHideSignal,
  nullHideSignal,
  systemClock,
} from './store/ports.js';
export type {
  Clock,
  ConnectivitySignal,
  HideSignal,
  TimerHandle,
} from './store/ports.js';

// S6 V2 — the queued-check executor. Owns no queue: the store does.
export { createCheckQueue } from './store/queue.js';
export type { CheckQueue, CheckQueueOptions } from './store/queue.js';

// S6 V4 — the SW cache naming contract (V8's worker conforms to it) plus the
// sweep/purge that make a shared device clean.
export {
  VIEWER_CACHE_PREFIX,
  VIEWER_SHELL_CACHE,
  contentCacheUser,
  purgeStudentCaches,
  sweepForeignCaches,
  viewerContentCacheName,
} from './store/caches.js';
export type { CacheStorageLike } from './store/caches.js';

// S6 V3 — one editable tab per student per activity.
export { createTabLock } from './store/tabLock.js';
export type {
  LockManagerLike,
  LockRequestOptions,
  TabLock,
  TabLockOptions,
} from './store/tabLock.js';
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
export { CheckError, createHttpCheckService } from './client/httpCheckService.js';
export type {
  CheckErrorKind,
  HttpCheckServiceOptions,
} from './client/httpCheckService.js';
