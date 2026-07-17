import type { Attributes } from '@tiptap/core';

// ============================================================================
// sizingNodeAttributes — shared width/align Tiptap attributes for sized blocks.
// ----------------------------------------------------------------------------
// The per-block sizing fragment (schema sizing.ts) as Tiptap node attributes:
// width (fraction in (0,1], null = full) + align ('left'/'right', null =
// center). Spread into a node's addAttributes() so image / interactive-graph /
// data-plot / number-line all declare identical sizing attrs instead of four
// hand-copied blocks. parseHTML/renderHTML use the SAME data-block-width /
// data-block-align names the renderer emits, so editor copy-paste round-trips
// cleanly. Storage round-trip goes through serialize.ts (applySizingAttrs /
// sizingTiptapAttrs); these attrs are what those helpers read/write.
// ============================================================================

export function sizingNodeAttributes(): Attributes {
    return {
        width: {
            default: null as number | null,
            parseHTML: (element: HTMLElement) => {
                const raw = element.getAttribute('data-block-width');
                if (raw === null) return null;
                const n = Number(raw);
                return Number.isFinite(n) && n > 0 && n <= 1 ? n : null;
            },
            renderHTML: (attributes: Record<string, unknown>) =>
                typeof attributes.width === 'number'
                    ? { 'data-block-width': String(attributes.width) }
                    : {},
        },
        align: {
            default: null as 'left' | 'right' | null,
            parseHTML: (element: HTMLElement) => {
                const raw = element.getAttribute('data-block-align');
                return raw === 'left' || raw === 'right' ? raw : null;
            },
            renderHTML: (attributes: Record<string, unknown>) =>
                attributes.align === 'left' || attributes.align === 'right'
                    ? { 'data-block-align': attributes.align }
                    : {},
        },
    };
}
