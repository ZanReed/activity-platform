// =============================================================================
// sanitized-types.test-d.ts — the type-level half of the leak guard (S2)
// -----------------------------------------------------------------------------
// sanitize.test.ts proves the RUNTIME strips the secrets; this file proves the
// TYPES say so — that SanitizedBlock genuinely lacks the answer-key fields, so
// viewer code that reaches for `block.solution` fails to COMPILE rather than
// reading undefined at runtime.
//
// This is a PURE type module: it is checked by `pnpm typecheck` (the package
// script runs tsc over tsconfig.tests.json, which includes tests/), NOT
// executed by vitest. Vitest 1.6's typecheck mode silently reported "no
// errors" on deliberately broken assertions here (red-green verified), so the
// plain tsc pass — which does catch them — is the enforcement.
// =============================================================================

import { expectTypeOf } from 'vitest';
import type { ActivityDocument } from '@activity/schema';
import { sanitizeActivityDocument } from '../src/index.js';
import type {
  SanitizedActivityDocument,
  SanitizedBlankToken,
  SanitizedBlock,
  SanitizedMathPrompt,
} from '../src/index.js';

type ByType<T extends SanitizedBlock['type']> = Extract<
  SanitizedBlock,
  { type: T }
>;

// ---- entry point ties the two halves together -------------------------------
expectTypeOf(sanitizeActivityDocument).parameter(0).toEqualTypeOf<ActivityDocument>();
expectTypeOf(sanitizeActivityDocument).returns.toEqualTypeOf<SanitizedActivityDocument>();

// ---- in-band carriers -------------------------------------------------------
expectTypeOf<SanitizedBlankToken>().not.toHaveProperty('answer');
expectTypeOf<SanitizedBlankToken>().not.toHaveProperty('acceptableAnswers');
expectTypeOf<SanitizedBlankToken>().not.toHaveProperty('mistakeFeedback');
expectTypeOf<SanitizedBlankToken>().toHaveProperty('hint'); // survives
expectTypeOf<SanitizedBlankToken>().toHaveProperty('answerType'); // survives
expectTypeOf<SanitizedMathPrompt>().not.toHaveProperty('answer');
expectTypeOf<SanitizedMathPrompt>().not.toHaveProperty('acceptableAnswers');
expectTypeOf<SanitizedMathPrompt>().toHaveProperty('id'); // the gap itself

// ---- block-level strips -----------------------------------------------------
expectTypeOf<ByType<'fill_in_blank'>>().not.toHaveProperty('solution');
expectTypeOf<ByType<'math_block'>>().not.toHaveProperty('solution');
expectTypeOf<ByType<'matching'>>().not.toHaveProperty('key');
expectTypeOf<ByType<'matching'>>().not.toHaveProperty('solution');
expectTypeOf<ByType<'ordering'>>().not.toHaveProperty('solution');
expectTypeOf<ByType<'short_answer'>>().not.toHaveProperty('rubric');
expectTypeOf<ByType<'essay'>>().not.toHaveProperty('rubric');
expectTypeOf<ByType<'interactive_graph'>>().not.toHaveProperty('mistakeFeedback');
expectTypeOf<ByType<'interactive_graph'>>().not.toHaveProperty('noSolutionCorrect');
expectTypeOf<ByType<'interactive_graph'>>().toHaveProperty('allowNoSolution'); // survives

// ---- nested strips ----------------------------------------------------------
type Choice = ByType<'multiple_choice'>['choices'][number];
expectTypeOf<Choice>().not.toHaveProperty('correct');
expectTypeOf<Choice>().not.toHaveProperty('feedback');
expectTypeOf<Choice>().toHaveProperty('content');

type GraphInteractionServed = ByType<'interactive_graph'>['interaction'];
type PlotPointServed = Extract<GraphInteractionServed, { type: 'plot_point' }>;
expectTypeOf<PlotPointServed>().not.toHaveProperty('correctPoints');
expectTypeOf<PlotPointServed>().not.toHaveProperty('tolerance');
type PlotFunctionServed = Extract<GraphInteractionServed, { type: 'plot_function' }>;
expectTypeOf<PlotFunctionServed>().not.toHaveProperty('models');

type NumberLineServed = ByType<'number_line'>['interaction'];
expectTypeOf<Extract<NumberLineServed, { type: 'plot_interval' }>>().not.toHaveProperty(
  'correctInterval',
);

type BoxplotServed = Extract<
  ByType<'data_plot'>['interaction'],
  { type: 'build_boxplot' }
>;
expectTypeOf<BoxplotServed>().not.toHaveProperty('tolerance');
expectTypeOf<ByType<'data_plot'>>().toHaveProperty('data'); // whitelisted residual

// ---- child recursion: a nested fill_in_blank is stripped like a top-level one
type FadedChild = ByType<'faded_worked_example'>['content'][number];
type NestedFib = Extract<FadedChild, { type: 'fill_in_blank' }>;
expectTypeOf<NestedFib>().not.toHaveProperty('solution');
type NestedFibInline = NestedFib['content'][number];
type NestedBlank = Extract<NestedFibInline, { type: 'blank' }>;
expectTypeOf<NestedBlank>().not.toHaveProperty('answer');
