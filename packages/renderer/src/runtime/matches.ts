// =============================================================================
// runtime/matches.ts — Matching-block pairing + scoring
// -----------------------------------------------------------------------------
// File pattern matches mcs.ts: pure decision functions (setPair/removePair/
// scoreMatchBlocks — mutate state, no DOM writes) + event-handler wrappers
// (wireMatching). Tests drive the pure functions with fixtured state + refs.
//
// Interaction (design doc, decisions 4/7): POINTER DRAG over a keyboard
// select-then-place grammar. A target card is dragged from the right-column
// bank onto an item's dock; the card physically docks there (render() moves
// the node; the emptied bank slot shows a ghost letter). Under
// allowTargetReuse the bank card never moves — render() places a cloned chip
// in the dock instead, and several items may share one target.
//
// During a pointer drag the card's transform (and dock hover highlight) are
// written DIRECTLY — the popover-drag precedent: routing every pointermove
// through onUpdate would re-render + re-persist per pixel. The DROP commits
// through state + onUpdate like every other mutation.
//
// Keyboard grammar (state.arrange): Enter/Space lifts a focused card,
// ArrowUp/Down walk the item docks, Enter/Space drops, Escape cancels,
// Delete/Backspace on a docked card un-docks it. Short status messages are
// written to the block's aria-live line (the graph widget's narrate-line
// precedent).
//
// Scoring is PER PAIR: each item is one point, correct when its docked
// target equals the baked key. Block result = every pair correct. A block
// with NO pairs is an omission (result null) — its items still count in the
// section total, mirroring empty blanks.
// =============================================================================

import type { MatchRef, Refs } from './refs.js';
import type { MatchBlockState, RuntimeState } from './state.js';

/** Per-pair tally for one block. total = the item count (the denominator). */
export function scoreMatchPairs(
    pairs: Record<string, string>,
    key: Record<string, string>,
    itemIds: string[],
): { earned: number; total: number } {
    let earned = 0;
    for (const itemId of itemIds) {
        const docked = pairs[itemId];
        if (docked !== undefined && docked === key[itemId]) earned += 1;
    }
    return { earned, total: itemIds.length };
}

/**
 * Score the given matching blocks into state. Unanswered blocks (no pairs)
 * score null — unscored omission. Mutates state; no DOM access.
 */
export function scoreMatchBlocks(
    state: RuntimeState,
    refs: Refs,
    blockIds: Iterable<string>,
): void {
    for (const blockId of blockIds) {
        const ref = refs.matches.get(blockId);
        const matchState = state.matches[blockId];
        if (!ref || !matchState) continue;
        const { earned, total } = scoreMatchPairs(
            matchState.pairs,
            ref.key,
            ref.itemIds,
        );
        matchState.earned = earned;
        matchState.total = total;
        matchState.result =
            Object.keys(matchState.pairs).length === 0
                ? null
                : earned === total;
    }
}

/**
 * Dock a target on an item (state only — render moves the DOM). Without
 * reuse, the target is first released from any other item, and whatever
 * card occupied this dock is displaced back to the bank (its pair entry
 * is simply dropped).
 */
export function setPair(
    matchState: MatchBlockState,
    itemId: string,
    targetId: string,
    allowReuse: boolean,
): void {
    if (!allowReuse) {
        for (const [otherItem, otherTarget] of Object.entries(matchState.pairs)) {
            if (otherTarget === targetId && otherItem !== itemId) {
                delete matchState.pairs[otherItem];
            }
        }
    }
    matchState.pairs[itemId] = targetId;
}

export function removePair(matchState: MatchBlockState, itemId: string): void {
    delete matchState.pairs[itemId];
}

/** The item currently holding this target, or null (reuse: first holder). */
function itemHolding(
    matchState: MatchBlockState,
    targetId: string,
): string | null {
    for (const [itemId, docked] of Object.entries(matchState.pairs)) {
        if (docked === targetId) return itemId;
    }
    return null;
}

function narrate(ref: MatchRef, message: string): void {
    if (ref.statusEl && ref.statusEl.textContent !== message) {
        ref.statusEl.textContent = message;
    }
}

function isLocked(state: RuntimeState, ref: MatchRef): boolean {
    return state.sections[ref.sectionId]?.locked === true;
}

/** Movement below this many px between down and up reads as a TAP. */
const TAP_SLOP_PX = 5;

/**
 * Wire pointer-drag + keyboard handlers onto every target card, and (reuse
 * mode) a delegated click handler for removing docked chips. All listeners
 * attach once at init to elements captured in refs; the reuse chips render()
 * creates later are reached via delegation on the block root.
 */
export function wireMatching(
    state: RuntimeState,
    refs: Refs,
    onUpdate: () => void,
): void {
    for (const [blockId, ref] of refs.matches) {
        for (const targetId of ref.targetIds) {
            const target = ref.targets.get(targetId);
            if (!target) continue;
            wireCard(state, refs, blockId, ref, targetId, target.card, onUpdate);
        }

        // Tap-to-place: after a tap lifts a bank card (see the tap branch in
        // endDrag), tapping an item row places it there — the touch twin of
        // the keyboard grammar.
        for (const itemId of ref.itemIds) {
            const item = ref.items.get(itemId);
            if (!item) continue;
            item.el.addEventListener('click', () => {
                if (isLocked(state, ref) || state.submitted) return;
                const a = state.arrange;
                if (!a || a.kind !== 'match' || a.blockId !== blockId) return;
                const matchState = state.matches[blockId];
                if (!matchState) return;
                setPair(matchState, itemId, a.id, ref.allowReuse);
                narrate(
                    ref,
                    (ref.targets.get(a.id)?.letter ?? '') +
                        ' placed on item ' +
                        (ref.itemIds.indexOf(itemId) + 1) +
                        '.',
                );
                state.arrange = null;
                onUpdate();
            });
        }

        // Reuse mode: docked chips are render()-created clones with no
        // listeners of their own — a delegated click on the block root
        // removes that pairing. (Non-reuse docks hold the REAL card, whose
        // own handlers cover it.)
        if (ref.allowReuse) {
            ref.el.addEventListener('click', (e) => {
                if (isLocked(state, ref)) return;
                const chip = (e.target as HTMLElement | null)?.closest?.(
                    '.match-docked-chip',
                );
                if (!(chip instanceof HTMLElement)) return;
                const itemId = chip.dataset.itemId;
                const matchState = state.matches[blockId];
                if (!itemId || !matchState) return;
                removePair(matchState, itemId);
                narrate(ref, 'Removed.');
                onUpdate();
            });
        }
    }
}

function wireCard(
    state: RuntimeState,
    refs: Refs,
    blockId: string,
    ref: MatchRef,
    targetId: string,
    card: HTMLElement,
    onUpdate: () => void,
): void {
    // ---- Pointer drag -------------------------------------------------------
    // Handler-local gesture tracking (the popover-drag precedent). Dock rects
    // are measured once at gesture start; transform + hover highlight are
    // written directly during the move; the drop commits via state + onUpdate.
    let drag: {
        pointerId: number;
        startX: number;
        startY: number;
        docks: Array<{ itemId: string; rect: DOMRect }>;
        hover: string | null;
    } | null = null;

    const hoverDock = (itemId: string | null): void => {
        if (drag === null || drag.hover === itemId) return;
        if (drag.hover !== null) {
            ref.items.get(drag.hover)?.slot.classList.remove('drag-over');
        }
        if (itemId !== null) {
            ref.items.get(itemId)?.slot.classList.add('drag-over');
        }
        drag.hover = itemId;
    };

    card.addEventListener('pointerdown', (e) => {
        if (isLocked(state, ref) || state.submitted) return;
        drag = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            // The WHOLE item row is the drop target (the bare dock is a small
            // target on touch); the highlight still lands on the dock.
            docks: ref.itemIds
                .map((itemId) => {
                    const item = ref.items.get(itemId);
                    return item
                        ? { itemId, rect: item.el.getBoundingClientRect() }
                        : null;
                })
                .filter((d): d is { itemId: string; rect: DOMRect } => d !== null),
            hover: null,
        };
        card.setPointerCapture(e.pointerId);
        card.classList.add('dragging');
        e.preventDefault();
    });

    card.addEventListener('pointermove', (e) => {
        if (drag === null || e.pointerId !== drag.pointerId) return;
        card.style.transform =
            'translate(' +
            (e.clientX - drag.startX) +
            'px,' +
            (e.clientY - drag.startY) +
            'px)';
        hoverDock(dockAt(drag.docks, e.clientX, e.clientY));
    });

    const endDrag = (e: PointerEvent, commit: boolean): void => {
        if (drag === null || e.pointerId !== drag.pointerId) return;
        const gesture = drag;
        hoverDock(null);
        drag = null;
        card.classList.remove('dragging');
        card.style.transform = '';
        if (card.hasPointerCapture(e.pointerId)) {
            card.releasePointerCapture(e.pointerId);
        }
        if (!commit) return;

        const matchState = state.matches[blockId];
        if (!matchState) return;
        const moved =
            Math.abs(e.clientX - gesture.startX) > TAP_SLOP_PX ||
            Math.abs(e.clientY - gesture.startY) > TAP_SLOP_PX;
        const holder = itemHolding(matchState, targetId);

        if (!moved) {
            // A tap on a DOCKED card sends it back to the bank (touch-friendly
            // undo). A tap on a bank card lifts it for select-then-place —
            // the tap twin of the keyboard grammar.
            if (!ref.allowReuse && holder !== null) {
                removePair(matchState, holder);
                narrate(ref, ref.targets.get(targetId)?.letter + ' returned.');
                onUpdate();
            } else {
                liftCard(state, ref, blockId, targetId);
                onUpdate();
            }
            return;
        }

        const dropItem = dockAt(gesture.docks, e.clientX, e.clientY);
        if (dropItem !== null) {
            setPair(matchState, dropItem, targetId, ref.allowReuse);
            narrate(
                ref,
                (ref.targets.get(targetId)?.letter ?? '') +
                    ' placed on item ' +
                    (ref.itemIds.indexOf(dropItem) + 1) +
                    '.',
            );
        } else if (!ref.allowReuse && holder !== null) {
            // Dragged off every dock → back to the bank.
            removePair(matchState, holder);
            narrate(ref, (ref.targets.get(targetId)?.letter ?? '') + ' returned.');
        }
        state.arrange = null;
        onUpdate();
    };

    card.addEventListener('pointerup', (e) => endDrag(e, true));
    card.addEventListener('pointercancel', (e) => endDrag(e, false));

    // ---- Keyboard select-then-place ----------------------------------------
    card.addEventListener('keydown', (e) => {
        if (isLocked(state, ref) || state.submitted) return;
        const matchState = state.matches[blockId];
        if (!matchState) return;
        const lifted =
            state.arrange !== null &&
            state.arrange.kind === 'match' &&
            state.arrange.blockId === blockId &&
            state.arrange.id === targetId;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!lifted) {
                liftCard(state, ref, blockId, targetId);
                narrate(
                    ref,
                    'Picked up ' +
                        (ref.targets.get(targetId)?.letter ?? '') +
                        '. Use arrow keys to choose an item, Enter to place, Escape to cancel.',
                );
            } else {
                const cursor = state.arrange?.cursorItemId;
                if (cursor) {
                    setPair(matchState, cursor, targetId, ref.allowReuse);
                    narrate(
                        ref,
                        (ref.targets.get(targetId)?.letter ?? '') +
                            ' placed on item ' +
                            (ref.itemIds.indexOf(cursor) + 1) +
                            '.',
                    );
                }
                state.arrange = null;
            }
            onUpdate();
        } else if (lifted && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            const cursor = state.arrange?.cursorItemId ?? null;
            const at = cursor === null ? -1 : ref.itemIds.indexOf(cursor);
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            const next =
                (at + delta + ref.itemIds.length) % ref.itemIds.length;
            const nextId = ref.itemIds[next];
            if (state.arrange && nextId !== undefined) {
                state.arrange.cursorItemId = nextId;
                narrate(ref, 'Item ' + (next + 1) + '.');
            }
            onUpdate();
        } else if (lifted && e.key === 'Escape') {
            e.preventDefault();
            state.arrange = null;
            narrate(ref, 'Cancelled.');
            onUpdate();
        } else if (
            !lifted &&
            (e.key === 'Delete' || e.key === 'Backspace')
        ) {
            const holder = itemHolding(matchState, targetId);
            if (holder !== null) {
                e.preventDefault();
                removePair(matchState, holder);
                narrate(ref, (ref.targets.get(targetId)?.letter ?? '') + ' returned.');
                onUpdate();
            }
        }
    });
}

function liftCard(
    state: RuntimeState,
    ref: MatchRef,
    blockId: string,
    targetId: string,
): void {
    // Seed the cursor at the first empty dock (fall back to the first item).
    const matchState = state.matches[blockId];
    const firstEmpty = ref.itemIds.find(
        (itemId) => matchState?.pairs[itemId] === undefined,
    );
    state.arrange = {
        kind: 'match',
        blockId,
        id: targetId,
        cursorItemId: firstEmpty ?? ref.itemIds[0] ?? null,
    };
}

function dockAt(
    docks: Array<{ itemId: string; rect: DOMRect }>,
    x: number,
    y: number,
): string | null {
    for (const dock of docks) {
        const r = dock.rect;
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
            return dock.itemId;
        }
    }
    return null;
}
