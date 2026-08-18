// =============================================================================
// normalizeTags.ts — the ONE normalization contract for activity tags (R5)
// -----------------------------------------------------------------------------
// Ruled in the taxonomy eng review (docs/design/activity-taxonomy.md R5). Every
// write path routes through this function — the drawer's chip input today, the
// ```meta import fence in Drop 2, and anything later. That single-function rule
// is the whole defence against vocabulary fragmentation: two write paths with
// two normalizations would fragment the vocabulary silently, and silent
// fragmentation is only visible once the corpus is large enough to hurt.
//
// The contract:
//   - lowercase                     ("Factoring" and "factoring" are one tag)
//   - trim + collapse inner runs    ("word  problems " -> "word problems")
//   - drop empties                  (a bare "" or "   " is not a tag)
//   - dedupe, first occurrence wins (order is authored order, not sort order)
//   - unicode letters PRESERVED     (macrons and accents survive intact —
//                                    lowercasing is the only case transform,
//                                    there is no ASCII-slug step; a strict
//                                    kebab slug was rejected in review for
//                                    exactly this reason)
//
// What it deliberately does NOT do: synonym or singular/plural resolution.
// "factoring" and "factorising" stay two tags. That drift is editorial, held
// by single-author curation plus the typeahead over existing tags; a
// controlled vocabulary is the deferred (c) migration, not this function's job.
//
// Display is the STORED form — there is no separate display transform, so what
// a chip shows is exactly what a filter matches.
// =============================================================================

/**
 * Normalize a list of raw tag strings into the stored form.
 *
 * Pure and total: never throws, never returns null. Non-string entries are
 * dropped rather than coerced, so a malformed import can't inject "[object
 * Object]" into the vocabulary.
 */
export function normalizeTags(raw: readonly unknown[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const entry of raw) {
        if (typeof entry !== 'string') continue;
        const tag = normalizeTag(entry);
        if (tag === null) continue;
        if (seen.has(tag)) continue;
        seen.add(tag);
        out.push(tag);
    }
    return out;
}

/**
 * Normalize ONE tag. Returns null when the input carries no tag at all (empty
 * or whitespace-only) — callers drop those rather than storing a blank.
 *
 * Exported for the chip input, which normalizes a single entry on commit so
 * the chip the author sees is the string that will be stored.
 */
export function normalizeTag(raw: string): string | null {
    // \s in a JS regex covers unicode whitespace (non-breaking spaces
    // included), so a tag pasted out of a document collapses the same way one
    // typed by hand does. Collapse before trim so an interior run becomes a
    // single ordinary space rather than surviving as an exotic one.
    const collapsed = raw.replace(/\s+/g, ' ').trim().toLowerCase();
    return collapsed === '' ? null : collapsed;
}

/**
 * The union of every tag across a set of activities, normalized and sorted —
 * the typeahead's suggestion source. Sorted here (not authored-order) because
 * a suggestion list is scanned, not read: alphabetical is findable.
 */
export function collectTagVocabulary(
    activities: readonly { tags?: readonly string[] | null }[],
): string[] {
    const all: string[] = [];
    for (const a of activities) {
        for (const t of a.tags ?? []) all.push(t);
    }
    return normalizeTags(all).sort((x, y) => x.localeCompare(y));
}
