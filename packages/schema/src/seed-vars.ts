// =============================================================================
// seed-vars.ts — per-student seeded variables (wishlist #6, seeded-data.md)
// -----------------------------------------------------------------------------
// An activity's meta may declare named numeric variables; prose interpolates
// them ({a}), numeric/math blank answers may be expressions over them, and a
// data_plot may draw its dataset from a `sample` variable (dataVar). Values
// are DERIVED per (version, student) at serve/grade time from the serve seed
// (the ordering-shuffle seam) — the document stores only the template.
//
// RESERVED NAMES (R5): bare-name key expressions run through mathjs, whose
// namespace already owns e, pi, mean, … — a variable named `e` would shadow
// (or be shadowed by) the constant depending on evaluator internals, so those
// names are refused at the schema boundary AND by the importer. The list
// lives HERE (the validation site — schema cannot import the evaluator
// package without inverting the dependency); graph-kit's evaluator suite
// guards the direction that matters: every mathjs builtin an expression can
// reach bare-name is on this list (see evaluate.test.ts).
// `x` and `y` are ours, not mathjs's: they are the function-variable spelling
// every parser in this repo binds.
// =============================================================================

import { z } from 'zod';

export const RESERVED_SEED_NAMES: readonly string[] = [
  // mathjs constants
  'e', 'pi', 'tau', 'phi', 'i',
  // the repo's function variables
  'x', 'y',
  // mathjs functions a key expression can call bare-name
  'mean', 'median', 'mode', 'min', 'max', 'sum', 'std', 'variance',
  'abs', 'sqrt', 'cbrt', 'log', 'log2', 'log10', 'exp',
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'round', 'floor', 'ceil', 'sign', 'mod', 'gcd', 'lcm', 'pow', 'random',
  // literals
  'true', 'false', 'null',
];

const SEED_NAME_RE = /^[a-z][a-z0-9_]*$/;

// int(min, max) — one integer draw, inclusive both ends.
// list(values) — one draw from an authored list (the nice-numbers lever).
// sample(n, min, max) — n DISTINCT integer draws (the statistics case).
export const SeedVarSpec = z
  .discriminatedUnion('kind', [
    z.object({ kind: z.literal('int'), min: z.number().int(), max: z.number().int() }),
    z.object({ kind: z.literal('list'), values: z.array(z.number()).min(1) }),
    z.object({
      kind: z.literal('sample'),
      n: z.number().int().min(1),
      min: z.number().int(),
      max: z.number().int(),
    }),
  ])
  // Range refinements live on the union (zod v3's discriminatedUnion refuses
  // ZodEffects members, so per-member .refine cannot).
  .superRefine((spec, ctx) => {
    if (spec.kind !== 'list' && spec.min > spec.max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${spec.kind}: min must be ≤ max`,
      });
    }
    if (spec.kind === 'sample' && spec.n > spec.max - spec.min + 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'sample: n asks for more distinct values than the range holds',
      });
    }
  });
export type SeedVarSpec = z.infer<typeof SeedVarSpec>;

export const SeedVar = z.object({
  name: z
    .string()
    .regex(SEED_NAME_RE, {
      message: 'seed variable names are lowercase: [a-z][a-z0-9_]*',
    })
    .refine((n) => !RESERVED_SEED_NAMES.includes(n), {
      message: 'this name is reserved (mathjs constant/function, or x/y)',
    }),
  spec: SeedVarSpec,
});
export type SeedVar = z.infer<typeof SeedVar>;

// The meta field's array — names must be unique (two declarations of `a`
// would make the second silently win or lose depending on walk order).
export const SeedVars = z.array(SeedVar).superRefine((vars, ctx) => {
  const seen = new Set<string>();
  for (const v of vars) {
    if (seen.has(v.name)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `duplicate seed variable name "${v.name}"`,
      });
    }
    seen.add(v.name);
  }
});
export type SeedVars = z.infer<typeof SeedVars>;
