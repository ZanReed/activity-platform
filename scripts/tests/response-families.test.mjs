// =============================================================================
// response-families.test.mjs — one list of response families, everywhere
// (review 2026-11-26, C6)
// -----------------------------------------------------------------------------
// A section's stored responses are one JSON map per FAMILY (blanks, choices,
// …). The house rule gives every new response category its own map (CLAUDE.md:
// never widen BlankResponse.answer), so this list grows, and it is written in
// three kinds of place:
//   • the viewer's RESPONSE_CATEGORIES (store/store.ts) — the canonical list:
//     it `satisfies` keyof SectionResponses, so the compiler holds each name;
//   • the app's ANSWER_FAMILIES (lib/answerText.ts), the teacher-side copy;
//   • the viewer's hand-summed lists: check-activity's item ceiling
//     (`countItems`, every family) and the two "marked ids" lists
//     (`markedIdsSent`, the mock's `gradableItemIds`: every family a check
//     marks, i.e. all but the RECORDED ones);
//   • SQL: live database functions that find an item's family by walking an
//     `array['blanks', 'choices', …]` literal.
// This pins all of them to the canonical list, in order (the SQL takes the
// FIRST family holding an item id, so order is behaviour). The SQL half reads
// only the LIVE body of each function, through the shared migration parser
// (scripts/lib/migrations.mjs, review C1) — a superseded body is not checked,
// and a restated function is found under its new file.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO, functions, functionBody, readMigrations } from '../lib/migrations.mjs';

function tsList(file, name) {
  const src = readFileSync(resolve(REPO, file), 'utf8');
  const m = src.match(new RegExp(`export const ${name}\\b[^=]*=\\s*\\[([^\\]]*)\\]`));
  assert.ok(m, `${file} exports ${name} as a literal array`);
  return [...m[1].matchAll(/'([A-Za-z]+)'/g)].map((x) => x[1]);
}

const CANONICAL = tsList('packages/viewer/src/store/store.ts', 'RESPONSE_CATEGORIES');

// Families a check RECORDS for the teacher and never marks (the grader's
// free-text and photo inventories, viewer server/grading/walk.ts). Cross-
// checked below against the two lists that leave them out on purpose.
const RECORDED = ['freeText', 'photos'];

// The live functions known to hold a family array. Pinned by NAME, not by a
// count: a third function in a spelling familyArrays cannot read would not
// lower a count, but the tripwire below names it.
const SQL_HOLDERS = ['activity_first_tries', 'class_misconceptions'];

function sourceOf(file, startPattern) {
  const src = readFileSync(resolve(REPO, file), 'utf8');
  const at = src.search(startPattern);
  assert.ok(at >= 0, `${file}: ${startPattern} not found`);
  // Up to the first line that closes a top-level block.
  const end = src.indexOf('\n}', at);
  return src.slice(at, end < 0 ? undefined : end);
}
const namesIn = (text, re) => [...new Set([...text.matchAll(re)].map((m) => m[1]))];

// ⚠ TRACKED EXPECTED GAP — TODOS.md → "SQL response-family arrays miss
// `photos` (review C6)". Families the SQL arrays are KNOWN to lack today.
// Inert for now: all three functions only look at items with a judged verdict
// (`incorrect`, or `correct`/`incorrect`), and a photo is recorded, never
// judged. Pinned exactly: the day a migration adds `photos` the row below goes
// red and this entry must be deleted; a NEW family left out of the SQL is red
// at once.
const KNOWN_SQL_GAP = ['photos'];

// Every array literal in a body that names at least two families.
function familyArrays(body) {
  const out = [];
  for (const m of body.matchAll(/array\s*\[([^\]]*)\]/gi)) {
    const items = [...m[1].matchAll(/'([A-Za-z]+)'/g)].map((x) => x[1]);
    if (items.filter((i) => CANONICAL.includes(i)).length >= 2) out.push(items);
  }
  return out;
}

function liveFamilyArrays() {
  const found = [];
  for (const defs of functions().live.values()) {
    for (const def of defs) {
      for (const list of familyArrays(functionBody(def))) {
        found.push({ where: `${def.name} (${def.file}:${def.line})`, list });
      }
    }
  }
  return found;
}

test('anti-vacuity: the canonical list is read and non-trivial', () => {
  assert.ok(CANONICAL.length >= 8, `RESPONSE_CATEGORIES read as ${JSON.stringify(CANONICAL)}`);
  assert.ok(CANONICAL.includes('blanks') && CANONICAL.includes('photos'));
});

test("the app's ANSWER_FAMILIES is the viewer's RESPONSE_CATEGORIES, in order", () => {
  assert.deepEqual(tsList('packages/app/src/lib/answerText.ts', 'ANSWER_FAMILIES'), CANONICAL);
});

test('the pinned functions, and only they, carry a family array', () => {
  const holders = [...new Set(liveFamilyArrays().map((f) => f.where.split(' ')[0]))].sort();
  assert.deepEqual(holders, [...SQL_HOLDERS].sort());
});

// Any other way of spelling the list ('{blanks,choices}'::text[], an IN
// list, a CASE chain, VALUES rows, dollar-quoted strings) is invisible to
// familyArrays. Tripwire: a live body naming three or more families as quoted
// tokens must be one of the holders, or it gets read by hand and added.
test('no other live function spells three or more families', () => {
  const offenders = [];
  for (const defs of functions().live.values()) {
    for (const def of defs) {
      if (SQL_HOLDERS.includes(def.name)) continue;
      const body = functionBody(def);
      const tokens = new Set([
        ...[...body.matchAll(/'([A-Za-z]+)'/g)].map((m) => m[1]),
        ...[...body.matchAll(/\$(\w*)\$([A-Za-z]+)\$\1\$/g)].map((m) => m[2]),
        ...[...body.matchAll(/'\{([^}']*)\}'/g)].flatMap((m) => m[1].split(/[\s,"]+/)),
      ]);
      const named = CANONICAL.filter((f) => tokens.has(f));
      if (named.length >= 3) offenders.push(`${def.name} (${def.file}:${def.line}): ${named.join(', ')}`);
    }
  }
  assert.deepEqual(offenders, []);
});

// The shared parser (scripts/lib/migrations.mjs) reads `public.` functions
// only, so a function in another schema would escape every check above.
test('every migration function is in the public schema (the parser sees them all)', () => {
  const outside = [];
  for (const { file, sql } of readMigrations()) {
    for (const m of sql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+"?([a-z_0-9]+)"?\s*\.\s*"?[a-z_0-9]+/gi)) {
      if (m[1].toLowerCase() !== 'public') outside.push(`${file}: ${m[0]}`);
    }
  }
  assert.deepEqual(outside, []);
});

test("check-activity's item ceiling counts every family", () => {
  const body = sourceOf('packages/viewer/src/server/check-activity-handler.ts', /function countItems\(/);
  assert.deepEqual(namesIn(body, /responses\.([A-Za-z]+)\b/g).sort(), [...CANONICAL].sort());
});

test('the two marked-id lists are every family but the recorded ones', () => {
  const marked = CANONICAL.filter((f) => !RECORDED.includes(f)).sort();
  for (const f of RECORDED) assert.ok(CANONICAL.includes(f), `${f} is a family`);
  const sent = sourceOf('packages/viewer/src/container/ViewerContainer.tsx', /function markedIdsSent\(/);
  const destructured = sent.match(/const \{([^}]*)\} = items/);
  assert.ok(destructured, 'markedIdsSent destructures its families');
  assert.deepEqual(namesIn(destructured[1], /([A-Za-z]+)/g).sort(), marked, 'markedIdsSent');
  const mock = sourceOf('packages/viewer/src/check/mock.ts', /const gradableItemIds = /);
  assert.deepEqual(namesIn(mock.split('];')[0], /responses\.([A-Za-z]+)\b/g).sort(), marked, 'mock gradableItemIds');
});

test('every live SQL family array is the canonical list, in order, less the known gap', () => {
  const expected = CANONICAL.filter((f) => !KNOWN_SQL_GAP.includes(f));
  for (const { where, list } of liveFamilyArrays()) {
    assert.deepEqual(list, expected, `${where} lists ${JSON.stringify(list)}`);
  }
});

test('every KNOWN_SQL_GAP entry is a real family', () => {
  for (const f of KNOWN_SQL_GAP) assert.ok(CANONICAL.includes(f), f);
});
