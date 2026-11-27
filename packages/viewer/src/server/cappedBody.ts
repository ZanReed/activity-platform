// =============================================================================
// server/cappedBody.ts — read a request body, stopping at a byte limit
// -----------------------------------------------------------------------------
// Review B4 (2026-11-26). `content-length` is a hint, not a bound: a chunked
// body carries none, and a client can lie. check-activity trusted the header
// alone, so a chunked 50 MB body was read whole, parsed, and — its unknown keys
// riding along — recorded in a row kept ~400 days. The body is now read with a
// counter that stops the moment it passes the limit, BEFORE anything is
// parsed.
//
// The same reader as `supabase/functions/photo-handoff/handler.ts` (which
// found this first, in its own Fable review). photo-handoff is plain Deno with
// no bundle, so it keeps its own copy rather than importing this package's
// source; the two are ten lines and do one thing. The header check stays in
// front of both as the cheap early refusal.
// =============================================================================

/** The body's bytes, or 'too_big' the moment they pass `limit`. */
export async function readCappedBody(
  req: Request,
  limit: number,
): Promise<Uint8Array | 'too_big'> {
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
