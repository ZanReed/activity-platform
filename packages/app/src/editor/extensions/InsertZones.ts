import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { insertZonePositions } from '../strictGrid';

// ============================================================================
// InsertZones — the persistent inter-block "add a block here" affordance.
// ----------------------------------------------------------------------------
// A faint always-visible strip sits in the gap above every block in a column
// plus one at each column's end (seam model + suppression: strictGrid's
// `insertZonePositions`). Clicking a strip opens the block picker at that seam;
// Editor.tsx wires the click back into React via `storage.onZoneClick`.
//
// Mechanism (eng-review 2026-07-23):
//   • Widget decorations, NOT a measured React overlay — they flow with the
//     document at zero at-rest cost and never touch RowSeamCaret's position
//     math (widgets don't occupy doc positions). `props.decorations` recomputes
//     the whole set every view update (the PlaceholderHint idiom): the walk is
//     O(blocks), and stable per-seam widget keys let ProseMirror reuse the DOM
//     so nothing churns on a keystroke or caret move. No structural classifier.
//   • The widget DOM is aria-hidden + tabindex=-1: a pointer/touch convenience
//     only. The keyboard/AT insert floor stays the slash menu, toolbar Insert
//     menu, and the end square — announcing a "+" between every block would be
//     screen-reader spam for a redundant affordance.
//   • Zero-height, in-flow: the widget box has no height/border/padding and its
//     visible parts are absolutely positioned, so adjacent block margins
//     collapse THROUGH it — no layout shift, WYSIWYG preserved.
//   • Hidden while a block drag is in flight (the dropcursor owns placement and
//     the zones' hit bands would sit on the drop targets). A class toggled on
//     the editor DOM by the drag events drives the CSS — no decoration rebuild.
// ============================================================================

export interface InsertZonesStorage {
    /** Set by Editor.tsx post-mount; called with the seam a strip was clicked at. */
    onZoneClick: ((pos: number, kind: 'before' | 'append') => void) | null;
}

const insertZonesKey = new PluginKey('insertZones');

function buildZone(
    editor: Editor,
    pos: number,
    kind: 'before' | 'append',
): HTMLElement {
    const zone = document.createElement('div');
    zone.className = `editor-insert-zone editor-insert-zone--${kind}`;
    zone.setAttribute('data-insert-zone', kind);
    zone.setAttribute('aria-hidden', 'true');
    zone.contentEditable = 'false';

    const line = document.createElement('span');
    line.className = 'editor-insert-zone__line';
    const plus = document.createElement('span');
    plus.className = 'editor-insert-zone__plus';
    plus.textContent = '+';
    zone.append(line, plus);

    // Don't move the caret / blur the editor on press; the click opens the picker.
    zone.addEventListener('mousedown', (e) => e.preventDefault());
    zone.addEventListener('click', (e) => {
        e.preventDefault();
        const storage = (editor.storage as { insertZones?: InsertZonesStorage })
            .insertZones;
        storage?.onZoneClick?.(pos, kind);
    });
    return zone;
}

export const InsertZones = Extension.create<
    Record<string, never>,
    InsertZonesStorage
>({
    name: 'insertZones',

    addStorage() {
        return { onZoneClick: null };
    },

    addProseMirrorPlugins() {
        const editor = this.editor;
        return [
            new Plugin({
                key: insertZonesKey,
                props: {
                    // Toggle a class on the editor DOM for the whole duration of
                    // a block drag; CSS hides the zone layer while it's set.
                    handleDOMEvents: {
                        dragstart: (view) => {
                            view.dom.classList.add('is-dragging-block');
                            return false;
                        },
                        dragend: (view) => {
                            view.dom.classList.remove('is-dragging-block');
                            return false;
                        },
                        drop: (view) => {
                            view.dom.classList.remove('is-dragging-block');
                            return false;
                        },
                    },
                    decorations: (state) => {
                        const zones = insertZonePositions(state.doc);
                        if (zones.length === 0) return DecorationSet.empty;
                        const decorations = zones.map(({ pos, kind }) =>
                            Decoration.widget(
                                pos,
                                () => buildZone(editor, pos, kind),
                                {
                                    // Stable per-seam key → PM reuses the widget
                                    // DOM across recomputes (no churn on typing /
                                    // caret moves); rebuilds only when the seam
                                    // position actually shifts.
                                    key: `insert-zone-${kind}-${pos}`,
                                    // `before` renders left of its block; the
                                    // column-end `append` after the last block.
                                    side: kind === 'append' ? 1 : -1,
                                    // Our own DOM handles its clicks — keep PM
                                    // out of the widget's events entirely.
                                    stopEvent: () => true,
                                    ignoreSelection: true,
                                },
                            ),
                        );
                        return DecorationSet.create(state.doc, decorations);
                    },
                },
            }),
        ];
    },
});
