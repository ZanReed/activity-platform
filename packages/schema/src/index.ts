// =============================================================================
// index.ts — Public API for @activity/schema
// -----------------------------------------------------------------------------
// Consumers import from '@activity/schema' and get everything they need.
// Adding new exports requires editing this file; that's intentional friction
// to keep the public surface intentional rather than accidental.
// =============================================================================

// Inline content
export {
  Mark,
  DefinitionMark,
  DefinitionContentInline,
  // DefinitionImage is GONE (design doc D7): a definition's illustrative image
  // is now a member of DefinitionBlock, so there is one way to express it. The
  // Mark preprocess upgrades the old `image` attr into a trailing image block.
  DefinitionBlock,
  upgradeDefinitionMark,
  DefinitionListItem,
  DefinitionBulletListBlock,
  DefinitionOrderedListBlock,
  SIMPLE_MARK_TYPES,
  TextNode,
  InlineMathNode,
  MathPrompt,
  HardBreakNode,
  BlankToken,
  InlineNode,
  FillInBlankInline,
} from './inline.js';
export type {
  MarkType,
  SimpleMarkType,
  // The definition-content block shapes. Renderers accept these alongside their
  // blocks/ siblings so definition markup and body markup share one source.
  DefinitionParagraphBlock,
  DefinitionHeadingBlock,
  DefinitionMathBlock,
  DefinitionImageBlock,
} from './inline.js';

// Blocks
export {
  Block,
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  CropRect,
  CalloutBlock,
  ProblemBlock,
  FillInBlankBlock,
  BulletListBlock,
  OrderedListBlock,
  ListItem,
  InteractiveGraphBlock,
  MultipleChoiceBlock,
  MultipleChoiceOption,
  ChoiceImage,
  ChoiceGraph,
  MatchingBlock,
  CorrespondenceBlock,
  TargetColumn,
  MatchingItem,
  MatchingTarget,
  OrderingBlock,
  OrderingItem,
  NumberLineBlock,
  NumberLineConfig,
  NumberLineInteraction,
  NumberLinePointInteraction,
  NumberLineIntervalInteraction,
  NumberLineInterval,
  DataPlotBlock,
  DataPlotConfig,
  DataPlotChart,
  DataPlotInteraction,
  DataPlotDisplayInteraction,
  DataPlotDotplotInteraction,
  DataPlotHistogramInteraction,
  DataPlotBoxplotInteraction,
  AxisConfig,
  PointInteraction,
  FunctionInteraction,
  FunctionModel,
  RegionInteraction,
  RayInteraction,
  RayAnswer,
  SegmentInteraction,
  SegmentAnswer,
  EndpointStyle,
  Drawable,
  DrawableColor,
  DisplayInteraction,
  GraphInteraction,
  LearningObjectivesBlock,
  WorkedExampleBlock,
  WorkedExampleChild,
  FadedWorkedExampleBlock,
  FadedWorkedExampleChild,
  SelfExplanationBlock,
  ShortAnswerBlock,
  EssayBlock,
  WordCountHint,
  Rubric,
  RubricCriterion,
  GraphFigureBlock,
  TableBlock,
  TableRow,
  TableCell,
  TableColumnAlign,
  tableBlankIds,
} from './blocks/index.js';
export type { HeadingLevel, CalloutVariant } from './blocks/index.js';

// Block predicates (single source of truth for "page-numbered" vs "gradeable")
export {
  isPageNumbered,
  isPageNumberedType,
  isGradeable,
  pageLabel,
} from './block-predicates.js';
export type { PageLabel } from './block-predicates.js';

// Per-block display label (numbering/label decouple)
export { BlockLabel, labelFields } from './label.js';

// The one home for the a/b/c step marker — the editor and the viewer both read
// it from here (ruling N9). See step-letter.ts for why it moved.
export { stepLetter } from './step-letter.js';

// Sizing (shared per-block width/align fragment)
export { BlockAlign, BlockWidthFraction } from './sizing.js';

// Layout (structural rows-of-columns container above blocks)
export { Row, Column, ColumnGridLines } from './layout.js';

// Document
export {
  Section,
  ActivityMeta,
  ActivityDocument,
  ReferencePanel,
  RegressionModel,
  CalculatorRestrictions,
  CalculatorTool,
  PrintHeader,
  PrintConfig,
  ActivityFont,
  Typography,
} from './document.js';

// Upgrade-on-read (components-as-data ruling 4A; chain empty at schemaVersion 2)
export {
  ACTIVITY_SCHEMA_VERSION,
  UpgradeError,
  upgradeActivityDocument,
} from './upgrade.js';
export type { UpgradeResult } from './upgrade.js';

// Submissions
export {
  BlankResponse,
  CheckpointResult,
  PointResponse,
  FunctionResponse,
  RegionResponse,
  InequalityResponse,
  GraphResponse,
  GraphResponseV4,
  RayResponse,
  SegmentResponse,
  ChoiceResponse,
  MatchResponse,
  OrderResponse,
  NumberLinePointResponse,
  NumberLineIntervalResponse,
  NumberLineResponse,
  DataPlotDotplotResponse,
  DataPlotHistogramResponse,
  DataPlotBoxplotResponse,
  DataPlotResponse,
  FreeResponse,
  SubmissionResponses,
  SubmissionResponsesV1,
  SubmissionResponsesV2,
  SubmissionResponsesV3,
  SubmissionResponsesV4,
  SubmissionResponsesV5,
  SubmissionResponsesV6,
  SubmissionResponsesV7,
  SubmissionResponsesV8,
  migrateSubmissionResponses,
} from './submission.js';

// Factories
// Factories
export {
  createParagraphBlock,
  createHeadingBlock,
  createMathBlock,
  createImageBlock,
  createCalloutBlock,
  createProblemBlock,
  createFillInBlankBlock,
  createBulletListBlock,
  createOrderedListBlock,
  createListItem,
  createColumn,
  createRow,
  createInteractiveGraphBlock,
  createMultipleChoiceBlock,
  createMultipleChoiceOption,
  createMatchingBlock,
  createCorrespondenceBlock,
  createMatchingItem,
  createMatchingTarget,
  createOrderingBlock,
  createOrderingItem,
  createNumberLineBlock,
  createDataPlotBlock,
  createLearningObjectivesBlock,
  createWorkedExampleBlock,
  createFadedWorkedExampleBlock,
  createGraphFigureBlock,
  createTableBlock,
  createSelfExplanationBlock,
  createShortAnswerBlock,
  createEssayBlock,
  createBlankToken,
  createSection,
  createEmptyDocument,
  createCalculatorTool,
} from './factories.js';

// S5.5 D18A — the activity font menu. Shared here because both the renderer
// (published pages, until S9) and the viewer need it and must not import each
// other; each surface supplies its own fallback stack.
export {
  FONT_REGISTRY,
  FONT_MENU,
  DEFAULT_FONT_STACK,
  fontFamilyValue,
} from './fonts.js';
export type { ActivityFontSpec } from './fonts.js';
