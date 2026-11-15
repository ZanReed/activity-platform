// =============================================================================
// findReplace.ts — find and replace in the activity editor (2026-11-15)
// -----------------------------------------------------------------------------
// Two places hold an activity's words:
//   1. the main document's text nodes — found, highlighted, stepped through
//      and replaced one at a time or all at once;
//   2. the rich FIELDS stored in node attrs (answer choices, feedback, hints,
//      matching items …), whose value is inline JSON. Their text is any object
//      `{ type: 'text', text }` in an attr. These are counted and replaced by
//      Replace all; they are not highlighted (each field is its own editor).
//      Plus the plain-string attrs that are prose a student reads, by key
//      (PROSE_KEYS): a worked example's or section's title, alt text, a
//      caption — at any depth, so a choice picture's alt counts too.
// Every other plain-string attr — a blank's accepted answers, LaTeX, graph
// labels (`kind: 'text'`, not `type`), glossary keys — is never touched: they
// are answer keys, maths or ids, not prose (author ruling 2026-11-15: "answer
// fields", not answers). Not reached at all: the activity title (its own
// input, not the document) and vocabulary definitions (mark attrs); the bar
// says so.
//
// A match never spans two text nodes: "Sam" with only "S" bolded is two runs
// and is not found. Same as most editors' find for mixed formatting.
// =============================================================================

import type { Node as PMNode } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';

export interface FindOptions {
    matchCase: boolean;
}

/** A match in the main document, as ProseMirror positions. */
export interface DocMatch {
    from: number;
    to: number;
}

function indexesOf(haystack: string, needle: string, opts: FindOptions): number[] {
    if (needle === '') return [];
    const out: number[] = [];
    if (opts.matchCase) {
        let i = haystack.indexOf(needle);
        while (i !== -1) {
            out.push(i);
            i = haystack.indexOf(needle, i + needle.length);
        }
        return out;
    }
    // Compare slices of the ORIGINAL string: lower-casing the whole text first
    // can change its length ("İ" → "i̇") and shift every offset after it.
    const n = needle.toLowerCase();
    for (let i = 0; i + needle.length <= haystack.length; ) {
        if (haystack.slice(i, i + needle.length).toLowerCase() === n) {
            out.push(i);
            i += needle.length;
        } else i += 1;
    }
    return out;
}

/** Every match in the main document's text, in document order. */
export function findInDoc(doc: PMNode, query: string, opts: FindOptions): DocMatch[] {
    const out: DocMatch[] = [];
    if (query === '') return out;
    doc.descendants((node, pos) => {
        if (!node.isText) return true;
        for (const i of indexesOf(node.text ?? '', query, opts)) {
            out.push({ from: pos + i, to: pos + i + query.length });
        }
        return false;
    });
    return out;
}

function replaceAllIn(text: string, query: string, replacement: string, opts: FindOptions): string {
    const at = indexesOf(text, query, opts);
    if (at.length === 0) return text;
    let result = '';
    let last = 0;
    for (const i of at) {
        result += text.slice(last, i) + replacement;
        last = i + query.length;
    }
    return result + text.slice(last);
}

/**
 * Walk an attr value; count (and, given a replacement, rewrite) the text of
 * every `{ type: 'text', text }` object. Returns the new value (=== the old
 * one when nothing changed) and the match count.
 */
const PROSE_KEYS: ReadonlySet<string> = new Set(['title', 'alt', 'caption', 'stimulusAlt']);

function walkAttr(value: unknown, query: string, opts: FindOptions, replacement: string | null): { value: unknown; count: number } {
    if (Array.isArray(value)) {
        let count = 0;
        let changed = false;
        const next = value.map((v) => {
            const r = walkAttr(v, query, opts, replacement);
            count += r.count;
            if (r.value !== v) changed = true;
            return r.value;
        });
        return { value: changed ? next : value, count };
    }
    if (value && typeof value === 'object') {
        const o = value as Record<string, unknown>;
        if (o.type === 'text' && typeof o.text === 'string') {
            const count = indexesOf(o.text, query, opts).length;
            if (count === 0 || replacement === null) return { value, count };
            return { value: { ...o, text: replaceAllIn(o.text, query, replacement, opts) }, count };
        }
        let count = 0;
        let changed = false;
        const next: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(o)) {
            if (typeof v === 'string') {
                const n = PROSE_KEYS.has(k) ? indexesOf(v, query, opts).length : 0;
                count += n;
                const out = n > 0 && replacement !== null ? replaceAllIn(v, query, replacement, opts) : v;
                if (out !== v) changed = true;
                next[k] = out;
                continue;
            }
            const r = walkAttr(v, query, opts, replacement);
            count += r.count;
            if (r.value !== v) changed = true;
            next[k] = r.value;
        }
        return { value: changed ? next : value, count };
    }
    return { value, count: 0 };
}

/** How many matches sit inside fields (node attrs), across the document. */
export function countInFields(doc: PMNode, query: string, opts: FindOptions): number {
    if (query === '') return 0;
    let count = 0;
    doc.descendants((node) => {
        if (node.isText) return false;
        count += walkAttr(node.attrs, query, opts, null).count;
        return true;
    });
    return count;
}

/**
 * Replace every match — main text and fields — in ONE transaction, so a single
 * undo takes it all back. Returns how many were replaced.
 */
export function replaceAll(
    tr: Transaction,
    query: string,
    replacement: string,
    opts: FindOptions,
): number {
    if (query === '') return 0;
    // Fields first, while positions are the original document's: attrs-only
    // changes (setNodeMarkup) never move a position.
    let fieldCount = 0;
    const edits: { pos: number; attrs: Record<string, unknown> }[] = [];
    tr.doc.descendants((node, pos) => {
        if (node.isText) return false;
        const r = walkAttr(node.attrs, query, opts, replacement);
        if (r.count > 0) {
            fieldCount += r.count;
            edits.push({ pos, attrs: r.value as Record<string, unknown> });
        }
        return true;
    });
    for (const e of edits) {
        const node = tr.doc.nodeAt(e.pos);
        if (node) tr.setNodeMarkup(e.pos, undefined, e.attrs, node.marks);
    }
    // Then text, last match first so earlier positions stay valid.
    const matches = findInDoc(tr.doc, query, opts);
    for (let i = matches.length - 1; i >= 0; i--) {
        const m = matches[i]!;
        if (replacement === '') tr.delete(m.from, m.to);
        else tr.insertText(replacement, m.from, m.to);
    }
    return fieldCount + matches.length;
}
