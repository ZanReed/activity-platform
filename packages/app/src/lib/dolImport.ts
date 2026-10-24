// =============================================================================
// dolImport.ts — the DoL section, validated and enumerated at import (D65)
// -----------------------------------------------------------------------------
// docs/design/dol-retake.md: DL-1…DL-5, DL-17, DE-2, DE-6, DE-8, DE-13, DE-17.
//
// The importer marks a `## … {checkpoint dol}` heading's sectionBreak with a
// pending `dol` attr and keeps the DoL's own ```seed fence source aside. This
// post-pass runs once the body is mapped and either FINALIZES that attr into
// the stored SectionDol shape ({ skills, seed?, retake }) or reports a DoL
// PROBLEM. A problem is never a skipped line: a DoL whose item→skill mapping
// or parallel form is wrong would record wrong passes, so the batch importer
// skips the file in every run (ImportResult.dolProblems), strict or not.
//
// THE SEED (DL-3/DL-4). The fence uses the BANK grammar (derived `name: =`,
// `where dol: …`), parsed by parseBankSeedFence and enumerated by
// enumerateTemplate — the same code a bank template goes through, so the
// curriculum side's check_bank.py and this importer agree on what a row is.
// Enumeration is per GROUP of linked variables (a derived variable links to
// its sources; a predicate links every name it uses), never one cross
// product: the sample's two items are 252 + 120 combinations as groups and
// 30,240 jointly. Each group is capped at DOL_ROWS_STORED valid rows (DE-17),
// a deterministic even-spaced sample, so the cached template stays small.
//
// THE RETAKE (DL-5, DE-8, DE-13) is decided here, once, and stored: a second
// attempt is offered only when a DoL seed variable reaches the PRIMARY block
// (the first gradable one) and some group it uses has two or more rows. A
// retake that re-asks identical numbers measures memory, not the skill.
// =============================================================================

import type { JSONContent } from '@tiptap/core';
import { isGradeable, type Block, type SectionDol } from '@activity/schema';
import type { BankValueTable } from '@activity/schema/bank-seed';
import { freeVariables } from '@activity/graph-kit/scorers';
import { tiptapBlockToActivity } from './serialize';
import { enumerateTemplate, parseBankSeedFence, type ParsedBankSeed } from './bankSeed';

/** The most valid rows one group stores (DE-17). */
export const DOL_ROWS_STORED = 500;

/** The DoL grammar as published to the curriculum side (capability facts,
 *  prose_facts.dol_grammar): what their lint checks a draft against. Every
 *  entry is asserted against the parser in capabilityFacts.test.ts. */
export const DOL_GRAMMAR = {
    heading_marker: '{checkpoint dol}',
    meta_keys: ['dol_skills', 'dol_rubric_levels'],
    where_spelling: 'where dol:',
    math_reference: '\\seed{name}',
    rows_stored_per_group: DOL_ROWS_STORED,
} as const;

/** The pending marker mapHeading puts on a `{checkpoint dol}` sectionBreak. */
export const DOL_PENDING = { pending: true } as const;

export interface DolImportInput {
    /** The top-level body nodes (sectionBreaks and blocks), mutated in place. */
    readonly blocks: JSONContent[];
    /** `dol_skills:` from the meta fence. */
    readonly skills?: readonly string[];
    /** `dol_rubric_levels:` from the meta fence. */
    readonly rubricLevels?: readonly string[];
    /** `skill:` from the meta fence. */
    readonly primarySkill?: string;
    /** The DoL section's own ```seed fence source, when it has one. */
    readonly seedSrc?: string;
    /** Activity-level seed variable names (meta.seedVars). */
    readonly activityVars: ReadonlySet<string>;
}

export interface DolImportResult {
    /** Hard problems: the batch importer skips the file in every run. */
    readonly problems: string[];
    /** Soft notes (warnings; --strict fails on them). */
    readonly warnings: string[];
    /** Names declared by the DoL's seed (empty when unseeded). */
    readonly dolVars: ReadonlySet<string>;
    /** Indices into `blocks` that belong to the DoL section (exclusive of its break). */
    readonly dolRange: readonly [number, number] | null;
}

const BRACE = /\{([a-z][a-z0-9_]*)\}/g;
const SEED_MACRO = /\\seed\{([a-z][a-z0-9_]*)\}/g;

/** Every seed-variable name a subtree references: `{name}` in prose,
 *  `\seed{name}` in latex, free names in blank answers / acceptable answers /
 *  mistake matchers, and a data plot's `dataVar`. Reads both the Tiptap shape
 *  (a blank's fields under `attrs`) and the schema shape (flat). */
export function collectSeedRefs(node: unknown, into: Set<string> = new Set()): Set<string> {
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
        if (blank) {
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

/** The gradable blocks in a list of top-level nodes, each with the node it
 *  came from (so a ref walk can be scoped to one item). */
function gradableItems(nodes: readonly JSONContent[]): { block: Block; node: JSONContent }[] {
    const out: { block: Block; node: JSONContent }[] = [];
    const walk = (node: JSONContent): void => {
        const block = tiptapBlockToActivity(node);
        if (block) {
            if (isGradeable(block)) out.push({ block, node });
            return;
        }
        for (const child of node.content ?? []) walk(child);
    };
    nodes.forEach(walk);
    return out;
}

/** Connected components of the DoL's variables: a derived variable links to
 *  its sources, a `where dol:` predicate links every name it uses. */
function variableGroups(seed: ParsedBankSeed, vars: ReadonlySet<string>): string[][] {
    const parent = new Map<string, string>();
    for (const v of vars) parent.set(v, v);
    const find = (v: string): string => {
        let r = v;
        while (parent.get(r) !== r) r = parent.get(r)!;
        parent.set(v, r);
        return r;
    };
    const union = (a: string, b: string): void => {
        if (!parent.has(a) || !parent.has(b)) return;
        parent.set(find(a), find(b));
    };
    for (const d of seed.derived) {
        if (!vars.has(d.name)) continue;
        for (const s of d.expr.names) union(d.name, s);
    }
    for (const w of seed.wheres) {
        const names = w.predicate.names.filter((n) => vars.has(n));
        for (let i = 1; i < names.length; i++) union(names[0]!, names[i]!);
    }
    const groups = new Map<string, string[]>();
    for (const v of vars) {
        const r = find(v);
        groups.set(r, [...(groups.get(r) ?? []), v]);
    }
    return [...groups.values()].map((g) => g.sort());
}

/** Keep at most DOL_ROWS_STORED rows, evenly spaced, deterministic (DE-17). */
export function capRows(table: BankValueTable): BankValueTable {
    const n = table.rows.length;
    if (n <= DOL_ROWS_STORED) return table;
    const rows: number[][] = [];
    for (let i = 0; i < DOL_ROWS_STORED; i++) rows.push(table.rows[Math.floor((i * n) / DOL_ROWS_STORED)]!);
    return { ...table, rows };
}

/** Finalize the DoL section in `blocks` (see the file header). */
export function finalizeDol(input: DolImportInput): DolImportResult {
    const problems: string[] = [];
    const warnings: string[] = [];
    const { blocks } = input;
    const empty: DolImportResult = { problems, warnings, dolVars: new Set(), dolRange: null };

    const marks = blocks
        .map((b, i) => ({ b, i }))
        .filter(({ b }) => b.type === 'sectionBreak' && b.attrs?.dol != null);
    if (marks.length === 0) {
        if (input.skills) warnings.push('DoL: `dol_skills:` is set but no section is marked `{checkpoint dol}`.');
        if (input.seedSrc !== undefined) problems.push('DoL: a DoL seed fence was found but no section is marked `{checkpoint dol}`.');
        return empty;
    }
    if (marks.length > 1) {
        problems.push(`DoL: ${marks.length} sections are marked \`{checkpoint dol}\` — an activity has at most one DoL.`);
        return empty;
    }
    const breakIndex = marks[0]!.i;
    const breakNode = marks[0]!.b;
    let end = blocks.length;
    for (let i = breakIndex + 1; i < blocks.length; i++) {
        if (blocks[i]!.type === 'sectionBreak') {
            end = i;
            break;
        }
    }
    const dolNodes = blocks.slice(breakIndex + 1, end);
    const outsideNodes = [...blocks.slice(0, breakIndex), ...blocks.slice(end)];
    const range: [number, number] = [breakIndex + 1, end];

    // ---- skills + item count (DL-1, DL-2) -----------------------------------
    const skills = input.skills ? [...input.skills] : [];
    if (skills.length === 0) {
        problems.push('DoL: the `{checkpoint dol}` section needs a `dol_skills:` line in the meta fence (primary skill first).');
    } else if (input.primarySkill && skills[0] !== input.primarySkill) {
        problems.push(`DoL: \`dol_skills:\` starts with “${skills[0]}”, but \`skill:\` is “${input.primarySkill}” — the first DoL skill is the primary item’s, and must be the activity’s skill.`);
    }
    const items = gradableItems(dolNodes);
    if (skills.length > 0 && items.length !== skills.length) {
        problems.push(`DoL: the DoL section has ${items.length} gradable item${items.length === 1 ? '' : 's'}, but \`dol_skills:\` names ${skills.length} — one item per skill, in order (DL-2).`);
    }

    // ---- rubric levels (DL-11) ----------------------------------------------
    const primary = items[0];
    if (input.rubricLevels && input.rubricLevels.length > 0) {
        const criteria = (primary?.node.attrs?.rubric as { criteria?: Array<Record<string, unknown>> } | null | undefined)
            ?.criteria;
        if (!primary || !Array.isArray(criteria)) {
            problems.push('DoL: `dol_rubric_levels:` is set, but the primary item has no rubric.');
        } else if (criteria.length !== input.rubricLevels.length) {
            problems.push(`DoL: \`dol_rubric_levels:\` names ${input.rubricLevels.length} level${input.rubricLevels.length === 1 ? '' : 's'}, but the primary item’s rubric has ${criteria.length} line${criteria.length === 1 ? '' : 's'}.`);
        } else {
            primary.node.attrs = {
                ...primary.node.attrs,
                rubric: { criteria: criteria.map((c, i) => ({ ...c, level: input.rubricLevels![i] })) },
            };
        }
    }

    // ---- the seed (DL-3, DL-4, DE-6, DE-8, DE-13, DE-17) ----------------------
    const dolRefs = collectSeedRefs(dolNodes);
    const outsideRefs = collectSeedRefs(outsideNodes);
    let tables: BankValueTable[] | undefined;
    let retake = false;
    let dolVars = new Set<string>();

    const seed = input.seedSrc !== undefined ? parseBankSeedFence(input.seedSrc) : null;
    if (seed) dolVars = new Set([...seed.drawn.keys(), ...seed.derived.map((d) => d.name)]);
    for (const name of dolRefs) {
        if (input.activityVars.has(name) && !dolVars.has(name)) {
            problems.push(`DoL: {${name}} is an activity-level seed variable used inside the DoL — it would not redraw on a retake. Declare the DoL’s numbers in a \`\`\`seed fence inside the DoL section (DL-4).`);
        } else if (seed && !dolVars.has(name)) {
            problems.push(`DoL: {${name}} isn’t declared in the DoL’s \`\`\`seed fence.`);
        }
    }

    if (seed) {
        problems.push(...seed.problems.map((p) => `DoL ${p}`));
        for (const w of seed.wheres) {
            if (w.scope !== 'dol') {
                problems.push(`DoL seed: \`where ${w.scope}:\` — in a DoL the only spelling is \`where dol:\`.`);
            }
        }
        for (const name of dolVars) {
            if (input.activityVars.has(name)) {
                problems.push(`DoL seed: “${name}” is also an activity-level seed variable — a DoL variable may not reuse an activity variable’s name (DE-6).`);
            }
            if (outsideRefs.has(name)) {
                problems.push(`DoL seed: “${name}” is used outside the DoL section — a DoL variable belongs to the DoL only (DL-4).`);
            }
        }
        for (const name of dolVars) {
            if (!dolRefs.has(name) && !seed.derived.some((d) => d.expr.names.includes(name)) &&
                !seed.wheres.some((w) => w.predicate.names.includes(name))) {
                warnings.push(`DoL seed: “${name}” is declared but nothing references it.`);
            }
        }
        if (problems.length === 0) {
            // The used set: every referenced DoL variable plus, transitively,
            // a derived variable's sources (the bank rule, templateVariables).
            const derivedBy = new Map(seed.derived.map((d) => [d.name, d]));
            const used = new Set<string>();
            const add = (n: string): void => {
                if (!dolVars.has(n) || used.has(n)) return;
                used.add(n);
                for (const s of derivedBy.get(n)?.expr.names ?? []) add(s);
            };
            dolRefs.forEach(add);
            for (const w of seed.wheres) {
                const stray = w.predicate.names.filter((n) => !used.has(n));
                if (stray.length > 0) {
                    problems.push(`DoL seed: where dol: ${w.predicate.source} uses ${stray.join(', ')}, which no DoL item uses.`);
                }
            }
            const groups = problems.length === 0 ? variableGroups(seed, used) : [];
            const built: BankValueTable[] = [];
            const groupOf = new Map<string, number>();
            for (const group of groups) {
                const groupSet = new Set(group);
                const sub: ParsedBankSeed = {
                    drawn: new Map([...seed.drawn].filter(([n]) => groupSet.has(n))),
                    derived: seed.derived.filter((d) => groupSet.has(d.name)),
                    wheres: seed.wheres.filter((w) => w.predicate.names.every((n) => groupSet.has(n))),
                    problems: [],
                };
                const r = enumerateTemplate(sub, 'dol', groupSet);
                if (!r.ok) {
                    problems.push(...r.problems.map((p) => `DoL seed: ${p}`));
                    continue;
                }
                group.forEach((n) => groupOf.set(n, built.length));
                built.push(capRows(r.table));
            }
            if (problems.length === 0 && built.length > 0) {
                tables = built;
                // DE-8 + DE-13: the primary block must use a DoL variable whose
                // group can produce a different row.
                const primaryRefs = primary ? collectSeedRefs(primary.node) : new Set<string>();
                retake = [...primaryRefs].some((n) => {
                    const g = groupOf.get(n);
                    return g !== undefined && built[g]!.rows.length >= 2;
                });
                if (!retake) {
                    warnings.push('DoL: no retake — the primary item uses no DoL seed variable with two or more valid values, so a second attempt would re-ask the same numbers (DE-8, DE-13).');
                }
            }
        }
    } else if (problems.length === 0) {
        warnings.push('DoL: the DoL has no ```seed fence, so it has no parallel form — one attempt, no retake (DL-5).');
    }

    if (problems.length > 0) return { ...empty, dolVars, dolRange: range };

    const dol: SectionDol = { skills, retake, ...(tables ? { seed: { tables } } : {}) };
    breakNode.attrs = { ...breakNode.attrs, dol };
    return { problems, warnings, dolVars, dolRange: range };
}

