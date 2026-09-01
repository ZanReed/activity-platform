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

// S5 — the print contract the print-rules gate asserts on the viewer surface
// (the cross-surface "both surfaces" half retired with the renderer's gate in
// S5.5 — A27). Imports FROM the registry, never into it, and is deliberately
// absent from server/index.ts: the get-activity bundle must not carry it (V9
// lesson).
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
// Seeded values on the print surface (wishlist #6, R9/D6). The LEAVES export
// here; substituteSeededAnswers deliberately does NOT — it reaches the mathjs
// evaluator, and evaluate.ts's top-level math.import() is side-effectful, so a
// barrel re-export defeats tree-shaking and puts ~35 KiB gz of mathjs into
// the student shell entry (the perf gate caught exactly this, twice now).
// The print route imports it from the '@activity/viewer/seeded-print' subpath
// instead, which lands it in that route's own chunk.
export { deriveSeedValues, type SeedValues } from './sanitize/seedValues.js';
export { substituteSeedValues } from './sanitize/substitute.js';
export { AnswerKeyProvider, useBlockAnswerKey } from './answer-key/context.js';
// S5.5 D15A — print-side shuffles, declared on the PrintSpec and applied here.
// Separate from the serve shuffle on purpose: this moves no wire and no
// SANITIZER_REV (see printShuffle.ts).
export { applyPrintShuffles, printSeed } from './print/printShuffle.js';
// The document-level print custom properties. Exported because the foldable
// measures captured blocks in a SEPARATE document (T5) and has to rebuild the
// `.viewer` wrapper they were laid out inside — without these vars every
// measured height is wrong, and wrong heights are mis-paginated panels.
export { printVars, activityTypeLabel } from './container/PrintDocumentLayer.js';
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
  SANITIZER_REV,
  sanitizeActivityDocument,
  sanitizeBlock,
} from './sanitize/sanitize.js';
export { applyServeShuffles, seededShuffle } from './sanitize/shuffle.js';

// S2 — the get-activity request handler (extracted from the Edge Function so
// its branching is unit-testable; the function is now thin wiring). ONLY the
// handler factory rides the barrel: the rate-limiter internals, API_VERSION,
// and jwtSub are module concerns tests import from the module file directly
// (A17 — test-only re-exports were trimmed from both barrels 2026-08-06).
export { createGetActivityHandler } from './server/get-activity-handler.js';
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

// S6 V4 — the SW cache naming contract. Shrunk to the shell name at S9
// Drop 4 (D-8): the per-student content-cache grammar + sweep/purge died —
// V8's worker never caches per-student responses, so they guarded caches
// that cannot exist (rationale + resurrection contract in store/caches.ts).
export { VIEWER_SHELL_CACHE } from './store/caches.js';

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
// Activity flow modes (F1) — the checkpoint fold that decides where Check
// buttons render and what each one covers.
export {
  checkGroups,
  groupStatus,
  sectionsInGroup,
  isSectionFrozen,
} from './container/checkGroups.js';
export type {
  CheckGroup,
  GroupPhase,
  GroupStatus,
  SubmissionMode,
} from './container/checkGroups.js';
export { BlockBoundary } from './container/BlockBoundary.js';
export type { BlockCrash, BlockBoundaryProps } from './container/BlockBoundary.js';
export { ViewerProvider, useViewer } from './container/context.js';
export type { BlockPhase, ViewerContextValue } from './container/context.js';
export { ViewerContainer } from './container/ViewerContainer.js';
// The summonable tool corner. Mounted by the STUDENT surface, never by
// ViewerContainer: the container is also what ActivityPrint (a screen render of
// the teacher's print preview) and DevViewer render, and neither should grow a
// floating calculator (C16).
export { ToolCluster } from './container/ToolCluster.js';
export type { ToolClusterProps } from './container/ToolCluster.js';
// The reference panel's screen surface. Unlike ToolCluster this is rendered BY
// ViewerContainer (it needs the resolver and the per-block boundary), so it is
// on the barrel for its own test rather than for a route to mount.
export { ReferencePanelTool } from './container/ReferencePanelTool.js';
export type { ReferencePanelToolProps } from './container/ReferencePanelTool.js';
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
  setCalculatorSurface,
  calculatorSurface,
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
  CalculatorSurface,
  CalculatorSurfaceHandle,
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
  ReleasedFeedbackRow,
} from './client/httpCheckService.js';

// S8 — the student-facing performance contract. Names are ADDITIVE-ONLY
// (ruling R2): the perf lane and the committed calibration targets key on them.
export { MARKS, markOnce, resetMarksForTest } from './perf/marks.js';
export type { MarkName } from './perf/marks.js';

// S8 T7 — start the lazy KaTeX fetch as soon as a document is known to carry
// math, instead of waiting for a math component to mount. Timing, not policy:
// math-free documents still fetch nothing.
export { preloadMathIfNeeded, documentUsesMath } from './inline/mathPreload.js';
export {
  preloadGraphKitIfNeeded,
  documentUsesGraphKit,
} from './blocks/kitPreload.js';
