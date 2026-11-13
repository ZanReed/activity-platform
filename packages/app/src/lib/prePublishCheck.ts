// =============================================================================
// prePublishCheck.ts — what must be fixed before an activity can be published
// (UI review G-2, then group B: docs/design/ui-review-group-b.md B-1 / B-2)
// -----------------------------------------------------------------------------
// A DRAFT may hold questions no student can get right; a published version may
// not. This walks the saved draft (an ActivityDocument) and names each problem
// with a locator the editor can select ("Show me"). Blanks keep their id
// through a save; blocks and sections do NOT (serialize mints fresh ids on
// every call), so those are located by POSITION — the nth block of its type,
// the nth section, in document order, which is the order the editor walks.
//
// Both publish paths run it: the editor's Publish/Republish (usePublish) and
// "Republish changed" (bulkRepublish). Every rule here REFUSES; a graph still
// on its starting answer (B-3) is a separate, softer check.
//
// Kept dependency-light on purpose: bulkRepublish runs on the activities list,
// whose download budget has no room for the maths converter or graph-kit.
// =============================================================================

import { isGradeable, type Block } from '@activity/schema';
import { scanPlaceholders } from './mathPlaceholders';

/** The nth block of a schema type, in document order (0-based). */
export interface BlockRef {
    type: string;
    index: number;
}

export type PublishProblem =
    /** A fill-in blank with no answer (G-2). */
    | { kind: 'empty-blank'; blankId: string }
    /** Multiple choice where no choice is marked correct. */
    | { kind: 'mc-no-correct'; block: BlockRef }
    /** Matching items with no matching option. */
    | { kind: 'match-unmatched'; block: BlockRef; count: number }
    /** Correspondence cells with no matching card. */
    | { kind: 'correspondence-unmatched'; block: BlockRef; count: number }
    /** Maths gaps with no answer. */
    | { kind: 'math-gap-empty'; block: BlockRef; count: number }
    /** A DoL section (by index) with no skills chosen. */
    | { kind: 'dol-no-skills'; section: number }
    /** A DoL section whose skill count doesn't match its question count. */
    | { kind: 'dol-item-count'; section: number; items: number; skills: number };

/** What is wrong, in the teacher's words (the editor prefixes "Q4 · "). */
export function problemText(p: PublishProblem): string {
    switch (p.kind) {
        case 'empty-blank':
            return 'a blank has no answer';
        case 'mc-no-correct':
            return 'no choice is marked correct';
        case 'match-unmatched':
            return p.count === 1 ? '1 item has no match' : `${p.count} items have no match`;
        case 'correspondence-unmatched':
            return p.count === 1 ? '1 cell has no card' : `${p.count} cells have no card`;
        case 'math-gap-empty':
            return p.count === 1 ? 'a maths gap has no answer' : `${p.count} maths gaps have no answer`;
        case 'dol-no-skills':
            return 'the DoL has no skills chosen';
        case 'dol-item-count':
            return `the DoL has ${p.items} question${p.items === 1 ? '' : 's'} but ${p.skills} skill${p.skills === 1 ? '' : 's'}`;
    }
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const ids = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter(isObj).map((x) => x.id).filter((x): x is string => typeof x === 'string') : [];

function blockProblems(block: Obj, ref: BlockRef): PublishProblem[] {
    const out: PublishProblem[] = [];
    if (block.type === 'multiple_choice' && Array.isArray(block.choices) && block.choices.length > 0) {
        if (block.choices.filter(isObj).every((c) => c.correct !== true)) out.push({ kind: 'mc-no-correct', block: ref });
    }
    if (block.type === 'matching') {
        const key = isObj(block.key) ? block.key : {};
        const targets = new Set(ids(block.targets));
        const count = ids(block.items).filter((item) => {
            const t = key[item];
            return typeof t !== 'string' || !targets.has(t);
        }).length;
        if (count > 0) out.push({ kind: 'match-unmatched', block: ref, count });
    }
    if (block.type === 'correspondence') {
        const key = isObj(block.key) ? block.key : {};
        const columns = Array.isArray(block.targetColumns) ? block.targetColumns.filter(isObj) : [];
        let count = 0;
        for (const item of ids(block.items)) {
            const row = isObj(key[item]) ? (key[item] as Obj) : {};
            for (const column of columns) {
                const t = typeof column.id === 'string' ? row[column.id] : undefined;
                if (typeof t !== 'string' || !ids(column.targets).includes(t)) count += 1;
            }
        }
        if (count > 0) out.push({ kind: 'correspondence-unmatched', block: ref, count });
    }
    return out;
}

/** Maths gaps inside `value` with no prompt (answer). */
function emptyMathGaps(value: unknown): number {
    let n = 0;
    const walk = (v: unknown): void => {
        if (Array.isArray(v)) return v.forEach(walk);
        if (!isObj(v)) return;
        if (typeof v.latex === 'string' && v.latex.includes('\\placeholder[')) {
            const answered = new Set(ids(v.prompts));
            n += scanPlaceholders(v.latex).filter((s) => !answered.has(s.id)).length;
        }
        Object.values(v).forEach(walk);
    };
    walk(value);
    return n;
}

function sectionProblems(section: Obj, index: number): PublishProblem[] {
    const dol = section.dol;
    if (!isObj(dol)) return [];
    const skills = Array.isArray(dol.skills) ? dol.skills : [];
    if (skills.length === 0) return [{ kind: 'dol-no-skills', section: index }];
    let items = 0;
    for (const row of Array.isArray(section.rows) ? section.rows.filter(isObj) : []) {
        for (const column of Array.isArray(row.columns) ? row.columns.filter(isObj) : []) {
            for (const block of Array.isArray(column.blocks) ? column.blocks : []) {
                if (isObj(block) && isGradeable(block as unknown as Block)) items += 1;
            }
        }
    }
    return items === skills.length ? [] : [{ kind: 'dol-item-count', section: index, items, skills: skills.length }];
}

/** Every problem in a draft, in document order. Walks the whole JSON, so a
 *  blank or block inside any container (columns, tables, worked steps,
 *  callouts) is found. */
export function findPublishProblems(draft: unknown): PublishProblem[] {
    const problems: PublishProblem[] = [];
    const seen = new Map<string, number>(); // block type → how many so far
    // `inSections`: only the main document's column blocks are counted and
    // checked as blocks — the reference panel and teacher guide hold `blocks`
    // too, but live in separate editors, so counting them would shift every
    // index (Fable review). Blanks are checked everywhere (found by id).
    const walk = (value: unknown, key: string | null, inSections = false): void => {
        if (Array.isArray(value)) {
            value.forEach((v, i) => {
                // An element of a column's `blocks` array is a block: its own
                // rules, plus the maths gaps anywhere inside it. Counted whether
                // or not it has a problem, so the index matches the editor's
                // walk (which counts only nodes whose parent is a column).
                if (inSections && key === 'blocks' && isObj(v) && typeof v.type === 'string') {
                    const index = seen.get(v.type) ?? 0;
                    seen.set(v.type, index + 1);
                    const ref: BlockRef = { type: v.type, index };
                    problems.push(...blockProblems(v, ref));
                    const gaps = emptyMathGaps(v);
                    if (gaps > 0) problems.push({ kind: 'math-gap-empty', block: ref, count: gaps });
                }
                if (key === 'sections' && isObj(v)) problems.push(...sectionProblems(v, i));
                walk(v, null, inSections || key === 'sections');
            });
            return;
        }
        if (!isObj(value)) return;
        if (value.type === 'blank' && typeof value.id === 'string' && typeof value.answer === 'string') {
            if (value.answer.trim().length === 0) problems.push({ kind: 'empty-blank', blankId: value.id });
            return;
        }
        for (const [k, v] of Object.entries(value)) walk(v, k, inSections);
    };
    walk(draft, null);
    return problems;
}

/** One line for places that can't list (e.g. "Republish changed"). */
export function publishProblemsSentence(problems: readonly PublishProblem[]): string {
    const n = problems.length;
    if (n === 1) {
        const only = problems[0]!;
        return only.kind === 'empty-blank'
            ? 'A blank has no answer yet, so nothing was published.'
            : `Not published: ${problemText(only)}.`;
    }
    return problems.every((p) => p.kind === 'empty-blank')
        ? `${n} blanks have no answer yet, so nothing was published.`
        : `Not published: ${n} questions need fixing first.`;
}
