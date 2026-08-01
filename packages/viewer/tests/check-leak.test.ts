// =============================================================================
// check-leak.test.ts — wire-level leak tests for the CHECK RESPONSE (S4 T5)
// -----------------------------------------------------------------------------
// S2 proved the read path never ships an answer key. S4 opened a SECOND
// server→client channel with a different rule, and that difference is the whole
// reason this file exists separately:
//
//   the read path releases NOTHING secret, ever.
//   the check response releases SOME secrets, deliberately, AFTER a check —
//   the authored solution, the matching mistakeFeedback, the hint.
//
// So a blanket "no sentinel anywhere" scan is the wrong test here: it would go
// red on content the channel is supposed to carry. What must never travel is
// the ANSWER ITSELF, and the distinction is not a naming convention — it is
// per-field, so this suite encodes it per-field.
//
// The scan is VALUE-BASED, not key-name-based. Key-name scanning misses the
// leak that actually matters: a value copied into a differently-named field
// still hands the student the answer. So this walks the raw fixture, collects
// every scalar stored under a never-release field, and asserts none of those
// values appear anywhere in the serialized response.
//
// Fixture is the SHARED one (tests/helpers/leakFixture.ts) — every block type,
// every interaction variant, every secret field populated. Both channels scan
// the same document, so a new secret field is declared once and neither suite
// can silently miss it.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { RELEASABLE, fullyLoadedDocument } from './helpers/leakFixture.js';
import { gradeSection } from '../src/server/grading/index.js';
import { findSection, inventorySection } from '../src/server/grading/walk.js';
import { emptySectionResponses, type SectionResponses } from '../src/check/wire.js';

/**
 * Fields whose VALUES must never reach a student, on any channel, ever.
 *
 * `mistakeFeedback` is a deliberate half-member: its `feedback` content IS
 * released after a check (ruling 2.1A), but its `match` string is the
 * anticipated WRONG ANSWER — releasing the set of wrong answers a teacher
 * predicted tells a student a great deal about the right one. So `match` is
 * scanned and `feedback` is not; see collectForbiddenValues.
 */
const NEVER_RELEASE = [
  'answer',
  'acceptableAnswers',
  'tolerance',
  'equivalence',
  'correct',
  'key',
  'correctPoints',
  'models',
  'regions',
  'inequalities',
  'correctInterval',
  'rays',
  'segments',
  'noSolutionCorrect',
  'rubric',
  'minOverlap',
  'correctVertices',
];

/**
 * Fields the check channel MAY release after a section check. Their contents
 * are skipped by the collector — otherwise the solution text a student is
 * supposed to read would be indistinguishable from a leak.
 */
const RELEASABLE_FIELDS = new Set(['solution', 'hint', 'feedback']);

/** Every scalar stored anywhere under a never-release field. */
function collectForbiddenValues(value: unknown, out = new Set<string>()): Set<string> {
  const harvest = (v: unknown): void => {
    if (v === null || v === undefined) return;
    if (typeof v === 'string') {
      // Very short strings ('a', '1') collide with ordinary markup and would
      // make the scan meaningless. Real answer material is longer, and the
      // fixture's sentinels are deliberately long.
      if (v.length >= 4) out.add(v);
      return;
    }
    if (typeof v === 'number') {
      if (String(v).length >= 4) out.add(String(v));
      return;
    }
    if (Array.isArray(v)) {
      for (const item of v) harvest(item);
      return;
    }
    if (typeof v === 'object') {
      for (const item of Object.values(v)) harvest(item);
    }
  };

  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (node === null || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      if (RELEASABLE_FIELDS.has(k)) continue; // legitimately returned post-check
      if (NEVER_RELEASE.includes(k)) {
        harvest(v);
        // Keep descending: a nested `answer` under `models` still counts.
      }
      walk(v);
    }
  };

  walk(value);
  return out;
}

const doc = fullyLoadedDocument() as unknown as {
  sections: Array<{ id: string }>;
};
const sectionId = doc.sections[0]!.id;
const inv = inventorySection(findSection(doc as never, sectionId)!);

/**
 * A worst-case submission: every question answered, and answered WRONG, so the
 * response carries as much authored feedback as the document can produce. A
 * correct-answer scan would exercise far less of the release path.
 */
function wrongAnswerSubmission(): SectionResponses {
  const r = emptySectionResponses();
  for (const g of inv.blankGroupsByBlock) {
    for (const key of g.keys) r.blanks[key.id] = 'deliberately-wrong-answer';
  }
  for (const mc of inv.multipleChoice) {
    // Select EVERY choice: maximises how much per-choice feedback is released.
    r.choices[mc.blockId] = mc.choices.map((c) => c.id);
  }
  for (const m of inv.matching) {
    const [firstItem] = m.itemIds;
    if (firstItem) r.matches[m.blockId] = { [firstItem]: 'wrong-target' };
  }
  for (const o of inv.ordering) {
    r.orderings[o.blockId] = [...o.authoredOrder].reverse();
  }
  for (const f of inv.freeText) r.freeText[f] = 'a written answer';
  for (const g of inv.graphs) {
    r.graphs[g.blockId] = {
      interaction: String(g.block.interaction?.type ?? ''),
      points: [[999, 999]],
    };
  }
  return r;
}

describe('the check response never carries an answer (S4-4)', () => {
  const forbidden = collectForbiddenValues(doc);
  const result = gradeSection({
    document: doc as never,
    sectionId,
    responses: wrongAnswerSubmission(),
  });
  const wire = JSON.stringify(result);

  it('the fixture really does contain answer material to leak', () => {
    // Guards the whole suite against passing vacuously — the exact trap that
    // once made an EMPTY activity look like a clean leak scan.
    expect(forbidden.size).toBeGreaterThan(8);
    const raw = JSON.stringify(doc);
    for (const value of forbidden) expect(raw).toContain(value);
  });

  it('grades a real, fully-populated section (not an empty one)', () => {
    // Same guard, other end: a response with no items would trivially contain
    // no answers.
    expect(Object.keys(result.items).length).toBeGreaterThan(5);
    expect(Object.keys(result.solutions).length).toBeGreaterThan(5);
  });

  it('leaks NO answer-bearing value into the serialized response', () => {
    const leaked = [...forbidden].filter((value) => wire.includes(value));
    expect(
      leaked,
      `these answer values reached the student: ${leaked.slice(0, 5).join(', ')}`,
    ).toEqual([]);
  });

  it('carries no answer-key FIELD NAME either', () => {
    // Weaker than the value scan above, and kept as a second net: a field that
    // survived whole would show up here even if its value happened to be short
    // enough for the collector to skip.
    const present = new Set<string>();
    const walk = (node: unknown): void => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (node === null || typeof node !== 'object') return;
      for (const [k, v] of Object.entries(node)) {
        present.add(k);
        walk(v);
      }
    };
    walk(result);
    for (const name of NEVER_RELEASE) {
      expect(present.has(name), `"${name}" survived into the check response`).toBe(
        false,
      );
    }
  });
});

describe('what the channel IS allowed to release', () => {
  it('releases the RELEASABLE sentinel — proving the unlock actually fires', () => {
    // The fixture plants a distinct marker in every solution / feedback body.
    // Seeing it here is what separates "nothing leaked" from "nothing was
    // returned at all", which would make every leak assertion above vacuous.
    const result = gradeSection({
      document: doc as never,
      sectionId,
      responses: wrongAnswerSubmission(),
    });
    expect(JSON.stringify(result)).toContain(RELEASABLE);
  });

  it('does release solution content after a check (or the unlock is dead)', () => {
    // The mirror of the leak tests: proving nothing leaks is only half the
    // contract. If solutions stopped being released the suite above would go
    // green while the feature silently died.
    const result = gradeSection({
      document: doc as never,
      sectionId,
      responses: wrongAnswerSubmission(),
    });
    const solutionText = JSON.stringify(Object.values(result.solutions));
    expect(solutionText.length).toBeGreaterThan(50);
  });

  it('releases authored feedback for a wrong answer', () => {
    const result = gradeSection({
      document: doc as never,
      sectionId,
      responses: wrongAnswerSubmission(),
    });
    const withFeedback = Object.values(result.items).filter((i) => i.feedback);
    expect(withFeedback.length).toBeGreaterThan(0);
  });

  it('does NOT release the wrong-answer strings a teacher anticipated', () => {
    // mistakeFeedback.match is the set of wrong answers the teacher predicted.
    // Its FEEDBACK is for the student; the match list is not — handing it over
    // narrows the answer space for free.
    const matches = new Set<string>();
    const walk = (node: unknown): void => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (node === null || typeof node !== 'object') return;
      const obj = node as Record<string, unknown>;
      if (Array.isArray(obj.mistakeFeedback)) {
        for (const entry of obj.mistakeFeedback) {
          const m = (entry as { match?: unknown }).match;
          if (typeof m === 'string' && m.length >= 4) matches.add(m);
        }
      }
      for (const v of Object.values(obj)) walk(v);
    };
    walk(doc);
    expect(matches.size).toBeGreaterThan(0);

    const result = gradeSection({
      document: doc as never,
      sectionId,
      responses: wrongAnswerSubmission(),
    });
    const wire = JSON.stringify(result);
    for (const match of matches) {
      expect(wire.includes(match), `mistakeFeedback match "${match}" leaked`).toBe(
        false,
      );
    }
  });
});

describe('the in-band deep walk covers the check channel too', () => {
  it('strips a blank pasted inside an authored solution', () => {
    // The failure this catches: a teacher pastes a worked solution that happens
    // to contain a blank token, and every student who checks receives that
    // blank's answers. Nothing crashes; the answer is simply in the payload.
    const poisoned = structuredClone(doc) as unknown as {
      sections: Array<{
        rows: Array<{ columns: Array<{ blocks: Record<string, unknown>[] }> }>;
      }>;
    };
    const block = poisoned.sections[0]!.rows[0]!.columns[0]!.blocks[0]!;
    block.solution = [
      { type: 'text', text: 'first isolate the variable' },
      {
        type: 'blank',
        id: 'poisoned-blank',
        answer: 'POISONED_ANSWER_VALUE',
        acceptableAnswers: ['POISONED_ALTERNATE_VALUE'],
        tolerance: 987654.321,
      },
    ];

    const wire = JSON.stringify(
      gradeSection({
        document: poisoned as never,
        sectionId,
        responses: emptySectionResponses(),
      }),
    );

    expect(wire).not.toContain('POISONED_ANSWER_VALUE');
    expect(wire).not.toContain('POISONED_ALTERNATE_VALUE');
    expect(wire).not.toContain('987654.321');
    // The readable part still reaches the student — stripping must not gut it.
    expect(wire).toContain('first isolate the variable');
  });

  it('strips a prompted math node pasted inside an authored solution', () => {
    // The same class, via the other in-band carrier: a math_inline carrying
    // `prompts` can appear in ANY content array, which is exactly why the
    // sanitizer walks unconditionally rather than by declaration.
    const poisoned = structuredClone(doc) as unknown as {
      sections: Array<{
        rows: Array<{ columns: Array<{ blocks: Record<string, unknown>[] }> }>;
      }>;
    };
    const block = poisoned.sections[0]!.rows[0]!.columns[0]!.blocks[0]!;
    block.solution = [
      { type: 'text', text: 'substitute and simplify' },
      {
        type: 'math_inline',
        latex: 'x = \\placeholder[g1]{}',
        prompts: [
          {
            id: 'g1',
            answer: 'POISONED_GAP_ANSWER',
            acceptableAnswers: ['POISONED_GAP_ALTERNATE'],
          },
        ],
      },
    ];

    const wire = JSON.stringify(
      gradeSection({
        document: poisoned as never,
        sectionId,
        responses: emptySectionResponses(),
      }),
    );

    expect(wire).not.toContain('POISONED_GAP_ANSWER');
    expect(wire).not.toContain('POISONED_GAP_ALTERNATE');
    expect(wire).toContain('substitute and simplify');
  });
});
