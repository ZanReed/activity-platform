// =============================================================================
// kitSeam.test.ts — the viewer ↔ graph-kit seam stays typed (review C4)
// -----------------------------------------------------------------------------
// The three defects the 2026-11-26 review found in blocks/kitSurfaces.ts (a box
// plot stored as [], a restore that restored nothing, a lock nothing called)
// all sat behind `as never` and `as unknown as` on calls into the kit, where
// the compiler could not see them. The seam is now typed against the kit's own
// types and the kit's question mounts take those types instead of `unknown`.
//
// Types cannot be asserted at runtime, so this reads the source: a cast that
// defeats the check, or a mount parameter loosened back to `unknown`, fails
// here by name. The compiler does the real work; this keeps it switched on.
// =============================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const read = (relative: string): string =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

/** Source with comments removed, so prose about a cast is not read as one. */
const code = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// Every cast except `as const` and the two tuple literals the blocks build
// (`[v, 0] as [number, number]`), which narrow and cannot widen.
const CAST = /\bas\s+(?!const\b|\[number, number\])[A-Za-z_{(<'"[]/g;

// A switch that turns the compiler off, read from the RAW source: a
// `// @ts-ignore` is a comment, so the comment-stripped text cannot see it.
const ESCAPE = /@ts-ignore|@ts-expect-error|:\s*any\b/g;

const SEAM_FILES = [
  '../src/blocks/kitSurfaces.ts',
  '../src/blocks/InteractiveGraph.tsx',
  '../src/blocks/NumberLine.tsx',
  '../src/blocks/DataPlot.tsx',
] as const;

describe('the viewer ↔ graph-kit seam', () => {
  it.each(SEAM_FILES)('%s reaches the kit with no cast', (file) => {
    const found = code(read(file)).match(CAST) ?? [];
    expect(found, `casts in ${file}`).toEqual([]);
  });

  it.each(SEAM_FILES)('%s turns no type check off', (file) => {
    const found = read(file).match(ESCAPE) ?? [];
    expect(found, `type-check escapes in ${file}`).toEqual([]);
  });

  it('the escape pattern is live', () => {
    for (const old of [
      '// @ts-ignore',
      '// @ts-expect-error the kit wants a tuple',
      'function f(x: any) {}',
      'const v:any = 1',
    ]) {
      expect(old.match(ESCAPE), old).not.toBeNull();
    }
    expect('const anyway = company'.match(ESCAPE)).toBeNull();
    expect('{ many: 1 }'.match(ESCAPE)).toBeNull();
  });

  it('the cast pattern is live: it finds the casts this file used to carry', () => {
    // P3: a pattern that can match nothing would pass for ever.
    for (const old of [
      'handle.restore(values as never)',
      'resp as unknown as Record<string, unknown>',
      'block.interaction as { start?: unknown } | undefined',
      'block as Parameters<typeof stimulusDrawables>[0]',
    ]) {
      expect(old.match(CAST), old).not.toBeNull();
    }
    expect('const X = [1] as const'.match(CAST)).toBeNull();
    expect('[v, 0] as [number, number]'.match(CAST)).toBeNull();
  });

  it("the kit's question mounts take their config type, never `unknown`", () => {
    const mounts: Array<[file: string, name: string, type: string]> = [
      ['graph-question.ts', 'mountGraphQuestion', 'GraphQuestionConfig'],
      ['graph-question.ts', 'mountGraphSystemQuestion', 'GraphQuestionConfig'],
      ['graph-question.ts', 'mountGraphFunctionSystemQuestion', 'GraphQuestionConfig'],
      ['number-line-question.ts', 'mountNumberLineQuestion', 'NumberLineQuestionConfig'],
      ['data-plot-question.ts', 'mountDataPlotQuestion', 'DataPlotQuestionConfig'],
      ['calculator.ts', 'mountCalculator', 'CalculatorConfig'],
    ];
    for (const [file, name, type] of mounts) {
      const source = read(`../../graph-kit/src/${file}`);
      const signature = new RegExp(
        `export (?:async )?function ${name}\\(\\s*mount: HTMLElement,\\s*rawConfig\\??: (\\w+),`,
      ).exec(source);
      expect(signature?.[1], `${name}'s config parameter`).toBe(type);
    }
  });

  it('a seam config cannot carry an answer key', () => {
    const source = code(read('../src/blocks/kitSurfaces.ts'));
    expect(source).toMatch(
      /GraphSurfaceConfig = Omit<GraphQuestionConfig, 'answerKey' \| 'noSolutionCorrect'>/,
    );
    expect(source).toMatch(/NumberLineSurfaceConfig = Omit<NumberLineQuestionConfig, 'answerKey'>/);
    expect(source).toMatch(/DataPlotSurfaceConfig = Omit<DataPlotQuestionConfig, 'answerKey'>/);
    // And no mount call in the seam names one.
    expect(source).not.toMatch(/answerKey\s*:/);
  });
});
