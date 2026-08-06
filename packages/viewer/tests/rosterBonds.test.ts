// =============================================================================
// rosterBonds.test.ts — hand-lists that restate registry facts, bonded (A7/A8)
// -----------------------------------------------------------------------------
// The grading walk keeps two private rosters (free-text types, graph types)
// that restate facts the registry already declares. Hand-lists rot; derived
// lists self-adapt (policy P4 — the S0/S5 roster lesson). The walk deliberately
// does not import the registry to derive them (the grading bundle stays lean),
// so these set-equality bonds are the guard: add a type to one side and not
// the other, and the failure names the side you forgot.
//
// The counterexample that proved these bondable sits in the same package:
// census.ts refuses a second walk and imports the grader's inventory, pinned
// by an id-set-equality test of exactly this shape (s4-retro finding 10).
// =============================================================================

import { describe, expect, it } from 'vitest';

import {
  blockRegistry,
  registeredBlockTypes,
} from '../src/registry/registry.js';
import {
  FREE_TEXT_TYPES,
  GRAPH_TYPES,
} from '../src/server/grading/walk.js';
import { PROMPT_CARRIER_TYPES } from '../src/sanitize/promptCarriers.js';

describe('grading-walk rosters ↔ registry (A7)', () => {
  it("FREE_TEXT_TYPES === the registry's family 'recorded'", () => {
    const recorded = registeredBlockTypes.filter(
      (type) => blockRegistry[type].family === 'recorded',
    );
    expect([...FREE_TEXT_TYPES].sort()).toEqual([...recorded].sort());
  });

  it('GRAPH_TYPES === the registry types whose sanitize derives a question shape', () => {
    // deriveQuestionShape is the registry's own marker for "the widget needs
    // shape from the answer key" — exactly the types the walk routes to the
    // graph scorers. A new graph-kit-backed type declares it (the add-a-block
    // checklist) and this bond then fails until the walk learns to grade it.
    const derived = registeredBlockTypes.filter(
      (type) => blockRegistry[type].sanitize?.deriveQuestionShape === true,
    );
    expect([...GRAPH_TYPES].sort()).toEqual([...derived].sort());
  });

  it('PROMPT_CARRIER_TYPES is single-sourced and pinned', () => {
    // Content pin only — sanitize.ts and grading/walk.ts now import the ONE
    // declaration (promptCarriers.ts), so cross-module drift is impossible by
    // construction; what this guards is the roster's content moving without a
    // deliberate review of both consumers.
    expect([...PROMPT_CARRIER_TYPES].sort()).toEqual([
      'math_block',
      'math_inline',
    ]);
  });
});

describe('shuffleLockedBy scope (A8 — s5.5 audit missed-8)', () => {
  // Types for which the AUTHORED arrangement gives the answer away:
  //   - ordering: the authored order IS the answer key, literally.
  //   - matching: the authored bank aligns 1:1 with the prompts, so an
  //     unshuffled bank is a positional answer key.
  // `shuffleLockedBy` exists so a TEACHER can opt a block out of shuffling
  // ("all of the above" MC questions, D17A). Declaring it on a type above
  // would put "print the answer key on every worksheet" behind one innocent
  // registry line — the exact defect the outside voice caught pre-build in
  // S5.5 (D15A). Hand-maintained with reason (P4): membership is a semantic
  // fact the registry cannot derive; grow it when a type whose arrangement
  // encodes its key lands.
  const ARRANGEMENT_IS_THE_ANSWER = ['ordering', 'matching'] as const;

  it('no arrangement-is-the-answer type declares a shuffle lock', () => {
    for (const type of ARRANGEMENT_IS_THE_ANSWER) {
      expect(
        blockRegistry[type].print.shuffleLockedBy,
        `${type} declares print.shuffleLockedBy — its authored arrangement ` +
          `encodes the answer key, so a per-block opt-out reintroduces D15A ` +
          `(an unshuffled ${type} on paper IS the key).`,
      ).toBeUndefined();
    }
  });

  it('every declared shuffle lock sits on a type that also declares shuffled fields', () => {
    // A lock without a shuffle is a dead flag; a shuffle-locked type must be
    // opting out of something that exists.
    for (const type of registeredBlockTypes) {
      const print = blockRegistry[type].print;
      if (print.shuffleLockedBy !== undefined) {
        expect(
          print.shuffled,
          `${type} declares shuffleLockedBy but no shuffled fields`,
        ).toBeDefined();
        expect(print.shuffled!.length).toBeGreaterThan(0);
      }
    }
  });
});
