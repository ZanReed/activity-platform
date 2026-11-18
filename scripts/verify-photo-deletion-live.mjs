#!/usr/bin/env node
/**
 * verify-photo-deletion-live.mjs — the LIVE deletion proof for students'
 * photos (docs/design/media-submissions.md slice 5; P3 liveness at production
 * values).
 *
 * verify-student-work-e2e.mjs proves every removal path on the LOCAL stack,
 * where it can mint student JWTs. Live it cannot, so this script asks only the
 * question the design says must be answered against live before
 * `photo_clearance` goes on: when a photo's row goes, do its BYTES leave the
 * real Storage, through the DEPLOYED sweep-work-photos function?
 *
 *   L1 the retention clock      keep_until passed → the sweep removes row + bytes
 *   L2 the account cascade      deleting the student queues the bytes
 *   L3 the version cascade      deleting a version queues the bytes
 *   L4 the activity cascade     deleting the activity queues the bytes
 *   L5 the orphan backstop      an object with no row is removed
 * plus: a dry run removes nothing (L0), the function refuses the service key
 * without its token and a near-miss token (L6), and, live only, the ARMED
 * jobs would really reach this function (A0: the URL, the exact real-run
 * body, the x-sweep-token header, and Vault values equal to the token and the
 * key, compared by sha256).
 * "Removed" means both the storage.objects row is gone AND Storage itself
 * refuses to serve the blob (a service-role GET answers 400/404).
 *
 *   node --env-file=.env.supabase scripts/verify-photo-deletion-live.mjs --target live
 *   node scripts/verify-photo-deletion-live.mjs --target local    # rehearsal
 *
 * live needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL (the
 * pooler DSN) and SWEEP_WORK_PHOTOS_TOKEN in .env.supabase. Nothing is
 * printed from them.
 *
 * ⚠ The sweep acts on EVERY due row, queued key and orphan, not only this
 * run's. So the script REFUSES to run when any photo row or student-work
 * object exists that is not its own, or when photo_clearance is on. It is a
 * one-time proof for before the first student photo; re-running it later
 * needs a scoped design, not a flag.
 *
 * P7, residue: fixtures carry a run tag; cleanup deletes them, runs the sweep,
 * and asserts nothing tagged is left (objects, photo rows, queued keys,
 * users, activities, classes). Photos are written as the service role
 * (Storage policies are not what is being proven here: verify-0093 and the
 * local e2e prove those). Zero dependencies: node:crypto + psql.
 */
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const argTarget = process.argv.includes('--target') ? process.argv[process.argv.indexOf('--target') + 1] : null;
if (argTarget !== 'live' && argTarget !== 'local') {
  console.error('Usage: node --env-file=.env.supabase scripts/verify-photo-deletion-live.mjs --target live|local');
  process.exit(2);
}
const LIVE = argTarget === 'live';
const API = LIVE ? process.env.SUPABASE_URL : (process.env.SUPABASE_URL_LOCAL ?? 'http://127.0.0.1:54321');
const DB = LIVE ? process.env.SUPABASE_DB_URL : (process.env.SUPABASE_DB_URL_LOCAL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres');
const SERVICE = LIVE
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : (process.env.SUPABASE_SERVICE_ROLE_KEY_LOCAL
    ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');
// The sweep's own secret (author ruling 2026-11-19): live from .env.supabase,
// local from the committed local-only file.
const LOCAL_TOKEN = readFileSync(new URL('../supabase/local-test-secrets', import.meta.url), 'utf8')
  .match(/^SWEEP_WORK_PHOTOS_TOKEN=(.+)$/m)?.[1] ?? '';
const SWEEP_TOKEN = LIVE ? (process.env.SWEEP_WORK_PHOTOS_TOKEN ?? '') : LOCAL_TOKEN;
if (!API || !DB || !SERVICE || SWEEP_TOKEN.length < 32) {
  console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL or SWEEP_WORK_PHOTOS_TOKEN (32+ characters; run with --env-file=.env.supabase).');
  process.exit(2);
}
if (LIVE && SWEEP_TOKEN === LOCAL_TOKEN) {
  console.error('REFUSED: the live sweep token is the committed LOCAL test value. Generate a real one (openssl rand -hex 32).');
  process.exit(2);
}
const FN = `${API.replace(/\/$/, '')}/functions/v1/sweep-work-photos`;
const BUCKET = 'student-work';

// The DSN goes to psql through the ENVIRONMENT, never argv: a failed
// execFileSync puts its whole command line (the pooler password included) in
// the error text (Fable review). And a failure rethrows psql's stderr only.
const dsn = new URL(DB);
const PGENV = {
  ...process.env,
  PGHOST: dsn.hostname, PGPORT: dsn.port || '5432', PGUSER: decodeURIComponent(dsn.username),
  PGPASSWORD: decodeURIComponent(dsn.password), PGDATABASE: dsn.pathname.replace(/^\//, '') || 'postgres',
  PGSSLMODE: dsn.searchParams.get('sslmode') ?? (LIVE ? 'require' : 'disable'),
};
const sql = (q) => {
  try {
    return execFileSync('psql', ['-XAtq', '-v', 'ON_ERROR_STOP=1', '-c', q], { encoding: 'utf8', env: PGENV, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    throw new Error(`psql failed: ${String(err?.stderr ?? '').trim().split('\n')[0]}`);
  }
};
const STORAGE = `${API.replace(/\/$/, '')}/storage/v1`;

let pass = 0;
let fail = 0;
const check = (name, ok, detail = '') => {
  if (ok) pass++; else fail++;
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail && !ok ? ` :: ${detail}` : ''}`);
};

async function upload(name) {
  const r = await fetch(`${STORAGE}/object/${BUCKET}/${name}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, 'Content-Type': 'image/jpeg' },
    body: JPEG,
  });
  return { status: r.status, body: await r.text() };
}
async function sweep(token, body, sweepToken = SWEEP_TOKEN) {
  const r = await fetch(FN, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(sweepToken ? { 'x-sweep-token': sweepToken } : {}) },
    body: JSON.stringify(body ?? {}),
  });
  return { status: r.status, body: await r.json().catch(() => null) };
}
/** The BLOB, not just its row: Storage itself must refuse to serve it. */
async function blobGone(name) {
  const r = await fetch(`${STORAGE}/object/authenticated/${BUCKET}/${name}`, {
    headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE },
  });
  await r.arrayBuffer().catch(() => null);
  return r.status === 400 || r.status === 404;
}
const gone = async (name) => !objectExists(name) && (await blobGone(name));
const objectExists = (name) =>
  sql(`select exists (select 1 from storage.objects where bucket_id = '${BUCKET}' and name = '${name}')`) === 't';
const rowExists = (id) => sql(`select exists (select 1 from work_photos where id = '${id}')`) === 't';

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 0xff, 0xd9]);

const tag = `live-del-${Date.now()}`;
const T = randomUUID(), S = randomUUID(), S2 = randomUUID();
const PB = randomUUID();
let ACT, VER, VER2, CLS;

/** A photo row for the student on a version, with its bytes uploaded. */
async function photo(student, version, label) {
  const id = randomUUID();
  sql(`insert into work_photos (id, student_id, activity_id, activity_version_id, block_id, keep_until)
       values ('${id}', '${student}', '${ACT}', '${version}', '${PB}', now() + interval '7 days')`);
  const name = sql(`select object_name from work_photos where id = '${id}'`);
  const up = await upload(name);
  // Positive control: Storage SERVES it now, so blobGone() below can fail.
  check(`${label} setup: the photo's bytes are in Storage and served`,
    up.status === 200 && objectExists(name) && !(await blobGone(name)), `${up.status} ${up.body}`);
  return { id, name };
}

async function main() {
  // ---- preflight: nothing but this run may be touched by the sweep ------------
  const clearance = sql('select coalesce((select cleared from photo_clearance), false)');
  const foreign = sql(`select (select count(*) from work_photos) + (select count(*) from work_photo_deletions)
                            + (select count(*) from storage.objects where bucket_id = '${BUCKET}')`);
  if (clearance === 't' || foreign !== '0') {
    console.error(`REFUSED: photo_clearance=${clearance}, existing photo rows/queued keys/objects=${foreign}. ` +
      'The sweep acts on everything, so this proof runs only before the first student photo.');
    process.exit(2);
  }
  const utc = new Date();
  const mins = utc.getUTCHours() * 60 + utc.getUTCMinutes();
  if (mins >= 4 * 60 && mins <= 4 * 60 + 25) {
    console.error('REFUSED: 04:00-04:25 UTC is the armed sweep\'s own window; run outside it.');
    process.exit(2);
  }
  const probe = await sweep(SERVICE, {});
  if (probe.status !== 200 || probe.body?.dryRun !== true) {
    console.error(`sweep-work-photos is not answering at ${FN} (HTTP ${probe.status}${probe.status === 500 ? ': its SWEEP_WORK_PHOTOS_TOKEN is not set' : probe.status === 403 ? ': the token differs from the function secret' : ''}).`);
    process.exit(2);
  }
  console.log(`target ${argTarget}; run tag ${tag}`);

  // ---- A0 (live) the ARMED jobs would really reach this function ----------------
  // The schedule pin (verify-0093) checks names, hours and words; only here can
  // the script compare what the job will SEND with what the function expects:
  // this project's URL, the exact real-run body, and a Vault secret that IS the
  // service key (compared by sha256, so neither value is printed or sent).
  if (LIVE) {
    const job = sql(`select coalesce((select command from cron.job where jobname = 'sweep-work-photos' and active), '')`);
    const rows = sql(`select count(*) from cron.job where jobname = 'sweep-work-photo-rows' and active and schedule = '10 4 * * *'`);
    const hashOf = (name) => sql(`select coalesce((select encode(sha256(convert_to(decrypted_secret, 'UTF8')), 'hex')
                                              from vault.decrypted_secrets where name = '${name}'), '')`);
    const sha = (v) => createHash('sha256').update(v).digest('hex');
    check('A0 the sweep is armed: both jobs active, the bytes job posts {"dryRun": false} to THIS project\'s function',
      rows === '1' && job.includes(FN) && job.includes('"dryRun": false') && !job.includes('<')
        && job.includes("'x-sweep-token'") && job.includes('sweep_work_photos_token'),
      'arm the sweep first (supabase/migrations/README.md, 0093)');
    const tokenHash = hashOf('sweep_work_photos_token');
    check('A0 the Vault token the job sends is the function\'s own token', tokenHash !== '' && tokenHash === sha(SWEEP_TOKEN));
    const gateHash = hashOf('sweep_work_photos_key');
    check('A0 the Vault key the job sends to the platform gate is this project\'s service-role key', gateHash !== '' && gateHash === sha(SERVICE));
  }

  // ---- fixtures ---------------------------------------------------------------
  sql(`insert into auth.users (id, email, raw_user_meta_data) values
        ('${T}', '${tag}-t@e2e.example', '{}'), ('${S}', '${tag}-s@e2e.example', '{}'),
        ('${S2}', '${tag}-s2@e2e.example', '{}');
       update users set role = 'teacher' where id = '${T}';
       update users set role = 'student' where id in ('${S}', '${S2}');`);
  const content = JSON.stringify({ meta: { title: tag }, sections: [{ id: 's1', rows: [{ columns: [{ blocks: [
    { id: PB, type: 'photo_response', maxPhotos: 3, prompt: [] }] }] }] }] });
  ACT = sql(`insert into activities (owner_id, title, slug, status) values ('${T}', '${tag}', '${tag}', 'published') returning id`);
  VER = sql(`insert into activity_versions (activity_id, version_num, content, created_by) values ('${ACT}', 1, '${content}', '${T}') returning id`);
  VER2 = sql(`insert into activity_versions (activity_id, version_num, content, created_by) values ('${ACT}', 2, '${content}', '${T}') returning id`);
  sql(`update activities set current_version_id = '${VER}' where id = '${ACT}'`);
  CLS = sql(`insert into classes (teacher_id, name, age_assertion_by, assertion_text_version) values ('${T}', '${tag}', '${T}', 'e2e') returning id`);
  sql(`insert into class_members (class_id, student_id) values ('${CLS}', '${S}'), ('${CLS}', '${S2}')`);

  // ---- L6 the function's OWN check, past the platform gate ------------------
  // The service-role key passes the gate, so a 403 here is the function
  // refusing: with no token, and with a token one character off.
  const keyOnly = await sweep(SERVICE, { dryRun: false }, null);
  check('L6 the service-role key alone is refused by the function (403)', keyOnly.status === 403, `${keyOnly.status}`);
  const offByOne = await sweep(SERVICE, { dryRun: false }, `${SWEEP_TOKEN.slice(0, -1)}${SWEEP_TOKEN.endsWith('x') ? 'y' : 'x'}`);
  check('L6 a token one character off is refused (403)', offByOne.status === 403, `${offByOne.status}`);

  // ---- L0 + L1 the retention clock ---------------------------------------------
  const p1 = await photo(S, VER, 'L1');
  sql(`update work_photos set keep_until = now() - interval '1 minute' where id = '${p1.id}'`);
  const dry = await sweep(SERVICE, {});
  check('L0 a dry run reports the due photo and removes nothing',
    dry.status === 200 && dry.body?.dryRun === true && objectExists(p1.name) && rowExists(p1.id), JSON.stringify(dry.body));
  const real = await sweep(SERVICE, { dryRun: false });
  check('L1 the real run removes the row AND the bytes',
    real.status === 200 && (await gone(p1.name)) && !rowExists(p1.id)
      && sql(`select count(*) from work_photo_deletions where object_name = '${p1.name}'`) === '0',
    JSON.stringify(real.body));

  // ---- L2 the account cascade --------------------------------------------------
  const p2 = await photo(S2, VER, 'L2');
  sql(`delete from auth.users where id = '${S2}'`);
  await sweep(SERVICE, { dryRun: false });
  check('L2 deleting the student\'s account removed the bytes', (await gone(p2.name)) && !rowExists(p2.id));

  // ---- L3 the version cascade (the activity purge deletes versions first) -------
  const p3 = await photo(S, VER2, 'L3');
  sql(`delete from activity_versions where id = '${VER2}'`);
  await sweep(SERVICE, { dryRun: false });
  check('L3 deleting the version removed the bytes', (await gone(p3.name)) && !rowExists(p3.id));

  // ---- L5 the orphan backstop ---------------------------------------------------
  const name5 = `${ACT}/${S}/${randomUUID()}.jpg`;
  const up5 = await upload(name5);
  sql(`update storage.objects set created_at = now() - interval '2 hours' where bucket_id = '${BUCKET}' and name = '${name5}'`);
  check('L5 setup: an object with no row', up5.status === 200 && objectExists(name5), `${up5.status} ${up5.body}`);
  await sweep(SERVICE, { dryRun: false });
  check('L5 the sweep removed the orphan', await gone(name5));

  // ---- L4 the activity cascade, as purge_soft_deleted runs it -----------------
  const p4 = await photo(S, VER, 'L4');
  sql(`update activities set current_version_id = null where id = '${ACT}';
       delete from activity_versions where activity_id = '${ACT}';
       delete from activities where id = '${ACT}';`);
  await sweep(SERVICE, { dryRun: false });
  check('L4 deleting the activity removed the bytes', (await gone(p4.name)) && !rowExists(p4.id));
}

async function cleanup() {
  try {
    if (ACT) {
      sql(`delete from section_checks where activity_id = '${ACT}';
           update activities set current_version_id = null where id = '${ACT}';
           delete from activity_versions where activity_id = '${ACT}';
           delete from activities where id = '${ACT}';`);
    }
    sql(`delete from classes where name = '${tag}'`);
    sql(`delete from auth.users where email like '${tag}-%'`);
    if (ACT) await sweep(SERVICE, { dryRun: false });
    // Anything still stored under this run's activity (a run that died before
    // L5's backdate leaves a fresh orphan the sweep skips): delete it through
    // the Storage API directly, so a failed run never strands an object that
    // makes the preflight refuse every later run.
    if (ACT) {
      const left = sql(`select coalesce(json_agg(name), '[]') from storage.objects where bucket_id = '${BUCKET}' and name like '${ACT}/%'`);
      const names = JSON.parse(left);
      if (names.length) {
        await fetch(`${STORAGE}/object/${BUCKET}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefixes: names }),
        });
        console.log(`  note  cleanup removed ${names.length} leftover object(s) directly`);
        await sweep(SERVICE, { dryRun: false }); // now the queued keys can drain
      }
    }
    // The signup trigger's audit rows (0024 nulls actor_id on delete, so they
    // would outlive the run): this run's users are its only targets.
    sql(`delete from audit_log where target_type = 'user' and target_id in ('${T}', '${S}', '${S2}')`);
    const left = sql(`select (select count(*) from storage.objects where bucket_id = '${BUCKET}' and name like '${ACT ?? 'none'}/%')
                          + (select count(*) from work_photos where activity_id::text = '${ACT ?? ''}')
                          + (select count(*) from work_photo_deletions where object_name like '${ACT ?? 'none'}/%')
                          + (select count(*) from users where email like '${tag}-%')
                          + (select count(*) from activities where slug = '${tag}')
                          + (select count(*) from classes where name = '${tag}')
                          + (select count(*) from audit_log where target_id in ('${T}', '${S}', '${S2}'))`);
    check('R1 no residue: no object, photo row, queued key, user, activity, class or audit row left from this run', left === '0', `left=${left}`);
  } catch (err) {
    fail++;
    console.log(`  FAIL  cleanup :: ${err?.message ?? err}`);
  }
}

try {
  await main();
} catch (err) {
  fail++;
  console.log(`  FAIL  unexpected error :: ${err?.stack ?? err}`);
} finally {
  await cleanup();
  console.log(`=== verify-photo-deletion-live (${argTarget}): ${pass} PASS, ${fail} FAIL ===`);
  process.exit(fail ? 1 : 0);
}
