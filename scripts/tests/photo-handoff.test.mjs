// =============================================================================
// photo-handoff.test.mjs — the no-sign-in phone function's handler, under Node
// (migration 0095; docs/design/media-submissions.md §4.1)
// -----------------------------------------------------------------------------
// handler.ts and jpegStrip.ts are pure TypeScript; Node 24 runs them by
// stripping the types, so the function's whole decision logic is tested here,
// on every PR, without Deno. The database half (the code hash, the gate, the
// slots) is verify-0095; the deployed function end to end is
// verify-student-work-e2e.mjs's H rows.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handleHandoff, MAX_PHOTO_BYTES, TIMED_OUT } from '../../supabase/functions/photo-handoff/handler.ts';
import { stripJpegMetadata } from '../../supabase/functions/photo-handoff/jpegStrip.ts';

const CODE = 'A'.repeat(42) + '_';

const seg = (marker, payload) => [0xff, marker, (payload.length + 2) >> 8, (payload.length + 2) & 0xff, ...payload];
const ascii = (s) => [...s].map((c) => c.charCodeAt(0));
/** A plain 16-byte JFIF APP0, the one APP0 the strip keeps. */
const JFIF = seg(0xe0, [...ascii('JFIF'), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);
const SOF0 = seg(0xc0, [8, 0, 1, 0, 1, 1, 1, 0x11, 0]);
const DQT = seg(0xdb, [0, 1, 2, 3]);
const SCAN = [...seg(0xda, [1, 1, 0, 0, 0x3f, 0]), 0x12, 0x34, 0xff, 0x00, 0x56, 0xff, 0xd0, 0x78];

/** A minimal JPEG: SOI, JFIF, APP1 (EXIF with a GPS string), ICC, COM, DQT, SOF, SOS, data, EOI. */
function jpegWithExif() {
  return new Uint8Array([
    0xff, 0xd8,
    ...JFIF,
    ...seg(0xe1, ascii('Exif\0\0GPS-41.2865S174.7762E')),
    ...seg(0xe2, ascii('ICC_PROFILE')),
    ...seg(0xfe, ascii('taken by Jane Doe')),
    ...DQT,
    ...SOF0,
    ...SCAN,
    0xff, 0xd9,
  ]);
}

const text = (bytes) => Buffer.from(bytes).toString('latin1');

function form(fields) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return new Request('https://x.test/photo-handoff', { method: 'POST', body: f });
}

function fakePorts({ reserve, put = true, confirm = 1, peek } = {}) {
  const calls = [];
  const puts = [];
  return {
    calls,
    puts,
    async rpc(name, args) {
      calls.push([name, args]);
      if (name === 'handoff_peek') return peek ?? { ok: true, data: { title: 'T', prompt: 'P', slots_left: 2, expires_at: 'z', student_id: 'leak' } };
      if (name === 'handoff_reserve') return reserve ?? { ok: true, data: { photo_id: 'p1', object_name: 'a/s/p1.jpg' } };
      if (name === 'handoff_confirm') return { ok: true, data: confirm };
      return { ok: true, data: null };
    },
    async putObject(name, bytes) {
      puts.push([name, bytes]);
      return put;
    },
  };
}

test('the strip removes EXIF, ICC and comments and keeps the image', () => {
  const out = stripJpegMetadata(jpegWithExif());
  assert.ok(out);
  assert.doesNotMatch(text(out), /GPS|Exif|ICC_PROFILE|Jane/);
  assert.match(text(out), /JFIF/); // the plain 16-byte JFIF header stays
  assert.deepEqual([...out.subarray(0, 2)], [0xff, 0xd8]);
  assert.deepEqual([...out.subarray(-2)], [0xff, 0xd9]);
  // the scan data is untouched, stuffed bytes included
  assert.ok(text(out).includes(text(new Uint8Array([0x12, 0x34, 0xff, 0x00, 0x56, 0xff, 0xd0, 0x78]))));
});

test('a REAL camera-style JPEG (macOS sips: JFIF, EXIF, Photoshop/IPTC, ICC, DRI) keeps its image and loses its metadata', () => {
  // scripts/tests/fixtures/real-exif.jpg: a system wallpaper re-encoded by
  // sips, 48 px, carrying APP1 Exif, APP13 Photoshop and APP2 ICC.
  const real = new Uint8Array(readFileSync(new URL('./fixtures/real-exif.jpg', import.meta.url)));
  assert.match(text(real), /Exif/); // the fixture really carries it
  const out = stripJpegMetadata(real);
  assert.ok(out, 'a real JPEG parses');
  assert.doesNotMatch(text(out), /Exif|Photoshop|8BIM|ICC_PROFILE/);
  const markers = [];
  for (let i = 2; i < out.length && out[i] === 0xff; ) {
    markers.push(out[i + 1]);
    if (out[i + 1] === 0xda) break;
    i += 2 + ((out[i + 2] << 8) | out[i + 3]);
  }
  for (const m of [0xe0, 0xc0, 0xc4, 0xdb, 0xdd, 0xda]) assert.ok(markers.includes(m), `kept marker ${m.toString(16)}`);
  assert.deepEqual([...out.subarray(-2)], [0xff, 0xd9]);
  // The scan data is byte-for-byte the same: everything from SOS on.
  const sos = (b) => Buffer.from(b).indexOf(Buffer.from([0xff, 0xda]));
  assert.ok(Buffer.from(out.subarray(sos(out))).equals(Buffer.from(real.subarray(sos(real)))));
});

test('metadata between scans (a progressive JPEG) is dropped too', () => {
  const progressive = new Uint8Array([
    0xff, 0xd8, ...JFIF, ...DQT, ...SOF0, ...SCAN,
    ...seg(0xe1, ascii('Exif\0\0GPS-36.85S')), ...seg(0xfe, ascii('Jane')),
    ...SCAN, 0xff, 0xd9,
  ]);
  const out = stripJpegMetadata(progressive);
  assert.ok(out);
  assert.doesNotMatch(text(out), /GPS|Exif|Jane/);
  assert.equal(text(out).split(text(new Uint8Array([0xff, 0xda]))).length - 1, 2, 'both scans kept');
});

test('a trailer after EOI is never stored', () => {
  const withTrailer = new Uint8Array([...jpegWithExif(), ...ascii('ftypmp42 GPS-41.28S motion video')]);
  const out = stripJpegMetadata(withTrailer);
  assert.ok(out);
  assert.deepEqual([...out.subarray(-2)], [0xff, 0xd9]);
  assert.doesNotMatch(text(out), /ftyp|GPS/);
});

test('an APP0 that is not a plain JFIF header (a JFXX thumbnail, a payload) is dropped', () => {
  const jfxx = new Uint8Array([0xff, 0xd8, ...seg(0xe0, ascii('JFXX\0secret thumbnail')), ...SOF0, ...SCAN, 0xff, 0xd9]);
  const out = stripJpegMetadata(jfxx);
  assert.ok(out);
  assert.doesNotMatch(text(out), /JFXX|secret/);
});

test('no frame header, or no scan, is not an image', () => {
  assert.equal(stripJpegMetadata(new Uint8Array([0xff, 0xd8, ...seg(0xda, [1, 2, 3]), 1, 2, 3, 0xff, 0xd9])), null);
  assert.equal(stripJpegMetadata(new Uint8Array([0xff, 0xd8, ...SOF0, 0xff, 0xd9])), null);
  assert.equal(stripJpegMetadata(new Uint8Array([0xff, 0xd8, ...SOF0, ...SCAN])), null, 'no EOI');
});

test('the strip refuses what is not a JPEG, and a truncated one', () => {
  assert.equal(stripJpegMetadata(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), null);
  const whole = jpegWithExif();
  assert.equal(stripJpegMetadata(whole.subarray(0, 12)), null);
  assert.equal(stripJpegMetadata(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0xff, 0xff])), null);
});

test('peek returns the title, prompt and slots — and nothing about the student', async () => {
  const ports = fakePorts();
  const reply = await handleHandoff(form({ action: 'peek', code: CODE }), ports);
  assert.equal(reply.status, 200);
  assert.deepEqual(Object.keys(reply.body).sort(), ['expires_at', 'prompt', 'slots_left', 'title']);
});

test('a malformed code is refused exactly like a wrong one, without touching the database', async () => {
  const ports = fakePorts();
  for (const code of ['', 'short', CODE + 'x', 'A'.repeat(42) + '/']) {
    const reply = await handleHandoff(form({ action: 'peek', code }), ports);
    assert.deepEqual(reply, { status: 410, body: { error: 'handoff_expired' } });
  }
  assert.equal(ports.calls.length, 0);
});

test('an upload stores the STRIPPED bytes under the reservation, then confirms', async () => {
  const ports = fakePorts({ confirm: 1 });
  const reply = await handleHandoff(
    form({ action: 'upload', code: CODE, photo: new Blob([jpegWithExif()], { type: 'image/jpeg' }) }),
    ports,
  );
  assert.deepEqual(reply, { status: 200, body: { slots_left: 1 } });
  assert.equal(ports.puts.length, 1);
  assert.equal(ports.puts[0][0], 'a/s/p1.jpg');
  assert.doesNotMatch(text(ports.puts[0][1]), /GPS/);
  assert.deepEqual(ports.calls.map((c) => c[0]), ['handoff_reserve', 'handoff_confirm']);
  assert.doesNotMatch(JSON.stringify(reply.body), /p1/); // not even the photo's id
});

test('a failed Storage write releases the slot and confirms nothing', async () => {
  const ports = fakePorts({ put: false });
  const reply = await handleHandoff(
    form({ action: 'upload', code: CODE, photo: new Blob([jpegWithExif()]) }),
    ports,
  );
  assert.equal(reply.status, 502);
  assert.deepEqual(ports.calls.map((c) => c[0]), ['handoff_reserve', 'handoff_release']);
  assert.deepEqual(ports.calls[1][1], { p_code: CODE, p_photo_id: 'p1' });
});

test('a non-JPEG or an oversize photo is refused before a slot is taken', async () => {
  const ports = fakePorts();
  const png = await handleHandoff(
    form({ action: 'upload', code: CODE, photo: new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])]) }),
    ports,
  );
  assert.deepEqual(png, { status: 400, body: { error: 'not_a_photo' } });
  const big = new Uint8Array(MAX_PHOTO_BYTES + 1);
  big.set(jpegWithExif());
  const huge = await handleHandoff(form({ action: 'upload', code: CODE, photo: new Blob([big]) }), ports);
  assert.equal(huge.status, 413);
  assert.equal(ports.calls.length, 0);
});

test('the database refusals map to their contract strings', async () => {
  for (const [message, status, error] of [
    ['handoff_expired', 410, 'handoff_expired'],
    ['handoff_full', 409, 'handoff_full'],
    ['handoff_not_here', 403, 'handoff_not_here'],
    ['photos_off', 403, 'photos_off'],
    ['not_a_student', 403, 'not_in_class'],
    ['handoff_busy', 429, 'handoff_busy'],
    ['something else', 500, 'failed'],
  ]) {
    const ports = fakePorts({ reserve: { ok: false, message: `{"message":"${message}"}` } });
    const reply = await handleHandoff(
      form({ action: 'upload', code: CODE, photo: new Blob([jpegWithExif()]) }),
      ports,
    );
    assert.deepEqual(reply, { status, body: { error } }, message);
    assert.equal(ports.puts.length, 0);
  }
});

test('only a POST is served', async () => {
  const reply = await handleHandoff(new Request('https://x.test/photo-handoff'), fakePorts());
  assert.equal(reply.status, 405);
});

test('a body with no Content-Length is capped while it is read, never buffered whole', async () => {
  let pulled = 0;
  const chunk = new Uint8Array(256 * 1024);
  const stream = new ReadableStream({
    pull(controller) {
      pulled += chunk.length;
      if (pulled > 64 * 1024 * 1024) controller.close();
      else controller.enqueue(chunk);
    },
  });
  const req = new Request('https://x.test/photo-handoff', {
    method: 'POST',
    body: stream,
    duplex: 'half',
    headers: { 'content-type': 'multipart/form-data; boundary=x' },
  });
  assert.equal(req.headers.get('content-length'), null);
  const ports = fakePorts();
  const reply = await handleHandoff(req, ports);
  assert.deepEqual(reply, { status: 413, body: { error: 'too_big' } });
  assert.ok(pulled < 4 * 1024 * 1024, `read ${pulled} bytes before refusing`);
  assert.equal(ports.calls.length, 0);
});

test('a confirm that fails for a transient reason is retried once (it is idempotent)', async () => {
  let n = 0;
  const ports = fakePorts();
  const rpc = ports.rpc;
  ports.rpc = async (name, args) => {
    if (name === 'handoff_confirm' && n++ === 0) return { ok: false, message: 'connection reset' };
    return rpc(name, args);
  };
  const reply = await handleHandoff(form({ action: 'upload', code: CODE, photo: new Blob([jpegWithExif()]) }), ports);
  assert.equal(reply.status, 200);
  assert.equal(n, 2);
});

// Review D7 (2026-11-28): index.ts gives every fetch a time limit. A timed-out
// rpc answers { ok:false, message: TIMED_OUT }; a timed-out PUT throws the
// TimeoutError AbortSignal.timeout raises. Both are a named, retryable 504.
test('a Storage PUT that times out releases the slot and says timed_out', async () => {
  const ports = fakePorts();
  ports.putObject = async () => {
    throw new DOMException('The signal has been aborted', 'TimeoutError');
  };
  const reply = await handleHandoff(form({ action: 'upload', code: CODE, photo: new Blob([jpegWithExif()]) }), ports);
  assert.deepEqual(reply, { status: 504, body: { error: 'timed_out' } });
  assert.deepEqual(ports.calls.map((c) => c[0]), ['handoff_reserve', 'handoff_release']);
});

test('a database call that times out is a 504 timed_out, not a 500', async () => {
  const ports = fakePorts({ reserve: { ok: false, message: TIMED_OUT } });
  const reply = await handleHandoff(form({ action: 'upload', code: CODE, photo: new Blob([jpegWithExif()]) }), ports);
  assert.deepEqual(reply, { status: 504, body: { error: 'timed_out' } });
  const peek = await handleHandoff(form({ action: 'peek', code: CODE }), fakePorts({ peek: { ok: false, message: TIMED_OUT } }));
  assert.deepEqual(peek, { status: 504, body: { error: 'timed_out' } });
});


test('a confirm that times out twice gives the slot back (Fable review, D7)', async () => {
  const ports = fakePorts();
  const rpc = ports.rpc;
  ports.rpc = async (name, args) => {
    if (name === 'handoff_confirm') {
      ports.calls.push([name, args]);
      return { ok: false, message: TIMED_OUT };
    }
    return rpc(name, args);
  };
  const reply = await handleHandoff(form({ action: 'upload', code: CODE, photo: new Blob([jpegWithExif()]) }), ports);
  assert.deepEqual(reply, { status: 504, body: { error: 'timed_out' } });
  assert.deepEqual(ports.calls.map((c) => c[0]), ['handoff_reserve', 'handoff_confirm', 'handoff_confirm', 'handoff_release']);
});
