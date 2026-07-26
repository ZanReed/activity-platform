import type { DefinitionBlock, DefinitionImageBlock } from '@activity/schema';

// ============================================================================
// definitionShape — which editing surface a definition belongs to.
// ----------------------------------------------------------------------------
// A definition's content is a DefinitionBlock[] (docs/design/
// definition-rich-content.md). Two surfaces author it: the inline popover
// (D5, the common case — a sentence, optionally with a picture) and the full
// dialog (everything else).
//
// The split is a DATA-LOSS GUARD, not an ergonomic preference.
// DefinitionEditPopover commits its whole draft over the mark's `content` on
// every exit path — Done, Escape, and outside-click alike. Its editor is
// inline-only, so if it were ever opened on a multi-block definition, a stray
// Escape would silently delete every block after the first. isSimpleDefinition
// is what makes that unreachable: anything it rejects gets a read-only preview
// with no commit path at all.
//
// "Simple" is exactly the shape the popover can represent losslessly: an
// optional leading paragraph plus an optional trailing image — which is also
// precisely what the schema's legacy upgrades produce (an old inline definition
// becomes one paragraph; an old `image` attr becomes a trailing image block,
// D7). So every definition authored before this feature stays popover-editable;
// none of them turn read-only.
// ============================================================================

export interface SimpleDefinitionParts {
    paragraph: Extract<DefinitionBlock, { type: 'paragraph' }> | null;
    image: DefinitionImageBlock | null;
}

/**
 * Split content into the popover's two fields, or return null when the
 * definition is richer than the popover can edit.
 *
 * Accepted shapes: [] · [paragraph] · [image] · [paragraph, image].
 */
export function simpleDefinitionParts(
    content: DefinitionBlock[],
): SimpleDefinitionParts | null {
    let paragraph: SimpleDefinitionParts['paragraph'] = null;
    let image: DefinitionImageBlock | null = null;

    for (const block of content) {
        if (block.type === 'paragraph') {
            // A second paragraph is richer than one field can hold.
            if (paragraph !== null || image !== null) return null;
            paragraph = block;
        } else if (block.type === 'image') {
            if (image !== null) return null;
            image = block;
        } else {
            return null;
        }
    }
    return { paragraph, image };
}

export function isSimpleDefinition(content: DefinitionBlock[]): boolean {
    return simpleDefinitionParts(content) !== null;
}

/** Rebuild content from the popover's two fields, dropping empty ones. */
export function partsToDefinitionContent(
    parts: SimpleDefinitionParts,
): DefinitionBlock[] {
    const out: DefinitionBlock[] = [];
    if (parts.paragraph && parts.paragraph.content.length > 0) {
        out.push(parts.paragraph);
    }
    if (parts.image) out.push(parts.image);
    return out;
}
