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
  DefinitionImage,
  SIMPLE_MARK_TYPES,
  TextNode,
  InlineMathNode,
  HardBreakNode,
  BlankToken,
  InlineNode,
  FillInBlankInline,
} from './inline.js';
export type { MarkType, SimpleMarkType } from './inline.js';

// Blocks
export {
  Block,
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  CalloutBlock,
  ProblemBlock,
  FillInBlankBlock,
  BulletListBlock,
  OrderedListBlock,
  ListItem,
  ColumnsBlock,
  ColumnCellBlock,
  Column,
  ColumnGridLines,
  InteractiveGraphBlock,
  MultipleChoiceBlock,
  MultipleChoiceOption,
  ChoiceImage,
  ChoiceGraph,
  MatchingBlock,
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
  DisplayInteraction,
  GraphInteraction,
} from './blocks/index.js';
export type { HeadingLevel, CalloutVariant } from './blocks/index.js';

// Sizing (shared per-block width/align fragment)
export { BlockAlign, BlockWidthFraction } from './sizing.js';

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

// Submissions
export {
  BlankResponse,
  CheckpointResult,
  ConfidenceLevel,
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
  SubmissionResponses,
  SubmissionResponsesV1,
  SubmissionResponsesV2,
  SubmissionResponsesV3,
  SubmissionResponsesV4,
  SubmissionResponsesV5,
  SubmissionResponsesV6,
  SubmissionResponsesV7,
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
  createColumnsBlock,
  createInteractiveGraphBlock,
  createMultipleChoiceBlock,
  createMultipleChoiceOption,
  createMatchingBlock,
  createMatchingItem,
  createMatchingTarget,
  createOrderingBlock,
  createOrderingItem,
  createNumberLineBlock,
  createDataPlotBlock,
  createBlankToken,
  createSection,
  createEmptyDocument,
  createCalculatorTool,
} from './factories.js';
