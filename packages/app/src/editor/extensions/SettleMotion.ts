import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { Transaction } from '@tiptap/pm/state';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

// ============================================================================
// SettleMotion — the "snaps into place" confirm-motion (slice-6 stage 6).
// ----------------------------------------------------------------------------
// A placed block briefly animates as it lands: inserts scale-and-fade IN
// (`block-settle-in`), moved blocks bounce WITHOUT an opacity dip
// (`block-settle-move` — a dragged block already existed; fading it at the
// drop point reads as a glitch). Keyframes live in editor.css on the shared
// motion tokens; reduced-motion collapses both.
//
// Detection is EXPLICIT, never heuristic (eng-review ruling T2-1). Step-level
// "what got inserted" guessing is disqualified: splitBlock (Enter) emits an
// open-slice ReplaceStep that reads as a top-level insert, and every settings
// write (`setNodeMarkup`) is a ReplaceAroundStep that replaces the node
// boundary — both would settle on ordinary edits. Instead, a transaction
// settles only when one of three explicit signals marks it:
//
//   1. `tr.setMeta(settleMetaKey, 'insert' | 'move')` — commands that own
//      their transaction (wrapInColumns) tag it directly.
//   2. `armSettle(kind)` — invocation sites that can't reach the command's
//      transaction (SlashMenu / runInsert / InsertMenu invoke `item.command`,
//      which builds its own chain) arm the NEXT doc-changing transaction.
//      Module-level request store, same idiom as cropMode.ts. TTL-guarded so
//      a stray arm can't tag an unrelated later edit.
//   3. `tr.getMeta('uiEvent') === 'drop'` — prosemirror-view stamps native
//      drag-drops with this; a drop is a 'move'.
//
// WHERE to decorate comes from the transaction's own step ranges: a block
// settles only when its range is FULLY COVERED by an inserted range (an
// inserted node always is; the row merely containing a cell-insert is not,
// so a drop into a column settles the dropped block, not the whole row).
// Bulk cap: >3 covered blocks (markdown import) settles nothing.
//
// Cleanup (eng-review ruling T2-3): a delegated `animationend` listener
// clears each block's decoration the moment its animation finishes — this
// closes the remount-replay window (a NodeView remount while the class is
// still applied restarts the keyframe). A single janitor timeout (started
// when decorations exist, cancelled when they clear or the view destroys)
// catches the no-animationend edges: reduced-motion (animation:none never
// fires the event) and hidden tabs.
// ============================================================================

/** Transaction meta key: commands that own their `tr` tag it directly. */
export const settleMetaKey = 'settleMotion';

export type SettleKind = 'insert' | 'move';

// --- arm (request store) ----------------------------------------------------

// A stray arm (e.g. a command that ends up dispatching nothing) must not tag
// an unrelated later transaction; commands run synchronously after arming, so
// a short TTL is ample.
const ARM_TTL_MS = 200;

let armed: { kind: SettleKind; at: number } | null = null;

/**
 * Arm the next doc-changing transaction to settle. For invocation sites that
 * run `item.command(...)` (which builds its own chain internally, so the
 * caller never sees the transaction).
 */
export function armSettle(kind: SettleKind = 'insert'): void {
    armed = { kind, at: Date.now() };
}

// Exposed for tests only — a leftover arm in one test must not leak into the
// next.
export function resetSettleArm(): void {
    armed = null;
}

// --- placement geometry (pure, exported for unit tests) ---------------------

/**
 * The post-transaction document ranges its steps replaced, each mapped
 * through the remaining steps. Deletions map to empty ranges and are
 * dropped — only ranges that still cover content survive.
 */
export function changedRanges(
    tr: Transaction,
): { from: number; to: number }[] {
    const ranges: { from: number; to: number }[] = [];
    const maps = tr.mapping.maps;
    maps.forEach((stepMap, i) => {
        stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
            let from = newStart;
            let to = newEnd;
            for (let j = i + 1; j < maps.length; j++) {
                const m = maps[j];
                if (!m) continue;
                from = m.map(from, -1);
                to = m.map(to, 1);
            }
            if (to > from) ranges.push({ from, to });
        });
    });
    return ranges;
}

/**
 * The blocks a settle decorates: nodes whose range is FULLY covered by an
 * inserted range, collected outermost-first (a fully-covered row settles as
 * one row — its inner blocks are skipped, no nested animation). Qualifying
 * parents are the doc (top-level blocks) and column cells; anything deeper
 * belongs to a NodeView's internals and is never decorated.
 */
export function settleTargets(
    doc: ProseMirrorNode,
    ranges: { from: number; to: number }[],
): { pos: number; node: ProseMirrorNode }[] {
    const targets: { pos: number; node: ProseMirrorNode }[] = [];
    const seen = new Set<number>();
    for (const { from, to } of ranges) {
        doc.nodesBetween(from, to, (node, pos, parent) => {
            const parentName = parent?.type.name;
            const eligible =
                node.isBlock && (parentName === 'doc' || parentName === 'column');
            if (eligible && pos >= from && pos + node.nodeSize <= to) {
                if (!seen.has(pos)) {
                    seen.add(pos);
                    targets.push({ pos, node });
                }
                return false; // fully covered — don't settle its children too
            }
            // Not fully covered (e.g. the row merely containing a cell
            // insert): descend to find the actual inserted block.
            return parentName === undefined || parentName === 'doc' ||
                node.type.name === 'row' || node.type.name === 'column';
        });
    }
    return targets;
}

// Markdown import and other bulk writes land many blocks in one transaction;
// a mass settle strobes. Start-here's two-block starter stays under the cap.
const MAX_SETTLE_BLOCKS = 3;

// --- plugin -----------------------------------------------------------------

interface ClearMeta {
    // Clear the decoration(s) covering this position (animationend for one
    // block) or everything (janitor timeout).
    around?: number;
    all?: boolean;
}

const pluginKey = new PluginKey<DecorationSet>('settleMotion');

const SETTLE_ANIMATIONS = new Set(['block-settle-in', 'block-settle-move']);

// Janitor delay: comfortably past the animation (~180ms) so it only ever
// fires when animationend never will (reduced-motion, hidden tab).
const JANITOR_MS = 1200;

/**
 * The plugin proper, exported as a factory so unit tests can run the state
 * side (meta/arm gating → decorations) on a bare EditorState, no DOM.
 */
export function createSettleMotionPlugin(): Plugin<DecorationSet> {
    return new Plugin<DecorationSet>({
                key: pluginKey,
                state: {
                    init: () => DecorationSet.empty,
                    apply(tr, set) {
                        const clear = tr.getMeta(pluginKey) as
                            | ClearMeta
                            | undefined;
                        if (clear?.all) return DecorationSet.empty;
                        if (clear?.around !== undefined) {
                            set = set.remove(
                                set.find(clear.around, clear.around),
                            );
                        }
                        set = set.map(tr.mapping, tr.doc);

                        // What kind of placement is this transaction, if any?
                        let kind = tr.getMeta(settleMetaKey) as
                            | SettleKind
                            | undefined;
                        if (!kind && tr.getMeta('uiEvent') === 'drop') {
                            kind = 'move';
                        }
                        if (!kind && armed !== null && tr.docChanged) {
                            const fresh =
                                Date.now() - armed.at <= ARM_TTL_MS;
                            if (fresh) kind = armed.kind;
                            armed = null; // consumed either way
                        }
                        if (!kind || !tr.docChanged) return set;

                        const targets = settleTargets(
                            tr.doc,
                            changedRanges(tr),
                        );
                        if (
                            targets.length === 0 ||
                            targets.length > MAX_SETTLE_BLOCKS
                        ) {
                            return set;
                        }
                        const cls =
                            kind === 'move'
                                ? 'block-settle-move'
                                : 'block-settle-in';
                        return set.add(
                            tr.doc,
                            targets.map(({ pos, node }) =>
                                Decoration.node(pos, pos + node.nodeSize, {
                                    class: cls,
                                }),
                            ),
                        );
                    },
                },
                props: {
                    decorations(state) {
                        return pluginKey.getState(state);
                    },
                },
                view(view) {
                    let destroyed = false;
                    let janitor: ReturnType<typeof setTimeout> | null = null;

                    // Per-block clear the moment ITS animation finishes —
                    // the class must be gone before any NodeView remount can
                    // replay the keyframe.
                    const onAnimationEnd = (event: AnimationEvent) => {
                        if (!SETTLE_ANIMATIONS.has(event.animationName)) {
                            return;
                        }
                        if (destroyed || !(event.target instanceof Element)) {
                            return;
                        }
                        let pos: number;
                        try {
                            pos = view.posAtDOM(event.target, 0);
                        } catch {
                            return; // detached mid-event — janitor covers it
                        }
                        view.dispatch(
                            view.state.tr.setMeta(pluginKey, {
                                around: pos,
                            } satisfies ClearMeta),
                        );
                    };
                    view.dom.addEventListener('animationend', onAnimationEnd);

                    return {
                        update() {
                            const hasDecos =
                                (pluginKey.getState(view.state)?.find()
                                    .length ?? 0) > 0;
                            if (hasDecos && janitor === null) {
                                janitor = setTimeout(() => {
                                    janitor = null;
                                    if (destroyed) return;
                                    view.dispatch(
                                        view.state.tr.setMeta(pluginKey, {
                                            all: true,
                                        } satisfies ClearMeta),
                                    );
                                }, JANITOR_MS);
                            } else if (!hasDecos && janitor !== null) {
                                clearTimeout(janitor);
                                janitor = null;
                            }
                        },
                        destroy() {
                            destroyed = true;
                            if (janitor !== null) clearTimeout(janitor);
                            view.dom.removeEventListener(
                                'animationend',
                                onAnimationEnd,
                            );
                        },
                    };
                },
    });
}

export const SettleMotion = Extension.create({
    name: 'settleMotion',

    addProseMirrorPlugins() {
        return [createSettleMotionPlugin()];
    },
});
