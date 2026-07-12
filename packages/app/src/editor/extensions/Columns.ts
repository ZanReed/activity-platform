import { Node, mergeAttributes, type Editor } from '@tiptap/core';
import {
    NodeSelection,
    Plugin,
    PluginKey,
    type EditorState,
} from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

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
// avoids the Stage-13.5 NodeView reconciliation hazard. Add/remove-column
// (addColumn/removeColumn) and width presets (cycleColumnWidths) are wired to
// the contextual toolbar. The editor lays cells out equally via
// grid-auto-columns:1fr regardless of the stored weights; the published
// renderer honours the per-column `width` weights the presets write.
// =============================================================================

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        columns: {
            // count is clamped to 2–6; defaults to 2.
            insertColumns: (count?: number) => ReturnType;
            // Cycle the selected columns block's grid-lines state
            // (inherit → on → off → inherit).
            cycleColumnsGridLines: () => ReturnType;
            // Add a column to the active columns block (clamped at the 6-column
            // max). Inserts beside the column holding the cursor, or appends
            // when the whole block is node-selected.
            addColumn: () => ReturnType;
            // Remove a column from the active columns block (clamped at the
            // 2-column min). Removes the column holding the cursor, or the last
            // column when the whole block is node-selected.
            removeColumn: () => ReturnType;
            // Cycle the active columns block through its width presets (the set
            // depends on the column count — see widthPresetOrder). No-op (and
            // toolbar-disabled via editor.can()) for 4–6-column blocks, which
            // are even-only.
            cycleColumnWidths: () => ReturnType;
            // Apply a specific width preset to the active columns block. Used by
            // the visual width picker (direct selection, vs. cycleColumnWidths'
            // step-through). No-op when not in a columns block, or when the
            // preset isn't valid for the block's column count.
            setColumnWidthPreset: (preset: WidthPreset) => ReturnType;
            // Set (or clear, with null) the active cell's reserved work-space
            // floor — schema Column.minHeight, in rem. Values clamp to the
            // CELL_MIN_HEIGHT_* bounds. No-op outside a columns block.
            setColumnMinHeight: (minHeight: number | null) => ReturnType;
        };
    }
}

// =============================================================================
// Width presets — pure helpers (no DOM / no ProseMirror), so they're unit-
// testable on their own. A preset names which column is emphasised and how:
//   wide-*   ⇒ that column gets weight 2 (the others stay 1 ⇒ stored null)
//   narrow-* ⇒ that column gets weight 0.5 (the others stay 1 ⇒ stored null)
//   even     ⇒ all null (equal split)
// Weights are stored as the minimum needed for the ratio (the single emphasised
// column's weight, others null ⇒ 1fr in the renderer). The renderer already
// consumes any positive `width` as `<n>fr`, so 0.5 needs no renderer change.
// Narrow presets are only offered at count 3 — at count 2 a "narrow X" is the
// same ratio as "wide (other)", so it would be a redundant option.
// =============================================================================

const WIDE_WEIGHT = 2;
const NARROW_WEIGHT = 0.5;

export type WidthPreset =
    | 'even'
    | 'wide-left'
    | 'wide-center'
    | 'wide-right'
    | 'narrow-left'
    | 'narrow-center'
    | 'narrow-right';

// The available presets for a given column count. 2-col: even / wide-left /
// wide-right. 3-col adds wide-center plus the three narrow-* options. 4–6-col is
// even-only (a single-element order ⇒ nothing to choose ⇒ commands/UI disable).
export function widthPresetOrder(count: number): WidthPreset[] {
    if (count === 2) return ['even', 'wide-left', 'wide-right'];
    if (count === 3)
        return [
            'even',
            'wide-left',
            'wide-center',
            'wide-right',
            'narrow-left',
            'narrow-center',
            'narrow-right',
        ];
    return ['even'];
}

// The positional index (0 = left, count-1 = right, middle otherwise) a left/
// center/right preset suffix targets.
function presetTargetIndex(
    preset: Exclude<WidthPreset, 'even'>,
    count: number,
): number {
    if (preset.endsWith('-left')) return 0;
    if (preset.endsWith('-right')) return count - 1;
    return Math.floor((count - 1) / 2); // center
}

// Build the per-column width weights for a preset. Even ⇒ all null; a wide/
// narrow preset ⇒ the emphasised column's weight (2 or 0.5), null elsewhere.
export function presetToWidths(
    count: number,
    preset: WidthPreset,
): (number | null)[] {
    const widths: (number | null)[] = Array.from({ length: count }, () => null);
    if (preset === 'even') return widths;
    const idx = presetTargetIndex(preset, count);
    if (idx >= 0 && idx < count) {
        widths[idx] = preset.startsWith('narrow-') ? NARROW_WEIGHT : WIDE_WEIGHT;
    }
    return widths;
}

// Infer the current preset from stored width weights. Treat absent/<=0 as the
// baseline weight 1. If any column is heavier than the baseline, that's a wide-*
// preset at its position; otherwise if any is lighter, that's a narrow-* preset;
// otherwise even. Wide wins over narrow if both somehow appear (no preset writes
// both — this only matters for arbitrary imported weights, which normalise on
// the next pick).
export function detectWidthPreset(widths: (number | null)[]): WidthPreset {
    const count = widths.length;
    const norm = widths.map((w) =>
        typeof w === 'number' && w > 0 ? w : 1,
    );
    let wideIdx = -1;
    let maxW = 1;
    let narrowIdx = -1;
    let minW = 1;
    norm.forEach((w, i) => {
        if (w > maxW) {
            maxW = w;
            wideIdx = i;
        }
        if (w < minW) {
            minW = w;
            narrowIdx = i;
        }
    });
    const positional = (kind: 'wide' | 'narrow', idx: number): WidthPreset => {
        const side = idx === 0 ? 'left' : idx === count - 1 ? 'right' : 'center';
        return `${kind}-${side}` as WidthPreset;
    };
    if (wideIdx !== -1) return positional('wide', wideIdx);
    if (narrowIdx !== -1) return positional('narrow', narrowIdx);
    return 'even';
}

// The per-column width weights stored on a columns node, as a plain array
// (number | null) — the bridge between the ProseMirror node and the pure
// preset helpers above.
function columnWidths(columnsNode: ProseMirrorNode): (number | null)[] {
    const widths: (number | null)[] = [];
    for (let i = 0; i < columnsNode.childCount; i++) {
        const w = columnsNode.child(i).attrs.width;
        widths.push(typeof w === 'number' ? w : null);
    }
    return widths;
}

// =============================================================================
// Cell min-height (reserved work space) — bounds + pure clamp, exported for
// the toolbar control and unit tests. rem, like the schema field: it scales
// with the print font-size config. A floor, not a fixed height — the cell
// still grows with content (see docs/design/variable-block-sizing.md).
// =============================================================================

export const CELL_MIN_HEIGHT_MIN_REM = 1;
export const CELL_MIN_HEIGHT_MAX_REM = 60;

export function clampCellMinHeight(rem: number): number {
    const clamped = Math.min(
        Math.max(rem, CELL_MIN_HEIGHT_MIN_REM),
        CELL_MIN_HEIGHT_MAX_REM,
    );
    // Strip float artifacts so the stored attr serializes cleanly.
    return Math.round(clamped * 100) / 100;
}

// The active cell's min-height for the toolbar control. Null when the
// selection isn't in a columns block; { minHeight: null } = auto.
export function activeColumnMinHeight(
    editor: Editor,
): { minHeight: number | null } | null {
    const target = findColumnsTarget(editor.state);
    if (!target) return null;
    const cell = editor.state.doc.nodeAt(target.targetStart);
    if (!cell || cell.type.name !== 'column') return null;
    const raw = cell.attrs.minHeight;
    return {
        minHeight: typeof raw === 'number' && raw > 0 ? raw : null,
    };
}

// Current preset + column count for the active columns block, for the toolbar
// label / active state. Null when the selection isn't in a columns block.
// `cyclable` is false for 4–6-column (even-only) blocks.
export function activeColumnsWidthInfo(
    editor: Editor,
): { preset: WidthPreset; count: number; cyclable: boolean } | null {
    const target = findColumnsTarget(editor.state);
    if (!target) return null;
    const count = target.columnsNode.childCount;
    return {
        preset: detectWidthPreset(columnWidths(target.columnsNode)),
        count,
        cyclable: widthPresetOrder(count).length > 1,
    };
}

// Resolved positions for the column add/remove commands, located from the
// current selection. `insertEnd` is where a new column goes; `[targetStart,
// targetEnd]` is the column to remove. Two selection shapes are handled: a
// text cursor inside a cell (act on that cell) and a NodeSelection on the
// whole columns block (act on the last cell). Returns null when the selection
// isn't in a columns block at all.
interface ColumnsTarget {
    columnsNode: ProseMirrorNode;
    // Position just before the columns node (its content starts at +1).
    columnsPos: number;
    insertEnd: number;
    targetStart: number;
    targetEnd: number;
}

function findColumnsTarget(state: EditorState): ColumnsTarget | null {
    const { selection } = state;
    if (
        selection instanceof NodeSelection &&
        selection.node.type.name === 'columns'
    ) {
        const columnsNode = selection.node;
        // Position just before the columns node's closing token = end of its
        // content, i.e. where an appended column lands.
        const contentEnd = selection.from + columnsNode.nodeSize - 1;
        const lastChild = columnsNode.lastChild;
        return {
            columnsNode,
            columnsPos: selection.from,
            insertEnd: contentEnd,
            targetStart: lastChild ? contentEnd - lastChild.nodeSize : contentEnd,
            targetEnd: contentEnd,
        };
    }
    // Text cursor inside a cell: walk up to the columns node. Its column
    // children sit exactly one depth below it (the content spec is
    // `column{2,6}`), so the active cell is at depth d+1.
    const { $from } = selection;
    for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.name === 'columns') {
            const targetStart = $from.before(d + 1);
            const targetEnd = $from.after(d + 1);
            return {
                columnsNode: $from.node(d),
                columnsPos: $from.before(d),
                insertEnd: targetEnd,
                targetStart,
                targetEnd,
            };
        }
    }
    return null;
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

// =============================================================================
// Columns grip — an always-present drag affordance for the WHOLE columns block.
// -----------------------------------------------------------------------------
// The nested drag-handle (dragHandleNested.ts) deliberately yields the gap /
// cell-padding regions to the inner blocks, so the hover handle reaches a block
// inside a cell without flipping up to the container. That leaves the container
// without a reliable geometric grab region (especially in grid-lines mode, whose
// stretched cells fill the box). This grip restores it: a small handle pinned to
// each columns block's top-left corner, rendered as a widget decoration (NOT
// part of the document — it never serializes, and avoids the NodeView the rest
// of this node deliberately sidesteps). Dragging it starts a native ProseMirror
// node move, mirroring how @tiptap/extension-drag-handle stages a drag:
// select the node, stage `view.dragging`, and let PM's own drop logic do the
// move (which works across `isolating` cells). stopPropagation keeps PM's own
// dragstart from re-deriving a target from the grip's coordinates — we own it.
// =============================================================================

const columnsGripPluginKey = new PluginKey('columnsGrip');

function buildColumnsGrip(
    view: EditorView,
    getPos: () => number | undefined,
): HTMLElement {
    const grip = document.createElement('div');
    grip.className = 'editor-columns-grip';
    grip.setAttribute('contenteditable', 'false');
    grip.setAttribute('draggable', 'true');
    grip.setAttribute('title', 'Drag to move the whole columns block');
    grip.setAttribute('aria-label', 'Drag to move the columns block');
    // Six-dot grip glyph, matching the inner drag handle's icon.
    grip.innerHTML =
        '<svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor" aria-hidden="true">' +
        '<circle cx="3" cy="4" r="1.5"/><circle cx="9" cy="4" r="1.5"/>' +
        '<circle cx="3" cy="10" r="1.5"/><circle cx="9" cy="10" r="1.5"/>' +
        '<circle cx="3" cy="16" r="1.5"/><circle cx="9" cy="16" r="1.5"/></svg>';

    grip.addEventListener('dragstart', (event) => {
        if (!event.dataTransfer) return;
        // Own the gesture: keep PM's built-in dragstart (bound on the editor
        // DOM) from also firing and re-deriving a target from coordinates.
        event.stopPropagation();
        const widgetPos = getPos();
        if (typeof widgetPos !== 'number') return;
        // The widget sits just inside the columns node; walk up to the node and
        // take its `before` position (robust to position shifts).
        const $pos = view.state.doc.resolve(widgetPos);
        let depth = $pos.depth;
        while (depth > 0 && $pos.node(depth).type.name !== 'columns') depth -= 1;
        if ($pos.node(depth)?.type.name !== 'columns') return;
        const columnsPos = depth === 0 ? widgetPos : $pos.before(depth);
        const selection = NodeSelection.create(view.state.doc, columnsPos);
        const slice = view.state.doc.slice(selection.from, selection.to);
        // Stage the drag the way PM expects; with `move` true and the columns
        // node selected, PM's drop deletes the original and inserts at the drop
        // point — a real move, valid across the cells' isolating boundaries.
        view.dragging = { slice, move: true };
        view.dispatch(view.state.tr.setSelection(selection));
        const dom = view.nodeDOM(columnsPos);
        event.dataTransfer.clearData();
        event.dataTransfer.effectAllowed = 'move';
        if (dom instanceof HTMLElement) {
            event.dataTransfer.setDragImage(dom, 0, 0);
        }
    });

    return grip;
}

function columnsGripDecorations(state: EditorState): DecorationSet {
    const decorations: Decoration[] = [];
    state.doc.descendants((node, pos) => {
        if (node.type.name !== 'columns') return true;
        // Place the widget just inside the columns node (its first child slot),
        // so getPos() resolves inside the node. CSS pins it to the corner and
        // takes it out of flex flow, so it never disturbs the cells.
        decorations.push(
            Decoration.widget(pos + 1, buildColumnsGrip, {
                side: -1,
                key: `columns-grip-${pos}`,
            }),
        );
        return false; // columns can't nest — no need to descend
    });
    return DecorationSet.create(state.doc, decorations);
}

export const Columns = Node.create<ColumnsOptions>({
    name: 'columns',
    group: 'block',
    content: 'column{2,6}',
    draggable: true,
    selectable: true,
    isolating: true,

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: columnsGripPluginKey,
                props: {
                    decorations: columnsGripDecorations,
                },
            }),
        ];
    },

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

            // Add a column beside the active cell (or appended when the block
            // is node-selected). Guarded at the schema's 6-column max so the
            // `column{2,6}` content spec is never violated; returns false in
            // that case (and when not in a columns block), which also drives
            // the toolbar's disabled state via editor.can().
            addColumn:
            () =>
            ({ state, dispatch, tr }) => {
                const target = findColumnsTarget(state);
                if (!target || target.columnsNode.childCount >= 6) return false;
                if (dispatch) {
                    const newColumn = state.schema.nodes.column?.createAndFill();
                    if (!newColumn) return false;
                    dispatch(tr.insert(target.insertEnd, newColumn));
                }
                return true;
            },

            // Remove the active column (or the last when node-selected).
            // Guarded at the 2-column min; deleting content the cell held is
            // the expected consequence of removing a column.
            removeColumn:
            () =>
            ({ state, dispatch, tr }) => {
                const target = findColumnsTarget(state);
                if (!target || target.columnsNode.childCount <= 2) return false;
                if (dispatch) {
                    dispatch(tr.delete(target.targetStart, target.targetEnd));
                }
                return true;
            },

            // Advance the active columns block to the next width preset in its
            // count-specific cycle, writing each column's `width` attr. Returns
            // false (⇒ toolbar-disabled) when not in a columns block or when the
            // count has only the even preset (4–6 columns).
            cycleColumnWidths:
            () =>
            ({ state, dispatch, tr }) => {
                const target = findColumnsTarget(state);
                if (!target) return false;
                const n = target.columnsNode.childCount;
                const order = widthPresetOrder(n);
                if (order.length <= 1) return false;
                if (dispatch) {
                    const current = detectWidthPreset(columnWidths(target.columnsNode));
                    const nextIdx = (order.indexOf(current) + 1) % order.length;
                    const widths = presetToWidths(n, order[nextIdx] ?? 'even');
                    // setNodeMarkup is attr-only (no size change), so positions
                    // stay valid as we walk the cells with a running offset.
                    let pos = target.columnsPos + 1;
                    for (let i = 0; i < n; i++) {
                        const child = target.columnsNode.child(i);
                        tr.setNodeMarkup(pos, undefined, {
                            ...child.attrs,
                            width: widths[i] ?? null,
                        });
                        pos += child.nodeSize;
                    }
                    dispatch(tr);
                }
                return true;
            },

            // Apply a specific width preset to the active columns block (the
            // visual picker's direct-selection counterpart to cycleColumnWidths).
            // Returns false (⇒ option disabled) when not in a columns block or
            // when the preset isn't valid for the block's column count.
            setColumnWidthPreset:
            (preset: WidthPreset) =>
            ({ state, dispatch, tr }) => {
                const target = findColumnsTarget(state);
                if (!target) return false;
                const n = target.columnsNode.childCount;
                if (!widthPresetOrder(n).includes(preset)) return false;
                if (dispatch) {
                    const widths = presetToWidths(n, preset);
                    let pos = target.columnsPos + 1;
                    for (let i = 0; i < n; i++) {
                        const child = target.columnsNode.child(i);
                        tr.setNodeMarkup(pos, undefined, {
                            ...child.attrs,
                            width: widths[i] ?? null,
                        });
                        pos += child.nodeSize;
                    }
                    dispatch(tr);
                }
                return true;
            },

            // Set or clear the active cell's reserved work-space floor. Acts
            // on the cell holding the cursor (or the last cell when the whole
            // block is node-selected, mirroring removeColumn's target rule).
            setColumnMinHeight:
            (minHeight: number | null) =>
            ({ state, dispatch, tr }) => {
                const target = findColumnsTarget(state);
                if (!target) return false;
                const cell = state.doc.nodeAt(target.targetStart);
                if (!cell || cell.type.name !== 'column') return false;
                if (dispatch) {
                    const value =
                        typeof minHeight === 'number' && minHeight > 0
                            ? clampCellMinHeight(minHeight)
                            : null;
                    tr.setNodeMarkup(target.targetStart, undefined, {
                        ...cell.attrs,
                        minHeight: value,
                    });
                    dispatch(tr);
                }
                return true;
            },
        };
    },
});

export const Column = Node.create({
    name: 'column',
    // No `group` — a column is only ever valid inside a `columns` node, never
    // at doc top level. The enumerated content expression (not `block+`)
    // forbids a `columns` node nested inside a cell.
    content:
        '(paragraph | heading | mathBlock | bulletList | orderedList | fillInBlank | image | interactiveGraph | numberLine | dataPlot | multipleChoice | matching | ordering | learningObjectives | workedExample)+',
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
            // Reserved work space floor in rem (schema Column.minHeight).
            // No UI sets this yet (a later drop adds the bottom-edge drag);
            // carried through round-trips and previewed via min-height below.
            minHeight: {
                default: null as number | null,
                    parseHTML: (element) => {
                        const raw = element.getAttribute('data-min-height');
                        if (raw === null) return null;
                        const n = Number(raw);
                        return Number.isFinite(n) && n > 0 ? n : null;
                    },
                renderHTML: (attributes) =>
                typeof attributes.minHeight === 'number'
                ? { 'data-min-height': String(attributes.minHeight) }
                : {},
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-column]' }];
    },

    renderHTML({ node, HTMLAttributes }) {
        // Emit the stored weight as a flex-grow so the editor canvas previews
        // the real layout. The container (.editor-columns) is a flexbox; each
        // cell defaults to flex:1 1 0 (equal), and a weight overrides flex-grow
        // only (2 ⇒ wide, 0.5 ⇒ narrow). flex-grow with basis 0 distributes
        // space proportionally — the flexbox analogue of the renderer's fr
        // tracks, so editor and published output match. Absent weight ⇒ no
        // inline style ⇒ the CSS default (equal) applies. A minHeight floor
        // previews as a real min-height so the canvas shows the reserved
        // work space the published page (and paper) will have.
        const w = node.attrs.width;
        const mh = node.attrs.minHeight;
        const styles: string[] = [];
        if (typeof w === 'number' && w > 0) styles.push(`flex-grow:${w}`);
        if (typeof mh === 'number' && mh > 0) styles.push(`min-height:${mh}rem`);
        const styleAttr = styles.length > 0 ? { style: styles.join(';') } : {};
        return [
            'div',
            mergeAttributes(
                { 'data-column': '', class: 'editor-column' },
                HTMLAttributes,
                styleAttr,
            ),
        0,
        ];
    },
});
