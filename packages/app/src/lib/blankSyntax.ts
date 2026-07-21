// =============================================================================
// blankSyntax.ts — the shared {{…}} fill-in-the-blank grammar
// -----------------------------------------------------------------------------
// ONE parser for a blank's brace contents, consumed by BOTH authoring paths:
//   - the markdown importer (markdownToTiptap.ts → makeBlank), and
//   - the editor's live input rule (editor/extensions/Blank.ts).
// Pure string work — no ctx, no editor schema, no markdown-it — so the sigil
// grammar can't drift between the two paths: typing `{{~3}}` / `{{==2a}}` /
// `{{Paris | ?hint | !Lyon :: msg}}` in the editor now behaves identically to
// pasting it through the importer. Before this, the editor input rule only
// understood `{{answer|alt}}` and stored `~`/`=`/`?`/`!` as literal text.
// =============================================================================

// Trailing tolerance clause on a numeric blank's answer: "3.14 +- 0.01" or
// "3.14 ± 0.01". The answer part is non-greedy so the LAST +-/± wins only
// when followed by a bare number at the end.
export const TOLERANCE_RE = /^(.*?)\s*(?:±|\+-)\s*(\d*\.?\d+)$/;

// The parsed shape of a blank's brace contents, BEFORE any Tiptap/inline
// construction. Pure string work so it unit-tests without a ctx or the editor
// schema. Each consumer turns it into a node its own way (the importer resolves
// `$math$` in hint/feedback via inlineSchemaContent; the editor stores plain
// text via blankAttrsFromSpec). Null canonical (empty answer) means "not a
// valid blank" → the caller keeps the `{{…}}` sentinel as literal text.
export interface BlankSpec {
    canonical: string;
    answerType: 'text' | 'numeric' | 'math';
    tolerance?: number;
    interchangeableWithPrevious: boolean;
    acceptableAnswers: string[];
    // Raw hint text (each consumer builds the InlineNode[] its own way).
    hint: string | null;
    // Anticipated wrong answers paired with raw feedback text.
    mistakes: { match: string; feedbackText: string }[];
    // Human-readable notes about anything ambiguous/dropped (missing `::`,
    // empty match/feedback, a second hint). The importer routes these to
    // ctx.warnings so a fill_in_blank surfaces authoring mistakes the way ```mc
    // already does; the editor input rule (which has no warning surface) simply
    // drops the offending segment — parseBlankSpec stays pure by RETURNING the
    // warnings instead of holding a ctx.
    warnings: string[];
}

// Split a blank's `{{answer|…}}` contents into its parts. The first `|`-segment
// (canonRaw) is the answer, carrying optional leading sigils; the rest (altsRaw)
// are pipe-separated segments, each classified by its leading sigil:
//   ~<answer>   canonical: interchangeable with the PREVIOUS blank (grouping)
//   =<answer>   canonical: NUMERIC (0.5 = 1/2 = .50), optional "± tol"/"+- tol"
//   ==<answer>  canonical: MATH expression equivalence (2a ≡ a+a), via graph-kit
//   ?<text>     a HINT (one per blank; a second warns + wins)
//   !<wrong> :: <feedback>   an anticipated-mistake pair (repeatable); the `::`
//               delimiter matches ```mc / ```graph, so a `match` may contain `=`
//   ??<x> / !!<x>   an ESCAPED literal alternate answer beginning "?x"/"!x"
//   <anything else>  an alternate accepted answer
// Segments cannot contain `| { }` (the brace grammar forbids them), so hint /
// feedback text is plain text + $math$ only — a documented authoring limit.
export function parseBlankSpec(
    canonRaw: string,
    altsRaw: string,
): BlankSpec | null {
    const warnings: string[] = [];
    let canonical = canonRaw.trim();
    // A leading ~ marks the blank as interchangeable with the PREVIOUS blank in
    // the same problem — order-independent grouping (e.g. factoring, where
    // (x+2)(x+3) and (x+3)(x+2) are both correct). Strip it from the answer.
    // The renderer ignores the flag on the first blank of a problem (nothing to
    // group with), so a stray ~ on the first blank is harmless.
    let interchangeableWithPrevious = false;
    if (canonical.startsWith('~')) {
        interchangeableWithPrevious = true;
        canonical = canonical.slice(1).trim();
    }
    // Answer-type sigils. `==` (MATH) is checked BEFORE `=` (NUMERIC) so a math
    // blank isn't mis-read as numeric. Numeric takes an optional trailing
    // "± tol" / "+- tol" ({{=3.14 +- 0.01}}); math grades by expression
    // equivalence with no import-time tolerance. Order with ~: tilde first
    // ({{~=3}}, {{~==2a}}).
    let answerType: 'text' | 'numeric' | 'math' = 'text';
    let tolerance: number | undefined;
    if (canonical.startsWith('==')) {
        answerType = 'math';
        canonical = canonical.slice(2).trim();
    } else if (canonical.startsWith('=')) {
        answerType = 'numeric';
        canonical = canonical.slice(1).trim();
        const tolMatch = TOLERANCE_RE.exec(canonical);
        if (tolMatch && tolMatch[1] && tolMatch[1].trim().length > 0) {
            canonical = tolMatch[1].trim();
            tolerance = Number(tolMatch[2]);
        }
    }
    if (canonical.length === 0) return null;

    const acceptableAnswers: string[] = [];
    let hint: string | null = null;
    const mistakes: { match: string; feedbackText: string }[] = [];
    for (const rawSeg of altsRaw.split('|')) {
        const seg = rawSeg.trim();
        if (seg.length === 0) continue;
        // Escape FIRST: `??x` / `!!x` is a literal alternate beginning "?x"/"!x"
        // (drop one sigil), protecting an answer that genuinely starts with the
        // directive characters.
        if (seg.startsWith('??') || seg.startsWith('!!')) {
            acceptableAnswers.push(seg.slice(1));
            continue;
        }
        if (seg.startsWith('?')) {
            const text = seg.slice(1).trim();
            if (text.length === 0) continue; // empty "?" — nothing to show
            if (hint !== null) {
                warnings.push(
                    'Fill-in-the-blank: only one hint (“?…”) per blank — kept the last one.',
                );
            }
            hint = text;
            continue;
        }
        if (seg.startsWith('!')) {
            const body = seg.slice(1);
            const idx = body.indexOf('::');
            if (idx === -1) {
                warnings.push(
                    `Fill-in-the-blank: a mistake hint needs “::” before its feedback (“!wrong :: message”) — “${seg}” was ignored (use “!!” for an answer that starts with “!”).`,
                );
                continue;
            }
            const match = body.slice(0, idx).trim();
            const feedbackText = body.slice(idx + 2).trim();
            if (match.length === 0) {
                warnings.push(
                    'Fill-in-the-blank: a mistake hint needs the wrong answer before “::” — skipped.',
                );
                continue;
            }
            if (feedbackText.length === 0) {
                warnings.push(
                    'Fill-in-the-blank: a mistake hint needs feedback after “::” — skipped.',
                );
                continue;
            }
            mistakes.push({ match, feedbackText });
            continue;
        }
        acceptableAnswers.push(seg);
    }

    return {
        canonical,
        answerType,
        ...(tolerance !== undefined ? { tolerance } : {}),
        interchangeableWithPrevious,
        acceptableAnswers,
        hint,
        mistakes,
        warnings,
    };
}

// A canonical schema text run (marks default to []). Matches what the importer's
// inlineSchemaContent emits for plain text, so serialize/round-trip treat an
// editor-typed hint and a pasted one identically.
type InlineTextNode = { type: 'text'; text: string; marks: [] };
const plainInline = (text: string): InlineTextNode[] => [
    { type: 'text', text, marks: [] },
];

// The editor `blank` node's attrs (minus the fresh id) built from a spec. Hint /
// mistake feedback are stored as PLAIN-TEXT InlineNode[] — the live input rule
// is the fast path; rich formatting (inline math) is added afterwards in the
// blank popover's mini-editor (author decision, 2026-07-21). The markdown
// importer does NOT use this — it builds hint/feedback via inlineSchemaContent,
// which additionally resolves `$math$`.
export interface BlankNodeAttrs {
    answer: string;
    acceptableAnswers: string[];
    interchangeableWithPrevious: boolean;
    answerType: 'text' | 'numeric' | 'math';
    tolerance?: number;
    hint?: InlineTextNode[];
    mistakeFeedback?: { match: string; feedback: InlineTextNode[] }[];
}

export function blankAttrsFromSpec(spec: BlankSpec): BlankNodeAttrs {
    const attrs: BlankNodeAttrs = {
        answer: spec.canonical,
        acceptableAnswers: spec.acceptableAnswers,
        interchangeableWithPrevious: spec.interchangeableWithPrevious,
        answerType: spec.answerType,
        ...(spec.tolerance !== undefined ? { tolerance: spec.tolerance } : {}),
    };
    if (spec.hint) attrs.hint = plainInline(spec.hint);
    if (spec.mistakes.length > 0) {
        attrs.mistakeFeedback = spec.mistakes.map((m) => ({
            match: m.match,
            feedback: plainInline(m.feedbackText),
        }));
    }
    return attrs;
}
