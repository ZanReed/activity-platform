/**
 * @vitest-environment jsdom
 */
// =============================================================================
// matches-orderings.test.ts — Matching + ordering runtime
// -----------------------------------------------------------------------------
// JSDOM-backed, on hand-written fixtures mirroring the renderer's markup
// (the data-attribute contract); matching-ordering.test.ts (renderer suite)
// pins the markup itself. Covers: init walking, per-pair matching scoring,
// all-or-nothing ordering scoring, omission semantics (untouched list = no
// answer), checkSection aggregation (matching contributes ITEM COUNT to the
// section total), gatherResponses' matches/orderings maps + v6 payload, and
// render's card docking / list re-sequencing / verdicts / locked freeze.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { buildRefs } from '../init.js';
import { createInitialState, type RuntimeState } from '../state.js';
import type { Refs } from '../refs.js';
import {
    scoreMatchPairs,
    scoreMatchBlocks,
    setPair,
    removePair,
} from '../matches.js';
import {
    isOrderCorrect,
    moveItem,
    scoreOrderingBlocks,
} from '../orderings.js';
import { checkSection } from '../checkpoints.js';
import { gatherResponses, buildSubmissionPayload } from '../submission.js';
import { render } from '../render.js';
import type { RuntimeConfig } from '../config.js';

const SEC = 'sec-1';
const MB = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const OB = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const I1 = 'dddddddd-dddd-4ddd-8ddd-000000000001';
const I2 = 'dddddddd-dddd-4ddd-8ddd-000000000002';
const T1 = 'dddddddd-dddd-4ddd-8ddd-000000000011';
const T2 = 'dddddddd-dddd-4ddd-8ddd-000000000012';
const T3 = 'dddddddd-dddd-4ddd-8ddd-000000000013';
const O1 = 'eeeeeeee-eeee-4eee-8eee-000000000001';
const O2 = 'eeeeeeee-eeee-4eee-8eee-000000000002';
const O3 = 'eeeeeeee-eeee-4eee-8eee-000000000003';

const CONFIG: RuntimeConfig = {
    activityId: '11111111-1111-1111-1111-111111111111',
    versionNum: 1,
    submissionEndpoint: 'https://example.com/submit',
    submissionMode: 'free',
    revisionMode: 'free',
    gradingMode: 'auto',
    answerFeedback: 'on_check',
};

const KEY = { [I1]: T1, [I2]: T2 };

function matchingHtml(opts: { reuse?: boolean; solution?: boolean } = {}): string {
    const items = [I1, I2]
        .map(
            (id) =>
                `<div class="match-item" role="listitem" data-item-id="${id}">` +
                '<span class="match-letter-line" aria-hidden="true"></span>' +
                '<span class="match-item-content">item</span>' +
                `<span class="match-slot" data-item-id="${id}"></span>` +
                '</div>',
        )
        .join('');
    // Rendered (shuffled) target order: T2, T1, T3 — letters A, B, C.
    const targets = [T2, T1, T3]
        .map(
            (id, i) =>
                `<div class="match-target-slot" role="listitem" data-target-id="${id}">` +
                `<span class="match-slot-ghost" aria-hidden="true">${'ABC'[i]}.</span>` +
                `<div class="match-target" data-target-id="${id}" tabindex="0">` +
                `<span class="match-target-letter" aria-hidden="true">${'ABC'[i]}.</span>` +
                '<span class="match-target-content">t</span>' +
                '</div></div>',
        )
        .join('');
    return (
        `<div class="block block-matching" data-block-type="matching"` +
        ` data-block-id="${MB}"` +
        ` data-match-key='${JSON.stringify(KEY)}'` +
        (opts.reuse ? ' data-match-reuse="true"' : '') +
        '>' +
        '<div class="block-problem-body">' +
        '<div class="match-columns">' +
        `<div class="match-items" role="list">${items}</div>` +
        `<div class="match-targets" role="list">${targets}</div>` +
        '</div>' +
        '<span class="sr-status js-match-status" aria-live="polite"></span>' +
        (opts.solution
            ? `<div class="js-solution" data-for-block="${MB}" hidden>Because.</div>`
            : '') +
        '</div></div>'
    );
}

function orderingHtml(opts: { solution?: boolean } = {}): string {
    // Rendered (shuffled) order: O2, O3, O1. Authored answer: O1, O2, O3.
    const items = [O2, O3, O1]
        .map(
            (id) =>
                `<div class="order-item" role="listitem" data-item-id="${id}" tabindex="0">` +
                '<span class="order-number-box" aria-hidden="true"></span>' +
                '<span class="order-item-grip" aria-hidden="true">⠿</span>' +
                '<span class="order-item-content">step</span>' +
                '</div>',
        )
        .join('');
    return (
        `<div class="block block-ordering" data-block-type="ordering"` +
        ` data-block-id="${OB}"` +
        ` data-order-answer='${JSON.stringify([O1, O2, O3])}'` +
        '>' +
        '<div class="block-problem-body">' +
        `<div class="order-list" role="list">${items}</div>` +
        '<span class="sr-status js-order-status" aria-live="polite"></span>' +
        (opts.solution
            ? `<div class="js-solution" data-for-block="${OB}" hidden>Because.</div>`
            : '') +
        '</div></div>'
    );
}

function sectionHtml(inner: string): string {
    return (
        `<section class="activity-section" data-section-id="${SEC}">` +
        inner +
        '<button class="js-checkpoint-btn">Check</button>' +
        '<span class="js-section-score" hidden></span>' +
        '</section>'
    );
}

function setup(html: string): { refs: Refs; state: RuntimeState } {
    document.body.innerHTML = sectionHtml(html);
    const refs = buildRefs(document);
    const state = createInitialState(refs);
    return { refs, state };
}

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('init walking — matching', () => {
    it('builds a MatchRef with parsed key, item/target ids, and shuffled-order letters', () => {
        const { refs } = setup(matchingHtml({ solution: true }));
        const ref = refs.matches.get(MB)!;
        expect(ref).toBeDefined();
        expect(ref.key).toEqual(KEY);
        expect(ref.itemIds).toEqual([I1, I2]);
        expect(ref.targetIds).toEqual([T2, T1, T3]);
        expect(ref.targets.get(T2)!.letter).toBe('A');
        expect(ref.targets.get(T1)!.letter).toBe('B');
        expect(ref.allowReuse).toBe(false);
        expect(ref.solutionEl).not.toBeNull();
        expect(ref.statusEl).not.toBeNull();
        expect(refs.sections.get(SEC)!.matchBlockIds).toEqual([MB]);
    });

    it('skips a block with a malformed key (rest of page unaffected)', () => {
        document.body.innerHTML = sectionHtml(
            matchingHtml().replace(
                `data-match-key='${JSON.stringify(KEY)}'`,
                "data-match-key='not json'",
            ),
        );
        const refs = buildRefs(document);
        expect(refs.matches.size).toBe(0);
        expect(refs.sections.get(SEC)!.matchBlockIds).toEqual([]);
    });
});

describe('init walking — ordering', () => {
    it('builds an OrderingRef with the answer key and the rendered order', () => {
        const { refs, state } = setup(orderingHtml());
        const ref = refs.orderings.get(OB)!;
        expect(ref.answer).toEqual([O1, O2, O3]);
        expect(ref.initialOrder).toEqual([O2, O3, O1]);
        expect(refs.sections.get(SEC)!.orderingBlockIds).toEqual([OB]);
        // Initial state seeds the arrangement from the rendered order.
        expect(state.orderings[OB]!.order).toEqual([O2, O3, O1]);
        expect(state.orderings[OB]!.moved).toBe(false);
    });
});

describe('matching scoring', () => {
    it('scoreMatchPairs counts correct pairs against the item denominator', () => {
        expect(scoreMatchPairs({ [I1]: T1, [I2]: T2 }, KEY, [I1, I2])).toEqual({
            earned: 2,
            total: 2,
        });
        expect(scoreMatchPairs({ [I1]: T2 }, KEY, [I1, I2])).toEqual({
            earned: 0,
            total: 2,
        });
        expect(scoreMatchPairs({ [I1]: T1 }, KEY, [I1, I2])).toEqual({
            earned: 1,
            total: 2,
        });
    });

    it('scoreMatchBlocks: answered → per-pair earned/total; unanswered → null omission', () => {
        const { refs, state } = setup(matchingHtml());
        scoreMatchBlocks(state, refs, [MB]);
        expect(state.matches[MB]!.result).toBeNull();

        state.matches[MB]!.pairs = { [I1]: T1 };
        scoreMatchBlocks(state, refs, [MB]);
        expect(state.matches[MB]!.result).toBe(false);
        expect(state.matches[MB]!.earned).toBe(1);
        expect(state.matches[MB]!.total).toBe(2);

        state.matches[MB]!.pairs = { [I1]: T1, [I2]: T2 };
        scoreMatchBlocks(state, refs, [MB]);
        expect(state.matches[MB]!.result).toBe(true);
    });

    it('setPair without reuse steals the target from its previous item and overwrites the dock', () => {
        const { state } = setup(matchingHtml());
        const ms = state.matches[MB]!;
        setPair(ms, I1, T1, false);
        setPair(ms, I2, T1, false); // T1 moves I1 → I2
        expect(ms.pairs).toEqual({ [I2]: T1 });
        setPair(ms, I2, T2, false); // T2 displaces T1 from I2's dock
        expect(ms.pairs).toEqual({ [I2]: T2 });
        removePair(ms, I2);
        expect(ms.pairs).toEqual({});
    });

    it('setPair with reuse lets two items share a target', () => {
        const { state } = setup(matchingHtml({ reuse: true }));
        const ms = state.matches[MB]!;
        setPair(ms, I1, T1, true);
        setPair(ms, I2, T1, true);
        expect(ms.pairs).toEqual({ [I1]: T1, [I2]: T1 });
    });
});

describe('ordering scoring', () => {
    it('isOrderCorrect is exact-sequence equality', () => {
        expect(isOrderCorrect([O1, O2, O3], [O1, O2, O3])).toBe(true);
        expect(isOrderCorrect([O2, O1, O3], [O1, O2, O3])).toBe(false);
        expect(isOrderCorrect([O1, O2], [O1, O2, O3])).toBe(false);
    });

    it('moveItem clamps to bounds and flags moved', () => {
        const { state } = setup(orderingHtml());
        const os = state.orderings[OB]!;
        moveItem(os, O2, -5);
        expect(os.order).toEqual([O2, O3, O1]); // already first — no change
        expect(os.moved).toBe(false); // a no-op move isn't an answer
        moveItem(os, O1, 0);
        expect(os.order).toEqual([O1, O2, O3]);
        expect(os.moved).toBe(true);
    });

    it('an untouched list scores null (omission) even though it is a valid sequence', () => {
        const { refs, state } = setup(orderingHtml());
        scoreOrderingBlocks(state, refs, [OB]);
        expect(state.orderings[OB]!.result).toBeNull();

        moveItem(state.orderings[OB]!, O1, 0);
        scoreOrderingBlocks(state, refs, [OB]);
        expect(state.orderings[OB]!.result).toBe(true);
    });
});

describe('checkSection aggregation', () => {
    it('matching contributes its ITEM COUNT to the total and earned pairs to the score', () => {
        const { refs, state } = setup(matchingHtml({ solution: true }));
        checkSection(CONFIG, state, refs, SEC);
        expect(state.sections[SEC]!.total).toBe(2); // two items, unanswered omission
        expect(state.sections[SEC]!.score).toBe(0);
        expect(state.matches[MB]!.solutionRevealed).toBe(true);

        state.matches[MB]!.pairs = { [I1]: T1, [I2]: T1 };
        checkSection(CONFIG, state, refs, SEC);
        expect(state.sections[SEC]!.score).toBe(1); // one right, one wrong
    });

    it('ordering contributes one all-or-nothing point', () => {
        const { refs, state } = setup(orderingHtml({ solution: true }));
        checkSection(CONFIG, state, refs, SEC);
        expect(state.sections[SEC]!.total).toBe(1);
        expect(state.sections[SEC]!.score).toBe(0);

        const os = state.orderings[OB]!;
        moveItem(os, O1, 0); // → O1, O2, O3 (correct)
        checkSection(CONFIG, state, refs, SEC);
        expect(state.sections[SEC]!.score).toBe(1);
        expect(state.orderings[OB]!.solutionRevealed).toBe(true);
    });
});

describe('gatherResponses + payload (v7)', () => {
    it('answered matching lands in the matches map with earned/total', () => {
        const { refs, state } = setup(matchingHtml());
        state.matches[MB]!.pairs = { [I1]: T1 };
        state.matches[MB]!.confidence = 'unsure';
        const gathered = gatherResponses(state, refs);
        expect(gathered.matches).toEqual({
            [MB]: {
                pairs: { [I1]: T1 },
                correct: false,
                earned: 1,
                total: 2,
                confidence: 'unsure',
            },
        });
        expect(gathered.score).toBe(0.5); // 1 of 2 pairs
        expect(gathered.totalScored).toBe(2);

        const payload = buildSubmissionPayload(CONFIG, 'Kid', gathered, undefined);
        expect(payload.responses.schemaVersion).toBe(7);
        expect(payload.responses.matches).toEqual(gathered.matches);
    });

    it('answered ordering lands in the orderings map; untouched is an omission', () => {
        const { refs, state } = setup(orderingHtml());
        let gathered = gatherResponses(state, refs);
        expect(gathered.orderings).toBeUndefined();
        expect(gathered.totalScored).toBe(0);

        moveItem(state.orderings[OB]!, O1, 0);
        gathered = gatherResponses(state, refs);
        expect(gathered.orderings).toEqual({
            [OB]: { order: [O1, O2, O3], correct: true },
        });
        expect(gathered.score).toBe(1);
    });
});

describe('render', () => {
    it('docks the real card into the paired item slot and reveals the ghost letter', () => {
        const { refs, state } = setup(matchingHtml());
        const ref = refs.matches.get(MB)!;
        state.matches[MB]!.pairs = { [I1]: T1 };
        render(state, refs);
        const t1 = ref.targets.get(T1)!;
        expect(t1.card.parentElement).toBe(ref.items.get(I1)!.slot);
        expect(t1.home.classList.contains('is-empty')).toBe(true);
        // Un-pair → card returns home.
        state.matches[MB]!.pairs = {};
        render(state, refs);
        expect(t1.card.parentElement).toBe(t1.home);
        expect(t1.home.classList.contains('is-empty')).toBe(false);
    });

    it('reuse mode clones a chip into the dock and leaves the bank card home', () => {
        const { refs, state } = setup(matchingHtml({ reuse: true }));
        const ref = refs.matches.get(MB)!;
        state.matches[MB]!.pairs = { [I1]: T1, [I2]: T1 };
        render(state, refs);
        const t1 = ref.targets.get(T1)!;
        expect(t1.card.parentElement).toBe(t1.home);
        const chip1 = ref.items.get(I1)!.slot.firstElementChild!;
        expect(chip1.classList.contains('match-docked-chip')).toBe(true);
        expect(ref.items.get(I2)!.slot.firstElementChild).not.toBeNull();
    });

    it('post-check: per-pair verdict classes on items (wrong + missing both incorrect)', () => {
        const { refs, state } = setup(matchingHtml());
        const ref = refs.matches.get(MB)!;
        state.matches[MB]!.pairs = { [I1]: T2 }; // wrong target; I2 unpaired
        checkSection(CONFIG, state, refs, SEC);
        render(state, refs);
        expect(ref.items.get(I1)!.el.classList.contains('incorrect')).toBe(true);
        expect(ref.items.get(I2)!.el.classList.contains('incorrect')).toBe(true);

        state.matches[MB]!.pairs = { [I1]: T1, [I2]: T2 };
        render(state, refs);
        expect(ref.items.get(I1)!.el.classList.contains('correct')).toBe(true);
        expect(ref.items.get(I2)!.el.classList.contains('correct')).toBe(true);
    });

    it('re-sequences the ordering list to match state.order', () => {
        const { refs, state } = setup(orderingHtml());
        const ref = refs.orderings.get(OB)!;
        moveItem(state.orderings[OB]!, O1, 0);
        render(state, refs);
        const domOrder = Array.prototype.map.call(
            ref.list.querySelectorAll('.order-item'),
            (el: HTMLElement) => el.dataset.itemId,
        );
        expect(domOrder).toEqual([O1, O2, O3]);
    });

    it('post-check: per-position verdicts; locked section pulls cards/rows out of the tab order', () => {
        const { refs, state } = setup(orderingHtml());
        const ref = refs.orderings.get(OB)!;
        moveItem(state.orderings[OB]!, O3, 0); // wrong arrangement: O3, O2, O1
        checkSection({ ...CONFIG, submissionMode: 'locked' }, state, refs, SEC);
        render(state, refs);
        const first = ref.items.get(O3)!;
        expect(first.classList.contains('incorrect')).toBe(true);
        expect(first.getAttribute('tabindex')).toBe('-1');
        // Middle position holds O2, which IS answer[1] — correct even in a
        // wrong-overall arrangement (per-position feedback, all-or-nothing score).
        expect(ref.items.get(O2)!.classList.contains('correct')).toBe(true);
    });
});
