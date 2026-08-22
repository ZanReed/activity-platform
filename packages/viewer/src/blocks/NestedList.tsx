// =============================================================================
// blocks/NestedList.tsx — the recursive list renderer, shared by both list types
// -----------------------------------------------------------------------------
// `ListItem.children` holds whole nested LIST BLOCKS (not items), so bullets
// and numbers can mix freely at any depth. The nested list is a SIBLING of the
// item's inline content inside the same <li> — the HTML-correct placement, and
// the shape `serialize.ts` already round-trips in both directions.
//
// This existed and was lost: the implementation lived in the renderer package
// (deleted S9 Drop 4) while the schema field, the editor's Tab-to-indent, the
// importer's indented-markdown handling and the serializer's `children` emit
// all survived. For eight days a teacher could indent a sub-bullet, watch it
// save, reload it intact — and every student saw it flattened away.
// `DefinitionGlossary.tsx` kept rendering nesting correctly the whole time,
// which is the pattern this mirrors.
//
// ONE renderer for both block types rather than two near-identical ones: the
// recursion has to handle mixed nesting anyway, so a bullet-only and an
// ordered-only copy would each need the other's branch.
//
// DEPTH. Unbounded by schema, editor, importer and serializer alike, and
// teachers paste four- and five-deep outlines out of lesson plans. `data-depth`
// is emitted so the stylesheet can stop compounding the indent past level 3
// (ruling B3) — the same level the marker cascade resets at. Without that cap a
// level-6 item starts ~1.5in in and its text column keeps shrinking toward a
// one-word-per-line ribbon on paper, a failure the editor never shows because
// it does not use the print column width.
// =============================================================================

import { InlineContent, type RenderableInlineNode } from '../inline/InlineContent.js';

// Typed STRUCTURALLY, not against the schema's `BulletListBlock`, for the same
// reason `InlineContent` takes `RenderableInlineNode`: what reaches the viewer
// is the SANITIZED projection of the document, whose inline nodes differ from
// the raw ones (math prompts lose their answer fields). Naming the raw type
// here would force an `as never` at every call site — exactly the cast the
// inline renderer deliberately avoids. Everything this component touches is
// declared below; nothing else is needed to draw a list.
export interface RenderableListItem {
  readonly id: string;
  readonly content: readonly RenderableInlineNode[];
  readonly children?: readonly RenderableListBlock[];
}

export interface RenderableListBlock {
  readonly id: string;
  readonly type: 'bullet_list' | 'ordered_list';
  readonly items: readonly RenderableListItem[];
}

type ListBlock = RenderableListBlock;

/** Depth past which the indent stops compounding (B3). Marker cascade resets here too. */
export const MAX_INDENT_DEPTH = 3;

export function NestedList({ block, depth = 1 }: { block: ListBlock; depth?: number }) {
  const ordered = block.type === 'ordered_list';
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag
      className={`viewer-list viewer-list--${ordered ? 'ordered' : 'bullet'}`}
      // Depth is capped for STYLING purposes only; the tree itself is unbounded.
      data-depth={Math.min(depth, MAX_INDENT_DEPTH)}
      {...(depth === 1 ? { 'data-block-type': block.type } : {})}
    >
      {block.items.map((item) => (
        <li key={item.id} className="viewer-list__item">
          <InlineContent nodes={item.content} />
          {item.children?.map((child) => (
            <NestedList key={child.id} block={child} depth={depth + 1} />
          ))}
        </li>
      ))}
    </Tag>
  );
}

export default NestedList;
