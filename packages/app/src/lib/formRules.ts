// =============================================================================
// formRules.ts — importer checks for math and form blanks (form-grading.md)
// -----------------------------------------------------------------------------
// The checks that need the math engine, kept out of blankSyntax.ts (which the
// editor's live input rule also imports, and which must stay engine-free):
//
//   mathBlankWarnings — per {{==…}} / {{===…}} blank, at import:
//     · a form key that won't parse (it could never be matched);
//     · a bare `e` inside a letter run (FG-3: `e` stays Euler's number);
//     · two `!` entries that now match the same answers (FG-4: matching is by
//       meaning, so the second is dead), and a `!` entry the key itself
//       satisfies (it can never fire).
//   formSeedFindings — FG-6, over every stored seed row of a bank template or
//     a DoL group: REFUSE a row whose form key won't parse; WARN where a row's
//     key collapses a bracket (`q = 0` → `6(3x)`), where a factorise key's
//     outer factor folds to 1 (`g = 1`), or where its bracket's coefficients
//     still share a factor (gcd > 1, the key itself "not highest"); and where a
//     declared single-letter seed name in a form key also appears as a bare
//     letter in the item's maths (FG-3: it is bound there too, silently).
//
// Pure. `@activity/graph-kit/scorers` only (never the barrel — this runs in
// the node batch importer).
// =============================================================================

import {
    displayFormKey,
    factorKeyParts,
    foldCollapsesBracket,
    mathEquivalent,
    mathShape,
    PROVIDED_NAMES,
} from '@activity/graph-kit/scorers';
import { bindSeededEntry as resolveSeededEntry } from '@activity/viewer/seeded-print';
import { FORM_WRONG_MATCH, type BlankSpec } from './blankSyntax';

type SeedValues = Record<string, number | number[]>;

const isReserved = (match: string): boolean =>
    match.trim().toLowerCase() === FORM_WRONG_MATCH;

/** Letter runs that read `e` as a pronumeral but the engine reads as Euler's
 * number: a run of two or more letters with an `e` in it, which is not a
 * provided name (`exp`, `sec`, `ceil`, …). */
function bareEulerRun(expr: string, declared: ReadonlySet<string>): string | null {
    for (const m of expr.matchAll(/[A-Za-z][A-Za-z0-9_]*/g)) {
        // A declared seed name (`base`, `rate`) is bound to a number before any
        // letter is split, so its `e` is never read (Fable review, step 3).
        if (declared.has(m[0])) continue;
        const run = /^[A-Za-z]+/.exec(m[0])?.[0] ?? '';
        if (run.length < 2 || !run.includes('e')) continue;
        if (PROVIDED_NAMES.includes(run)) continue;
        return run;
    }
    return null;
}

/**
 * `declared`: the seed names in scope, or null when they are not known at this
 * point (a bank template or a DoL, whose seed fence the importer reads later —
 * there the `e` check runs on the BOUND key, in formSeedFindings).
 */
export function mathBlankWarnings(spec: BlankSpec, declared: ReadonlySet<string> | null = new Set()): string[] {
    const warnings: string[] = [];
    const form = spec.equivalence === 'form';
    const label = form ? 'Form blank' : 'Math blank';
    const keys = [spec.canonical, ...spec.acceptableAnswers];
    for (const k of keys) {
        if (form && mathShape(k, 'key') === null) {
            warnings.push(`${label}: the answer “${k}” can’t be read as maths, so no answer can ever match it.`);
        }
        const run = declared ? bareEulerRun(k, declared) : null;
        if (run) {
            warnings.push(
                `${label}: “${k}” has an “e” in “${run}” — the grader reads a lone e as Euler’s number (2.718…), not a letter. Use another letter for a pronumeral.`,
            );
        }
    }
    const mode = form ? 'form' : 'value';
    const mistakes = spec.mistakes.filter((m) => !isReserved(m.match));
    for (let i = 0; i < mistakes.length; i++) {
        const mi = mistakes[i]!;
        if (keys.some((k) => mathEquivalent(mi.match, k, { mode }))) {
            warnings.push(
                `${label}: the mistake “!${mi.match}” is ${form ? 'the answer in an accepted form' : 'equal to the answer'}, so it is marked right and the mistake never fires.`,
            );
            continue;
        }
        for (let j = 0; j < i; j++) {
            const mj = mistakes[j]!;
            if (mathEquivalent(mi.match, mj.match, { mode })) {
                warnings.push(
                    `${label}: the mistakes “!${mj.match}” and “!${mi.match}” match the same answers (matching is by meaning${form ? ' and form' : ''}, not spelling) — the second never fires. Merge them.`,
                );
                break;
            }
        }
    }
    return warnings;
}

// ---- seeded form keys over stored rows (FG-6) --------------------------------

interface FormBlank {
    answer: string;
    acceptableAnswers: string[];
}

/** Form blanks in a document, in either the schema shape (`{type: 'blank',
 * answer, …}`) or the Tiptap shape (`{type: 'blank', attrs: {…}}`), plus the
 * item's latex (for the bare-letter check). */
function collect(doc: unknown): { blanks: FormBlank[]; latex: string[] } {
    const blanks: FormBlank[] = [];
    const latex: string[] = [];
    const visit = (node: unknown): void => {
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (node === null || typeof node !== 'object') return;
        const o = node as Record<string, unknown>;
        if (o.type === 'blank') {
            const a = (o.attrs && typeof o.attrs === 'object' ? o.attrs : o) as Record<string, unknown>;
            if (a.answerType === 'math' && a.equivalence === 'form' && typeof a.answer === 'string') {
                blanks.push({
                    answer: a.answer,
                    acceptableAnswers: Array.isArray(a.acceptableAnswers)
                        ? a.acceptableAnswers.filter((x): x is string => typeof x === 'string')
                        : [],
                });
            }
        }
        const a = (o.attrs && typeof o.attrs === 'object' ? o.attrs : o) as Record<string, unknown>;
        if (typeof a.latex === 'string') latex.push(a.latex);
        for (const v of Object.values(o)) if (v !== null && typeof v === 'object') visit(v);
    };
    visit(doc);
    return { blanks, latex };
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export interface FormSeedFindings {
    problems: string[];
    warnings: string[];
}

/**
 * FG-6 over the stored rows. `where` names the item in each line; `declared`
 * is the set of seed names in scope. One line per kind per answer, naming the
 * FIRST row that shows it.
 */
export function formSeedFindings(
    doc: unknown,
    rows: Iterable<SeedValues>,
    where: string,
    declared: ReadonlySet<string>,
): FormSeedFindings {
    const problems: string[] = [];
    const warnings: string[] = [];
    const { blanks, latex } = collect(doc);
    if (blanks.length === 0) return { problems, warnings };

    const rowText = (v: SeedValues): string =>
        Object.entries(v)
            .filter(([n]) => declared.has(n))
            .map(([n, x]) => `${n}=${Array.isArray(x) ? `[${x.join(',')}]` : x}`)
            .join(', ');

    // FG-3: a declared single-letter name in a form key is bound there; if the
    // same letter also stands bare in the item's maths, the author probably
    // meant the pronumeral in one of the two places.
    // Letters standing in the item's maths: `\seed{…}` and TeX commands
    // removed, then every letter of every run (`4ab` stands `a` and `b`).
    const bareLetters = new Set(
        latex
            .join(' ')
            .replace(/\\seed\{[^}]*\}/g, '')
            .replace(/\\[A-Za-z]+/g, ' ')
            .match(/[A-Za-z]/g) ?? [],
    );
    for (const b of blanks) {
        for (const name of declared) {
            if (name.length !== 1) continue;
            const alone = new RegExp(`(?<![A-Za-z])${name}(?![A-Za-z])`);
            const inKey = [b.answer, ...b.acceptableAnswers].some((k) => alone.test(k));
            if (!inKey) continue;
            if (bareLetters.has(name)) {
                warnings.push(
                    `${where}: the seed name “${name}” is bound in the form answer “${b.answer}” AND appears as a bare letter in the item’s maths — if the maths means the letter ${name}, rename the seed; if it means the number, write \\seed{${name}}.`,
                );
            }
        }
    }

    const seen = new Set<string>();
    const once = (kind: string, b: FormBlank, line: string, into: string[]): void => {
        const k = `${kind}\u0000${b.answer}`;
        if (seen.has(k)) return;
        seen.add(k);
        into.push(line);
    };
    for (const values of rows) {
        for (const b of blanks) {
            for (const entry of [b.answer, ...b.acceptableAnswers]) {
                const bound = resolveSeededEntry(entry, 'math', values);
                if (bound === entry) continue; // not seeded: checked at import
                const at = rowText(values);
                if (mathShape(bound, 'key') === null) {
                    once('parse', b, `${where}: the form answer “${entry}” can’t be read as maths at ${at} (it binds to “${bound}”), so no answer could match it there.`, problems);
                    continue;
                }
                if (foldCollapsesBracket(bound)) {
                    once('collapse', b, `${where}: at ${at} the form answer “${entry}” collapses a bracket (“${displayFormKey(bound) ?? bound}”) — that row no longer asks for the form. Add a \`where\` that rules it out.`, warnings);
                }
                const shown = displayFormKey(bound) ?? bound;
                const parts = factorKeyParts(bound);
                if (parts) {
                    // An authored `g*(…)` / `g(…)` whose numeric factor folded to ±1.
                    if (Math.abs(parts.outer) === 1 && !parts.letters) {
                        once('outer-one', b, `${where}: at ${at} the outer factor of “${entry}” is 1, so the answer is “${shown}” — not a factorisation. Add a \`where\` line that keeps the factor above 1.`, warnings);
                    }
                    const g = parts.coefficients ? parts.coefficients.reduce(gcd, 0) : 0;
                    if (g > 1) {
                        once('gcd', b, `${where}: at ${at} the bracket in “${shown}” still has the common factor ${g}, so the key itself is not the highest common factor. Add a \`where\` line that rules these rows out.`, warnings);
                    }
                }
                const run = bareEulerRun(bound, declared);
                if (run) {
                    once('euler', b, `${where}: the form answer “${entry}” has an “e” in “${run}” once bound — the grader reads a lone e as Euler’s number (2.718…), not a letter.`, warnings);
                }
            }
        }
    }
    return { problems, warnings };
}
