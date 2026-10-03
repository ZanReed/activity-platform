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
// ---- MISCONCEPTION BINDINGS: the manifest, the registry, and --strict -------
//
// A `:: mis.*` binding turns targeted feedback into aggregate data, and every
// way it can be wrong is SILENT at the student's screen: a typo'd id fragments
// the data, an id outside the author's registry fragments it differently, and a
// `!` match that can never fire makes the data say "nobody made this mistake".
// None of those show up as a broken import — the document validates, the row
// writes, the activity renders. So the run is the only place they can be
// caught, and this script catches them three ways:
//
//   * the MANIFEST — every binding, per file and across the folder, printed on
//     the run and written to docs/misconception-manifest.md. Singleton ids and
//     near-duplicate ids are flagged there, because a typo's signature is
//     "used once, and it looks like its neighbour".
//   * the REGISTRY (--registry <file>) — ids the author's own taxonomy does not
//     list. A folder that carries bindings and supplies NO registry warns for
//     that too: a check that only runs when a flag is present must say so when
//     the flag is absent, or its absence reads as a pass (policy P3).
//   * DEAD BINDINGS — a blank `!` match that would score CORRECT can never
//     fire, because correctness is decided first. Detected here for the cheap
//     cases; see canNeverFire for what is deliberately out of scope.
//
// --strict turns all of those from warnings into exit 1. Without it the run
// behaves exactly as it always has (warnings never touched the exit code),
// which is what keeps --strict usable in a wrapper and absent in exploration.
//
// ZERO RUNTIME DEPENDENCIES beyond esbuild (a root devDependency;
// bundle-viewer-server.mjs already imports it). PostgREST over plain fetch,
// because `@supabase/supabase-js` is a dependency of packages/app and pnpm's
// strict node_modules means a root script cannot resolve it — the same reason
// backfill-census.js talks HTTP directly.
// =============================================================================

import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
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
 * Every field a full update writes. ONE builder for both the write and the
 * "unchanged" comparison below, so a field added to the payload later joins
 * the comparison automatically — the curriculum side's condition on (b)
 * (C-44): "unchanged" must cover EVERY field the update would write, or an
 * edit to a column-only setting is silently dropped, the one failure that
 * failing safe does not catch.
 */
export function updatePayload(file, converted, now = new Date().toISOString()) {
    return {
        // The payload MIRRORS the app's autosave (ActivityEditor.tsx:542).
        // course/unit are absent deliberately — publish-truth, one writer.
        draft_content: converted.document,
        title: converted.title,
        tags: converted.tags,
        pedagogical_role: converted.pedagogicalRole,
        // D7.4: fingerprint what we WROTE, so the next run can tell an
        // app-side edit from an untouched draft.
        source_fingerprint: fingerprintDocument(converted.document),
        // IDENTITY, written on every update for two different reasons.
        // source_key: an adoption — the row learns the key it was matched by
        // path under, which is what makes the NEXT move free. Writing it
        // unconditionally is safe (it is the value we matched on) and means a
        // row can never be left half-keyed.
        ...(file.key ? { source_key: file.key } : {}),
        // source_path: where the file sits NOW. This column stopped being
        // identity at 0041 and became organization — and the activities list
        // reads it as the teaching order, so a stale one would sort the outline
        // by where files USED to be.
        source_path: file.sourcePath,
        updated_at: now,
    };
}

/** Fields that never decide "unchanged": identity, bookkeeping, the clock. */
const NOT_CONTENT = new Set(['source_path', 'source_key', 'source_fingerprint', 'updated_at']);

const MINTED_ID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|\bg[0-9a-f]{32}\b/g;

/**
 * A comparison key for "would this update change anything?" (author ruling
 * (b) + the agreed extension, curriculum B-46/C-44).
 *
 * NOT the stored fingerprint, and the reason was MEASURED: converting each of
 * chain 1's four files twice gave 251 differing `id` fields and 9 differing
 * `latex` fields (math-gap ids embedded as \placeholder[g…]). Every conversion
 * mints fresh identifiers, so a fingerprint over them never matches an
 * unchanged file. Here: each document is parsed by the CURRENT schema (so a
 * default added since it was stored compares equal), every field is
 * key-sorted, and then every minted identifier — UUIDs and g-prefixed gap ids,
 * wherever they appear, keys included — is renamed in order of first
 * appearance. Equal keys = equal content up to identifier renaming.
 */
export function contentKey(fields, documentSchema) {
    const normalized = {};
    for (const [k, v] of Object.entries(fields)) {
        if (NOT_CONTENT.has(k)) continue;
        if (k === 'draft_content' && v && documentSchema) {
            const parsed = documentSchema.safeParse(v);
            normalized[k] = parsed.success ? parsed.data : v;
        } else {
            normalized[k] = v === undefined ? null : v;
        }
    }
    const names = new Map();
    return canonicalJson(normalized).replace(MINTED_ID, (id) => {
        if (!names.has(id)) names.set(id, `#${names.size + 1}`);
        return names.get(id);
    });
}

/**
 * Split planned updates by what they would actually change.
 *
 *   pathOnly  — content unchanged but the row needs identity written (the
 *               file MOVED, or the row ADOPTS its key): write source_path /
 *               source_key only. Ruling (b): a renamed chain folder must not
 *               put identical drafts on published activities.
 *   unchanged — content unchanged, same path, nothing to adopt: write NOTHING
 *               (the agreed extension; retires the empty-folder workaround
 *               for mirrors-only runs).
 *   full      — anything else: today's full update.
 *
 * "Current" content is the row's draft when it has one, else its CURRENT
 * PUBLISHED version (`currentContentFor(row)`; publishing clears the draft).
 * Fails SAFE: no current content, or a row whose fingerprint was never written
 * (the guard arms only on a full write), always goes to `full`.
 */
export function classifyUpdates(planned, currentContentFor, documentSchema) {
    const pathOnly = [];
    const unchanged = [];
    const full = [];
    for (const entry of planned) {
        const { file, row, converted } = entry;
        const content = row.draft_content ?? currentContentFor(row) ?? null;
        if (content === null || (row.source_fingerprint ?? null) === null) {
            full.push(entry);
            continue;
        }
        const now = {
            draft_content: content,
            title: row.title,
            tags: row.tags,
            pedagogical_role: row.pedagogical_role,
        };
        const same =
            contentKey(updatePayload(file, converted), documentSchema) ===
            contentKey(now, documentSchema);
        if (!same) full.push(entry);
        else if (entry.moved || entry.adoptsKey) pathOnly.push(entry);
        else unchanged.push(entry);
    }
    return { pathOnly, unchanged, full };
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
    const byKey = new Map();
    const byPath = new Map();
    for (const row of existing) {
        if (row.source_key) byKey.set(row.source_key, row);
        if (row.source_path) byPath.set(row.source_path, row);
    }

    const creates = [];
    const updates = [];
    const conflicts = [];
    const consumed = new Set();

    for (const file of files) {
        // 1. THE KEY, if the file declares one and a row already holds it. The
        //    file may have moved anywhere; that is the entire point.
        if (file.key) {
            const byKeyRow = byKey.get(file.key);
            if (byKeyRow) {
                consumed.add(byKeyRow.id);
                updates.push({
                    file,
                    row: byKeyRow,
                    matchedBy: 'key',
                    moved: byKeyRow.source_path !== file.sourcePath,
                });
                continue;
            }
        }

        // 2. THE PATH — and this arm is NOT just the keyless fallback. It is
        //    also how a keyed file ADOPTS a row that predates keys, which is
        //    the whole cutover: add `key:` with paths untouched, run once, and
        //    every row records its key by being matched on the path it still
        //    sits at. Getting this wrong (key-only matching) would have turned
        //    the cutover into 150 creates and 150 orphans.
        const byPathRow = byPath.get(file.sourcePath);
        if (byPathRow) {
            // The row at this path already answers to a DIFFERENT key: the key
            // was edited in place. That is "retire and mint" (the builder's
            // ruling), not a rename — and it cannot be done by import, because
            // the old row still occupies this path and 0038's unique index
            // would reject the new one with an opaque 23505. Say so here, where
            // the fix is nameable, rather than at the write.
            if (file.key && byPathRow.source_key && byPathRow.source_key !== file.key) {
                conflicts.push({
                    file,
                    row: byPathRow,
                    was: byPathRow.source_key,
                    now: file.key,
                });
                continue;
            }
            consumed.add(byPathRow.id);
            updates.push({
                file,
                row: byPathRow,
                matchedBy: 'path',
                // An adoption: the row learns its key on this run.
                adoptsKey: Boolean(file.key) && !byPathRow.source_key,
                moved: false,
            });
            continue;
        }

        creates.push({ file });
    }

    // Orphans: imported rows no file claimed. Computed from what was CONSUMED
    // rather than from paths on disk, because a keyed row can be matched by a
    // file sitting somewhere else entirely — a path sweep would report every
    // moved activity as an orphan and hide the real ones in the noise.
    // REPORTED ONLY (D2).
    const orphans = existing.filter(
        (r) => (r.source_path || r.source_key) && !consumed.has(r.id),
    );

    return { creates, updates, orphans, conflicts };
}

/**
 * The `key:` a catalogue file declares, read WITHOUT running the full importer.
 *
 * WHY A SECOND READER OF THE SAME SYNTAX, in a repo that treats two parsers for
 * one format as a defect: identity has to be known BEFORE conversion, because
 * it decides which existing row a file is converted against (an update merges
 * against the row's current meta; a create does not). Running the whole
 * markdown pipeline twice per file to learn one string would be the alternative.
 *
 * It is kept honest rather than trusted: `convertOne` re-reads the key from the
 * REAL parser and the caller compares the two, so a divergence between this
 * scan and `parseMetaFence` surfaces as a named error on the run that causes it
 * instead of as a mismatched row months later. That cross-check is the reason
 * this is safe; do not delete it to save a comparison.
 */
export function scanSourceKey(markdown) {
    // The first ```meta fence, matching the importer's own fence discipline:
    // an opening line that is exactly the info string, and a closing ``` line.
    const fence = /^```meta[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/m.exec(markdown);
    if (!fence) return null;
    const line = /^[ \t]*key[ \t]*:[ \t]*(.+?)[ \t]*$/m.exec(fence[1] ?? '');
    return line ? (line[1] ?? '').trim() || null : null;
}

/**
 * `chain-registry.txt` — chain folder → the unit title the platform shows.
 *
 *     01-chain.rate.proportional = Rates and Proportional Relationships
 *
 * Split on the FIRST `=` only: a display title may contain anything, including
 * the `:` that early drafts of this format put in front of it and the `=` that
 * nobody has needed yet. `#` comments and blank lines ignored, exactly like the
 * misconception and skill registries — three files, one grammar, because a
 * registry whose format has to be remembered is a registry that gets edited
 * wrongly.
 *
 * TEACHING ORDER IS NOT IN THIS FILE. It is the folder's ordinal prefix, which
 * the activities list reads through `source_path`. A number inside the title
 * would put curriculum bookkeeping on the student's worksheet, which is the one
 * thing the whole path scheme exists to avoid.
 */
export function parseChainRegistry(text) {
    const titles = new Map();
    const duplicates = [];
    for (const raw of text.split('\n')) {
        const line = raw.replace(/#.*$/, '').trim();
        if (line === '') continue;
        const eq = line.indexOf('=');
        if (eq === -1) continue;
        const folder = line.slice(0, eq).trim();
        const title = line.slice(eq + 1).trim();
        if (folder === '' || title === '') continue;
        if (titles.has(folder)) duplicates.push(folder);
        titles.set(folder, title);
    }
    return { titles, duplicates };
}

/**
 * Where a run reads its chain registry from, and the text it found there.
 *
 * `--chain-registry <path>` reads the curriculum repo's own file, like
 * `--registry` and `--skills-registry` do — it exists to retire the copy the
 * catalogue folder had to carry (B-42 / C-40). Without the flag the catalogue
 * ROOT is still looked in, and finding nothing there stays legal: a catalogue
 * that does not use chains states `unit:` per file.
 *
 * The two sources fail differently ON PURPOSE. A missing root file is "this
 * catalogue has no chains"; a flag that cannot be read is a typo, and returns
 * `text: null` with `source: 'flag'` so the caller can refuse the run before
 * it starts rather than import 150 files with no unit titles.
 *
 * `shadowed` is the root copy's path when the flag was given AND a root copy
 * still exists — that copy was NOT read, and saying so is the difference
 * between retiring a hand-carried file and silently forking it.
 */
export async function readChainRegistry(root, flagPath, read = (p) => readFile(p, 'utf8')) {
    const rootPath = resolve(root, 'chain-registry.txt');
    const rootText = await read(rootPath).catch(() => null);
    if (flagPath) {
        const path = resolve(flagPath);
        const text = await read(path).catch(() => null);
        return {
            source: 'flag',
            path,
            label: flagPath,
            text,
            shadowed: rootText !== null && path !== rootPath ? rootPath : null,
        };
    }
    return {
        source: rootText === null ? 'none' : 'root',
        path: rootPath,
        label: 'chain-registry.txt',
        text: rootText,
        shadowed: null,
    };
}

/** The chain folder a catalogue file belongs to: its first path segment, or
 *  null for a file sitting loose in the catalogue root. */
export function chainFolderOf(sourcePath) {
    const slash = sourcePath.indexOf('/');
    return slash === -1 ? null : sourcePath.slice(0, slash);
}

/**
 * Two chains resolving to the SAME display title.
 *
 * Worth its own check because the failure is invisible: the activities list
 * groups by the unit STRING, so two chains sharing a title silently merge into
 * one outline group — the teacher sees one unit containing two chains' worth of
 * activities, in path order, with nothing to indicate the groups were ever
 * distinct.
 */
export function duplicateChainTitles(titles) {
    const byTitle = new Map();
    for (const [folder, title] of titles) {
        const key = title.trim().toLowerCase();
        byTitle.set(key, [...(byTitle.get(key) ?? []), folder]);
    }
    return [...byTitle.values()].filter((folders) => folders.length > 1);
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
export function convertOne(pipeline, markdown, existingRow, sourcePath, options = {}) {
    const { chainTitle = null, glossary = undefined } = options;
    const result = pipeline.importer(markdown, glossary ? { glossary } : undefined);

    if (
        result.blocks.length === 0 &&
        !result.referencePanel &&
        result.meta === undefined
    ) {
        throw new Error(
            'no importable content (no blocks, no reference fence, no meta fence)',
        );
    }

    // Y7 geometry (ER-13, amended 2026-10-03): a ```figure problem SKIPS the
    // file in EVERY run, strict or not. In a geometry activity the marks are
    // the answer — `ticks AC 1` dropped on a typo draws an isosceles triangle
    // as scalene while the key says isosceles — so a figure that lost a line
    // is a wrong question, not a warning. Thrown here, the caller's catch puts
    // the file in `skipped`: never written, named, and the run exits 1. NOT the
    // drift `refused` path, which --force overrides. Read from the importer's
    // typed channel, never by matching warning text.
    if (result.figureProblems && result.figureProblems.length > 0) {
        throw new Error(
            `figure or chart problem${result.figureProblems.length === 1 ? '' : 's'} — fix and re-run:\n      ` +
                result.figureProblems.join('\n      '),
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
        const fenceWithTitle = {
            ...fence,
            ...(fence.title === undefined && sourcePath
                ? { title: titleFromPath(sourcePath) ?? undefined }
                : {}),
            // The chain registry supplies `unit` for every file that does not
            // state one, which is meant to be all of them: one line changes a
            // chain's name instead of N files. A file's own `unit:` still wins
            // (precedence 1) and is reported as an override where it DIVERGES.
            ...(fence.unit === undefined && chainTitle ? { unit: chainTitle } : {}),
        };
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
        // ⚠ THE COLUMN IS THE SECOND SOURCE, AND PUBLISHING IS WHY.
        // `publish_activity` sets draft_content = null, so a PUBLISHED
        // activity has no draftMeta at all — and reading only `prior` then
        // fell straight through to DEFAULT_COURSE and diffed the file against
        // a default. Two consequences, and the second is the serious one:
        //   (a) cosmetic — every published activity reported a course/unit
        //       change forever, on every run, inverting D5's promise that
        //       every printed change is a real one. The failure mode is
        //       habituation: once the preview cries wolf on all 150 rows, the
        //       one real title change stops being read.
        //   (b) DATA — for a file whose fence omits `course:`, `computed`
        //       would then WRITE "Algebra II" into the rebuilt draft, and the
        //       next publish would stamp that into the column. A published
        //       Year 8 activity re-imported without a course line would come
        //       back as Algebra II.
        // The columns are publish-truth (0037 R1) and this script still never
        // WRITES them — it only reads them as the fallback for a draft that
        // publishing has legitimately emptied. DEFAULT_COURSE survives for a
        // genuinely new row, which is the only case that has neither source.
        const priorCourse =
            prior.course ?? existingRow.course ?? pipeline.DEFAULT_COURSE;
        const priorUnit = prior.unit ?? existingRow.unit ?? undefined;

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
        // `chainTitle` sits BEFORE `prior.unit` deliberately: a chain rename in
        // the registry has to propagate to activities that already carry the
        // old title, and reading the prior value first would pin every existing
        // activity to the name it was imported under.
        const unit = fence.unit ?? chainTitle ?? priorUnit;
        if (unit !== undefined) computed.unit = unit;

        // Everything the document already carried that no fence key describes
        // rides through untouched (print layout, typography, and anything a
        // later slice adds). Spreading the prior meta UNDER the computed one is
        // what stops this script from quietly deleting editor-only settings on
        // every re-run — the "save path is where fields die silently" trap.
        meta = { ...prior, ...computed };

        // Seed variables REPLACE on an update (tags' rule, same reason): the
        // file is the source of truth, so editing — or deleting — the ```seed
        // fence must reach the row. Absent fence + absent prior stays absent.
        const priorSeedVars = prior.seedVars;
        if (fence.seedVars && fence.seedVars.length > 0) {
            meta.seedVars = fence.seedVars;
        } else {
            delete meta.seedVars;
        }

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
        if (meta.unit !== priorUnit) {
            changes.push({ field: 'unit', from: priorUnit, to: meta.unit });
        }
        if (pedagogicalRole !== priorRole) {
            changes.push({ field: 'role', from: priorRole, to: pedagogicalRole });
        }
        if (JSON.stringify(meta.seedVars ?? null) !== JSON.stringify(priorSeedVars ?? null)) {
            changes.push({
                field: 'seedVars',
                from: priorSeedVars ? `${priorSeedVars.length} var(s)` : undefined,
                to: meta.seedVars ? `${meta.seedVars.length} var(s)` : undefined,
            });
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
        // Catalogue-only, read by this script and stored in no document. The
        // key rides out so main() can cross-check it against scanSourceKey's
        // pre-pass; the skills feed the registry check and the coverage
        // manifest; reservedKeys feeds the per-run receipt.
        // How every [[term]] resolved (present only when a glossary source was
        // passed) — the reference gate and the glossary report read it.
        glossary: result.glossary ?? null,
        sourceKey: fence.sourceKey ?? null,
        primarySkill: fence.primarySkill ?? null,
        supportingSkills: fence.supportingSkills ?? [],
        chainRole: fence.chainRole ?? 'part',
        reservedKeys: fence.reservedKeys ?? [],
        // A file that states a unit DIFFERENT from its chain's registry title.
        // Presence alone is not an override — a file repeating its chain's
        // title verbatim is saying the same thing the registry says, and
        // reporting that would make the override report fire on every file the
        // moment a drafting prompt started emitting `unit:`.
        unitOverride:
            fence.unit !== undefined && chainTitle !== null && fence.unit !== chainTitle
                ? { stated: fence.unit, chain: chainTitle }
                : null,
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
 * A `key:` to suggest for a file that has none — path-derived, so the fix in
 * the warning is copy-paste rather than a naming decision at the moment the
 * author least wants one.
 *
 *   '01-chain.rate.proportional/01-unit-rate.md'  →  'act.rate.unit-rate'
 *
 * Best-effort and deliberately dumb: the author's convention is theirs, and a
 * suggestion that is wrong is still a template with the right SHAPE.
 */
export function suggestKeyFor(sourcePath) {
    const parts = sourcePath.replace(/\.md$/i, '').split('/');
    const base = (parts.pop() ?? '').replace(/^\d+[-_]/, '');
    const folder = (parts.pop() ?? '').replace(/^\d+[-_]/, '').replace(/^chain\./, '');
    const domain = folder.split('.')[0] ?? '';
    const slug = base.replace(/[^a-z0-9-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
    return domain ? `act.${domain}.${slug}` : `act.${slug}`;
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
// Misconception bindings
// =============================================================================

/**
 * The valid-id pattern, DUPLICATED from `VALID_ID` in
 * packages/app/src/lib/misconceptionBinding.ts — that file is the source of
 * truth, and this is a copy of it.
 *
 * WHY A COPY. This script is plain node; the pattern lives in a .ts module the
 * pipeline bundle does not re-export, and widening batchImportPipeline.ts to
 * re-export it would put a change into packages/app for the sake of a script.
 * The copy is cheap, and it is not left to rot: scripts/tests/batch-import
 * .test.mjs reads the regex literal out of misconceptionBinding.ts and fails if
 * the two source strings stop being identical.
 */
export const MISCONCEPTION_ID = /^mis(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/;

/** The inline alphabet (schema/src/inline.ts). Everything else with a `type` is
 *  a container worth naming when a binding is found inside it. */
const INLINE_TYPES = new Set(['text', 'math_inline', 'hard_break', 'blank']);

// ---- the numeric parser, ported ---------------------------------------------
// A faithful port of packages/viewer/src/server/grading/numeric.ts, which is
// the authority — it is the parser that decides real marks, and it is itself a
// parity port pinned by the golden corpus. Copied character-for-character
// rather than "cleaned up", for the same reason that file gives: a subtly wider
// regex here would report a live binding as dead.
//
// ⚠ A COPY IS A DRIFT RISK, so it is guarded by BEHAVIOUR, not by good
// intentions: `scripts/tests/batch-import.test.mjs` §I bundles the real
// numeric.ts through the pipeline and asserts the two agree across the accepted
// forms. A copy is used at all only because this check runs synchronously while
// the pipeline loads async; if that ever stops being true, delete this and take
// `parseNumericValue` from the pipeline.
//
// It is here at all because dead-binding detection has to answer "would this
// match string score as CORRECT?", and on a numeric blank that question is
// numeric — `!0.5` against an answer of `1/2` is the same value, so the mistake
// can never fire even though the two strings differ.
const DECIMAL_RE = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
const FRACTION_RE = /^([+-]?(?:\d+\.?\d*|\.\d+))\/((?:\d+\.?\d*|\.\d+))$/;
const MIXED_RE = /^([+-]?)(\d+) +(\d+)\/(\d+)$/;

export function parseNumericValue(raw) {
    let s = raw.trim();
    if (s.charAt(0) === '$') s = s.slice(1).trim();
    s = s.replace(/,/g, '');
    if (s.length === 0) return null;

    const mixed = MIXED_RE.exec(s);
    if (mixed) {
        const sign = mixed[1] === '-' ? -1 : 1;
        const den = Number(mixed[4]);
        if (den === 0) return null;
        return sign * (Number(mixed[2]) + Number(mixed[3]) / den);
    }

    const frac = FRACTION_RE.exec(s);
    if (frac) {
        const den = Number(frac[2]);
        if (den === 0) return null;
        return Number(frac[1]) / den;
    }

    if (DECIMAL_RE.test(s)) {
        const n = Number(s);
        return isFinite(n) ? n : null;
    }
    return null;
}

/**
 * Would this `!` match string be scored CORRECT on this blank — i.e. can the
 * mistake it describes never fire?
 *
 * The grader consults mistakeFeedback ONLY on a `false` verdict
 * (grading/blanks.ts, selectBlankFeedback), so a match that scores correct is
 * unreachable by construction: the student who types it is told they are right
 * and the sensor records nothing. That is strictly worse than having no
 * binding, because the resulting data says the misconception was never made.
 *
 * WHAT IS CHECKED, and why the answer is deliberately conservative:
 *
 *   text  — exact compare of the trimmed match against each key entry.
 *           Case-SENSITIVE, matching scoreText: the runtime's case sensitivity
 *           is documented as deliberate, so `!Cat` against an answer of `cat`
 *           really can fire (mistake matching is the looser, case-insensitive
 *           side) and must not be reported dead.
 *   numeric — numeric compare within the blank's tolerance first, then the same
 *           text compare, mirroring scoreNumeric's fallback for non-numeric key
 *           entries ("no solution" on a numeric blank still scores by string).
 *   math  — NOT CHECKED. Equivalence there is numeric-sampling through the
 *           graph kit; see the TODO below.
 *
 * The typographic look-alike fold (grading/normalize.ts) is NOT ported. Its
 * absence can only make this MISS a dead binding (a match written with a
 * unicode minus against a key written with a hyphen), never invent one — and
 * that is the right direction for a check whose finding can fail a run under
 * --strict.
 */
export function canNeverFire(blank, match) {
    const answers = [blank.answer, ...(blank.acceptableAnswers ?? [])];
    // Parity with the grader: the student's value is trimmed, key entries are
    // NOT. A key authored with a stray trailing space has never matched
    // anything, and pretending otherwise here would report a live binding dead.
    const trimmed = match.replace(/^\s+|\s+$/g, '');

    if (blank.answerType === 'numeric') {
        const value = parseNumericValue(trimmed);
        if (value !== null) {
            const tolerance =
                isFinite(blank.tolerance) && blank.tolerance >= 0
                    ? blank.tolerance
                    : 0;
            for (const entry of answers) {
                const keyValue = parseNumericValue(entry);
                if (
                    keyValue !== null &&
                    Math.abs(value - keyValue) <= tolerance + 1e-9
                ) {
                    return 'it is numerically equal to the correct answer, so it scores correct';
                }
            }
        }
    }

    if (blank.answerType === 'math') return null;

    for (const entry of answers) {
        if (entry === trimmed) {
            return 'it is the correct answer, so it scores correct';
        }
    }
    return null;
}

/**
 * Every misconception binding in one converted document, with the site it sits
 * at, plus the bindings that can never fire.
 *
 * The walk is generic on purpose. Blocks nest (a blank inside a ```faded fence,
 * a choice inside a problem), and the set of nesting containers grows with
 * every block type — a walk that enumerated the containers would go quietly
 * incomplete the first time one was added, which is this repo's most expensive
 * defect class. Recursing over every value finds a binding wherever it lives;
 * the enclosing block's type and ordinal are carried down purely to LABEL it.
 */
export function collectBindings(document) {
    const bindings = [];
    const dead = [];
    const ordinals = new Map();

    const walk = (node, scope) => {
        if (Array.isArray(node)) {
            for (const item of node) walk(item, scope);
            return;
        }
        if (node === null || typeof node !== 'object') return;

        let inner = scope;
        if (typeof node.type === 'string' && !INLINE_TYPES.has(node.type)) {
            const n = (ordinals.get(node.type) ?? 0) + 1;
            ordinals.set(node.type, n);
            inner = { label: `${node.type} #${n}`, blanks: 0 };
        }

        if (node.type === 'blank') {
            const nth = scope ? (scope.blanks += 1) : 1;
            const where = `${scope?.label ?? 'blank'}, blank #${nth}`;
            for (const entry of node.mistakeFeedback ?? []) {
                if (entry.misconceptionId) {
                    bindings.push({ id: entry.misconceptionId, where });
                }
                const reason = canNeverFire(node, entry.match ?? '');
                if (reason) {
                    dead.push({
                        where,
                        match: entry.match ?? '',
                        id: entry.misconceptionId,
                        reason,
                    });
                }
            }
        }

        if (node.type === 'multiple_choice') {
            node.choices?.forEach((choice, i) => {
                if (choice?.misconceptionId) {
                    bindings.push({
                        id: choice.misconceptionId,
                        // Letters, because that is what the author typed and
                        // what the rendered choice shows.
                        where: `${inner.label}, choice ${String.fromCharCode(65 + i)}`,
                    });
                }
            });
        }

        if (node.type === 'interactive_graph') {
            node.mistakeFeedback?.forEach((entry, i) => {
                if (entry?.misconceptionId) {
                    bindings.push({
                        id: entry.misconceptionId,
                        where: `${inner.label}, mistake #${i + 1}`,
                    });
                }
            });
            // TODO — a graph `mistake:` whose text the kit's formula parser
            // cannot read compiles to a matcher that never fires, exactly like
            // a self-shadowing blank match, and it is INVISIBLE here: this walk
            // reads the stored string and has no parser to try it against.
            // Proving it needs @activity/graph-kit's answer parser (the same
            // one `answer:` goes through), which this script does not load —
            // the pipeline bundle deliberately reaches graph-kit only by
            // subpath, and pulling the parser in is a size and node-resolution
            // decision of its own. Until then an unparseable graph match is
            // caught only by a human reading the manifest.
        }

        for (const value of Object.values(node)) walk(value, inner);
    };

    walk(document, null);
    return { bindings, dead };
}

/**
 * A registry file: one valid id per line, `#` comments and blank lines ignored.
 *
 * Plain text rather than JSON/YAML because the registry lives in the AUTHOR'S
 * catalogue project, is edited by hand beside the .md files it governs, and has
 * to be greppable and diffable there. A format with punctuation would be a
 * format with syntax errors, in a file whose only job is to list names.
 */
export function parseRegistry(text) {
    const ids = new Set();
    for (const raw of text.split('\n')) {
        const line = raw.replace(/#.*$/, '').trim();
        if (line !== '') ids.add(line);
    }
    return ids;
}

/**
 * The registry's inline comments, read as DESCRIPTIONS (2026-09-26): the
 * generated registry now writes `id   # what the misconception is`, and the
 * grading-assist prompt wants that text (0042 EH-7's "richer entries" half —
 * discovered already shipped as comments rather than a format change). A
 * whole-line comment (`# heading`) has no id and is skipped, exactly as
 * parseRegistry skips it; an id-bearing line with no comment maps to nothing.
 * parseRegistry stays the id authority — this reads the same lines and can
 * never disagree with it about WHICH ids exist.
 */
export function parseRegistryDescriptions(text) {
    const descriptions = new Map();
    for (const raw of text.split('\n')) {
        const hash = raw.indexOf('#');
        if (hash === -1) continue;
        const id = raw.slice(0, hash).trim();
        const description = raw.slice(hash + 1).trim();
        if (id !== '' && description !== '') descriptions.set(id, description);
    }
    return descriptions;
}

/**
 * The SKILL registry: one id per line, with an optional `= n` part count.
 *
 *     rate.unit-rate
 *     rate.proportional-graph = 2
 *
 * WHY THE PART COUNT LIVES HERE and not on an activity, which is where the
 * platform first proposed it: **a part count is a fact about the SKILL**, not
 * about any one activity that teaches it. Putting it beside the id means one
 * place to read it and no meta key at all; putting it on "the first part"
 * needs a rule for which activity that is, and breaks when the parts are
 * authored out of order. The curriculum side proposed this shape and it is
 * better than ours.
 *
 * Absence means ONE part, which is the common case and makes a bare registry
 * behave exactly as it did before part counts existed.
 *
 * Deliberately NOT `parseRegistry`: that one is the misconception registry's,
 * where a line is an id and nothing else, and an `=` in it would be a typo
 * rather than a declaration. Two registries, two grammars, two functions.
 */
export function parseSkillRegistry(text) {
    const ids = new Set();
    const parts = new Map();
    const malformed = [];
    for (const raw of text.split('\n')) {
        const line = raw.replace(/#.*$/, '').trim();
        if (line === '') continue;
        const eq = line.indexOf('=');
        if (eq === -1) {
            ids.add(line);
            continue;
        }
        const id = line.slice(0, eq).trim();
        const count = line.slice(eq + 1).trim();
        if (id === '') continue;
        ids.add(id);
        if (!/^[1-9]\d*$/.test(count)) {
            malformed.push({ id, count });
            continue;
        }
        parts.set(id, Number(count));
    }
    return { ids, parts, malformed };
}

/**
 * Levenshtein distance, abandoned as soon as it is certain to exceed `max`.
 *
 * THE NEAR-DUPLICATE HEURISTIC IS: full-id edit distance ≤ 2, over the distinct
 * ids of one run. Two properties earn it the job.
 *
 * It is CHEAP. The prefilter (length difference > max ⇒ no) rejects almost
 * every pair before any work, the row-bailout stops the rest early, and the
 * candidate set is the DISTINCT ids of a catalogue — dozens, not thousands — so
 * the quadratic pass is quadratic over a number that never grows large.
 *
 * It is EXPLAINABLE, which matters more: the flag reads "these two ids differ
 * by at most two typed characters", and every typo class this exists to catch
 * is exactly that — a prefix slip (`mis.` → `msi.`), a plural (`-value` →
 * `-values`), a hyphen for an underscore. The obvious alternative — "identical
 * except the last dotted segment" — was rejected as noise: a taxonomy's whole
 * shape is siblings under a shared prefix, so it would flag every deliberate
 * pair (`mis.roc.slope-as-y` beside `mis.roc.uses-endpoint-value`) and be
 * ignored within a week. Distance ≤ 2 covers the same-last-segment typos and
 * leaves genuinely different siblings alone, because those differ by many
 * edits.
 */
export function editDistanceWithin(a, b, max) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > max) return Infinity;

    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const row = [i];
        let best = i;
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
            if (row[j] < best) best = row[j];
        }
        // Every remaining row can only add to the best value on this one, so a
        // row whose cheapest cell already exceeds the ceiling cannot recover.
        if (best > max) return Infinity;
        prev = row;
    }
    return prev[b.length] <= max ? prev[b.length] : Infinity;
}

/** The near-duplicate pairs among a set of ids, each reported once, in a stable
 *  order. Case-folded first: the id pattern forbids capitals, but a SUSPECT id
 *  that reached a document some other way should still pair with its twin. */
export function nearDuplicateIds(ids, max = 2) {
    const sorted = [...ids].sort();
    const pairs = [];
    for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
            const distance = editDistanceWithin(
                sorted[i].toLowerCase(),
                sorted[j].toLowerCase(),
                max,
            );
            if (distance !== Infinity) {
                pairs.push({ a: sorted[i], b: sorted[j], distance });
            }
        }
    }
    return pairs;
}

/**
 * Roll the per-file bindings up into the manifest's data.
 *
 * `perFile` is [{ sourcePath, bindings, dead }] — one entry per file that
 * CONVERTED on this run, in path order.
 *
 * Two orderings, deliberately different. Inside the manifest FILE, ids sort
 * alphabetically: the artifact exists to be read as a `git diff`, and a
 * count-ordered list reshuffles itself whenever one binding is added. On the
 * CONSOLE, ids sort by count: the author is reading a run, and "which
 * misconception does this activity mostly sense" is the question in front of
 * them. Both are total orders, so both are stable.
 */
export function summarizeBindings(perFile) {
    const totals = new Map();
    const filesById = new Map();

    const files = perFile.map(({ sourcePath, bindings }) => {
        const counts = new Map();
        for (const { id } of bindings) {
            counts.set(id, (counts.get(id) ?? 0) + 1);
            totals.set(id, (totals.get(id) ?? 0) + 1);
            if (!filesById.has(id)) filesById.set(id, new Set());
            filesById.get(id).add(sourcePath);
        }
        return {
            sourcePath,
            total: bindings.length,
            byCount: [...counts].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)),
            byId: [...counts].sort((x, y) => (x[0] < y[0] ? -1 : 1)),
        };
    });

    const ids = [...totals.keys()].sort();
    return {
        files,
        ids: ids.map((id) => ({
            id,
            count: totals.get(id),
            files: [...filesById.get(id)].sort(),
        })),
        total: [...totals.values()].reduce((a, b) => a + b, 0),
        // A singleton is not wrong — a misconception really can be sensed in
        // one place. It is REPORTED because a typo is always a singleton, so
        // this column is where the typo the pattern check could not see (it is
        // a perfectly valid id, just not the one meant) becomes visible.
        singletons: ids.filter((id) => totals.get(id) === 1),
        nearDuplicates: nearDuplicateIds(ids),
    };
}

/** Every binding warning one file earns. Each names the file and the value, so
 *  a line lifted out of a 150-file run still says what to go and fix. */
export function bindingWarningsFor(sourcePath, collected, registry) {
    const warnings = [];
    if (registry) {
        const seen = new Set();
        for (const { id, where } of collected.bindings) {
            if (registry.ids.has(id) || seen.has(id)) continue;
            seen.add(id);
            warnings.push(
                `${sourcePath}: “${id}” (${where}) is not in ${registry.path} — ` +
                    'add it to the registry, or fix the id.',
            );
        }
    }
    // A dead mistake with NO id is reported too. It is the same defect — an
    // anticipated wrong answer the student can never be shown — and the author
    // who wrote it is one `::` away from binding it, so the moment to say so is
    // now rather than after the binding is added. Under --strict that means a
    // dead unbound mistake fails a run, which is deliberate: "can never fire"
    // is never the thing anybody meant to write.
    for (const { where, match, id, reason } of collected.dead) {
        warnings.push(
            `${sourcePath}: the mistake “${match}” (${where}${
                id ? `, ${id}` : ''
            }) can NEVER FIRE — ${reason}. ` +
                'The data will read as “nobody made this mistake”.',
        );
    }
    return warnings;
}

/**
 * True for an importer warning that is about a binding.
 *
 * This couples to the text of `suspectWarning` in
 * packages/app/src/lib/misconceptionBinding.ts, which is a coupling the design
 * sanctions: the warning TEXT is a stated contract (one sentence, names the
 * value, names the fix), precisely so that the surfaces downstream of it can
 * rely on it. If that sentence is ever reworded, this predicate is part of the
 * reword — scripts/tests/batch-import.test.mjs pins it against the real string.
 */
export function isBindingWarning(warning) {
    return /looks like a misconception id but is not one/.test(warning);
}

/** The manifest's own path, relative to the repo root, in one place because
 *  the file names itself in its header and the run prints it. */
export const MANIFEST_PATH = 'docs/misconception-manifest.md';

/** The skill-coverage artifacts. Two files, one dataset: the .md is read by
 *  humans as a diff, the .json is read by the curriculum builder as input. */
export const COVERAGE_MANIFEST_PATH = 'docs/skill-coverage-manifest.md';
export const COVERAGE_JSON_PATH = 'docs/skill-coverage.json';

/**
 * Roll per-file skill declarations up into coverage.
 *
 * `perFile` is [{ sourcePath, primarySkill, supportingSkills, published }].
 * `registryIds` is the author's full skill set — the whole point of the
 * artifact, because coverage is not "which skills did we mention" but "which of
 * the skills that EXIST are covered". Without the registry the uncovered list
 * cannot be computed at all; with it, the answer to "47 skills, how many
 * covered" stops being structurally unanswerable.
 *
 * DRAFTS COUNT SEPARATELY, never silently. The curriculum model excludes drafts
 * from progress counts (a draft is generation, not curriculum), so a skill
 * covered only by unpublished activities is reported in its own bucket rather
 * than folded into either side.
 */
export function summarizeCoverage(perFile, registry) {
    const ids = registry?.ids ?? null;
    const partCounts = registry?.parts ?? new Map();
    const skills = new Map();
    const touch = (id) => {
        if (!skills.has(id)) {
            skills.set(id, {
                id,
                parts: [],           // activities that TEACH it
                consolidations: [],  // activities that revisit it without teaching it
                supporting: [],
                publishedParts: 0,
                registered: ids ? ids.has(id) : true,
                declaredParts: partCounts.get(id) ?? 1,
            });
        }
        return skills.get(id);
    };

    for (const file of perFile) {
        if (file.primarySkill) {
            const entry = touch(file.primarySkill);
            // ⚠ THE CONSOLIDATION CARVE-OUT, and the whole reason chain_role
            // reaches this script. A consolidation names its chain's TERMINAL
            // skill as primary but does not teach it — an earlier activity did.
            // Counting it as a part would report a fully-taught 1-part skill as
            // "1 of 2" forever, and would fire the exceeds-declared-parts
            // warning on every well-formed chain.
            if (file.chainRole === 'consolidation') {
                entry.consolidations.push(file.sourcePath);
            } else {
                entry.parts.push(file.sourcePath);
                if (file.published) entry.publishedParts += 1;
            }
        }
        for (const id of file.supportingSkills ?? []) {
            touch(id).supporting.push(file.sourcePath);
        }
    }

    for (const entry of skills.values()) {
        entry.parts.sort();
        entry.consolidations.sort();
        entry.supporting.sort();
        entry.complete = entry.parts.length >= entry.declaredParts;
        // "Published" means the whole skill is reachable by a student, so every
        // part has to be published — not just one of them.
        entry.published = entry.complete && entry.publishedParts >= entry.declaredParts;
        entry.exceedsDeclared = entry.parts.length > entry.declaredParts;
    }

    const all = [...skills.values()].sort((a, b) => (a.id < b.id ? -1 : 1));

    // ⚠ ZERO PARTS IS UNCOVERED, NOT PARTIAL — and the distinction only became
    // reachable when `supporting_skills:` was re-scoped to NON-ancestors
    // (2026-08-26). A skill named only as a supporting skill used to land in
    // `covered` with `partial (0/1)`, which put it in neither the covered count
    // nor the uncovered list: mentioning a skill made it disappear from the one
    // report that exists to say nothing teaches it. Coverage is about what
    // TEACHES a skill; leaning on one is not teaching it.
    const taught = all.filter((e) => e.parts.length > 0 || !e.registered);
    const leanedOnOnly = all.filter((e) => e.registered && e.parts.length === 0);
    const uncovered = ids
        ? [
              ...[...ids].filter((id) => !skills.has(id)),
              ...leanedOnOnly.map((e) => e.id),
          ].sort()
        : [];

    // ---- the burndown number -------------------------------------------------
    // `covered` counts whole skills, so it stays FLAT while a multi-part skill is
    // half-written — an author can spend a fortnight on part 2 of 3 and move
    // nothing. Parts authored against parts declared is the number that moves,
    // and it is only computable here because the DENOMINATOR includes skills the
    // corpus does not name yet: an unauthored 3-part skill owes 3.
    const declaredFor = (id) => partCounts.get(id) ?? 1;
    const partsDeclared = ids
        ? [...ids].reduce((n, id) => n + declaredFor(id), 0)
        : null;
    const partsAuthored = ids
        ? [...ids].reduce((n, id) => n + (skills.get(id)?.parts.length ?? 0), 0)
        : null;

    return {
        covered: taught,
        uncovered,
        partsAuthored,
        partsDeclared,
        // Only the multi-part ones: a bare id is one part, so absence carries the
        // same meaning here as it does in the registry it came from.
        multiPartSkills: ids
            ? Object.fromEntries(
                  [...ids].filter((id) => declaredFor(id) > 1).sort()
                      .map((id) => [id, declaredFor(id)]),
              )
            : {},
        // Named separately so the manifest can say WHY an uncovered skill is
        // already in the corpus — an id nothing teaches but something leans on
        // is a different kind of gap from one nobody has touched.
        leanedOnOnly: leanedOnOnly.map((e) => ({ id: e.id, supporting: e.supporting })),
        unregistered: all.filter((e) => !e.registered).map((e) => e.id),
        partial: taught
            .filter((e) => e.registered && e.parts.length > 0 && !e.complete)
            .map((e) => e.id),
        exceeded: taught.filter((e) => e.exceedsDeclared).map((e) => e.id),
        registrySize: ids ? ids.size : null,
        files: perFile.map((f) => f.sourcePath).sort(),
        withoutPrimary: perFile
            .filter((f) => !f.primarySkill)
            .map((f) => f.sourcePath)
            .sort(),
    };
}

/**
 * The committed coverage manifest, as text.
 *
 * DETERMINISTIC BY CONSTRUCTION, for the reason its sibling states: sorted
 * throughout, and carrying no timestamp, no run mode and no database facts, so
 * a `git diff` shows coverage changes and nothing else.
 *
 * ⚠ THE TIMESTAMP THE BUILDER ASKED FOR IS DELIBERATELY ABSENT, and the
 * replacement is stricter rather than weaker. A timestamp compared against file
 * mtimes is a PROXY for "is this coverage stale"; the `files` list below is the
 * thing itself — an activity authored but never imported is absent from it, and
 * absence is exact. What a timestamp would have caught and this does not: an
 * existing file edited since the last run. That case can only change coverage by
 * changing a `skill:` line, and changing a skill line changes this file.
 */
export function renderCoverageManifest(summary) {
    const out = [];
    out.push('# Skill coverage manifest');
    out.push('');
    out.push('<!--');
    out.push('  GENERATED — do not hand-edit. Refreshed by `pnpm import:batch`');
    out.push('  (a --dry-run is enough; it writes this file in both modes).');
    out.push('');
    out.push('  AUTHOR-REFRESHED, NEVER CI-GATED — same standing as the');
    out.push('  misconception manifest beside it, and for the same reason: the');
    out.push('  .md files it summarizes live OUTSIDE this repository, so CI');
    out.push('  cannot regenerate it and no drift check against it could pass.');
    out.push('');
    out.push('  docs/skill-coverage.json carries the same data for machines.');
    out.push('-->');
    out.push('');

    if (summary.registrySize === null) {
        out.push(
            'No skill registry was supplied, so coverage cannot be computed — only',
        );
        out.push('the skills the catalogue names are known, not the ones it misses.');
        out.push('');
    } else {
        const complete = summary.covered.filter((e) => e.registered && e.complete);
        const publishedCount = complete.filter((e) => e.published).length;
        out.push(
            `**${complete.length} of ${summary.registrySize} skills covered** ` +
                `(${publishedCount} published, ${complete.length - publishedCount} ` +
                `draft only) · ${summary.partial.length} partly covered · ` +
                `${summary.files.length} activities`,
        );
        out.push('');
        out.push(
            `**${summary.partsAuthored} of ${summary.partsDeclared} parts authored.** ` +
                'This is the number that moves while a multi-part skill is ' +
                'half-written; the skill count above stays flat until its last part ' +
                'lands.',
        );
        out.push('');
    }

    if (summary.covered.length > 0) {
        out.push('## Covered');
        out.push('');
        out.push('| skill | state | parts | consolidated in | supporting |');
        out.push('| --- | --- | --- | --- | --- |');
        for (const e of summary.covered) {
            const state = !e.registered
                ? '⚠ not in registry'
                : !e.complete
                  ? `partial (${e.parts.length}/${e.declaredParts})`
                  : e.published
                    ? 'published'
                    : 'draft only';
            const cell = (a) => a.map((f) => `\`${f}\``).join(', ') || '—';
            out.push(
                `| \`${e.id}\` | ${state} | ${cell(e.parts)} | ` +
                    `${cell(e.consolidations)} | ${cell(e.supporting)} |`,
            );
        }
        out.push('');
    }

    if (summary.uncovered.length > 0) {
        out.push('## Uncovered');
        out.push('');
        out.push(
            'Registered skills no activity targets. This list is the artifact\'s',
        );
        out.push('reason for existing — a count alone cannot be acted on.');
        out.push('');
        const leanedOn = new Map(
            (summary.leanedOnOnly ?? []).map((e) => [e.id, e.supporting]),
        );
        for (const id of summary.uncovered) {
            const where = leanedOn.get(id);
            out.push(
                where && where.length > 0
                    ? `- \`${id}\` — leaned on by ${where
                          .map((f) => `\`${f}\``)
                          .join(', ')}, taught by nothing`
                    : `- \`${id}\``,
            );
        }
        out.push('');
    }

    if (summary.withoutPrimary.length > 0) {
        out.push('## Activities with no primary skill');
        out.push('');
        for (const f of summary.withoutPrimary) out.push(`- \`${f}\``);
        out.push('');
    }

    return out.join('\n');
}

/** The same data, for the curriculum builder to consume. Deterministic for the
 *  reasons above; `schema` is versioned so a consumer can fail loudly rather
 *  than mis-read a future shape. */
export function coverageJson(summary) {
    return {
        schema: 'activity-platform/skill-coverage@1',
        registrySize: summary.registrySize,
        counts: {
            activities: summary.files.length,
            covered: summary.covered.filter((e) => e.registered && e.complete).length,
            coveredPublished: summary.covered.filter((e) => e.registered && e.published)
                .length,
            partial: summary.partial.length,
            uncovered: summary.uncovered.length,
            partsAuthored: summary.partsAuthored,
            partsDeclared: summary.partsDeclared,
        },
        multiPartSkills: summary.multiPartSkills,
        skills: summary.covered.map((e) => ({
            id: e.id,
            registered: e.registered,
            declaredParts: e.declaredParts,
            complete: e.complete,
            published: e.published,
            parts: e.parts,
            consolidations: e.consolidations,
            supporting: e.supporting,
        })),
        partial: summary.partial,
        uncovered: summary.uncovered,
        leanedOnOnly: summary.leanedOnOnly,
        unregistered: summary.unregistered,
        activitiesWithoutPrimarySkill: summary.withoutPrimary,
        // The staleness contract: every catalogue file this run saw. A file on
        // disk and absent here has never been imported, so any coverage quoted
        // from this artifact predates it.
        files: summary.files,
    };
}

/**
 * The committed manifest, as text.
 *
 * DETERMINISTIC BY CONSTRUCTION — sorted throughout, and carrying no timestamp,
 * no run mode, no host, no counts of anything that depends on the DATABASE
 * (skips and refusals are run facts, not folder facts). The file is a pure
 * function of the .md folder, so a `git diff` on it shows binding changes and
 * nothing else. That is the entire reason it is committed.
 */
export function renderManifest(summary) {
    const out = [];
    out.push('# Misconception binding manifest');
    out.push('');
    out.push('<!--');
    out.push('  GENERATED — do not hand-edit. Refreshed by `pnpm import:batch`');
    out.push('  (a --dry-run is enough; it writes this file in both modes).');
    out.push('');
    out.push('  THIS IS AN AUTHOR-REFRESHED SNAPSHOT, NOT A CI-GATED ARTIFACT.');
    out.push('  The .md files it summarizes live OUTSIDE this repository (the');
    out.push('  author\'s catalogue folder), so CI cannot regenerate it and no');
    out.push('  drift check against it could ever pass. Do not add one. It is');
    out.push('  committed so that binding changes are reviewable as a diff —');
    out.push('  that is the whole job, and a stale snapshot is a stale snapshot,');
    out.push('  not a build failure.');
    out.push('-->');
    out.push('');

    if (summary.total === 0) {
        out.push('No misconception bindings in the catalogue.');
        out.push('');
        return out.join('\n');
    }

    out.push(
        `${summary.total} binding${summary.total === 1 ? '' : 's'} · ` +
            `${summary.ids.length} distinct id${summary.ids.length === 1 ? '' : 's'} · ` +
            `${summary.files.filter((f) => f.total > 0).length} file${
                summary.files.filter((f) => f.total > 0).length === 1 ? '' : 's'
            }`,
    );
    out.push('');

    out.push('## By id');
    out.push('');
    out.push('| id | uses | files |');
    out.push('| --- | ---: | --- |');
    for (const { id, count, files } of summary.ids) {
        out.push(`| \`${id}\` | ${count} | ${files.map((f) => `\`${f}\``).join(', ')} |`);
    }
    out.push('');

    out.push('## By file');
    out.push('');
    for (const file of summary.files) {
        if (file.total === 0) continue;
        out.push(
            `- \`${file.sourcePath}\` — ${file.total} binding${
                file.total === 1 ? '' : 's'
            }`,
        );
        for (const [id, n] of file.byId) out.push(`    - \`${id}\` ×${n}`);
    }
    out.push('');

    if (summary.singletons.length || summary.nearDuplicates.length) {
        out.push('## Worth a look');
        out.push('');
        if (summary.singletons.length) {
            out.push(
                '**Used once.** Legitimate for a misconception sensed in one ' +
                    'place; also the shape every typo has.',
            );
            out.push('');
            for (const id of summary.singletons) out.push(`- \`${id}\``);
            out.push('');
        }
        if (summary.nearDuplicates.length) {
            out.push(
                '**Near-duplicates** — within two character edits of each ' +
                    'other. Two spellings of one misconception split its data ' +
                    'in half.',
            );
            out.push('');
            for (const { a, b, distance } of summary.nearDuplicates) {
                out.push(`- \`${a}\` ↔ \`${b}\` (${distance} edit${distance === 1 ? '' : 's'})`);
            }
            out.push('');
        }
    }

    return out.join('\n');
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
        glossaryLoader: await mod.getGlossaryLoader(),
        buildGlossaryIndex: mod.buildGlossaryIndex,
        crossLinkTargets: mod.crossLinkTargets,
        GLOSSARY_MAX_ENTRIES: mod.GLOSSARY_MAX_ENTRIES,
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
        // The SERVER's numeric parser, for the parity test below `canNeverFire`.
        // The script itself cannot use it — the dead-binding check runs
        // synchronously while this pipeline loads async — so the copy stays and
        // the test proves the two agree.
        parseNumericValue: mod.parseNumericValue,
        slugify: mod.slugify,
        slugWithSuffix: mod.slugWithSuffix,
        DEFAULT_TITLE: mod.DEFAULT_TITLE,
        DEFAULT_COURSE: mod.DEFAULT_COURSE,
    };
}

// =============================================================================
// The course glossary (docs/design/glossary.md R2, R4, R8, W-5–W-7, W-12, EN-12)
// =============================================================================

/**
 * True when a PostgREST error says the TABLE or FUNCTION does not exist —
 * i.e. migration 0043 has not been applied to this database. Routed on the
 * codes PostgREST and Postgres actually send, never on a bare word that the
 * request path might contain (the 0039/0041 source_key lesson, above).
 */
export function isMissingRelation(message) {
    return /\b(PGRST205|PGRST202|42P01|42883)\b/.test(message);
}

/** EN-12: more than 25, OR more than 20% of the active entries AND more than 5. */
export const MASS_RETIRE_MAX = 25;
export function isMassRetire(retiredCount, activeBefore) {
    return (
        retiredCount > MASS_RETIRE_MAX ||
        (retiredCount > 5 && retiredCount > 0.2 * activeBefore)
    );
}

/** 1-based line of the first `[[text]]` in a file — W-7 wants every message
 * located, and the converted document no longer knows where it came from. */
export function lineOfReference(markdown, text) {
    const lines = markdown.split('\n');
    const needle = `[[${text}]]`;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(needle)) return i + 1;
    }
    const folded = needle.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(folded)) return i + 1;
    }
    return 1;
}

/** The R2 reference gate's warnings for one file, W-7 shaped. */
export function unresolvedReferenceWarnings(sourcePath, markdown, report) {
    return (report?.references ?? [])
        .filter((r) => r.resolution === 'none')
        .map(
            (r) =>
                `${sourcePath}:${lineOfReference(markdown, r.text)} [[${r.text}]] — not in the ` +
                'course glossary or this activity, left as plain text; ' +
                (r.suggestion
                    ? `did you mean “${r.suggestion}”?`
                    : `add it to the glossary file, or define it here with [[${r.text} :: …]]`),
        );
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
/**
 * The column PostgREST said was missing, or null.
 *
 * ⚠ WHY THIS IS NOT A SUBSTRING TEST, which is what it was for about an hour on
 * 2026-08-26. The thrown error embeds the request PATH, and the path carries the
 * whole `select=` list — so `/source_fingerprint/.test(message)` is TRUE even
 * when the missing column is `source_key`, because the select names both. The
 * run then told the author to apply a migration they had applied five days
 * earlier, with total confidence, against a database that was fine.
 *
 * That is this repo's documented defect class wearing new clothes: a check that
 * appears to test a fact but actually tests a string that happens to contain it.
 * Route on what the database NAMED.
 */
export function missingColumnFrom(message) {
    return (
        /column\s+\S*?\.?(\w+)\s+does not exist/i.exec(message ?? '')?.[1] ?? null
    );
}

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
                    '&select=id,source_path,source_key,status,title,tags,' +
                    'pedagogical_role,course,unit,draft_content,' +
                    'source_fingerprint,current_version_id',
            );
        },

        /** The content of the given published versions, by version id. Used
         *  only to decide whether an update would change anything. */
        async versionContents(ids) {
            if (ids.length === 0) return new Map();
            const rows = await call(
                `/activity_versions?id=in.(${ids.join(',')})&select=id,content`,
            );
            return new Map(rows.map((r) => [r.id, r.content]));
        },

        /**
         * Soft-deleted rows that still hold a key.
         *
         * The builder's commitment is that a key is never reused after
         * deletion, and the database cannot enforce it: 0041's unique index
         * excludes tombstones ON PURPOSE, so deleting in the app and
         * re-importing is the author's undo. The consequence is that a reused
         * key does not collide — it silently mints a fresh-looking activity.
         * This query is the only thing that can see that, so the warning it
         * feeds is the commitment's only enforcement.
         */
        deletedKeysFor(ownerId) {
            return call(
                `/activities?owner_id=eq.${ownerId}&deleted_at=not.is.null` +
                    '&source_key=not.is.null&select=id,source_key,title,deleted_at',
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

        /**
         * Mirror the misconception registry into the platform table (0042
         * EH-7): the submit RPC validates `mis.*` observations against it,
         * so the mirror is what makes "rejected at the door" real — and the
         * grading prompt reads `description` for its misconception entries,
         * so mirroring the file's inline comments is what gives the model
         * descriptor text instead of bare ids.
         *
         * merge-duplicates: the FILE is canonical (generated in the
         * curriculum repo, never hand-edited, CI-pinned), so a re-run
         * mirrors its descriptions verbatim — including a null where the
         * file carries none. The `skill` column is deliberately NOT sent
         * (untouched by the merge): skill attachment is still the open
         * boundary-page ask. Ids are never deleted here — the curriculum
         * side's own rule is that a registry id, once minted, is permanent.
         */
        /**
         * The owner's ACTIVE glossary rows — the resolution source for a run
         * without --glossary (R2), so a flag-less re-import never false-warns
         * on a term the store already holds. Paged: PostgREST caps every read
         * at 1,000 rows by default (EN-1), and a glossary may run to 2,000.
         */
        async activeGlossary(ownerId) {
            const rows = [];
            for (let offset = 0; ; offset += 1000) {
                const page = await call(
                    `/glossary_entry?owner_id=eq.${ownerId}&retired_at=is.null` +
                        '&select=term_id,term,variants,body' +
                        `&order=term_id&offset=${offset}&limit=1000`,
                );
                rows.push(...page);
                if (page.length < 1000) break;
            }
            return rows.map((r) => ({
                id: r.term_id,
                term: r.term,
                variants: r.variants ?? {},
                body: r.body ?? [],
            }));
        },

        /**
         * The glossary mirror — ONE atomic service RPC (0043 EN-2). apply=false
         * computes the identical report and writes nothing: the dry run and the
         * mass-retire guard both read it before any write happens.
         */
        syncGlossary(ownerId, entries, apply) {
            return call('/rpc/sync_glossary_entries', {
                method: 'POST',
                body: JSON.stringify({
                    p_owner: ownerId,
                    p_entries: entries.map((e) => ({
                        term_id: e.id,
                        term: e.term,
                        variants: e.variants,
                        body: e.body,
                    })),
                    p_apply: apply,
                }),
            });
        },

        syncMisconceptionRegistry(ids, descriptions = new Map()) {
            // return=representation is LOAD-BEARING, not verbosity: a bare
            // upsert answers 201 with an EMPTY body, and call() JSON-parses
            // every non-204 response — the first live run of this mirror
            // died exactly there (2026-09-26), and the run-level fail-soft
            // demoted the crash to a warning nobody read. The echo also
            // lets the caller print a real count instead of an assumption.
            return call('/misconception_registry?on_conflict=id', {
                method: 'POST',
                headers: {
                    Prefer: 'resolution=merge-duplicates,return=representation',
                },
                body: JSON.stringify(
                    [...ids].map((id) => ({ id, description: descriptions.get(id) ?? null })),
                ),
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
    let strict = false;
    let registry = null;
    let skillsRegistry = null;
    let chainRegistry = null;
    let glossary = null;
    let allowMassRetire = false;

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
        else if (arg === '--strict') strict = true;
        else if (arg === '--owner') owner = argv[++i] ?? null;
        else if (arg.startsWith('--owner=')) owner = arg.slice('--owner='.length);
        else if (arg === '--registry') registry = argv[++i] ?? null;
        else if (arg.startsWith('--registry=')) registry = arg.slice('--registry='.length);
        else if (arg === '--skills-registry') skillsRegistry = argv[++i] ?? null;
        else if (arg.startsWith('--skills-registry='))
            skillsRegistry = arg.slice('--skills-registry='.length);
        else if (arg === '--chain-registry') chainRegistry = argv[++i] ?? null;
        else if (arg.startsWith('--chain-registry='))
            chainRegistry = arg.slice('--chain-registry='.length);
        else if (arg === '--glossary') glossary = argv[++i] ?? null;
        else if (arg.startsWith('--glossary=')) glossary = arg.slice('--glossary='.length);
        else if (arg === '--allow-mass-retire') allowMassRetire = true;
        else if (arg.startsWith('--')) throw new Error(`unknown flag ${arg}`);
        else positional.push(arg);
    }

    return {
        folder: positional[0] ?? null,
        owner,
        dryRun,
        force,
        strict,
        registry,
        skillsRegistry,
        chainRegistry,
        glossary,
        allowMassRetire,
    };
}

/** The help text. Every flag parseArgs accepts appears here (W-11; the
 * batch-import test reads parseArgs's source and holds the two together). */
export function usageText() {
    return `
  pnpm import:batch <folder> --owner <email|uuid> [--dry-run] [--force]
                             [--registry <file>] [--skills-registry <file>]
                             [--chain-registry <file>] [--glossary <file>]
                             [--allow-mass-retire] [--strict]

  <folder>     the catalogue folder; every .md under it is imported, keyed on
               its path RELATIVE to this folder
  --owner      whose activities these are. Required — there is no sensible
               default, and guessing would write to the wrong teacher
  --dry-run    report what WOULD change; write nothing to the database
  --force      overwrite even activities that were edited in the app since
               their last import. Without it those files are refused and named
               (their app-side edits would be destroyed -- the file wins)
  --skills-registry
               a file of valid skill ids, one per line (# comments, blank lines
               ignored). Turns "which skills are covered" from unanswerable into
               a generated manifest, because coverage needs the ids that EXIST,
               not only the ones the catalogue happens to name
  --chain-registry
               the chain registry file (chain folder = unit title, one per line).
               Without it the run reads chain-registry.txt from the catalogue
               root, if there is one. With it, a copy left in the root is NOT
               read, and the run says so
  --registry   a file of valid mis.* ids, one per line (# comments, blank lines
               ignored). Bindings outside it warn, by name. A folder that
               carries bindings and supplies no registry warns for that too
  --glossary   the course glossary file (\`\`\`definitions entries, each with a
               required id: line — docs/markdown-import-format.md). Every
               [[term]] resolves against it, and the run MIRRORS it into the
               store: new and changed entries are written, entries no longer in
               the file are RETIRED (never deleted). Without it, references
               resolve against the store as it stands and the store is not
               touched. --dry-run --glossary resolves and reports, writes nothing
  --allow-mass-retire
               let a live --glossary run retire more than 25 entries, or more
               than 20% of the active ones (and more than 5). Without it such a
               run is refused before any write and the retire set is printed
  --strict     make every binding, catalogue and glossary warning — a suspect
               id, an id outside the registry, a mistake that can never fire, a
               missing registry, an unresolved [[term]], a glossary file
               problem — and a FAILED mirror (the misconception registry's or
               the glossary's) exit 1. Without it they are printed and the exit
               code is unchanged

  Every run rewrites ${MANIFEST_PATH} — every binding, per file and
  across the folder, with singleton and near-duplicate ids flagged.

  Credentials come from .env.supabase (cp .env.supabase.example .env.supabase).
  BATCH_IMPORT_OUTPUT_ROOT=<dir> writes the generated manifests under <dir>
  instead of the repo (a demo or scratch run must not rewrite the real ones).
`;
}

function usage(message) {
    console.error(`\n${message}\n${usageText()}`);
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

    // The registry is read UP FRONT, so a typo'd path fails before a 150-file
    // run rather than after it — and so that "no registry" always means the
    // author did not pass one, never that the file could not be opened. The
    // second reading is the one that would be dangerous: it turns a validation
    // step into a step that silently did not happen.
    let registry = null;
    if (args.registry) {
        const path = resolve(args.registry);
        const text = await readFile(path, 'utf8').catch(() => null);
        if (text === null) usage(`--registry ${path} could not be read.`);
        registry = {
            path: args.registry,
            ids: parseRegistry(text),
            descriptions: parseRegistryDescriptions(text),
        };
        if (registry.ids.size === 0) {
            usage(
                `--registry ${path} lists no ids.\n\n` +
                    '  An empty registry would make EVERY binding unknown, which reads as a\n' +
                    '  catalogue full of typos rather than as a mis-pointed flag.',
            );
        }
    }

    // The skill registry, read with the same up-front discipline as the
    // misconception one: a typo'd path fails before a 150-file run, not after.
    let skills = null;
    if (args.skillsRegistry) {
        const path = resolve(args.skillsRegistry);
        const text = await readFile(path, 'utf8').catch(() => null);
        if (text === null) usage(`--skills-registry ${path} could not be read.`);
        skills = { path: args.skillsRegistry, ...parseSkillRegistry(text) };
        if (skills.ids.size === 0) {
            usage(
                `--skills-registry ${path} lists no ids.\n\n` +
                    '  An empty skill registry would report every skill in the catalogue as\n' +
                    '  unregistered AND report zero skills uncovered — two opposite lies from\n' +
                    '  one empty file.',
            );
        }
    }

    // The glossary file, read UP FRONT like the registries: a typo'd path fails
    // before the run, and "no glossary" always means none was passed. Its
    // RULES run once the pipeline is loaded (they need the fence parser).
    let glossaryText = null;
    if (args.glossary) {
        const path = resolve(args.glossary);
        glossaryText = await readFile(path, 'utf8').catch(() => null);
        if (glossaryText === null) usage(`--glossary ${path} could not be read.`);
    }

    // The chain registry: --chain-registry <file>, else chain-registry.txt in
    // the catalogue root (readChainRegistry has the reasoning). Absent from the
    // root is legal — a catalogue that does not use chains states `unit:` per
    // file. A FLAG that cannot be read, or that lists nothing, is refused up
    // front like the other registries: it would otherwise file every activity
    // under no unit and report each chain folder as unregistered.
    const chainSource = await readChainRegistry(root, args.chainRegistry);
    const chainText = chainSource.text;
    if (chainSource.source === 'flag' && chainText === null) {
        usage(`--chain-registry ${chainSource.path} could not be read.`);
    }
    const chains = chainText === null
        ? { titles: new Map(), duplicates: [] }
        : parseChainRegistry(chainText);
    if (chainSource.source === 'flag' && chains.titles.size === 0) {
        usage(
            `--chain-registry ${chainSource.path} lists no chains.\n\n` +
                '  An empty chain registry would report every chain folder as unregistered\n' +
                '  and file every activity under no unit — a mis-pointed flag, not a\n' +
                '  catalogue with no chains.',
        );
    }

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
            `${args.force ? ' · --force (app-side edits WILL be overwritten)' : ''}` +
            `${args.strict ? ' · --strict (warnings fail the run)' : ''}` +
            `${args.allowMassRetire ? ' · --allow-mass-retire' : ''}`,
    );
    console.log(
        `registry  : ${registry ? `${registry.path} (${registry.ids.size} ids)` : 'none supplied'}`,
    );
    console.log(
        `skills    : ${
            skills
                ? `${skills.path} (${skills.ids.size} ids` +
                  `${skills.parts.size > 0 ? `, ${skills.parts.size} multi-part` : ''})`
                : 'none supplied'
        }`,
    );
    console.log(
        `chains    : ${
            chainText === null
                ? 'no chain-registry.txt in the catalogue root'
                : `${chainSource.label} (${chains.titles.size} chains)`
        }${
            chainSource.shadowed
                ? `\n            ⚠ ${chainSource.shadowed} also exists and was NOT read — ` +
                  'delete that copy.'
                : ''
        }\n`,
    );

    let files, existing, deletedRows, pipeline, storeRows;
    try {
        [files, existing, deletedRows, pipeline, storeRows] = await Promise.all([
            findMarkdownFiles(root),
            db.existingFor(owner.id),
            db.deletedKeysFor(owner.id),
            loadPipeline(),
            // Without --glossary the resolution source is the store as it
            // stands (R2). A database without 0043 is not an error here — the
            // run resolves locally and says so in ONE line (W-6).
            glossaryText !== null
                ? Promise.resolve(null)
                : db.activeGlossary(owner.id).catch((err) => {
                    if (isMissingRelation(err.message)) return 'missing';
                    throw err;
                }),
        ]);
    } catch (err) {
        // 0039 adds the drift guard's column. Refuse up front with the fix
        // rather than letting the run proceed with the guard silently absent —
        // a safeguard nobody can see is not a safeguard (policy P3), and this
        // one exists to stop the author's own work being overwritten.
        // ⚠ ROUTE ON THE COLUMN POSTGREST NAMED, NOT ON A SUBSTRING OF THE
        // ERROR. The thrown message embeds the request PATH, and the path
        // contains the whole select list — so a bare /source_fingerprint/ test
        // matches even when the missing column is source_key, and the run
        // confidently tells the author to apply a migration they applied days
        // ago. Observed 2026-08-26, against a database that already had 0039.
        const missingColumn = missingColumnFrom(err.message);
        if (missingColumn === 'source_fingerprint') {
            usage(
                'The database is missing `activities.source_fingerprint`, which this\n' +
                    '  importer needs to tell an app-side edit from an unchanged draft.\n\n' +
                    '  Apply migration 0039 and re-run:\n' +
                    '    supabase db push',
            );
            return;
        }
        // Same refusal, same reason, one migration later: without source_key
        // every keyed file would fall through to path matching, which is the
        // behaviour this whole slice replaced. Failing loudly beats silently
        // reverting to it.
        if (missingColumn === 'source_key') {
            usage(
                'The database is missing `activities.source_key`, which this importer\n' +
                    '  uses as the activity\'s identity — without it a moved or renamed file\n' +
                    '  orphans its row instead of following it.\n\n' +
                    '  Apply migration 0041 and re-run:\n' +
                    '    supabase db push',
            );
            return;
        }
        throw err;
    }

    // ---- the glossary source -------------------------------------------------
    // ONE list of entries every file resolves against: the file (canonical,
    // and about to be mirrored), else the owner's active store rows, else
    // nothing (0043 missing). Marks resolve from this even when the mirror
    // later fails.
    let glossaryFile = null;
    let glossarySource;
    if (glossaryText !== null) {
        glossaryFile = pipeline.glossaryLoader(glossaryText, args.glossary);
        glossarySource = { kind: 'file', entries: glossaryFile.entries };
    } else if (storeRows === 'missing') {
        glossarySource = { kind: 'missing', entries: [] };
    } else {
        glossarySource = { kind: 'store', entries: storeRows };
    }
    console.log(
        `glossary  : ${
            glossarySource.kind === 'file'
                ? `${args.glossary} (${glossaryFile.entries.length} entries, ` +
                  `${glossaryFile.variantCount} variant${glossaryFile.variantCount === 1 ? '' : 's'})`
                : glossarySource.kind === 'store'
                    ? `the owner's store as it stands (${glossarySource.entries.length} active ` +
                      'entries; pass --glossary <file> to mirror a new version)'
                    : 'none — glossary_entry is missing (migration 0043 not applied)'
        }\n`,
    );

    // ---- the identity pre-pass ----------------------------------------------
    // Every file's text is read ONCE here and carried through the run: the key
    // has to be known before planning (it decides which row a file converts
    // against), and reading twice for 150 files is waste the run can see.
    const catalogueWarnings = [];
    const keyed = [];
    for (const file of files) {
        const markdown = await readFile(file.absolute, 'utf8').catch(() => null);
        if (markdown === null) {
            catalogueWarnings.push(`${file.sourcePath}: could not be read.`);
            continue;
        }
        keyed.push({ ...file, markdown, key: scanSourceKey(markdown) });
    }
    files = keyed;

    // Two files claiming one identity. Fatal BEFORE any write, because the
    // alternative is one file's document landing in the other's row and the
    // loser being reported as a create that then fails on the unique index —
    // an outcome whose message names neither file.
    const byKey = new Map();
    const duplicateKeys = [];
    for (const file of files) {
        if (!file.key) continue;
        const first = byKey.get(file.key);
        if (first) duplicateKeys.push({ key: file.key, files: [first, file.sourcePath] });
        else byKey.set(file.key, file.sourcePath);
    }
    if (duplicateKeys.length > 0) {
        console.error('\nTWO FILES CLAIM THE SAME KEY — nothing was written.\n');
        for (const { key, files: pair } of duplicateKeys) {
            console.error(`  ${key}`);
            for (const f of pair) console.error(`    ${f}`);
        }
        console.error(
            '\n  A key is an activity\'s permanent identity. Copying a file to start a\n' +
                '  new activity means minting a new key for the copy — the original\'s key\n' +
                '  belongs to the original for good.\n',
        );
        process.exitCode = 1;
        return;
    }

    // A key that belonged to a soft-deleted activity. Not refused — deleting in
    // the app and re-importing IS the author's undo, and that path is load-
    // bearing — but named, because the same shape is also the one mistake the
    // no-reuse commitment forbids, and nothing else in the system can see it.
    const tombstones = new Map(
        (deletedRows ?? []).map((r) => [r.source_key, r]),
    );

    // The row shape convertOne wants: draft meta lifted out of draft_content so
    // the never-clobber merge can see the course/settings an unpublished
    // activity is already carrying.
    const enriched = existing.map((row) => ({
        ...row,
        draftMeta: row.draft_content?.meta,
        draftCalculator: row.draft_content?.calculator,
    }));

    const { creates, updates, orphans, conflicts } = planIdentity(files, enriched);

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

    // The manifest describes the FOLDER, not the write plan — a file the drift
    // guard refused still carries the bindings it carries, and a manifest that
    // dropped them would under-report the taxonomy for a reason (the state of a
    // database row) that has nothing to do with the taxonomy. Keyed by source
    // path so the refused pass below can fill its own entries in, and read back
    // in `files` order so the artifact is folder-ordered rather than plan-
    // ordered. Files that FAILED to convert contribute nothing and cannot: the
    // run already exits 1 for them, which is the flag that the snapshot is
    // partial.
    const collected = new Map();

    // Catalogue facts, gathered on the same pass as the bindings and keyed the
    // same way. `published` comes from the ROW rather than the file, because
    // "does this coverage count" is a question about what students can reach.
    const catalogue = new Map();
    const chainTitleFor = (file) => {
        const folder = chainFolderOf(file.sourcePath);
        return folder === null ? null : (chains.titles.get(folder) ?? null);
    };
    const glossaryReports = new Map();
    const record = (file, converted, row) => {
        collected.set(file.sourcePath, collectBindings(converted.document));
        glossaryReports.set(file.sourcePath, converted.glossary);
        catalogue.set(file.sourcePath, {
            sourcePath: file.sourcePath,
            primarySkill: converted.primarySkill,
            supportingSkills: converted.supportingSkills,
            chainRole: converted.chainRole,
            reservedKeys: converted.reservedKeys,
            unitOverride: converted.unitOverride,
            published: row?.status === 'published',
        });
        // The pre-pass and the real parser must agree about identity. They read
        // the same syntax by two routes (see scanSourceKey), and a divergence
        // would mean this run planned against one key and wrote another.
        if ((converted.sourceKey ?? null) !== (file.key ?? null)) {
            catalogueWarnings.push(
                `${file.sourcePath}: the key scanner read “${file.key ?? '(none)'}” but the ` +
                    `importer read “${converted.sourceKey ?? '(none)'}”. This is a bug in the ` +
                    'scanner, not in your file — please report it; nothing was planned from ' +
                    'the second value.',
            );
        }
    };

    for (const { file } of creates) {
        try {
            const converted = convertOne(pipeline, file.markdown, null, file.sourcePath, {
                chainTitle: chainTitleFor(file),
                glossary: glossarySource.entries,
            });
            plannedCreates.push({ file, converted });
            record(file, converted, null);
            if (converted.warnings.length) warned.push({ file, warnings: converted.warnings });
        } catch (err) {
            skipped.push({ file, error: err.message });
        }
    }

    for (const { file, row, adoptsKey, moved } of updatable) {
        try {
            const converted = convertOne(pipeline, file.markdown, row, file.sourcePath, {
                chainTitle: chainTitleFor(file),
                glossary: glossarySource.entries,
            });
            plannedUpdates.push({ file, row, converted, adoptsKey, moved });
            record(file, converted, row);
            if (converted.warnings.length) warned.push({ file, warnings: converted.warnings });
        } catch (err) {
            skipped.push({ file, error: err.message });
        }
    }

    // Would each update actually change anything? (ruling (b) + the agreed
    // extension.) A row with no draft is compared against its CURRENT
    // PUBLISHED version, fetched here — one query, only for those rows.
    const versionIds = plannedUpdates
        .filter(({ row }) => row.draft_content == null && row.current_version_id)
        .map(({ row }) => row.current_version_id);
    const versionContent = await db.versionContents(versionIds);
    const { pathOnly, unchanged, full: fullUpdates } = classifyUpdates(
        plannedUpdates,
        (row) => (row.current_version_id ? (versionContent.get(row.current_version_id) ?? null) : null),
        pipeline.ActivityDocument,
    );

    for (const { file, row } of drifted) {
        // Read-only, for the manifest alone. A conversion failure here is
        // swallowed deliberately: the file is refused either way, its refusal
        // is already printed, and turning it into a skip would make the exit
        // code depend on a file this run was never going to write.
        try {
            const converted = convertOne(pipeline, file.markdown, row, file.sourcePath, {
                chainTitle: chainTitleFor(file),
                glossary: glossarySource.entries,
            });
            record(file, converted, row);
        } catch {
            /* refused already; nothing to add */
        }
    }

    const summary = summarizeBindings(
        files
        .filter((file) => collected.has(file.sourcePath))
        .map((file) => ({ sourcePath: file.sourcePath, ...collected.get(file.sourcePath) })),
    );

    // ---- binding warnings ---------------------------------------------------
    // Assembled before the report so the report can print them, and counted so
    // both exit points can read one number. The importer's own suspect-id
    // warnings are ALREADY in `warned` (they come out of convertOne); they are
    // counted here rather than moved, because a suspect id is also a
    // degradation of the document and belongs in that list too.
    const bindingWarnings = [];
    for (const file of files) {
        const entry = collected.get(file.sourcePath);
        if (entry) {
            bindingWarnings.push(...bindingWarningsFor(file.sourcePath, entry, registry));
        }
    }
    if (summary.total > 0 && !registry) {
        // P3, in one line: the check that can only run when the file is present
        // must SAY so when the file is absent. Silence here would read exactly
        // like a clean registry pass.
        bindingWarnings.push(
            `${summary.total} binding${summary.total === 1 ? '' : 's'} across ` +
                `${summary.ids.length} id${summary.ids.length === 1 ? '' : 's'}, and NO ` +
                '--registry was supplied — nothing checked those ids against your ' +
                'taxonomy. Pass --registry <file> to validate them.',
        );
    }
    // ---- catalogue warnings -------------------------------------------------
    // The curriculum contract's half of validation: identity, the one primary
    // skill, and the chain registry. Kept separate from binding warnings
    // because they answer a different question — a binding warning says the
    // sensor data will be wrong, these say the catalogue's STRUCTURE will be.
    const perFileCatalogue = files
        .filter((f) => catalogue.has(f.sourcePath))
        .map((f) => catalogue.get(f.sourcePath));

    for (const entry of perFileCatalogue) {
        const file = files.find((f) => f.sourcePath === entry.sourcePath);
        if (!file?.key) {
            catalogueWarnings.push(
                `${entry.sourcePath}: no \`key:\` — this file's identity is its PATH, so ` +
                    'moving or renaming it will orphan its activity and create a second one. ' +
                    `Add \`key: ${suggestKeyFor(entry.sourcePath)}\` to its \`\`\`meta fence.`,
            );
        }
        if (!entry.primarySkill) {
            catalogueWarnings.push(
                `${entry.sourcePath}: no \`skill:\` — an activity targets exactly one primary ` +
                    'skill, and without it this activity can never be counted as covering ' +
                    'anything.',
            );
        }
        if (skills) {
            for (const id of [
                ...(entry.primarySkill ? [entry.primarySkill] : []),
                ...entry.supportingSkills,
            ]) {
                if (!skills.ids.has(id)) {
                    catalogueWarnings.push(
                        `${entry.sourcePath}: skill “${id}” is not in ${skills.path}. An ` +
                            'unregistered id fragments coverage the same way an unregistered ' +
                            'misconception id fragments the sensor data.',
                    );
                }
            }
        }
        if (entry.unitOverride) {
            catalogueWarnings.push(
                `${entry.sourcePath}: states \`unit: ${entry.unitOverride.stated}\` but its ` +
                    `chain is registered as “${entry.unitOverride.chain}”. The file wins — ` +
                    'this is legal, and reported so it is never accidental.',
            );
        }
    }

    if (skills) {
        for (const { id, count } of skills.malformed) {
            catalogueWarnings.push(
                `${skills.path}: “${id} = ${count}” — a part count must be a whole number ` +
                    'of parts (1 or more). Treated as one part.',
            );
        }
    }

    // Chain folders with no registry entry, and two chains sharing a title.
    if (chainText !== null) {
        const foldersSeen = new Set(
            files.map((f) => chainFolderOf(f.sourcePath)).filter((f) => f !== null),
        );
        for (const folder of [...foldersSeen].sort()) {
            if (!chains.titles.has(folder)) {
                catalogueWarnings.push(
                    `chain folder “${folder}” has no entry in ${chainSource.label}, so every ` +
                        'activity in it will be filed under whatever unit each file states, ' +
                        'or under none.',
                );
            }
        }
        for (const folders of duplicateChainTitles(chains.titles)) {
            catalogueWarnings.push(
                `${chainSource.label} gives the same title to ${folders.join(' and ')} — the ` +
                    'activities list groups by the unit STRING, so those chains would merge ' +
                    'into one outline group with nothing to show they were ever separate.',
            );
        }
        for (const folder of chains.duplicates) {
            catalogueWarnings.push(
                `${chainSource.label} lists “${folder}” more than once; the last line won.`,
            );
        }
    }

    // A key that belonged to a deleted activity (see db.deletedKeysFor).
    for (const { file } of plannedCreates) {
        const tomb = file.key ? tombstones.get(file.key) : null;
        if (tomb) {
            catalogueWarnings.push(
                `${file.sourcePath}: key “${file.key}” belonged to a DELETED activity ` +
                    `(“${tomb.title}”). If this is that activity coming back, nothing is ` +
                    'wrong. If it is a new activity that inherited a key by copy, mint it a ' +
                    'new one — a reused key makes two different activities one lineage.',
            );
        }
    }

    // A key edited in place: the row at this path answers to another key.
    for (const { file, row, was, now } of conflicts) {
        catalogueWarnings.push(
            `${file.sourcePath}: the activity at this path holds key “${was}” but the file ` +
                `now declares “${now}”. A key is permanent — changing one is retiring an ` +
                'activity and minting another. Either restore the old key, or soft-delete ' +
                `“${row.title}” in the app first and re-run. Nothing was written for this file.`,
        );
    }

    // ---- glossary warnings (R2, R3, W-11) -------------------------------------
    // The file's own problems, then every [[term]] that resolved to nothing —
    // in every file, fence or no fence (R2). With no resolution source at all
    // (0043 missing, no --glossary) the references cannot be CHECKED, which is
    // a notice about the database, not N warnings about the catalogue (W-6).
    const glossaryWarnings = [...(glossaryFile?.warnings ?? [])];
    const referenceCounts = { store: 0, local: 0, none: 0 };
    const shadows = [];
    for (const file of files) {
        const report = glossaryReports.get(file.sourcePath);
        if (!report) continue;
        for (const ref of report.references) referenceCounts[ref.resolution] += 1;
        for (const shadow of report.shadows) shadows.push({ file: file.sourcePath, ...shadow });
        if (glossarySource.kind !== 'missing') {
            glossaryWarnings.push(
                ...unresolvedReferenceWarnings(file.sourcePath, file.markdown, report),
            );
        }
    }

    // The mirror's plan, computed by the database itself with p_apply=false —
    // the SAME call the live write makes, so the dry run cannot disagree with
    // it (W-14). Reading it here, before any write, is also what lets the
    // mass-retire guard refuse a run that has written nothing (W-5).
    let glossaryPlan = null;
    let glossaryMirrorFailed = null;
    if (glossaryFile) {
        try {
            glossaryPlan = await db.syncGlossary(owner.id, glossaryFile.entries, false);
        } catch (err) {
            glossaryMirrorFailed = isMissingRelation(err.message)
                ? 'glossary_entry is missing (migration 0043 not applied) — the store was ' +
                  'not mirrored; every [[term]] above was still checked against the FILE. ' +
                  'Apply 0043 and re-run.'
                : err.message;
        }
    }
    const massRetire =
        glossaryPlan !== null &&
        isMassRetire(glossaryPlan.retired.length, glossaryPlan.active_before);

    const suspectCount = warned.reduce(
        (n, { warnings }) => n + warnings.filter(isBindingWarning).length,
        0,
    );
    const bindingProblems = bindingWarnings.length + suspectCount;

    // ---- report -------------------------------------------------------------
    console.log(
        `found ${files.length} file${files.length === 1 ? '' : 's'} · ` +
            `${plannedCreates.length} to create · ${fullUpdates.length} to update · ` +
            `${pathOnly.length} path only · ${unchanged.length} unchanged · ` +
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
    for (const { file, row } of pathOnly) {
        // Content identical to what the row holds now; only where the file sits
        // (or its key) is written — no draft lands on a published activity.
        console.log(
            `  path    ${file.sourcePath}  (content unchanged — path only` +
                `${row.source_path && row.source_path !== file.sourcePath ? `, was ${row.source_path}` : ''})`,
        );
    }
    for (const { file } of unchanged) {
        console.log(`  same    ${file.sourcePath}  (unchanged, nothing written)`);
    }
    for (const { file, converted } of fullUpdates) {
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

    // ---- the binding manifest -----------------------------------------------
    // Printed on EVERY run, dry or not. This is the "verified in the same
    // dry-run that imports it" promise: a binding the author just wrote is
    // either in this list, with the count they expect, or it is not — and if it
    // is not, they find that out now rather than from a term's worth of data
    // that quietly says nobody made the mistake.
    console.log('\nmisconception bindings:');
    if (summary.total === 0) {
        console.log('  none');
    } else {
        for (const file of summary.files) {
            if (file.total === 0) continue;
            console.log(
                `  ${file.sourcePath}: ${file.total} binding${
                    file.total === 1 ? '' : 's'
                } → ` + file.byCount.map(([id, n]) => `${id} ×${n}`).join(', '),
            );
        }
        console.log(
            `\n  across ${summary.files.filter((f) => f.total > 0).length} file` +
                `${summary.files.filter((f) => f.total > 0).length === 1 ? '' : 's'}: ` +
                `${summary.total} binding${summary.total === 1 ? '' : 's'}, ` +
                `${summary.ids.length} distinct id${summary.ids.length === 1 ? '' : 's'}`,
        );
        for (const { id, count, files: where } of summary.ids) {
            console.log(`    ${id} ×${count}  (${where.join(', ')})`);
        }
        if (summary.singletons.length) {
            console.log(
                '\n  used ONCE — fine for a one-off, and the shape every typo has:',
            );
            for (const id of summary.singletons) console.log(`    ${id}`);
        }
        if (summary.nearDuplicates.length) {
            console.log(
                '\n  NEAR-DUPLICATES — within two character edits; two spellings of\n' +
                    '  one misconception split its data in half:',
            );
            for (const { a, b, distance } of summary.nearDuplicates) {
                console.log(`    ${a}  ↔  ${b}   (${distance} edit${distance === 1 ? '' : 's'})`);
            }
        }
    }

    // BATCH_IMPORT_OUTPUT_ROOT sends the three generated artifacts somewhere
    // other than the repo — for the glossary hello world (W-1) and the tests,
    // which must never rewrite the committed manifests with a demo catalogue.
    const outputRoot = process.env.BATCH_IMPORT_OUTPUT_ROOT
        ? resolve(process.env.BATCH_IMPORT_OUTPUT_ROOT)
        : repo;
    await mkdir(resolve(outputRoot, 'docs'), { recursive: true });
    const manifestPath = resolve(outputRoot, MANIFEST_PATH);
    // Name where the artifacts ACTUALLY went — a redirected run that reported
    // the repo path would send the author looking at a file it never touched.
    const shown = (path) => (outputRoot === repo ? path : resolve(outputRoot, path));
    await writeFile(manifestPath, `${renderManifest(summary)}`, 'utf8');
    console.log(`\n  manifest written to ${shown(MANIFEST_PATH)}`);

    // ---- skill coverage -----------------------------------------------------
    const coverage = summarizeCoverage(perFileCatalogue, skills);
    // Scoped to PARTS only (consolidations are excluded upstream), or it would
    // fire on every well-formed chain that ends with one.
    for (const id of coverage.exceeded) {
        const e = coverage.covered.find((c) => c.id === id);
        catalogueWarnings.push(
            `skill “${id}” is declared as ${e.declaredParts} part` +
                `${e.declaredParts === 1 ? '' : 's'} but ${e.parts.length} activities teach ` +
                `it: ${e.parts.join(', ')}. Either the registry's count is stale, or one of ` +
                'those activities is a consolidation and needs `chain_role: consolidation`.',
        );
    }
    console.log('\nskill coverage:');
    if (skills) {
        const coveredCount = coverage.covered.filter(
            (e) => e.registered && e.complete,
        ).length;
        console.log(
            `  ${coveredCount}/${coverage.registrySize} skills covered · ` +
                `${coverage.partial.length} partial · ` +
                `${coverage.uncovered.length} uncovered · ` +
                `${coverage.files.length} activities`,
        );
        for (const id of coverage.partial) {
            const e = coverage.covered.find((c) => c.id === id);
            console.log(`  partial: ${id} — ${e.parts.length} of ${e.declaredParts} parts`);
        }
        if (coverage.uncovered.length) {
            console.log('  uncovered:');
            for (const id of coverage.uncovered) console.log(`    ${id}`);
        }
    } else {
        console.log(
            '  no --skills-registry supplied — the catalogue names ' +
                `${coverage.covered.length} skill${coverage.covered.length === 1 ? '' : 's'}, ` +
                'but which skills are MISSING cannot be known without the registry.',
        );
    }
    await writeFile(
        resolve(outputRoot, COVERAGE_MANIFEST_PATH),
        `${renderCoverageManifest(coverage)}`,
        'utf8',
    );
    await writeFile(
        resolve(outputRoot, COVERAGE_JSON_PATH),
        `${JSON.stringify(coverageJson(coverage), null, 2)}\n`,
        'utf8',
    );
    console.log(
        `  coverage written to ${shown(COVERAGE_MANIFEST_PATH)} and ${shown(COVERAGE_JSON_PATH)}`,
    );

    // ---- the glossary report (R4, W-12) -------------------------------------
    // Counts always. Unresolved references and DIVERGENT shadows need action,
    // so they are listed in full (the unresolved ones in the warnings block
    // below); IDENTICAL shadows are safe-to-delete housekeeping, a count except
    // on a dry run, which is where the author reviews.
    console.log('\nglossary:');
    if (glossaryFile) {
        const index = pipeline.buildGlossaryIndex(
            glossaryFile.entries.map((e) => ({ ...e, retired: false, source: 'store' })),
            [],
        );
        const crossLinks = glossaryFile.entries.reduce(
            (n, e) => n + pipeline.crossLinkTargets(e.body, index, e.id).length,
            0,
        );
        console.log(
            `  file     : ${glossaryFile.entries.length} entries · ` +
                `${glossaryFile.variantCount} variant${glossaryFile.variantCount === 1 ? '' : 's'} · ` +
                `${crossLinks} cross-link${crossLinks === 1 ? '' : 's'}`,
        );
    }
    if (glossaryPlan) {
        const verb = args.dryRun ? 'would be' : 'to be';
        console.log(
            `  store    : ${glossaryPlan.new.length} new · ${glossaryPlan.changed.length} changed · ` +
                `${glossaryPlan.retired.length} retired · ${glossaryPlan.unretired.length} un-retired ` +
                `(${verb} written; ${glossaryPlan.active_before} active before)`,
        );
        if (glossaryPlan.retired.length > 0 && (args.dryRun || massRetire)) {
            console.log(`  retire   : ${glossaryPlan.retired.join(', ')}`);
        }
        if (massRetire) {
            console.log(
                `  ⚠ that is a MASS retire (more than ${MASS_RETIRE_MAX}, or more than 20% of the ` +
                    'active entries). A live run refuses it before any write unless ' +
                    '--allow-mass-retire is passed.',
            );
        }
    } else if (glossaryMirrorFailed) {
        console.log(`  store    : ⚠ ${glossaryMirrorFailed}`);
    }
    if (glossarySource.kind === 'missing') {
        const n = referenceCounts.none;
        console.log(
            `  ⚠ glossary_entry is missing (migration 0043 not applied) — ${n} [[term]] ` +
                `reference${n === 1 ? '' : 's'} could not be checked against the store; apply ` +
                '0043 or pass --glossary <file>.',
        );
    }
    console.log(
        `  refs     : ${referenceCounts.store} from the course glossary · ` +
            `${referenceCounts.local} local · ${referenceCounts.none} unresolved`,
    );
    const divergent = shadows.filter((sh) => !sh.identical);
    const identical = shadows.filter((sh) => sh.identical);
    console.log(
        `  shadows  : ${divergent.length} divergent · ${identical.length} identical ` +
            '(an activity\'s own definition wins over the glossary entry it matches)',
    );
    for (const sh of divergent) {
        console.log(`    DIVERGENT  ${sh.file}: “${sh.term}” differs from ${sh.id} — override, or drift?`);
    }
    if (args.dryRun) {
        for (const sh of identical) {
            console.log(`    identical  ${sh.file}: “${sh.term}” = ${sh.id} — the local copy can go`);
        }
    }

    // ---- the x_ receipt -----------------------------------------------------
    // The reserved namespace is unvalidated BY DESIGN — it carries the
    // curriculum builder's own item-level data, which this platform stores
    // nothing of. That makes this line the namespace's only sensor: a typo'd
    // `x_reivew_skills` is skipped as silently as a correct one, and would
    // otherwise disable the rules that read it with nothing to show for it.
    const reservedCounts = new Map();
    for (const entry of perFileCatalogue) {
        for (const name of entry.reservedKeys ?? []) {
            reservedCounts.set(name, (reservedCounts.get(name) ?? 0) + 1);
        }
    }
    if (reservedCounts.size > 0) {
        console.log('\nreserved x_ keys (ignored by this importer, by design):');
        for (const [name, count] of [...reservedCounts].sort()) {
            console.log(`  ${name} — ${count} file${count === 1 ? '' : 's'}`);
        }
    }

    if (catalogueWarnings.length) {
        console.log(
            `\ncatalogue warnings${args.strict ? ' (--strict: these FAIL the run)' : ''}:`,
        );
        for (const w of catalogueWarnings) console.log(`  ${w}`);
    }

    if (glossaryWarnings.length) {
        console.log(
            `\nglossary warnings${args.strict ? ' (--strict: these FAIL the run)' : ''}:`,
        );
        for (const w of glossaryWarnings) console.log(`  ${w}`);
    }

    if (bindingWarnings.length) {
        console.log(
            `\nbinding warnings${args.strict ? ' (--strict: these FAIL the run)' : ''}:`,
        );
        for (const warning of bindingWarnings) console.log(`  ${warning}`);
    }
    if (args.strict && suspectCount > 0) {
        console.log(
            `\n  …plus ${suspectCount} suspect-id warning${
                suspectCount === 1 ? '' : 's'
            } listed above. --strict fails the run for those too.`,
        );
    }

    if (orphans.length) {
        // D2: reported, never acted on.
        console.log('\norphans — in the database, claimed by no file:');
        for (const row of orphans) {
            console.log(
                `  ${row.source_path ?? '(no path)'}  →  ${row.id}  “${row.title}”` +
                    (row.source_key ? `  [key ${row.source_key}]` : '  [no key]'),
            );
        }
        console.log(
            '  Nothing was changed. A KEYED row here means no file declares that key any\n' +
                '  more — deleted, or its key was edited (which retires it). An UNKEYED row\n' +
                '  here means its file moved: add its key and re-run BEFORE moving it, or\n' +
                '  the move has already cost the row its history.',
        );
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
        // "nothing was written" now needs its qualifier: the manifest IS
        // written on a dry run, deliberately — refreshing it is the cheapest
        // way to review a binding change, and requiring a real import to see
        // one would make the artifact go stale exactly when it matters.
        console.log(
            `\nDRY RUN — nothing was written to the database (${shown(MANIFEST_PATH)}\nwas refreshed).\n`,
        );
        // A refusal is an outcome that needs the author's attention, exactly like
        // a skip — a dry run that reported refusals must not exit clean. Under
        // --strict a binding warning joins them; without it, nothing changes.
        process.exit(
            skipped.length > 0 ||
                drifted.length > 0 ||
                conflicts.length > 0 ||
                (args.strict &&
                    (bindingProblems > 0 ||
                        catalogueWarnings.length > 0 ||
                        glossaryWarnings.length > 0 ||
                        glossaryMirrorFailed !== null))
                ? 1
                : 0,
        );
    }

    // ---- write --------------------------------------------------------------
    // The mass-retire guard (W-5, EN-12) runs FIRST: a refused run writes
    // nothing at all — not the registry mirror, not one activity.
    if (massRetire && !args.allowMassRetire) {
        console.error(
            `\nREFUSED — this run would retire ${glossaryPlan.retired.length} of ` +
                `${glossaryPlan.active_before} active glossary entries. Nothing was written.\n\n` +
                `  ${glossaryPlan.retired.join('\n  ')}\n\n` +
                '  A glossary file that lost most of its entries is far more often the wrong\n' +
                '  file than an intended cull. If it is intended, re-run with\n' +
                '  --allow-mass-retire. (Retired entries are never deleted, and a returning\n' +
                '  id un-retires.)\n',
        );
        process.exit(1);
    }

    // Registry mirror first (0042 EH-7): the ids the run just validated
    // bindings against are upserted into misconception_registry, so the
    // grading-assist submit RPC validates against the same id set this
    // importer does. FAIL-SOFT on a missing table — a live database that
    // predates migration 0042 must not kill a 150-file import over its
    // side artifact — but loudly, because a stale mirror silently rejects
    // every suggestion carrying a newer id.
    let registryMirrorFailed = false;
    if (registry) {
        try {
            const mirrored = await db.syncMisconceptionRegistry(
                registry.ids,
                registry.descriptions,
            );
            // The count comes from the server's ECHO, never from the input —
            // the first live run "mirrored" 36 ids into a crash, and only an
            // asserted-from-response number can't tell that story wrong.
            console.log(
                `registry  : ${Array.isArray(mirrored) ? mirrored.length : 0} misconception ids mirrored (${registry.descriptions.size} with descriptions)`,
            );
        } catch (err) {
            registryMirrorFailed = true;
            console.warn(
                `⚠ misconception_registry mirror FAILED (${err.message}).\n` +
                    '  If the table does not exist, migration 0042 has not been applied to\n' +
                    '  this database yet; the grading-assist submit RPC will refuse ids the\n' +
                    '  mirror does not hold. The import itself continues.',
            );
        }
    }

    // The glossary mirror (R8): one atomic RPC, before any activity write, and
    // only with --glossary. Fail-soft and LOUD like the registry mirror —
    // except under --strict, where a failed mirror fails the run (W-4). Over
    // the 1 MB cap the mirror is refused outright (EN-11); the activities still
    // import and their marks still resolve from the file.
    let glossaryMirrored = null;
    if (glossaryFile && glossaryMirrorFailed === null) {
        if (glossaryFile.overTotalCap) {
            console.warn(
                '⚠ glossary mirror REFUSED — the file is over the 1 MB cap (see glossary\n' +
                    '  warnings). The store was not changed. The import itself continues.',
            );
        } else {
            try {
                glossaryMirrored = await db.syncGlossary(owner.id, glossaryFile.entries, true);
                // Counts from the database's ECHO of what it applied, never from
                // the plan (the registry mirror's lesson, 2026-09-26).
                console.log(
                    `glossary  : mirrored — ${glossaryMirrored.new.length} new · ` +
                        `${glossaryMirrored.changed.length} changed · ` +
                        `${glossaryMirrored.retired.length} retired · ` +
                        `${glossaryMirrored.unretired.length} un-retired`,
                );
            } catch (err) {
                glossaryMirrorFailed = err.message;
            }
        }
    }
    if (glossaryMirrorFailed !== null) {
        console.warn(
            `⚠ glossary mirror FAILED (${glossaryMirrorFailed}).\n` +
                '  The store was not changed; every [[term]] still resolved against the file.\n' +
                '  The import itself continues.',
        );
    }

    // Updates first: they are the re-run case, they cannot collide on a slug,
    // and doing them before any insert means a failed create never leaves the
    // existing corpus half-refreshed.
    let updated = 0;
    let adopted = 0;
    let moved = 0;
    for (const { file, row, converted, adoptsKey, moved: didMove } of fullUpdates) {
        try {
            await db.update(row.id, updatePayload(file, converted));
            updated++;
            if (adoptsKey) adopted++;
            if (didMove) moved++;
        } catch (err) {
            skipped.push({ file, error: `update failed: ${err.message}` });
        }
    }
    // Path only (ruling (b)): identity, nothing else — not the draft, not the
    // fingerprint (the stored one still describes the stored draft), not
    // updated_at (a move is not an edit; the recency strip must not move).
    let pathOnlyWritten = 0;
    for (const { file, row, adoptsKey, moved: didMove } of pathOnly) {
        try {
            await db.update(row.id, {
                source_path: file.sourcePath,
                ...(file.key ? { source_key: file.key } : {}),
            });
            pathOnlyWritten++;
            if (adoptsKey) adopted++;
            if (didMove) moved++;
        } catch (err) {
            skipped.push({ file, error: `path update failed: ${err.message}` });
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
                        source_key: file.key ?? null,
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
                if (/source_path|source_key/.test(err.message)) break;
            }
        }
        if (!done) {
            skipped.push({ file, error: `create failed: ${lastError?.message ?? 'unknown'}` });
        }
    }

    console.log(
        `\ncreated ${created} · updated ${updated} · ` +
            `path only ${pathOnlyWritten} · unchanged ${unchanged.length} · ` +
            `refused ${drifted.length} · skipped ${skipped.length}` +
            (adopted > 0 ? ` · ${adopted} adopted a key` : '') +
            (moved > 0 ? ` · ${moved} followed a moved file` : '') +
            (bindingProblems > 0 ? ` · ${bindingProblems} binding warnings` : '') +
            (catalogueWarnings.length > 0
                ? ` · ${catalogueWarnings.length} catalogue warnings`
                : '') +
            (glossaryWarnings.length > 0
                ? ` · ${glossaryWarnings.length} glossary warnings`
                : ''),
    );
    if (skipped.length) {
        console.log('\nskipped:');
        for (const { file, error } of skipped) {
            console.log(`  ${file.sourcePath}  ${error}`);
        }
    }
    // Only when a draft was actually written: since D5a, path-only and
    // unchanged files write no draft, and "they are drafts" would then send the
    // author to republish activities that are already current.
    if (created + updated > 0) {
        console.log(
            '\nAll imported activities are DRAFTS. Publish from the app — the batch\n' +
                'script cannot publish (see the PUBLISHING note in this file).\n',
        );
    } else {
        console.log('\nNo drafts were written — published activities stay as published.\n');
    }

    // D3: skipped files are surfaced AND make the run non-clean. --strict adds
    // the binding warnings to that set; without it the exit code is exactly
    // what it has always been.
    process.exit(
        skipped.length > 0 ||
            conflicts.length > 0 ||
            (args.strict &&
                (bindingProblems > 0 ||
                    catalogueWarnings.length > 0 ||
                    glossaryWarnings.length > 0 ||
                    glossaryMirrorFailed !== null ||
                    registryMirrorFailed))
            ? 1
            : 0,
    );
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
