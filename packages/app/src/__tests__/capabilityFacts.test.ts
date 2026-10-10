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
import { beforeAll, describe, expect, it } from 'vitest';
import {
    JOIN,
    SCORE_SHAPES,
    capabilityFacts,
    capabilityFactsProblems,
    renderCapabilityFacts,
} from '../lib/capabilityFacts';
import { FENCES } from '../lib/importFormatRegistry';
import { getMarkdownImporter } from '../lib/markdownToTiptap';

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

describe('prose_facts.figure_grammar is the parser, not a copy (C-107 (b))', () => {
    // The curriculum side's check_figures.py reads this instead of keeping its
    // own list. Every entry is held to the importer's OUTPUT: a kind must
    // import, a flag must change what is drawn, a setting must change the
    // figure — and a source scan catches a flag word the parser reads that the
    // declaration does not name. A new entry without a probe below goes red.
    const grammar = capabilityFacts().prose_facts.figure_grammar;
    const POINTS = ['point (0,0) "A"', 'point (4,0) "B"', 'point (1,3) "C"', 'point (5,3) "D"'];
    let importer: Awaited<ReturnType<typeof getMarkdownImporter>>;
    beforeAll(async () => {
        importer = await getMarkdownImporter();
    });
    const fig = (...lines: string[]) => {
        const r = importer(['```figure', 'alt: A probe figure', ...lines, '```'].join('\n'));
        const block = r.blocks.find((b) => b.type === 'graphFigure');
        return { warnings: r.warnings, attrs: (block?.attrs ?? null) as Record<string, unknown> | null };
    };
    const drawn = (r: ReturnType<typeof fig>) => JSON.stringify(r.attrs?.drawables ?? null);

    const KIND_EXAMPLE: Record<string, string[]> = {
        point: ['point (1,1) "P"'],
        polygon: [...POINTS, 'polygon A B C'],
        region: [...POINTS, 'region A B C'],
        segment: [...POINTS, 'segment A B'],
        side: [...POINTS, 'polygon A B C', 'side AB "4 cm"'],
        angle: [...POINTS, 'polygon A B C', 'angle BAC'],
        ticks: [...POINTS, 'polygon A B C', 'ticks AB'],
        parallel: [...POINTS, 'parallel AB CD'],
        text: ['text (1,1) "base"'],
        cuboid: ['cuboid 4 2 3 cm'],
        line: ['axes: -5..5, -5..5', 'line y = x'],
        curve: ['axes: -5..5, -5..5', 'curve y = x^2'],
        ray: ['axes: -5..5, -5..5', 'ray (0,0) (2,1)'],
    };

    it('every declared line kind (own and fallback) imports cleanly', () => {
        for (const kind of [...grammar.line_kinds, ...grammar.fallback_kinds]) {
            const example = KIND_EXAMPLE[kind];
            expect(example, `no probe for kind "${kind}" — add one`).toBeDefined();
            const r = fig(...example!);
            expect(r.warnings, kind).toEqual([]);
            expect(r.attrs, kind).not.toBeNull();
        }
    });

    it('every refused kind is refused with a warning', () => {
        for (const kind of grammar.refused_kinds) {
            const r = fig('axes: -5..5, -5..5', `${kind} sin(x)`);
            expect(r.warnings.join(' '), kind).toContain('never drawn in a figure');
        }
    });

    it('every declared flag changes what is drawn', () => {
        for (const [kind, flags] of Object.entries(grammar.flags)) {
            const base = KIND_EXAMPLE[kind];
            expect(base, `no probe for flagged kind "${kind}"`).toBeDefined();
            const plain = fig(...base!);
            for (const f of flags) {
                const lines = [...base!];
                lines[lines.length - 1] = `${lines[lines.length - 1]} ${f}`;
                const flagged = fig(...lines);
                expect(flagged.warnings, `${kind} ${f}`).toEqual([]);
                expect(drawn(flagged), `"${kind} … ${f}" changed nothing`).not.toBe(drawn(plain));
            }
        }
    });

    it('every declared setting changes the figure', () => {
        const SETTING_PROBE: Record<string, { line: string; base?: string[] }> = {
            alt: { line: 'alt: Something else' },
            caption: { line: 'caption: A' },
            axes: { line: 'axes: -3..3, -3..3' },
            plane: { line: 'plane: on' },
            'to scale': { line: 'to scale' },
            hidden: { line: 'hidden: off', base: ['cuboid 4 2 3 cm'] },
        };
        for (const setting of grammar.settings) {
            const probe = SETTING_PROBE[setting];
            expect(probe, `no probe for setting "${setting}"`).toBeDefined();
            const base = probe!.base ?? ['point (1,1) "P"'];
            const plain = fig(...base);
            const set = fig(probe!.line, ...base);
            expect(set.warnings, setting).toEqual([]);
            expect(JSON.stringify(set.attrs), `"${setting}" changed nothing`).not.toBe(JSON.stringify(plain.attrs));
        }
    });

    it('the parser reads no flag word the declaration does not name (source scan)', () => {
        const src = readFileSync(fileURLToPath(new URL('../lib/figureFence.ts', import.meta.url)), 'utf8');
        const read = new Set([...src.matchAll(/flag\('([a-z]+)'\)/g)].map((m) => m[1]!));
        const own = new Set(grammar.line_kinds.flatMap((k) => grammar.flags[k] ?? []));
        // `units` is read by word match, not flag(); the probe above covers it.
        own.delete('units');
        expect([...read].sort()).toEqual([...own].sort());
    });
});
