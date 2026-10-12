// =============================================================================
// bank-seed.ts — a practice-bank item's seed spec and value table (D43, BE-2/3)
// -----------------------------------------------------------------------------
// The STORED shape of a bank template's seeded values (docs/design/
// practice-banks.md, eng review BE-1…BE-12). Deliberately its own SUBPATH
// (`@activity/schema/bank-seed`), never re-exported from the barrel: both
// Edge Function bundles import `@activity/schema`, and the BE-2 ruling is that
// banks change neither bundle. A future serving slice that needs these types
// server-side imports the subpath and owns that bundle change on purpose.
//
// THE TABLE IS THE CONTRACT (BE-3). At import, every VALID combination of a
// template's variables is enumerated once and stored as rows. Preview — and
// later serving and grading — pick a row; nothing re-derives or re-evaluates a
// predicate, so no two surfaces can disagree about a student's numbers.
//
// Canonical row order (agreed with the curriculum side, B-162): the drawn
// variables sorted by name, each value list in AUTHORED order (duplicates are
// separate rows), the cartesian product with the first-sorted variable
// varying slowest; derived columns follow, in declaration order.
// =============================================================================

import { z } from 'zod';
import { RESERVED_SEED_NAMES } from './seed-vars.js';

/**
 * Names a bank's ```seed fence may not declare. The activity list
 * (RESERVED_SEED_NAMES — unchanged, it is in both server bundles), plus every
 * function the calculator's evaluator can reach bare-name that the activity
 * list misses (graph-kit's evaluate.test.ts derives that set from the real
 * function table and fails if one escapes this list), plus the seed grammar's
 * own words: and/or/not are operators, `where` starts a predicate line, and
 * xor/to/in are mathjs operators the grammar refuses — a variable of that name
 * would parse as the operator.
 */
export const BANK_RESERVED_SEED_NAMES: readonly string[] = [
  ...RESERVED_SEED_NAMES,
  'ln', 'logBase', 'nthRoot', 'factorial', 'nPr', 'nCr',
  'add', 'subtract', 'multiply', 'divide', 'unaryMinus', 'unaryPlus',
  'sec', 'csc', 'cot', 'asec', 'acsc', 'acot',
  'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
  'and', 'or', 'not', 'xor', 'to', 'in', 'where',
];

/** The 10,000-combination cap, counted BEFORE `where` filtering over a
 *  template's referenced drawn variables (BE-5; PR #68 counts the same way). */
export const BANK_COMBINATION_CAP = 10_000;

const NAME = z.string().regex(/^[a-z][a-z0-9_]*$/);

export const BankDrawnVar = z.discriminatedUnion('kind', [
  z.object({ name: NAME, kind: z.literal('int'), min: z.number().int(), max: z.number().int() }),
  z.object({ name: NAME, kind: z.literal('list'), values: z.array(z.number()).min(1) }),
]);
export type BankDrawnVar = z.infer<typeof BankDrawnVar>;

/** One template's seed spec: only the variables IT references (PB-5). */
export const BankSeedSpec = z.object({
  drawn: z.array(BankDrawnVar),
  derived: z.array(z.object({ name: NAME, expr: z.string().min(1) })),
  where: z.array(z.string().min(1)),
});
export type BankSeedSpec = z.infer<typeof BankSeedSpec>;

/** The valid-combination table. `columns` = drawn (sorted) then derived (in
 *  declaration order); each row has one value per column. A template with no
 *  variables has columns [] and ONE empty row. `total` is the pre-filter count. */
export const BankValueTable = z
  .object({
    columns: z.array(NAME),
    rows: z.array(z.array(z.number())).min(1),
    total: z.number().int().min(1),
  })
  .superRefine((t, ctx) => {
    if (t.rows.some((r) => r.length !== t.columns.length)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'every row has one value per column' });
    }
    if (t.rows.length > t.total) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'more valid rows than combinations' });
    }
  });
export type BankValueTable = z.infer<typeof BankValueTable>;

/** Row → name→value map, the shape every seeded surface substitutes from. */
export function bankRowValues(table: BankValueTable, row: number): Record<string, number> {
  const values = table.rows[row] ?? table.rows[0] ?? [];
  const out: Record<string, number> = {};
  table.columns.forEach((name, i) => {
    out[name] = values[i]!;
  });
  return out;
}
