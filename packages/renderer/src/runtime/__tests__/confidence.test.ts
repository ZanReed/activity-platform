/**
 * @vitest-environment jsdom
 */
// =============================================================================
// checkpoints.test.ts — JSDOM-backed tests for per-section check + score
// -----------------------------------------------------------------------------
// Tests drive checkSection directly with fixtured config + state + refs;
// wireCheckpoints is exercised by simulating a click event on the
// section's checkButton.
//
// checkSection internally calls scoreBlankAndUpdateState, which reads
// data-blank-answers off each blank's <input>. The fixtures construct
// real (JSDOM) inputs with those attributes so the scoring path runs end
// to end without mocking strategies.ts.
//
// Session 4 change: makeBlockRef now sets confidenceRadios: [] on the
// FillInBlankRef literal — required field after the refs.ts addition.
// Test cases otherwise unchanged from Session 3.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { checkSection, wireCheckpoints } from '../checkpoints.js';
import type { RuntimeConfig } from '../config.js';
import type {
    Refs,
    BlankRef,
    FillInBlankRef,
    SectionRef,
} from '../refs.js';
import type {
    RuntimeState,
    BlankState,
    BlockState,
    SectionState,
} from '../state.js';

interface FixtureSpec {
    submissionMode: 'single' | 'locked' | 'free';
    sections: Array<{
        id: string;
        isCheckpoint: boolean;
        withCheckButton: boolean;
        blocks: Array<{
            id: string;
            solution: string | null;
            blanks: Array<{ id: string; answers: string[]; value: string }>;
        }>;
    }>;
}

interface Fixture {
    config: RuntimeConfig;
    state: RuntimeState;
    refs: Refs;
}

function makeBlankRef(
    id: string,
    blockId: string,
    sectionId: string,
    answers: string[],
    value: string,
): BlankRef {
    const wrapper = document.createElement('span');
    wrapper.className = 'blank-wrapper';
    const input = document.createElement('input');
    input.className = 'blank';
    input.setAttribute('data-blank-id', id);
    input.setAttribute('data-blank-answers', answers.join('|'));
    input.value = value;
    wrapper.appendChild(input);
    document.body.appendChild(wrapper);
    return {
        input,
        hintButton: null,
        mistakeButton: null,
        answers,
        strategy: 'list',
        hintContent: null,
        mistakeFeedback: [],
        blockId,
        sectionId,
        groupId: null,
    };
}

function makeBlockRef(
    blockId: string,
    sectionId: string,
    blankIds: string[],
    solution: string | null,
): FillInBlankRef {
    const el = document.createElement('div');
    el.className = 'block block-fill-in-blank';
    el.setAttribute('data-block-type', 'fill_in_blank');
    el.setAttribute('data-block-id', blockId);
    let solutionEl: HTMLElement | null = null;
    if (solution !== null) {
        solutionEl = document.createElement('div');
        solutionEl.className = 'js-solution';
        solutionEl.hidden = true;
        solutionEl.textContent = solution;
        el.appendChild(solutionEl);
    }
    document.body.appendChild(el);
    return {
        el,
        blankIds,
        solutionEl,
        hasConfidenceRating: false,
        confidenceFieldset: null,
        confidenceRadios: [],
        skills: [],
        sectionId,
    };
}

function makeSectionRef(
    sectionId: string,
    blankIds: string[],
    blockIds: string[],
    isCheckpoint: boolean,
    withCheckButton: boolean,
): SectionRef {
    const el = document.createElement('section');
    el.className = 'activity-section';
    el.setAttribute('data-section-id', sectionId);
    if (isCheckpoint) el.setAttribute('data-is-checkpoint', 'true');
    let checkButton: HTMLButtonElement | null = null;
    let scoreEl: HTMLElement | null = null;
    if (withCheckButton) {
        checkButton = document.createElement('button');
        checkButton.className = 'js-checkpoint-btn';
        checkButton.type = 'button';
        checkButton.setAttribute('data-for-section', sectionId);
        checkButton.textContent = 'Check this section';
        scoreEl = document.createElement('div');
        scoreEl.className = 'js-section-score';
        scoreEl.setAttribute('data-for-section', sectionId);
        scoreEl.hidden = true;
        el.appendChild(checkButton);
        el.appendChild(scoreEl);
    }
    document.body.appendChild(el);
    return {
        el,
        isCheckpoint,
        blankIds,
        blockIds,
        graphBlockIds: [],
        checkButton,
        scoreEl,
    };
}

function makeBlankState(): BlankState {
    return { result: null, matchedMistake: null };
}

function makeBlockState(): BlockState {
    return { solutionRevealed: false, confidence: null };
}

function makeSectionState(): SectionState {
    return {
        checked: false,
        locked: false,
        score: 0,
        total: 0,
        checkedAt: null,
    };
}

function buildFixture(spec: FixtureSpec): Fixture {
    const blanks = new Map<string, BlankRef>();
    const fillInBlanks = new Map<string, FillInBlankRef>();
    const sections = new Map<string, SectionRef>();
    const blanksState: Record<string, BlankState> = {};
    const blocksState: Record<string, BlockState> = {};
    const sectionsState: Record<string, SectionState> = {};

    for (const section of spec.sections) {
        const sectionBlankIds: string[] = [];
        const sectionBlockIds: string[] = [];
        for (const block of section.blocks) {
            const blockBlankIds: string[] = [];
            for (const blank of block.blanks) {
                blanks.set(
                    blank.id,
                    makeBlankRef(
                        blank.id,
                        block.id,
                        section.id,
                        blank.answers,
                        blank.value,
                    ),
                );
                blanksState[blank.id] = makeBlankState();
                blockBlankIds.push(blank.id);
            }
            fillInBlanks.set(
                block.id,
                makeBlockRef(
                    block.id,
                    section.id,
                    blockBlankIds,
                    block.solution,
                ),
            );
            blocksState[block.id] = makeBlockState();
            sectionBlockIds.push(block.id);
            sectionBlankIds.push(...blockBlankIds);
        }
        sections.set(
            section.id,
            makeSectionRef(
                section.id,
                sectionBlankIds,
                sectionBlockIds,
                section.isCheckpoint,
                section.withCheckButton,
            ),
        );
        sectionsState[section.id] = makeSectionState();
    }

    const config: RuntimeConfig = {
        activityId: 'a1',
        versionNum: 1,
        submissionEndpoint: 'https://example.com/submit',
        submissionMode: spec.submissionMode,
        revisionMode: 'free',
        gradingMode: 'auto',
        answerFeedback: 'immediate',
    };

    const state: RuntimeState = {
        submitted: false,
        attemptNumber: 1,
        studentName: '',
        popover: null,
        sections: sectionsState,
        blanks: blanksState,
        blocks: blocksState,
        graphs: {},
    };

    return {
        config,
        state,
        refs: { blanks, fillInBlanks, graphs: new Map(), graphDisplays: new Map(), sections, popover: null },
    };
}

beforeEach(() => {
    document.body.innerHTML = '';
});

describe('checkSection — scoring aggregation', () => {
    it('writes correct count and section total to state', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'free',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: true,
                    withCheckButton: true,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: null,
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'x' },
                                { id: 'b2', answers: ['y'], value: 'y' },
                                { id: 'b3', answers: ['z'], value: 'wrong' },
                            ],
                        },
                    ],
                },
            ],
        });
        checkSection(config, state, refs, 'sec-1');
        expect(state.sections['sec-1']?.checked).toBe(true);
        expect(state.sections['sec-1']?.score).toBe(2);
        expect(state.sections['sec-1']?.total).toBe(3);
    });

    it('counts empty blanks toward the section total (B-format)', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'free',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: true,
                    withCheckButton: true,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: null,
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'x' },
                                { id: 'b2', answers: ['y'], value: '' },
                                { id: 'b3', answers: ['z'], value: '' },
                            ],
                        },
                    ],
                },
            ],
        });
        checkSection(config, state, refs, 'sec-1');
        expect(state.sections['sec-1']?.score).toBe(1);
        expect(state.sections['sec-1']?.total).toBe(3);
    });

    it('sets checkedAt to a valid ISO timestamp', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'free',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: true,
                    withCheckButton: true,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: null,
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'x' },
                            ],
                        },
                    ],
                },
            ],
        });
        checkSection(config, state, refs, 'sec-1');
        const stamp = state.sections['sec-1']?.checkedAt;
        expect(typeof stamp).toBe('string');
        expect(() => new Date(stamp as string).toISOString()).not.toThrow();
    });

    it('updates per-blank state via scoreBlankAndUpdateState', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'free',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: true,
                    withCheckButton: true,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: null,
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'x' },
                                { id: 'b2', answers: ['y'], value: 'wrong' },
                            ],
                        },
                    ],
                },
            ],
        });
        checkSection(config, state, refs, 'sec-1');
        expect(state.blanks['b1']?.result).toBe(true);
        expect(state.blanks['b2']?.result).toBe(false);
    });

    it('returns silently when sectionId is unknown', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'free',
            sections: [],
        });
        expect(() =>
        checkSection(config, state, refs, 'nonexistent'),
        ).not.toThrow();
    });
});

describe('checkSection — locked mode', () => {
    it('flips SectionState.locked true in locked submissionMode', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'locked',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: true,
                    withCheckButton: true,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: null,
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'x' },
                            ],
                        },
                    ],
                },
            ],
        });
        checkSection(config, state, refs, 'sec-1');
        expect(state.sections['sec-1']?.locked).toBe(true);
    });

    it('leaves SectionState.locked false in free submissionMode', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'free',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: true,
                    withCheckButton: true,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: null,
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'x' },
                            ],
                        },
                    ],
                },
            ],
        });
        checkSection(config, state, refs, 'sec-1');
        expect(state.sections['sec-1']?.locked).toBe(false);
    });
});

describe('checkSection — solution reveal', () => {
    it('flips solutionRevealed true for blocks that have a solution', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'free',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: true,
                    withCheckButton: true,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: 'Combine like terms.',
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'x' },
                            ],
                        },
                    ],
                },
            ],
        });
        checkSection(config, state, refs, 'sec-1');
        expect(state.blocks['block-1']?.solutionRevealed).toBe(true);
    });

    it('leaves solutionRevealed false for blocks without a solution', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'free',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: true,
                    withCheckButton: true,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: null,
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'x' },
                            ],
                        },
                    ],
                },
            ],
        });
        checkSection(config, state, refs, 'sec-1');
        expect(state.blocks['block-1']?.solutionRevealed).toBe(false);
    });

    it('keeps solutionRevealed true on a re-check (never unset once true)', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'free',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: true,
                    withCheckButton: true,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: 'Combine like terms.',
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'x' },
                            ],
                        },
                    ],
                },
            ],
        });
        checkSection(config, state, refs, 'sec-1');
        expect(state.blocks['block-1']?.solutionRevealed).toBe(true);
        const blankRef = refs.blanks.get('b1');
        if (blankRef) blankRef.input.value = 'wrong';
        checkSection(config, state, refs, 'sec-1');
        expect(state.blocks['block-1']?.solutionRevealed).toBe(true);
    });
});

describe('checkSection — re-check (free mode)', () => {
    it('recomputes score against current input values', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'free',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: true,
                    withCheckButton: true,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: null,
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'wrong' },
                            ],
                        },
                    ],
                },
            ],
        });
        checkSection(config, state, refs, 'sec-1');
        expect(state.sections['sec-1']?.score).toBe(0);
        const blankRef = refs.blanks.get('b1');
        if (blankRef) blankRef.input.value = 'x';
        checkSection(config, state, refs, 'sec-1');
        expect(state.sections['sec-1']?.score).toBe(1);
    });
});

describe('wireCheckpoints', () => {
    it('attaches click handlers that run checkSection + onUpdate', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'free',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: true,
                    withCheckButton: true,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: null,
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'x' },
                            ],
                        },
                    ],
                },
            ],
        });
        let updates = 0;
        wireCheckpoints(config, state, refs, () => {
            updates += 1;
        });
        const button = refs.sections.get('sec-1')?.checkButton;
        button?.click();
        expect(updates).toBe(1);
        expect(state.sections['sec-1']?.checked).toBe(true);
        expect(state.sections['sec-1']?.score).toBe(1);
    });

    it('skips sections without a check button (no error)', () => {
        const { config, state, refs } = buildFixture({
            submissionMode: 'single',
            sections: [
                {
                    id: 'sec-1',
                    isCheckpoint: false,
                    withCheckButton: false,
                    blocks: [
                        {
                            id: 'block-1',
                            solution: null,
                            blanks: [
                                { id: 'b1', answers: ['x'], value: 'x' },
                            ],
                        },
                    ],
                },
            ],
        });
        expect(() =>
        wireCheckpoints(config, state, refs, () => {}),
        ).not.toThrow();
    });
});
