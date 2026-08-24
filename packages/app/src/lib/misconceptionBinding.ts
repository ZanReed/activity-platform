// =============================================================================
// misconceptionBinding.ts — the `:: mis.*` binding, parsed once for every site
// -----------------------------------------------------------------------------
// A distractor can name the misconception it senses. Three authoring sites carry
// the binding (blank `!wrong` segments, `mc` choice lines, `graph` mistake:
// lines), and they MUST agree character-for-character, so the splitting lives
// here rather than three times over.
//
// THE GRAMMAR IS PATTERN-DECIDED, NOT POSITIONAL (DX review X1). The last
// `::`-separated segment is the binding when it LOOKS like an id, wherever it
// sits:
//
//   !21 :: digits reversed :: mis.place-value.digit-reversal   feedback + id
//   !21 :: mis.place-value.digit-reversal                      id, no feedback
//   !21 :: digits reversed                                     feedback only
//
// The first draft of this feature made the id positional — "the THIRD segment"
// — which left the middle form unspellable: an author who wanted an id but no
// prose wrote the natural two-segment version and silently shipped a raw
// taxonomy string for students to read. Pattern-deciding removes the trap
// instead of documenting around it.
//
// WARNING, NEVER ERROR (ruled), with one addition the ruling missed: a segment
// that is SHAPED like an id but is not one — `msi.roc.uses-endpoint-value`, a
// prefix typo — used to fall through as feedback text with nothing said, which
// is the single likeliest failure when an AI drafts dozens of files. Those warn
// now. Real feedback prose never trips it: the shape test demands a single
// whitespace-free token of two-or-more dotted parts, each at least two
// characters, so "e.g." (one-character parts) and "3.14" (numeric) stay silent.
// =============================================================================

/** `mis.` + dot-separated kebab segments. Deliberately narrow: the platform
 * does not own the taxonomy, it only recognizes the shape the author uses. */
const VALID_ID = /^mis(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)+$/;

/** Looks like SOMEONE's taxonomy id, valid or not — the typo net. */
function isIdShaped(token: string): boolean {
    if (token.length === 0 || /\s/.test(token)) return false;
    const parts = token.split('.');
    if (parts.length < 2) return false;
    return parts.every((part) => part.length >= 2);
}

export function isValidMisconceptionId(token: string): boolean {
    return VALID_ID.test(token);
}

export interface BindingSplit {
    /** The feedback text with any binding removed. May be empty (id-only). */
    text: string;
    /** The recognized misconception id, when the tail carried one. */
    misconceptionId?: string;
    /** An id-SHAPED token that is not a valid id. Kept in `text` (nothing is
     * silently dropped); the caller warns naming this value. */
    suspect?: string;
}

/**
 * Split the tail of a feedback string into text + optional binding.
 *
 * `tail` is everything a site allows after its own leading marker: for a blank
 * that is what follows `!wrong ::`, for an `mc` choice what follows the choice
 * text's `::`, for a `graph` mistake line what follows the match's `::`.
 */
export function splitMisconceptionBinding(tail: string): BindingSplit {
    const trimmed = tail.trim();
    const sep = trimmed.lastIndexOf('::');

    if (sep === -1) {
        // No further `::` — the whole tail is either an id (the no-feedback
        // form) or ordinary feedback text.
        if (isValidMisconceptionId(trimmed)) {
            return { text: '', misconceptionId: trimmed };
        }
        if (isIdShaped(trimmed)) return { text: trimmed, suspect: trimmed };
        return { text: trimmed };
    }

    const candidate = trimmed.slice(sep + 2).trim();
    const before = trimmed.slice(0, sep).trim();
    if (isValidMisconceptionId(candidate)) {
        return { text: before, misconceptionId: candidate };
    }
    if (isIdShaped(candidate)) return { text: trimmed, suspect: candidate };
    // A `::` that is simply part of the author's prose.
    return { text: trimmed };
}

/** The warning text for a suspect token. One sentence, names the value, names
 * the fix — the contract every binding warning follows. */
export function suspectWarning(where: string, suspect: string): string {
    return (
        `${where}: “${suspect}” looks like a misconception id but is not one ` +
        `(expected mis.some-topic.some-mistake) — it stayed as feedback text ` +
        `students will read. Fix the id, or ignore this if it really is prose.`
    );
}
