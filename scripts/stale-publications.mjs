// =============================================================================
// stale-publications.mjs — which PUBLISHED activities are serving old content?
// -----------------------------------------------------------------------------
// Plan + rulings: docs/design/table-block.md T4 (amended at build, 2026-08-21).
//
// WHAT IT ANSWERS. `pnpm import:batch` writes DRAFTS. An activity that was
// already published keeps serving its published snapshot until someone presses
// Publish again — so after a format upgrade (the table block being the first,
// and not the last) some published activities are showing content older than
// their own file. This names exactly which ones, so the author republishes a
// short list instead of auditing a 150-activity catalogue.
//
// WHY IT ONLY REPORTS, AND DOES NOT REPUBLISH. The plan called for a script
// that republishes through `publish_activity`. It cannot, and the reason is
// structural rather than a missing feature: `publish_activity` authorizes via
// `can_edit_activity`, which is `owner_id = auth.uid()`. This script runs on a
// service-role key, which bypasses RLS precisely BECAUSE it has no `auth.uid()`
// — so the RPC raises 'Not authorized to publish this activity' for a script,
// every time, by design.
//
// The alternative considered and rejected (author's call, 2026-08-21) was a
// SECURITY DEFINER republish callable by the service key. That would create a
// SECOND writer of publish-truth, which is the exact thing 0037's header
// forbids ("One column, one meaning. Do not add a second writer") — a large
// architectural concession to save a handful of clicks. Reporting keeps the
// property that matters: a human decides what students see, and this script
// only tells them where to look.
//
// WHAT "STALE" MEANS HERE. The published version's content and the current
// draft, compared by the SAME key-sorted fingerprint the importer uses for its
// drift guard (canonicalJson — jsonb does not preserve key order, so a naive
// compare would report every row stale). Block ids are re-minted on every
// import, so this deliberately compares SHAPE-AND-TEXT rather than raw
// equality: see contentSignature.
//
// ZERO RUNTIME DEPENDENCIES beyond node — PostgREST over plain fetch, the same
// reason batch-import.mjs talks HTTP directly.
// =============================================================================

import { pathToFileURL } from 'node:url';

import { canonicalJson } from './batch-import.mjs';

/**
 * The comparable signature of a document.
 *
 * NOT a plain fingerprint of the JSON. `tiptapToActivity` mints fresh UUIDs on
 * every import (CLAUDE.md: do not diff serialized ActivityDocuments), so the
 * draft written by today's run differs from the published snapshot in every id
 * even when nothing an author or student would notice has changed. Stripping
 * ids leaves what a reader actually sees — structure, text, answers — which is
 * the question being asked: "is the published page showing something OLDER than
 * the file?"
 */
export function contentSignature(document) {
    const strip = (value) => {
        if (Array.isArray(value)) return value.map(strip);
        if (value !== null && typeof value === 'object') {
            const out = {};
            for (const [key, inner] of Object.entries(value)) {
                // `id` on blocks/rows/cells is re-minted per import and carries
                // no meaning to a reader. A BLANK's id is NOT stripped: it is
                // the response key, it is stable across imports by design, and
                // a change there is a real change.
                if (key === 'id' && value.type !== 'blank') continue;
                out[key] = strip(inner);
            }
            return out;
        }
        return value;
    };
    return canonicalJson(strip(document));
}

/**
 * Fixed-size batches.
 *
 * `id=in.(…)` goes in the URL, and a 150-activity catalogue is ~5.5 KB of uuids
 * — close enough to the usual 8 KB request-line ceiling that "it works today"
 * is not a plan. Batching is three lines and the worry goes away.
 */
export function chunk(items, size) {
    const out = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
}

/**
 * Split the owner's rows into stale / current / unpublished.
 *
 * ⚠ A NULL DRAFT ON A PUBLISHED ACTIVITY MEANS "NOTHING PENDING", NOT "STALE".
 * `publish_activity` ends with `draft_content = null` (0037), so a fully
 * published activity HAS no draft — that is the resting state, not a defect.
 * Treating absent-draft as "differs from published" (which a naive signature
 * compare does, since null signs as "null") would flag every fully published
 * activity in the catalogue as needing republishing, every run. That is not a
 * near-miss: it is the difference between a report worth reading and one that
 * says "republish everything" and gets ignored.
 *
 * Found by checking the logic against the live corpus rather than against the
 * hand-built fixtures below — which had a published row with no SNAPSHOT, and
 * not the far commoner published row with no DRAFT.
 *
 * So the real signal is simply: a published activity has pending changes when it
 * HAS a draft again. The signature compare then removes the false positive where
 * an editor session autosaved a draft identical to what is already published.
 */
export function planRepublish(rows) {
    const stale = [];
    const current = [];
    const unpublished = [];

    for (const row of rows) {
        // Only file-backed activities: a hand-authored one is nobody's upgrade
        // to chase, exactly as the importer ignores it in both directions.
        if (!row.source_path) continue;
        if (row.status !== 'published' || !row.published_content) {
            unpublished.push(row);
            continue;
        }
        // No draft = nothing pending = what a freshly published activity looks
        // like. See the header.
        if (row.draft_content === null || row.draft_content === undefined) {
            current.push(row);
            continue;
        }
        const published = contentSignature(row.published_content);
        const draft = contentSignature(row.draft_content);
        if (published === draft) current.push(row);
        else stale.push(row);
    }
    return { stale, current, unpublished };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function usage(message) {
    console.error(`
${message}

  pnpm report:stale --owner <email|uuid>

  --owner      whose activities to check. Required — the same value you pass
               to import:batch

  Reports which PUBLISHED activities are serving content older than their own
  draft, so you know exactly which ones to republish in the app after an
  import. Writes nothing, ever.

  Credentials come from .env.supabase (cp .env.supabase.example .env.supabase).
`);
    process.exit(2);
}

async function main() {
    const argv = process.argv.slice(2);
    let owner = process.env.BATCH_IMPORT_OWNER ?? null;
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--') continue;
        if (arg === '--owner') owner = argv[++i] ?? null;
        else if (arg.startsWith('--owner=')) owner = arg.slice('--owner='.length);
        else if (arg.startsWith('--')) usage(`unknown flag ${arg}`);
    }
    if (!owner) usage('Missing --owner.');

    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    if (!url || !key) {
        usage('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (see .env.supabase.example).');
    }

    const call = async (path) => {
        const res = await fetch(`${url}/rest/v1${path}`, {
            headers: {
                apikey: key,
                ...(key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }),
                Accept: 'application/json',
            },
        });
        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        return res.json();
    };

    const filter = /^[0-9a-f-]{36}$/i.test(owner)
        ? `id=eq.${owner}`
        : `email=eq.${encodeURIComponent(owner)}`;
    const users = await call(`/users?${filter}&select=id,email&limit=2`);
    if (users.length === 0) throw new Error(`no user matches --owner ${owner}`);
    if (users.length > 1) throw new Error(`--owner ${owner} matched more than one user`);
    const user = users[0];

    const rows = await call(
        `/activities?owner_id=eq.${user.id}&deleted_at=is.null` +
            '&select=id,slug,title,status,source_path,draft_content,current_version_id',
    );

    // TWO PLAIN QUERIES, NOT A POSTGREST EMBED. The embed form
    // (`published:activity_versions!<constraint>(content)`) needs a DISAMBIGUATING
    // HINT, because there are two foreign keys between these tables
    // (activities.current_version_id -> versions, and versions.activity_id ->
    // activities). That hint is a constraint NAME living in a migration —
    // `activities_current_version_fk`, which is not the name PostgREST's default
    // convention would suggest, and not the one this script guessed first. A
    // wrong hint fails at RUNTIME with a 400 that no test here can see, because
    // these tests are pure functions over hand-built rows and never touch a
    // server. Fetching the versions by id removes the whole class: no hint, no
    // relationship cache, nothing that breaks when a constraint is renamed.
    const versionIds = rows
        .map((row) => row.current_version_id)
        .filter((id) => typeof id === 'string');
    const contentById = new Map();
    for (const batch of chunk(versionIds, 50)) {
        const versions = await call(
            `/activity_versions?id=in.(${batch.join(',')})&select=id,content`,
        );
        for (const version of versions) contentById.set(version.id, version.content);
    }

    const shaped = rows.map((row) => ({
        ...row,
        published_content: contentById.get(row.current_version_id) ?? null,
    }));

    const { stale, current, unpublished } = planRepublish(shaped);

    console.log(`\nowner     : ${user.email}`);
    console.log(
        `file-backed: ${stale.length + current.length + unpublished.length} · ` +
            `${stale.length} stale · ${current.length} up to date · ` +
            `${unpublished.length} never published\n`,
    );

    if (stale.length === 0) {
        console.log('Nothing to republish — every published activity matches its draft.\n');
        return;
    }

    const origin = process.env.APP_ORIGIN ?? '';
    console.log('REPUBLISH THESE IN THE APP (their published page is older than their file):');
    for (const row of stale) {
        console.log(`  ${row.source_path}  →  “${row.title}”`);
        if (origin) console.log(`      ${origin}/activities/${row.id}`);
    }
    console.log(
        '\nThis script never publishes: publish_activity authorizes on auth.uid(),\n' +
            'which a service-role key does not have. See the header for why that is\n' +
            'the right shape rather than a limitation to work around.\n',
    );
}

// pathToFileURL, NOT `file://${argv[1]}` — this repo's checkout path contains a
// space, so the naive form compares an unencoded path against an encoded URL,
// never matches, and the script exits 0 having printed NOTHING. That is worse
// than a crash here: a report that silently prints nothing reads exactly like
// "nothing to republish". Caught the first time it ran (2026-08-21);
// batch-import.mjs had it right and this copied the wrong idiom. §H spawns the
// script to prove main() actually fires.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((err) => {
        console.error(`\n${err.message}\n`);
        process.exit(1);
    });
}
