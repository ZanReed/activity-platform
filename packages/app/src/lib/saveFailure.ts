// =============================================================================
// saveFailure.ts — say WHERE a save stopped (review C7, 2026-11-28)
// -----------------------------------------------------------------------------
// The editor validates its own document before every save. When that fails,
// every autosave fails the same way until the cause is fixed, so "Document
// failed validation; not saved." left a teacher with a document that would not
// save and no way to find out why. Zod already knows the path; this turns its
// first issue into the place a teacher can see ("the 2nd Multiple choice in
// Section 2"), and keeps the raw path + message for a "Details" disclosure, the
// same split LoadStatus makes (plain words first, the technical words behind
// Details; review C5).
//
// The load path's describeParseFailure (routes/ActivityEditor.tsx) is the
// sibling for a STORED document; it reports the raw path because nothing can
// be edited yet. Here the document is open, so the place is named in the
// editor's own terms.
// =============================================================================

import { ActivityDocument } from '@activity/schema';
import { BLOCK_NAMES } from './analyticsLabels';
import { PermanentSaveError } from './useAutosave';

type Path = readonly (string | number)[];
interface Issue {
    path: Path;
    message: string;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const at = (v: unknown, k: string | number): unknown =>
    isRecord(v) ? (v as Record<string | number, unknown>)[k] : Array.isArray(v) ? v[k as number] : undefined;

const typeOf = (block: unknown): string | null =>
    isRecord(block) && typeof block.type === 'string' ? block.type : null;
const typeName = (type: string): string => BLOCK_NAMES[type] ?? type.replace(/_/g, ' ');

function ordinal(n: number): string {
    const tens = n % 100;
    if (tens >= 11 && tens <= 13) return `${n}th`;
    return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/**
 * "the 2nd Multiple choice" (or "the Multiple choice" when it is the only
 * one): the block's place among blocks of ITS TYPE, in document order. Not
 * "block 4": the saved document leaves out things the editor still shows (an
 * image with no picture yet, an unfinished video or chart, an empty column),
 * so a plain count can be off by one from what the teacher sees, and the
 * editor numbers nothing a teacher could count against. Its type is never
 * one of those, so counting its own type is exact (Fable review, 2026-11-28;
 * the convention prePublishCheck.ts already locates by).
 */
function nthOfType(blocks: readonly unknown[], index: number): string {
    const type = typeOf(blocks[index]);
    if (!type) return 'a block';
    const same = blocks.filter((b) => typeOf(b) === type);
    const nth = blocks.slice(0, index).filter((b) => typeOf(b) === type).length + 1;
    return same.length > 1 ? `the ${ordinal(nth)} ${typeName(type)}` : `the ${typeName(type)}`;
}

/** Every block of a section, row by row and column by column, as drawn. */
function sectionBlocks(section: unknown): unknown[] {
    const out: unknown[] = [];
    const rows = at(section, 'rows');
    for (const row of Array.isArray(rows) ? rows : []) {
        const cols = at(row, 'columns');
        for (const col of Array.isArray(cols) ? cols : []) {
            const blocks = at(col, 'blocks');
            if (Array.isArray(blocks)) out.push(...blocks);
        }
    }
    return out;
}

/** "the 2nd Table in the reference panel" for <area>.blocks.<n>. */
function inList(area: string, list: unknown, rest: Path): string {
    const n = rest[0] === 'blocks' && typeof rest[1] === 'number' ? rest[1] : null;
    if (n === null || !Array.isArray(list)) return area;
    return `${nthOfType(list, n)} in ${area}`;
}

/** Where an issue sits, in the editor's own words. */
export function describeIssuePlace(doc: unknown, path: Path): string {
    const [head, i] = path;
    if (head === 'sections' && typeof i === 'number') {
        const section = at(at(doc, 'sections'), i);
        const title = at(section, 'title');
        const named = typeof title === 'string' && title.trim() ? ` (“${title.trim()}”)` : '';
        const where = `Section ${i + 1}${named}`;
        const [r, ri, c, ci, b, bi] = path.slice(2);
        if (r === 'rows' && typeof ri === 'number' && c === 'columns' && typeof ci === 'number' && b === 'blocks' && typeof bi === 'number') {
            const block = at(at(at(at(at(section, 'rows'), ri), 'columns'), ci), 'blocks');
            const all = sectionBlocks(section);
            const index = all.indexOf(at(block, bi));
            if (index >= 0) return `${nthOfType(all, index)} in ${where}`;
        }
        if (r === 'rows' && typeof ri === 'number') return `row ${ri + 1} of ${where}`;
        return where;
    }
    if (head === 'referencePanel') return inList('the reference panel', at(at(doc, 'referencePanel'), 'blocks'), path.slice(1));
    if (head === 'teacherGuide') return inList('the teacher guide', at(at(doc, 'teacherGuide'), 'blocks'), path.slice(1));
    if (head === 'meta') return path[1] === 'title' ? 'the activity’s title' : 'the activity’s settings';
    if (head === 'calculator') return 'the calculator settings';
    return 'the activity';
}

/** The sentence and the Details text for a document that failed validation. */
export function describeSaveFailure(doc: unknown, issues: readonly Issue[]): { message: string; detail: string } {
    const first = issues[0];
    if (!first) return { message: 'This activity can’t be saved because part of it isn’t valid.', detail: '' };
    const place = describeIssuePlace(doc, first.path);
    const path = first.path.join('.');
    const more = issues.length > 1 ? ` (+${issues.length - 1} more)` : '';
    return {
        message: `This activity can’t be saved: something in ${place} isn’t valid. Fix or remove it and saving starts again.`,
        detail: `${path ? `${path}: ` : ''}${first.message}${more}`,
    };
}

/**
 * The editor's pre-save gate: the parsed document, or a PermanentSaveError
 * that names where it failed. The full issue list goes to the console.
 */
export function validateForSave(doc: unknown): ActivityDocument {
    const parsed = ActivityDocument.safeParse(doc);
    if (parsed.success) return parsed.data;
    console.error('[activity] document failed validation; not saved', parsed.error.issues);
    const { message, detail } = describeSaveFailure(doc, parsed.error.issues);
    throw new PermanentSaveError(message, detail);
}
