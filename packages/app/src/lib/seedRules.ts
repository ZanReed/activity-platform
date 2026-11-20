// =============================================================================
// seedRules.ts — what makes a seeded variable valid, and whether the activity
// uses its variables properly (seeded-data.md; GUI amendment 2026-11-12)
// -----------------------------------------------------------------------------
// Two writers declare variables: the ```seed fence (markdownToTiptap) and the
// settings drawer's panel (SeedVarsPanel). Both check with THESE functions, so
// they can't disagree about a valid declaration or a broken reference. Each
// returns structured findings, and each writer words them for its reader: the
// importer's messages name the fence, the panel's name the fields.
//
// The schema's SeedVars refine stays the last line of defence at save.
// =============================================================================

import type { JSONContent } from '@tiptap/core';
import { RESERVED_SEED_NAMES, type SeedVarSpec } from '@activity/schema';
// seedReferences, not freeVariables: `g(p*x - q)` refers to `g` (it is a
// product under form grading's tokenizer, and bindSeedNames binds it).
import { seedReferences as freeVariables } from '@activity/graph-kit/scorers';

export type SeedVarProblem =
    | { code: 'name-shape' }
    | { code: 'name-reserved' }
    | { code: 'name-duplicate' }
    | { code: 'range-order' }
    | { code: 'sample-too-many'; n: number; range: number }
    | { code: 'list-not-numbers' };

const NAME = /^[a-z][a-z0-9_]*$/;

/**
 * A `list` declaration from its comma-separated text ("1.50, 1.75, 2.25"), the
 * ONE parser both writers use. `values` are the numbers the grader binds;
 * `text` keeps the author's spellings for display ("$1.50", not "$1.5") and is
 * written only when some spelling differs from the number's own String() —
 * so an ordinary list stores exactly what it always did. A part that is not a
 * number is NaN (seedVarProblems words it), and then no `text` is written.
 */
export function listSpecFromText(raw: string): Extract<SeedVarSpec, { kind: 'list' }> {
    const parts = raw.split(',').map((v) => v.trim());
    const values = parts.map((v) => (v === '' ? Number.NaN : Number(v)));
    const spelled = values.every((v) => Number.isFinite(v)) && parts.some((t, i) => t !== String(values[i]));
    return spelled ? { kind: 'list', values, text: parts } : { kind: 'list', values };
}

/** A list declaration back as the text an author edits: their spellings when
 *  stored, else the numbers. */
export function listSpecText(spec: Extract<SeedVarSpec, { kind: 'list' }>): string {
    return (spec.text && spec.text.length === spec.values.length ? spec.text : spec.values.map(String)).join(', ');
}

/** Everything wrong with one declaration. `otherNames` are the activity's other variables. */
export function seedVarProblems(name: string, spec: SeedVarSpec, otherNames: readonly string[]): SeedVarProblem[] {
    const problems: SeedVarProblem[] = [];
    if (!NAME.test(name)) problems.push({ code: 'name-shape' });
    else if (RESERVED_SEED_NAMES.includes(name)) problems.push({ code: 'name-reserved' });
    else if (otherNames.includes(name)) problems.push({ code: 'name-duplicate' });
    if (spec.kind === 'list') {
        if (spec.values.length === 0 || spec.values.some((v) => !Number.isFinite(v))) problems.push({ code: 'list-not-numbers' });
        return problems;
    }
    if (!Number.isInteger(spec.min) || !Number.isInteger(spec.max) || spec.min > spec.max) {
        problems.push({ code: 'range-order' });
        return problems;
    }
    if (spec.kind === 'sample') {
        const range = spec.max - spec.min + 1;
        if (!Number.isInteger(spec.n) || spec.n < 1 || spec.n > range) problems.push({ code: 'sample-too-many', n: spec.n, range });
    }
    return problems;
}

export interface SeedReferenceFindings {
    /** `{name}` in text (or `\seed{name}` in maths) with no declaration. */
    undeclaredText: string[];
    /** `data: {name}` on a data plot with no declaration. */
    undeclaredData: string[];
    /** A declared name as a bare `{name}` inside maths: a brace group, so students see the letter. */
    bareInMaths: string[];
    /** Declared, but nothing references it. */
    unused: string[];
    /** A literal number as a mistake matcher on a seeded blank. */
    literalMatchers: string[];
}

const BRACE = /\{([a-z][a-z0-9_]*)\}/g;
const SEED_MACRO = /\\seed\{([a-z][a-z0-9_]*)\}/g;

/**
 * The D7/R2/R3 cross-checks over a body (Tiptap JSON or the schema shape).
 * `checkUnused` is off for a body with nothing in it: a fence-first paste has
 * nothing to reference FROM, so the check would only punish that order.
 */
export function seedReferenceFindings(
    body: unknown,
    declaredNames: readonly string[],
    checkUnused: boolean,
): SeedReferenceFindings {
    const declared = new Set(declaredNames);
    const braceRefs = new Set<string>();
    const latexRefs = new Set<string>();
    const exprRefs = new Set<string>();
    const dataVarRefs = new Set<string>();
    const literalMatchers: string[] = [];

    const visit = (node: unknown): void => {
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (node === null || typeof node !== 'object') return;
        const obj = node as Record<string, unknown>;
        if (obj.type === 'text' && typeof obj.text === 'string') {
            for (const m of obj.text.matchAll(BRACE)) braceRefs.add(m[1]!);
        }
        if (typeof obj.latex === 'string') {
            // `\seed{name}` is the maths spelling and substitutes at serve; a
            // BARE `{name}` in latex is a brace group and doesn't.
            for (const m of obj.latex.matchAll(SEED_MACRO)) braceRefs.add(m[1]!);
            const bare = obj.latex.replace(SEED_MACRO, '');
            for (const m of bare.matchAll(BRACE)) if (declared.has(m[1]!)) latexRefs.add(m[1]!);
        }
        if (typeof obj.dataVar === 'string') dataVarRefs.add(obj.dataVar);
        // A blank's fields ride under `attrs` in Tiptap JSON, flat in the schema shape.
        const blank = obj.type === 'blank' ? ((obj.attrs as Record<string, unknown> | undefined) ?? obj) : null;
        if (blank && typeof blank.answer === 'string' && declared.size > 0) {
            const entries = [
                blank.answer,
                ...(Array.isArray(blank.acceptableAnswers)
                    ? (blank.acceptableAnswers as unknown[]).filter((a): a is string => typeof a === 'string')
                    : []),
            ];
            const used = new Set<string>();
            for (const entry of entries) {
                for (const v of freeVariables(entry)) {
                    if (declared.has(v)) {
                        used.add(v);
                        exprRefs.add(v);
                    }
                }
            }
            if (used.size > 0 && Array.isArray(blank.mistakeFeedback)) {
                for (const mf of blank.mistakeFeedback as Array<{ match?: unknown }>) {
                    const match = typeof mf.match === 'string' ? mf.match.trim() : '';
                    if (match !== '' && Number.isFinite(Number(match))) literalMatchers.push(match);
                }
            }
        }
        for (const v of Object.values(obj)) visit(v);
    };
    visit(body);

    const referenced = new Set([...braceRefs, ...exprRefs, ...dataVarRefs]);
    return {
        undeclaredText: [...braceRefs].filter((n) => !declared.has(n)),
        undeclaredData: [...dataVarRefs].filter((n) => !declared.has(n)),
        bareInMaths: [...latexRefs],
        unused: checkUnused ? [...declared].filter((n) => !referenced.has(n)) : [],
        literalMatchers,
    };
}

/**
 * An editor document's top-level content, minus any DoL section that carries
 * its own seed (its names are checked against ITS tables, as the importer does).
 */
export function withoutOwnSeedDolSections(content: readonly JSONContent[]): JSONContent[] {
    const out: JSONContent[] = [];
    let skipping = false;
    for (const node of content) {
        if (node.type === 'sectionBreak') {
            const dol = node.attrs?.dol as { seed?: unknown } | null | undefined;
            skipping = Boolean(dol?.seed);
            if (skipping) continue;
        }
        if (!skipping) out.push(node);
    }
    return out;
}

/** One prompt or blank's graded strings: its answer and its acceptable answers. */
function answerStrings(holder: Record<string, unknown>): string[] {
    const out: string[] = [];
    if (typeof holder.answer === 'string') out.push(holder.answer);
    if (Array.isArray(holder.acceptableAnswers)) {
        for (const a of holder.acceptableAnswers) if (typeof a === 'string') out.push(a);
    }
    return out;
}

/**
 * The `sample` variables whose MODE an answer key asks for (2026-11-20). A
 * sample draws DISTINCT values, so every value ties and mode() is always the
 * smallest: the question has no real answer. Single-argument `mode(name)` only,
 * anywhere in the expression (`mode(s) + 1` counts); `mode(a, b)` over listed
 * values is a different question and is left alone.
 *
 * It reads every place a graded seeded expression lives — the same two the
 * grader's seeded-key pass resolves (viewer/src/server/grading/walk.ts): a
 * `blank` (fields under `attrs` in Tiptap JSON, flat in the schema shape) and
 * a math prompt (a `\gap{…}`; a `prompts` array on a math node). Only an
 * activity-level ```seed fence can declare a sample: the DoL and practice-bank
 * fences use the bank grammar, which refuses `sample` outright (BE-5), so the
 * importer's activity path is the one caller.
 */
export function modeOfSampleNames(body: unknown, sampleNames: readonly string[]): string[] {
    if (sampleNames.length === 0) return [];
    const modeOf = new RegExp(`\\bmode\\s*\\(\\s*(${sampleNames.join('|')})\\s*\\)`, 'g');
    const found = new Set<string>();
    const scan = (entries: string[]): void => {
        for (const entry of entries) for (const m of entry.matchAll(modeOf)) found.add(m[1]!);
    };
    const visit = (node: unknown): void => {
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (node === null || typeof node !== 'object') return;
        const obj = node as Record<string, unknown>;
        if (obj.type === 'blank') scan(answerStrings((obj.attrs as Record<string, unknown> | undefined) ?? obj));
        if (Array.isArray(obj.prompts)) {
            for (const p of obj.prompts) if (p !== null && typeof p === 'object') scan(answerStrings(p as Record<string, unknown>));
        }
        for (const v of Object.values(obj)) if (v !== null && typeof v === 'object') visit(v);
    };
    visit(body);
    return [...found];
}

/** The importer's wording for a `modeOfSampleNames` finding (one wording, every caller). */
export function modeOfSampleWarning(name: string): string {
    return `Seed: mode(${name}) has no real answer — a sample’s values are all different, so every value ties and mode is always the smallest. Ask for the median, mean or range instead.`;
}
