// =============================================================================
// factScope.ts — the fact-scope registry's expander (D43, practice-blocks.md)
// -----------------------------------------------------------------------------
// The curriculum side generates `fact-scope-registry.json` from its graph: fact
// FAMILIES with ranges, not facts (their items 18–33). This module is the ONE
// place the fact grammar runs (ER-13): it expands every family into its facts
// and fills the display and spoken templates once per fact (CR-21), so no
// display grammar ever runs in the browser or in SQL. The batch importer calls
// it through batchImportPipeline.ts and mirrors the result into 0044's tables,
// insert-only, keyed by (registry_rev, FACT_GRAMMAR_REV).
//
// STRICT BY DESIGN. Every shape the platform has agreed to read is listed
// below, and anything else stops the import (B-24, B-25: a new operation,
// generate shape, flag, placeholder, field or markup goes to the platform as a
// question first). A mirror that silently dropped an unknown key would hide
// exactly the change the ask-back rule exists to catch.
//
// The expander is driven by `operation`. A family's `shown` and `answer`
// strings are for humans, but they are CHECKED against the operation's
// expected pair: a family whose strings disagree with its operation stops the
// import rather than being expanded as something it does not say.
//
// The revision hash is NOT checked here — that needs node's crypto and lives in
// scripts/batch-import.mjs (checkFactRegistryRevision), beside the importer's
// other canonical-JSON hashing.
// =============================================================================

/**
 * The version of THIS expander's output: fact ids, operand storage, number
 * words, display rules. Bump it whenever any of them changes for the same
 * registry input — a probe records it beside `registry_rev`, and 0044 refuses
 * a re-mirror of one (registry_rev, fact_grammar_rev) pair whose content
 * differs.
 */
export const FACT_GRAMMAR_REV = 1;

/** An answer a student can type (their item 19, CR-17). */
export const FACT_ANSWER_RE = /^-?(\d+(\.\d+)?)$/;
export const FACT_ANSWER_MAX = 8;

const TRUE_MINUS = '−';

export interface FactProbeValues {
    floor_factor_k: number;
    accuracy_threshold: number;
    facts_met_threshold: number;
    response_ceiling_s: number;
    min_items_per_family: number;
    practice_window: number;
}

export interface FactStrategy {
    intro: string | null;
    lines: { label: string; text: string }[];
    example: string | null;
}

export interface MirroredFamily {
    family_id: string;
    ord: number;
    kind: 'generated' | 'listed';
    name: string;
    source_year: number;
    operation: string | null;
    criterion_s: number;
    turnaround: boolean;
    weight: number;
    fact_count: number;
    strategy: FactStrategy | null;
}

export interface MirroredFact {
    fact_id: string;
    family_id: string;
    ord: number;
    /** Shown operands in the canonical order; null for a listed fact. */
    operands: number[] | null;
    answer: string;
    display: string;
    spoken: string;
    /** The other operand order, for a turnaround pair of two DIFFERENT
     *  operands (decision 4); null otherwise. */
    display_swapped: string | null;
    spoken_swapped: string | null;
}

export interface YearScope {
    adds: string[];
    cumulative: string[];
    description: string | null;
}

export interface FactScopeMirror {
    registry_rev: string;
    fact_grammar_rev: number;
    /** From the header. Informational only: the header names the CURRENT graph
     *  version, which moves on every graph bump while the revision does not. */
    graph_version: string;
    fact_probe: FactProbeValues;
    year_scope: Record<string, YearScope>;
    fraction_names: Record<string, { one: string; many: string }>;
    families: MirroredFamily[];
    facts: MirroredFact[];
}

export type FactScopeResult =
    | { ok: true; mirror: FactScopeMirror }
    | { ok: false; errors: string[] };

// ---- the agreed vocabulary --------------------------------------------------

type Shape = 'x' | 'xy' | 'pairs';

interface OperationRule {
    shape: Shape;
    shown: Record<string, string>;
    answerText: string;
    commutative: boolean;
    /** Shown operands and the answer, from one generated (x, y). */
    compute(x: number, y: number): { shown: number[]; answer: Rational };
}

interface Rational {
    num: number;
    den: number;
}

const int = (n: number): Rational => ({ num: n, den: 1 });

const OPERATIONS: Record<string, OperationRule> = {
    multiply: {
        shape: 'xy', shown: { a: 'x', b: 'y' }, answerText: 'x × y', commutative: true,
        compute: (x, y) => ({ shown: [x, y], answer: int(x * y) }),
    },
    divide: {
        shape: 'xy', shown: { a: 'x × y', b: 'x' }, answerText: 'y', commutative: false,
        compute: (x, y) => ({ shown: [x * y, x], answer: int(y) }),
    },
    add: {
        shape: 'xy', shown: { a: 'x', b: 'y' }, answerText: 'x + y', commutative: true,
        compute: (x, y) => ({ shown: [x, y], answer: int(x + y) }),
    },
    subtract: {
        shape: 'xy', shown: { a: 'x', b: 'y' }, answerText: 'x − y', commutative: false,
        compute: (x, y) => ({ shown: [x, y], answer: int(x - y) }),
    },
    square: {
        shape: 'x', shown: { a: 'x' }, answerText: 'x²', commutative: false,
        compute: (x) => ({ shown: [x], answer: int(x * x) }),
    },
    cube: {
        shape: 'x', shown: { a: 'x' }, answerText: 'x³', commutative: false,
        compute: (x) => ({ shown: [x], answer: int(x * x * x) }),
    },
    square_root: {
        shape: 'x', shown: { a: 'x²' }, answerText: 'x', commutative: false,
        compute: (x) => ({ shown: [x * x], answer: int(x) }),
    },
    cube_root: {
        shape: 'x', shown: { a: 'x³' }, answerText: 'x', commutative: false,
        compute: (x) => ({ shown: [x * x * x], answer: int(x) }),
    },
    fraction_to_decimal: {
        shape: 'pairs', shown: { a: 'x', b: 'y' }, answerText: 'x ÷ y as a decimal', commutative: false,
        compute: (x, y) => ({ shown: [x, y], answer: { num: x, den: y } }),
    },
    fraction_to_percent: {
        shape: 'pairs', shown: { a: 'x', b: 'y' }, answerText: '100x ÷ y', commutative: false,
        compute: (x, y) => ({ shown: [x, y], answer: { num: 100 * x, den: y } }),
    },
};

/** Named range constraints (their revision 5: exactly two). Each reads the
 *  SHOWN operands and the answer, never the generated x and y. */
const FLAGS: Record<string, (shown: number[], answer: number) => boolean> = {
    // Keep the fact only if a displayed operand is negative.
    at_least_one_negative: (shown) => shown.some((n) => n < 0),
    // Drop a plain whole-number fact: every shown operand and the answer ≥ 0.
    exclude_plain_whole: (shown, answer) => !(shown.every((n) => n >= 0) && answer >= 0),
};

const PLACEHOLDERS = new Set(['a', 'b', 'b-fraction-name']);

const GENERATED_KEYS = new Set([
    'id', 'kind', 'name', 'source_year', 'operation', 'generate', 'flags', 'shown',
    'answer', 'turnaround', 'criterion_s', 'weight', 'display', 'spoken', 'fact_count',
    'strategy',
]);
const LISTED_KEYS = new Set([
    'id', 'kind', 'name', 'source_year', 'criterion_s', 'weight', 'facts', 'fact_count',
    'strategy',
]);
const LISTED_FACT_KEYS = new Set(['id', 'display', 'spoken', 'answer']);
const PROBE_KEYS: (keyof FactProbeValues)[] = [
    'floor_factor_k', 'accuracy_threshold', 'facts_met_threshold', 'response_ceiling_s',
    'min_items_per_family', 'practice_window',
];
const BODY_KEYS = new Set(['fact_probe', 'families', 'year_scope', 'fraction_names']);
const HEADER_KEYS = new Set(['generated_from', 'revision', 'revision_rule', 'note']);

// ---- numbers -----------------------------------------------------------------

const ONES = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
    'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function under100(n: number): string {
    if (n < 20) return ONES[n]!;
    const unit = n % 10;
    return TENS[Math.floor(n / 10)]! + (unit ? `-${ONES[unit]!}` : '');
}

function under1000(n: number): string {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    if (hundreds === 0) return under100(rest);
    return `${ONES[hundreds]!} hundred` + (rest ? ` and ${under100(rest)}` : '');
}

/**
 * An integer in words, New Zealand English (decision 6): "one hundred and
 * forty-four", "negative three". Throws past 999 999 — nothing in a fact
 * scope comes near it, and a silent wrong word would be worse than a stop.
 */
export function numberWords(n: number): string {
    if (!Number.isInteger(n) || Math.abs(n) > 999_999) {
        throw new Error(`numberWords: ${n} is not a supported integer`);
    }
    if (n < 0) return `negative ${numberWords(-n)}`;
    if (n < 1000) return under1000(n);
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    return (
        `${under1000(thousands)} thousand` +
        (rest === 0 ? '' : rest < 100 ? ` and ${under100(rest)}` : ` ${under1000(rest)}`)
    );
}

/** A number as it is DISPLAYED: a true minus sign (their item 26). */
function displayNumber(n: number): string {
    return n < 0 ? `${TRUE_MINUS}${Math.abs(n)}` : String(n);
}

/**
 * An exact rational as the answer a student types, or null when it does not
 * terminate within six decimal places. Exact integer arithmetic: 3/4 is
 * "0.75", never a float's "0.7500000001".
 */
export function rationalAnswer({ num, den }: Rational): string | null {
    if (den === 0) return null;
    const negative = num < 0 !== den < 0 && num !== 0;
    const n = Math.abs(num);
    const d = Math.abs(den);
    for (let places = 0, scale = 1; places <= 6; places++, scale *= 10) {
        if ((n * scale) % d !== 0) continue;
        const scaled = (n * scale) / d;
        const whole = Math.floor(scaled / scale);
        const frac = places === 0 ? '' : `.${String(scaled % scale).padStart(places, '0')}`;
        return `${negative ? '-' : ''}${whole}${frac}`;
    }
    return null;
}

// ---- templates ---------------------------------------------------------------

interface FillContext {
    a: number;
    b: number | null;
    fractionNames: Record<string, { one: string; many: string }>;
}

/** Fill one template. Display: true minus, brackets round a negative second
 *  operand. Spoken: numbers in words ("negative" for a sign; the template's
 *  own words carry "minus" for subtraction). */
function fill(template: string, ctx: FillContext, spoken: boolean): string {
    return template.replace(/\{([^{}]*)\}/g, (_, name: string) => {
        if (name === 'a') return spoken ? numberWords(ctx.a) : displayNumber(ctx.a);
        if (name === 'b') {
            if (ctx.b === null) throw new Error('{b} in a one-operand family');
            if (spoken) return numberWords(ctx.b);
            return ctx.b < 0 ? `(${displayNumber(ctx.b)})` : displayNumber(ctx.b);
        }
        if (name === 'b-fraction-name') {
            if (ctx.b === null) throw new Error('{b-fraction-name} in a one-operand family');
            const names = ctx.fractionNames[String(ctx.b)];
            if (!names) throw new Error(`no fraction name for denominator ${ctx.b}`);
            return ctx.a === 1 ? names.one : names.many;
        }
        throw new Error(`unknown placeholder {${name}}`);
    });
}

/** Problems with a template that hold for every fact (checked once). */
function templateProblems(template: unknown, where: string, display: boolean): string[] {
    if (typeof template !== 'string' || template.trim() === '') {
        return [`${where}: missing`];
    }
    const problems: string[] = [];
    for (const [, name] of template.matchAll(/\{([^{}]*)\}/g)) {
        if (!PLACEHOLDERS.has(name!)) problems.push(`${where}: unknown placeholder {${name}}`);
    }
    if (/[{}]/.test(template.replace(/\{[^{}]*\}/g, ''))) {
        problems.push(`${where}: a stray brace`);
    }
    const blanks = template.split('__').length - 1;
    if (display && blanks !== 1) problems.push(`${where}: needs exactly one __ (has ${blanks})`);
    if (!display && blanks !== 0) problems.push(`${where}: a spoken form has no __`);
    return problems;
}

// ---- helpers -----------------------------------------------------------------

const isObject = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === 'object' && !Array.isArray(v);

const unknownKeys = (obj: Record<string, unknown>, allowed: Set<string>) =>
    Object.keys(obj).filter((k) => !allowed.has(k));

function rangeValues(spec: unknown, where: string, errors: string[]): number[] | null {
    if (!isObject(spec)) {
        errors.push(`${where}: a range must be {min, max, exclude?}`);
        return null;
    }
    const extra = unknownKeys(spec, new Set(['min', 'max', 'exclude']));
    if (extra.length) errors.push(`${where}: unknown range key(s) ${extra.join(', ')}`);
    const { min, max } = spec;
    const exclude = spec.exclude ?? [];
    if (!Number.isInteger(min) || !Number.isInteger(max) || (min as number) > (max as number)) {
        errors.push(`${where}: min and max must be integers with min ≤ max`);
        return null;
    }
    if (!Array.isArray(exclude) || !exclude.every(Number.isInteger)) {
        errors.push(`${where}: exclude must be a list of integers`);
        return null;
    }
    const values: number[] = [];
    for (let v = min as number; v <= (max as number); v++) {
        if (!(exclude as number[]).includes(v)) values.push(v);
    }
    return values;
}

function strategyOf(raw: unknown, where: string, errors: string[]): FactStrategy | null {
    if (raw === undefined || raw === null) return null;
    if (!isObject(raw)) {
        errors.push(`${where}: strategy must be {intro, lines, example}`);
        return null;
    }
    const extra = unknownKeys(raw, new Set(['intro', 'lines', 'example']));
    if (extra.length) errors.push(`${where}: unknown strategy key(s) ${extra.join(', ')}`);
    const textOrNull = (v: unknown) => v === null || v === undefined || typeof v === 'string';
    if (!textOrNull(raw.intro) || !textOrNull(raw.example)) {
        errors.push(`${where}: strategy intro and example are text or null`);
    }
    const lines = raw.lines;
    if (
        !Array.isArray(lines) ||
        !lines.every(
            (l) =>
                isObject(l) &&
                typeof l.label === 'string' &&
                typeof l.text === 'string' &&
                unknownKeys(l, new Set(['label', 'text'])).length === 0,
        )
    ) {
        errors.push(`${where}: strategy lines must be [{label, text}]`);
        return null;
    }
    return {
        intro: (raw.intro as string | null | undefined) ?? null,
        lines: lines.map((l) => ({ label: l.label as string, text: l.text as string })),
        example: (raw.example as string | null | undefined) ?? null,
    };
}

const answerOk = (answer: string) =>
    FACT_ANSWER_RE.test(answer) && answer.length <= FACT_ANSWER_MAX;

// ---- the expander ------------------------------------------------------------

/**
 * Expand a parsed `fact-scope-registry.json` into the rows 0044 stores. Pure:
 * no I/O, no hashing. Collects every problem it can find rather than stopping
 * at the first, so one import run names them all.
 */
export function expandFactScope(registry: unknown): FactScopeResult {
    const errors: string[] = [];
    if (!isObject(registry) || !isObject(registry.header) || !isObject(registry.body)) {
        return { ok: false, errors: ['the file is not {header, body}'] };
    }
    const { header, body } = registry;

    const headerExtra = unknownKeys(header, HEADER_KEYS);
    if (headerExtra.length) errors.push(`header: unknown key(s) ${headerExtra.join(', ')}`);
    const bodyExtra = unknownKeys(body, BODY_KEYS);
    if (bodyExtra.length) errors.push(`body: unknown key(s) ${bodyExtra.join(', ')}`);

    const revision = header.revision;
    if (typeof revision !== 'string' || !/^[0-9a-f]{64}$/.test(revision)) {
        errors.push('header.revision: not a sha256');
    }
    const graphVersion =
        typeof header.generated_from === 'string'
            ? /v(\d+\.\d+\.\d+)\s*$/.exec(header.generated_from)?.[1] ?? null
            : null;
    if (!graphVersion) errors.push('header.generated_from: no graph version (…vN.N.N)');

    // fact_probe — the six single values (their items 15, 18, 25).
    const probe = body.fact_probe;
    const factProbe = {} as FactProbeValues;
    if (!isObject(probe)) {
        errors.push('fact_probe: missing');
    } else {
        const extra = unknownKeys(probe, new Set(PROBE_KEYS));
        if (extra.length) errors.push(`fact_probe: unknown key(s) ${extra.join(', ')}`);
        for (const key of PROBE_KEYS) {
            const v = probe[key];
            const isInt = key === 'min_items_per_family' || key === 'practice_window';
            const isShare = key === 'accuracy_threshold' || key === 'facts_met_threshold';
            if (
                typeof v !== 'number' || !Number.isFinite(v) || v <= 0 ||
                (isInt && !Number.isInteger(v)) || (isShare && v > 1)
            ) {
                errors.push(`fact_probe.${key}: ${JSON.stringify(v)} is not a valid value`);
            } else {
                factProbe[key] = v;
            }
        }
    }

    // fraction_names (CR-22).
    const fractionNames: Record<string, { one: string; many: string }> = {};
    if (!isObject(body.fraction_names)) {
        errors.push('fraction_names: missing');
    } else {
        for (const [den, names] of Object.entries(body.fraction_names)) {
            if (
                !/^[1-9]\d*$/.test(den) || !isObject(names) ||
                typeof names.one !== 'string' || typeof names.many !== 'string' ||
                unknownKeys(names, new Set(['one', 'many'])).length > 0
            ) {
                errors.push(`fraction_names.${den}: must be {one, many}`);
            } else {
                fractionNames[den] = { one: names.one, many: names.many };
            }
        }
    }

    // families.
    const families: MirroredFamily[] = [];
    const facts: MirroredFact[] = [];
    const factIds = new Set<string>();
    const familyIds = new Set<string>();
    const rawFamilies = Array.isArray(body.families) ? body.families : [];
    if (!Array.isArray(body.families) || rawFamilies.length === 0) {
        errors.push('families: missing or empty');
    }

    rawFamilies.forEach((raw: unknown, familyOrd: number) => {
        if (!isObject(raw) || typeof raw.id !== 'string' || !/^fact\.[a-z0-9.-]+$/.test(raw.id)) {
            errors.push(`families[${familyOrd}]: no valid id`);
            return;
        }
        const id = raw.id;
        const where = `family ${id}`;
        if (familyIds.has(id)) errors.push(`${where}: duplicate family id`);
        familyIds.add(id);

        const kind = raw.kind;
        if (kind !== 'generated' && kind !== 'listed') {
            errors.push(`${where}: kind must be generated or listed`);
            return;
        }
        const hasGenerate = 'generate' in raw;
        const hasFacts = 'facts' in raw;
        if (hasGenerate === hasFacts || (kind === 'generated') !== hasGenerate) {
            errors.push(`${where}: a ${kind} family has exactly ${kind === 'generated' ? 'generate' : 'facts'}`);
            return;
        }
        const extra = unknownKeys(raw, kind === 'generated' ? GENERATED_KEYS : LISTED_KEYS);
        if (extra.length) errors.push(`${where}: unknown key(s) ${extra.join(', ')}`);

        if (typeof raw.name !== 'string' || raw.name.trim() === '') errors.push(`${where}: no name`);
        if (!Number.isInteger(raw.source_year)) errors.push(`${where}: source_year is not an integer`);
        const positive = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v > 0;
        if (!positive(raw.criterion_s)) errors.push(`${where}: criterion_s must be a positive number`);
        if (!positive(raw.weight)) errors.push(`${where}: weight must be a positive number`);
        if (!Number.isInteger(raw.fact_count)) errors.push(`${where}: fact_count is not an integer (CR-23)`);
        const strategy = strategyOf(raw.strategy, where, errors);

        const before = facts.length;
        const push = (fact: Omit<MirroredFact, 'family_id' | 'ord'>) => {
            if (factIds.has(fact.fact_id)) errors.push(`${where}: duplicate fact id ${fact.fact_id}`);
            factIds.add(fact.fact_id);
            if (!answerOk(fact.answer)) {
                errors.push(`${where}: answer "${fact.answer}" of ${fact.fact_id} is not typeable (CR-17)`);
            }
            facts.push({ ...fact, family_id: id, ord: facts.length - before });
        };

        let operation: string | null = null;
        let turnaround = false;

        if (kind === 'listed') {
            if (!Array.isArray(raw.facts) || raw.facts.length === 0) {
                errors.push(`${where}: facts must be a non-empty list`);
            } else {
                raw.facts.forEach((f: unknown, i: number) => {
                    if (!isObject(f)) {
                        errors.push(`${where}: facts[${i}] is not an object`);
                        return;
                    }
                    const fExtra = unknownKeys(f, LISTED_FACT_KEYS);
                    if (fExtra.length) errors.push(`${where}: facts[${i}] unknown key(s) ${fExtra.join(', ')}`);
                    if (typeof f.id !== 'string' || !f.id.startsWith(`${id}.`)) {
                        errors.push(`${where}: facts[${i}] id must start with "${id}."`);
                        return;
                    }
                    const display = f.display;
                    const spoken = f.spoken;
                    const problems = [
                        ...templateProblems(display, `${f.id} display`, true),
                        ...templateProblems(spoken, `${f.id} spoken`, false),
                    ];
                    if (typeof display === 'string' && /\{[^{}]*\}/.test(display + String(spoken))) {
                        problems.push(`${f.id}: a listed fact is stored as written, with no placeholders`);
                    }
                    if (typeof f.answer !== 'string') problems.push(`${f.id}: answer must be text`);
                    if (problems.length) {
                        errors.push(...problems);
                        return;
                    }
                    push({
                        fact_id: f.id,
                        operands: null,
                        answer: f.answer as string,
                        display: display as string,
                        spoken: spoken as string,
                        display_swapped: null,
                        spoken_swapped: null,
                    });
                });
            }
        } else {
            const rule = typeof raw.operation === 'string' ? OPERATIONS[raw.operation] : undefined;
            if (!rule) {
                errors.push(`${where}: unknown operation ${JSON.stringify(raw.operation)} (ask-back first, B-25)`);
                return;
            }
            operation = raw.operation as string;
            if (
                !isObject(raw.shown) ||
                JSON.stringify(Object.entries(raw.shown).sort()) !==
                    JSON.stringify(Object.entries(rule.shown).sort()) ||
                raw.answer !== rule.answerText
            ) {
                errors.push(
                    `${where}: shown/answer do not match operation ${operation} ` +
                        `(expected shown ${JSON.stringify(rule.shown)}, answer "${rule.answerText}")`,
                );
                return;
            }
            if (typeof raw.turnaround !== 'boolean') errors.push(`${where}: turnaround must be true or false`);
            turnaround = raw.turnaround === true;
            if (turnaround && !rule.commutative) {
                errors.push(`${where}: turnaround on a non-commutative operation ${operation}`);
                return;
            }
            const flags = raw.flags ?? [];
            if (!Array.isArray(flags)) {
                errors.push(`${where}: flags must be a list`);
                return;
            }
            const unknownFlags = flags.filter((f) => typeof f !== 'string' || !(f in FLAGS));
            if (unknownFlags.length) {
                errors.push(`${where}: unknown flag(s) ${JSON.stringify(unknownFlags)} (ask-back first)`);
                return;
            }
            const templateErrors = [
                ...templateProblems(raw.display, `${where} display`, true),
                ...templateProblems(raw.spoken, `${where} spoken`, false),
            ];
            const oneOperand = rule.shape === 'x';
            if (oneOperand && /\{b/.test(String(raw.display) + String(raw.spoken))) {
                templateErrors.push(`${where}: {b…} in a one-operand family`);
            }
            if (templateErrors.length) {
                errors.push(...templateErrors);
                return;
            }

            // Generate (x, y) in a fixed order.
            const generate = raw.generate;
            const pairs: [number, number][] = [];
            if (!isObject(generate)) {
                errors.push(`${where}: generate must be an object`);
                return;
            }
            const genKeys = Object.keys(generate).sort().join(',');
            const expectedKeys = rule.shape === 'x' ? 'x' : rule.shape === 'xy' ? 'x,y' : 'pairs';
            if (genKeys !== expectedKeys) {
                errors.push(
                    `${where}: generate shape {${genKeys}} is not {${expectedKeys}} for ${operation} (ask-back first)`,
                );
                return;
            }
            if (rule.shape === 'pairs') {
                const list = generate.pairs;
                if (
                    !Array.isArray(list) ||
                    !list.every((p) => Array.isArray(p) && p.length === 2 && p.every(Number.isInteger))
                ) {
                    errors.push(`${where}: pairs must be a list of [integer, integer]`);
                    return;
                }
                for (const [x, y] of list as [number, number][]) pairs.push([x, y]);
            } else {
                const xs = rangeValues(generate.x, `${where} generate.x`, errors);
                const ys = rule.shape === 'xy' ? rangeValues(generate.y, `${where} generate.y`, errors) : [0];
                if (!xs || !ys) return;
                for (const x of xs) for (const y of ys) pairs.push([x, y]);
            }

            const seen = new Set<string>();
            for (const [x, y] of pairs) {
                const { shown, answer } = rule.compute(x, y);
                const answerText = rationalAnswer(answer);
                if (answerText === null) {
                    errors.push(`${where}: (${x}, ${y}) has an answer that does not terminate`);
                    continue;
                }
                const answerValue = answer.num / answer.den;
                if (!flags.every((f) => FLAGS[f as string]!(shown, answerValue))) continue;

                // A turnaround pair is ONE fact, smaller operand first (their
                // answer 9); both orders' strings are stored (decision 4).
                const canonical =
                    turnaround && shown.length === 2 && shown[0]! > shown[1]!
                        ? [shown[1]!, shown[0]!]
                        : shown;
                const factId = `${id}:${canonical.join(',')}`;
                if (seen.has(factId)) {
                    if (turnaround) continue;
                    errors.push(`${where}: two generated facts share the id ${factId}`);
                    continue;
                }
                seen.add(factId);

                const ctx = (a: number, b: number | null): FillContext => ({ a, b, fractionNames });
                const [a, b = null] = canonical as [number, number?];
                let display: string, spoken: string;
                let displaySwapped: string | null = null;
                let spokenSwapped: string | null = null;
                try {
                    display = fill(raw.display as string, ctx(a, b), false);
                    spoken = fill(raw.spoken as string, ctx(a, b), true);
                    if (turnaround && b !== null && a !== b) {
                        displaySwapped = fill(raw.display as string, ctx(b, a), false);
                        spokenSwapped = fill(raw.spoken as string, ctx(b, a), true);
                    }
                } catch (err) {
                    errors.push(`${where}: ${factId}: ${(err as Error).message}`);
                    continue;
                }
                push({
                    fact_id: factId,
                    operands: canonical,
                    answer: answerText,
                    display,
                    spoken,
                    display_swapped: displaySwapped,
                    spoken_swapped: spokenSwapped,
                });
            }
        }

        const count = facts.length - before;
        if (Number.isInteger(raw.fact_count) && count !== raw.fact_count) {
            errors.push(`${where}: expands to ${count} facts, the registry says ${raw.fact_count} (CR-23)`);
        }
        families.push({
            family_id: id,
            ord: familyOrd,
            kind,
            name: String(raw.name),
            source_year: raw.source_year as number,
            operation,
            criterion_s: raw.criterion_s as number,
            turnaround,
            weight: raw.weight as number,
            fact_count: count,
            strategy,
        });
    });

    // year_scope (their item 18): what Year N adds, and the cumulative lists.
    const yearScope: Record<string, YearScope> = {};
    if (!isObject(body.year_scope) || Object.keys(body.year_scope).length === 0) {
        errors.push('year_scope: missing');
    } else {
        const years = Object.keys(body.year_scope);
        if (!years.every((y) => /^[1-9]\d*$/.test(y))) errors.push('year_scope: keys must be year numbers');
        const added = new Set<string>();
        let running: string[] = [];
        for (const year of years.sort((p, q) => Number(p) - Number(q))) {
            const entry = body.year_scope[year];
            const where = `year_scope.${year}`;
            if (
                !isObject(entry) || !Array.isArray(entry.adds) || !Array.isArray(entry.cumulative) ||
                !(entry.description === null || typeof entry.description === 'string') ||
                unknownKeys(entry, new Set(['adds', 'cumulative', 'description'])).length > 0
            ) {
                errors.push(`${where}: must be {adds, cumulative, description}`);
                continue;
            }
            for (const fid of entry.adds as unknown[]) {
                if (typeof fid !== 'string' || !familyIds.has(fid)) errors.push(`${where}: adds unknown family ${String(fid)}`);
                else if (added.has(fid)) errors.push(`${where}: ${fid} is added twice`);
                else added.add(fid);
            }
            running = [...running, ...(entry.adds as string[])];
            const cumulative = entry.cumulative as string[];
            if ([...cumulative].sort().join('|') !== [...running].sort().join('|')) {
                errors.push(`${where}: cumulative is not the running total of adds`);
            }
            yearScope[year] = {
                adds: entry.adds as string[],
                cumulative,
                description: (entry.description as string | null) ?? null,
            };
        }
    }

    if (errors.length) return { ok: false, errors };
    return {
        ok: true,
        mirror: {
            registry_rev: revision as string,
            fact_grammar_rev: FACT_GRAMMAR_REV,
            graph_version: graphVersion!,
            fact_probe: factProbe,
            year_scope: yearScope,
            fraction_names: fractionNames,
            families,
            facts,
        },
    };
}

/**
 * The probe length for a year (their items 20, 22): the larger of 30 and
 * min_items_per_family × the families in scope. For the dry-run report; the
 * probe's open RPC computes its own from the mirrored rows.
 */
export function probeLengthFor(mirror: FactScopeMirror, year: string): number | null {
    const scope = mirror.year_scope[year];
    if (!scope) return null;
    return Math.max(30, mirror.fact_probe.min_items_per_family * scope.cumulative.length);
}
