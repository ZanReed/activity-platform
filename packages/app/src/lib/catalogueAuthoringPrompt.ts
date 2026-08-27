// =============================================================================
// catalogueAuthoringPrompt.ts — the prompt for authoring the CURRICULUM catalogue
// -----------------------------------------------------------------------------
// The second of two prompts, and the difference between them is the whole
// reason this file exists.
//
//   MARKDOWN_IMPORT_AI_PROMPT  — a TEACHER pasting markdown into the app. No
//                                registry, no catalogue, no row to identify.
//   CATALOGUE_AUTHORING_PROMPT — the curriculum builder writing .md files that
//                                `pnpm import:batch` reads, against registries
//                                that can validate what it writes.
//
// WHY THE CATALOGUE HALF IS NOT TAUGHT TO TEACHERS. `key:` is row identity and
// is meaningless in a paste. Skill and misconception ids are validated against
// registries the teacher's assistant has never seen, and an assistant with no
// registry invents plausible-looking ids — which fragments the very data the
// ids exist to aggregate. Two prompts, two audiences; the batch path is the one
// that can validate, so it is the one that teaches the ids.
//
// ⚠ THIS FILE COMPOSES, IT DOES NOT COPY. The shared half is included by
// reference (MARKDOWN_IMPORT_AI_PROMPT, verbatim) rather than restated, because
// a hand-maintained second copy of the format rules is precisely the drift the
// curriculum builder names as its system's known weak point — it keeps one such
// copy today and this prompt is what retires it. `catalogueAuthoringPrompt
// .test.ts` fails the build if the shared half stops being verbatim, if this
// prompt starts teaching `unit:`, or if any key it teaches stops being one the
// real parser accepts.
//
// ⚠ IT MUST NOT TEACH `unit:`. The chain registry is the source of a unit
// title; a file's own `unit:` is a deliberate override that the importer
// reports. An assistant emits a ```meta fence on EVERY reply, so a prompt that
// taught `unit:` would make every drafted file an override and the override
// report would fire on 100% of the catalogue — a report that cries wolf on
// every row is a report nobody reads the real divergence out of.
// =============================================================================

import { MARKDOWN_IMPORT_AI_PROMPT } from './markdownImportPrompt';

const CATALOGUE_SECTION = [
    'CATALOGUE FILES — additional rules for the batch importer',
    'Everything above still applies. These rules apply ONLY to .md files in the',
    'curriculum catalogue, which are imported with `pnpm import:batch`.',
    '',
    'THE META FENCE CARRIES THREE EXTRA KEYS',
    '- key: act.<domain>.<name>',
    '  The activity\'s PERMANENT identity, e.g. `key: act.rate.unit-rate`. Mint it',
    '  once. Never change it, and never reuse the key of an activity that was',
    '  deleted. It is what lets a file be moved, renamed or re-filed without the',
    '  activity losing its history — the importer matches on this, not on the',
    '  file path. Every catalogue file must have one.',
    '- skill: <domain>.<name>',
    '  The ONE primary skill the activity targets, e.g. `skill: rate.unit-rate`.',
    '  Exactly one. It is checked against the skill registry, and an id that is',
    '  not registered is an error, not a new skill — an unregistered id makes the',
    '  activity count towards nothing.',
    '- supporting_skills: <id>, <id>',
    '  Optional. Other skills the activity touches. Same registry, same check.',
    '  Note the spelling: `skill` is the primary, `supporting_skills` is the rest.',
    '  There is no `skills:` key.',
    '',
    '- chain_role: consolidation',
    '  ONLY on a chain\'s closing activity — the one that teaches no new skill,',
    '  interleaves the chain\'s skills so the student must decide which applies,',
    '  and carries the chain\'s exit check. Its `skill:` is the chain\'s TERMINAL',
    '  skill, which an earlier activity already taught in full. Omit the key',
    '  entirely on every other activity; absent means `part`.',
    '',
    'DO NOT WRITE A unit: KEY',
    '- The unit an activity is filed under comes from its chain, through the',
    '  catalogue\'s chain registry. Writing `unit:` in a file overrides that, and',
    '  the import reports every file that does so. Leave it out.',
    '',
    'MISCONCEPTION BINDINGS',
    '- A wrong answer worth anticipating can name the misconception it senses, by',
    '  appending a third segment: {{12 | !21 :: digits reversed :: mis.place-value.digit-reversal}}',
    '  and, on a multiple-choice distractor: ( ) $4 per kg :: mis.roc.uses-endpoint-value',
    '- Ids come from the misconception registry. NEVER invent one. If a wrong',
    '  answer is worth anticipating and has no id, write the feedback text and',
    '  leave a note for a human to add the id — an unregistered id fragments the',
    '  data it exists to aggregate.',
    '- A binding that can never fire is worse than none, because the data then',
    '  reports that no student made the mistake. Two traps:',
    '  * a `!` wrong answer that is actually equal to the correct answer never',
    '    fires, because correctness is decided first;',
    '  * pick numbers so the anticipated wrong answer is EXACT. If the mistake is',
    '    "divided the wrong way", choose values whose inverse terminates (3/5,',
    '    4/20). A non-terminating inverse fires for some students and not others,',
    '    so the count is biased while looking healthy.',
    '',
    'NEVER PUT A BLANK INSIDE MATHS',
    '- A {{...}} blank inside $...$ or $$...$$ is not a blank. It is absorbed into',
    '  the equation, so the ANSWER is shown to the student, the question is not',
    '  marked, and any misconception binding is lost.',
    '- Write the blank in the prose around the equation, or use \\gap{answer}',
    '  INSIDE the equation. \\gap grades correctly and does not leak the answer,',
    '  but it cannot carry a misconception binding — so if the item needs a',
    '  sensor, the blank belongs outside the maths.',
    '',
    'KEYS BEGINNING x_ ARE YOURS',
    '- Any meta key starting `x_` is ignored by the importer: not stored, not',
    '  validated, not warned about. Use them for your own bookkeeping, e.g.',
    '  `x_review_skills:` and `x_dol_skills:`. Because nothing validates them, a',
    '  typo in one of these names is silent — the import prints a receipt naming',
    '  every x_ key it ignored, and that line is the only place a typo shows up.',
].join('\n');

/** The catalogue-authoring prompt: the shared format rules, verbatim, plus the
 *  catalogue-only rules. One file for the curriculum builder to point at, so
 *  the copy it keeps by hand can be retired. */
export const CATALOGUE_AUTHORING_PROMPT = [
    MARKDOWN_IMPORT_AI_PROMPT,
    '',
    CATALOGUE_SECTION,
].join('\n');
