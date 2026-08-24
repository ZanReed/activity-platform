// =============================================================================
// state-budget.test.mjs — STATE.md is measured in WORDS, not lines
// -----------------------------------------------------------------------------
// CLAUDE.md's rule was "keep STATE under ~150 lines" from the beginning, and it
// was broken continuously: the file sat 55% over for weeks while nobody noticed,
// because the metric rewarded the wrong thing. A row written as one unwrapped
// 1,273-character line costs the line budget ONE line. STATE had thirteen lines
// over 400 characters and fifteen more over 200 — so the cheapest way to satisfy
// the rule was to write longer lines, which is the opposite of what it wants.
//
// Measured 2026-08-24: a cleanup removed 19% of STATE's CONTENT (4,526 → 3,673
// words) and moved the line count 239 → 232. The line count is noise.
//
// TWO NUMBERS, on purpose:
//
//   TARGET  — the faithful conversion of the old rule. This repo's wrapped prose
//             runs ~9-12 words per line (CLAUDE.md 8.8, DECISIONS.md 11.7), so
//             ~150 lines ≈ 1,500 words. This is what STATE should be when it is
//             doing only its own job.
//
//   CEILING — what this test ENFORCES. Deliberately far above TARGET, because
//             STATE is currently ~2.4x over and that is a RULED, TEMPORARY
//             state (see below). The ceiling exists to stop the ratchet, not to
//             force the cut: it fails the build if STATE grows, and says nothing
//             while it holds or shrinks.
//
// ⚠ WHY THE OVER-RUN IS DELIBERATE AND MUST NOT BE "FIXED" YET (author ruling,
// 2026-08-24). STATE is the holding pen for constraints that are still MOVING.
// Reducing it means HARDENING those constraints into CLAUDE.md and
// DECISIONS.md — and those are the two documents you least want wrong, because
// they are read as settled. Hardening a constraint while the code it describes
// is still being bug-fixed records the wrong constraint, durably, in the place
// that is hardest to correct. So the cut waits for the re-architecture's bug
// tail to close. Until then the ceiling holds the line and the target is a
// direction, not a deadline.
//
// RAISING THE CEILING IS A DECISION, NOT A CHORE. If this fails, the first
// question is whether the new content belongs in STATE at all — HISTORY takes
// finished narratives, TODOS takes open work with an owner, CLAUDE.md takes
// standing rules, DECISIONS.md takes durable reasoning, and a live-state
// snapshot belongs in no document (it is a command). The 2026-08-24 re-filing
// found that of thirteen items under "Pending author actions", THREE were
// pending author actions.
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** What STATE should be when it is doing only its own job (~150 lines of
 *  wrapped prose at this repo's measured 9-12 words/line). */
export const STATE_WORD_TARGET = 1500;

/** What is ENFORCED today. Set just above the 2026-08-24 post-cleanup
 *  measurement (3,673 words) so the current arc's remaining bug-fix notes fit,
 *  and nothing else does. Lower it as the arc closes; never raise it to make a
 *  failing commit pass. */
export const STATE_WORD_CEILING = 4000;

function wordsIn(file) {
  return readFileSync(join(repo, file), 'utf8').split(/\s+/).filter(Boolean).length;
}

test('STATE.md is within its word ceiling', () => {
  const words = wordsIn('STATE.md');
  assert.ok(
    words <= STATE_WORD_CEILING,
    `STATE.md is ${words} words, over the ${STATE_WORD_CEILING} ceiling by ` +
      `${words - STATE_WORD_CEILING}.\n` +
      '  Do NOT raise the ceiling to make this pass. Ask where the new content ' +
      'actually belongs:\n' +
      '    finished narrative + evidence  → docs/HISTORY.md\n' +
      '    open work with an owner        → TODOS.md\n' +
      '    a standing rule (never/always) → CLAUDE.md (STATE gets REPLACED; a ' +
      'rule there has an expiry date)\n' +
      '    durable reasoning              → docs/DECISIONS.md\n' +
      '    a live number (counts, versions, sizes) → NO document. It is a ' +
      'command; STATE carries the commands.\n' +
      `  Target when the arc closes: ${STATE_WORD_TARGET} words.`,
  );
});

test('the ceiling has not been quietly raised past the point of meaning', () => {
  // A ceiling that can be edited as freely as the file it guards is not a
  // ceiling. This pins the ORDER of the two numbers and a hard upper bound on
  // the ceiling itself, so raising it enough to matter has to break a test that
  // says why.
  assert.ok(
    STATE_WORD_TARGET < STATE_WORD_CEILING,
    'the target must sit below the ceiling — otherwise the ceiling IS the target',
  );
  assert.ok(
    STATE_WORD_CEILING <= 4500,
    'the ceiling is above 4,500 words. That is roughly 3x the target and past ' +
      'the point where STATE is a snapshot at all. If the arc genuinely needs ' +
      'this much in-flight context, the thing to change is which document holds ' +
      'it — not this number.',
  );
});
