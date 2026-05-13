// =============================================================================
// factories.ts — Factory functions for creating new schema instances
// -----------------------------------------------------------------------------
// These are convenience constructors used by the editor (when the user
// inserts a new block via the slash menu) and by tests. They produce
// values that pass schema validation — so new content always starts in a
// valid state.
//
// All ids are generated via crypto.randomUUID(), available in modern Node,
// Deno, and all modern browsers. Available without imports since Node 19+.
// =============================================================================

import type {
  ActivityDocument,
  ActivityMeta,
  Section,
} from './document.js';
import type {
  ParagraphBlock,
  HeadingBlock,
  MathBlock,
  ImageBlock,
  CalloutBlock,
  ProblemBlock,
  FillInBlankBlock,
  HeadingLevel,
  CalloutVariant,
} from './blocks/index.js';
import type { BlankToken } from './inline.js';

const uuid = (): string => crypto.randomUUID();

// ---- Blocks -----------------------------------------------------------------

export function createParagraphBlock(): ParagraphBlock {
  return { id: uuid(), type: 'paragraph', content: [] };
}

export function createHeadingBlock(level: HeadingLevel = 2): HeadingBlock {
  return { id: uuid(), type: 'heading', level, content: [] };
}

export function createMathBlock(latex: string = ''): MathBlock {
  return { id: uuid(), type: 'math_block', latex };
}

export function createImageBlock(src: string, alt: string = ''): ImageBlock {
  return { id: uuid(), type: 'image', src, alt };
}

export function createCalloutBlock(variant: CalloutVariant = 'info'): CalloutBlock {
  return { id: uuid(), type: 'callout', variant, content: [] };
}

export function createProblemBlock(): ProblemBlock {
  return { id: uuid(), type: 'problem', content: [], skills: [] };
}

export function createFillInBlankBlock(): FillInBlankBlock {
  return {
    id: uuid(),
    type: 'fill_in_blank',
    content: [],
    hasConfidenceRating: false,
    skills: [],
  };
}

export function createBlankToken(answer: string): BlankToken {
  // hint and mistakeFeedback are both optional — omitted by default. The
  // editor's UI for fill-in-blank gets explicit fields for them in Stage 14.
  return {
    id: uuid(),
    type: 'blank',
    answer,
    acceptableAnswers: [],
  };
}

// ---- Structure --------------------------------------------------------------

export function createSection(title?: string): Section {
  return { id: uuid(), title, blocks: [], isCheckpoint: false };
}

export function createEmptyDocument(meta: Partial<ActivityMeta> = {}): ActivityDocument {
  return {
    schemaVersion: 1,
    meta: {
      title: meta.title ?? 'Untitled activity',
      course: meta.course ?? 'Algebra II',
      ...(meta.unit !== undefined && { unit: meta.unit }),
      submissionMode: meta.submissionMode ?? 'free',
      revisionMode: meta.revisionMode ?? 'free',
      activityType: meta.activityType ?? 'worksheet',
      skills: meta.skills ?? [],
    },
    sections: [createSection()],
  };
}
