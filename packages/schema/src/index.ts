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
  TextNode,
  InlineMathNode,
  HardBreakNode,
  BlankToken,
  InlineNode,
  FillInBlankInline,
} from './inline.js';

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
} from './blocks/index.js';
export type { HeadingLevel, CalloutVariant } from './blocks/index.js';

// Document
export {
  Section,
  ActivityMeta,
  ActivityDocument,
  ReferencePanel,
} from './document.js';

// Submissions
export {
  BlankResponse,
  CheckpointResult,
  ConfidenceLevel,
  SubmissionResponses,
  SubmissionResponsesV1,
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
  createBlankToken,
  createSection,
  createEmptyDocument,
} from './factories.js';
