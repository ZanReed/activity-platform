// =============================================================================
// flow-field-readers.test.mjs — the flow modes cannot go back to being orphans
// -----------------------------------------------------------------------------
// Guard 7 of docs/design/activity-flow-modes.md, in the P1 family.
//
// The slice existed because SIX authored knobs described how an activity flows
// for a student and NOT ONE was read by anything: their implementations lived
// in `packages/renderer` and died with it at S9 Drop 4, while the declarations
// — schema, editor drawer, importer fence, format doc — all survived and went
// on describing behaviour in the present tense. That is this repo's most
// expensive defect class, and the flow fields are its largest single instance.
//
// ⚠ WHAT THIS IS AND IS NOT. It is a BACKSTOP, not the proof. Guards 1-5 in
// packages/viewer/tests/components/check-groups.test.tsx bind to RENDERED
// OUTPUT and are what actually prove a student can check every section; this
// is the cheap mechanical net that catches a field being quietly unwired
// again. Grep-level on purpose (root scripts carry zero dependencies), but
// COMMENT-STRIPPED before matching — without that, the tombstone comments this
// very slice wrote about `revisionMode` would satisfy the guard, which is the
// declaration-reading-a-declaration failure all over again.
//
// SCOPE IS NAMED, NEVER SKIP-LISTED (OV#17). This covers the FLOW fields, not
// every `meta` field: `skills` is legitimately editor-and-catalog-only and
// would go red on day one. A skip list is forbidden by the data-map precedent
// — the list becomes the thing people edit instead of the code — so the scope
// is stated here as a fixed roster and the roster is itself asserted against
// the schema, so a NEW flow field cannot join ActivityMeta unnoticed.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const viewerSrc = join(repo, 'packages/viewer/src');
const schemaPath = join(repo, 'packages/schema/src/document.ts');

/** Fields the VIEWER must read — each one drives student-visible behaviour. */
const MUST_BE_READ = ['isCheckpoint', 'submissionMode', 'activityType'];

/**
 * `answerFeedback` is the deliberate opposite, and this is the second half of
 * the guard rather than an exemption.
 *
 * R3/T2 DEFERRED `immediate` to its own slice: `on_check` is the only live
 * value and the viewer's correct behaviour is to read nothing at all. So the
 * assertion is inverted — the viewer must have NO reader — and it fails in
 * BOTH directions: red if someone re-orphans the wired fields, red if someone
 * starts reading this one without moving it into MUST_BE_READ and deleting
 * the "reserved, not active" copy from the editor, the importer and the
 * format doc. A deferral with no expiry mechanism is how `immediate` became
 * an orphan the first time.
 */
const MUST_NOT_BE_READ = ['answerFeedback'];

/** ⚰ Deleted in the slice (R4). Neither may come back as a schema field. */
const MUST_STAY_DELETED = ['revisionMode', 'gradingMode'];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'fixtures') continue; // fixtures author documents, never read them
      walk(full, out);
      continue;
    }
    if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

/** Strip // line comments and block comments, so a TOMBSTONE cannot count as a
 * reader. This is the difference between this guard and a plain grep. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const files = walk(viewerSrc).map((path) => ({
  path,
  code: stripComments(readFileSync(path, 'utf8')),
}));

/**
 * A READER is a PROPERTY ACCESS (`doc.meta.submissionMode`,
 * `section.isCheckpoint`), not a bare occurrence of the name.
 *
 * ⚠ THIS WAS A BARE-TOKEN MATCH FOR ONE DRAFT, AND THE MUTATION TEST CAUGHT
 * IT. Replacing `doc.meta.submissionMode ?? 'free'` with the literal `'free'`
 * — an unwiring that hands every student the default flow regardless of what
 * their teacher authored — left the guard GREEN, because `checkGroups.ts`
 * takes `submissionMode` as a PARAMETER and the token still appeared. A guard
 * satisfied by a parameter name is a guard reading a declaration, which is the
 * exact failure this file exists to catch. Property access is the cheapest
 * shape that means "something got this value off a document".
 */
const readersOf = (field) =>
  files
    .filter(({ code }) => new RegExp(`\\.\\s*${field}\\b`).test(code))
    .map(({ path }) => path.slice(repo.length + 1));

test('every wired flow field has a real reader under packages/viewer/src', () => {
  for (const field of MUST_BE_READ) {
    const readers = readersOf(field);
    assert.ok(
      readers.length > 0,
      `\`${field}\` has NO reader in packages/viewer/src outside comments — it is an ` +
        'ORPHAN again. Either wire it to rendered output (and add a guard bound ' +
        'to that output, not to this file), or delete the field. See ' +
        'docs/design/activity-flow-modes.md.',
    );
  }
});

test('answerFeedback is still unread — the R3 deferral has not silently ended', () => {
  for (const field of MUST_NOT_BE_READ) {
    const readers = readersOf(field);
    assert.deepEqual(
      readers,
      [],
      `\`${field}\` is now read by ${readers.join(', ')}, but the editor, the ` +
        'importer and docs/markdown-import-format.md all still say it is ' +
        '"reserved — not yet active". Finish the slice: move it into ' +
        'MUST_BE_READ here, delete the reserved copy from all three, and give ' +
        'it a guard bound to rendered output.',
    );
  }
});

test('revisionMode and gradingMode stay deleted from the schema', () => {
  const schema = stripComments(readFileSync(schemaPath, 'utf8'));
  for (const field of MUST_STAY_DELETED) {
    assert.ok(
      !new RegExp(`\\b${field}\\s*:`).test(schema),
      `\`${field}\` is back in packages/schema/src/document.ts. It was deleted ` +
        '2026-08-24 (R4) for reasons that have not changed: one had no referent ' +
        'without a submit, the other described something the server decides per ' +
        'block. Read the DECISIONS entry before re-adding either.',
    );
  }
});

test('the flow-field roster still covers every flow field ActivityMeta declares', () => {
  // The scope is NAMED rather than skip-listed (OV#17) — which only works if
  // the naming cannot silently fall behind. A new enum on ActivityMeta that
  // describes flow must be classified here, deliberately, by a human.
  const schema = stripComments(readFileSync(schemaPath, 'utf8'));
  const meta = /export const ActivityMeta = z\.object\(\{([\s\S]*?)\n\}\);/.exec(schema);
  assert.ok(meta, 'could not find ActivityMeta in packages/schema/src/document.ts');
  const declared = [...meta[1].matchAll(/^\s*(\w+)\s*:/gm)].map((m) => m[1]);

  // Everything ActivityMeta carries, classified once. The flow fields are
  // guarded above; the rest are named here with the reason they are not.
  const NOT_FLOW = {
    title: 'identity, not flow',
    course: 'catalog facet (0037)',
    unit: 'catalog facet',
    skills: 'editor + catalog only, deliberately (OV#17 names this one)',
    print: 'the print layer, guarded by the print e2e lane',
    typography: 'appearance, guarded by the typography component tests',
  };
  const classified = new Set([
    ...MUST_BE_READ,
    ...MUST_NOT_BE_READ,
    ...Object.keys(NOT_FLOW),
  ]);
  const unclassified = declared.filter((f) => !classified.has(f));
  assert.deepEqual(
    unclassified,
    [],
    `ActivityMeta declares ${unclassified.join(', ')}, which this guard has never ` +
      'heard of. If the field describes how an activity FLOWS for a student, add ' +
      'it to MUST_BE_READ (and wire it). If it does not, add it to NOT_FLOW with ' +
      'the reason. Do NOT add it to a skip list — the scope is named on purpose.',
  );
});
