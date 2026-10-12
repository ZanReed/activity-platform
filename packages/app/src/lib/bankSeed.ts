// =============================================================================
// bankSeed.ts — a practice bank's ```seed fence, parsed and ENUMERATED
// -----------------------------------------------------------------------------
// docs/design/practice-banks.md PB-5/PB-6, eng review BE-3/BE-5/BE-7. The
// grammar (agreed with the curriculum side, C-123 + B-162/C-127):
//
//   bn: list 10, 20          drawn — a list (authored order kept)
//   vd: int 60..200          drawn — an inclusive integer range
//   bu: = bp / bn            DERIVED — over EARLIER names only, never drawn
//   where t3: mod(vd, vh) == 0
//                            a PREDICATE scoped to ONE template; several for
//                            one template AND together; an unscoped `where:`
//                            is refused (it would couple templates)
//
// Strict where the activity fence is lenient: every malformed line is a
// PROBLEM that fails the bank file, never a skipped line (BE-7) — a skipped
// `where` would serve numbers the author excluded.
//
// ENUMERATION (BE-3/BE-5). Per template: its variables are the names it
// references (prose, answers, acceptable answers, MISTAKE matchers) plus,
// transitively, the sources of any derived one. `where` never adds to that
// set — a predicate over another template's variable is the C-123 erratum
// case and is refused. Every combination of the template's DRAWN variables is
// walked in canonical order (sorted by name, values in authored order, first
// name slowest); derived values are computed in declaration order and stored
// at 12 significant figures; rows passing every predicate are kept. The cap
// counts combinations BEFORE filtering. Any evaluation error at any
// combination (a zero divisor, a non-finite value) fails the template, named.
// =============================================================================

import {
    BANK_COMBINATION_CAP,
    BANK_RESERVED_SEED_NAMES,
    type BankDrawnVar,
    type BankSeedSpec,
    type BankValueTable,
} from '@activity/schema/bank-seed';
import {
    compileSeedExpression,
    derivedNumber,
    SeedExprError,
    type SeedExpression,
} from '@activity/graph-kit/seed-expr';

export interface ParsedDerived {
    readonly name: string;
    readonly expr: SeedExpression;
}

export interface ParsedWhere {
    readonly scope: string;
    readonly predicate: SeedExpression;
}

export interface ParsedBankSeed {
    /** Drawn variables, by name, in declaration order. */
    readonly drawn: ReadonlyMap<string, BankDrawnVar>;
    /** Derived variables, in declaration order. */
    readonly derived: readonly ParsedDerived[];
    readonly wheres: readonly ParsedWhere[];
    /** Every problem fails the file (BE-7). */
    readonly problems: readonly string[];
}

const NAME = /^[a-z][a-z0-9_]*$/;
const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
const NAME_LINE = /^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/;
// `where t6: …` and the refused `where: …`. A heading may contain hyphens.
const WHERE_LINE = /^where(?:\s+(\S+?))?\s*:\s*(.*)$/;

export function parseBankSeedFence(src: string): ParsedBankSeed {
    const drawn = new Map<string, BankDrawnVar>();
    const derived: ParsedDerived[] = [];
    const wheres: ParsedWhere[] = [];
    const problems: string[] = [];
    const declared = (n: string): boolean => drawn.has(n) || derived.some((d) => d.name === n);

    for (const raw of src.split('\n')) {
        const line = raw.trim();
        if (line === '') continue;

        const w = WHERE_LINE.exec(line);
        if (w) {
            const scope = w[1];
            const body = (w[2] ?? '').trim();
            if (!scope) {
                problems.push(`seed: “${line}” — an unscoped \`where:\` is refused in a bank (it would couple every template); write \`where <heading>: …\`.`);
                continue;
            }
            const c = compileSeedExpression(body);
            if (!c.ok) {
                problems.push(`seed: where ${scope}: ${body} — ${c.error}.`);
                continue;
            }
            wheres.push({ scope, predicate: c.expr });
            continue;
        }

        const m = NAME_LINE.exec(line);
        if (!m) {
            problems.push(`seed: “${line}” isn’t a \`name: spec\` or \`where <heading>: …\` line.`);
            continue;
        }
        const name = m[1]!;
        const spec = (m[2] ?? '').trim();
        if (!NAME.test(name)) {
            problems.push(`seed: “${name}” — names are lowercase letters, digits and underscores, starting with a letter.`);
            continue;
        }
        if (BANK_RESERVED_SEED_NAMES.includes(name)) {
            problems.push(`seed: “${name}” is a reserved name (a maths function, constant or grammar word). Pick another.`);
            continue;
        }
        if (declared(name)) {
            problems.push(`seed: “${name}” is declared twice.`);
            continue;
        }

        if (spec.startsWith('=')) {
            const c = compileSeedExpression(spec.slice(1));
            if (!c.ok) {
                problems.push(`seed: ${name}: ${spec} — ${c.error}.`);
                continue;
            }
            const later = c.expr.names.filter((n) => !declared(n));
            if (later.length > 0) {
                problems.push(`seed: ${name}: ${spec} uses ${later.join(', ')}, which ${later.length === 1 ? 'is' : 'are'} not declared ABOVE it — a derived variable may use only earlier names.`);
                continue;
            }
            derived.push({ name, expr: c.expr });
            continue;
        }

        const intM = /^int\s+(-?\d+)\s*\.\.\s*(-?\d+)$/.exec(spec);
        const listM = /^list\s+(.+)$/.exec(spec);
        if (intM) {
            const min = Number(intM[1]);
            const max = Number(intM[2]);
            if (min > max) {
                problems.push(`seed: ${name}: int min must be ≤ max.`);
                continue;
            }
            drawn.set(name, { name, kind: 'int', min, max });
        } else if (listM) {
            const parts = (listM[1] ?? '').split(',').map((v) => v.trim());
            const values = parts.map(Number);
            // Decimal literals only: Number() would also take 0x10, 0b101 and
            // 0o7, which the curriculum side's float() refuses.
            if (parts.some((p) => !DECIMAL.test(p)) || values.some((v) => !Number.isFinite(v))) {
                problems.push(`seed: ${name}: list values must all be decimal numbers.`);
                continue;
            }
            drawn.set(name, { name, kind: 'list', values });
        } else if (/^sample\b/.test(spec)) {
            problems.push(`seed: ${name}: \`sample\` variables are refused in banks (BE-5).`);
        } else {
            problems.push(`seed: “${name}: ${spec}” — specs are “int MIN..MAX”, “list v1, v2, …” or “= expression”.`);
        }
    }
    return { drawn, derived, wheres, problems };
}

function valuesOf(v: BankDrawnVar): number[] {
    if (v.kind === 'list') return [...v.values];
    const out: number[] = [];
    for (let i = v.min; i <= v.max; i++) out.push(i);
    return out;
}

function sizeOf(v: BankDrawnVar): number {
    return v.kind === 'list' ? v.values.length : v.max - v.min + 1;
}

/** The template's variable set: its direct references plus the transitive
 *  sources of every derived variable among them. Names not declared at all
 *  are returned separately — the caller reports them. */
export function templateVariables(
    seed: ParsedBankSeed,
    referenced: Iterable<string>,
): { vars: Set<string>; undeclared: string[] } {
    const derivedBy = new Map(seed.derived.map((d) => [d.name, d]));
    const vars = new Set<string>();
    const undeclared: string[] = [];
    const add = (n: string): void => {
        if (vars.has(n)) return;
        if (seed.drawn.has(n)) {
            vars.add(n);
        } else if (derivedBy.has(n)) {
            vars.add(n);
            for (const s of derivedBy.get(n)!.expr.names) add(s);
        } else if (!undeclared.includes(n)) {
            undeclared.push(n);
        }
    };
    for (const n of referenced) add(n);
    return { vars, undeclared };
}

export type EnumerateResult =
    | { ok: true; table: BankValueTable; spec: BankSeedSpec }
    | { ok: false; problems: string[] };

/** Enumerate one template's valid combinations (BE-3, BE-5). */
export function enumerateTemplate(
    seed: ParsedBankSeed,
    heading: string,
    vars: ReadonlySet<string>,
): EnumerateResult {
    const problems: string[] = [];
    const drawnCols = [...vars].filter((n) => seed.drawn.has(n)).sort();
    const derivedCols = seed.derived.filter((d) => vars.has(d.name));
    const wheres = seed.wheres.filter((w) => w.scope === heading);

    for (const w of wheres) {
        const stray = w.predicate.names.filter((n) => !vars.has(n));
        if (stray.length > 0) {
            problems.push(
                `where ${heading}: ${w.predicate.source} uses ${stray.join(', ')}, which ${heading} does not use — a predicate may use only its own template's variables (PB-6).`,
            );
        }
    }
    let total = 1;
    for (const n of drawnCols) total *= sizeOf(seed.drawn.get(n)!);
    if (total > BANK_COMBINATION_CAP) {
        problems.push(`${heading}: ${total} combinations, over the cap of ${BANK_COMBINATION_CAP} (BE-5).`);
    }
    if (problems.length > 0) return { ok: false, problems };

    const lists = drawnCols.map((n) => valuesOf(seed.drawn.get(n)!));
    const rows: number[][] = [];
    const idx = new Array<number>(lists.length).fill(0);
    for (let k = 0; k < total; k++) {
        const scope: Record<string, number> = {};
        drawnCols.forEach((n, i) => {
            scope[n] = lists[i]![idx[i]!]!;
        });
        try {
            // FULL precision in the scope (later derived variables and the
            // predicates read it — the curriculum side computes exactly); the
            // 12-significant-figure rounding applies only to what is STORED.
            // derivedNumber still validates (number, finite) at evaluation.
            const stored: Record<string, number> = {};
            for (const d of derivedCols) {
                const v = d.expr.evaluate(scope);
                stored[d.name] = derivedNumber(v);
                scope[d.name] = v as number;
            }
            let keep = true;
            for (const w of wheres) {
                const v = w.predicate.evaluate(scope);
                if (typeof v !== 'boolean') {
                    throw new SeedExprError(`where ${heading}: ${w.predicate.source} is a number, not a comparison`);
                }
                if (!v) {
                    keep = false;
                    break;
                }
            }
            if (keep) rows.push([...drawnCols.map((n) => scope[n]!), ...derivedCols.map((d) => stored[d.name]!)]);
        } catch (err) {
            const at = drawnCols.map((n) => `${n}=${scope[n]}`).join(', ');
            return { ok: false, problems: [`${heading}: at ${at || 'its only combination'}: ${(err as Error).message}.`] };
        }
        // Odometer, last column fastest — so the FIRST sorted name varies slowest.
        for (let i = idx.length - 1; i >= 0; i--) {
            idx[i]!++;
            if (idx[i]! < lists[i]!.length) break;
            idx[i] = 0;
        }
    }
    if (rows.length === 0) {
        return { ok: false, problems: [`${heading}: no combination passes its where (0 of ${total}).`] };
    }
    return {
        ok: true,
        table: { columns: [...drawnCols, ...derivedCols.map((d) => d.name)], rows, total },
        spec: {
            drawn: drawnCols.map((n) => seed.drawn.get(n)!),
            derived: derivedCols.map((d) => ({ name: d.name, expr: d.expr.source })),
            where: wheres.map((w) => w.predicate.source),
        },
    };
}
