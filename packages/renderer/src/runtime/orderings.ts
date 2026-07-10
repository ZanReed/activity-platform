// =============================================================================
// runtime/orderings.ts — Ordering-block arrangement + scoring
// -----------------------------------------------------------------------------
// File pattern matches mcs.ts/matches.ts: pure decision functions
// (moveItem, isOrderCorrect, scoreOrderingBlocks) + event-handler wrappers
// (wireOrdering).
//
// Interaction (design doc, decision 5): POINTER DRAG to reorder, keyboard
// grammar underneath — Enter/Space lifts the focused row, ArrowUp/Down moves
// it one position per press (live, render re-sequences), Enter/Space drops,
// Escape drops in place. During a pointer drag the row rides a transform
// written directly (popover-drag precedent); crossing a neighbor's midpoint
// COMMITS that swap through state + onUpdate, so the list visibly reflows
// while dragging and the drop is already consistent.
//
// Scoring is ALL-OR-NOTHING exact sequence equality. An untouched list is an
// OMISSION (state.moved is false): a shuffled list is always *some*
// sequence, so only a student action turns the arrangement into an answer.
// =============================================================================

import type { OrderingRef, Refs } from './refs.js';
import type { OrderBlockState, RuntimeState } from './state.js';

export function isOrderCorrect(order: string[], answer: string[]): boolean {
    if (order.length !== answer.length) return false;
    for (let i = 0; i < answer.length; i++) {
        if (order[i] !== answer[i]) return false;
    }
    return true;
}

/**
 * Score the given ordering blocks into state. Untouched blocks (never
 * rearranged) score null — unscored omission. Mutates state; no DOM access.
 */
export function scoreOrderingBlocks(
    state: RuntimeState,
    refs: Refs,
    blockIds: Iterable<string>,
): void {
    for (const blockId of blockIds) {
        const ref = refs.orderings.get(blockId);
        const orderState = state.orderings[blockId];
        if (!ref || !orderState) continue;
        orderState.result = orderState.moved
            ? isOrderCorrect(orderState.order, ref.answer)
            : null;
    }
}

/**
 * Move an item to a new index in the arrangement (state only — render
 * re-sequences the DOM). Clamps to the list bounds; marks the block moved.
 */
export function moveItem(
    orderState: OrderBlockState,
    itemId: string,
    toIndex: number,
): void {
    const from = orderState.order.indexOf(itemId);
    if (from === -1) return;
    const to = Math.max(0, Math.min(toIndex, orderState.order.length - 1));
    if (to === from) return;
    orderState.order.splice(from, 1);
    orderState.order.splice(to, 0, itemId);
    orderState.moved = true;
}

function narrate(ref: OrderingRef, message: string): void {
    if (ref.statusEl && ref.statusEl.textContent !== message) {
        ref.statusEl.textContent = message;
    }
}

function isLocked(state: RuntimeState, ref: OrderingRef): boolean {
    return state.sections[ref.sectionId]?.locked === true;
}

/**
 * Wire pointer-drag + keyboard handlers onto every row. Listeners attach
 * once at init; render() only re-sequences nodes (listeners travel with
 * their elements).
 */
export function wireOrdering(
    state: RuntimeState,
    refs: Refs,
    onUpdate: () => void,
): void {
    for (const [blockId, ref] of refs.orderings) {
        for (const [itemId, el] of ref.items) {
            wireRow(state, refs, blockId, ref, itemId, el, onUpdate);
        }
    }
}

function wireRow(
    state: RuntimeState,
    refs: Refs,
    blockId: string,
    ref: OrderingRef,
    itemId: string,
    el: HTMLElement,
    onUpdate: () => void,
): void {
    // ---- Pointer drag -------------------------------------------------------
    // The dragged row follows the pointer via a direct transform; whenever the
    // pointer crosses a neighbor's midpoint the swap is committed through
    // moveItem + onUpdate (render re-sequences the OTHER rows around the held
    // one). grabY tracks the pointer offset so re-sequencing under the pointer
    // doesn't teleport the row.
    let drag: { pointerId: number; startY: number; lastY: number } | null = null;

    el.addEventListener('pointerdown', (e) => {
        if (isLocked(state, ref) || state.submitted) return;
        drag = { pointerId: e.pointerId, startY: e.clientY, lastY: e.clientY };
        el.setPointerCapture(e.pointerId);
        el.classList.add('dragging');
        e.preventDefault();
    });

    el.addEventListener('pointermove', (e) => {
        if (drag === null || e.pointerId !== drag.pointerId) return;
        drag.lastY = e.clientY;
        el.style.transform =
            'translateY(' + (e.clientY - drag.startY) + 'px)';

        // Swap with a neighbor once the pointer passes its midpoint. The
        // neighbor rects are read fresh each move — the list just reflowed
        // under us, so cached rects would be stale. (Geometry reads during a
        // gesture are fine; the no-DOM-reads rule is about querySelector
        // walks and state-of-truth reads.)
        const orderState = state.orderings[blockId];
        if (!orderState) return;
        const at = orderState.order.indexOf(itemId);
        const prevId = at > 0 ? orderState.order[at - 1] : undefined;
        const nextId =
            at < orderState.order.length - 1
                ? orderState.order[at + 1]
                : undefined;
        const prevEl = prevId !== undefined ? ref.items.get(prevId) : undefined;
        const nextEl = nextId !== undefined ? ref.items.get(nextId) : undefined;

        if (prevEl) {
            const r = prevEl.getBoundingClientRect();
            if (e.clientY < r.top + r.height / 2) {
                moveItem(orderState, itemId, at - 1);
                // Re-anchor the transform: the row's layout slot moved up, so
                // the same pointer position needs a smaller offset.
                drag.startY -= r.height;
                el.style.transform =
                    'translateY(' + (e.clientY - drag.startY) + 'px)';
                onUpdate();
                return;
            }
        }
        if (nextEl) {
            const r = nextEl.getBoundingClientRect();
            if (e.clientY > r.top + r.height / 2) {
                moveItem(orderState, itemId, at + 1);
                drag.startY += r.height;
                el.style.transform =
                    'translateY(' + (e.clientY - drag.startY) + 'px)';
                onUpdate();
            }
        }
    });

    const endDrag = (e: PointerEvent): void => {
        if (drag === null || e.pointerId !== drag.pointerId) return;
        drag = null;
        el.classList.remove('dragging');
        el.style.transform = '';
        if (el.hasPointerCapture(e.pointerId)) {
            el.releasePointerCapture(e.pointerId);
        }
        const orderState = state.orderings[blockId];
        if (orderState) {
            narrate(
                ref,
                'Position ' + (orderState.order.indexOf(itemId) + 1) + '.',
            );
        }
        onUpdate();
    };
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    // ---- Keyboard lift-move-drop --------------------------------------------
    el.addEventListener('keydown', (e) => {
        if (isLocked(state, ref) || state.submitted) return;
        const orderState = state.orderings[blockId];
        if (!orderState) return;
        const lifted =
            state.arrange !== null &&
            state.arrange.kind === 'order' &&
            state.arrange.blockId === blockId &&
            state.arrange.id === itemId;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!lifted) {
                state.arrange = {
                    kind: 'order',
                    blockId,
                    id: itemId,
                    cursorItemId: null,
                };
                narrate(
                    ref,
                    'Grabbed. Position ' +
                        (orderState.order.indexOf(itemId) + 1) +
                        ' of ' +
                        orderState.order.length +
                        '. Use arrow keys to move, Enter to drop.',
                );
            } else {
                state.arrange = null;
                narrate(
                    ref,
                    'Dropped at position ' +
                        (orderState.order.indexOf(itemId) + 1) +
                        '.',
                );
            }
            onUpdate();
        } else if (lifted && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault();
            const at = orderState.order.indexOf(itemId);
            moveItem(orderState, itemId, e.key === 'ArrowUp' ? at - 1 : at + 1);
            narrate(
                ref,
                'Position ' +
                    (orderState.order.indexOf(itemId) + 1) +
                    ' of ' +
                    orderState.order.length +
                    '.',
            );
            onUpdate();
            // Re-sequencing detaches + reattaches the node, which can drop
            // focus — restore it so the grammar continues uninterrupted.
            el.focus();
        } else if (lifted && e.key === 'Escape') {
            e.preventDefault();
            state.arrange = null;
            narrate(ref, 'Dropped.');
            onUpdate();
        }
    });
}
