// =============================================================================
// postgrestHints.test.ts — every PostgREST embed hint names a real constraint
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
// be a constraint a migration creates by name (`constraint <name>`). Join-type
// modifiers (`!inner`, `!left`) are not hints.
// =============================================================================

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const SOURCES = ['packages/app/src', 'packages/viewer/src'];
const JOIN_TYPES = new Set(['inner', 'left']);

function files(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return name === '__tests__' ? [] : files(path);
        return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
    });
}

const migrations = readdirSync(join(ROOT, 'supabase/migrations'))
    .filter((f) => f.endsWith('.sql'))
    .map((f) => readFileSync(join(ROOT, 'supabase/migrations', f), 'utf8'))
    .join('\n');
const constraints = new Set([...migrations.matchAll(/\bconstraint\s+([a-z_][a-z0-9_]*)/gi)].map((m) => m[1]!.toLowerCase()));

const hints = SOURCES.flatMap((dir) =>
    files(join(ROOT, dir)).flatMap((file) =>
        [...readFileSync(file, 'utf8').matchAll(/\b([a-z_][a-z0-9_]*)!([a-z_][a-z0-9_]*)\(/g)]
            .filter((m) => !JOIN_TYPES.has(m[2]!))
            .map((m) => ({ file: file.slice(ROOT.length), table: m[1]!, hint: m[2]! })),
    ),
);

describe('PostgREST embed hints', () => {
    it('the sweep finds the hints it exists for (not vacuous)', () => {
        expect(hints.some((h) => h.hint === 'activities_current_version_fk')).toBe(true);
        expect(constraints.has('activities_current_version_fk')).toBe(true);
    });

    it.each(hints.map((h) => [`${h.file}: ${h.table}!${h.hint}`, h.hint] as const))(
        '%s names a constraint a migration creates',
        (_label, hint) => {
            expect(constraints.has(hint), `no migration creates "constraint ${hint}"`).toBe(true);
        },
    );
});
