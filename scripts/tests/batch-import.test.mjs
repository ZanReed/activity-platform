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
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import {
    bindingWarningsFor,
    canNeverFire,
    canonicalJson,
    chainFolderOf,
    coverageJson,
    collectBindings,
    convertOne,
    describeChanges,
    duplicateChainTitles,
    editDistanceWithin,
    findMarkdownFiles,
    fingerprintDocument,
    isBindingWarning,
    loadPipeline,
    makeDb,
    missingColumnFrom,
    MISCONCEPTION_ID,
    nearDuplicateIds,
    parseArgs,
    parseChainRegistry,
    parseNumericValue,
    parseSkillRegistry,
    parseRegistry,
    planIdentity,
    renderCoverageManifest,
    scanSourceKey,
    suggestKeyFor,
    summarizeCoverage,
    rejectUnusableKey,
    renderManifest,
    splitDriftedUpdates,
    summarizeBindings,
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

import { chunk, contentSignature, planRepublish } from '../stale-publications.mjs';

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

test('§H chunk batches the version-id lookup', () => {
    // `id=in.(…)` rides in the URL; a 150-activity catalogue is ~5.5 KB of
    // uuids, close enough to the usual 8 KB request-line ceiling that batching
    // is cheaper than finding out.
    assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
    assert.deepEqual(chunk([], 50), []);
    assert.equal(chunk(Array.from({ length: 150 }, (_, i) => i), 50).length, 3);
});

test('§H a published activity with NO draft is up to date, not stale', () => {
    // publish_activity ends with `draft_content = null` (0037), so this is what
    // a fully published activity looks like at rest. A naive signature compare
    // signs null as "null", finds it different from the snapshot, and reports
    // the whole published catalogue as needing republishing — which is how a
    // report becomes noise. Caught against the live corpus, where the pilot's
    // one published activity is exactly this shape.
    const { stale, current } = planRepublish([
        {
            source_path: 'published-clean.md',
            status: 'published',
            published_content: doc('Rates'),
            draft_content: null,
        },
    ]);
    assert.equal(stale.length, 0);
    assert.deepEqual(current.map((r) => r.source_path), ['published-clean.md']);
});

test('§H a draft that merely re-saved the SAME content is not stale either', () => {
    // An editor session can autosave a draft identical to what is published.
    // Having a draft is the signal; differing from the snapshot is the test.
    const { stale, current } = planRepublish([
        {
            source_path: 'reopened.md',
            status: 'published',
            published_content: doc('Rates'),
            draft_content: doc('Rates'),
        },
    ]);
    assert.equal(stale.length, 0);
    assert.equal(current.length, 1);
});

test('§H a draft that CHANGED is stale — the case the report exists for', () => {
    const { stale } = planRepublish([
        {
            source_path: 'upgraded.md',
            status: 'published',
            published_content: doc('Rates'),
            draft_content: doc('Rates with a table'),
        },
    ]);
    assert.deepEqual(stale.map((r) => r.source_path), ['upgraded.md']);
});

// =============================================================================
// §I — misconception bindings: the manifest, the registry, the dead ones
// -----------------------------------------------------------------------------
// Every one of these rows is bound to the CONVERTED DOCUMENT, not to the
// markdown and not to a declaration. That is the point: a binding's whole
// failure mode is silence — the file parses, the row writes, the activity
// renders, and the only thing wrong is that a sensor never fires. The three
// authoring sites are read out of a real conversion here for the same reason §A
// bundles the pipeline: a test that trusted the parser's own account of what it
// produced would go on passing after serialize dropped the field.
//
// (It really does drop one: the id-ONLY blank form documented in
// markdown-import-format.md — `{{12 | !21 :: mis.x}}` with no feedback prose —
// is discarded by sanitizeMistakeFeedback, which throws away any entry whose
// feedback is empty and takes the binding with it. That is a serialize bug, not
// a manifest one, so it is not pinned here; the row below uses the two-segment
// form deliberately.)
// =============================================================================

const BINDINGS_MD = [
    '# Rates',
    '',
    'Cost per kg: {{=3.50 | !7 :: You used the total. :: mis.roc.uses-endpoint-value}}',
    '',
    'Reversed: {{12 | !21 :: Digits swapped. :: mis.place-value.digit-reversal}}',
    '',
    '```mc',
    'prompt: Which is the unit rate?',
    '( ) $4 per kg :: Check what you divided by. :: mis.roc.uses-endpoint-value',
    '(x) $3.50 per kg',
    '( ) $14 per kg :: That is the total. :: mis.roc.total-not-rate',
    '```',
].join('\n');

test('§I every authoring site reaches the manifest, named by where it sits', () => {
    const { document } = convertOne(pipeline, BINDINGS_MD, null, 'unit-3/rates.md');
    const { bindings } = collectBindings(document);

    assert.deepEqual(
        bindings.map((b) => `${b.id} @ ${b.where}`),
        [
            'mis.roc.uses-endpoint-value @ fill_in_blank #1, blank #1',
            'mis.place-value.digit-reversal @ fill_in_blank #2, blank #1',
            'mis.roc.uses-endpoint-value @ multiple_choice #1, choice A',
            'mis.roc.total-not-rate @ multiple_choice #1, choice C',
        ],
    );
});

test('§I a binding NESTED inside a fence is found too', () => {
    // The walk is generic precisely so that the containers it has never heard
    // of still work. A faded worked example holds blanks several levels down,
    // and an enumerated walk would have missed every one of them.
    const md = [
        '# Practice',
        '',
        '```faded',
        'title: Guided',
        'A 3 m ribbon costs $4.50.',
        'Per metre: {{=1.50 | !4.50 :: You copied the total. :: mis.roc.total-not-rate}}',
        '```',
    ].join('\n');

    const { document } = convertOne(pipeline, md, null, 'x.md');
    const { bindings } = collectBindings(document);

    assert.deepEqual(bindings.map((b) => b.id), ['mis.roc.total-not-rate']);
    // Labelled by the INNERMOST container the blank actually sits in (the
    // fence nests a fill_in_blank of its own), which is the useful half of the
    // address — ordinals are per type across the whole document, so it is
    // unambiguous either way.
    assert.match(bindings[0].where, /fill_in_blank #\d+, blank #1/);
    // And the fence really did nest it, rather than the fence being ignored:
    // a walk that only visited top-level blocks would have found nothing.
    assert.match(
        JSON.stringify(document),
        /"type":"faded_worked_example"/,
        'the fixture no longer nests the blank — the test proves nothing',
    );
});

test('§I the id pattern is a COPY, and the copy has not drifted', () => {
    // The script cannot import the .ts source of truth, so it duplicates the
    // regex. A duplicate nobody compares is a duplicate that diverges, and this
    // one diverging would mean the two halves of the same feature disagree
    // about what an id is: the importer would bind a token the manifest calls
    // suspect, or the reverse.
    const source = readFileSync(
        join(repoRoot, 'packages/app/src/lib/misconceptionBinding.ts'),
        'utf8',
    );
    const match = /^const VALID_ID = (\/.*\/);$/m.exec(source);
    assert.ok(match, 'VALID_ID is no longer a single-line regex literal there');
    assert.equal(
        `/${MISCONCEPTION_ID.source}/`,
        match[1],
        'scripts/batch-import.mjs MISCONCEPTION_ID has drifted from misconceptionBinding.ts',
    );
});

// ---- dead bindings ----------------------------------------------------------

test('§I a mistake that IS the answer can never fire', () => {
    const blank = { answer: '12', acceptableAnswers: [] };
    assert.match(canNeverFire(blank, '12'), /scores correct/);
    assert.equal(canNeverFire(blank, '21'), null);
});

test('§I an acceptable answer shadows a mistake too', () => {
    const blank = { answer: 'yes', acceptableAnswers: ['y', 'Yes'] };
    assert.match(canNeverFire(blank, 'Yes'), /scores correct/);
    assert.equal(canNeverFire(blank, 'no'), null);
});

test('§I on a NUMERIC blank the comparison is numeric, not textual', () => {
    // The case the whole check exists for: `!0.5` against an answer of `1/2`
    // looks like a different string and is the same number, so the mistake is
    // unreachable and the data would report the misconception as never made.
    const blank = { answer: '1/2', acceptableAnswers: [], answerType: 'numeric' };
    assert.match(canNeverFire(blank, '0.5'), /numerically equal/);
    assert.match(canNeverFire(blank, '.50'), /numerically equal/);
    assert.equal(canNeverFire(blank, '2'), null);
});

test('§I a numeric blank’s tolerance widens what can never fire', () => {
    const blank = {
        answer: '3.5',
        acceptableAnswers: [],
        answerType: 'numeric',
        tolerance: 0.1,
    };
    assert.match(canNeverFire(blank, '3.55'), /numerically equal/);
    assert.equal(canNeverFire(blank, '3.7'), null);
});

test('§I a case-only difference is NOT dead — scoring is case-sensitive', () => {
    // Scoring compares case-sensitively; mistake matching is the looser,
    // case-INSENSITIVE side. So `!Cat` against an answer of `cat` really does
    // fire, and reporting it dead would send an author to delete a live sensor.
    assert.equal(canNeverFire({ answer: 'cat', acceptableAnswers: [] }, 'Cat'), null);
});

test('§I a math blank is left alone — its equivalence needs the kit', () => {
    // 2a and a+a are the same answer to a math blank and this file has no way
    // to know it. Guessing would produce false "can never fire" reports, which
    // under --strict fail a run for no reason.
    const blank = { answer: '2a', acceptableAnswers: [], answerType: 'math' };
    assert.equal(canNeverFire(blank, 'a+a'), null);
});

test('§I a dead binding is reported through the whole path, named', () => {
    const md = 'Cost: {{=3.50 | !3.5 :: Same number. :: mis.roc.uses-endpoint-value}}';
    const collected = collectBindings(
        convertOne(pipeline, `# H\n\n${md}`, null, 'dead.md').document,
    );
    assert.equal(collected.dead.length, 1);

    const warnings = bindingWarningsFor('dead.md', collected, null);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /^dead\.md: /);
    assert.match(warnings[0], /can NEVER FIRE/);
    assert.match(warnings[0], /mis\.roc\.uses-endpoint-value/);
});

test('§I a dead mistake with NO binding is reported too', () => {
    // Same defect, one `::` earlier in its life. Under --strict it fails the
    // run, so it is pinned rather than left to a reader's assumption.
    const md = 'Answer: {{12 | !12 :: You wrote the right answer.}}';
    const collected = collectBindings(
        convertOne(pipeline, `# H\n\n${md}`, null, 'unbound.md').document,
    );
    assert.deepEqual(collected.bindings, []);
    const warnings = bindingWarningsFor('unbound.md', collected, null);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /can NEVER FIRE/);
    assert.doesNotMatch(warnings[0], /mis\./);
});

// ---- the registry -----------------------------------------------------------

test('§I a registry file is ids only — comments and blank lines are not ids', () => {
    const ids = parseRegistry(
        ['# the taxonomy', '', 'mis.roc.uses-endpoint-value', '  ', 'mis.a.b # trailing'].join('\n'),
    );
    assert.deepEqual([...ids].sort(), ['mis.a.b', 'mis.roc.uses-endpoint-value']);
});

test('§I an id outside the registry warns, naming the file and the id', () => {
    const collected = collectBindings(
        convertOne(pipeline, BINDINGS_MD, null, 'unit-3/rates.md').document,
    );
    const registry = {
        path: 'taxonomy.txt',
        ids: parseRegistry('mis.roc.uses-endpoint-value\nmis.place-value.digit-reversal'),
    };
    const warnings = bindingWarningsFor('unit-3/rates.md', collected, registry);

    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /unit-3\/rates\.md/);
    assert.match(warnings[0], /mis\.roc\.total-not-rate/);
    assert.match(warnings[0], /taxonomy\.txt/);
});

test('§I a known id is silent, and one unknown id warns ONCE', () => {
    // The same wrong id used in five places is one thing to fix, not five lines
    // in a 150-file run.
    const collected = {
        bindings: [
            { id: 'mis.a.b', where: 'w1' },
            { id: 'mis.a.b', where: 'w2' },
            { id: 'mis.known.id', where: 'w3' },
        ],
        dead: [],
    };
    const warnings = bindingWarningsFor('f.md', collected, {
        path: 'r.txt',
        ids: new Set(['mis.known.id']),
    });
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /mis\.a\.b/);
});

test('§I with NO registry there is nothing to check an id against', () => {
    const collected = { bindings: [{ id: 'mis.a.b', where: 'w' }], dead: [] };
    assert.deepEqual(bindingWarningsFor('f.md', collected, null), []);
});

test('§I a suspect id from the importer is recognizable as a binding warning', () => {
    // isBindingWarning couples to suspectWarning()'s sentence. Pinned against
    // the REAL string the pipeline emits, so a reword goes red here rather than
    // silently exempting suspect ids from --strict.
    const md = '# H\n\nPick: {{2 | !3 :: A typo lurks. :: msi.slope.reads-intercept}}';
    const { warnings } = convertOne(pipeline, md, null, 'suspect.md');
    assert.equal(warnings.filter(isBindingWarning).length, 1);
    assert.equal(
        warnings.filter((w) => !isBindingWarning(w)).length,
        0,
        'a non-binding warning was misread as a binding warning (or vice versa)',
    );
});

// ---- near duplicates --------------------------------------------------------

test('§I near-duplicate ids are the ones within two edits', () => {
    assert.equal(editDistanceWithin('mis.a.value', 'mis.a.values', 2), 1);
    assert.equal(editDistanceWithin('mis.a.b', 'msi.a.b', 2), 2);
    assert.equal(editDistanceWithin('mis.a.b', 'mis.a.b', 2), 0);
    assert.equal(editDistanceWithin('mis.roc.slope-as-y', 'mis.roc.uses-endpoint', 2), Infinity);
});

test('§I the heuristic flags the typo pair and leaves real siblings alone', () => {
    // The rejected alternative — "identical except the last dotted segment" —
    // would have flagged the two deliberate siblings here, which is how a
    // warning becomes something nobody reads.
    const pairs = nearDuplicateIds([
        'mis.roc.uses-endpoint-value',
        'mis.roc.uses-endpoint-values',
        'mis.roc.slope-as-y-value',
        'mis.place-value.digit-reversal',
    ]);
    assert.deepEqual(
        pairs.map((p) => [p.a, p.b, p.distance]),
        [['mis.roc.uses-endpoint-value', 'mis.roc.uses-endpoint-values', 1]],
    );
});

// ---- the manifest -----------------------------------------------------------

const MANIFEST_INPUT = [
    {
        sourcePath: 'unit-3/unit-rate.md',
        bindings: [
            { id: 'mis.roc.uses-endpoint-value', where: 'a' },
            { id: 'mis.roc.uses-endpoint-value', where: 'b' },
            { id: 'mis.place-value.digit-reversal', where: 'c' },
        ],
        dead: [],
    },
    {
        sourcePath: 'unit-4/rate-of-change.md',
        bindings: [{ id: 'mis.roc.uses-endpoint-values', where: 'd' }],
        dead: [],
    },
];

test('§I the summary counts bindings per file and across the folder', () => {
    const summary = summarizeBindings(MANIFEST_INPUT);
    assert.equal(summary.total, 4);
    assert.deepEqual(
        summary.ids.map((i) => [i.id, i.count]),
        [
            ['mis.place-value.digit-reversal', 1],
            ['mis.roc.uses-endpoint-value', 2],
            ['mis.roc.uses-endpoint-values', 1],
        ],
    );
    // The console ordering is count-first: "what does this activity mostly
    // sense" is the question in front of the author reading a run.
    assert.deepEqual(summary.files[0].byCount.map(([id]) => id), [
        'mis.roc.uses-endpoint-value',
        'mis.place-value.digit-reversal',
    ]);
    assert.deepEqual(summary.singletons, [
        'mis.place-value.digit-reversal',
        'mis.roc.uses-endpoint-values',
    ]);
    assert.equal(summary.nearDuplicates.length, 1);
});

test('§I an id used in two files names both, sorted', () => {
    const summary = summarizeBindings([
        { sourcePath: 'b.md', bindings: [{ id: 'mis.a.b', where: 'x' }], dead: [] },
        { sourcePath: 'a.md', bindings: [{ id: 'mis.a.b', where: 'y' }], dead: [] },
    ]);
    assert.deepEqual(summary.ids[0].files, ['a.md', 'b.md']);
});

test('§I the manifest is deterministic — same input, byte-identical output', () => {
    // The artifact is committed so that a binding change is a reviewable diff.
    // A timestamp, a run mode, or a count that depends on the DATABASE would
    // make every run a diff and the review worthless.
    const first = renderManifest(summarizeBindings(MANIFEST_INPUT));
    const second = renderManifest(summarizeBindings(MANIFEST_INPUT));
    assert.equal(first, second);
    assert.doesNotMatch(first, /\d{4}-\d{2}-\d{2}/, 'the manifest carries a date');
    assert.doesNotMatch(first, /DRY RUN|skipped|refused/, 'the manifest carries run state');
});

test('§I the manifest says it is not a CI artifact, in the file itself', () => {
    // The next reader's obvious idea is a drift gate. It cannot pass: the .md
    // files are outside the repo. The file has to say so where that reader is
    // standing, which is in the file.
    const text = renderManifest(summarizeBindings(MANIFEST_INPUT));
    assert.match(text, /NOT A CI-GATED ARTIFACT/);
    assert.match(text, /OUTSIDE this repository/);
});

test('§I the manifest lists ids alphabetically, for the diff', () => {
    const text = renderManifest(summarizeBindings(MANIFEST_INPUT));
    const rows = text
    .split('\n')
    .filter((line) => line.startsWith('| `mis.'))
    .map((line) => line.split('`')[1]);
    assert.deepEqual(rows, [...rows].sort());
});

test('§I an empty catalogue still produces a manifest, not a stale one', () => {
    // Removing the last binding has to show up as a diff too, which it cannot
    // do if the file is only written when there is something to write.
    const text = renderManifest(summarizeBindings([]));
    assert.match(text, /No misconception bindings/);
    assert.match(text, /NOT A CI-GATED ARTIFACT/);
});

// ---- the flags --------------------------------------------------------------

test('§I --strict and --registry parse, in either form', () => {
    assert.deepEqual(
        parseArgs(['~/cat', '--strict', '--registry', 'tax.txt', '--owner=me']),
        {
            folder: '~/cat',
            owner: 'me',
            dryRun: false,
            force: false,
            strict: true,
            registry: 'tax.txt',
            skillsRegistry: null,
        },
    );
    assert.equal(parseArgs(['~/cat', '--registry=tax.txt']).registry, 'tax.txt');
    assert.equal(parseArgs(['~/cat']).strict, false);
    assert.equal(parseArgs(['~/cat']).registry, null);
});

// §I.22 — the ported numeric parser must agree with the one that MARKS.
// The dead-binding check answers "would this match score correct?", and on a
// numeric blank that is a numeric question. Its parser is a COPY of the
// server's (the check runs synchronously; the pipeline loads async), so the
// copy is bound to the original by behaviour rather than by a promise: drift
// either reports a live binding dead — failing an author's run under --strict
// for no reason — or misses a dead one, which is the silent-sensor failure the
// whole arc exists to prevent.
test('§I.22 the ported numeric parser matches the server grader exactly', () => {
    const real = pipeline.parseNumericValue;
    assert.equal(
        typeof real,
        'function',
        'the pipeline must expose the server parser, or this guard is vacuous',
    );
    // A DELIBERATE mutation proves this guard is not vacuous: widen the copy's
    // DECIMAL_RE (say, to accept a trailing dot) and '3.' below diverges.
    const cases = [
        // the accepted forms numeric.ts documents
        '3', '-2.5', '.75', '+4', '1e3', '2.5E-2',
        '3/4', '-3/4', '1.5/3', '1 1/2', '-2 3/4',
        '1,234.5', '$3.50', '$1,000',
        // and the rejections, which matter just as much: a form the copy
        // accepted but the grader did not would invent a dead binding
        'no solution', '', '   ', 'abc', '1/0', '3..4', '--5', '1 1/0', '3.', '.', '1e', '$', '1 1/2 1/2',
        '0.5', '.5', '0.50', '1/2', '2/4',
    ];
    for (const input of cases) {
        assert.deepEqual(
            parseNumericValue(input),
            real(input),
            `parser disagreement on ${JSON.stringify(input)}`,
        );
    }
});

// =============================================================================
// §K — DECLARED IDENTITY, chains, and skill coverage (Lane A, 2026-08-26)
// -----------------------------------------------------------------------------
// Plan + rulings: docs/design/curriculum-alignment.md.
//
// THE LOAD-BEARING ROW IS "a moved keyed file is an update, not an orphan".
// That single behaviour is the whole reason this slice exists: under
// path-identity every editorial act the curriculum model calls normal — split,
// rename, re-file a chain — orphaned a row and minted a duplicate. Everything
// else here supports it or reports on it.
// =============================================================================

const keyedRow = (over = {}) => ({
    id: 'row-1',
    title: 'Unit Rates',
    source_path: '01-chain.rate.proportional/01-unit-rate.md',
    source_key: 'act.rate.unit-rate',
    status: 'published',
    ...over,
});

test('§K a MOVED keyed file updates its row and reports no orphan', () => {
    // The regression this slice exists to prevent. Before declared identity
    // this exact input produced one create and one orphan, and the activity's
    // published history was stranded on the row nobody pointed at.
    const { creates, updates, orphans } = planIdentity(
        [{ sourcePath: '02-chain.rate.proportional/03-unit-rate.md', key: 'act.rate.unit-rate' }],
        [keyedRow()],
    );
    assert.equal(creates.length, 0);
    assert.equal(orphans.length, 0);
    assert.equal(updates.length, 1);
    assert.equal(updates[0].matchedBy, 'key');
    assert.equal(updates[0].moved, true);
    assert.equal(updates[0].row.id, 'row-1');
});

test('§K the CUTOVER: a keyed file adopts a row that has only a path', () => {
    // Step 3 of the cutover, and the reason path matching is not merely the
    // keyless fallback: with paths untouched, one run teaches every existing
    // row its key. A key-only matcher would make this N creates and N orphans.
    const { creates, updates, orphans } = planIdentity(
        [{ sourcePath: 'year-8/rates/activity-01.md', key: 'act.rate.unit-rate' }],
        [keyedRow({ source_path: 'year-8/rates/activity-01.md', source_key: null })],
    );
    assert.equal(creates.length, 0);
    assert.equal(orphans.length, 0);
    assert.equal(updates[0].matchedBy, 'path');
    assert.equal(updates[0].adoptsKey, true);
});

test('§K a keyless file still matches on its path, and adopts nothing', () => {
    const { updates } = planIdentity(
        [{ sourcePath: 'year-8/rates/activity-01.md', key: null }],
        [keyedRow({ source_path: 'year-8/rates/activity-01.md', source_key: null })],
    );
    assert.equal(updates[0].matchedBy, 'path');
    assert.equal(updates[0].adoptsKey, false);
});

test('§K a key edited IN PLACE is a conflict, never a silent second activity', () => {
    // "Retire and mint" is an editorial act with a link cost; it cannot be done
    // by editing a line, because the old row still holds the path and 0038's
    // index would reject the new row with an opaque 23505.
    const { creates, updates, conflicts } = planIdentity(
        [{ sourcePath: '01-chain.rate.proportional/01-unit-rate.md', key: 'act.rate.renamed' }],
        [keyedRow()],
    );
    assert.equal(creates.length, 0);
    assert.equal(updates.length, 0);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].was, 'act.rate.unit-rate');
    assert.equal(conflicts[0].now, 'act.rate.renamed');
});

test('§K a genuinely deleted file is still an orphan', () => {
    // The other half of the same rule: orphans are computed from what was
    // CONSUMED, so making moves invisible must not make deletions invisible.
    const { orphans } = planIdentity([], [keyedRow()]);
    assert.equal(orphans.length, 1);
    assert.equal(orphans[0].id, 'row-1');
});

test('§K hand-made rows (no path, no key) are invisible in both directions', () => {
    const { creates, updates, orphans } = planIdentity(
        [{ sourcePath: 'a.md', key: 'act.a' }],
        [{ id: 'hand', title: 'Made in the app', source_path: null, source_key: null }],
    );
    assert.equal(creates.length, 1);
    assert.equal(updates.length, 0);
    assert.equal(orphans.length, 0);
});

// ---- the key pre-scan, and its cross-check ----------------------------------

test('§K scanSourceKey reads the key the REAL parser reads', () => {
    // The pre-scan exists because identity must be known before conversion.
    // Two readers of one syntax is a defect unless they are compared, so the
    // importer compares them on every file — this is that comparison, run over
    // the shapes most likely to diverge.
    const cases = [
        ['```meta\nkey: act.rate.unit-rate\ntitle: T\n```\n\n# Body', 'act.rate.unit-rate'],
        ['# Body first\n\n```meta\ntitle: T\nkey:   act.spaced   \n```', 'act.spaced'],
        ['```meta\ntitle: T\n```', null],
        ['# No fence at all', null],
    ];
    for (const [markdown, expected] of cases) {
        assert.equal(scanSourceKey(markdown), expected, `scan: ${JSON.stringify(markdown)}`);
        const viaParser = convertOne(pipeline, markdown, null, 'x.md').sourceKey;
        assert.equal(viaParser, expected, `parser: ${JSON.stringify(markdown)}`);
    }
});

test('§K suggestKeyFor turns a path into a copy-pasteable key', () => {
    assert.equal(
        suggestKeyFor('01-chain.rate.proportional/02-unit-rate.md'),
        'act.rate.unit-rate',
    );
    assert.equal(suggestKeyFor('loose-file.md'), 'act.loose-file');
});

// ---- the chain registry -----------------------------------------------------

test('§K parseChainRegistry splits on the FIRST = and ignores comments', () => {
    // A title may contain anything, including the `:` an early draft of this
    // format put in front of it — so the split cannot be on punctuation inside
    // the value.
    const { titles } = parseChainRegistry(
        '# a comment\n\n01-chain.rate.proportional = 1: Rates = and more\nbad-line\n',
    );
    assert.equal(titles.get('01-chain.rate.proportional'), '1: Rates = and more');
    assert.equal(titles.size, 1);
});

test('§K two chains sharing a title are flagged', () => {
    // Invisible otherwise: the activities list groups by the unit STRING, so
    // the two chains merge into one outline group with nothing to show they
    // were ever separate.
    const { titles } = parseChainRegistry(
        '01-chain.a = Rates\n02-chain.b = rates\n03-chain.c = Slope\n',
    );
    const dupes = duplicateChainTitles(titles);
    assert.equal(dupes.length, 1);
    assert.deepEqual(dupes[0].sort(), ['01-chain.a', '02-chain.b']);
});

test('§K chainFolderOf reads the first segment, or null in the root', () => {
    assert.equal(chainFolderOf('01-chain.rate.proportional/01-unit-rate.md'), '01-chain.rate.proportional');
    assert.equal(chainFolderOf('loose.md'), null);
});

test('§K a chain title fills `unit`, and a file may still override it', () => {
    const withoutUnit = [
        '```meta',
        'title: Unit Rates',
        'key: act.rate.unit-rate',
        '```',
        '',
        'Body text.',
    ].join('\n');
    const filled = convertOne(pipeline, withoutUnit, null, '01-chain.rate/01-x.md', {
        chainTitle: 'Rates and Proportional Relationships',
    });
    assert.equal(filled.document.meta.unit, 'Rates and Proportional Relationships');
    assert.equal(filled.unitOverride, null);

    const stated = convertOne(pipeline, SAMPLE, null, '01-chain.rate/01-x.md', {
        chainTitle: 'Rates and Proportional Relationships',
    });
    assert.equal(stated.document.meta.unit, 'Unit 3'); // the file wins
    assert.equal(stated.unitOverride.stated, 'Unit 3');
});

test('§K repeating the chain title verbatim is NOT an override', () => {
    // The property that keeps the override report readable. A drafting prompt
    // that emits `unit:` on every file would otherwise make every file an
    // override, and a report that fires on 100% of rows is a report nobody
    // reads the real divergence out of.
    const md = ['```meta', 'title: T', 'unit: Rates', '```', '', 'Body.'].join('\n');
    const out = convertOne(pipeline, md, null, '01-chain.rate/01-x.md', {
        chainTitle: 'Rates',
    });
    assert.equal(out.unitOverride, null);
});

test('§K a chain rename beats the value already on the row', () => {
    // Precedence: file > registry > prior. Reading the prior value first would
    // pin every existing activity to the name it was imported under, which is
    // exactly what a rename is trying to change.
    const md = ['```meta', 'title: T', 'key: act.a', '```', '', 'Body.'].join('\n');
    const row = { title: 'T', tags: [], draftMeta: { unit: 'Old Name', course: 'Algebra I' } };
    const out = convertOne(pipeline, md, row, '01-chain.rate/01-x.md', {
        chainTitle: 'New Name',
    });
    assert.equal(out.document.meta.unit, 'New Name');
});

// ---- skill coverage ---------------------------------------------------------

const COVERAGE_FILES = [
    { sourcePath: 'a.md', primarySkill: 'rate.unit-rate', supportingSkills: [], published: true, chainRole: 'part' },
    {
        sourcePath: 'b.md',
        primarySkill: 'rate.constant',
        supportingSkills: ['rate.unit-rate'],
        published: false,
        chainRole: 'part',
    },
    { sourcePath: 'c.md', primarySkill: null, supportingSkills: [], published: false, chainRole: 'part' },
];

/** A registry in the shape parseSkillRegistry returns. */
const reg = (idList, parts = {}) => ({
    ids: new Set(idList),
    parts: new Map(Object.entries(parts)),
    malformed: [],
});

test('§K coverage answers "N of the registry covered", not "N mentioned"', () => {
    // The whole reason the registry is required: without it the uncovered list
    // — the only actionable half — cannot be computed at all.
    const summary = summarizeCoverage(
        COVERAGE_FILES,
        reg(['rate.unit-rate', 'rate.constant', 'rate.compare', 'proportional.graph']),
    );
    assert.equal(summary.covered.length, 2);
    assert.deepEqual(summary.uncovered, ['proportional.graph', 'rate.compare']);
    assert.deepEqual(summary.withoutPrimary, ['c.md']);
});

test('§K a skill covered only by a DRAFT is not counted as published', () => {
    // The curriculum model excludes drafts from progress counts; folding them
    // in would make the burndown measure generation rather than curriculum.
    const summary = summarizeCoverage(COVERAGE_FILES, reg(['rate.unit-rate', 'rate.constant']));
    const unitRate = summary.covered.find((e) => e.id === 'rate.unit-rate');
    const constant = summary.covered.find((e) => e.id === 'rate.constant');
    assert.equal(unitRate.published, true);
    assert.equal(constant.published, false);
});

test('§K a skill outside the registry is reported, never silently counted', () => {
    const summary = summarizeCoverage(
        [{ sourcePath: 'a.md', primarySkill: 'rate.typo', supportingSkills: [], published: true, chainRole: 'part' }],
        reg(['rate.unit-rate']),
    );
    assert.deepEqual(summary.unregistered, ['rate.typo']);
    assert.deepEqual(summary.uncovered, ['rate.unit-rate']);
});

test('§K the coverage manifest NAMES the uncovered skills', () => {
    // A count cannot be acted on. This artifact exists so "0 covered" becomes a
    // work list rather than a number.
    const text = renderCoverageManifest(
        summarizeCoverage(COVERAGE_FILES, reg(['rate.unit-rate', 'rate.compare'])),
    );
    assert.match(text, /1 of 2 skills covered/);
    assert.match(text, /## Uncovered/);
    assert.match(text, /rate\.compare/);
    assert.match(text, /NEVER CI-GATED/);
});

test('§K both coverage artifacts are deterministic — no timestamp, no run facts', () => {
    // Same discipline as the misconception manifest beside it: the file is a
    // pure function of the folder, so a git diff shows coverage changes and
    // nothing else. The builder's staleness guard reads the `files` list
    // instead, which is exact where a timestamp is a proxy.
    const summary = summarizeCoverage(COVERAGE_FILES, reg(['rate.unit-rate']));
    const once = renderCoverageManifest(summary);
    const twice = renderCoverageManifest(summary);
    assert.equal(once, twice);
    assert.doesNotMatch(once, /\d{4}-\d{2}-\d{2}T/);
    const json = coverageJson(summary);
    assert.equal(json.schema, 'activity-platform/skill-coverage@1');
    assert.deepEqual(json.files, ['a.md', 'b.md', 'c.md']);
    assert.doesNotMatch(JSON.stringify(json), /\d{4}-\d{2}-\d{2}T/);
});

test('§K the missing-column refusal routes on what the DATABASE named', () => {
    // A real defect, caught by running the importer against the live database
    // rather than by reading the code: the thrown error embeds the request
    // path, the path carries the whole select list, and a substring test
    // therefore matched a column that was present. The run told the author to
    // apply a migration they had applied five days earlier.
    const real =
        'GET /activities?owner_id=eq.abc&select=id,source_path,source_key,status,' +
        'title,draft_content,source_fingerprint → 400: ' +
        '{"code":"42703","message":"column activities.source_key does not exist"}';
    assert.equal(missingColumnFrom(real), 'source_key');

    const other = real.replace('source_key does not exist', 'source_fingerprint does not exist');
    assert.equal(missingColumnFrom(other), 'source_fingerprint');

    assert.equal(missingColumnFrom('GET /activities → 401: bad key'), null);
    assert.equal(missingColumnFrom(undefined), null);
});

// ---- part counts and the consolidation carve-out (2026-08-26) --------------

test('§K parseSkillRegistry reads bare ids and `id = n` part counts', () => {
    const { ids, parts, malformed } = parseSkillRegistry(
        '# comment\n\nrate.unit-rate\nrate.proportional-graph = 2\nrate.bad = many\n',
    );
    assert.deepEqual([...ids].sort(), ['rate.bad', 'rate.proportional-graph', 'rate.unit-rate']);
    assert.equal(parts.get('rate.proportional-graph'), 2);
    assert.equal(parts.has('rate.unit-rate'), false, 'absence means one part');
    assert.deepEqual(malformed, [{ id: 'rate.bad', count: 'many' }]);
});

test('§K a CONSOLIDATION does not count as a part of the skill it names', () => {
    // THE LOAD-BEARING ROW for chain_role reaching this script at all. Activity
    // 04 names the chain's terminal skill as primary but does not teach it —
    // activity 03 did. Counting it as a part would report a fully-taught
    // one-part skill as partial forever, and fire exceeds-declared-parts on
    // every well-formed chain.
    const summary = summarizeCoverage(
        [
            { sourcePath: '03-graph.md', primarySkill: 'rate.proportional-graph', supportingSkills: [], published: true, chainRole: 'part' },
            { sourcePath: '04-consolidation.md', primarySkill: 'rate.proportional-graph', supportingSkills: [], published: true, chainRole: 'consolidation' },
        ],
        reg(['rate.proportional-graph']),
    );
    const e = summary.covered[0];
    assert.deepEqual(e.parts, ['03-graph.md']);
    assert.deepEqual(e.consolidations, ['04-consolidation.md']);
    assert.equal(e.complete, true, 'one part declared, one part taught');
    assert.equal(e.exceedsDeclared, false);
    assert.deepEqual(summary.partial, []);
    assert.deepEqual(summary.exceeded, []);
});

test('§K a 2-part skill with only part 1 authored reads PARTIAL, not covered', () => {
    // The overclaim the part count exists to close: without it this skill reads
    // as covered the moment part 1 lands, while it is not yet taught.
    const summary = summarizeCoverage(
        [{ sourcePath: 'p1.md', primarySkill: 'rate.big', supportingSkills: [], published: true, chainRole: 'part' }],
        reg(['rate.big'], { 'rate.big': 2 }),
    );
    const e = summary.covered[0];
    assert.equal(e.declaredParts, 2);
    assert.equal(e.complete, false);
    assert.equal(e.published, false, 'an incomplete skill is not published-covered');
    assert.deepEqual(summary.partial, ['rate.big']);
    assert.match(renderCoverageManifest(summary), /partial \(1\/2\)/);
});

test('§K both parts published makes it covered AND published', () => {
    const summary = summarizeCoverage(
        [
            { sourcePath: 'p1.md', primarySkill: 'rate.big', supportingSkills: [], published: true, chainRole: 'part' },
            { sourcePath: 'p2.md', primarySkill: 'rate.big', supportingSkills: [], published: true, chainRole: 'part' },
        ],
        reg(['rate.big'], { 'rate.big': 2 }),
    );
    assert.equal(summary.covered[0].complete, true);
    assert.equal(summary.covered[0].published, true);
});

test('§K one part published and one in draft is covered but NOT published', () => {
    // "Published" has to mean the whole skill is reachable by a student, or a
    // half-published skill counts towards the number a teacher plans from.
    const summary = summarizeCoverage(
        [
            { sourcePath: 'p1.md', primarySkill: 'rate.big', supportingSkills: [], published: true, chainRole: 'part' },
            { sourcePath: 'p2.md', primarySkill: 'rate.big', supportingSkills: [], published: false, chainRole: 'part' },
        ],
        reg(['rate.big'], { 'rate.big': 2 }),
    );
    assert.equal(summary.covered[0].complete, true);
    assert.equal(summary.covered[0].published, false);
});

test('§K more teaching activities than declared parts is reported', () => {
    const summary = summarizeCoverage(
        [
            { sourcePath: 'a.md', primarySkill: 'rate.x', supportingSkills: [], published: true, chainRole: 'part' },
            { sourcePath: 'b.md', primarySkill: 'rate.x', supportingSkills: [], published: true, chainRole: 'part' },
        ],
        reg(['rate.x']),
    );
    assert.deepEqual(summary.exceeded, ['rate.x']);
});

test('§K a skill only LEANED ON is uncovered, not "partial (0/1)"', () => {
    // Reachable only since `supporting_skills:` was re-scoped to non-ancestors
    // (2026-08-26). Before the fix, naming a skill as supporting created a
    // coverage entry with zero parts, which read as partial — so it fell out of
    // the covered count AND out of the uncovered list. Mentioning a skill made
    // it vanish from the one report whose job is to say nothing teaches it.
    const summary = summarizeCoverage(
        [
            { sourcePath: 'a.md', primarySkill: 'rate.x', supportingSkills: ['rate.y'], published: true, chainRole: 'part' },
        ],
        reg(['rate.x', 'rate.y', 'rate.z']),
    );
    assert.deepEqual(summary.covered.map((e) => e.id), ['rate.x']);
    assert.deepEqual(summary.uncovered, ['rate.y', 'rate.z']);
    assert.deepEqual(summary.partial, []);
    assert.deepEqual(summary.leanedOnOnly, [{ id: 'rate.y', supporting: ['a.md'] }]);
});

test('§K the manifest says WHY a leaned-on skill is uncovered', () => {
    // An id nothing teaches but something leans on is a different gap from one
    // nobody has touched, and the difference is actionable.
    const text = renderCoverageManifest(
        summarizeCoverage(
            [{ sourcePath: 'a.md', primarySkill: 'rate.x', supportingSkills: ['rate.y'], published: true, chainRole: 'part' }],
            reg(['rate.x', 'rate.y']),
        ),
    );
    assert.match(text, /`rate\.y` — leaned on by `a\.md`, taught by nothing/);
});

test('§K parts authored/declared counts skills the corpus has not named yet', () => {
    // The burndown number, and the reason it lives here rather than in the
    // caller: the DENOMINATOR includes unauthored skills. An untouched 3-part
    // skill owes 3 parts, and no consumer reading only the covered list can
    // know that.
    const summary = summarizeCoverage(
        [{ sourcePath: 'p1.md', primarySkill: 'a.big', supportingSkills: [], published: true, chainRole: 'part' }],
        reg(['a.big', 'b.untouched', 'c.plain'], { 'a.big': 2, 'b.untouched': 3 }),
    );
    // authored: 1 (a.big part 1). declared: 2 + 3 + 1 = 6.
    assert.equal(summary.partsAuthored, 1);
    assert.equal(summary.partsDeclared, 6);
    assert.deepEqual(summary.multiPartSkills, { 'a.big': 2, 'b.untouched': 3 });
    assert.match(renderCoverageManifest(summary), /\*\*1 of 6 parts authored\.\*\*/);
});

test('§K a CONSOLIDATION does not count as a part of a multi-part skill either', () => {
    // The combination that becomes common once the 26 slack activities are
    // allocated: a chain gets both an extra part AND a consolidation, and the
    // consolidation names the same terminal skill. It must land in
    // consolidations[], leaving the skill honestly partial.
    const summary = summarizeCoverage(
        [
            { sourcePath: '01.md', primarySkill: 'x.term', supportingSkills: [], published: true, chainRole: 'part' },
            { sourcePath: '02.md', primarySkill: 'x.term', supportingSkills: [], published: true, chainRole: 'consolidation' },
        ],
        reg(['x.term'], { 'x.term': 2 }),
    );
    const e = summary.covered[0];
    assert.deepEqual(e.parts, ['01.md']);
    assert.deepEqual(e.consolidations, ['02.md']);
    assert.equal(e.complete, false, 'one of two parts taught');
    assert.equal(summary.partsAuthored, 1, 'the consolidation is not a part');
    assert.equal(summary.partsDeclared, 2);
    assert.deepEqual(summary.exceeded, [], 'and it must not read as exceeding the count');
});

test('§K with no registry there is no burndown to report', () => {
    const summary = summarizeCoverage(COVERAGE_FILES, null);
    assert.equal(summary.partsAuthored, null);
    assert.equal(summary.partsDeclared, null);
    assert.deepEqual(summary.multiPartSkills, {});
});
