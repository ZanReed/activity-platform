// =============================================================================
// fixtures.test.ts — guards for the generated fixture module (S3 ruling D13)
// -----------------------------------------------------------------------------
// The fixtures are the shared input for the conformance factory, component
// tests, and the /dev/viewer harness, so they get their own guards:
//
//   - COMPLETENESS: every registered block type has an authored fixture, and
//     the three variant blocks cover every declared interaction variant — a
//     new block type (or variant) fails here until its fixture exists, the
//     same forcing function as the sanitize suite's fixture guard.
//   - REALISM: every auto_gradable primary actually LOSES content to the
//     sanitizer. A fixture whose answer key is empty would render fine but
//     silently stop exercising the strip path.
//   - PIPELINE HONESTY: sanitized/served accessors go through the REAL
//     sanitizer + shuffle (ordering arrives permuted for the fixture student).
//   - DETERMINISM: two builds are byte-identical (snapshot + deep-link
//     stability for the harness).
// =============================================================================

import { describe, expect, it } from 'vitest';
import { Block } from '@activity/schema';
import { blockRegistry, registeredBlockTypes, familyOf } from '../src/index.js';
import {
  FIXTURE_SHUFFLE_SEED,
  authoredBlockFixture,
  authoredFixtureDocument,
  authoredVariantFixtures,
  sanitizedBlockFixture,
  sanitizedFixtureDocument,
  sanitizedVariantFixtures,
  servedFixtureDocument,
} from '../src/fixtures/index.js';

const wire = (value: unknown) => JSON.stringify(value);

describe('completeness (the fixture forcing function)', () => {
  it('every registered block type has a primary authored fixture', () => {
    for (const type of registeredBlockTypes) {
      expect(authoredBlockFixture(type).type, type).toBe(type);
    }
  });

  it('the variant blocks cover every registry-declared interaction variant', () => {
    for (const type of registeredBlockTypes) {
      const declared = blockRegistry[type].variants;
      if (!declared) continue;
      const covered = authoredVariantFixtures(type).map(
        (block) =>
          (block as unknown as { interaction: { type: string } }).interaction.type,
      );
      expect([...covered].sort(), type).toEqual([...declared].sort());
    }
  });

  it('every authored fixture re-parses against the schema Block union', () => {
    for (const type of registeredBlockTypes) {
      for (const block of authoredVariantFixtures(type)) {
        expect(() => Block.parse(block), type).not.toThrow();
      }
    }
  });
});

describe('realism (fixtures must carry answers worth stripping)', () => {
  it('every auto_gradable primary loses content to the sanitizer', () => {
    for (const type of registeredBlockTypes) {
      const authored = authoredBlockFixture(type);
      if (familyOf(authored) !== 'auto_gradable') continue;
      expect(
        wire(sanitizedBlockFixture(type)).length,
        `${type}: sanitize removed nothing — fixture has no answer key?`,
      ).toBeLessThan(wire(authored).length);
    }
  });

  it('no answer/correct/solution key survives in the sanitized document', () => {
    const served = wire(sanitizedFixtureDocument());
    for (const key of ['"answer"', '"acceptableAnswers"', '"correct"', '"solution"', '"key"']) {
      expect(served).not.toContain(key);
    }
  });
});

describe('pipeline honesty', () => {
  it('served ordering arrives permuted, membership intact', () => {
    const authoredItems = (
      authoredBlockFixture('ordering') as unknown as {
        items: Array<{ id: string }>;
      }
    ).items.map((item) => item.id);

    const served = servedFixtureDocument();
    const orderingBlock = served.sections
      .flatMap((s) => s.rows)
      .flatMap((r) => r.columns)
      .flatMap((c) => c.blocks)
      .find((b) => (b as { type?: string }).type === 'ordering') as unknown as {
      items: Array<{ id: string }>;
    };
    const servedItems = orderingBlock.items.map((item) => item.id);

    expect(servedItems).not.toEqual(authoredItems);
    expect([...servedItems].sort()).toEqual([...authoredItems].sort());
  });

  it('the pre-shuffle sanitized document keeps authored order (cacheable artifact)', () => {
    const authoredItems = (
      authoredBlockFixture('ordering') as unknown as {
        items: Array<{ id: string }>;
      }
    ).items.map((item) => item.id);
    const sanitizedBlock = sanitizedBlockFixture('ordering') as unknown as {
      items: Array<{ id: string }>;
    };
    expect(sanitizedBlock.items.map((item) => item.id)).toEqual(authoredItems);
  });
});

describe('determinism', () => {
  it('two authored builds are byte-identical', () => {
    expect(wire(authoredFixtureDocument())).toBe(wire(authoredFixtureDocument()));
  });

  it('two served builds under the same seed are byte-identical', () => {
    expect(wire(servedFixtureDocument())).toBe(
      wire(servedFixtureDocument(FIXTURE_SHUFFLE_SEED)),
    );
  });

  it('accessors return copies — mutating a fixture never poisons the cache', () => {
    const first = authoredBlockFixture('paragraph') as unknown as {
      content: unknown[];
    };
    first.content.length = 0;
    const second = authoredBlockFixture('paragraph') as unknown as {
      content: unknown[];
    };
    expect(second.content.length).toBeGreaterThan(0);
  });

  it('variant sanitized fixtures align one-to-one with authored variants', () => {
    for (const type of registeredBlockTypes) {
      expect(sanitizedVariantFixtures(type).length, type).toBe(
        authoredVariantFixtures(type).length,
      );
    }
  });
});
