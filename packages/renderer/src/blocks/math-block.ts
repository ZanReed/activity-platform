import type { MathBlock } from '@activity/schema';
import { renderMath } from '../math.js';
import { attr } from '../html.js';
import { sizingClass, sizingAttrs } from './sizing.js';
import {
  hasMathPrompts,
  renderMathPromptBody,
} from '../math-prompts.js';

export function renderMathBlock(block: MathBlock): string {
  // Model A: a math block with in-equation gaps renders the SWAP way (static
  // KaTeX boxed gaps + hidden mirror inputs + the raw latex for the kit). A
  // prompt-free block takes the unchanged path — the byte-identity pin.
  if (hasMathPrompts(block.prompts)) {
    return (
      '<div class="block block-math has-math-prompts' + sizingClass(block) + '"' +
      ' data-block-category="content"' +
      ' data-block-type="math_block"' +
      ' data-block-id="' + attr(block.id) + '"' +
      ' data-math-prompt-latex="' + attr(block.latex) + '"' +
      sizingAttrs(block) + '>' +
      renderMathPromptBody(block.latex, block.prompts, true) +
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
