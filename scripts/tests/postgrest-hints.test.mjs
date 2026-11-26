// =============================================================================
// postgrest-hints.test.mjs — every PostgREST embed hint names a real constraint
// -----------------------------------------------------------------------------
// `activity_versions!<name>(…)` tells PostgREST which foreign key to join on.
// A name that matches no constraint is refused with a 400 (PGRST200) on the
// live API, and nothing local notices: the unit tests stub supabase-js, and
// the stub lanes never reach PostgREST. That happened (found in the live logs
// 2026-11-12): `listPublishedActivities` asked for
// `activities_current_version_id_fkey`, but 0001 names the key
// `activities_current_version_fk`. The class page's activities panel loads it
// alongside the class's own list (Promise.all), so the whole panel showed its
// error state.
//
// The sweep reads every hint in the app and viewer source and requires it to
// be a constraint a migration creates by name (`constraint <name>`, comments
// excluded — the shared parser, scripts/lib/migrations.mjs). Join-type
// modifiers (`!inner`, `!left`) are not hints.
//
// (Was packages/app/src/__tests__/postgrestHints.test.ts until review C1
// slice 2 moved every migration reader onto the shared parser, 2026-11-26.)
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { REPO, constraintNames } from '../lib/migrations.mjs';

const SOURCES = ['packages/app/src', 'packages/viewer/src'];
const JOIN_TYPES = new Set(['inner', 'left']);

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : files(path);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

const constraints = constraintNames();
const hints = SOURCES.flatMap((dir) =>
  files(join(REPO, dir)).flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(/\b([a-z_][a-z0-9_]*)!([a-z_][a-z0-9_]*)\(/g)]
      .filter((m) => !JOIN_TYPES.has(m[2]))
      .map((m) => ({ file: relative(REPO, file), table: m[1], hint: m[2] })),
  ),
);

test('the sweep finds the hints it exists for (not vacuous)', () => {
  assert.ok(hints.some((h) => h.hint === 'activities_current_version_fk'));
  assert.ok(constraints.has('activities_current_version_fk'));
});

test('every embed hint names a constraint a migration creates', () => {
  const missing = hints.filter((h) => !constraints.has(h.hint)).map((h) => `${h.file}: ${h.table}!${h.hint}`);
  assert.deepEqual(missing, [], `no migration creates these constraints:\n${missing.join('\n')}`);
});
