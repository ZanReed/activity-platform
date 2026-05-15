import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SectionBreakView } from '../nodeViews/SectionBreakView';

// =============================================================================
// SectionBreak — Tiptap atom node that opens a new Section in the document.
// -----------------------------------------------------------------------------
// The `title` and `isCheckpoint` attrs are a *staging area* for the eventual
// schema-side Section.title / Section.isCheckpoint fields. The serialize layer
// (packages/app/src/lib/serialize.ts) reads these attrs off the break and
// writes them onto the Section that the break opens.
//
// First-section UX (Stage 9c, intentional): the very first Section in any
// document is implicit and inherits defaults (no title, not a checkpoint).
// If a teacher wants to title or check the first section, they insert a
// section_break at the top of the document. Stage 15 will add a proper
// activity-properties panel that covers first-section metadata alongside
// submissionMode / revisionMode / activityType / skills.
// =============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        sectionBreak: {
            insertSectionBreak: () => ReturnType;
        };
    }
}

export const SectionBreak = Node.create({
    name: 'sectionBreak',
    group: 'block',
    atom: true,        // no editable content slot; NodeView provides its own UI
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            title: {
                default: null as string | null,
                    // parseHTML/renderHTML below are used only by Tiptap's *internal* HTML
                    // serialization (clipboard, etc). The renderer package handles
                    // published-HTML output via the schema-side Section, not via these.
                    parseHTML: (el) => el.getAttribute('data-title'),
                                        renderHTML: (attrs) =>
                                        attrs.title ? { 'data-title': attrs.title } : {},
            },
            isCheckpoint: {
                default: false,
                    parseHTML: (el) => el.getAttribute('data-is-checkpoint') === 'true',
                                        renderHTML: (attrs) => ({
                                            'data-is-checkpoint': attrs.isCheckpoint ? 'true' : 'false',
                                        }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-section-break]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-section-break': '' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(SectionBreakView);
    },

    addCommands() {
        return {
            insertSectionBreak:
            () =>
            ({ commands }) =>
            commands.insertContent({ type: this.name }),
        };
    },
});
