import { describe, expect, it } from 'vitest';
import { InteractiveGraphBlock, createInteractiveGraphBlock } from '../src/index.js';

describe('InteractiveGraphBlock.stimulus (graded stimuli)', () => {
  it('defaults to an empty list, so every stored graph still parses', () => {
    const { stimulus: _dropped, ...older } = createInteractiveGraphBlock();
    void _dropped;
    const parsed = InteractiveGraphBlock.parse(older);
    expect(parsed.stimulus).toEqual([]);
    expect(parsed.stimulusAlt).toBeUndefined();
  });

  it('holds shapes and marks beside a graded answer, with a description', () => {
    const block = {
      ...createInteractiveGraphBlock(),
      stimulus: [
        { kind: 'point', at: [1, 1], label: 'A' },
        { kind: 'polygon', vertices: [[1, 1], [4, 1], [2, 4]], filled: false },
        { kind: 'angle_mark', at: [1, 1], from: [4, 1], to: [2, 4], style: 'arc' },
        { kind: 'curve', model: { family: 'vertical', x: 0, xTolerance: 0.1 }, style: 'dashed' },
      ],
      stimulusAlt: 'Triangle ABC and a vertical mirror line',
    };
    const parsed = InteractiveGraphBlock.parse(block);
    expect(parsed.stimulus.map((d) => d.kind)).toEqual(['point', 'polygon', 'angle_mark', 'curve']);
    expect(parsed.stimulusAlt).toBe('Triangle ABC and a vertical mirror line');
  });

  it('refuses something that is not a drawable', () => {
    expect(
      InteractiveGraphBlock.safeParse({ ...createInteractiveGraphBlock(), stimulus: [{ kind: 'blob' }] }).success,
    ).toBe(false);
  });
});
