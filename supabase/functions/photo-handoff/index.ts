// =============================================================================
// photo-handoff — the phone's way in, with no sign-in (migration 0095;
// docs/design/media-submissions.md §4.1, MS-24)
// -----------------------------------------------------------------------------
// ⚠ DEPLOYED WITH verify_jwt = false (supabase/config.toml; `pnpm
// deploy:photo-handoff`). It is the SECOND function allowed to run without a
// sign-in (get-activity is the first), and the author ruled it so on
// 2026-11-18 (MS-24). The phone holding the code may be a parent's or a
// classmate's, and must never be asked to sign in as the student.
//
// The credential is the handoff code alone (handler.ts). The service-role key
// stays in this function: the database calls it makes are the four 0095 grants
// to service_role, each of which re-derives the student from the code's hash.
// Nothing a caller sends names a student, an activity or a photo.
//
// All of the logic is in handler.ts, which is pure and tested under Node; this
// file supplies the two ports (PostgREST and Storage, plain fetch — no
// supabase-js, as in sweep-work-photos) and CORS.
// =============================================================================

import { corsHeaders, handlePreflight } from '../_shared/cors.ts';
import { handleHandoff, isTimeout, TIMED_OUT, type HandoffPorts } from './handler.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const BUCKET = 'student-work';

// TIME LIMITS (review D7, 2026-11-28). Before these, a hung fetch held the
// phone holder's request until the platform's 150 s wall clock, and a hung
// Storage PUT held a reserved photo slot for all of it.
//
// RPC_TIMEOUT_MS = 10 s: each of the four 0095 functions is one indexed lookup
// plus a row write, answered in milliseconds. 10 s is far past a slow-but-alive
// database and short enough that someone holding a phone is told "try again"
// while they are still looking at it.
//
// PUT_TIMEOUT_MS = 30 s: the body is at most 1.5 MB (MAX_PHOTO_BYTES), sent
// from inside Supabase's own network to its Storage, normally well under a
// second. 30 s allows a slow Storage moment without abandoning a real upload,
// and still leaves the release (10 s) and the reply far inside the wall clock.
const RPC_TIMEOUT_MS = 10_000;
const PUT_TIMEOUT_MS = 30_000;

const ports: HandoffPorts = {
  async rpc(name, ...args) {
    // One signal bounds the response AND the body read.
    const signal = AbortSignal.timeout(RPC_TIMEOUT_MS);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          apikey: SERVICE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args[0] ?? {}),
        signal,
      });
      const text = await res.text();
      if (!res.ok) return { ok: false, message: text };
      return { ok: true, data: text ? JSON.parse(text) : null };
    } catch (e) {
      // A timeout is a named refusal (handler.ts → 504 timed_out); anything
      // else still throws, to the 500 below, as before.
      if (isTimeout(e)) return { ok: false, message: TIMED_OUT };
      throw e;
    }
  },
  async putObject(objectName, jpeg) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectName}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'false',
      },
      body: jpeg,
      // A timeout throws; handler.ts releases the slot and answers timed_out.
      signal: AbortSignal.timeout(PUT_TIMEOUT_MS),
    });
    await res.body?.cancel();
    return res.ok;
  },
};

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  let reply;
  try {
    reply = await handleHandoff(req, ports);
  } catch {
    reply = { status: 500, body: { error: 'failed' } };
  }
  return new Response(JSON.stringify(reply.body), {
    status: reply.status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
});
