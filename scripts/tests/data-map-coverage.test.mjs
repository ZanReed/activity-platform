// =============================================================================
// data-map-coverage.test.mjs — every person-referencing table is IN the data map
// -----------------------------------------------------------------------------
// WHY THIS EXISTS (drift audit, 2026-08-17). `docs/compliance/data-map.md`
// claims to document "where every piece of personal data lives", and it is read
// by counsel rather than by tests. It fell THREE migrations behind (0034–0036)
// and, worse, had been silently missing `class_activities.added_by` since 0030
// and `assignment_students.display_name` — a STUDENT NAME column — since 0001.
//
// The root cause was method, not diligence: earlier drafts were assembled by
// reading migration diffs, so a table nobody diffed stayed invisible. draft-3
// switched to sweeping the schema for person-referencing columns. This test is
// that sweep, turned into a mechanism — because "future regenerations should
// repeat the sweep" is a prose promise, and this repo has repeatedly learned
// (P8/P11) that a promise in prose guarding a compliance document is not a
// control.
//
// HOW IT WORKS, and its honest limit: it reads the MIGRATION SQL (through
// scripts/lib/migrations.mjs, the shared parser) for column
// names that name or reference a person, then asserts the data map mentions the
// owning table. It cannot see a column added outside a migration (a dashboard
// edit) — the same blind spot every md↔SQL pin in this repo has, and the reason
// `verify-*.sql` scripts check the LIVE schema separately. It deliberately
// asserts at TABLE granularity: column-level assertions would churn on every
// wording change, and the failure mode worth catching is "a whole table of
// personal data is undocumented", not "a cell was rephrased".
//
// WHEN THIS FAILS: add the table to data-map.md's Tables section (with its
// subject, source, purpose and retention), bump the doc's version stamp, and
// re-read whether retention-policy.md needs a row too. Do not add the table
// name to a skip list — the whole point is that the doc is the skip list.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO as repo, tableColumns, highestMigration } from '../lib/migrations.mjs';

const dataMap = readFileSync(join(repo, 'docs/compliance/data-map.md'), 'utf8');

/**
 * Columns that either NAME a person or point at one. `%_by` catches the
 * audit-trail family (added_by, graded_by, age_assertion_by) without listing
 * each; the explicit names cover the rest.
 */
const PERSON_COLUMN = new RegExp(
    String.raw`\b(student_id|teacher_id|owner_id|created_by|actor_id|user_id` +
        String.raw`|display_name|email|ip_hash|user_agent|timezone|\w+_by)\b`,
);

/**
 * Tables created by a migration, paired with their column block (the shared
 * parser, scripts/lib/migrations.mjs, comments excluded), so a table is only
 * flagged when one of ITS columns is person-referencing; plus `alter table X
 * add column <person col>` — how 0033 and 0036 added theirs.
 */
function tablesWithPersonColumns() {
    const found = new Set();
    const { created, added } = tableColumns();
    for (const { table, body } of created) if (PERSON_COLUMN.test(body)) found.add(table);
    for (const { table, column } of added) if (PERSON_COLUMN.test(column)) found.add(table);
    return found;
}

const tables = tablesWithPersonColumns();

test('the sweep finds the tables it is supposed to find (guard the guard)', () => {
    // P11: a coverage claim needs its own proof. If the regexes rot, the test
    // below would pass vacuously by finding nothing — these pin that it does
    // not. `assignment_students` is the case that motivated the whole test.
    for (const expected of ['users', 'section_checks', 'assignment_students', 'class_activities']) {
        assert.ok(
            tables.has(expected),
            `the person-column sweep stopped finding ${expected} — the regexes have rotted, ` +
                'and this test would otherwise pass by finding nothing (a vacuous guard)',
        );
    }
    assert.ok(tables.size >= 10, `sweep found only ${tables.size} tables; expected 10+`);
});

test('every table holding a person-referencing column appears in data-map.md', () => {
    const missing = [...tables].filter((t) => !dataMap.includes(t));
    assert.deepEqual(
        missing,
        [],
        `data-map.md does not mention ${missing.join(', ')} — it claims to document where every ` +
            'piece of personal data lives, and counsel reads it. Add the table (subject, source, ' +
            'purpose, retention), bump the version stamp, and check whether retention-policy.md ' +
            'needs a row. See CLAUDE.md: the compliance pack ships with the migration.',
    );
});

test('data-map.md states the migration range it mirrors, and it is current', () => {
    const claimed = dataMap.match(/Mirrors migrations 0001–\*\*(\d{4})\*\*/);
    assert.ok(claimed, 'data-map.md no longer states the migration range it mirrors');

    const highest = highestMigration();

    assert.equal(
        claimed[1],
        highest,
        `data-map.md claims to mirror through ${claimed[1]} but ${highest} exists. If ${highest} ` +
            'touched no personal-data column, say so explicitly in the header (0027 and 0035 are ' +
            'the precedent) and move the range forward — silence is how this doc fell three ' +
            'migrations behind.',
    );
});
