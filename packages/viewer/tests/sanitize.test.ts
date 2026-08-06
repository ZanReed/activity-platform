// =============================================================================
// sanitize.test.ts — wire-level leak tests + sanitizer guards (S2/T3, TV4-A)
// -----------------------------------------------------------------------------
// The failure this suite exists for is SILENT: a sanitizer miss ships an
// answer key to every student and nothing crashes. So the core test is blunt
// and wire-level — build ONE document containing every block type and every
// interaction variant, plant unique sentinels in every secret field, sanitize,
// and string-scan the serialized wire output for survivors. The mechanism
// (strip paths, deep walks) is deliberately not what's asserted; the WIRE is.
//
// Alongside it, the anti-drift guards:
//   - every declared strip path must RESOLVE on a fully-loaded instance (a
//     typo'd path is a silent leak — this makes it a red test),
//   - every suspicious key the schema carries (top-level, interaction-variant,
//     and choice-level) must be declared stripped — a FUTURE block type or
//     field that carries a key can't slip past the registry unnoticed,
//   - data_plot's `data` is asserted PRESENT (the documented
//     derivableFromServed residual is a whitelist, never a silent skip).
// =============================================================================

import { describe, expect, it } from 'vitest';

import {
  Block,
  DataPlotInteraction,
  GraphInteraction,
  MultipleChoiceOption,
  NumberLineInteraction,
} from '@activity/schema';
import {
  SANITIZER_REV,
  applyServeShuffles,
  blockRegistry,
  registeredBlockTypes,
  sanitizeActivityDocument,
  sanitizeBlock,
  seededShuffle,
} from '../src/index.js';
import type { BlockType, SanitizedActivityDocument } from '../src/index.js';

// The fully-loaded secret-bearing fixture now lives in a shared helper: S4's
// check-response leak suite scans the SAME document, so a new secret field is
// declared once and both channels inherit it.
import {
  NUM,
  RELEASABLE,
  STR,
  fixturesByType,
  fullyLoadedDocument,
  uuid,
  wireOf,
} from '../src/fixtures/leakFixture.js';


// -----------------------------------------------------------------------------
// The leak test
// -----------------------------------------------------------------------------

describe('wire-level leak tests (TV4-A)', () => {
  const doc = fullyLoadedDocument();
  const sanitized = sanitizeActivityDocument(doc);
  const wire = wireOf(sanitized);

  it('the fixture actually contains every sentinel before sanitizing', () => {
    const before = wireOf(doc);
    expect(before).toContain(STR);
    expect(before).toContain(RELEASABLE);
    expect(before).toContain(String(NUM));
  });

  it('no string sentinel survives to the wire', () => {
    expect(wire).not.toContain(STR);
  });

  it('no RELEASABLE content survives either — the read path releases nothing', () => {
    // Solution and mistakeFeedback bodies are released only by the CHECK
    // response, after a check. On this path they are as secret as the answer.
    expect(wire).not.toContain(RELEASABLE);
  });

  it('no numeric sentinel survives to the wire', () => {
    expect(wire).not.toContain(String(NUM));
  });

  it('covers every registered block type (fixture completeness guard)', () => {
    const covered = [...fixturesByType().keys()].sort();
    expect(covered).toEqual([...registeredBlockTypes].sort());
  });

  it('covers every interaction variant of the three variant blocks', () => {
    const fixtures = fixturesByType();
    for (const type of ['interactive_graph', 'number_line', 'data_plot'] as const) {
      const present = fixtures
        .get(type)!
        .map((b) => (b.interaction as { type: string }).type)
        .sort();
      expect(present).toEqual([...(blockRegistry[type].variants ?? [])].sort());
    }
  });

  it('data_plot `data` SURVIVES — the documented derivableFromServed residual', () => {
    const dataPlots = sanitized.sections[0]!.rows
      .flatMap((r) => r.columns.flatMap((c) => c.blocks))
      .filter((b) => b.type === 'data_plot');
    expect(dataPlots.length).toBeGreaterThan(0);
    for (const dp of dataPlots) {
      expect((dp as { data: number[] }).data).toEqual([3, 5, 5, 6, 8]);
    }
    expect(blockRegistry.data_plot.sanitize.derivableFromServed).toBeTruthy();
  });

  it('pre-check affordances survive: hint, answerType, width, gap ids', () => {
    expect(wire).toContain('HINT_SURVIVES');
    expect(wire).toContain('"answerType":"math"');
    expect(wire).toContain('"width":8');
    // The math gap ids survive (they ARE the gaps); their answers do not.
    expect(wire).toContain('"g1"');
  });

  it('structural keys are ABSENT (fields with un-sentinelable values)', () => {
    const blocks = sanitized.sections[0]!.rows.flatMap((r) =>
      r.columns.flatMap((c) => c.blocks),
    );
    const byType = (t: string) => blocks.filter((b) => b.type === t);

    for (const matching of byType('matching')) {
      expect('key' in matching).toBe(false);
    }
    for (const mc of byType('multiple_choice')) {
      for (const choice of (mc as { choices: object[] }).choices) {
        expect('correct' in choice).toBe(false);
        expect('feedback' in choice).toBe(false);
      }
    }
    for (const graph of byType('interactive_graph')) {
      expect('noSolutionCorrect' in graph).toBe(false);
      expect('mistakeFeedback' in graph).toBe(false);
      expect('partialCredit' in graph).toBe(false);
      expect('builtinFeedback' in graph).toBe(false);
      // allowNoSolution SURVIVES — it renders the "no solution" control.
      expect((graph as { allowNoSolution?: boolean }).allowNoSolution).toBe(true);
    }
    for (const sa of [...byType('short_answer'), ...byType('essay')]) {
      expect('rubric' in sa).toBe(false);
    }
  });

  it('sanitize does not reorder anything (shuffling is serve-time work)', () => {
    const ordering = sanitized.sections[0]!.rows
      .flatMap((r) => r.columns.flatMap((c) => c.blocks))
      .find((b) => b.type === 'ordering') as {
      items: Array<{ content: Array<{ text?: string }> }>;
    };
    expect(ordering.items.map((i) => i.content[0]?.text)).toEqual([
      'first',
      'second',
      'third',
      'fourth',
      'fifth',
      'sixth',
    ]);
  });

  it('sanitizeBlock fails CLOSED on an unknown block type', () => {
    expect(() =>
      sanitizeBlock({ id: uuid(), type: 'mystery_block' } as never),
    ).toThrowError(/unknown block type/);
  });

  it('does not mutate its input', () => {
    const before = wireOf(doc);
    sanitizeActivityDocument(doc);
    expect(wireOf(doc)).toBe(before);
  });
});

// -----------------------------------------------------------------------------
// Anti-drift guards
// -----------------------------------------------------------------------------

describe('strip-path validity (a mistyped path is a silent leak)', () => {
  const fixtures = fixturesByType();

  const pathResolves = (block: Record<string, unknown>, path: string): boolean => {
    const arrayIdx = path.indexOf('[].');
    if (arrayIdx !== -1) {
      const arr = block[path.slice(0, arrayIdx)];
      const sub = path.slice(arrayIdx + 3);
      return (
        Array.isArray(arr) &&
        arr.some(
          (el) => el !== null && typeof el === 'object' && sub in (el as object),
        )
      );
    }
    const dotIdx = path.indexOf('.');
    if (dotIdx !== -1) {
      const parent = block[path.slice(0, dotIdx)];
      return (
        parent !== null &&
        typeof parent === 'object' &&
        path.slice(dotIdx + 1) in (parent as object)
      );
    }
    return path in block;
  };

  it.each([...registeredBlockTypes])('%s', (type) => {
    const instances = fixtures.get(type)!;
    for (const path of blockRegistry[type].sanitize.strip) {
      // Variant-scoped paths must resolve on AT LEAST ONE variant fixture;
      // unscoped paths on every instance.
      const resolved = path.startsWith('interaction.')
        ? instances.some((b) => pathResolves(b, path))
        : instances.every((b) => pathResolves(b, path));
      expect(resolved, `${type}: strip path '${path}' resolves on no fixture`).toBe(
        true,
      );
    }
    for (const field of blockRegistry[type].sanitize.serveShuffled ?? []) {
      expect(
        instances.every((b) => Array.isArray(b[field])),
        `${type}: serveShuffled field '${field}' is not an array on the fixture`,
      ).toBe(true);
    }
    for (const field of blockRegistry[type].sanitize.childBlocks ?? []) {
      expect(
        instances.every((b) => Array.isArray(b[field])),
        `${type}: childBlocks field '${field}' is not an array on the fixture`,
      ).toBe(true);
    }
  });
});

describe('schema-vs-registry secret completeness (future-block guard)', () => {
  // Any key on a block schema whose NAME signals answer-key material must be
  // declared stripped (or explicitly whitelisted here, with a reason). A new
  // block type that adds `solution` without a registry strip fails THIS test,
  // not a student's privacy.
  const SUSPICIOUS_TOP_LEVEL = [
    'solution',
    'answer',
    'acceptableAnswers',
    'rubric',
    'key',
    'mistakeFeedback',
    'noSolutionCorrect',
    'correct',
  ] as const;
  // data_plot.data: the documented derivableFromServed residual (the chart is
  // computed from data the student must receive).
  const WHITELIST = new Set(['data_plot:data']);

  it('every suspicious top-level key is stripped', () => {
    for (const option of Block.options) {
      const type = option.shape.type.value as BlockType;
      const strips = blockRegistry[type].sanitize.strip;
      for (const key of Object.keys(option.shape)) {
        if (!SUSPICIOUS_TOP_LEVEL.includes(key as never)) continue;
        if (WHITELIST.has(`${type}:${key}`)) continue;
        expect(
          strips.includes(key),
          `${type}.${key} looks like answer-key material but is not stripped`,
        ).toBe(true);
      }
    }
  });

  const SUSPICIOUS_INTERACTION = [
    'correctPoints',
    'correctInterval',
    'models',
    'domains',
    'regions',
    'inequalities',
    'rays',
    'segments',
    'tolerance',
  ] as const;

  it.each([
    ['interactive_graph', GraphInteraction],
    ['number_line', NumberLineInteraction],
    ['data_plot', DataPlotInteraction],
  ] as const)('every suspicious %s interaction key is stripped', (type, union) => {
    const strips = blockRegistry[type].sanitize.strip;
    for (const option of union.options) {
      for (const key of Object.keys(option.shape)) {
        if (!SUSPICIOUS_INTERACTION.includes(key as never)) continue;
        expect(
          strips.includes(`interaction.${key}`),
          `${type}.interaction.${key} (variant ${option.shape.type.value}) is not stripped`,
        ).toBe(true);
      }
    }
  });

  it('every suspicious multiple-choice option key is stripped', () => {
    const strips = blockRegistry.multiple_choice.sanitize.strip;
    for (const key of Object.keys(MultipleChoiceOption.shape)) {
      if (key === 'correct' || key === 'feedback') {
        expect(strips.includes(`choices[].${key}`)).toBe(true);
      }
    }
  });
});

// -----------------------------------------------------------------------------
// Serve-time shuffles + the cache revision
// -----------------------------------------------------------------------------

describe('serve-time shuffles (deterministic per version + student)', () => {
  const sanitized = sanitizeActivityDocument(fullyLoadedDocument());
  const orderingTexts = (doc: SanitizedActivityDocument): string[] => {
    const ordering = doc.sections[0]!.rows
      .flatMap((r) => r.columns.flatMap((c) => c.blocks))
      .find((b) => b.type === 'ordering') as {
      items: Array<{ content: Array<{ text?: string }> }>;
    };
    return ordering.items.map((i) => i.content[0]?.text ?? '');
  };
  const authored = orderingTexts(sanitized);

  it('serves a permutation, not the authored order (the order IS the key)', () => {
    const served = orderingTexts(applyServeShuffles(sanitized, 'v1:student-a'));
    expect([...served].sort()).toEqual([...authored].sort());
    expect(served).not.toEqual(authored);
  });

  it('is stable for the same (version, student) seed — reloads never reshuffle', () => {
    const a = orderingTexts(applyServeShuffles(sanitized, 'v1:student-a'));
    const b = orderingTexts(applyServeShuffles(sanitized, 'v1:student-a'));
    expect(a).toEqual(b);
  });

  it('differs across students and across versions', () => {
    const a = orderingTexts(applyServeShuffles(sanitized, 'v1:student-a'));
    const b = orderingTexts(applyServeShuffles(sanitized, 'v1:student-b'));
    const c = orderingTexts(applyServeShuffles(sanitized, 'v2:student-a'));
    // Deterministic seeds — these particular permutations of 6 items differ
    // (verified once; the PRNG is fixed, so this can never flake).
    expect(a).not.toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('does not mutate the cached artifact it reads from', () => {
    const before = wireOf(sanitized);
    applyServeShuffles(sanitized, 'v1:student-a');
    expect(wireOf(sanitized)).toBe(before);
  });

  it('seededShuffle preserves membership and is seed-deterministic', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = seededShuffle(items, 'seed');
    expect([...a].sort((x, y) => x - y)).toEqual(items);
    expect(seededShuffle(items, 'seed')).toEqual(a);
    expect(items).toEqual([1, 2, 3, 4, 5, 6, 7, 8]); // pure
  });
});

describe('SANITIZER_REV (the durable cache invalidation key)', () => {
  it('has the algo-hash shape and is stable within a build', () => {
    expect(SANITIZER_REV).toMatch(/^\d+-[0-9a-f]{8}$/);
    expect(SANITIZER_REV).toBe(SANITIZER_REV);
  });
});
