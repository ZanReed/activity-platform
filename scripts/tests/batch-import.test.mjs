// =============================================================================
// batch-import.test.mjs — the batch importer's guards
// -----------------------------------------------------------------------------
// Plan + rulings: docs/design/batch-importer.md (eng review 2026-08-20, D1–D5).
//
// THE LOAD-BEARING TEST IS §A, AND IT IS BOUND TO OUTPUT.
//
// The brief this slice started from asserted "the conversion path is DOM-free
// (verified)". It was not. `lib/markdownToTiptap.ts` imported the
// `@activity/graph-kit` BARREL, which statically re-exports four modules that
// import `MathfieldElement` from mathlive — a symbol mathlive's node/SSR build
// does not export. In a browser that costs nothing (Vite takes the browser
// condition and tree-shakes). Under a bare-node bundle it is four hard errors,
// so the entire batch importer was impossible until the imports moved to
// graph-kit subpaths.
//
// It went unseen because the app's vitest suite runs in node with no
// `environment` set — but resolves through VITE, which takes the browser
// condition and externalizes node_modules. The tests were green about a thing
// that could not work. That is the sw-lane lesson again (STATE.md): a lane that
// passes because of what is ABSENT from the machine is not passing.
//
// So this test does NOT grep for the string '@activity/graph-kit'. A guard that
// compares two declarations outlives the implementation — this repo watched the
// registry declare `numbered` for four months while nothing rendered it, with a
// green suite (trap 2 in the brief). §A actually esbuild-bundles the pipeline
// for node, imports the bytes, and converts real markdown into a document that
// must pass zod. If any future import re-breaks node — through a path nobody
// predicted — this goes red for the right reason.
//
// ZERO DEPENDENCIES beyond esbuild (root devDependency): node:test only.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import {
    canonicalJson,
    convertOne,
    describeChanges,
    findMarkdownFiles,
    fingerprintDocument,
    loadPipeline,
    makeDb,
    parseArgs,
    planIdentity,
    rejectUnusableKey,
    splitDriftedUpdates,
    titleFromPath,
} from '../batch-import.mjs';

// One bundle for the whole file — esbuild costs about a second, and every §A/§B
// row wants the same pipeline.
const pipeline = await loadPipeline();

const SAMPLE = [
    '```meta',
    'title: Factoring Quadratics',
    'course: Algebra I',
    'unit: Unit 3',
    'tags: factoring, quadratics',
    'role: practice',
    '```',
    '',
    '# Warm up',
    '',
    'The powerhouse of the cell is the {{mitochondria}}.',
].join('\n');

// =============================================================================
// §A — the pipeline really runs in node, and produces a valid document
// =============================================================================

test('§A the app pipeline bundles for node and converts markdown end to end', () => {
    const out = convertOne(pipeline, SAMPLE, null, 'unit-3/factoring.md');

    // Bound to OUTPUT: a real document, schema-valid, with the fence's fields
    // actually on it. loadPipeline() throwing is the node-safety half; this is
    // the "and it did the job" half.
    assert.equal(out.document.schemaVersion, 2);
    assert.ok(out.document.sections.length > 0, 'produced no sections');
    assert.equal(out.title, 'Factoring Quadratics');
    assert.equal(out.document.meta.course, 'Algebra I');
    assert.equal(out.document.meta.unit, 'Unit 3');
    assert.deepEqual(out.tags, ['factoring', 'quadratics']);
    assert.equal(out.pedagogicalRole, 'practice');
});

test('§A the produced document survives a reload → resave round trip', () => {
    // The brief's trap 3, and the one that killed the `problem` block and
    // nearly killed `answer`: a test that stops at the Tiptap doc cannot see a
    // field die on the way back out. So go the whole way round — the document
    // the script would WRITE, loaded as the editor loads it, and saved again.
    const first = convertOne(pipeline, SAMPLE, null, 'unit-3/factoring.md').document;

    const reloaded = pipeline.tiptapToActivity(
        pipeline.activityToTiptap(first),
        first.meta,
        first.referencePanel,
        first.calculator,
    );

    assert.ok(
        pipeline.ActivityDocument.safeParse(reloaded).success,
        'the resaved document no longer validates',
    );
    assert.equal(reloaded.meta.course, 'Algebra I');
    assert.equal(reloaded.meta.unit, 'Unit 3');
    assert.equal(
        reloaded.sections.length,
        first.sections.length,
        'a section was lost on the reload → resave leg',
    );
});

test('§A a file with no importable content is rejected, not written', () => {
    // D3's raw material: this must THROW so the caller can skip and report it,
    // rather than quietly writing an empty activity over a real one.
    assert.throws(
        () => convertOne(pipeline, '   \n\n   ', null, 'x.md'),
        /no importable content/,
    );
});

// =============================================================================
// §B — merge authority (D5): never-clobber on create, file wins on update
// =============================================================================

test('§B a CREATE takes every field the fence carried', () => {
    const out = convertOne(pipeline, SAMPLE, null, 'unit-3/factoring.md');
    assert.equal(out.title, 'Factoring Quadratics');
    assert.equal(out.pedagogicalRole, 'practice');
    assert.deepEqual(out.changes, [], 'a create reports no field changes');
});

test('§B an UPDATE lets the FILE win, and names every field it changed', () => {
    // The row as it stands: renamed in the app, differently tagged, no role.
    const existing = {
        id: 'row-1',
        source_path: 'unit-3/factoring.md',
        title: 'Quadratics (old name)',
        tags: ['quadratics', 'hand-added'],
        pedagogical_role: null,
        draftMeta: { course: 'Geometry', unit: 'Unit 9' },
        draftCalculator: undefined,
    };

    const out = convertOne(pipeline, SAMPLE, existing, 'unit-3/factoring.md');

    // File authority: the fence's values, not the row's.
    assert.equal(out.title, 'Factoring Quadratics');
    assert.equal(out.document.meta.course, 'Algebra I');
    assert.equal(out.document.meta.unit, 'Unit 3');
    assert.equal(out.pedagogicalRole, 'practice');
    // Tags REPLACE on an update — 'hand-added' is gone because the file no
    // longer says it. That is the trade D5 made, and it is why the next
    // assertion matters more than this one.
    assert.deepEqual(out.tags, ['factoring', 'quadratics']);

    // Nothing silent: every overwrite is reportable.
    const fields = out.changes.map((c) => c.field).sort();
    assert.deepEqual(fields, ['course', 'role', 'tags', 'title', 'unit']);

    const titleChange = out.changes.find((c) => c.field === 'title');
    assert.equal(titleChange.from, 'Quadratics (old name)');
    assert.equal(titleChange.to, 'Factoring Quadratics');

    const tagChange = out.changes.find((c) => c.field === 'tags');
    assert.deepEqual(tagChange.added, ['factoring']);
    assert.deepEqual(tagChange.removed, ['hand-added']);
});

test('§B a fence key that is ABSENT leaves its field alone', () => {
    // A fence carrying only tags must not blank the title — the difference
    // between "the file says otherwise" and "the file says nothing".
    const md = ['```meta', 'tags: review', '```', '', 'Some prose.'].join('\n');
    const existing = {
        id: 'row-2',
        source_path: 'x.md',
        title: 'A name worth keeping',
        tags: [],
        pedagogical_role: 'lesson',
        draftMeta: { course: 'Algebra II', unit: 'Unit 1' },
        draftCalculator: undefined,
    };

    const out = convertOne(pipeline, md, existing, 'x.md');

    assert.equal(out.title, 'A name worth keeping');
    assert.equal(out.document.meta.course, 'Algebra II');
    assert.equal(out.document.meta.unit, 'Unit 1');
    assert.equal(out.pedagogicalRole, 'lesson');
    assert.deepEqual(
        out.changes.map((c) => c.field),
        ['tags'],
        'only tags should have changed',
    );
});

test('§B an UPDATE preserves document settings no fence key describes', () => {
    // The "save path is where fields die silently" trap, aimed at this script:
    // a re-run must not delete print/typography settings the author configured
    // in the drawer, just because the .md file has never heard of them.
    const existing = {
        id: 'row-3',
        source_path: 'x.md',
        title: 'T',
        tags: [],
        pedagogical_role: null,
        draftMeta: {
            course: 'Algebra II',
            // Real, non-default values on both scaffolds. (Both objects are
            // schema-normalized, so the assertions below read the FIELDS rather
            // than comparing whole objects — the defaults ride along and are
            // not the point.)
            print: { columns: 2, workSpace: 3 },
            typography: { font: 'lexend', fontSize: 20 },
        },
        draftCalculator: undefined,
    };

    const out = convertOne(pipeline, SAMPLE, existing, 'unit-3/factoring.md');

    assert.equal(
        out.document.meta.print?.columns,
        2,
        'print columns were dropped on re-import',
    );
    assert.equal(
        out.document.meta.print?.workSpace,
        3,
        'print workSpace was dropped on re-import',
    );
    assert.equal(
        out.document.meta.typography?.font,
        'lexend',
        'typography font was dropped on re-import',
    );
    assert.equal(
        out.document.meta.typography?.fontSize,
        20,
        'typography fontSize was dropped on re-import',
    );
});

test('§B a title-less file takes its name from the FILENAME, not the placeholder', () => {
    // Without this, every title-less file in a 150-file catalogue lands as
    // "Untitled activity" — 150 identical names and a slug ladder of
    // untitled-activity-2, -3, -4 …, each needing a hand rename. That is the
    // exact cost the fence's `title` key exists to remove, so the importer
    // must not reintroduce it for files that simply forgot the key.
    const md = 'Just some prose, no fence at all.';

    const out = convertOne(pipeline, md, null, 'unit-3/factoring-quadratics.md');

    assert.equal(out.title, 'Factoring Quadratics');
});

test('§B the fence still beats the filename when it carries a title', () => {
    const out = convertOne(pipeline, SAMPLE, null, 'unit-3/some-file-name.md');
    assert.equal(out.title, 'Factoring Quadratics');
});

test('§B an UPDATE with no fence title keeps the ROW title, not the filename', () => {
    // The other half: re-deriving from the filename on update would rename an
    // activity the moment someone deleted the title key from its fence.
    const existing = {
        id: 'row-4',
        source_path: 'unit-3/factoring-quadratics.md',
        title: 'A name the author chose',
        tags: [],
        pedagogical_role: null,
        draftMeta: { course: 'Algebra II' },
        draftCalculator: undefined,
    };

    const out = convertOne(
        pipeline,
        'Just some prose.',
        existing,
        'unit-3/factoring-quadratics.md',
    );

    assert.equal(out.title, 'A name the author chose');
    assert.deepEqual(out.changes, []);
});

test('§B titleFromPath humanises a path', () => {
    assert.equal(titleFromPath('a/b/factoring-quadratics.md'), 'Factoring Quadratics');
    assert.equal(titleFromPath('warm_up.md'), 'Warm Up');
    assert.equal(titleFromPath('01-intro.md'), '01 Intro');
    // Already-cased text keeps its own shape rather than being normalised.
    assert.equal(titleFromPath('Factoring QUADRATICS.md'), 'Factoring QUADRATICS');
    assert.equal(titleFromPath('.md'), null);
});

test('§B a nested meta key (work:) reaches the document, print defaults intact', () => {
    // REGRESSION, and the bug is worth naming because the class is subtle.
    // blankTarget() used to hand-roll the schema's meta defaults and simply
    // omitted `print`. Zod papered over it forever (PrintConfig is
    // `.default({})`, so the WRITTEN document always looked right) — until
    // applyImportedMeta learned to read a NESTED field, at which point the
    // first `work:` fence crashed on `meta.print.workSpace`.
    //
    // The fix was to build the target from createEmptyDocument rather than a
    // literal. This row pins the outcome: the fence's value lands, and every
    // OTHER print default survives beside it.
    const md = [
        '```meta',
        'title: Rates',
        'work: 3 lines',
        '```',
        '',
        'A 2 kg bag costs $7. Five kilos costs {{17.50}}.',
    ].join('\n');

    const out = convertOne(pipeline, md, null, 'unit-3/rates.md');

    assert.equal(out.document.meta.print.workSpace, 6, '3 lines should be 6rem');
    assert.equal(out.document.meta.print.paperSize, 'letter');
    assert.equal(out.document.meta.print.margin, 0.5);
    assert.ok(
        out.document.meta.print.header,
        'the print header object was dropped — a hand-rolled meta literal is back',
    );
});

// =============================================================================
// §C — identity planning (D1/D2)
// =============================================================================

test('§C planIdentity splits creates, updates and orphans', () => {
    const files = [
        { sourcePath: 'a.md' },
        { sourcePath: 'unit-3/b.md' },
        { sourcePath: 'new.md' },
    ];
    const existing = [
        { id: '1', source_path: 'a.md', title: 'A' },
        { id: '2', source_path: 'unit-3/b.md', title: 'B' },
        { id: '3', source_path: 'gone.md', title: 'Gone' },
    ];

    const { creates, updates, orphans } = planIdentity(files, existing);

    assert.deepEqual(creates.map((c) => c.file.sourcePath), ['new.md']);
    assert.deepEqual(updates.map((u) => u.file.sourcePath), ['a.md', 'unit-3/b.md']);
    assert.deepEqual(orphans.map((o) => o.source_path), ['gone.md']);
});

test('§C a hand-authored activity is invisible in BOTH directions', () => {
    // The property that makes the whole scheme safe to run against a database
    // full of activities the author made in the app: a NULL source_path row is
    // never updated by a file and never reported as an orphan. If this ever
    // goes red, the importer has gained the power to overwrite work it did not
    // create — which is exactly the failure that ruled out keying on `slug`.
    const existing = [
        { id: '1', source_path: null, title: 'Made by hand' },
        { id: '2', source_path: undefined, title: 'Also by hand' },
    ];

    const { creates, updates, orphans } = planIdentity(
        [{ sourcePath: 'made-by-hand.md' }],
        existing,
    );

    assert.equal(updates.length, 0, 'a NULL source_path row was matched to a file');
    assert.equal(orphans.length, 0, 'a NULL source_path row was reported as an orphan');
    assert.deepEqual(creates.map((c) => c.file.sourcePath), ['made-by-hand.md']);
});

test('§C findMarkdownFiles yields sorted POSIX-relative paths and skips dotdirs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'batch-import-'));
    try {
        await mkdir(join(root, 'unit-3'), { recursive: true });
        await mkdir(join(root, '.git'), { recursive: true });
        await writeFile(join(root, 'unit-3', 'b.md'), '# b');
        await writeFile(join(root, 'a.md'), '# a');
        await writeFile(join(root, 'notes.txt'), 'ignored');
        await writeFile(join(root, '.git', 'HEAD.md'), '# not this');

        const files = await findMarkdownFiles(root);

        assert.deepEqual(files.map((f) => f.sourcePath), ['a.md', 'unit-3/b.md']);
    } finally {
        // P7: the run owns its residue end to end.
        await rm(root, { recursive: true, force: true });
    }
});

// =============================================================================
// §F — argument parsing
// =============================================================================

test('§F a bare `--` is ignored, because pnpm forwards it', () => {
    // Documented as `pnpm import:batch -- <folder>` on day one, which fails:
    // pnpm passes the separator THROUGH rather than consuming it, so '--'
    // arrived where the folder should be and the run died with "unknown flag".
    // Both spellings work now — the docs lead with the bare form, and the
    // separator every habit types is tolerated.
    const withSep = parseArgs(['--', '/tmp/cat', '--owner', 'me@example.com']);
    const without = parseArgs(['/tmp/cat', '--owner', 'me@example.com']);

    assert.equal(withSep.folder, '/tmp/cat');
    assert.equal(without.folder, '/tmp/cat');
    assert.deepEqual(withSep, without);
});

test('§F a publishable key is refused before any work happens', () => {
    // The dangerous mistake, and the reason it is checked UP FRONT rather than
    // left to the request: a publishable/anon key does not fail like a bad
    // password, it makes the database look EMPTY. RLS hides every row, so the
    // planner would conclude all 150 activities are CREATES and report
    // something untrue before it reported anything wrong.
    assert.throws(
        () => rejectUnusableKey('sb_publishable_abc123'),
        /PUBLISHABLE key/,
    );
});

test('§F an anon JWT is refused by its own payload', () => {
    const jwt = (role) =>
        [
            Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url'),
            Buffer.from(JSON.stringify({ role })).toString('base64url'),
            'sig',
        ].join('.');

    assert.throws(() => rejectUnusableKey(jwt('anon')), /ANON key/);
    // …and the one that CAN do the job passes untouched, so the guard is not
    // just "reject everything that looks unfamiliar".
    assert.doesNotThrow(() => rejectUnusableKey(jwt('service_role')));
    assert.doesNotThrow(() => rejectUnusableKey('sb_secret_abc123'));
});

test('§F --dry-run and --owner=x parse in either position', () => {
    const a = parseArgs(['--dry-run', '/tmp/cat', '--owner=me@example.com']);
    assert.equal(a.folder, '/tmp/cat');
    assert.equal(a.owner, 'me@example.com');
    assert.equal(a.dryRun, true);
});

test('§F an unknown flag still fails loudly', () => {
    // The separator became forgiving; a typo'd flag must NOT — silently
    // ignoring --dryrun would write to the live database on a run the author
    // believed was a rehearsal.
    assert.throws(() => parseArgs(['/tmp/cat', '--dryrun']), /unknown flag/);
});

// =============================================================================
// §E — credential handling (both Supabase key generations)
// =============================================================================

test('§E a NEW secret key is sent on apikey ONLY, never Authorization', async () => {
    // Supabase issues two key generations from one dashboard page and they are
    // sent differently. The new `sb_secret_…` keys are NOT JWTs, so putting one
    // in `Authorization: Bearer` makes the platform try to parse it as a JWT
    // and reject the request — which surfaces as a 401 that reads like a bad
    // credential rather than a mis-sent one. The docs call this out precisely
    // because "many Supabase clients do by default"; this script did too, until
    // 2026-08-21.
    const seen = [];
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (url, init = {}) => {
        seen.push({ url: String(url), headers: init.headers ?? {} });
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    };
    try {
        const db = makeDb('https://stub.example.com', 'sb_secret_abc123');
        await db.existingFor('owner-1');
    } finally {
        globalThis.fetch = realFetch;
    }

    assert.equal(seen.length, 1);
    assert.equal(seen[0].headers.apikey, 'sb_secret_abc123');
    assert.equal(
        seen[0].headers.Authorization,
        undefined,
        'a non-JWT key must not ride in Authorization — the platform rejects it',
    );
});

test('§E a LEGACY service_role JWT still gets both headers', async () => {
    // The other generation, unchanged. Existing setups must keep working.
    const seen = [];
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (url, init = {}) => {
        seen.push(init.headers ?? {});
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    };
    try {
        const db = makeDb('https://stub.example.com', 'eyJhbGciOi.payload.sig');
        await db.existingFor('owner-1');
    } finally {
        globalThis.fetch = realFetch;
    }

    assert.equal(seen[0].apikey, 'eyJhbGciOi.payload.sig');
    assert.equal(seen[0].Authorization, 'Bearer eyJhbGciOi.payload.sig');
});

// =============================================================================
// §D — the change report renders
// =============================================================================

test('§D describeChanges renders field moves and tag deltas', () => {
    const lines = describeChanges([
        { field: 'title', from: 'Old', to: 'New' },
        { field: 'unit', from: undefined, to: 'Unit 3' },
        { field: 'tags', added: ['a'], removed: ['b'] },
    ]);

    assert.match(lines[0], /title.*“Old”.*→.*“New”/);
    assert.match(lines[1], /unit.*<unset>.*→.*“Unit 3”/);
    assert.equal(lines[2], 'tags   +a  -b');
});

// =============================================================================
// §G — the drift guard (D7.4, migration 0039)
// -----------------------------------------------------------------------------
// "THE FILE WINS" is the importer's headline property and its sharpest edge: an
// activity edited in the app after import is silently clobbered by the next
// run. Before this, the only thing preventing that was a sentence in a design
// doc. These bind the mechanism that replaced the sentence.
//
// The subtle one is §G's first test. The fingerprint compares a document we
// serialized here against the same document after a round trip through `jsonb`,
// which does NOT preserve key order — so a naive JSON.stringify hash would
// report drift on every row of every run, and the guard would be switched off
// within a day of shipping.
// =============================================================================

test('§G the fingerprint survives jsonb key reordering', () => {
    const written = { meta: { title: 'A', course: 'B' }, sections: [{ id: 'x' }] };
    // What jsonb hands back: same value, different key order.
    const readBack = { sections: [{ id: 'x' }], meta: { course: 'B', title: 'A' } };
    assert.equal(canonicalJson(written), canonicalJson(readBack));
    assert.equal(fingerprintDocument(written), fingerprintDocument(readBack));
});

test('§G the fingerprint changes when the content actually changes', () => {
    const a = { meta: { title: 'A' } };
    const b = { meta: { title: 'B' } };
    assert.notEqual(fingerprintDocument(a), fingerprintDocument(b));
});

test('§G an absent draft has no fingerprint (never a hash of "null")', () => {
    assert.equal(fingerprintDocument(null), null);
    assert.equal(fingerprintDocument(undefined), null);
});

test('§G an untouched draft is updatable; an app-edited one is REFUSED', () => {
    const doc = { meta: { title: 'Factoring' }, sections: [] };
    const untouched = {
        file: { sourcePath: 'a.md' },
        row: { draft_content: doc, source_fingerprint: fingerprintDocument(doc) },
    };
    const edited = {
        file: { sourcePath: 'b.md' },
        // The author fixed a typo in the app: the stored fingerprint is now of
        // a draft that no longer exists.
        row: {
            draft_content: { meta: { title: 'Factoring Quadratics' }, sections: [] },
            source_fingerprint: fingerprintDocument(doc),
        },
    };

    const { safe, drifted } = splitDriftedUpdates([untouched, edited]);
    assert.deepEqual(
        safe.map((e) => e.file.sourcePath),
        ['a.md'],
    );
    assert.deepEqual(
        drifted.map((e) => e.file.sourcePath),
        ['b.md'],
    );
});

test('§G --force overwrites a drifted row, deliberately', () => {
    const doc = { meta: { title: 'X' } };
    const edited = {
        file: { sourcePath: 'b.md' },
        row: { draft_content: { meta: { title: 'Y' } }, source_fingerprint: fingerprintDocument(doc) },
    };
    const { safe, drifted } = splitDriftedUpdates([edited], { force: true });
    assert.equal(drifted.length, 0);
    assert.equal(safe.length, 1);
});

test('§G a row with NO recorded fingerprint is allowed — the guard self-arms', () => {
    // Every row imported before 0039 is in this state. Refusing them would
    // block a catalogue that predates the guard; allowing them (and writing a
    // fingerprint on this run) arms it without a backfill.
    const { safe, drifted } = splitDriftedUpdates([
        {
            file: { sourcePath: 'legacy.md' },
            row: { draft_content: { meta: { title: 'Legacy' } }, source_fingerprint: null },
        },
    ]);
    assert.equal(drifted.length, 0);
    assert.equal(safe.length, 1);
});

test('§G --force parses in either position', () => {
    assert.equal(parseArgs(['folder', '--owner', 'a@b.c', '--force']).force, true);
    assert.equal(parseArgs(['--force', 'folder', '--owner=a@b.c']).force, true);
    assert.equal(parseArgs(['folder', '--owner', 'a@b.c']).force, false);
});

// =============================================================================
// §H — the stale-publication report (T4, amended at build 2026-08-21)
// -----------------------------------------------------------------------------
// The importer writes DRAFTS, so an already-published activity keeps serving its
// old snapshot after an upgrade import. This report is what turns "audit 150
// activities" into "republish these three".
//
// The load-bearing test is the FIRST one. Block ids are re-minted on every
// import (CLAUDE.md: never diff serialized ActivityDocuments), so a naive
// comparison reports EVERY published activity stale, every run — a report that
// cries wolf is a report nobody reads, and it would send the author republishing
// a whole catalogue for nothing.
// =============================================================================

import { contentSignature, planRepublish } from '../stale-publications.mjs';

const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const doc = (title, extra = {}) => ({
    schemaVersion: 2,
    meta: { title },
    sections: [
        {
            id: 'sec-1',
            rows: [
                {
                    id: 'row-1',
                    columns: [
                        {
                            id: 'col-1',
                            blocks: [
                                {
                                    id: 'blk-1',
                                    type: 'table',
                                    rows: [
                                        {
                                            id: 'r1',
                                            cells: [
                                                {
                                                    id: 'c1',
                                                    content: [
                                                        { type: 'text', text: 'kg', marks: [] },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                    ...extra,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
});

test('§H re-minted ids do NOT make a publication look stale', () => {
    const published = doc('Rates');
    // The same document after a re-import: every structural id is different.
    const reimported = JSON.parse(JSON.stringify(published));
    reimported.sections[0].id = 'sec-9';
    reimported.sections[0].rows[0].id = 'row-9';
    reimported.sections[0].rows[0].columns[0].id = 'col-9';
    reimported.sections[0].rows[0].columns[0].blocks[0].id = 'blk-9';
    reimported.sections[0].rows[0].columns[0].blocks[0].rows[0].id = 'r9';
    reimported.sections[0].rows[0].columns[0].blocks[0].rows[0].cells[0].id = 'c9';

    assert.equal(contentSignature(published), contentSignature(reimported));
});

test('§H a real content change DOES', () => {
    assert.notEqual(contentSignature(doc('Rates')), contentSignature(doc('Ratios')));
});

test('§H a BLANK id is not stripped — it is the response key', () => {
    const withBlank = (blankId) =>
        doc('Rates', {
            rows: [
                {
                    id: 'r1',
                    cells: [
                        { id: 'c1', content: [{ type: 'blank', id: blankId, answer: '9' }] },
                    ],
                },
            ],
        });
    // Two documents identical except for which gap a student's answers attach
    // to are NOT the same publication.
    assert.notEqual(
        contentSignature(withBlank('b-1')),
        contentSignature(withBlank('b-2')),
    );
});

test('§H the plan names exactly the published-and-changed rows', () => {
    const rows = [
        {
            source_path: 'stale.md',
            status: 'published',
            published_content: doc('Old title'),
            draft_content: doc('New title'),
        },
        {
            source_path: 'current.md',
            status: 'published',
            published_content: doc('Same'),
            draft_content: doc('Same'),
        },
        {
            source_path: 'draft-only.md',
            status: 'draft',
            published_content: null,
            draft_content: doc('Never published'),
        },
        // A hand-authored activity: no source_path, so not the importer's to
        // chase in either direction — the same rule planIdentity follows.
        {
            source_path: null,
            status: 'published',
            published_content: doc('Old'),
            draft_content: doc('Newer'),
        },
    ];

    const { stale, current, unpublished } = planRepublish(rows);
    assert.deepEqual(stale.map((r) => r.source_path), ['stale.md']);
    assert.deepEqual(current.map((r) => r.source_path), ['current.md']);
    assert.deepEqual(unpublished.map((r) => r.source_path), ['draft-only.md']);
});

test('§H a published row with no snapshot is reported as unpublished, not stale', () => {
    const { stale, unpublished } = planRepublish([
        {
            source_path: 'weird.md',
            status: 'published',
            published_content: null,
            draft_content: doc('X'),
        },
    ]);
    assert.equal(stale.length, 0);
    assert.equal(unpublished.length, 1);
});

test('§H the report script actually RUNS — its main guard fires', () => {
    // THE BUG THIS EXISTS FOR: the guard was `import.meta.url ===
    // \`file://${process.argv[1]}\``, and this repo's path contains a space, so
    // the unencoded left side never equalled the percent-encoded right side.
    // main() never ran, the script exited 0, and it printed NOTHING — which
    // reads exactly like "no stale publications" to whoever ran it.
    //
    // So this does not test the expression; it RUNS the script and demands it
    // speak. Invoked with no --owner, so it takes the usage path and needs no
    // credentials and no network.
    const script = join(repoRoot, 'scripts/stale-publications.mjs');
    const result = spawnSync(process.execPath, [script], { encoding: 'utf8' });
    assert.equal(result.status, 2, 'expected the usage exit code');
    assert.match(result.stderr, /Missing --owner/);
});
