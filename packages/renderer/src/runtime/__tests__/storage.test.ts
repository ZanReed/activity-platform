/**
 * @vitest-environment jsdom
 */
// =============================================================================
// storage.test.ts — JSDOM-backed tests for activity-state persistence
// -----------------------------------------------------------------------------
// JSDOM provides a working localStorage, so save → load roundtrips can be
// exercised directly. Each test clears localStorage in beforeEach so blobs
// from prior tests don't leak.
//
// loadStoredName / saveName are covered indirectly — they share the same
// try/catch shape with the activity-state functions; no separate tests.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
    saveActivityState,
    loadActivityState,
    clearActivityState,
    applyStoredState,
    savePendingSubmission,
    loadPendingSubmission,
    clearPendingSubmission,
    type StoredActivityState,
} from '../storage.js';
import type { RuntimeConfig } from '../config.js';
import type { Refs, BlankRef } from '../refs.js';
import type {
    RuntimeState,
    BlankState,
    BlockState,
    SectionState,
} from '../state.js';

function makeConfig(
    activityId: string = 'act-1',
    versionNum: number = 1,
): RuntimeConfig {
    return {
        activityId,
        versionNum,
        submissionEndpoint: 'https://example.com/submit',
        submissionMode: 'free',
        revisionMode: 'free',
        gradingMode: 'auto',
        answerFeedback: 'immediate',
    };
}

function makeBlankRef(blankId: string, value: string): BlankRef {
    const input = document.createElement('input');
    input.className = 'blank';
    input.setAttribute('data-blank-id', blankId);
    input.value = value;
    document.body.appendChild(input);
    return {
        input,
        hintButton: null,
        mistakeButton: null,
        answers: ['x'],
        strategy: 'list',
        hintContent: null,
        mistakeFeedback: [],
        blockId: 'block-1',
        sectionId: 'sec-1',
        groupId: null,
    };
}

function makeBlankState(overrides: Partial<BlankState> = {}): BlankState {
    return {
        result: null,
        matchedMistake: null,
        ...overrides,
    };
}

function makeBlockState(overrides: Partial<BlockState> = {}): BlockState {
    return { solutionRevealed: false, confidence: null, ...overrides };
}

function makeSectionState(overrides: Partial<SectionState> = {}): SectionState {
    return {
        checked: false,
        locked: false,
        score: 0,
        total: 0,
        checkedAt: null,
        ...overrides,
    };
}

function makeState(
    blanks: Record<string, BlankState> = {},
    blocks: Record<string, BlockState> = {},
    sections: Record<string, SectionState> = {},
    overrides: Partial<RuntimeState> = {},
): RuntimeState {
    return {
        submitted: false,
        attemptNumber: 1,
        studentName: '',
        popover: null,
        sections,
        blanks,
        blocks,
        ...overrides,
    };
}

function makeRefs(blanks: Map<string, BlankRef>): Refs {
    return {
        blanks,
        fillInBlanks: new Map(),
        sections: new Map(),
        popover: null,
    };
}

beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
});

describe('saveActivityState + loadActivityState — roundtrip', () => {
    it('writes a blob that loads back with the same shape', () => {
        const config = makeConfig();
        const refs = makeRefs(
            new Map([
                ['b1', makeBlankRef('b1', 'x+1')],
                    ['b2', makeBlankRef('b2', '')],
            ]),
        );
        const state = makeState(
            { 'b1': makeBlankState({ result: true }), 'b2': makeBlankState() },
                                { 'block-1': makeBlockState({ confidence: 'certain' }) },
                                { 'sec-1': makeSectionState({ checked: true, score: 1, total: 2 }) },
        );
        saveActivityState(config, refs, state);
        const loaded = loadActivityState(config);
        expect(loaded).not.toBeNull();
        expect(loaded!.values).toEqual({ 'b1': 'x+1', 'b2': '' });
        expect(loaded!.blanks['b1']?.result).toBe(true);
        expect(loaded!.blocks['block-1']?.confidence).toBe('certain');
        expect(loaded!.sections['sec-1']?.score).toBe(1);
    });

    it('versionNum scoping — v1 and v2 blobs are independent', () => {
        const configV1 = makeConfig('act-1', 1);
        const configV2 = makeConfig('act-1', 2);
        const refs = makeRefs(new Map([['b1', makeBlankRef('b1', 'v1 value')]]));
        const state = makeState({ 'b1': makeBlankState() });
        saveActivityState(configV1, refs, state);
        expect(loadActivityState(configV1)).not.toBeNull();
        // The v2 key is different — no blob found.
        expect(loadActivityState(configV2)).toBeNull();
    });
});

describe('saveActivityState — gating', () => {
    it('does not persist when state.submitted is true', () => {
        const config = makeConfig();
        const refs = makeRefs(new Map([['b1', makeBlankRef('b1', 'x')]]));
        const state = makeState(
            { 'b1': makeBlankState() },
                                {},
                                {},
                                { submitted: true },
        );
        saveActivityState(config, refs, state);
        expect(loadActivityState(config)).toBeNull();
    });
});

describe('loadActivityState — bad-data handling', () => {
    it('returns null when no blob is stored', () => {
        const config = makeConfig();
        expect(loadActivityState(config)).toBeNull();
    });

    it('returns null when the stored value is malformed JSON', () => {
        const config = makeConfig();
        localStorage.setItem('activity_state_act-1_v1', '{not json');
        expect(loadActivityState(config)).toBeNull();
    });

    it('returns null on schemaVersion mismatch (forward-compat guard)', () => {
        const config = makeConfig();
        localStorage.setItem(
            'activity_state_act-1_v1',
            JSON.stringify({
                schemaVersion: 999,
                values: {},
                blanks: {},
                blocks: {},
                sections: {},
            }),
        );
        expect(loadActivityState(config)).toBeNull();
    });

    it('returns null when the parsed value is not an object', () => {
        const config = makeConfig();
        localStorage.setItem('activity_state_act-1_v1', JSON.stringify(42));
        expect(loadActivityState(config)).toBeNull();
    });
});

describe('clearActivityState', () => {
    it('removes the blob for this activity + version', () => {
        const config = makeConfig();
        const refs = makeRefs(new Map([['b1', makeBlankRef('b1', 'x')]]));
        const state = makeState({ 'b1': makeBlankState() });
        saveActivityState(config, refs, state);
        expect(loadActivityState(config)).not.toBeNull();
        clearActivityState(config);
        expect(loadActivityState(config)).toBeNull();
    });

    it('leaves other activities/versions untouched', () => {
        const configA = makeConfig('act-A');
        const configB = makeConfig('act-B');
        const refs = makeRefs(new Map([['b1', makeBlankRef('b1', 'x')]]));
        const state = makeState({ 'b1': makeBlankState() });
        saveActivityState(configA, refs, state);
        saveActivityState(configB, refs, state);
        clearActivityState(configA);
        expect(loadActivityState(configA)).toBeNull();
        expect(loadActivityState(configB)).not.toBeNull();
    });
});

describe('applyStoredState', () => {
    it('restores typed values into matching blank inputs', () => {
        const refs = makeRefs(
            new Map([
                ['b1', makeBlankRef('b1', '')],
                    ['b2', makeBlankRef('b2', '')],
            ]),
        );
        const state = makeState({
            'b1': makeBlankState(),
                                'b2': makeBlankState(),
        });
        const stored: StoredActivityState = {
            schemaVersion: 1,
            values: { 'b1': 'x+1', 'b2': 'y-2' },
            blanks: {},
            blocks: {},
            sections: {},
        };
        applyStoredState(stored, refs, state);
        expect(refs.blanks.get('b1')?.input.value).toBe('x+1');
        expect(refs.blanks.get('b2')?.input.value).toBe('y-2');
    });

    it('replaces state.blanks/blocks/sections entries with stored values', () => {
        const refs = makeRefs(new Map([['b1', makeBlankRef('b1', '')]]));
        const state = makeState(
            { 'b1': makeBlankState() },
                                { 'block-1': makeBlockState() },
                                { 'sec-1': makeSectionState() },
        );
        const stored: StoredActivityState = {
            schemaVersion: 1,
            values: {},
            blanks: {
                'b1': {
                    result: true,
                    matchedMistake: 0,
                },
            },
            blocks: {
                'block-1': { solutionRevealed: true, confidence: 'think_so' },
            },
            sections: {
                'sec-1': {
                    checked: true,
                    locked: false,
                    score: 3,
                    total: 5,
                    checkedAt: '2026-01-01T00:00:00.000Z',
                },
            },
        };
        applyStoredState(stored, refs, state);
        expect(state.blanks['b1']?.result).toBe(true);
        expect(state.blocks['block-1']?.confidence).toBe('think_so');
        expect(state.sections['sec-1']?.score).toBe(3);
        expect(state.sections['sec-1']?.checkedAt).toBe(
            '2026-01-01T00:00:00.000Z',
        );
    });

    it('skips stored entries not in current state (defense against drift)', () => {
        const refs = makeRefs(new Map([['b1', makeBlankRef('b1', '')]]));
        const state = makeState({ 'b1': makeBlankState() });
        const stored: StoredActivityState = {
            schemaVersion: 1,
            values: { 'b1': 'x', 'orphan': 'y' },
            blanks: {
                'b1': makeBlankState({ result: true }),
       'orphan': makeBlankState({ result: false }),
            },
            blocks: {},
            sections: {},
        };
        applyStoredState(stored, refs, state);
        expect(state.blanks['b1']?.result).toBe(true);
        // Orphan not added to state.
        expect(state.blanks['orphan']).toBeUndefined();
        // Orphan value not written anywhere (no ref for it).
        expect(refs.blanks.get('orphan')).toBeUndefined();
    });
});

describe('pending submission slot', () => {
    it('round-trips an arbitrary payload', () => {
        const config = makeConfig('act-1');
        const payload = {
            activityId: 'act-1',
            displayName: 'Ada',
            responses: { schemaVersion: 2, blanks: { b1: { answer: 'x', correct: true } } },
            score: 1,
        };
        savePendingSubmission(config, payload);
        expect(loadPendingSubmission(config)).toEqual(payload);
    });

    it('is keyed by activityId (independent across activities, version-agnostic)', () => {
        const configA1 = makeConfig('act-A', 1);
        const configA2 = makeConfig('act-A', 2);
        const configB = makeConfig('act-B', 1);
        savePendingSubmission(configA1, { which: 'A' });
        savePendingSubmission(configB, { which: 'B' });
        // Same activity, different version → same slot.
        expect(loadPendingSubmission(configA2)).toEqual({ which: 'A' });
        expect(loadPendingSubmission(configB)).toEqual({ which: 'B' });
    });

    it('clear removes only the targeted activity slot', () => {
        const configA = makeConfig('act-A');
        const configB = makeConfig('act-B');
        savePendingSubmission(configA, { which: 'A' });
        savePendingSubmission(configB, { which: 'B' });
        clearPendingSubmission(configA);
        expect(loadPendingSubmission(configA)).toBeNull();
        expect(loadPendingSubmission(configB)).toEqual({ which: 'B' });
    });

    it('returns null when nothing is stored or JSON is malformed', () => {
        const config = makeConfig('act-1');
        expect(loadPendingSubmission(config)).toBeNull();
        localStorage.setItem('activity_pending_submission_act-1', '{not json');
        expect(loadPendingSubmission(config)).toBeNull();
    });
});
