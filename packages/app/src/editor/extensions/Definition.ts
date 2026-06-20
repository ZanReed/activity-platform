import { Mark, mergeAttributes } from '@tiptap/core';

// ============================================================================
// Definition — Tiptap inline mark mirroring the schema's DefinitionMark.
// ----------------------------------------------------------------------------
// A mark (not a node): the defined text is still text — it wraps, can layer
// other marks, and is authored "select text → Define" rather than inserted.
// Carries the literal `definition` string (Phase 2) and a reserved
// `glossaryKey` (Phase 4 tenant glossary; no UI sets it). The published-page
// runtime shows `definition` in a popover; see packages/renderer/RUNTIME.md
// and docs/design/vocabulary-definitions.md.
//
// Editing UX: a single root-level DefinitionPopoverHost (mirrors
// BlankPopoverHost / ImagePopoverHost) watches the selection and opens an edit
// popover when the cursor is inside a definition mark — never a per-mark
// mounted popover, per the standing reconciliation constraint.
//
// Attribute round-trip is via the rendered span (data-definition /
// data-glossary-key) so editor copy-paste survives; serialize reads the attrs
// off the Tiptap JSON.
// ============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        definition: {
            // Apply a definition mark to the current selection. The popover host
            // watches the resulting active mark and opens the edit popover.
            setDefinition: (attrs?: {
                definition?: string;
                glossaryKey?: string | null;
            }) => ReturnType;
            // Update the definition mark covering the cursor. Extends to the
            // whole mark range first, so a collapsed cursor edits the word.
            updateDefinition: (attrs: {
                definition?: string;
                glossaryKey?: string | null;
            }) => ReturnType;
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
            definition: {
                default: '',
                parseHTML: (element) =>
                    element.getAttribute('data-definition') ?? '',
                renderHTML: (attributes) =>
                    attributes.definition
                        ? { 'data-definition': attributes.definition as string }
                        : {},
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
                            definition: attrs.definition ?? '',
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
