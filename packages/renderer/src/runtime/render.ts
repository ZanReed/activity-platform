// =============================================================================
// runtime/render.ts — State → DOM rendering
// -----------------------------------------------------------------------------
// The ONLY function in the runtime that mutates the DOM after init. Every
// event handler writes to state, then calls render(state, refs). Concentrating
// the DOM-mutation exception in one file makes the "no DOM writes outside
// render" rule grep-able and enforceable.
//
// Change-guard pattern: every write checks the current DOM state and only
// touches the DOM when it differs from the target. For class toggles,
// classList.toggle(name, condition) is inherently idempotent. For attribute,
// hidden, and checked updates, explicit current-vs-target checks guard
// each write.
//
// Stage 13 Session 4 adds confidence radio reflection to renderBlock, so a
// restored-on-load confidence selection re-checks the right radio when the
// page first renders (bootstrap calls render() after applyStoredState).
// =============================================================================

import type {
    Refs,
    BlankRef,
    FillInBlankRef,
    McRef,
    MatchRef,
    OrderingRef,
    SectionRef,
    PopoverRef,
} from './refs.js';
import type {
    RuntimeState,
    BlankState,
    BlockState,
    McBlockState,
    MatchBlockState,
    OrderBlockState,
    SectionState,
} from './state.js';
import { graphExt } from './graph-integration.js';

/**
 * Render the entire activity from state. Idempotent — calling twice with
 * the same state produces no observable DOM change on the second call.
 */
export function render(state: RuntimeState, refs: Refs): void {
    for (const [id, ref] of refs.blanks) {
        const blankState = state.blanks[id];
        if (blankState) renderBlank(id, blankState, ref, state);
    }
    for (const [id, ref] of refs.fillInBlanks) {
        const blockState = state.blocks[id];
        if (blockState) renderBlock(blockState, ref);
    }
    for (const [id, ref] of refs.mcs) {
        const mcState = state.mcs[id];
        if (mcState) renderMcBlock(mcState, ref, state);
    }
    for (const [id, ref] of refs.matches) {
        const matchState = state.matches[id];
        if (matchState) renderMatchBlock(id, matchState, ref, state);
    }
    for (const [id, ref] of refs.orderings) {
        const orderState = state.orderings[id];
        if (orderState) renderOrderBlock(id, orderState, ref, state);
    }
    graphExt.renderGraphs(state, refs);
    for (const [id, ref] of refs.sections) {
        const sectionState = state.sections[id];
        if (sectionState) renderSection(sectionState, ref);
    }
    if (refs.popover) renderPopover(state, refs.popover, refs);
}

function renderBlank(
    id: string,
    blankState: BlankState,
    ref: BlankRef,
    state: RuntimeState,
): void {
    const { result, matchedMistake } = blankState;

    // 1. Correct / incorrect class — visual signal.
    ref.input.classList.toggle('correct', result === true);
    ref.input.classList.toggle('incorrect', result === false);

    // 2. aria-invalid — screen reader signal complementing the visual class.
    const targetAriaInvalid: 'true' | 'false' | null =
    result === null ? null : result ? 'false' : 'true';
    const currentAriaInvalid = ref.input.getAttribute('aria-invalid');
    if (targetAriaInvalid !== currentAriaInvalid) {
        if (targetAriaInvalid === null) {
            ref.input.removeAttribute('aria-invalid');
        } else {
            ref.input.setAttribute('aria-invalid', targetAriaInvalid);
        }
    }

    // 3. Mistake affordance — reveal the red '!' button only when a wrong
    // answer matched an authored mistake entry. The feedback text itself lives
    // in the popover (renderPopover reads state.blanks[id].matchedMistake), so
    // here we just toggle the button's visibility and its aria-expanded.
    if (ref.mistakeButton) {
        const wantHidden = matchedMistake === null;
        if (ref.mistakeButton.hidden !== wantHidden) {
            ref.mistakeButton.hidden = wantHidden;
        }
        const wantExpanded =
            state.popover?.kind === 'mistake' && state.popover.blankId === id
                ? 'true'
                : 'false';
        if (ref.mistakeButton.getAttribute('aria-expanded') !== wantExpanded) {
            ref.mistakeButton.setAttribute('aria-expanded', wantExpanded);
        }
    }

    // 4. Hint affordance — button aria-expanded reflects whether THIS blank's
    // hint is the one currently open in the popover. The popover content
    // itself is handled by renderPopover.
    if (ref.hintButton) {
        const wantExpanded =
            state.popover?.kind === 'hint' && state.popover.blankId === id
                ? 'true'
                : 'false';
        if (ref.hintButton.getAttribute('aria-expanded') !== wantExpanded) {
            ref.hintButton.setAttribute('aria-expanded', wantExpanded);
        }
    }

    // 5. Locked-mode input freeze — section locked == this blank's
    // input.disabled. Absent SectionState (refs/state disagreement)
    // treated as not-locked.
    const sectionState = state.sections[ref.sectionId];
    const wantDisabled = sectionState?.locked === true;
    if (ref.input.disabled !== wantDisabled) {
        ref.input.disabled = wantDisabled;
    }
}

type ConfidenceValue = 'unsure' | 'think_so' | 'certain' | null;

/**
 * Shared block-chrome reflection used by every question type (fill-in-blank,
 * MC, matching, ordering): the solution slot (hidden until revealed) and the
 * confidence radios (checked mirrors state).
 *
 * Confidence reflection drives restoration-on-load — a stored selection
 * re-checks the right radio when bootstrap renders for the first time — and
 * keeps state ↔ DOM consistent if anything other than the user's click sets
 * state. No hasConfidenceRating guard is needed: an empty confidenceRadios
 * (no fieldset) iterates zero times.
 *
 * `locked` is optional because only the drag-based blocks (matching, ordering)
 * freeze their confidence radios; blank/MC omit it and leave radio.disabled
 * untouched, preserving each type's existing behavior.
 */
function renderSolutionAndConfidence(
    ref: {
        solutionEl: HTMLElement | null;
        confidenceRadios: HTMLInputElement[];
    },
    block: { solutionRevealed: boolean; confidence: ConfidenceValue },
    locked?: boolean,
): void {
    // Solution slot — hidden until solutionRevealed flips true.
    if (ref.solutionEl) {
        const wantHidden = !block.solutionRevealed;
        if (ref.solutionEl.hidden !== wantHidden) {
            ref.solutionEl.hidden = wantHidden;
        }
    }

    for (const radio of ref.confidenceRadios) {
        const wantChecked = radio.value === block.confidence;
        if (radio.checked !== wantChecked) {
            radio.checked = wantChecked;
        }
        if (locked !== undefined && radio.disabled !== locked) {
            radio.disabled = locked;
        }
    }
}

function renderBlock(blockState: BlockState, ref: FillInBlankRef): void {
    renderSolutionAndConfidence(ref, blockState);
}

/**
 * Multiple-choice block rendering. State is the single source of truth for
 * selection: each input's checked flag is synced FROM state.mcs[id].selected
 * (which also makes restore-on-load free — applyStoredState only writes
 * state, and the bootstrap render re-checks the inputs).
 *
 * Verdict visuals appear only once the owning section has been checked:
 * selected choices get .correct/.incorrect on their label (correct set
 * membership per choice), their authored feedback divs unhide, and selected
 * inputs carry aria-invalid mirroring the blank pattern. Unselected correct
 * choices are deliberately NOT highlighted — a wrong answer shouldn't leak
 * the right one (the authored solution slot is the sanctioned reveal).
 */
function renderMcBlock(
    mcState: McBlockState,
    ref: McRef,
    state: RuntimeState,
): void {
    const sectionState = state.sections[ref.sectionId];
    const sectionChecked = sectionState?.checked === true;
    const wantDisabled = sectionState?.locked === true;

    for (let i = 0; i < ref.inputs.length; i++) {
        const input = ref.inputs[i];
        const label = ref.labels[i];
        const choiceId = ref.choiceIds[i];
        if (!input || !label || choiceId === undefined) continue;

        const isSelected = mcState.selected.indexOf(choiceId) !== -1;
        if (input.checked !== isSelected) input.checked = isSelected;
        if (input.disabled !== wantDisabled) input.disabled = wantDisabled;

        const isCorrectChoice = ref.correctIds.indexOf(choiceId) !== -1;
        const showVerdict = sectionChecked && isSelected;
        label.classList.toggle('correct', showVerdict && isCorrectChoice);
        label.classList.toggle('incorrect', showVerdict && !isCorrectChoice);

        const targetAriaInvalid: 'true' | 'false' | null = showVerdict
            ? isCorrectChoice
                ? 'false'
                : 'true'
            : null;
        if (input.getAttribute('aria-invalid') !== targetAriaInvalid) {
            if (targetAriaInvalid === null) {
                input.removeAttribute('aria-invalid');
            } else {
                input.setAttribute('aria-invalid', targetAriaInvalid);
            }
        }

        // Authored per-choice feedback: revealed post-check for selected
        // choices only (the distractor's explanation is for whoever picked it).
        const feedbackEl = ref.feedbackEls[choiceId];
        if (feedbackEl) {
            const wantHidden = !(sectionChecked && isSelected);
            if (feedbackEl.hidden !== wantHidden) {
                feedbackEl.hidden = wantHidden;
            }
        }
    }

    renderSolutionAndConfidence(ref, mcState);
}

/**
 * Matching block rendering. State (pairs) is the single source of truth for
 * where every target card lives:
 *
 *   - Without reuse, the REAL card node is MOVED between its bank home and
 *     the paired item's dock (appendChild relocation — the card's listeners
 *     travel with it), and the emptied bank slot shows its ghost letter via
 *     .is-empty.
 *   - With reuse, cards never leave the bank; each paired dock instead holds
 *     a cloned .match-docked-chip (guarded by data-docked-target so render
 *     ticks don't re-clone), removed by the delegated click handler.
 *
 * Verdicts appear per PAIR once the owning section has been checked and the
 * block was answered at all: paired items get .correct/.incorrect from a
 * live key comparison (the MC pattern — stale stored verdicts can't drift
 * from what's on screen), and unpaired items read .incorrect because they
 * cost a point. A wholly unanswered block is an omission and shows nothing.
 */
function renderMatchBlock(
    blockId: string,
    matchState: MatchBlockState,
    ref: MatchRef,
    state: RuntimeState,
): void {
    const sectionState = state.sections[ref.sectionId];
    const sectionChecked = sectionState?.checked === true;
    const locked = sectionState?.locked === true || state.submitted;
    const answered = Object.keys(matchState.pairs).length > 0;

    // Which target sits on which item (reverse map, first wins for reuse).
    const targetByItem = matchState.pairs;

    for (const targetId of ref.targetIds) {
        const target = ref.targets.get(targetId);
        if (!target) continue;

        const lifted =
            state.arrange?.kind === 'match' &&
            state.arrange.blockId === blockId &&
            state.arrange.id === targetId;
        target.card.classList.toggle('lifted', lifted === true);
        const wantPressed = lifted ? 'true' : 'false';
        if (target.card.getAttribute('aria-pressed') !== wantPressed) {
            target.card.setAttribute('aria-pressed', wantPressed);
        }
        const wantTabindex = locked ? '-1' : '0';
        if (target.card.getAttribute('tabindex') !== wantTabindex) {
            target.card.setAttribute('tabindex', wantTabindex);
        }

        if (ref.allowReuse) {
            // Bank cards never move under reuse; docks hold chips (below).
            continue;
        }
        const dockedItem = Object.keys(targetByItem).find(
            (itemId) => targetByItem[itemId] === targetId,
        );
        const desiredParent = dockedItem
            ? ref.items.get(dockedItem)?.slot ?? target.home
            : target.home;
        if (target.card.parentElement !== desiredParent) {
            desiredParent.appendChild(target.card);
        }
        target.home.classList.toggle('is-empty', dockedItem !== undefined);
    }

    for (const itemId of ref.itemIds) {
        const item = ref.items.get(itemId);
        if (!item) continue;
        const pairedTarget = matchState.pairs[itemId];

        // Reuse mode: reconcile the dock's chip against state, guarded so a
        // render tick with an unchanged pairing doesn't re-clone.
        if (ref.allowReuse) {
            const want = pairedTarget ?? '';
            if (item.slot.dataset.dockedTarget !== want) {
                if (pairedTarget) {
                    const source = ref.targets.get(pairedTarget);
                    if (source) {
                        const chip = source.card.cloneNode(true) as HTMLElement;
                        chip.classList.add('match-docked-chip');
                        chip.classList.remove('lifted', 'dragging');
                        chip.removeAttribute('tabindex');
                        chip.dataset.itemId = itemId;
                        item.slot.replaceChildren(chip);
                    }
                } else {
                    item.slot.replaceChildren();
                }
                item.slot.dataset.dockedTarget = want;
            }
        }

        // Keyboard cursor highlight while a card is lifted.
        const isCursor =
            state.arrange?.kind === 'match' &&
            state.arrange.blockId === blockId &&
            state.arrange.cursorItemId === itemId;
        item.slot.classList.toggle('drag-over', isCursor === true);

        // Per-pair verdicts (live key comparison — see the function comment).
        const showVerdict = sectionChecked && answered;
        const pairCorrect =
            pairedTarget !== undefined && pairedTarget === ref.key[itemId];
        item.el.classList.toggle('correct', showVerdict && pairCorrect);
        item.el.classList.toggle('incorrect', showVerdict && !pairCorrect);
    }

    renderSolutionAndConfidence(ref, matchState, locked);
}

/**
 * Ordering block rendering. State (order) is the single source of truth for
 * the row sequence: render re-sequences the list's children to match with
 * minimal insertBefore moves (idempotent — an already-ordered list is
 * untouched). Verdicts appear per POSITION once the owning section has been
 * checked and the student has moved anything (the block score itself stays
 * all-or-nothing; per-row verdicts are feedback, like per-blank verdicts).
 */
function renderOrderBlock(
    blockId: string,
    orderState: OrderBlockState,
    ref: OrderingRef,
    state: RuntimeState,
): void {
    const sectionState = state.sections[ref.sectionId];
    const sectionChecked = sectionState?.checked === true;
    const locked = sectionState?.locked === true || state.submitted;

    // Re-sequence with minimal moves: walk the desired order and pull each
    // element into place only when it isn't already there.
    let prev: HTMLElement | null = null;
    for (const itemId of orderState.order) {
        const el = ref.items.get(itemId);
        if (!el) continue;
        const expectedPrev = prev;
        if (el.previousElementSibling !== expectedPrev) {
            ref.list.insertBefore(
                el,
                expectedPrev ? expectedPrev.nextSibling : ref.list.firstChild,
            );
        }
        prev = el;
    }

    const showVerdict = sectionChecked && orderState.moved;
    for (let i = 0; i < orderState.order.length; i++) {
        const itemId = orderState.order[i];
        if (itemId === undefined) continue;
        const el = ref.items.get(itemId);
        if (!el) continue;

        const lifted =
            state.arrange?.kind === 'order' &&
            state.arrange.blockId === blockId &&
            state.arrange.id === itemId;
        el.classList.toggle('lifted', lifted === true);
        const wantPressed = lifted ? 'true' : 'false';
        if (el.getAttribute('aria-pressed') !== wantPressed) {
            el.setAttribute('aria-pressed', wantPressed);
        }
        const wantTabindex = locked ? '-1' : '0';
        if (el.getAttribute('tabindex') !== wantTabindex) {
            el.setAttribute('tabindex', wantTabindex);
        }

        const positionCorrect = ref.answer[i] === itemId;
        el.classList.toggle('correct', showVerdict && positionCorrect);
        el.classList.toggle('incorrect', showVerdict && !positionCorrect);
    }

    renderSolutionAndConfidence(ref, orderState, locked);
}

function renderSection(
    sectionState: SectionState,
    ref: SectionRef,
): void {
    if (ref.scoreEl) {
        if (sectionState.checked) {
            const text =
            sectionState.score + ' / ' + sectionState.total + ' correct';
            if (ref.scoreEl.textContent !== text) {
                ref.scoreEl.textContent = text;
            }
            if (ref.scoreEl.hidden) ref.scoreEl.hidden = false;
        } else {
            if (!ref.scoreEl.hidden) ref.scoreEl.hidden = true;
        }
    }

    if (ref.checkButton) {
        if (ref.checkButton.disabled !== sectionState.locked) {
            ref.checkButton.disabled = sectionState.locked;
        }
    }
}

/**
 * Show or hide the shared popover from state.popover. When open, the title and
 * body depend on the popover kind: a 'hint' clones the active blank's hint
 * content template (BlankRef.hintContent); a 'mistake' clones the matched
 * entry's content template (BlankRef.mistakeFeedback[matchedMistake].content).
 * Both templates were pre-rendered server-side (rich text + KaTeX), so the
 * runtime never re-renders — it just clones the inert template into the body.
 * The data-kind attribute drives the red-tinted header for mistakes. Position
 * (left/top) is read straight from state and applied.
 *
 * When the referenced content is gone (no hint, or the matched mistake cleared
 * because the student edited the blank) the popover stays closed even if
 * state.popover is still set — the close handlers reconcile state.popover to
 * null on the next interaction.
 *
 * Cloning is guarded by a content key (kind + blank + entry index) stashed on
 * the body's dataset, so repeated render() ticks for the same content don't
 * re-clone. Pure state→DOM like the rest of render: no focus management here.
 */
function renderPopover(
    state: RuntimeState,
    popover: PopoverRef,
    refs: Refs,
): void {
    const p = state.popover;

    let template: HTMLTemplateElement | null = null;
    let contentKey: string | null = null;
    if (p) {
        const blank = refs.blanks.get(p.blankId);
        if (p.kind === 'hint') {
            template = blank?.hintContent ?? null;
            contentKey = 'hint:' + p.blankId;
        } else {
            const index = state.blanks[p.blankId]?.matchedMistake ?? null;
            if (index !== null) {
                template = blank?.mistakeFeedback[index]?.content ?? null;
                contentKey = 'mistake:' + p.blankId + ':' + index;
            }
        }
    }
    const wantOpen = p !== null && template !== null;

    if (wantOpen) {
        const title = p!.kind === 'hint' ? 'Hint' : 'Feedback';
        if (popover.titleEl.textContent !== title) {
            popover.titleEl.textContent = title;
        }
        if (popover.bodyEl.dataset.contentKey !== contentKey!) {
            popover.bodyEl.replaceChildren(
                template!.content.cloneNode(true),
            );
            popover.bodyEl.dataset.contentKey = contentKey!;
        }
        if (popover.el.dataset.kind !== p!.kind) {
            popover.el.dataset.kind = p!.kind;
        }
        const left = p!.x + 'px';
        const top = p!.y + 'px';
        if (popover.el.style.left !== left) popover.el.style.left = left;
        if (popover.el.style.top !== top) popover.el.style.top = top;
        if (popover.el.hidden) popover.el.hidden = false;
    } else {
        if (!popover.el.hidden) popover.el.hidden = true;
    }
}
