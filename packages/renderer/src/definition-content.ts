// =============================================================================
// definition-content.ts — Render a definition mark's block content
// -----------------------------------------------------------------------------
// A vocabulary definition carries a BLOCK sequence (schema: DefinitionBlock), so
// a popover can hold what a reference sheet holds — a display equation, a short
// property list, a figure. See docs/design/definition-rich-content.md.
//
// The output is pre-rendered into a hidden <template class="js-definition-content">
// next to the marked span (see inline.ts). The published-page sidecar only
// CLONES that template — it never re-renders — so KaTeX and the graph SVG engine
// both run here, server-side, and block content costs the runtime zero bytes.
// That is what makes this feature cheap against the runtime size budget.
//
// Every case delegates to the same renderer the body uses, so definition markup
// and body markup cannot drift; only math_block is local, because the shared one
// carries the gap/solution machinery a definition deliberately has no shape for
// (a definition is never gradeable — the same posture the reference panel takes).
// =============================================================================

import type { DefinitionBlock } from '@activity/schema';
import { renderParagraph } from './blocks/paragraph.js';
import { renderHeading } from './blocks/heading.js';
import { renderBulletList, renderOrderedList } from './blocks/lists.js';
import { renderImage } from './blocks/image.js';
import { renderGraphFigure } from './blocks/graph-figure.js';
import { renderMath } from './math.js';
import { blockIdAttr } from './html.js';
import { sizingClass, sizingAttrs } from './blocks/sizing.js';

function renderDefinitionBlock(block: DefinitionBlock): string {
  switch (block.type) {
    case 'paragraph':
      return renderParagraph(block);
    case 'heading':
      return renderHeading(block);
    case 'bullet_list':
      return renderBulletList(block);
    case 'ordered_list':
      return renderOrderedList(block);
    case 'image':
      return renderImage(block);
    case 'graph_figure':
      return renderGraphFigure(block);
    case 'math_block':
      // Local rather than renderMathBlock: a definition's math block has no
      // `prompts` (in-equation gradeable gaps) and no `solution`, so this is
      // exactly that renderer's prompt-free branch, minus the number gutter a
      // definition block can never pull.
      return (
        '<div class="block block-math' + sizingClass(block) + '"' +
        ' data-block-category="content"' +
        ' data-block-type="math_block"' +
        blockIdAttr(block.id) +
        sizingAttrs(block) + '>' +
        renderMath(block.latex, { displayMode: true }) +
        '</div>'
      );
    default: {
      const _exhaustive: never = block;
      void _exhaustive;
      return '';
    }
  }
}

export function renderDefinitionBlocks(blocks: DefinitionBlock[]): string {
  return blocks.map(renderDefinitionBlock).join('');
}

// Plain-text flattening for the `data-definition` attribute — the no-JS /
// accessibility fallback, NOT the display form (that is the <template> above).
// Paragraph-ish blocks contribute their text joined by spaces; math, images, and
// figures contribute nothing (inline math already behaves this way), so the
// fallback stays a readable sentence rather than a latex dump.
export function definitionPlainText(blocks: DefinitionBlock[]): string {
  const parts: string[] = [];

  const fromInline = (
    content: { type: string; text?: string }[],
  ): string => {
    let out = '';
    for (const node of content) {
      if (node.type === 'text') out += node.text ?? '';
      else if (node.type === 'hard_break') out += ' ';
    }
    return out.trim();
  };

  const walkList = (items: {
    content: { type: string; text?: string }[];
    children?: { items: unknown[] }[];
  }[]): void => {
    for (const item of items) {
      const t = fromInline(item.content);
      if (t) parts.push(t);
      for (const child of item.children ?? []) {
        walkList(child.items as Parameters<typeof walkList>[0]);
      }
    }
  };

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
      case 'heading': {
        const t = fromInline(block.content);
        if (t) parts.push(t);
        break;
      }
      case 'bullet_list':
      case 'ordered_list':
        walkList(block.items);
        break;
      default:
        break;
    }
  }
  return parts.join(' ').trim();
}
