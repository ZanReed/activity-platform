#!/usr/bin/env node
// =============================================================================
// batch-import.mjs — a folder of .md files → the activities table, re-runnably
// -----------------------------------------------------------------------------
// Plan + rulings: docs/design/batch-importer.md (eng review 2026-08-20, D1–D4).
//
// The author pre-authors the ~150-activity catalogue as markdown files in a
// folder outside this repo. This script makes that folder the source of truth:
// re-running it UPDATES rather than duplicates, which is the entire point — it
// turns a format bug from a 150-file archaeology session into a re-run.
//
// ---- Run --------------------------------------------------------------------
//
//   cp .env.supabase.example .env.supabase        # once; gitignored
//   pnpm import:batch ~/catalogue --owner me@example.com --dry-run
//   pnpm import:batch ~/catalogue --owner me@example.com
//
// (A leading `--` is tolerated too — pnpm forwards it rather than consuming
// it, so both `pnpm import:batch --  ~/catalogue` and the bare form work.)
//
// Service-role credentials, so it runs author-side only. It writes exclusively
// to `activities` rows owned by --owner; it cannot touch student work, and it
// never publishes (see PUBLISHING below).
//
// ---- The pipeline -----------------------------------------------------------
//
//   folder/**/*.md
//      │  relative POSIX path  ──────────────────────────┐ (the identity, D1)
//      ▼                                                 │
//   getMarkdownImporter()  → ImportResult                │
//      │                                                 │
//      ├─ .meta ──▶ CREATE: applyImportedMeta (D16)      │  reused, not rewritten
//      │            UPDATE: the file wins, changes printed│  (D5)
//      ▼                                                 │
//   wrapBlocksStrict(blocks) ─▶ tiptapToActivity(doc,meta)│
//      │                                                 │
//      ▼  ActivityDocument.safeParse()  ← gate            │
//   ┌──────────────────────────────────────────┐          │
//   │ existing row with this source_path?  ─────┼──────────┘
//   │   yes → PATCH   no → POST (mint a slug)  │
//   └──────────────────────────────────────────┘
//   rows whose source_path is no longer on disk → REPORTED, never touched (D2)
//
// ---- Four decisions worth not re-deriving -----------------------------------
//
// D1 IDENTITY IS `source_path`, NOT `slug`. Migration 0038 adds the column and
//    a partial unique index on (owner_id, source_path). Keying on a
//    filename-derived slug needs no migration and is wrong: `slug` is
//    title-derived and frozen at create (lib/slug.ts), so a hand-authored
//    activity titled "Factoring Quadratics" already owns `factoring-quadratics`
//    and importing `factoring-quadratics.md` would silently overwrite its
//    draft. 0037's header states the principle: one column, one meaning.
//
// D2 A DELETED .md FILE IS REPORTED, NEVER ACTED ON. Orphans are listed and
//    nothing changes. "Surface, never drop" is the house style, and a script
//    that deletes teacher work on a filesystem inference is not a thing this
//    repo should own.
//
// D3 ONE BAD FILE IS SKIPPED, NOT FATAL. Every good file lands; the bad ones
//    are named with their error, and the exit code is 1 so a wrapper still
//    knows the run was not clean. Aborting the batch would mean one typo costs
//    a re-run of 150.
//
// D4 THE PIPELINE IS BUNDLED ON RUN, NOT COMMITTED. esbuild builds
//    packages/app/src/lib/batchImportPipeline.ts in memory at startup (~1s).
//    The two COMMITTED bundles exist because Edge Functions deploy those exact
//    bytes and CI must stop a stale deploy; this script has no deploy surface —
//    it runs from a checkout — so a third committed bundle plus a third CI
//    drift guard would buy staleness protection that nothing here needs.
//
// D5 ON A RE-IMPORT, THE FILE WINS — and every field it changes is printed.
//    applyImportedMeta's never-clobber rule is used for CREATES only. Keeping
//    it on updates would make the headline promise false: a title fixed in the
//    .md would be refused forever. The blast radius is bounded by construction
//    — only rows with a non-NULL source_path are ever updated, and those exist
//    because this script created them. See convertOne.
//
// ---- PUBLISHING: not possible from here, and that is a fact not a choice ----
//
// `publish_activity` (0037 §C) authorizes through `can_edit_activity`, which is
// `owner_id = auth.uid()`. A service-role key has NO auth.uid(), so the RPC
// raises "Not authorized to publish this activity" — and `activity_versions
// .created_by` is `not null` (0001:129), so even bypassing the check the insert
// would fail. There is no email+password auth in this project, so a
// non-interactive user JWT is not available either. This script writes DRAFTS.
// The author publishes from the app, which is also the right place for a
// one-way-ish act on 150 activities.
//
// ---- What it writes, and what it deliberately does not ----------------------
//
// The write payload MIRRORS the app's own autosave (ActivityEditor.tsx:542) —
// draft_content, title, tags, pedagogical_role, updated_at — plus source_path
// on create. It does NOT write `course`/`unit`: those columns are PUBLISH-truth
// (0037 ruling R1), stamped only by publish_activity from the published
// snapshot. A second writer there would let the catalog advertise a course name
// no student has been served. The course/unit an author puts in a ```meta fence
// still lands — in the DOCUMENT's meta, where the editor reads it and where
// publish will stamp it from.
//
// ZERO RUNTIME DEPENDENCIES beyond esbuild (a root devDependency;
// bundle-viewer-server.mjs already imports it). PostgREST over plain fetch,
// because `@supabase/supabase-js` is a dependency of packages/app and pnpm's
// strict node_modules means a root script cannot resolve it — the same reason
// backfill-census.js talks HTTP directly.
// =============================================================================

import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repo = resolve(__dirname, '..');

// =============================================================================
// Pure planning logic — exported so scripts/tests/batch-import.test.mjs can
// exercise it with no database and no filesystem. The decisions that matter
// (create vs update vs orphan) live here on purpose; main() below is plumbing.
// =============================================================================

/**
 * A key-sorted serialization of any JSON value.
 *
 * WHY SORTED (0039's header has the long version): the fingerprint compares a
 * document we serialized in JS against the same document after a round trip
 * through `jsonb`, and jsonb does NOT preserve key order. Hashing
 * JSON.stringify output directly would therefore report drift on every row of
 * every run — a guard that cries wolf is a guard the author disables.
 */
export function canonicalJson(value) {
    if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
    if (value !== null && typeof value === 'object') {
        const keys = Object.keys(value).sort();
        return `{${keys
            .map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`)
            .join(',')}}`;
    }
    // undefined can appear as an object value; JSON.stringify drops those keys,
    // and so must this — otherwise the two sides disagree about a field that
    // was never sent.
    return value === undefined ? 'null' : JSON.stringify(value);
}

/** The stored-draft fingerprint (0039). Null document → null, never a hash of
 *  the string "null" — an absent draft has no fingerprint to compare. */
export function fingerprintDocument(document) {
    if (document === null || document === undefined) return null;
    return createHash('sha256').update(canonicalJson(document)).digest('hex');
}

/**
 * Which planned updates were edited IN THE APP since the importer last wrote
 * them (D7.4) — the rows where "the file wins" would destroy real work.
 *
 * Returns { safe, drifted }. A row whose `source_fingerprint` is NULL is SAFE:
 * it predates the guard (or predates 0039), so there is nothing to compare and
 * refusing it would block a catalogue that was imported before this existed.
 * Those rows get a fingerprint written on this run, which is how the guard arms
 * itself without a backfill.
 */
export function splitDriftedUpdates(updates, { force = false } = {}) {
    const safe = [];
    const drifted = [];
    for (const entry of updates) {
        const stored = entry.row.source_fingerprint ?? null;
        const current = fingerprintDocument(entry.row.draft_content ?? null);
        if (stored !== null && current !== null && stored !== current && !force) {
            drifted.push(entry);
        } else {
            safe.push(entry);
        }
    }
    return { safe, drifted };
}

/**
 * Split the world into creates, updates and orphans.
 *
 *   files    — [{ sourcePath }]   relative POSIX paths found on disk
 *   existing — [{ id, source_path, ... }]  the owner's non-deleted rows
 *
 * A row with a NULL source_path is invisible here in both directions: it was
 * authored in the app, so it is neither updatable by a file nor orphanable by
 * one. That is the property that makes the whole scheme safe to run against a
 * database full of hand-made activities.
 */
export function planIdentity(files, existing) {
    const byPath = new Map();
    for (const row of existing) {
        if (row.source_path) byPath.set(row.source_path, row);
    }

    const creates = [];
    const updates = [];
    const seen = new Set();

    for (const file of files) {
        seen.add(file.sourcePath);
        const row = byPath.get(file.sourcePath);
        if (row) updates.push({ file, row });
        else creates.push({ file });
    }

    // Orphans: imported rows whose file is gone. REPORTED ONLY (D2).
    const orphans = [...byPath.values()].filter((r) => !seen.has(r.source_path));

    return { creates, updates, orphans };
}

/**
 * Every .md file under `root`, as POSIX-relative paths, sorted so a run's
 * output is stable and diffable between runs.
 *
 * Dot-directories are skipped: a catalogue folder under version control has a
 * .git full of nothing importable, and walking it is pure cost.
 */
export async function findMarkdownFiles(root) {
    const found = [];
    const walk = async (dir) => {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name.startsWith('.')) continue;
            const full = join(dir, entry.name);
            if (entry.isDirectory()) await walk(full);
            else if (entry.name.toLowerCase().endsWith('.md')) found.push(full);
        }
    };
    await walk(root);
    return found
    .map((full) => ({
        absolute: full,
        // POSIX separators always: the same catalogue folder opened on macOS
        // and on Windows must produce the same identity, or a cross-platform
        // re-run would duplicate every activity.
        sourcePath: relative(root, full).split(sep).join('/'),
    }))
    .sort((a, b) => (a.sourcePath < b.sourcePath ? -1 : 1));
}

/**
 * Build the ActivityDocument for one file.
 *
 * `existingRow` is null for a create, and carries the row's current
 * title/tags/role/draft-meta for an update. The two cases use DIFFERENT merge
 * authority, and the difference is ruling D5:
 *
 *   CREATE — applyImportedMeta, the shipped NEVER-CLOBBER merge (D16). Every
 *            field is unset, so every fence key lands; this is exactly the case
 *            that function was written for, and reusing it means the script and
 *            the editor's Import dialog agree about what a ```meta fence means.
 *
 *   UPDATE — THE FILE WINS, and every field it changes is reported. The folder
 *            is the source of truth for activities the importer OWNS, so fixing
 *            a title in the .md and re-running has to actually change the
 *            title. Never-clobber here would make the headline promise false: a
 *            typo fixed in the file would be rejected forever, with only a
 *            warning nobody reads at line 140 of a 150-file run.
 *
 * The safety this trades away is bounded, and deliberately so: only rows with a
 * non-NULL `source_path` are ever updated, and those rows exist because this
 * script created them. An activity authored in the app has no source_path, is
 * invisible to planIdentity, and can never be overwritten by a file.
 *
 * A key ABSENT from the fence leaves its field alone in both modes. That is
 * what makes a fence carrying only `tags:` legal — it must not blank the title.
 *
 * Throws on anything that would put a bad document in draft_content. The caller
 * turns that into a skip + a report (D3).
 */
export function convertOne(pipeline, markdown, existingRow, sourcePath) {
    const result = pipeline.importer(markdown);

    if (
        result.blocks.length === 0 &&
        !result.referencePanel &&
        result.meta === undefined
    ) {
        throw new Error(
            'no importable content (no blocks, no reference fence, no meta fence)',
        );
    }

    const fence = result.meta ?? {};
    const changes = [];
    let meta;
    let tags;
    let pedagogicalRole;
    let calculator;
    let warnings = [...result.warnings];

    if (!existingRow) {
        // ---- CREATE: the shipped never-clobber merge, on a blank target -----
        // A fence with no `title:` falls back to the FILENAME rather than to
        // the "Untitled activity" placeholder — see titleFromPath. The fence
        // still wins whenever it says anything, because the fallback is only
        // consulted for a key the fence does not carry.
        const fenceWithTitle =
            fence.title === undefined && sourcePath
                ? { ...fence, title: titleFromPath(sourcePath) ?? undefined }
                : fence;
        const outcome = pipeline.applyImportedMeta(fenceWithTitle, blankTarget(pipeline));
        meta = outcome.meta;
        tags = outcome.tags;
        pedagogicalRole = outcome.pedagogicalRole;
        calculator = outcome.calculator;
        warnings = [...warnings, ...outcome.warnings];
    } else {
        // ---- UPDATE: the file wins, and says so -----------------------------
        const prior = existingRow.draftMeta ?? {};
        const priorTitle = existingRow.title ?? pipeline.DEFAULT_TITLE;
        const priorTags = existingRow.tags ?? [];
        const priorRole = existingRow.pedagogical_role ?? null;
        const priorCourse = prior.course ?? pipeline.DEFAULT_COURSE;

        // `??` throughout: absent means "leave it alone", never "reset it".
        // ⚠ UNTYPED MERGE — `pnpm typecheck` covers none of this file, so a
        // schema field removed here is removed by hand or not at all. OV#18
        // named this exact line when `revisionMode` was deleted (R4).
        const computed = {
            title: fence.title ?? priorTitle,
            course: fence.course ?? priorCourse,
            submissionMode: fence.submissionMode ?? prior.submissionMode ?? 'free',
            activityType: fence.activityType ?? prior.activityType ?? 'worksheet',
            answerFeedback: fence.answerFeedback ?? prior.answerFeedback ?? 'on_check',
        };
        const unit = fence.unit ?? prior.unit;
        if (unit !== undefined) computed.unit = unit;

        // Everything the document already carried that no fence key describes
        // rides through untouched (print layout, typography, and anything a
        // later slice adds). Spreading the prior meta UNDER the computed one is
        // what stops this script from quietly deleting editor-only settings on
        // every re-run — the "save path is where fields die silently" trap.
        meta = { ...prior, ...computed };

        // Tags REPLACE rather than union on an update: the file is the source
        // of truth, so removing a tag from the fence has to remove it from the
        // row. (applyImportedMeta unions, which is right for a paste into an
        // existing activity and wrong here.)
        tags = fence.tags ? pipeline.normalizeTags(fence.tags) : priorTags;
        pedagogicalRole = fence.pedagogicalRole ?? priorRole;
        calculator = calculatorFor(
            pipeline,
            fence.calculatorMode,
            existingRow.draftCalculator,
        );

        // ---- the report (D5): every field the file changed ------------------
        if (meta.title !== priorTitle) {
            changes.push({ field: 'title', from: priorTitle, to: meta.title });
        }
        if (meta.course !== priorCourse) {
            changes.push({ field: 'course', from: priorCourse, to: meta.course });
        }
        if (meta.unit !== prior.unit) {
            changes.push({ field: 'unit', from: prior.unit, to: meta.unit });
        }
        if (pedagogicalRole !== priorRole) {
            changes.push({ field: 'role', from: priorRole, to: pedagogicalRole });
        }
        const added = tags.filter((t) => !priorTags.includes(t));
        const removed = priorTags.filter((t) => !tags.includes(t));
        if (added.length || removed.length) {
            changes.push({ field: 'tags', added, removed });
        }
    }

    const tiptap = pipeline.wrapBlocksStrict(result.blocks);

    // The ```reference fence is Tiptap JSON; ReferencePanel.blocks is schema
    // Block[]. Convert with the editor's own converter, never a hand-rolled
    // one, so an imported reference sheet and an authored one are the same
    // shape in the same column.
    const referencePanel = result.referencePanel
        ? pipeline.tiptapToReferencePanel(
            { type: 'doc', content: result.referencePanel.blocks },
            result.referencePanel.title,
        )
        : undefined;

    const doc = pipeline.tiptapToActivity(tiptap, meta, referencePanel, calculator);

    // THE GATE. draft_content is what the editor loads on next open, so a
    // document that fails validation must never reach the column. This is also
    // the only place the script can catch a pipeline regression before it is
    // 150 rows deep.
    const parsed = pipeline.ActivityDocument.safeParse(doc);
    if (!parsed.success) {
        const first = parsed.error.issues[0];
        throw new Error(
            'document failed schema validation at ' +
                `${first?.path?.join('.') || '<root>'}: ${first?.message ?? 'unknown'}`,
        );
    }

    return {
        document: parsed.data,
        title: meta.title,
        tags,
        pedagogicalRole,
        changes,
        warnings,
    };
}

/**
 * A human title for a file whose fence carries no `title:` key.
 *
 *   'unit-3/factoring-quadratics.md'  →  'Factoring Quadratics'
 *
 * WHY THIS EXISTS. Without it, every title-less file lands as the create-time
 * placeholder "Untitled activity" — which across a 150-file catalogue means 150
 * identically-named rows and a slug ladder of untitled-activity-2, -3, -4 …,
 * each needing a hand rename. That is precisely the cost applyImportedMeta's
 * `title` key was added to remove, and a file-driven importer already knows a
 * better answer than the placeholder: the filename the author chose.
 *
 * CREATE ONLY. On an update a missing fence title keeps the row's current
 * title — re-deriving from the filename there would silently rename an activity
 * whenever the fence's title key was removed, which is a change nobody asked
 * for.
 */
export function titleFromPath(sourcePath) {
    const base = sourcePath
    .split('/')
    .pop()
    .replace(/\.md$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

    if (base === '') return null;

    // Capitalise each word, leave the rest alone: "unit 3 factoring" reads as
    // "Unit 3 Factoring", and an already-cased "Factoring QUADRATICS" keeps its
    // shouting rather than being normalised into something the author did not
    // write.
    return base.replace(/(^|\s)(\S)/g, (_, sp, ch) => sp + ch.toUpperCase());
}

/**
 * The "nothing set yet" target applyImportedMeta merges a fence against.
 *
 * Built by the SCHEMA FACTORY, never hand-rolled. The hand-rolled version
 * listed title/course/the four settings and no `print`, which zod papered over
 * on the way out (PrintConfig is `.default({})`) — so the omission was
 * invisible until `applyImportedMeta` learned to read a nested field and the
 * first `work:` fence crashed on `meta.print.workSpace`. A literal that
 * duplicates schema defaults is a drift source that reports late and loudly.
 */
function blankTarget(pipeline) {
    return {
        meta: pipeline.createEmptyDocument().meta,
        tags: [],
        pedagogicalRole: null,
        calculator: undefined,
    };
}

/**
 * The calculator half of the update merge, extracted because its "absent" state
 * is the odd one out: `undefined` means no calculator, and the fence's explicit
 * 'off' has to be able to REMOVE one, which a plain `??` chain cannot express.
 */
function calculatorFor(pipeline, mode, prior) {
    if (mode === undefined) return prior;
    if (mode === 'off') return undefined;
    if (prior) {
        return { ...prior, restrictions: { ...prior.restrictions, mode } };
    }
    // No prior calculator: build one through the shipped merge so the
    // restriction defaults come from the schema factory rather than from here.
    return pipeline.applyImportedMeta({ calculatorMode: mode }, blankTarget(pipeline))
    .calculator;
}

/**
 * Render convertOne's `changes` for the run report (D5). One line per field,
 * quoting both sides, so "the file overwrote something you set in the app" is a
 * thing the author READS rather than a thing they discover weeks later.
 */
export function describeChanges(changes) {
    const show = (v) =>
        v === null || v === undefined || v === '' ? '<unset>' : `“${v}”`;
    return changes.map((c) => {
        if (c.field === 'tags') {
            const parts = [
                ...c.added.map((t) => `+${t}`),
                ...c.removed.map((t) => `-${t}`),
            ];
            return `tags   ${parts.join('  ')}`;
        }
        return `${c.field.padEnd(6)} ${show(c.from)} → ${show(c.to)}`;
    });
}

// =============================================================================
// The pipeline, bundled on run (D4)
// =============================================================================

/**
 * esbuild-bundle the app's conversion pipeline for node and import it.
 *
 * Exported because scripts/tests/batch-import.test.mjs calls it: that test is
 * the guard for the graph-kit BARREL regression, and it is bound to OUTPUT
 * rather than to a declaration. A grep-style test asserting "markdownToTiptap
 * does not import the barrel" would pass forever while some new transitive
 * import re-broke node. This actually bundles and runs the thing.
 */
export async function loadPipeline() {
    const result = await build({
        entryPoints: [resolve(repo, 'packages/app/src/lib/batchImportPipeline.ts')],
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'es2022',
        write: false,
        external: [],
        mainFields: ['module', 'main'],
        absWorkingDir: repo,
        define: { 'process.env.NODE_ENV': '"production"' },
        logLevel: 'silent',
    });

    const code = result.outputFiles[0].text;
    const mod = await import(
        `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
    );

    return {
        importer: await mod.getMarkdownImporter(),
        wrapBlocksStrict: mod.wrapBlocksStrict,
        tiptapToActivity: mod.tiptapToActivity,
        // The load half of the round trip. Only the TEST uses it (the script
        // never reloads what it just wrote) — it is here so §A can prove
        // import → save → reload → resave, the leg where fields die silently.
        activityToTiptap: mod.activityToTiptap,
        applyImportedMeta: mod.applyImportedMeta,
        ActivityDocument: mod.ActivityDocument,
        tiptapToReferencePanel: mod.tiptapToReferencePanel,
        createEmptyDocument: mod.createEmptyDocument,
        normalizeTags: mod.normalizeTags,
        slugify: mod.slugify,
        slugWithSuffix: mod.slugWithSuffix,
        DEFAULT_TITLE: mod.DEFAULT_TITLE,
        DEFAULT_COURSE: mod.DEFAULT_COURSE,
    };
}

// =============================================================================
// PostgREST, over plain fetch
// =============================================================================

/**
 * True for a legacy `service_role` / `anon` key, which IS a JWT.
 *
 * Supabase now issues two generations of key, both on the dashboard's API Keys
 * page, and they are sent DIFFERENTLY:
 *
 *   legacy  service_role / anon    a JWT ("eyJ…")   apikey + Authorization: Bearer
 *   new     sb_secret_… / sb_publishable_…          apikey ONLY
 *
 * The new keys are not JWTs, so putting one in `Authorization: Bearer` makes
 * the platform try to parse it as a JWT and REJECT the request — the docs call
 * this out precisely because "many Supabase clients do by default". This
 * script did too, until 2026-08-21.
 */
function isJwtKey(key) {
    return key.startsWith('eyJ');
}

/** Thrown by rejectUnusableKey so the guard stays pure — presentation (and the
 *  process exit) belongs to the caller, and a test can assert on it. */
export class UnusableKeyError extends Error {}

/**
 * Refuse a key that cannot do this job, BEFORE any work happens.
 *
 * A publishable / anon key is the dangerous mistake, because it does not fail
 * like a bad credential — it fails like an empty database. RLS hides every row
 * the script needs to see, so `existingFor()` returns [] and the planner
 * concludes that all 150 activities are CREATES. The inserts then fail one by
 * one, or (worse, on a future schema) some succeed and duplicate a catalogue
 * that was already there. Either way the run reports something untrue before it
 * reports anything wrong.
 *
 * The two shapes are distinguishable up front, so they are checked up front.
 * A legacy JWT's role sits in its payload; decode without verifying (we are not
 * authenticating anything here, just reading the author's own label back to
 * them) and say plainly which key they pasted.
 */
export function rejectUnusableKey(key) {
    if (key.startsWith('sb_publishable_')) {
        throw new UnusableKeyError(
            'That is a PUBLISHABLE key (sb_publishable_…), which is bound by row-level\n' +
                '  security. This script writes rows it does not own, so it needs the SECRET\n' +
                '  key from the same dashboard page (sb_secret_…, behind a Reveal button).\n\n' +
                '  A publishable key would not fail like a bad password — it would make the\n' +
                '  database look EMPTY, and the run would report every activity as new.',
        );
    }
    if (isJwtKey(key)) {
        try {
            const payload = JSON.parse(
                Buffer.from(key.split('.')[1] ?? '', 'base64url').toString('utf8'),
            );
            if (payload.role === 'anon') {
                throw new UnusableKeyError(
                    'That is the ANON key (its JWT says role: "anon"), which is bound by\n' +
                        '  row-level security. This script needs the service_role key, or a new\n' +
                        '  secret key (sb_secret_…), from Settings -> API Keys.\n\n' +
                        '  An anon key would make the database look EMPTY rather than erroring,\n' +
                        '  and the run would report every activity as new.',
                );
            }
        } catch (err) {
            // A decode failure is NOT a rejection: an unfamiliar-looking key
            // might be perfectly good, so let the request be the judge. But the
            // deliberate rejection above must not be swallowed by the same
            // catch that guards JSON.parse.
            if (err instanceof UnusableKeyError) throw err;
        }
    }
}

export function makeDb(url, key) {
    const base = `${url.replace(/\/$/, '')}/rest/v1`;
    // `apikey` always; `Authorization` only when the key can survive being
    // parsed as a JWT. Sending both unconditionally is what breaks a modern
    // secret key, and it fails as a 401 that reads like a bad credential
    // rather than a mis-sent one.
    const headers = {
        apikey: key,
        ...(isJwtKey(key) ? { Authorization: `Bearer ${key}` } : {}),
        'Content-Type': 'application/json',
    };

    const call = async (path, init = {}) => {
        const res = await fetch(`${base}${path}`, {
            ...init,
            headers: { ...headers, ...(init.headers ?? {}) },
        });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}: ${body}`);
        }
        return res.status === 204 ? null : res.json();
    };

    return {
        async findOwner(who) {
            // uuid or email, so the author can pass whichever they have to hand.
            const isUuid =
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(who);
            const filter = isUuid
                ? `id=eq.${who}`
                : `email=eq.${encodeURIComponent(who)}`;
            const rows = await call(`/users?${filter}&select=id,email,role&limit=2`);
            if (rows.length === 0) throw new Error(`no user matches --owner ${who}`);
            if (rows.length > 1) throw new Error(`--owner ${who} matched more than one user`);
            return rows[0];
        },

        existingFor(ownerId) {
            return call(
                `/activities?owner_id=eq.${ownerId}&deleted_at=is.null` +
                    '&select=id,source_path,title,tags,pedagogical_role,draft_content,source_fingerprint',
            );
        },

        create(rows) {
            return call('/activities', {
                method: 'POST',
                headers: { Prefer: 'return=representation' },
                body: JSON.stringify(rows),
            });
        },

        update(id, patch) {
            return call(`/activities?id=eq.${id}`, {
                method: 'PATCH',
                body: JSON.stringify(patch),
            });
        },
    };
}

// =============================================================================
// main
// =============================================================================

export function parseArgs(argv) {
    const positional = [];
    let owner = process.env.BATCH_IMPORT_OWNER ?? null;
    let dryRun = false;
    let force = false;

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        // A bare `--` is the conventional end-of-flags separator, and pnpm
        // passes it straight THROUGH to the script rather than eating it — so
        // `pnpm import:batch -- ~/catalogue` arrives here with '--' sitting
        // where the folder should be. Ignoring it costs nothing and makes both
        // invocations work, which matters because every doc and every habit
        // says to type it. (backfill-census.js is immune by accident: it only
        // ever calls argv.includes(), never reads a positional.)
        if (arg === '--') continue;
        if (arg === '--dry-run') dryRun = true;
        else if (arg === '--force') force = true;
        else if (arg === '--owner') owner = argv[++i] ?? null;
        else if (arg.startsWith('--owner=')) owner = arg.slice('--owner='.length);
        else if (arg.startsWith('--')) throw new Error(`unknown flag ${arg}`);
        else positional.push(arg);
    }

    return { folder: positional[0] ?? null, owner, dryRun, force };
}

function usage(message) {
    console.error(`
${message}

  pnpm import:batch <folder> --owner <email|uuid> [--dry-run] [--force]

  <folder>     the catalogue folder; every .md under it is imported, keyed on
               its path RELATIVE to this folder
  --owner      whose activities these are. Required — there is no sensible
               default, and guessing would write to the wrong teacher
  --dry-run    report what WOULD change; write nothing
  --force      overwrite even activities that were edited in the app since
               their last import. Without it those files are refused and named
               (their app-side edits would be destroyed -- the file wins)

  Credentials come from .env.supabase (cp .env.supabase.example .env.supabase).
`);
    process.exit(2);
}

async function main() {
    let args;
    try {
        args = parseArgs(process.argv.slice(2));
    } catch (err) {
        usage(err.message);
        return;
    }
    if (!args.folder) usage('Missing <folder>.');
    if (!args.owner) usage('Missing --owner.');

    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    if (!url || !key) {
        // NAME THE CONFUSION, because .env.supabase holds two credentials that
        // look interchangeable and are not (hit 2026-08-21). SUPABASE_DB_URL is
        // a Postgres connection string for psql — it drives verify-runner.mjs.
        // This script talks PostgREST over HTTP, which needs the service-role
        // JWT. A message that only said "missing key" would send someone
        // looking at the credential they already have.
        const hasDbUrl = Boolean(process.env.SUPABASE_DB_URL);
        usage(
            'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (see .env.supabase.example).' +
                (hasDbUrl
                    ? '\n\n  SUPABASE_DB_URL is set, and it is NOT this key. That one is a Postgres\n' +
                      '  connection string used by `pnpm verify:auth` via psql. This script speaks\n' +
                      '  PostgREST over HTTP and needs a key that bypasses RLS, from the\n' +
                      '  dashboard under Settings -> API Keys. EITHER generation works:\n' +
                      '    - a new secret key   (sb_secret_…)   preferred; sent on apikey only\n' +
                      '    - the legacy key     (service_role, "eyJ…")\n' +
                      '  Do NOT use a publishable/anon key — it is bound by RLS and this script\n' +
                      '  writes rows it does not own.'
                    : ''),
        );
    }

    const root = resolve(args.folder);
    const rootStat = await stat(root).catch(() => null);
    if (!rootStat?.isDirectory()) usage(`${root} is not a directory.`);

    try {
        rejectUnusableKey(key);
    } catch (err) {
        if (err instanceof UnusableKeyError) usage(err.message);
        throw err;
    }

    const db = makeDb(url, key);
    const owner = await db.findOwner(args.owner);

    console.log(`\ncatalogue : ${root}`);
    console.log(`owner     : ${owner.email} (${owner.id})`);
    console.log(
        `mode      : ${args.dryRun ? 'DRY RUN — nothing will be written' : 'WRITE'}` +
            `${args.force ? ' · --force (app-side edits WILL be overwritten)' : ''}\n`,
    );

    let files, existing, pipeline;
    try {
        [files, existing, pipeline] = await Promise.all([
            findMarkdownFiles(root),
            db.existingFor(owner.id),
            loadPipeline(),
        ]);
    } catch (err) {
        // 0039 adds the drift guard's column. Refuse up front with the fix
        // rather than letting the run proceed with the guard silently absent —
        // a safeguard nobody can see is not a safeguard (policy P3), and this
        // one exists to stop the author's own work being overwritten.
        if (/source_fingerprint/.test(err.message)) {
            usage(
                'The database is missing `activities.source_fingerprint`, which this\n' +
                    '  importer needs to tell an app-side edit from an unchanged draft.\n\n' +
                    '  Apply migration 0039 and re-run:\n' +
                    '    supabase db push',
            );
            return;
        }
        throw err;
    }

    // The row shape convertOne wants: draft meta lifted out of draft_content so
    // the never-clobber merge can see the course/settings an unpublished
    // activity is already carrying.
    const enriched = existing.map((row) => ({
        ...row,
        draftMeta: row.draft_content?.meta,
        draftCalculator: row.draft_content?.calculator,
    }));

    const { creates, updates, orphans } = planIdentity(files, enriched);

    // D7.4 — an activity edited IN THE APP since its last import is refused,
    // because "the file wins" would silently destroy that editing. Rows with no
    // recorded fingerprint (everything imported before 0039) pass through and
    // get one written, so the guard arms itself without a backfill.
    const { safe: updatable, drifted } = splitDriftedUpdates(updates, {
        force: args.force,
    });

    const skipped = [];
    const warned = [];
    const plannedCreates = [];
    const plannedUpdates = [];

    for (const { file } of creates) {
        try {
            const markdown = await readFile(file.absolute, 'utf8');
            const converted = convertOne(pipeline, markdown, null, file.sourcePath);
            plannedCreates.push({ file, converted });
            if (converted.warnings.length) warned.push({ file, warnings: converted.warnings });
        } catch (err) {
            skipped.push({ file, error: err.message });
        }
    }

    for (const { file, row } of updatable) {
        try {
            const markdown = await readFile(file.absolute, 'utf8');
            const converted = convertOne(pipeline, markdown, row, file.sourcePath);
            plannedUpdates.push({ file, row, converted });
            if (converted.warnings.length) warned.push({ file, warnings: converted.warnings });
        } catch (err) {
            skipped.push({ file, error: err.message });
        }
    }

    // ---- report -------------------------------------------------------------
    console.log(
        `found ${files.length} file${files.length === 1 ? '' : 's'} · ` +
            `${plannedCreates.length} to create · ${plannedUpdates.length} to update · ` +
            `${drifted.length} edited in the app · ` +
            `${orphans.length} orphan${orphans.length === 1 ? '' : 's'} · ` +
            `${skipped.length} skipped\n`,
    );

    if (drifted.length) {
        console.log(
            'REFUSED — edited in the app since the last import (the file would\n' +
                'overwrite that work). Re-export or fold the changes into the .md,\n' +
                'or pass --force to overwrite them:',
        );
        for (const { file } of drifted) console.log(`  refused  ${file.sourcePath}`);
        console.log('');
    }

    for (const { file, converted } of plannedCreates) {
        console.log(`  create  ${file.sourcePath}  →  “${converted.title}”`);
    }
    for (const { file, converted } of plannedUpdates) {
        console.log(`  update  ${file.sourcePath}  →  “${converted.title}”`);
        // D5: the file wins on an update, so every field it changed is named.
        // An overwrite the author cannot see is the failure this printing
        // exists to prevent — it is the price of file authority, not a nicety.
        for (const line of describeChanges(converted.changes)) {
            console.log(`            ${line}`);
        }
    }

    if (warned.length) {
        console.log('\nwarnings (imported, but something degraded):');
        for (const { file, warnings } of warned) {
            for (const w of warnings) console.log(`  ${file.sourcePath}: ${w}`);
        }
    }

    if (orphans.length) {
        // D2: reported, never acted on.
        console.log('\norphans — in the database, no longer on disk:');
        for (const row of orphans) {
            console.log(`  ${row.source_path}  →  ${row.id}  “${row.title}”`);
        }
        console.log('  Nothing was changed. Delete these in the app if they are really gone.');
    }

    // Skips are printed ONCE, at the end of the run — the write loop can add to
    // this list (a failed PATCH is a skip too), so printing here as well would
    // show a 150-file author two different lists and leave them working out
    // which one was final.
    if (args.dryRun) {
        if (skipped.length) {
            console.log('\nskipped:');
            for (const { file, error } of skipped) {
                console.log(`  ${file.sourcePath}  ${error}`);
            }
        }
        console.log('\nDRY RUN — nothing was written.\n');
        // A refusal is an outcome that needs the author's attention, exactly like
        // a skip — a dry run that reported refusals must not exit clean.
        process.exit(skipped.length > 0 || drifted.length > 0 ? 1 : 0);
    }

    // ---- write --------------------------------------------------------------
    // Updates first: they are the re-run case, they cannot collide on a slug,
    // and doing them before any insert means a failed create never leaves the
    // existing corpus half-refreshed.
    let updated = 0;
    for (const { file, row, converted } of plannedUpdates) {
        try {
            // The payload MIRRORS the app's autosave (ActivityEditor.tsx:542).
            // course/unit are absent deliberately — publish-truth, one writer.
            await db.update(row.id, {
                draft_content: converted.document,
                title: converted.title,
                tags: converted.tags,
                pedagogical_role: converted.pedagogicalRole,
                // D7.4: fingerprint what we WROTE, so the next run can tell an
                // app-side edit from an untouched draft.
                source_fingerprint: fingerprintDocument(converted.document),
                updated_at: new Date().toISOString(),
            });
            updated++;
        } catch (err) {
            skipped.push({ file, error: `update failed: ${err.message}` });
        }
    }

    let created = 0;
    for (const { file, converted } of plannedCreates) {
        // Slug is minted from the TITLE, exactly as Activities.tsx does, and the
        // DB constraint is still the arbiter — retry with a suffix on 23505.
        const base = pipeline.slugify(converted.title);
        let done = false;
        let lastError = null;
        for (let attempt = 0; attempt < 10 && !done; attempt++) {
            try {
                await db.create([
                    {
                        owner_id: owner.id,
                        title: converted.title,
                        slug: pipeline.slugWithSuffix(base, attempt),
                        source_path: file.sourcePath,
                        draft_content: converted.document,
                        tags: converted.tags,
                        pedagogical_role: converted.pedagogicalRole,
                        // D7.4: a row is guarded from the moment it exists —
                        // otherwise the very first app edit after a create is
                        // the one the guard cannot see.
                        source_fingerprint: fingerprintDocument(converted.document),
                    },
                ]);
                created++;
                done = true;
            } catch (err) {
                lastError = err;
                // A slug collision is retryable; a source_path collision is not
                // (it would mean the plan raced with another writer), and any
                // other error is a real failure.
                if (!/23505|duplicate key/i.test(err.message)) break;
                if (/source_path/.test(err.message)) break;
            }
        }
        if (!done) {
            skipped.push({ file, error: `create failed: ${lastError?.message ?? 'unknown'}` });
        }
    }

    console.log(
        `\ncreated ${created} · updated ${updated} · ` +
            `refused ${drifted.length} · skipped ${skipped.length}`,
    );
    if (skipped.length) {
        console.log('\nskipped:');
        for (const { file, error } of skipped) {
            console.log(`  ${file.sourcePath}  ${error}`);
        }
    }
    console.log(
        '\nAll imported activities are DRAFTS. Publish from the app — the batch\n' +
            'script cannot publish (see the PUBLISHING note in this file).\n',
    );

    // D3: skipped files are surfaced AND make the run non-clean.
    process.exit(skipped.length > 0 ? 1 : 0);
}

// Only run when invoked directly — the test imports the pure pieces above.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    // A NETWORK FAILURE IS NOT A CRASH. Without this, a wrong SUPABASE_URL or a
    // dropped connection prints node's raw `[TypeError: fetch failed]` stack —
    // which tells an author running a catalogue import nothing about what to do
    // next, and looks like a bug in the script rather than a problem with the
    // machine or the config.
    try {
        await main();
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const networky =
            /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/i.test(
                message,
            ) || /fetch failed/i.test(String(err?.cause?.message ?? ''));
        console.error(
            `\n${networky ? 'Could not reach Supabase' : 'The import failed'}: ${message}\n`,
        );
        if (networky) {
            console.error(
                `  Check SUPABASE_URL in .env.supabase (currently ${
                    process.env.SUPABASE_URL || '<unset>'
                })\n  and that this machine is online. Nothing was written.\n`,
            );
        }
        process.exit(1);
    }
}
