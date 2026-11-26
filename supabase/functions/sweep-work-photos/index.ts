// =============================================================================
// sweep-work-photos — removes the BYTES of students' photos once their rows
// are gone (migration 0093; docs/design/media-submissions.md §6.4, MS-11).
// -----------------------------------------------------------------------------
// Why a function at all: deleting a work_photos ROW is how every retention
// path removes a photo (the clock, the account purge, the activity purge —
// CASCADE + 0093's trigger queue the object key). The bytes cannot follow in
// SQL: storage.objects carries a `protect_objects_delete` trigger, so the only
// way to remove a stored object is the Storage API. This function is the
// hand-over: it asks SQL what is due, asks Storage to delete it, and lets SQL
// decide what really left (work_photo_deletions_done only clears keys whose
// object is gone from storage.objects, so a failed delete is never marked done).
//
// One POST does three things, in order:
//   1. sweep_work_photos_due(dryRun) — remove rows whose keep_until has passed
//      (the trigger queues their bytes);
//   2. drain work_photo_deletions through Storage's bulk delete;
//   3. delete orphans: objects with no row at all (the §6.2 backstop).
//
// ⚠ DRY-RUN UNLESS THE BODY SAYS {"dryRun": false}. Any other body, or none,
// reports what it would do and deletes nothing. It ships UNSCHEDULED; arming
// it (a pg_cron + pg_net job with dryRun:false) is a slice-5 author action
// that must happen BEFORE photo_clearance goes on. verify-0093's
// `sweep_schedule_is_pinned_or_absent` row pins the schedule (none, or the
// two README jobs exactly), and `sweep_armed_before_clearance` goes red if
// photo answers go on before it is armed.
//
// Authorization: verify_jwt = true (config.toml) AND the `x-sweep-token`
// header must BE this function's own secret, SWEEP_WORK_PHOTOS_TOKEN (set with
// `supabase secrets set`; pg_cron sends the same value from Vault), compared
// byte for byte in constant time. The platform gate only proves a JWT is real;
// any signed-in student has a real JWT too.
//
// Why a dedicated secret (author ruling 2026-11-19): the first version compared
// the BEARER to SUPABASE_SERVICE_ROLE_KEY. That passed on the local stack and
// refused the project's own service-role key on live (403). Measured the same
// day (the secrets list's sha256 digests): the SUPABASE_SERVICE_ROLE_KEY the
// platform injects into functions is NOT the service-role key the author
// holds, though the platform gate accepts both. A secret of our own, set by
// us and checked in a header of our own, cannot drift from its copy that way. An earlier
// draft read the `role` claim instead, which is safe only while verify_jwt
// stays on (Fable review, 2026-11-18); the token does not depend on the flag.
//
// It drains in a LOOP until the queue and the orphans are empty or the time
// budget runs out (`more: true` then), because rows that share one school-year
// keep_until fall due on the same night and the bytes must follow the rows,
// not trail them at a fixed batch a night.
//
// Plain fetch to PostgREST and Storage, no supabase-js: four RPCs and one
// DELETE do not need a client, and nothing here should be able to grow into
// one by accident.
// =============================================================================

import type { FnName, ReturnsOf, RpcArgs } from '../_shared/database.rpc.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
// The caller's secret. Below 32 characters it is treated as unset: a short
// value is a configuration mistake, not a credential.
const SWEEP_TOKEN = Deno.env.get('SWEEP_WORK_PHOTOS_TOKEN') ?? '';
const MIN_TOKEN = 32;
const BUCKET = 'student-work';
const BATCH = 500; // keys per round
const BUDGET_MS = 45_000; // stop starting new rounds after this; `more: true`
const CHUNK = 100; // object keys per Storage bulk-delete request

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/** True only when `x-sweep-token` is exactly this function's secret. */
function isSweepCaller(req: Request): boolean {
  const token = req.headers.get('x-sweep-token') ?? '';
  if (SWEEP_TOKEN.length < MIN_TOKEN || token.length !== SWEEP_TOKEN.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ SWEEP_TOKEN.charCodeAt(i);
  return diff === 0;
}

const serviceHeaders = {
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
  'Content-Type': 'application/json',
};

// Name, arguments and result typed by the schema (deno check, review C1).
async function rpc<F extends FnName>(name: F, ...args: RpcArgs<F>): Promise<ReturnsOf<F>> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: serviceHeaders,
    body: JSON.stringify(args[0] ?? {}),
  });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status} ${await res.text()}`);
  return (await res.json()) as ReturnsOf<F>;
}

/** Asks Storage to delete `names`; returns how many it reported deleted. A
 *  failed chunk is recorded and the rest continue — SQL decides what left. */
async function deleteObjects(names: string[], failures: string[]): Promise<number> {
  let deleted = 0;
  for (let i = 0; i < names.length; i += CHUNK) {
    const chunk = names.slice(i, i + CHUNK);
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
      method: 'DELETE',
      headers: serviceHeaders,
      body: JSON.stringify({ prefixes: chunk }),
    });
    if (!res.ok) {
      failures.push(`delete chunk ${i / CHUNK}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
      continue;
    }
    const body = await res.json().catch(() => []);
    deleted += Array.isArray(body) ? body.length : 0;
  }
  return deleted;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'POST only' });
  if (!SUPABASE_URL || !SERVICE_KEY || SWEEP_TOKEN.length < MIN_TOKEN) {
    return json(500, { error: 'function env missing' });
  }
  if (!isSweepCaller(req)) return json(403, { error: 'sweep token required' });

  const body = await req.json().catch(() => ({}));
  const dryRun = !(body && typeof body === 'object' && (body as { dryRun?: unknown }).dryRun === false);

  try {
    const due = (await rpc('sweep_work_photos_due', { p_dry_run: dryRun })) as Record<string, unknown>; // jsonb
    const queued = await rpc('work_photo_deletion_batch', { p_limit: BATCH });
    const orphans = await rpc('work_photo_orphans', { p_limit: BATCH });

    if (dryRun) {
      return json(200, {
        dryRun: true,
        due,
        queuedBytes: queued.length,
        orphans: orphans.length,
        more: queued.length === BATCH || orphans.length === BATCH,
      });
    }

    const started = Date.now();
    const failures: string[] = [];
    let batch = queued;
    let orphanBatch = orphans;
    let queuedSeen = 0, queueCleared = 0, orphansSeen = 0, storageDeleted = 0, rounds = 0;
    let more = false;
    while (batch.length || orphanBatch.length) {
      rounds++;
      queuedSeen += batch.length;
      orphansSeen += orphanBatch.length;
      storageDeleted += await deleteObjects([...batch, ...orphanBatch], failures);
      const cleared = batch.length
        ? await rpc('work_photo_deletions_done', { p_names: batch })
        : 0;
      queueCleared += cleared;
      // A round that removed nothing would repeat forever (Storage is down,
      // or every key failed): stop and report instead.
      if (cleared === 0 && batch.length && failures.length) break;
      if (Date.now() - started > BUDGET_MS) {
        more = true;
        break;
      }
      batch = await rpc('work_photo_deletion_batch', { p_limit: BATCH });
      orphanBatch = await rpc('work_photo_orphans', { p_limit: BATCH });
      // Orphans whose delete failed come back unchanged; don't loop on them.
      if (!batch.length && orphanBatch.length && failures.length) break;
    }
    const stillQueued = (await rpc('work_photo_deletion_batch', { p_limit: 1 })).length > 0;

    return json(failures.length ? 207 : 200, {
      dryRun: false,
      due,
      rounds,
      queuedBytes: queuedSeen,
      queueCleared,
      orphans: orphansSeen,
      storageDeleted,
      stillQueued,
      failures,
      more,
    });
  } catch (err) {
    return json(500, { error: err instanceof Error ? err.message : String(err) });
  }
});
