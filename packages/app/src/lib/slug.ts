// =============================================================================
// slug.ts — URL-safe slug generation from activity titles
// -----------------------------------------------------------------------------
// A slug is derived from the title once, at activity creation, and frozen
// thereafter. It is currently INTERNAL-ONLY: no route, published URL, or
// storage key reads it (publish-activity keys everything by activity id).
// It exists to satisfy `unique (owner_id, slug)` and as a future hook for
// human-readable share URLs — if slugs ever become user-facing, re-derive
// them from the title at first publish (nothing references them today, so
// a backfill is cheap). The title stays freely editable and is allowed to
// diverge from the slug.
//
// Uniqueness is enforced by the DB constraint `unique (owner_id, slug)`, not
// here: callers attempt the insert and, on a 23505 unique-violation, retry
// with a suffix. This module only produces the base slug and the suffixed
// variants.
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
//   attempt 5+ -> "factoring-quadratics-x7k2q1" (random token)
//
// Numeric suffixes stay readable for the common collision (a handful of
// same-titled activities). Past attempt 4 the numeric ladder is clearly
// saturated — instant-create makes many "untitled-activity" slugs per owner
// routine, and slugs stay frozen after rename — so later attempts switch to
// a short random token, which terminates the retry loop in practice instead
// of exhausting it at MAX_ATTEMPTS.
export function slugWithSuffix(base: string, attempt: number): string {
    if (attempt === 0) return base;
    if (attempt <= 4) return `${base}-${attempt + 1}`;
    return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}
