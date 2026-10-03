// =============================================================================
// drawable-roster.test.mjs — every Drawable kind is drawn by BOTH renderers
// (y7-figures-and-charts.md ER-5)
// -----------------------------------------------------------------------------
// The kit's board ends its drawable switch in `default: break`, so a kind it
// does not know draws NOTHING, silently — an angle mark on a graded figure
// would print on paper and vanish on screen. No unit harness loads JSXGraph
// (the eng review's C6), so this is the mechanical half of the proof: the
// kinds are read from the schema's Drawable union itself (never retyped,
// P4), and each must have a `case` in the static engine AND the board, and be
// admitted by the board's input filter (graph-question.ts readDrawables, which
// once lagged and dropped expression/ray from published figures).
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(repo, p), 'utf8');

/** The `kind` literals of every member of the Drawable discriminated union. */
function drawableKinds() {
  const src = read('packages/schema/src/graph-primitives.ts');
  const union = /export const Drawable = z\.discriminatedUnion\('kind', \[([\s\S]*?)\]\);/.exec(src);
  assert.ok(union, 'could not find the Drawable union');
  const members = union[1].split(',').map((m) => m.trim()).filter(Boolean);
  return members.map((name) => {
    const def = new RegExp(`const ${name} = z\\.object\\(\\{\\s*kind: z\\.literal\\('([a-z_]+)'\\)`).exec(src);
    assert.ok(def, `could not read the kind of ${name}`);
    return def[1];
  });
}

const KINDS = drawableKinds();

test('the roster is read from the schema, not retyped (and is non-trivial)', () => {
  // Guards the guard: an empty or truncated roster would make every row below
  // pass vacuously.
  assert.ok(KINDS.length >= 11, `only ${KINDS.length} kinds read: ${KINDS.join(', ')}`);
  assert.ok(KINDS.includes('point') && KINDS.includes('angle_mark'));
});

for (const [label, path] of [
  ['the static engine', 'packages/graph-kit/src/static-svg/graph-svg.ts'],
  ['the JSXGraph board', 'packages/graph-kit/src/board.ts'],
]) {
  test(`${label} has a case for every Drawable kind`, () => {
    const src = read(path);
    const missing = KINDS.filter((k) => !src.includes(`case '${k}'`));
    assert.deepEqual(missing, [], `${path} draws nothing for: ${missing.join(', ')}`);
  });
}

test("the board's input filter admits every Drawable kind", () => {
  const src = read('packages/graph-kit/src/graph-question.ts');
  const list = /const kinds = \[([\s\S]*?)\];/.exec(src);
  assert.ok(list, 'could not find readDrawables kinds list');
  const admitted = [...list[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
  const missing = KINDS.filter((k) => !admitted.includes(k));
  assert.deepEqual(missing, [], `readDrawables drops: ${missing.join(', ')}`);
});
