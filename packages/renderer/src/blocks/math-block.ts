import type { MathBlock } from '@activity/schema';
import { renderMath } from '../math.js';
import { attr } from '../html.js';

export function renderMathBlock(block: MathBlock): string {
  const math = renderMath(block.latex, { displayMode: true });
  return (
    '<div class="block block-math" data-id="' + attr(block.id) + '">' +
      math +
    '</div>'
  );
}
