import { Mark, mergeAttributes } from '@tiptap/core';
import type { InlineNodes } from '../../lib/serialize';

// ============================================================================
// Definition — Tiptap inline mark mirroring the schema's DefinitionMark.
// ----------------------------------------------------------------------------
// A mark (not a node): the defined text is still text — it wraps, can layer
// other marks, and is authored "select text → Define" rather than inserted.
// Carries rich `content` (formatted text + inline math, the same alphabet the
// blank hint uses — authored via InlineRichTextEditor), an optional `image`,
// and a reserved `glossaryKey` (Phase 4 tenant glossary; no UI sets it). The
// published-page runtime shows the content + image in a popover; see
// packages/renderer/RUNTIME.md and docs/design/vocabulary-definitions.md.
//
// content + image are JSON-encoded into data-content / data-image so editor
// copy-paste round-trips them; serialize reads the canonical values off the
// Tiptap JSON attrs (not the HTML). Editing UX: a single root-level
// DefinitionPopoverHost (mirrors BlankPopoverHost / ImagePopoverHost) — never a
// per-mark mounted popover, per the standing reconciliation constraint.
// ============================================================================

export interface DefinitionImageAttr {
    src: string;
    alt: string;
}

interface DefinitionAttrs {
    content?: InlineNodes;
    image?: DefinitionImageAttr | null;
    glossaryKey?: string | null;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        definition: {
            // Apply a definition mark to the current selection. The popover host
            // watches the resulting active mark and opens the edit popover.
            setDefinition: (attrs?: DefinitionAttrs) => ReturnType;
            // Update the definition mark covering the cursor. Extends to the
            // whole mark range first, so a collapsed cursor edits the word.
            updateDefinition: (attrs: DefinitionAttrs) => ReturnType;
            // Remove the definition mark covering the cursor (whole range).
            unsetDefinition: () => ReturnType;
        };
    }
}

export const Definition = Mark.create({
    name: 'definition',
    // Don't keep extending the definition as the author types adjacent text:
    // the mark ends where the selected run ended.
    inclusive: false,

    addAttributes() {
        return {
            // Rich definition content (canonical InlineNode[]). JSON-encoded
            // into data-content for clipboard round-trips; serialize reads the
            // attr value directly.
            content: {
                default: [] as InlineNodes,
                parseHTML: (element): InlineNodes => {
                    const raw = element.getAttribute('data-content');
                    if (!raw) return [];
                    try {
                        const parsed = JSON.parse(raw);
                        return Array.isArray(parsed) ? (parsed as InlineNodes) : [];
                    } catch {
                        return [];
                    }
                },
                renderHTML: (attributes) => {
                    const content = attributes.content as InlineNodes;
                    return Array.isArray(content) && content.length > 0
                        ? { 'data-content': JSON.stringify(content) }
                        : {};
                },
            },
            image: {
                default: null as DefinitionImageAttr | null,
                parseHTML: (element): DefinitionImageAttr | null => {
                    const raw = element.getAttribute('data-image');
                    if (!raw) return null;
                    try {
                        const parsed = JSON.parse(raw);
                        return parsed &&
                            typeof parsed === 'object' &&
                            typeof parsed.src === 'string'
                            ? {
                                  src: parsed.src,
                                  alt:
                                      typeof parsed.alt === 'string'
                                          ? parsed.alt
                                          : '',
                              }
                            : null;
                    } catch {
                        return null;
                    }
                },
                renderHTML: (attributes) => {
                    const image = attributes.image as DefinitionImageAttr | null;
                    return image && image.src
                        ? { 'data-image': JSON.stringify(image) }
                        : {};
                },
            },
            glossaryKey: {
                default: null as string | null,
                parseHTML: (element) =>
                    element.getAttribute('data-glossary-key'),
                renderHTML: (attributes) =>
                    attributes.glossaryKey
                        ? {
                              'data-glossary-key':
                                  attributes.glossaryKey as string,
                          }
                        : {},
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span.definition' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            mergeAttributes({ class: 'definition' }, HTMLAttributes),
            0,
        ];
    },

    addCommands() {
        return {
            setDefinition:
                (attrs = {}) =>
                ({ chain }) =>
                    chain()
                        .setMark(this.name, {
                            content: attrs.content ?? [],
                            image: attrs.image ?? null,
                            glossaryKey: attrs.glossaryKey ?? null,
                        })
                        .run(),
            updateDefinition:
                (attrs) =>
                ({ chain }) =>
                    chain()
                        .extendMarkRange(this.name)
                        .updateAttributes(this.name, attrs)
                        .run(),
            unsetDefinition:
                () =>
                ({ chain }) =>
                    chain().extendMarkRange(this.name).unsetMark(this.name).run(),
        };
    },
});
