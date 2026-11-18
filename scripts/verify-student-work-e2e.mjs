#!/usr/bin/env node
/**
 * verify-student-work-e2e.mjs — the Storage-API half of 0093's proof
 * (docs/design/media-submissions.md slice 1, P3 liveness).
 *
 * verify-0093.sql proves the RLS predicates by direct INSERT/SELECT on
 * storage.objects, which bypasses the Storage API. This script goes through
 * the real API and the real sweep-work-photos function, and asks the one
 * question SQL cannot answer: when a photo's row goes, do its BYTES leave?
 * It runs every removal path the design names (§10 slice 1):
 *   P1 the retention clock (keep_until passed → sweep removes row + bytes)
 *   P2 the account purge cascade      P3 the activity-version cascade
 *   P4 an orphan object with no row (the backstop)
 * plus the API-layer gates: bucket mime/size limits, upsert refused, the
 * reservation gate, teacher read only after attach, and the function's
 * service-role-only rule.
 *
 *   supabase start
 *   supabase functions serve sweep-work-photos     # in another terminal
 *   node scripts/verify-student-work-e2e.mjs --target local
 *
 * LOCAL ONLY: it mints test JWTs with the local stack's well-known JWT secret
 * and writes fixtures with psql. The live proof is an author action after the
 * deploy (supabase/migrations/README.md → 0093).
 *
 * P7, residue: every fixture row is created under a run tag and removed at
 * the end — the fixture users and activity are deleted (which queues their
 * bytes) and a real sweep runs, then the script asserts nothing tagged is
 * left in storage.objects, work_photos or work_photo_deletions. It flips
 * photo_clearance ON for the run and always restores the value it found.
 * Zero dependencies (repo rule): node:crypto + psql.
 */
import { createHmac, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';

if (!process.argv.includes('--target') || process.argv[process.argv.indexOf('--target') + 1] !== 'local') {
  console.error('Usage: node scripts/verify-student-work-e2e.mjs --target local   (local only; see header)');
  process.exit(2);
}

const API = process.env.SUPABASE_URL_LOCAL ?? 'http://127.0.0.1:54321';
const DB = process.env.SUPABASE_DB_URL_LOCAL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const SECRET = process.env.SUPABASE_JWT_SECRET_LOCAL ?? 'super-secret-jwt-token-with-at-least-32-characters-long';
const FN = `${API}/functions/v1/sweep-work-photos`;
const BUCKET = 'student-work';

const b64url = (b) => Buffer.from(b).toString('base64url');
function jwt(sub, role) {
  const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(JSON.stringify({ sub, role, aud: 'authenticated', iat: now, exp: now + 3600 }));
  const sig = createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}
const ANON = jwt(undefined, 'anon');
// The function compares the bearer to ITS OWN service-role key, so the test
// must send that exact key (the local stack's well-known demo key), not a
// token minted here. FORGED is a correctly-signed service_role JWT that is
// not the key: G16 proves it is refused (the Fable-review fix).
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY_LOCAL
  ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const FORGED = jwt(undefined, 'service_role');

const sql = (q) => execFileSync('psql', [DB, '-XAtq', '-v', 'ON_ERROR_STOP=1', '-c', q], { encoding: 'utf8' }).trim();

let pass = 0;
let fail = 0;
const check = (name, ok, detail = '') => {
  if (ok) pass++; else fail++;
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail && !ok ? ` :: ${detail}` : ''}`);
};

const H = (token, extra = {}) => ({ Authorization: `Bearer ${token}`, apikey: ANON, ...extra });
async function rpc(token, name, args) {
  const r = await fetch(`${API}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: H(token, { 'Content-Type': 'application/json' }), body: JSON.stringify(args),
  });
  return { status: r.status, body: await r.json().catch(() => null) };
}
async function upload(token, name, bytes, type = 'image/jpeg', extra = {}) {
  const r = await fetch(`${API}/storage/v1/object/${BUCKET}/${name}`, {
    method: 'POST', headers: H(token, { 'Content-Type': type, ...extra }), body: bytes,
  });
  return { status: r.status, body: await r.text() };
}
async function read(token, name) {
  const r = await fetch(`${API}/storage/v1/object/authenticated/${BUCKET}/${name}`, { headers: H(token) });
  await r.arrayBuffer().catch(() => null);
  return r.status;
}
async function sweep(token, body) {
  const r = await fetch(FN, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  return { status: r.status, body: await r.json().catch(() => null) };
}
const objectExists = (name) => sql(`select exists (select 1 from storage.objects where bucket_id = '${BUCKET}' and name = '${name}')`) === 't';

// A tiny valid JPEG header; Storage checks the declared type, not the bytes.
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 0xff, 0xd9]);

const tag = `e2e-sw-${Date.now()}`;
const T = randomUUID(), T2 = randomUUID(), S = randomUUID(), S2 = randomUUID();
const PB = randomUUID();
let ACT, VER, VER2, CLS;
const clearanceBefore = sql('select coalesce((select cleared from photo_clearance), false)');

async function main() {
  // ---- preflight: the function is being served --------------------------------
  const probe = await fetch(FN, { method: 'POST', headers: { Authorization: `Bearer ${SERVICE}` }, body: '{}' }).catch(() => null);
  if (!probe || probe.status === 404) {
    console.error(`sweep-work-photos is not reachable at ${FN} — run \`supabase functions serve sweep-work-photos\` first.`);
    process.exit(2);
  }

  // ---- fixtures ---------------------------------------------------------------
  sql(`insert into auth.users (id, email, raw_user_meta_data) values
        ('${T}', '${tag}-t@e2e.example', '{}'), ('${T2}', '${tag}-t2@e2e.example', '{}'),
        ('${S}', '${tag}-s@e2e.example', '{}'), ('${S2}', '${tag}-s2@e2e.example', '{}');
       update users set role = 'teacher' where id in ('${T}', '${T2}');
       update users set role = 'student' where id in ('${S}', '${S2}');`);
  const content = JSON.stringify({ sections: [{ id: 's1', rows: [{ columns: [{ blocks: [
    { id: PB, type: 'photo_response', maxPhotos: 3, prompt: [] }] }] }] }] });
  ACT = sql(`insert into activities (owner_id, title, slug, status) values ('${T}', '${tag}', '${tag}', 'published') returning id`);
  VER = sql(`insert into activity_versions (activity_id, version_num, content, created_by) values ('${ACT}', 1, '${content}', '${T}') returning id`);
  VER2 = sql(`insert into activity_versions (activity_id, version_num, content, created_by) values ('${ACT}', 2, '${content}', '${T}') returning id`);
  sql(`update activities set current_version_id = '${VER}' where id = '${ACT}'`);
  CLS = sql(`insert into classes (teacher_id, name, age_assertion_by, assertion_text_version) values ('${T}', '${tag}', '${T}', 'e2e') returning id`);
  sql(`insert into class_activities (class_id, activity_id, added_by) values ('${CLS}', '${ACT}', '${T}');
       insert into class_members (class_id, student_id) values ('${CLS}', '${S}'), ('${CLS}', '${S2}');
       update photo_clearance set cleared = true;`);
  const sJ = jwt(S, 'authenticated'), s2J = jwt(S2, 'authenticated');
  const tJ = jwt(T, 'authenticated'), t2J = jwt(T2, 'authenticated');

  console.log(`verify-student-work-e2e (local) — run ${tag}`);

  // ---- the reservation and the API-layer gates ---------------------------------
  const r1 = await rpc(sJ, 'reserve_work_photo', { p_activity_id: ACT, p_version_id: VER, p_block_id: PB });
  check('G1 a class member reserves a photo', r1.status === 200 && typeof r1.body === 'string', JSON.stringify(r1));
  const id1 = r1.body;
  const name1 = `${ACT}/${S}/${id1}.jpg`;

  const tr = await rpc(tJ, 'reserve_work_photo', { p_activity_id: ACT, p_version_id: VER, p_block_id: PB });
  check('G2 a teacher cannot reserve', tr.status >= 400 && JSON.stringify(tr.body).includes('not_a_student'), JSON.stringify(tr));

  const up = await upload(sJ, name1, JPEG);
  check('G3 the student uploads into their reservation through the API', up.status === 200, `${up.status} ${up.body}`);

  const ups = await upload(sJ, name1, JPEG, 'image/jpeg', { 'x-upsert': 'true' });
  check('G4 an upsert over it is refused (no UPDATE policy)', ups.status >= 400, `${ups.status} ${ups.body}`);

  const r2 = await rpc(sJ, 'reserve_work_photo', { p_activity_id: ACT, p_version_id: VER, p_block_id: PB });
  const name2 = `${ACT}/${S}/${r2.body}.jpg`;
  const png = await upload(sJ, name2, JPEG, 'image/png');
  check('G5 a non-JPEG type is refused by the bucket', png.status >= 400, `${png.status} ${png.body}`);
  const big = await upload(sJ, name2, new Uint8Array(1572864 + 1));
  check('G6 a file over 1.5 MB is refused by the bucket', big.status >= 400, `${big.status} ${big.body}`);

  const stray = await upload(sJ, `${ACT}/${S}/${randomUUID()}.jpg`, JPEG);
  check('G7 an unreserved key is refused', stray.status >= 400, `${stray.status} ${stray.body}`);
  const other = await upload(s2J, name2, JPEG);
  check('G8 another student cannot upload into the reservation', other.status >= 400, `${other.status} ${other.body}`);

  check('G9 the student reads their own photo', (await read(sJ, name1)) === 200);
  check('G10 the owning teacher cannot read it before a check attaches it', (await read(tJ, name1)) >= 400);
  // A hand-in as 0094's trigger makes it: attached, the object's version recorded.
  sql(`update work_photos w set attached_at = now(), attached_object_version = (select o.version from storage.objects o where o.bucket_id = '${BUCKET}' and o.name = w.object_name) where id = '${id1}'`);
  check('G11 the owning teacher reads it once attached', (await read(tJ, name1)) === 200);
  check('G12 another teacher never reads it', (await read(t2J, name1)) >= 400);
  check('G13 another student never reads it', (await read(s2J, name1)) >= 400);
  check('G14 no anonymous read', (await read(ANON, name1)) >= 400);

  const sweepAsStudent = await sweep(sJ, { dryRun: false });
  check('G15 the sweep refuses a student JWT', sweepAsStudent.status === 403, JSON.stringify(sweepAsStudent));
  const sweepForged = await sweep(FORGED, { dryRun: false });
  check('G16 the sweep refuses a validly-signed service_role JWT that is not the key', sweepForged.status === 403, JSON.stringify(sweepForged));

  // ---- G17 a signed upload URL, issued while the reservation is open --------
  // INFO, not a gate (Fable review finding 5): does Storage re-check the
  // INSERT policy when the signed URL is used? Printed so slice 2 builds on
  // the measured answer; slice 2's attach must not trust an object's mere
  // existence either way (record_check re-reads photo_clearance).
  const r6 = await rpc(sJ, 'reserve_work_photo', { p_activity_id: ACT, p_version_id: VER, p_block_id: PB });
  const name6 = `${ACT}/${S}/${r6.body}.jpg`;
  const sign = await fetch(`${API}/storage/v1/object/upload/sign/${BUCKET}/${name6}`, { method: 'POST', headers: H(sJ) });
  const signBody = await sign.json().catch(() => ({}));
  sql('update photo_clearance set cleared = false');
  let late = 'not attempted';
  if (sign.ok && signBody.url) {
    const lr = await fetch(`${API}/storage/v1${signBody.url}`, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: JPEG });
    late = `HTTP ${lr.status}`;
  }
  sql('update photo_clearance set cleared = true');
  console.log(`  INFO  G17 signed upload URL: sign=${sign.status}; upload after the switch went off: ${late}; object exists: ${objectExists(name6)}`);

  // ---- A: handing a photo in (0094, slice 2) ----------------------------------
  // record_check is called as the check-activity function calls it (service
  // role), against bytes that went through the real Storage API, so the
  // trigger's "the object exists" test meets Storage's own row, not a fixture.
  const checkWith = (photoIds) => rpc(SERVICE, 'record_check', {
    p_student_id: S, p_activity_id: ACT, p_activity_version_id: VER, p_section_id: 's1',
    p_responses: { photos: { [PB]: photoIds.map((id) => ({ id })) } }, p_verdicts: {},
  });
  const r7 = await rpc(sJ, 'reserve_work_photo', { p_activity_id: ACT, p_version_id: VER, p_block_id: PB });
  const name7 = `${ACT}/${S}/${r7.body}.jpg`;
  await upload(sJ, name7, JPEG);
  check('A0 the teacher cannot read an uploaded photo before a check hands it in', (await read(tJ, name7)) >= 400);
  const a1 = await checkWith([r7.body]);
  check('A1 a check hands in an uploaded photo: attached, and now the owning teacher can read it',
    a1.status === 200 && sql(`select attached_at is not null from work_photos where id = '${r7.body}'`) === 't'
      && (await read(tJ, name7)) === 200, JSON.stringify(a1));
  const r8 = await rpc(sJ, 'reserve_work_photo', { p_activity_id: ACT, p_version_id: VER, p_block_id: PB });
  const a2 = await checkWith([r8.body]);
  check('A2 a reserved photo whose bytes never arrived is refused', a2.status >= 400 && JSON.stringify(a2.body).includes('photo_not_uploaded'), JSON.stringify(a2));
  // G17's closure: the object that landed through a URL signed before the
  // switch went off exists — and while the switch is off, no check hands it in.
  sql('update photo_clearance set cleared = false');
  const a3 = await checkWith([r6.body]);
  sql('update photo_clearance set cleared = true');
  check('A3 while photos are off, a photo that landed through an earlier-signed URL is not handed in',
    objectExists(name6) && a3.status >= 400 && JSON.stringify(a3.body).includes('photos_off')
      && sql(`select attached_at is null from work_photos where id = '${r6.body}'`) === 't', JSON.stringify(a3));
  // G18 (Fable review 2026-11-18): a URL signed WITH upsert before the first
  // upload. The sign-time check runs INSERT … ON CONFLICT DO UPDATE against an
  // absent object, so only the INSERT policy is consulted. Can that URL later
  // replace the bytes of a photo a check has handed in?
  const r9 = await rpc(sJ, 'reserve_work_photo', { p_activity_id: ACT, p_version_id: VER, p_block_id: PB });
  const name9 = `${ACT}/${S}/${r9.body}.jpg`;
  const sign9 = await fetch(`${API}/storage/v1/object/upload/sign/${BUCKET}/${name9}`, { method: 'POST', headers: H(sJ, { 'x-upsert': 'true' }) });
  const sign9Body = await sign9.json().catch(() => ({}));
  await upload(sJ, name9, JPEG);
  await checkWith([r9.body]);
  const before9 = sql(`select coalesce(metadata->>'eTag', '') || ':' || coalesce(version, '') from storage.objects where bucket_id = '${BUCKET}' and name = '${name9}'`);
  let replaced = 'not attempted';
  if (sign9.ok && sign9Body.url) {
    const other = new Uint8Array([...JPEG.slice(0, -2), 0x00, 0xff, 0xd9]);
    const pr = await fetch(`${API}/storage/v1${sign9Body.url}`, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg', 'x-upsert': 'true' }, body: other });
    replaced = `HTTP ${pr.status}`;
  }
  const after9 = sql(`select coalesce(metadata->>'eTag', '') || ':' || coalesce(version, '') from storage.objects where bucket_id = '${BUCKET}' and name = '${name9}'`);
  // Measured: it CAN (Storage writes with its own role, past every policy).
  // What must hold instead is that replaced bytes never reach the teacher.
  console.log(`  INFO  G18 upsert-signed URL after hand-in: sign=${sign9.status}; replace: ${replaced}; bytes changed: ${before9 !== after9}`);
  check('G18 a photo replaced after hand-in is unreadable to the teacher (the student still reads it)',
    before9 !== after9 ? (await read(tJ, name9)) >= 400 && (await read(sJ, name9)) === 200 : (await read(tJ, name9)) === 200,
    `before ${before9} after ${after9}`);

  const a4 = await rpc(sJ, 'discard_work_photo', { p_id: r7.body });
  check('A4 a student cannot discard a photo a check handed in', a4.status === 200 && a4.body === false
    && sql(`select count(*) from work_photos where id = '${r7.body}'`) === '1', JSON.stringify(a4));
  const d1 = await rpc(sJ, 'discard_work_photo', { p_id: r6.body });
  await sweep(SERVICE, { dryRun: false });
  check('D1 Remove before a check: the row goes and the sweep removes the bytes',
    d1.body === true && !objectExists(name6) && sql(`select count(*) from work_photos where id = '${r6.body}'`) === '0', JSON.stringify(d1));

  // ---- P1 the retention clock -------------------------------------------------
  sql(`update work_photos set keep_until = now() - interval '1 minute' where id = '${id1}'`);
  const dry = await sweep(SERVICE, {});
  check('P1a a dry run reports the due photo and removes nothing',
    dry.status === 200 && dry.body?.dryRun === true && dry.body?.due?.due >= 1 && objectExists(name1)
      && sql(`select count(*) from work_photos where id = '${id1}'`) === '1', JSON.stringify(dry));
  const real = await sweep(SERVICE, { dryRun: false });
  check('P1b the real run removes the row AND the bytes',
    real.status === 200 && !objectExists(name1)
      && sql(`select count(*) from work_photos where id = '${id1}'`) === '0'
      && sql(`select count(*) from work_photo_deletions where object_name = '${name1}'`) === '0'
      && (await read(sJ, name1)) >= 400, JSON.stringify(real));

  // ---- P3 the version cascade (the activity purge deletes versions first) ------
  const r3 = await rpc(s2J, 'reserve_work_photo', { p_activity_id: ACT, p_version_id: VER2, p_block_id: PB });
  const name3 = `${ACT}/${S2}/${r3.body}.jpg`;
  check('P3a setup upload', (await upload(s2J, name3, JPEG)).status === 200);
  sql(`delete from activity_versions where id = '${VER2}'`);
  await sweep(SERVICE, { dryRun: false });
  check('P3b deleting the version removed the bytes', !objectExists(name3));

  // ---- P2 the account cascade -------------------------------------------------
  const r4 = await rpc(s2J, 'reserve_work_photo', { p_activity_id: ACT, p_version_id: VER, p_block_id: PB });
  const name4 = `${ACT}/${S2}/${r4.body}.jpg`;
  check('P2a setup upload', (await upload(s2J, name4, JPEG)).status === 200);
  sql(`delete from auth.users where id = '${S2}'`);
  await sweep(SERVICE, { dryRun: false });
  check('P2b deleting the account removed the bytes', !objectExists(name4));

  // ---- P4 the orphan backstop -------------------------------------------------
  const name5 = `${ACT}/${T2}/${randomUUID()}.jpg`;
  const sup = await upload(SERVICE, name5, JPEG);
  sql(`update storage.objects set created_at = now() - interval '2 hours' where bucket_id = '${BUCKET}' and name = '${name5}'`);
  check('P4a setup: a service-role object with no row', sup.status === 200 && objectExists(name5), `${sup.status} ${sup.body}`);
  await sweep(SERVICE, { dryRun: false });
  check('P4b the sweep removed the orphan', !objectExists(name5));
}

async function cleanup() {
  try {
    if (ACT) sql(`delete from section_checks where activity_id = '${ACT}'`);
    if (ACT) sql(`delete from activities where id = '${ACT}'`);
    sql(`delete from classes where name = '${tag}'`);
    sql(`delete from auth.users where email like '${tag}-%'`);
    await sweep(SERVICE, { dryRun: false });
    const left = sql(`select (select count(*) from storage.objects where bucket_id = '${BUCKET}' and name like '${ACT}/%')
                          + (select count(*) from work_photos where activity_id::text = '${ACT ?? ''}')
                          + (select count(*) from work_photo_deletions where object_name like '${ACT}/%')`);
    check('R1 no residue: no object, row or queued key left from this run', left === '0', `left=${left}`);
  } finally {
    sql(`update photo_clearance set cleared = ${clearanceBefore === 't'}`);
    console.log(`  photo_clearance restored to ${clearanceBefore === 't' ? 'ON' : 'OFF'}`);
  }
}

try {
  await main();
} catch (err) {
  fail++;
  console.log(`  FAIL  unexpected error :: ${err?.stack ?? err}`);
} finally {
  await cleanup();
  console.log(`=== verify-student-work-e2e: ${pass} PASS, ${fail} FAIL ===`);
  process.exit(fail ? 1 : 0);
}
