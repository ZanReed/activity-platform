import type { MathBlock, PageLabel } from '@activity/schema';
import { renderMath } from '../math.js';
import { attr } from '../html.js';
import { sizingClass, sizingAttrs } from './sizing.js';
import { renderNumberGutter } from './number-gutter.js';
import {
  hasMathPrompts,
  renderMathPromptBody,
} from '../math-prompts.js';

export interface MathBlockRenderContext {
  /** Page label for a gap-bearing equation (numbering/label decouple). A
   * prompt-free display equation is never numbered, so this is inert there. */
  label?: PageLabel;
  problemNumber?: number;
}

export function renderMathBlock(
  block: MathBlock,
  ctx: MathBlockRenderContext = {},
): string {
  // Model A: a math block with in-equation gaps renders the SWAP way (static
  // KaTeX boxed gaps + hidden mirror inputs + the raw latex for the kit). A
  // prompt-free block takes the unchanged path — the byte-identity pin.
  if (hasMathPrompts(block.prompts)) {
    // A gap-bearing equation is a numbered problem: prepend the number gutter
    // (auto/custom) and wrap the equation body into the grid's second column.
    // `none` (or a not-numbered edge) yields an empty gutter → the body renders
    // exactly as before (the kit mounts by descendant querySelector, so the
    // wrapper is transparent to it).
    const gutter = renderNumberGutter(ctx.label, ctx.problemNumber ?? 0);
    const inner = renderMathPromptBody(block.latex, block.prompts, true);
    const body = gutter
      ? gutter + '<div class="block-math__body">' + inner + '</div>'
      : inner;
    return (
      '<div class="block block-math has-math-prompts' +
      (gutter ? ' is-numbered' : '') +
      sizingClass(block) + '"' +
      ' data-block-category="content"' +
      ' data-block-type="math_block"' +
      ' data-block-id="' + attr(block.id) + '"' +
      ' data-math-prompt-latex="' + attr(block.latex) + '"' +
      sizingAttrs(block) + '>' +
      body +
      '</div>'
    );
  }
  const math = renderMath(block.latex, { displayMode: true });
  return (
    '<div class="block block-math' + sizingClass(block) + '"' +
    ' data-block-category="content"' +
    ' data-block-type="math_block"' +
    ' data-block-id="' + attr(block.id) + '"' +
    sizingAttrs(block) + '>' +
    math +
    '</div>'
  );
}
