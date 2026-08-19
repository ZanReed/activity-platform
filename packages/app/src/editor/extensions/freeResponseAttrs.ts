// ============================================================================
// freeResponseAttrs — the `answer` + `solution` attr pair shared by the
// ShortAnswer and Essay nodes (answer-key slice, rulings E2 + E4).
//
// Declared ONCE, in one place, on purpose. E4 ruled the two blocks gain these
// fields in the SAME schema round rather than one at a time, and two hand-typed
// copies of an attr definition are exactly how "the same round" decays into
// "these two blocks used to agree". The schema mirrors the choice with a shared
// `answerFields` spread; this is its editor-side twin.
//
// Both are OPAQUE JSON here — canonical InlineNode[] as the schema models it —
// following the `rubric` attr's established pattern: the node stores it, the
// DOM round-trips it through a data-* attribute (so copy/paste between editors
// and Tiptap's own HTML serialization keep it), and serialize.ts Zod-sanitizes
// it on the way to the schema. Nothing in the editor mutates them: E10 ships
// read-only display, and the author's editing surface is the .md file the batch
// importer re-imports.
//
// A malformed JSON attr parses to null rather than throwing — a hand-edited or
// truncated data-* attribute costs the field, never the whole document parse.
// ============================================================================

/** One opaque-JSON attribute round-tripping to a `data-*` name. */
function jsonAttr(attrName: string, domName: string) {
    return {
        default: null as unknown,
        parseHTML: (element: HTMLElement) => {
            const raw = element.getAttribute(domName);
            if (!raw) return null;
            try {
                return JSON.parse(raw);
            } catch {
                return null;
            }
        },
        renderHTML: (attributes: Record<string, unknown>) =>
            attributes[attrName]
                ? { [domName]: JSON.stringify(attributes[attrName]) }
                : {},
    };
}

/** Spread into a free-response node's addAttributes() return value. */
export function answerFieldAttrs() {
    return {
        // The canonical answer / marking guide. Teacher-only on every channel —
        // the viewer's registry strips it from anything a student is served.
        answer: jsonAttr('answer', 'data-answer'),
        // The post-check explanation, released by the check response like every
        // other block's `solution`.
        solution: jsonAttr('solution', 'data-solution'),
    };
}
