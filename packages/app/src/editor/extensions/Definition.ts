import { Mark, mergeAttributes } from '@tiptap/core';
import type { DefinitionBlock } from '@activity/schema';

// ============================================================================
// Definition — Tiptap inline mark mirroring the schema's DefinitionMark.
// ----------------------------------------------------------------------------
// A mark (not a node): the defined text is still text — it wraps, can layer
// other marks, and is authored "select text → Define" rather than inserted.
// Carries `content` — a canonical DefinitionBlock[] (paragraphs, headings,
// lists, display math, images, static graph figures) — and a reserved
// `glossaryKey` (Phase 4 tenant glossary; no UI sets it). The published-page
// runtime shows the content in a popover; see packages/renderer/RUNTIME.md,
// docs/design/vocabulary-definitions.md, and
// docs/design/definition-rich-content.md.
//
// The former separate `image` attr is GONE (design doc D7): an image is now a
// member of DefinitionBlock, so there is one way to express one. The schema's
// Mark preprocess upgrades old marks, and the serializer runs the same helper
// over stale Tiptap attrs, so an editor session opened before the migration
// still saves correctly.
//
// content is JSON-encoded into data-content so editor copy-paste round-trips
// it; serialize reads the canonical value off the Tiptap JSON attrs (not the
// HTML). Editing UX: a single root-level DefinitionPopoverHost (mirrors
// BlankPopoverHost / ImagePopoverHost) — never a per-mark mounted popover, per
// the standing reconciliation constraint. The host opens the inline popover for
// a simple definition and a full dialog for a rich one (D5).
// ============================================================================

interface DefinitionAttrs {
    content?: DefinitionBlock[];
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
            // Rich definition content (canonical DefinitionBlock[]).
            // JSON-encoded into data-content for clipboard round-trips;
            // serialize reads the attr value directly.
            content: {
                default: [] as DefinitionBlock[],
                parseHTML: (element): DefinitionBlock[] => {
                    const raw = element.getAttribute('data-content');
                    if (!raw) return [];
                    try {
                        const parsed = JSON.parse(raw);
                        return Array.isArray(parsed)
                            ? (parsed as DefinitionBlock[])
                            : [];
                    } catch {
                        return [];
                    }
                },
                renderHTML: (attributes) => {
                    const content = attributes.content as DefinitionBlock[];
                    return Array.isArray(content) && content.length > 0
                        ? { 'data-content': JSON.stringify(content) }
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
