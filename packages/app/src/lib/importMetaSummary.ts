// =============================================================================
// importMetaSummary.ts — say what the ```meta fence actually read
// -----------------------------------------------------------------------------
// The Import dialog's summary line reported blocks, problems and reference-sheet
// blocks, and said NOTHING about the ```meta fence. So a teacher pasting an
// activity whose fence carried course/unit/tags/role saw "Will import 12 blocks"
// and had no way to tell whether the filing metadata was understood, mistyped,
// or silently dropped — the fence's whole value is invisible at exactly the
// moment they could still fix it.
//
// ---- THE SET IS DERIVED, NOT LISTED ----------------------------------------
//
// This repo has paid twice this month for a hand-maintained list that someone
// forgot to join (the renderer's per-type numbering grid; LABELED_BLOCK_TYPES).
// So the fields this reports come from `Object.keys(meta)` — whatever the
// PARSER produced — and never from an array maintained here. LABELS below is a
// presentation nicety with a fallback to the raw key, which means a new fence
// key added by a future slice shows up in this line the day it parses, reading
// slightly awkwardly rather than not at all.
//
// That fallback is the load-bearing part. The failure being designed out is not
// "the label is ugly", it is "the author cannot see that a field landed", and a
// key this module has never heard of still satisfies the second.
// `importMetaSummary.test.ts` pins exactly that with a key that does not exist.
// =============================================================================

import type { ImportedMeta } from './markdownToTiptap';

/**
 * Prettier names for the keys we know about today. NOT the source of truth for
 * WHICH keys are reported — see the header. A key missing from this map is
 * rendered as itself.
 */
const LABELS: Record<string, string> = {
    title: 'title',
    course: 'course',
    unit: 'unit',
    pedagogicalRole: 'role',
    submissionMode: 'submission mode',
    revisionMode: 'revision mode',
    activityType: 'activity type',
    answerFeedback: 'answer feedback',
    calculatorMode: 'calculator',
    workSpace: 'work space',
};

/**
 * One human-readable fragment per field the fence carried, in the parser's own
 * key order.
 *
 *   { title: 'Warm up', tags: ['a','b'] }  →  ['title', '2 tags']
 *
 * `tags` is the one key rendered by COUNT rather than by name: a fence can carry
 * a dozen, and the point of the line is "did the tags land", not "which".
 * Everything else is named, because a single wrong course is the thing an author
 * wants to catch here.
 *
 * Keys whose value is `undefined` are dropped: the parser omits absent keys, but
 * an explicit undefined would otherwise render as a field that landed when it
 * did not.
 */
export function importedMetaFields(meta: ImportedMeta | undefined): string[] {
    if (!meta) return [];

    const fields: string[] = [];
    for (const [key, value] of Object.entries(meta)) {
        if (value === undefined) continue;
        if (key === 'tags') {
            const count = Array.isArray(value) ? value.length : 0;
            if (count === 0) continue;
            fields.push(`${count} tag${count === 1 ? '' : 's'}`);
            continue;
        }
        fields.push(LABELS[key] ?? key);
    }
    return fields;
}

/**
 * The summary-line fragment, or '' when there is no fence.
 *
 *   'meta: title · course · unit · 2 tags · role'
 *
 * A fence that parsed but carried nothing usable still says so — "meta fence
 * read, no fields" is a genuinely different state from "no fence", and it is the
 * state a typo'd fence lands in. Reporting them identically would send the
 * author looking for a problem in the wrong place.
 */
export function importMetaSummary(meta: ImportedMeta | undefined): string {
    if (!meta) return '';
    const fields = importedMetaFields(meta);
    return fields.length > 0
        ? `meta: ${fields.join(' · ')}`
        : 'meta fence read, but no fields recognised';
}
