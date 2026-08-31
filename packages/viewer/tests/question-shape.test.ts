// =============================================================================
// question-shape.test.ts — the sanitizer's one ADDITIVE step
// -----------------------------------------------------------------------------
// `deriveQuestionShape` is the only place the sanitizer adds a field instead of
// removing one, in the component whose entire job is withholding — so it gets
// its own suite, and the suite is weighted toward what must NEVER come out.
//
// The safety argument is structural, not a promise about the code: every value
// passes a whitelist (small positive integers; a closed family enum), so a
// coordinate cannot travel this path even if a future edit tried to send one.
// The tests below attack that whitelist directly rather than only checking the
// happy path — a derive step that is merely "written carefully" is one edit
// away from being the leak the other 44 tests exist to catch.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { blockRegistry, registeredBlockTypes, sanitizeBlock } from '../src/index.js';
import { deriveQuestionShape } from '../src/sanitize/sanitize.js';
import { authoredVariantFixtures } from '../src/fixtures/index.js';

const COORD = 133742.4217; // a coordinate-shaped value; must never survive

const graphBlock = (interaction: Record<string, unknown>) => ({
  id: 'g1',
  type: 'interactive_graph',
  interaction,
});

describe('what it derives (question shape the student already sees)', () => {
  it('handle count from the number of authored target points', () => {
    expect(
      deriveQuestionShape(
        graphBlock({
          type: 'plot_point',
          correctPoints: [
            [1, 2],
            [3, 4],
          ],
          tolerance: 0.5,
        }),
      ),
    ).toEqual({ handleCount: 2 });
  });

  it('curve family from the authored model', () => {
    expect(
      deriveQuestionShape(
        graphBlock({
          type: 'plot_function',
          models: [{ family: 'quadratic', a: COORD, b: COORD, c: COORD }],
        }),
      ),
    ).toEqual({ family: 'quadratic' });
  });

  it('the polynomial families pass the whitelist (cubic, quartic)', () => {
    for (const family of ['cubic', 'quartic']) {
      expect(
        deriveQuestionShape(
          graphBlock({
            type: 'plot_function',
            models: [{ family, a: COORD, b: COORD, c: COORD, d: COORD, e: COORD }],
          }),
        ),
      ).toEqual({ family });
    }
  });

  it('family from an inequality’s boundary', () => {
    expect(
      deriveQuestionShape(
        graphBlock({
          type: 'graph_inequality',
          inequalities: [
            { boundary: { family: 'linear', slope: COORD }, strict: true },
          ],
        }),
      ),
    ).toEqual({ family: 'linear' });
  });

  it('vertex count for a shaded region', () => {
    expect(
      deriveQuestionShape(
        graphBlock({
          type: 'shade_region',
          regions: [
            {
              correctVertices: [
                [0, 0],
                [COORD, 0],
                [0, COORD],
              ],
            },
          ],
        }),
      ),
    ).toEqual({ vertexCount: 3 });
  });

  it('says nothing for a display-mode graph (it takes no input)', () => {
    expect(
      deriveQuestionShape(
        graphBlock({ type: 'display', drawables: [{ kind: 'point', at: [1, 1] }] }),
      ),
    ).toBeUndefined();
  });

  it('says nothing when there is nothing to say', () => {
    expect(deriveQuestionShape(graphBlock({ type: 'plot_point' }))).toBeUndefined();
    expect(deriveQuestionShape({ id: 'p', type: 'paragraph' })).toBeUndefined();
  });
});

describe('the whitelist (what must never come out)', () => {
  it('emits ONLY count and family keys — never a coordinate container', () => {
    const shape = deriveQuestionShape(
      graphBlock({
        type: 'plot_point',
        correctPoints: [[COORD, COORD]],
        tolerance: COORD,
      }),
    )!;
    expect(Object.keys(shape).sort()).toEqual(['handleCount']);
    expect(JSON.stringify(shape)).not.toContain(String(COORD));
  });

  it('drops a non-integer, negative, or absurd count', () => {
    // A count is derived from .length so it is always a safe integer today;
    // the whitelist is what keeps that true after a future edit.
    for (const bad of [0, -3, 2.5, Number.NaN, Number.POSITIVE_INFINITY, 1e6]) {
      const shape = deriveQuestionShape(
        graphBlock({ type: 'plot_point', correctPoints: { length: bad } }),
      );
      expect(shape?.handleCount, String(bad)).toBeUndefined();
    }
  });

  it('drops an unknown family rather than passing it through', () => {
    const shape = deriveQuestionShape(
      graphBlock({
        type: 'plot_function',
        models: [{ family: 'y = 3x + 4 (the actual answer)' }],
      }),
    );
    expect(shape).toBeUndefined();
  });

  it('drops a family that is not a string at all', () => {
    for (const bad of [42, null, { family: 'linear' }, ['linear']]) {
      expect(
        deriveQuestionShape(
          graphBlock({ type: 'plot_function', models: [{ family: bad }] }),
        ),
      ).toBeUndefined();
    }
  });

  it('never carries tolerance, coefficients, or coordinates from a fully-loaded key', () => {
    const shape = deriveQuestionShape(
      graphBlock({
        type: 'plot_function',
        models: [{ family: 'linear', slope: COORD, intercept: COORD }],
        domains: [{ min: COORD, max: COORD }],
        tolerance: COORD,
        correctPoints: [[COORD, COORD]],
      }),
    )!;
    const wire = JSON.stringify(shape);
    expect(wire).not.toContain(String(COORD));
    for (const secret of ['slope', 'intercept', 'tolerance', 'correctPoints', 'domains']) {
      expect(wire).not.toContain(secret);
    }
  });
});

describe('integration with sanitizeBlock', () => {
  it('attaches the shape to served graph blocks, with the key gone', () => {
    for (const type of ['interactive_graph', 'number_line'] as const) {
      for (const authored of authoredVariantFixtures(type)) {
        const interaction = (authored as unknown as {
          interaction: { type: string };
        }).interaction;
        const served = sanitizeBlock(authored) as unknown as {
          questionShape?: Record<string, unknown>;
          interaction: Record<string, unknown>;
        };
        // Display instances take no input and get no shape.
        if (interaction.type === 'display') {
          expect(served.questionShape, type).toBeUndefined();
          continue;
        }
        // Whatever it derived, the key itself is gone.
        expect(served.interaction.correctPoints, type).toBeUndefined();
        expect(served.interaction.tolerance, type).toBeUndefined();
        expect(served.interaction.models, type).toBeUndefined();
      }
    }
  });

  it('adds NOTHING to blocks that did not declare the derivation', () => {
    for (const type of registeredBlockTypes) {
      if (blockRegistry[type].sanitize.deriveQuestionShape) continue;
      for (const authored of authoredVariantFixtures(type)) {
        const served = sanitizeBlock(authored) as unknown as Record<string, unknown>;
        expect(served.questionShape, type).toBeUndefined();
      }
    }
  });

  it('only the graph family declares it (a new declaration is a deliberate act)', () => {
    const declaring = registeredBlockTypes.filter(
      (type) => blockRegistry[type].sanitize.deriveQuestionShape,
    );
    expect(declaring.sort()).toEqual([
      'data_plot',
      'interactive_graph',
      'number_line',
    ]);
  });
});
