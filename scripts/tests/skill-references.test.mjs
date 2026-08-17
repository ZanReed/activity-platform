// =============================================================================
// skill-references.test.mjs — project skills may not cite files that don't exist
// -----------------------------------------------------------------------------
// WHY THIS EXISTS (2026-08-17). `.claude/skills/drift-audit/SKILL.md` — the
// skill whose entire job is catching docs that describe deleted code — spent
// three days citing `packages/renderer`, `packages/renderer/RUNTIME.md`,
// `ingest-submission`, `bundle:renderer` and `_shared/graph-kit-manifest.ts`,
// all removed at S9 Drop 4 / the D-13 teardown. Three of its eight checklist
// sections pointed at nothing.
//
// That is worse than a stale comment. A checklist section with no target does
// not fail — it reports "clean", every time, forever. The rot was found only
// because one audit happened to read the checklist against the repo first.
//
// The rewritten skill opens with a §0 telling the next agent to verify its own
// references before running. This test is that instruction as a mechanism,
// because "the next agent should check" is exactly the prose promise this repo
// keeps having to convert (P8: review-time promises go on a tracked checklist,
// never only in prose).
//
// SCOPE, and why it is narrow on purpose: only repo-relative paths that look
// like real source references (a slash, a known top-level dir prefix) are
// checked. Prose nouns, shell fragments, npm script names, and anything inside
// a ⚰-marked "dead, do not look for" line are skipped — a skill legitimately
// NAMES dead things in order to tell you not to hunt for them, and failing on
// that would make tombstones unwritable.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const skillsDir = join(repo, '.claude/skills');

/** Top-level dirs a skill can legitimately point at. */
const ROOTS = ['packages/', 'scripts/', 'supabase/', 'docs/', '.github/', '.claude/'];

/** A line that deliberately names something dead is not a broken reference. */
const TOMBSTONE = /⚰|\bdeleted\b|\bdead\b|\bdo not look for\b|\bretired\b|\bremoved at\b|\bdied\b/i;

function skillFiles() {
    if (!existsSync(skillsDir)) return [];
    return readdirSync(skillsDir)
        .map((name) => join(skillsDir, name, 'SKILL.md'))
        .filter((p) => existsSync(p) && statSync(p).isFile());
}

/**
 * Pull `backticked/paths.ext` out of prose, line by line, so a tombstone line's
 * references can be excluded without losing the rest of the file.
 */
function liveReferences(md) {
    const refs = new Set();
    for (const line of md.split('\n')) {
        if (TOMBSTONE.test(line)) continue;
        for (const [, ref] of line.matchAll(/`([^`\s]+\/[^`\s]*)`/g)) {
            const clean = ref.replace(/[.,;:)]+$/, '');
            if (ROOTS.some((r) => clean.startsWith(r))) refs.add(clean);
        }
    }
    return refs;
}

const files = skillFiles();

test('there is at least one project skill to check (guard the guard)', () => {
    // P11: without this, a moved skills directory would make every assertion
    // below pass by iterating nothing — the exact vacuity this test exists for.
    assert.ok(files.length > 0, 'no .claude/skills/*/SKILL.md found — has the skills dir moved?');
});

for (const file of files) {
    const rel = file.slice(repo.length + 1);
    test(`${rel} cites only paths that exist`, () => {
        const refs = [...liveReferences(readFileSync(file, 'utf8'))];
        // A glob (`docs/design/*.md`) is a legitimate reference; what can rot
        // under it is the DIRECTORY, so check that instead of the literal.
        // Caught on this test's own first run, which is the argument for
        // running a new guard before trusting it.
        const broken = refs.filter((r) => {
            const target = r.includes('*') ? dirname(r) : r;
            return !existsSync(join(repo, target));
        });
        assert.deepEqual(
            broken,
            [],
            `${rel} points at ${broken.join(', ')}, which do not exist. A checklist section whose ` +
                'target was deleted does not fail loudly — it reports "clean" forever. Either fix ' +
                'the reference, or mark the line as a tombstone (⚰ / "deleted" / "do not look ' +
                'for") if the skill is deliberately naming something dead.',
        );
    });
}
