// =============================================================================
// capabilityFacts.test.ts — the derived capability facts, bound to the code
// -----------------------------------------------------------------------------
// docs/capability-facts.json is what the curriculum repo PINS and gates its
// graph against (B14). Two ways it could lie, both fatal there:
//   1. the committed file drifts from the module (someone edits one, not the
//      other) — the pin would then encode facts no code backs;
//   2. the module's join drifts from the code (a fence added without a
//      capability, a family removed, a probe that stopped being gradeable).
// Each is a test here, so neither can reach `main` and be pinned.
// =============================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
    JOIN,
    SCORE_SHAPES,
    capabilityFacts,
    capabilityFactsProblems,
    renderCapabilityFacts,
} from '../lib/capabilityFacts';
import { FENCES } from '../lib/importFormatRegistry';

const FACTS_DOC = readFileSync(
    fileURLToPath(new URL('../../../../docs/capability-facts.json', import.meta.url)),
    'utf8',
);

describe('the committed file IS the module', () => {
    it('docs/capability-facts.json matches renderCapabilityFacts() byte for byte', () => {
        // Regenerate with `pnpm facts:capabilities`. If this fails after a
        // capability change, the curriculum side also needs a pin-bump PR.
        expect(FACTS_DOC).toBe(renderCapabilityFacts());
    });

    it('says how to regenerate itself', () => {
        expect(FACTS_DOC).toMatch(/pnpm facts:capabilities/);
    });
});

describe('the join agrees with the code', () => {
    it('has no problems', () => {
        expect(capabilityFactsProblems()).toEqual([]);
    });

    it('every importer fence is a capability or a named exemption', () => {
        // The FATAL the July generator died on (correspond/table/seed/meta),
        // kept as a standing check rather than a one-time fix.
        const facts = capabilityFacts();
        const reached = new Set(
            Object.values(facts.capabilities).map((fact) => fact.reached_by.fence),
        );
        for (const fence of FENCES) {
            expect(
                reached.has(fence.tag) || fence.tag in facts.exempt_fences,
                `fence '${fence.tag}'`,
            ).toBe(true);
        }
    });

    it('derives only values in the shared vocabulary, and never `unknown`', () => {
        for (const [id, fact] of Object.entries(capabilityFacts().capabilities)) {
            expect(SCORE_SHAPES, id).toContain(fact.grading.score_shape);
            expect(fact.grading.score_shape, id).not.toBe('unknown');
        }
    });

    it('an unscored capability has no score shape', () => {
        for (const [id, fact] of Object.entries(capabilityFacts().capabilities)) {
            if (fact.grading.scoring === 'none') expect(fact.grading.score_shape, id).toBe('none');
        }
    });
});

describe('the four capabilities B14 exists to flip', () => {
    // Shipped 2026-08-31/09-01 and still `proposed` in the curriculum graph at
    // fc9ff6e. Pinned here so a refactor of the join cannot quietly drop one.
    it.each([
        ['draggable_curve', 'boolean'],
        ['graded_polynomial', 'fraction'],
        ['nway_correspondence', 'per_cell'],
        ['seeded_data', 'none'],
    ])('%s is shipped with score_shape %s', (id, shape) => {
        const fact = capabilityFacts().capabilities[id];
        expect(fact?.status).toBe('shipped');
        expect(fact?.grading.score_shape).toBe(shape);
    });

    it('graded_polynomial names families the schema grades', () => {
        expect(capabilityFacts().prose_facts.graded_curve_families).toEqual(
            expect.arrayContaining(['cubic', 'quartic']),
        );
        expect(JOIN.graded_polynomial?.schema).toMatch(/cubic, quartic/);
    });
});
