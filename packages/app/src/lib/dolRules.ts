// =============================================================================
// dolRules.ts — what makes a DoL section well-formed (D65; GUI amendment
// 2026-11-12, D-1…D-7)
// -----------------------------------------------------------------------------
// Two writers mark a DoL: the importer (`{checkpoint dol}` + `dol_skills:`,
// dolImport.ts) and the section break's DoL panel (DolPanel.tsx). Both check
// with THESE functions, as seedRules.ts does for seeded variables, and word the
// findings for their own reader.
//
// The retake rule (DE-8, DE-13) also runs on every save (serialize.ts →
// stampDolRetake): an edit that takes the seeded numbers out of the primary
// item must not leave a retake that re-asks the same numbers.
// =============================================================================

import { isGradeable, type Block, type Section } from '@activity/schema';
import type { BankValueTable } from '@activity/schema/bank-seed';
// seedReferences, not freeVariables: `g(p*x - q)` refers to `g` (it is a
// product under form grading's tokenizer, and bindSeedNames binds it).
import { seedReferences as freeVariables } from '@activity/graph-kit/scorers';

const BRACE = /\{([a-z][a-z0-9_]*)\}/g;
const SEED_MACRO = /\\seed\{([a-z][a-z0-9_]*)\}/g;

/** Every seed-variable name a subtree references: `{name}` in prose,
 *  `\seed{name}` in latex, free names in blank answers / acceptable answers /
 *  mistake matchers, and a data plot's `dataVar`. Reads both the Tiptap shape
 *  (a blank's fields under `attrs`) and the schema shape (flat).
 *
 *  `skipTextBlanks` leaves out a TEXT blank's answers. There a bare word is
 *  either a declared name or the literal answer ({{no | !yes}}):
 *  resolveSeededEntry only binds names the seed declares, and an unbound word
 *  grades as itself. So a text blank's word can't be called undeclared. */
export function collectSeedRefs(
    node: unknown,
    into: Set<string> = new Set(),
    { skipTextBlanks = false }: { skipTextBlanks?: boolean } = {},
): Set<string> {
    const exprOf = (s: unknown): void => {
        if (typeof s === 'string') for (const v of freeVariables(s)) into.add(v);
    };
    const visit = (n: unknown): void => {
        if (Array.isArray(n)) {
            n.forEach(visit);
            return;
        }
        if (n === null || typeof n !== 'object') return;
        const o = n as Record<string, unknown>;
        if (o.type === 'text' && typeof o.text === 'string') {
            for (const m of o.text.matchAll(BRACE)) into.add(m[1]!);
        }
        if (typeof o.latex === 'string') {
            for (const m of o.latex.matchAll(SEED_MACRO)) into.add(m[1]!);
        }
        if (typeof o.dataVar === 'string') into.add(o.dataVar);
        const blank = o.type === 'blank' ? ((o.attrs as Record<string, unknown> | undefined) ?? o) : null;
        // A blank with no answerType is a text blank (blankSyntax's default).
        const isText = blank !== null && (blank.answerType === undefined || blank.answerType === 'text');
        if (blank && !(skipTextBlanks && isText)) {
            exprOf(blank.answer);
            if (Array.isArray(blank.acceptableAnswers)) blank.acceptableAnswers.forEach(exprOf);
            if (Array.isArray(blank.mistakeFeedback)) {
                for (const m of blank.mistakeFeedback as Array<{ match?: unknown }>) {
                    if (typeof m.match === 'string' && !/^unit-(missing|wrong)$/.test(m.match.trim())) {
                        exprOf(m.match);
                    }
                }
            }
        }
        for (const v of Object.values(o)) if (v !== null && typeof v === 'object') visit(v);
    };
    visit(node);
    return into;
}

/**
 * The retake rule (DE-8 + DE-13): a second attempt is offered only when the
 * primary item uses a DoL variable whose group (table) holds two or more rows.
 * A retake that re-asks identical numbers measures memory, not the skill.
 */
export function dolRetakeFrom(tables: readonly BankValueTable[] | undefined, primaryRefs: ReadonlySet<string>): boolean {
    if (!tables) return false;
    return tables.some((t) => t.rows.length >= 2 && t.columns.some((c) => primaryRefs.has(c)));
}

/** A stored section's DoL items: its gradable blocks, in document order (DL-2). */
export function dolItems(section: Pick<Section, 'rows'>): Block[] {
    const out: Block[] = [];
    for (const row of section.rows) {
        for (const column of row.columns) {
            for (const block of column.blocks) if (isGradeable(block)) out.push(block);
        }
    }
    return out;
}

/**
 * Recompute each DoL section's `retake` from what is on the page now (save
 * path). Mutates in place, like stampVideoStaleness.
 */
export function stampDolRetake(sections: Section[]): void {
    for (const section of sections) {
        if (!section.dol) continue;
        const primary = dolItems(section)[0];
        section.dol.retake = dolRetakeFrom(section.dol.seed?.tables, primary ? collectSeedRefs(primary) : new Set());
    }
}

/**
 * Activity-level seed variables used inside the DoL (DL-4). The server fills a
 * DoL section from the DoL's own numbers only, so such a `{a}` reaches the
 * student as braces and its blank grades against nothing. The importer refuses
 * the file; the editor's panel reports it.
 */
export function activityVarsInDol(
    sectionRefs: ReadonlySet<string>,
    activityNames: readonly string[],
    dolTables: readonly BankValueTable[] | undefined,
): string[] {
    const own = new Set((dolTables ?? []).flatMap((t) => t.columns));
    return activityNames.filter((n) => sectionRefs.has(n) && !own.has(n));
}

export type DolShapeProblem =
    | { code: 'no-skills' }
    | { code: 'first-skill'; first: string; primary: string }
    | { code: 'item-count'; items: number; skills: number };

/** The DoL's skill list against its items (DL-1, DL-2). `primarySkill` is the
 *  activity's catalogue skill, when it has one. */
export function dolShapeProblems(
    skills: readonly string[],
    itemCount: number,
    primarySkill?: string,
): DolShapeProblem[] {
    const problems: DolShapeProblem[] = [];
    if (skills.length === 0) return [{ code: 'no-skills' }];
    if (primarySkill && skills[0] !== primarySkill) {
        problems.push({ code: 'first-skill', first: skills[0]!, primary: primarySkill });
    }
    if (itemCount !== skills.length) problems.push({ code: 'item-count', items: itemCount, skills: skills.length });
    return problems;
}
