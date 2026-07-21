import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CalloutView from '../nodeViews/CalloutView';

// ============================================================================
// Callout — Tiptap block node for the callout block. A tinted note box with an
// editable inline BODY (text + inline math, same alphabet as a self_explanation
// prompt) and a `variant` attribute (info / warning / success / note) picked in
// the NodeView's inline switcher. Pure CONTENT — no answer, no numbering; the
// renderer already emits `<aside class="block-callout-*">` for it (see
// renderer/blocks/callout.ts), so this extension just makes the shipped schema +
// renderer block reachable in the editor (it was previously an orphan — see the
// serialize `case 'callout'` that used to return null).
// ============================================================================

export const CALLOUT_VARIANTS = ['info', 'warning', 'success', 'note'] as const;
export type CalloutVariantValue = (typeof CALLOUT_VARIANTS)[number];

function coerceVariant(raw: unknown): CalloutVariantValue {
    return CALLOUT_VARIANTS.includes(raw as CalloutVariantValue)
        ? (raw as CalloutVariantValue)
        : 'info';
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        callout: {
            insertCallout: (variant?: CalloutVariantValue) => ReturnType;
        };
    }
}

export const Callout = Node.create({
    name: 'callout',
    group: 'block',
    content: '(text | mathInline)*',
    draggable: true,
    selectable: true,
    definingForContent: true,

    addAttributes() {
        return {
            id: {
                default: '',
                parseHTML: (element) => element.getAttribute('data-block-id') ?? '',
                renderHTML: (attributes) =>
                    attributes.id ? { 'data-block-id': attributes.id } : {},
            },
            variant: {
                default: 'info',
                parseHTML: (element) => coerceVariant(element.getAttribute('data-variant')),
                renderHTML: (attributes) => ({
                    'data-variant': coerceVariant(attributes.variant),
                }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'aside[data-callout]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['aside', mergeAttributes({ 'data-callout': '' }, HTMLAttributes), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CalloutView);
    },

    addCommands() {
        return {
            insertCallout:
                (variant = 'info') =>
                ({ chain }) =>
                    chain()
                        .focus()
                        .insertContent({
                            type: this.name,
                            attrs: { id: crypto.randomUUID(), variant: coerceVariant(variant) },
                        })
                        .run(),
        };
    },
});
