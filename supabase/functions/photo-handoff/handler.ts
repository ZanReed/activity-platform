// =============================================================================
// photo-handoff/handler.ts — what the no-sign-in phone page may do
// (migration 0095; docs/design/media-submissions.md §4.1, MS-24)
// -----------------------------------------------------------------------------
// Pure: the database and Storage arrive as PORTS, so this file runs under Node
// (scripts/tests/photo-handoff.test.mjs) and Deno (index.ts) alike.
//
// Two actions, both multipart/form-data POSTs (a "simple" request, so a phone
// on school Wi-Fi pays no CORS preflight):
//
//   action=peek,   code            → { title, prompt, slots_left, expires_at }
//   action=upload, code, photo     → { slots_left }
//
// The code is the ONLY credential: 43 base64url characters minted by
// start_photo_handoff, sha256-matched in SQL. It arrives in the BODY, never in
// the URL, so no access log holds it.
//
// An upload, in order (each step can refuse; nothing after a refusal runs):
//   1. size and shape: ≤ 1.5 MB (the bucket's limit) and a well-formed JPEG,
//      re-written WITHOUT its metadata segments (jpegStrip.ts) — this path has
//      no sign-in, so the server does not trust the phone's re-encode alone;
//   2. handoff_reserve: the code is live and has a slot, the mode allows a
//      phone, the global ceiling, then reserve_photo_for — the SAME gate a
//      device upload passes (clearance, class, block, caps);
//   3. the bytes go to Storage under the reservation's object name, never
//      overwriting (x-upsert false);
//   4. handoff_confirm: the photo ARRIVES (the Chromebook's next poll adds it).
//      A failed step 3 releases the reservation and the slot instead.
//
// It returns nothing about the student, ever: not a name, not an id, not the
// photo's id (the Chromebook learns that from its own poll).
// =============================================================================

import type { FnName, RpcArgs } from '../_shared/database.rpc.ts';
import { stripJpegMetadata } from './jpegStrip.ts';

/** The bucket's file_size_limit (0093), the same number the client re-encodes to. */
export const MAX_PHOTO_BYTES = 1_572_864;
/** A request body over this is refused before it is parsed. */
export const MAX_BODY_BYTES = 2 * 1024 * 1024;
const CODE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/** The refusals the phone page turns into copy (packages/app/src/routes/PhotoHandoff.tsx). */
export const HANDOFF_REFUSALS = {
  handoff_expired: 410,
  handoff_full: 409,
  handoff_not_here: 403,
  photos_off: 403,
  not_in_class: 403,
  not_a_student: 403,
  not_available: 410,
  photo_cap: 429,
  handoff_busy: 429,
} as const;

export type HandoffRefusal = keyof typeof HANDOFF_REFUSALS;

export type RpcResult = { ok: true; data: unknown } | { ok: false; message: string };

export interface HandoffPorts {
  /** Name and arguments typed by the schema (deno check, review C1). */
  rpc<F extends FnName>(name: F, ...args: RpcArgs<F>): Promise<RpcResult>;
  /** Write the JPEG at `objectName` in the student-work bucket, never overwriting. */
  putObject(objectName: string, jpeg: Uint8Array<ArrayBuffer>): Promise<boolean>;
}

export interface HandoffReply {
  status: number;
  body: Record<string, unknown>;
}

const refuse = (error: string, status: number): HandoffReply => ({ status, body: { error } });

function refusalFrom(message: string): HandoffReply {
  for (const [code, status] of Object.entries(HANDOFF_REFUSALS)) {
    if (message.includes(code)) {
      // A teacher's account behind a code cannot happen (start refuses it), but
      // if it did it reads as the same advice as a student out of the class.
      return refuse(code === 'not_a_student' ? 'not_in_class' : code, status);
    }
  }
  return refuse('failed', 500);
}

export async function handleHandoff(req: Request, ports: HandoffPorts): Promise<HandoffReply> {
  if (req.method !== 'POST') return refuse('method_not_allowed', 405);
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) return refuse('too_big', 413);

  // The declared length is a hint, not a bound (Fable review): a chunked body
  // has none and a client can lie. The body is read with a counter that stops
  // at the limit, BEFORE anything is parsed — this function has no sign-in.
  const body = await readCapped(req, MAX_BODY_BYTES);
  if (body === 'too_big') return refuse('too_big', 413);
  let form: FormData;
  try {
    form = await new Response(body, {
      headers: { 'content-type': req.headers.get('content-type') ?? '' },
    }).formData();
  } catch {
    return refuse('bad_request', 400);
  }
  const code = form.get('code');
  const action = form.get('action');
  // A malformed code is refused exactly like a wrong one: a guess learns nothing.
  if (typeof code !== 'string' || !CODE_PATTERN.test(code)) return refuse('handoff_expired', 410);

  if (action === 'peek') {
    const peek = await ports.rpc('handoff_peek', { p_code: code });
    if (!peek.ok) return refusalFrom(peek.message);
    const data = (peek.data ?? {}) as Record<string, unknown>;
    return {
      status: 200,
      body: {
        title: typeof data['title'] === 'string' ? data['title'] : '',
        prompt: typeof data['prompt'] === 'string' ? data['prompt'] : '',
        slots_left: typeof data['slots_left'] === 'number' ? data['slots_left'] : 0,
        expires_at: typeof data['expires_at'] === 'string' ? data['expires_at'] : null,
      },
    };
  }

  if (action !== 'upload') return refuse('bad_request', 400);

  const photo = form.get('photo');
  if (!photo || typeof photo === 'string') return refuse('not_a_photo', 400);
  if (photo.size > MAX_PHOTO_BYTES) return refuse('too_big', 413);
  const clean = stripJpegMetadata(new Uint8Array(await photo.arrayBuffer()));
  if (!clean) return refuse('not_a_photo', 400);

  const reserved = await ports.rpc('handoff_reserve', { p_code: code });
  if (!reserved.ok) return refusalFrom(reserved.message);
  const { photo_id: photoId, object_name: objectName } = (reserved.data ?? {}) as Record<string, unknown>;
  if (typeof photoId !== 'string' || typeof objectName !== 'string') return refuse('failed', 500);

  let stored = false;
  try {
    stored = await ports.putObject(objectName, clean);
  } catch {
    stored = false;
  }
  if (!stored) {
    // The slot comes back and the reservation goes: the phone can try again.
    await ports.rpc('handoff_release', { p_code: code, p_photo_id: photoId });
    return refuse('upload_failed', 502);
  }

  // Confirm is idempotent, so one retry is free: a lost reply here would
  // otherwise leave a stored photo that never arrives on the Chromebook.
  let confirmed = await ports.rpc('handoff_confirm', { p_code: code, p_photo_id: photoId });
  if (!confirmed.ok && !confirmed.message.includes('handoff_')) {
    confirmed = await ports.rpc('handoff_confirm', { p_code: code, p_photo_id: photoId });
  }
  if (!confirmed.ok) return refusalFrom(confirmed.message);
  return { status: 200, body: { slots_left: typeof confirmed.data === 'number' ? confirmed.data : 0 } };
}

/** The request body, or 'too_big' the moment it passes `limit` bytes. */
async function readCapped(req: Request, limit: number): Promise<Uint8Array<ArrayBuffer> | 'too_big'> {
  if (!req.body) return new Uint8Array(0);
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > limit) {
      await reader.cancel().catch(() => undefined);
      return 'too_big';
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}
