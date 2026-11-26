// =============================================================================
// kitBarrel.test.ts — the viewer never imports the graph-kit BARREL (review D1)
// -----------------------------------------------------------------------------
// `@activity/graph-kit` (src/index.ts) re-exports the math-prompt mount, the
// scorers and the legacy runtime, so one import of it puts MathLive and mathjs
// on every graph, number line and data plot a student opens. Until 2026-11-26
// all five kit seams and the preload did exactly that. The viewer imports
// SUBPATHS from the package's `exports` map instead; add one rather than reach
// through the barrel.
//
// This is the source half of the guard and deliberately simple: ANY quoted
// bare specifier counts (a value import, `import type`, `export … from`, a
// dynamic import, a vi.mock in src), so there is no "type-only is fine"
// exception to reason about. The half that matters to a student is checked on
// the BUILT chunks: scripts/perf-budgets.mjs → STUDENT_KIT_JOURNEYS forbids
// MathLive and mathjs where they are not used.
// =============================================================================

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC = fileURLToPath(new URL('../src', import.meta.url));

/** The bare package name in quotes: `'@activity/graph-kit'`, never a subpath. */
const BARREL_SPECIFIER = /(['"`])@activity\/graph-kit\1/;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (/\.(ts|tsx|mts|js|mjs)$/.test(name)) out.push(path);
  }
  return out;
}

describe('the viewer imports graph-kit by subpath only', () => {
  it('the scan is not vacuous: it sees the files that use subpaths', () => {
    const files = sourceFiles(SRC);
    const subpathUsers = files.filter((f) =>
      /@activity\/graph-kit\/[a-z-]+/.test(readFileSync(f, 'utf8')),
    );
    expect(subpathUsers.map((f) => relative(SRC, f))).toContain('blocks/kitSurfaces.ts');
  });

  it('no file under packages/viewer/src names the barrel', () => {
    const offenders = sourceFiles(SRC)
      .filter((f) => BARREL_SPECIFIER.test(readFileSync(f, 'utf8')))
      .map((f) => relative(SRC, f));
    expect(
      offenders,
      'import a subpath from packages/graph-kit/package.json "exports" instead ' +
        '(the barrel carries MathLive and mathjs; review D1)',
    ).toEqual([]);
  });

  it('the pattern matches the barrel and not a subpath', () => {
    expect(BARREL_SPECIFIER.test(`import('@activity/graph-kit')`)).toBe(true);
    expect(BARREL_SPECIFIER.test(`from "@activity/graph-kit";`)).toBe(true);
    expect(BARREL_SPECIFIER.test(`from '@activity/graph-kit/graph-question'`)).toBe(false);
  });
});
