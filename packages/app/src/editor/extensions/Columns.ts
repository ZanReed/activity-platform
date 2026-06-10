import { Node, mergeAttributes } from '@tiptap/core';

// =============================================================================
// Columns / Column — structural side-by-side container for the editor.
// -----------------------------------------------------------------------------
// Two cooperating nodes mirroring the schema's ColumnsBlock / Column pair:
//
//   columns  — top-level block, group 'block', draggable as a unit. Content is
//              exactly 2–6 `column` children (`column{2,6}`), matching the
//              schema's .min(2).max(6).
//   column   — a single cell. NOT in the 'block' group, so it can only ever
//              appear inside a `columns` node (never at doc top level). Its
//              content expression ENUMERATES the allowed cell block names
//              rather than using `block+` — this is how columns-in-columns is
//              forbidden at the ProseMirror level (the schema forbids it too).
//              `isolating` keeps editing contained to one cell (backspace at a
//              cell's start won't merge it into the neighbouring cell).
//
// Native rendering (renderHTML/parseHTML + CSS grid), NOT a React NodeView:
// avoids the Stage-13.5 NodeView reconciliation hazard. Per-column width UI
// and add/remove-column controls are deferred to a follow-on; the `width`
// attr is carried through round-trips now so that future UI (and imported
// documents) don't lose the value. The editor lays cells out equally via
// grid-auto-columns:1fr regardless of count; the published renderer honours
// the width weights.
// =============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        columns: {
            // count is clamped to 2–6; defaults to 2.
            insertColumns: (count?: number) => ReturnType;
            // Cycle the selected columns block's grid-lines state
            // (inherit → on → off → inherit).
            cycleColumnsGridLines: () => ReturnType;
        };
    }
}

// Grid-lines tri-state, mirroring the schema's ColumnGridLines:
//   'inherit' — follow the activity-wide default (Columns.options.gridLinesDefault)
//   'on' / 'off' — explicit per-block override
type GridLines = 'inherit' | 'on' | 'off';

export interface ColumnsOptions {
    // Activity-wide default a block's 'inherit' resolves to. Set via
    // Columns.configure({ gridLinesDefault }) from the activity's
    // meta.print.gridLines; the playground leaves it false. Fixed at editor
    // init (Tiptap configures extensions once) — changing the activity default
    // takes effect on reload; the published output is always authoritative.
    gridLinesDefault: boolean;
}

export const Columns = Node.create<ColumnsOptions>({
    name: 'columns',
    group: 'block',
    content: 'column{2,6}',
    draggable: true,
    selectable: true,
    isolating: true,

    addOptions() {
        return { gridLinesDefault: false };
    },

    addAttributes() {
        return {
            id: {
                default: '',
                parseHTML: (element) => element.getAttribute('data-block-id') ?? '',
                renderHTML: (attributes) =>
                attributes.id ? { 'data-block-id': attributes.id } : {},
            },
            // Tri-state grid-lines override. Persisted as data-grid-lines so it
            // round-trips through serialize; the resolved styling hook is a
            // separate attribute computed in renderHTML below.
            gridLines: {
                default: 'inherit' as GridLines,
                    parseHTML: (element) => {
                        const raw = element.getAttribute('data-grid-lines');
                        return raw === 'on' || raw === 'off' ? raw : 'inherit';
                    },
                renderHTML: (attributes) => ({
                    'data-grid-lines': attributes.gridLines ?? 'inherit',
                }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-columns]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
        // Resolve the tri-state for the editor's own styling. 'inherit' defers
        // to the activity default passed via configure(). data-grid is the
        // styling hook (editor.css); data-grid-lines (from the attr above)
        // carries the raw tri-state for serialize.
        const gl = (node.attrs.gridLines as GridLines) ?? 'inherit';
        const effective =
        gl === 'on' || (gl === 'inherit' && this.options.gridLinesDefault);
        return [
            'div',
            mergeAttributes(
                { 'data-columns': '', class: 'editor-columns' },
                HTMLAttributes,
                effective ? { 'data-grid': 'true' } : {},
            ),
        0,
        ];
    },

    addCommands() {
        return {
            insertColumns:
            (count = 2) =>
            ({ commands }) => {
                const n = Math.min(Math.max(Math.trunc(count), 2), 6);
                return commands.insertContent({
                    type: this.name,
                    attrs: { id: crypto.randomUUID() },
                    content: Array.from({ length: n }, () => ({
                        type: 'column',
                        content: [{ type: 'paragraph' }],
                    })),
                });
            },

            // Cycle the selected columns block's grid-lines tri-state:
            // inherit → on → off → inherit. No-op when the selection isn't
            // inside a columns block (updateAttributes returns false). The
            // tri-state (rather than a plain boolean) lets a block say "follow
            // the activity default" as a distinct state from an explicit on/off.
            cycleColumnsGridLines:
            () =>
            ({ editor, commands }) => {
                const current = (editor.getAttributes(this.name).gridLines ??
                    'inherit') as GridLines;
                const next: GridLines =
                    current === 'inherit' ? 'on' : current === 'on' ? 'off' : 'inherit';
                return commands.updateAttributes(this.name, { gridLines: next });
            },
        };
    },
});

export const Column = Node.create({
    name: 'column',
    // No `group` — a column is only ever valid inside a `columns` node, never
    // at doc top level. The enumerated content expression (not `block+`)
    // forbids a `columns` node nested inside a cell.
    content: '(paragraph | heading | mathBlock | bulletList | orderedList | fillInBlank)+',
    isolating: true,
    selectable: false,

    addAttributes() {
        return {
            // Per-column width weight (fr units). Optional; absent = equal split.
            // No UI sets this yet (deferred); carried through round-trips so an
            // imported document's weights survive.
            width: {
                default: null as number | null,
                    parseHTML: (element) => {
                        const raw = element.getAttribute('data-width');
                        if (raw === null) return null;
                        const n = Number(raw);
                        return Number.isFinite(n) && n > 0 ? n : null;
                    },
                renderHTML: (attributes) =>
                typeof attributes.width === 'number'
                ? { 'data-width': String(attributes.width) }
                : {},
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-column]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(
                { 'data-column': '', class: 'editor-column' },
                HTMLAttributes,
            ),
        0,
        ];
    },
});
