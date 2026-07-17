// =============================================================================
// blocks/index.ts — Block discriminated union
// -----------------------------------------------------------------------------
// Single source of truth for "what block types exist in Phase 1." Adding a
// new block type means: new file under blocks/, new entry here, new factory
// in factories.ts, new renderer in @activity/renderer/blocks/. Three places,
// always in that order.
// =============================================================================

import { z } from 'zod';

import { ParagraphBlock } from './paragraph.js';
import { HeadingBlock } from './heading.js';
import { MathBlock } from './math-block.js';
import { ImageBlock, CropRect } from './image.js';
import { CalloutBlock } from './callout.js';
import { ProblemBlock } from './problem.js';
import { FillInBlankBlock } from './fill-in-blank.js';
import { BulletListBlock, OrderedListBlock, ListItem } from './list.js';
import { InteractiveGraphBlock } from './interactive-graph.js';
import { MultipleChoiceBlock } from './multiple-choice.js';
import { MatchingBlock } from './matching.js';
import { OrderingBlock } from './ordering.js';
import { NumberLineBlock } from './number-line.js';
import { DataPlotBlock } from './data-plot.js';
import { LearningObjectivesBlock } from './learning-objectives.js';
import { WorkedExampleBlock } from './worked-example.js';
import { FadedWorkedExampleBlock } from './faded-worked-example.js';
import { SelfExplanationBlock } from './self-explanation.js';
import { ShortAnswerBlock, EssayBlock } from './free-response.js';

export const Block = z.discriminatedUnion('type', [
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  CalloutBlock,
  ProblemBlock,
  FillInBlankBlock,
  BulletListBlock,
  OrderedListBlock,
  InteractiveGraphBlock,
  MultipleChoiceBlock,
  MatchingBlock,
  OrderingBlock,
  NumberLineBlock,
  DataPlotBlock,
  LearningObjectivesBlock,
  WorkedExampleBlock,
  FadedWorkedExampleBlock,
  SelfExplanationBlock,
  ShortAnswerBlock,
  EssayBlock,
]);
export type Block = z.infer<typeof Block>;

// NOTE: layout is NOT a block. Rows/Columns (packages/schema/src/layout.ts) are
// the structural container ABOVE blocks — a Column holds Block[], never the
// reverse — so the Block union is leaf blocks only and can never nest a row.

// Re-export individual block types so consumers can import them by name.
export {
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
};
export {
  MultipleChoiceBlock,
  MultipleChoiceOption,
  ChoiceImage,
  ChoiceGraph,
} from './multiple-choice.js';
export { MatchingBlock, MatchingItem, MatchingTarget } from './matching.js';
export { OrderingBlock, OrderingItem } from './ordering.js';
export {
  NumberLineBlock,
  NumberLineConfig,
  NumberLineInteraction,
  NumberLinePointInteraction,
  NumberLineIntervalInteraction,
  NumberLineInterval,
} from './number-line.js';
export {
  DataPlotBlock,
  DataPlotConfig,
  DataPlotChart,
  DataPlotInteraction,
  DataPlotDisplayInteraction,
  DataPlotDotplotInteraction,
  DataPlotHistogramInteraction,
  DataPlotBoxplotInteraction,
} from './data-plot.js';
export { LearningObjectivesBlock } from './learning-objectives.js';
export { WorkedExampleBlock, WorkedExampleChild } from './worked-example.js';
export {
  FadedWorkedExampleBlock,
  FadedWorkedExampleChild,
} from './faded-worked-example.js';
export { SelfExplanationBlock } from './self-explanation.js';
export {
  ShortAnswerBlock,
  EssayBlock,
  WordCountHint,
  Rubric,
  RubricCriterion,
} from './free-response.js';
export {
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
} from './interactive-graph.js';
export type { HeadingLevel } from './heading.js';
export type { CalloutVariant } from './callout.js';
