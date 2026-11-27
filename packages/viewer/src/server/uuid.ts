// =============================================================================
// server/uuid.ts — ONE id-shape rule for the API surface (G2)
// -----------------------------------------------------------------------------
// THE DECISION (eng-review G2, 2026-08-06): STRICT everywhere in shared server
// source. UUID_RE existed at four sites with two strictnesses — the read API
// accepted any hex nibbles while the check API required a real version nibble
// and RFC variant — so the same activity id could be valid on one endpoint and
// rejected by the other, with no recorded why (s2-audit corrections 3/5).
// Every legitimate id is a Postgres gen_random_uuid() (v4, RFC variant), so
// strict costs no real client anything and rejects garbage earlier.
//
// There are no loose copies left: the two that stood in ingest-submission and
// get-feedback died with those functions at S9 (2026-08-14). This rule also
// shapes the check request's idempotency key since review B4 (2026-11-28):
// `isCheckKey` in check-activity-handler.ts.
// =============================================================================

/** RFC 4122 v1–v5, variant 10xx — what gen_random_uuid() and every legitimate
 * client id actually look like. */
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
