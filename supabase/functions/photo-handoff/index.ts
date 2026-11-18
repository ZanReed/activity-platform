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
import { handleHandoff, type HandoffPorts } from './handler.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const BUCKET = 'student-work';

const ports: HandoffPorts = {
  async rpc(name, args) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, message: text };
    return { ok: true, data: text ? JSON.parse(text) : null };
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
