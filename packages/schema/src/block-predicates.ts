// =============================================================================
// block-predicates.ts — single source of truth for two DIFFERENT questions
// -----------------------------------------------------------------------------
// "Is this block page-numbered?" and "Is this block gradeable/reviewable?" are
// distinct concerns that used to be hand-encoded in four places that drifted:
//   1. renderBlock's switch (the real render behavior)  — @activity/renderer
//   2. isNumberedBlock (delegates here)                 — @activity/renderer
//   3. problemNumberAt (delegates here)                 — @activity/app editor
//   4. buildActivityIndex's docOrder walk               — @activity/app
// The two sets are NOT the same: a display-mode graph is neither; a free-text
// block (self_explanation / short_answer / essay) is GRADEABLE-reviewable but
// NOT page-numbered; a legacy `problem` (prose, no blanks) is page-numbered but
// carries no auto-graded response. So they need two predicates, not one.
//
// The RUNTIME must never import this (numbering is baked into published HTML at
// render time), but the renderer and editor both depend on @activity/schema, so
// this is the shared home.
// =============================================================================

import type { Block } from './blocks/index.js';
import type { BlockLabel } from './label.js';

// The schema block types that always draw a "Problem N" (the display-graph
// exception is handled separately below). This is the ONE membership list; the
// renderer and the editor's ProseMirror walk both resolve through it.
const ALWAYS_NUMBERED_TYPES: ReadonlySet<string> = new Set([
  'problem',
  'fill_in_blank',
  'multiple_choice',
  'matching',
  'ordering',
  'number_line',
  // The faded worked-example box counts as ONE problem (its number leads the
  // title); its faded steps are lettered locally and don't pull from the
  // sequence — that context-dependent exception lives in renderFadedWorkedExample.
  'faded_worked_example',
]);

// Name-based primitive so consumers that don't hold a parsed Block — notably the
// editor's ProseMirror walk — can resolve the same rule. `type` is the schema
// (snake_case) block type; `interactionType` is the block's interaction.type
// when it has one (graphs / data plots), else undefined.
export function isPageNumberedType(
  type: string,
  interactionType?: string,
  hasPrompts?: boolean,
): boolean {
  if (ALWAYS_NUMBERED_TYPES.has(type)) return true;
  // Only a graded interaction is numbered; a display (static) chart is ungraded
  // content and pulls no number.
  if (type === 'interactive_graph' || type === 'data_plot') {
    return interactionType !== 'display';
  }
  // A math_block is numbered only when it carries Model A in-equation gaps; a
  // plain display equation is ungraded content.
  if (type === 'math_block') return hasPrompts === true;
  return false;
}

// True if this block participates in the auto-numbered problem sequence — i.e.
// it draws a visible "Problem N" on the page and consumes one slot of the
// document-wide counter. Mirrors the historical isNumberedBlock exactly; the
// per-block `label` mode (Slice 1 of the numbering/label decouple) layers on top
// of this in pageLabel(), it does not replace it.
export function isPageNumbered(block: Block): boolean {
  const interactionType =
    'interaction' in block
      ? (block.interaction as { type?: string } | undefined)?.type
      : undefined;
  const hasPrompts =
    block.type === 'math_block'
      ? (block.prompts?.length ?? 0) > 0
      : undefined;
  return isPageNumberedType(block.type, interactionType, hasPrompts);
}

// What a block shows in its number slot on the page, and whether it consumes a
// slot of the document-wide sequence. `number` → pull the next sequence number
// (auto/default); `custom` → show authored text, out-of-sequence; `none` → show
// nothing, out-of-sequence. Only `number` consumes a slot.
export type PageLabel =
  | { kind: 'number' }
  | { kind: 'custom'; text: string }
  | { kind: 'none' };

// Resolve a block's page label from its optional `label` field, falling back to
// the historical numbered behavior when absent. `label` lives only on the
// gradeable blocks that have opted in (fill_in_blank today), so read it
// defensively — a block without the field behaves as `auto`.
export function pageLabel(block: Block): PageLabel {
  const label: BlockLabel | undefined =
    'label' in block ? (block.label as BlockLabel | undefined) : undefined;
  if (label?.mode === 'custom') return { kind: 'custom', text: label.text };
  if (label?.mode === 'none') return { kind: 'none' };
  // auto or absent: numbered iff this block type is page-numbered at all.
  return isPageNumbered(block) ? { kind: 'number' } : { kind: 'none' };
}

// True if this block emits at least one gradeable response — i.e. it appears in
// a submission and the teacher reviews it. Mirrors buildActivityIndex's indexed
// set: free-text prompts count (they're reviewed, if not auto-scored); display
// charts don't; a legacy prose `problem` carries no response. A math_block is
// gradeable exactly when it carries Model A in-equation gaps.
//
// NOTE: not yet wired into buildActivityIndex — that consolidation (and the
// math_block review path it unlocks) is Slice 2. Exported now so the two
// concepts live in one place from the start.
export function isGradeable(block: Block): boolean {
  switch (block.type) {
    case 'fill_in_blank':
    case 'multiple_choice':
    case 'matching':
    case 'ordering':
    case 'number_line':
    case 'self_explanation':
    case 'short_answer':
    case 'essay':
      return true;
    case 'interactive_graph':
    case 'data_plot':
      return block.interaction.type !== 'display';
    case 'math_block':
      // Model A in-equation gaps. Optional + no default, so guard the length.
      return (block.prompts?.length ?? 0) > 0;
    // A scaffold container whose faded steps are themselves gradeable.
    case 'faded_worked_example':
      return true;
    default:
      return false;
  }
}
