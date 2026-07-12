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
import { PrintConfig, CalculatorTool } from './document.js';
import type {
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
  Column,
  ColumnsBlock,
  InteractiveGraphBlock,
  MultipleChoiceBlock,
  MultipleChoiceOption,
  MatchingBlock,
  MatchingItem,
  MatchingTarget,
  OrderingBlock,
  OrderingItem,
  NumberLineBlock,
  HeadingLevel,
  CalloutVariant,
} from './blocks/index.js';
import { AxisConfig, NumberLineConfig } from './blocks/index.js';
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
export function createMultipleChoiceOption(
  correct: boolean = false,
): MultipleChoiceOption {
  return { id: uuid(), content: [], correct };
}

export function createMultipleChoiceBlock(): MultipleChoiceBlock {
  // Three empty choices with the first marked correct — a valid starting
  // shape (schema requires 2+ choices) the teacher edits in place. The
  // editor warns if they later leave no choice marked correct.
  return {
    id: uuid(),
    type: 'multiple_choice',
    prompt: [],
    choices: [
      createMultipleChoiceOption(true),
      createMultipleChoiceOption(),
      createMultipleChoiceOption(),
    ],
    multiSelect: false,
    hasConfidenceRating: false,
    skills: [],
  };
}

export function createMatchingItem(): MatchingItem {
  return { id: uuid(), content: [] };
}

export function createMatchingTarget(): MatchingTarget {
  return { id: uuid(), content: [] };
}

// Two empty item/target rows with an identity key (item n → target n) — a
// valid starting shape the teacher edits in place. The editor warns when key
// coverage goes incomplete (the MC zero-correct-warning precedent).
export function createMatchingBlock(): MatchingBlock {
  const items = [createMatchingItem(), createMatchingItem()];
  const targets = [createMatchingTarget(), createMatchingTarget()];
  const key: Record<string, string> = {};
  items.forEach((item, i) => {
    const target = targets[i];
    if (target) key[item.id] = target.id;
  });
  return {
    id: uuid(),
    type: 'matching',
    prompt: [],
    items,
    targets,
    key,
    allowTargetReuse: false,
    hasConfidenceRating: false,
    skills: [],
  };
}

export function createOrderingItem(): OrderingItem {
  return { id: uuid(), content: [] };
}

export function createOrderingBlock(): OrderingBlock {
  // Three empty items (the smallest ordering that isn't a coin flip); the
  // authored order is the correct order.
  return {
    id: uuid(),
    type: 'ordering',
    prompt: [],
    items: [createOrderingItem(), createOrderingItem(), createOrderingItem()],
    hasConfidenceRating: false,
    skills: [],
  };
}

export function createListItem(): ListItem {
  return { id: uuid(), content: [] };
}

export function createBulletListBlock(): BulletListBlock {
  return { id: uuid(), type: 'bullet_list', items: [createListItem()] };
}

export function createOrderedListBlock(): OrderedListBlock {
  return { id: uuid(), type: 'ordered_list', items: [createListItem()] };
}

export function createColumn(): Column {
  return { id: uuid(), blocks: [] };
}

// count is clamped to the schema's 2..6 range so the result always validates.
export function createColumnsBlock(count: number = 2): ColumnsBlock {
  const n = Math.min(Math.max(Math.trunc(count), 2), 6);
  return {
    id: uuid(),
    type: 'columns',
    columns: Array.from({ length: n }, createColumn),
    gridLines: 'inherit',
  };
}

// A default plot-a-point graph: a symmetric -10..10 plane with unit grid and
// snap on, one correct point at the origin for the author to drag into place.
// AxisConfig.parse fills the grid/show/snap defaults so the result validates.
export function createInteractiveGraphBlock(): InteractiveGraphBlock {
  return {
    id: uuid(),
    type: 'interactive_graph',
    prompt: [],
    axisConfig: AxisConfig.parse({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 }),
    interaction: { type: 'plot_point', correctPoints: [[0, 0]], tolerance: 0.1 },
    partialCredit: false,
    allowNoSolution: false,
    noSolutionCorrect: false,
    builtinFeedback: true,
    mistakeFeedback: [],
    hasConfidenceRating: false,
    skills: [],
  };
}

// A default plot-a-point number line: 0..10 with unit ticks and snap on, one
// correct point at 5 for the author to drag into place. NumberLineConfig.parse
// fills the tick/minor/snap defaults so the result validates.
export function createNumberLineBlock(): NumberLineBlock {
  return {
    id: uuid(),
    type: 'number_line',
    prompt: [],
    config: NumberLineConfig.parse({ min: 0, max: 10 }),
    interaction: { type: 'plot_point', correctPoints: [5], tolerance: 0.1 },
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
    interchangeableWithPrevious: false,
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
      answerFeedback: meta.answerFeedback ?? 'on_check',
      skills: meta.skills ?? [],
      gradingMode: 'auto',
      // Derive the full default print config from the schema (DRY — avoids
      // re-listing every print default here, where it would silently drift
      // from PrintConfig). Callers can override via meta.print.
      print: meta.print ?? PrintConfig.parse({}),
    },
    sections: [createSection()],
  };
}

// A default calculator tool: enabled, full scientific capability, no
// restrictions (the permissive default — teachers opt INTO limits). The editor
// calls this when a teacher toggles the calculator on for an activity. Derives
// the restriction defaults from the schema (DRY) rather than re-listing them.
export function createCalculatorTool(): CalculatorTool {
  return CalculatorTool.parse({ enabled: true });
}
