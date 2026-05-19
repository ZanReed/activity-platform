// =============================================================================
// slug.ts — URL-safe slug generation from activity titles
// -----------------------------------------------------------------------------
// A slug is derived from the title once, at activity creation, and frozen
// thereafter — it lands in the published storage path (activities/<slug>/...),
// so changing it later would break URLs. The title stays freely editable and
// is allowed to diverge from the slug.
//
// Uniqueness is enforced by the DB constraint `unique (owner_id, slug)`, not
// here: callers attempt the insert and, on a 23505 unique-violation, retry
// with a numeric suffix. This module only produces the base slug and the
// suffixed variants.
// =============================================================================

const MAX_LENGTH = 80;
const FALLBACK = 'activity';

// Lowercase, strip diacritics, collapse every run of non-alphanumerics into a
// single hyphen, trim stray hyphens. An all-punctuation or empty title yields
// the FALLBACK base rather than an empty string.
export function slugify(title: string): string {
    const base = title
    .normalize('NFKD') // decompose accented chars: "é" -> "e" + combining mark
    .replace(/[\u0300-\u036f]/g, '') // drop the combining marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // any non-alphanumeric run -> one hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .slice(0, MAX_LENGTH)
    .replace(/-+$/g, ''); // re-trim if the slice cut mid-hyphen

    return base.length > 0 ? base : FALLBACK;
}

// The slug to try on the Nth insert attempt (0-indexed):
//   attempt 0 -> "factoring-quadratics"
//   attempt 1 -> "factoring-quadratics-2"
//   attempt 2 -> "factoring-quadratics-3"
export function slugWithSuffix(base: string, attempt: number): string {
    return attempt === 0 ? base : `${base}-${attempt + 1}`;
}
