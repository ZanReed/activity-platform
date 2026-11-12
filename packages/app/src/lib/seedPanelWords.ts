// =============================================================================
// seedPanelWords.ts — the settings drawer's seeded-variable panel, in words
// -----------------------------------------------------------------------------
// The panel (components/SeedVarsPanel.tsx) checks with seedRules.ts, the same
// functions the ```seed importer uses. This file turns those findings into the
// panel's words, and turns the panel's text fields into a declaration.
// =============================================================================

import type { SeedVar, SeedVarSpec } from '@activity/schema';
import type { SeedReferenceFindings, SeedVarProblem } from './seedRules';
import { seedVarProblems } from './seedRules';

export type SeedKind = SeedVarSpec['kind'];

/** One row of the panel, as typed. */
export interface SeedRowDraft {
    name: string;
    kind: SeedKind;
    min: string;
    max: string;
    n: string;
    values: string;
}

export function rowFromVar(v: SeedVar): SeedRowDraft {
    const spec = v.spec;
    return {
        name: v.name,
        kind: spec.kind,
        min: spec.kind === 'list' ? '' : String(spec.min),
        max: spec.kind === 'list' ? '' : String(spec.max),
        n: spec.kind === 'sample' ? String(spec.n) : '',
        values: spec.kind === 'list' ? spec.values.join(', ') : '',
    };
}

const whole = (text: string): number => (/^-?\d+$/.test(text.trim()) ? Number(text.trim()) : Number.NaN);

function specOf(row: SeedRowDraft): SeedVarSpec {
    if (row.kind === 'list') {
        const parts = row.values.split(',').map((v) => v.trim());
        return { kind: 'list', values: parts.map((v) => (v === '' ? Number.NaN : Number(v))) };
    }
    if (row.kind === 'sample') return { kind: 'sample', n: whole(row.n), min: whole(row.min), max: whole(row.max) };
    return { kind: 'int', min: whole(row.min), max: whole(row.max) };
}

export function problemText(name: string, problem: SeedVarProblem): string {
    switch (problem.code) {
        case 'name-shape':
            return 'A name uses lowercase letters, digits and _, and starts with a letter.';
        case 'name-reserved':
            return `“${name}” is taken by maths (a constant or function, or x and y). Pick another name.`;
        case 'name-duplicate':
            return `Another variable is already called “${name}”.`;
        case 'range-order':
            return 'The lowest and highest values must be whole numbers, lowest first.';
        case 'sample-too-many':
            return Number.isFinite(problem.n) && problem.n >= 1
                ? `It asks for ${problem.n} different numbers, but that range only holds ${problem.range}.`
                : 'How many numbers must be a whole number, 1 or more.';
        case 'list-not-numbers':
            return 'Every value in the list must be a number, separated by commas.';
    }
}

/** Every row as declarations, or each row's problems (indexed like the rows). */
export function readRows(rows: readonly SeedRowDraft[]): { vars: SeedVar[] | null; problems: string[][] } {
    const problems = rows.map((row, i) => {
        const others = rows.filter((_, j) => j < i).map((r) => r.name.trim());
        const name = row.name.trim();
        return seedVarProblems(name, specOf(row), others).map((p) => problemText(name, p));
    });
    if (problems.some((p) => p.length > 0)) return { vars: null, problems };
    return { vars: rows.map((row) => ({ name: row.name.trim(), spec: specOf(row) })), problems };
}

/** The reference checks, for a teacher reading the panel. */
export function findingsText(f: SeedReferenceFindings, declaredCount: number): string[] {
    const out: string[] = [];
    for (const name of f.undeclaredText) {
        out.push(
            declaredCount === 0
                ? `The activity has {${name}}, but no variables yet: students would see the braces. Add a variable called “${name}”, or remove the braces.`
                : `{${name}} is in the activity, but there's no variable called “${name}”: students would see the braces.`,
        );
    }
    if (declaredCount === 0) return out;
    for (const name of f.undeclaredData) out.push(`A data plot draws from “${name}”, but there's no variable with that name.`);
    for (const name of f.bareInMaths) {
        out.push(`{${name}} is inside maths, where students would see the letter. Write \\seed{${name}} there instead.`);
    }
    for (const name of f.unused) out.push(`“${name}” isn't used anywhere yet.`);
    for (const match of f.literalMatchers) {
        out.push(
            `A mistake on a seeded blank matches the fixed number “${match}”. Write it with the variables (like a+p) so it fits each student's numbers.`,
        );
    }
    return out;
}

/** The first unused, unreserved one-letter name, for "Add a variable". */
export function suggestName(taken: readonly string[]): string {
    for (const letter of 'abcdfghjklmnpqrsuvwz') {
        if (!taken.includes(letter) && seedVarProblems(letter, { kind: 'int', min: 1, max: 10 }, taken).length === 0) return letter;
    }
    let i = 1;
    while (taken.includes(`v${i}`)) i++;
    return `v${i}`;
}
