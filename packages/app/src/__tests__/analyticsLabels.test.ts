// =============================================================================
// analyticsLabels.test.ts — C-6's names are cross-checked against the viewer's
// block registry (policy P4: a written roster is checked, not trusted). A new
// block type with no name would show as "new_block_type" on a teacher page.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { blockRegistry } from '@activity/viewer';
import { BLOCK_NAMES, labelFor, NOT_QUESTIONS } from '../lib/analyticsLabels';

const registryKeys = Object.values(blockRegistry).map((e) => (e as { analyticsKey: string }).analyticsKey);

describe('analytics labels', () => {
    it('names every census key the registry can produce', () => {
        const unnamed = registryKeys.filter((k) => !(k in BLOCK_NAMES));
        expect(unnamed).toEqual([]);
    });

    it('lists only real keys as not-questions, and never a gradeable one', () => {
        for (const k of NOT_QUESTIONS) expect(registryKeys).toContain(k);
        for (const k of ['fill_in_blank', 'multiple_choice', 'interactive_graph', 'short_answer']) {
            expect(NOT_QUESTIONS.has(k)).toBe(false);
        }
    });

    it('reads unknown keys as Other, with no stray underscores', () => {
        expect(labelFor('_unknown')).toBe('Other');
        expect(labelFor('_unattributed')).toBe('Not yet attributed');
        expect(labelFor('interactive_graph.plot_point')).toBe('Graph · plot a point');
    });
});
