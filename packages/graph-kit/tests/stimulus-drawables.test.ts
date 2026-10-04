// Graded stimuli: what a graded graph shows WITH its question, as one function
// both the live board and the print twin read (graph-svg.ts).
import { describe, expect, it } from 'vitest';
import { questionDrawables, renderGraphSvg, stimulusDrawables } from '../src/static-svg.js';

const AXIS = { xMin: -6, xMax: 6, yMin: -6, yMax: 6, xGridStep: 1, yGridStep: 1, showGrid: true, snapToGrid: true };
const tri = [
  { kind: 'point', at: [1, 1], label: 'A' },
  { kind: 'polygon', vertices: [[1, 1], [4, 1], [2, 4]], filled: false },
  { kind: 'curve', model: { family: 'vertical', x: 0, xTolerance: 0.1 }, style: 'dashed' },
] as never[];

describe('stimulusDrawables', () => {
  it('defaults an uncoloured shape to slate, never the student\'s blue', () => {
    const out = stimulusDrawables({ stimulus: tri }) as { color?: string }[];
    expect(out.map((d) => d.color)).toEqual(['slate', 'slate', 'slate']);
  });

  it('an authored colour wins', () => {
    const out = stimulusDrawables({
      stimulus: [{ kind: 'point', at: [1, 1], color: 'red' }] as never[],
    }) as { color?: string }[];
    expect(out[0]!.color).toBe('red');
  });

  it('marks and labels are left to take their shape\'s colour', () => {
    const out = stimulusDrawables({
      stimulus: [
        { kind: 'side_label', from: [1, 1], to: [4, 1], text: '3' },
        { kind: 'tick_mark', from: [1, 1], to: [4, 1], count: 1 },
      ] as never[],
    }) as { color?: string }[];
    expect(out.every((d) => d.color === undefined)).toBe(true);
  });

  it('is empty for a block with no stimulus', () => {
    expect(stimulusDrawables({})).toEqual([]);
    expect(stimulusDrawables({ stimulus: [] })).toEqual([]);
  });
});

describe('questionDrawables — what the STUDENT sheet shows', () => {
  it('a graded question shows its stimulus and nothing else', () => {
    const q = questionDrawables({ interaction: { type: 'plot_point' }, stimulus: tri });
    expect(q.map((d) => d.kind)).toEqual(['point', 'polygon', 'curve']);
  });

  it('a question with no stimulus still prints empty axes', () => {
    expect(questionDrawables({ interaction: { type: 'plot_point' } })).toEqual([]);
  });

  it('transform_curve shows the stimulus, then its start curve', () => {
    const start = { family: 'linear', slope: 1, intercept: 0, slopeTolerance: 0.1, interceptTolerance: 0.1 } as never;
    const q = questionDrawables({ interaction: { type: 'transform_curve', start }, stimulus: tri });
    expect(q).toHaveLength(4);
    expect(q[3]).toMatchObject({ kind: 'curve', style: 'dashed' });
  });

  it('a display graph ignores the field: its picture is its own drawables', () => {
    expect(questionDrawables({ interaction: { type: 'display' }, stimulus: tri })).toEqual([]);
  });

  it('the printed svg counts the stimulus and draws it in slate', () => {
    const svg = renderGraphSvg(AXIS as never, questionDrawables({ interaction: { type: 'plot_point' }, stimulus: tri }), 'u');
    expect(svg).toContain('data-drawables="3"');
    expect(svg).toContain('#475569'); // DRAWABLE_PALETTE.slate
    expect(svg).not.toContain('#2563eb'); // never the student's blue
  });
});
