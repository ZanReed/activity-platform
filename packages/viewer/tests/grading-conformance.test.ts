// =============================================================================
// grading-conformance.test.ts — the real engine vs the mock S3 was built against
// -----------------------------------------------------------------------------
// Every one of the 22 block components, the family conformance factory, and the
// /dev/viewer harness were built and tested against `createMockCheckService`.
// The mock IS the behavior the client assumes. Shared TypeScript types catch
// SHAPE drift between it and the real grader; they cannot catch BEHAVIOR drift,
// and behavior is what the components consume.
//
// wire.ts says it out loud: "the mock can never silently become its own
// divergent spec". This file is what makes that true. It runs the same
// scenarios through both implementations and asserts the invariants the client
// actually relies on:
//
//   1. no invented ids — every returned item was in the request
//   2. free text is 'recorded', never judged
//   3. solutions are keyed by BLOCK id
//   4. wireVersion + sectionId are echoed
//
// It also pins the ONE deliberate difference, rather than leaving it to be
// discovered on swap day: the real engine OMITS unanswered items, while the
// scripted mock answers every id it is handed. See the last describe block.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { authoredFixtureDocument } from '../src/fixtures/index.js';
import { createMockCheckService } from '../src/check/mock.js';
import {
  CHECK_WIRE_VERSION,
  emptySectionResponses,
  type SectionCheckResult,
  type SectionResponses,
} from '../src/check/wire.js';
import { gradeSection } from '../src/server/grading/index.js';
import { findSection, inventorySection } from '../src/server/grading/walk.js';

const doc = authoredFixtureDocument() as unknown as {
  sections: Array<{ id: string }>;
};
const sectionId = doc.sections[0]!.id;
const inv = inventorySection(findSection(doc as never, sectionId)!);

/** A realistic, fully-answered submission: every family exercised at once. */
function fullSubmission(): SectionResponses {
  const r = emptySectionResponses();
  for (const g of inv.blankGroupsByBlock) {
    for (const key of g.keys) r.blanks[key.id] = key.answers[0] ?? 'x';
  }
  for (const mc of inv.multipleChoice) r.choices[mc.blockId] = mc.correctIds;
  for (const m of inv.matching) r.matches[m.blockId] = m.key;
  for (const o of inv.ordering) r.orderings[o.blockId] = o.authoredOrder;
  for (const f of inv.freeText) r.freeText[f] = 'a written answer';
  return r;
}

/** Every id the request carried, across all categories. */
function requestedIds(r: SectionResponses): Set<string> {
  return new Set([
    ...Object.keys(r.blanks),
    ...Object.keys(r.choices),
    ...Object.keys(r.matches),
    ...Object.keys(r.orderings),
    ...Object.keys(r.freeText),
    ...Object.keys(r.graphs),
  ]);
}

async function bothImplementations(
  responses: SectionResponses,
): Promise<Array<{ name: string; result: SectionCheckResult }>> {
  const mock = createMockCheckService();
  const mockResult = await mock.checkSection({
    wireVersion: CHECK_WIRE_VERSION,
    activityId: 'a',
    versionId: 'v',
    sectionId,
    responses,
  });
  const realResult = gradeSection({
    document: doc as never,
    sectionId,
    responses,
  });
  return [
    { name: 'mock', result: mockResult },
    { name: 'real', result: realResult },
  ];
}

describe('both implementations satisfy the contract the components rely on', () => {
  it('never invents an item id the request did not carry', async () => {
    // A component looks its verdict up by its own id. An id the client does
    // not recognise is a verdict nobody can render — invisible on screen and
    // invisible in a green test run.
    const responses = fullSubmission();
    const asked = requestedIds(responses);
    for (const { name, result } of await bothImplementations(responses)) {
      for (const id of Object.keys(result.items)) {
        expect(asked.has(id), `${name} returned unrequested id ${id}`).toBe(true);
      }
    }
  });

  it('marks free text recorded and never judges it', async () => {
    const responses = fullSubmission();
    expect(inv.freeText.length).toBeGreaterThan(0);
    for (const { name, result } of await bothImplementations(responses)) {
      for (const blockId of inv.freeText) {
        expect(result.items[blockId]?.verdict, `${name} judged free text`).toBe(
          'recorded',
        );
      }
    }
  });

  it('never returns recorded for an auto-gradable item', async () => {
    // The mirror of the rule above: 'recorded' means "your teacher will read
    // this". On a multiple-choice question it would be a lie.
    const responses = fullSubmission();
    const autoGradable = new Set([
      ...inv.multipleChoice.map((m) => m.blockId),
      ...inv.matching.map((m) => m.blockId),
      ...inv.ordering.map((o) => o.blockId),
      ...inv.blankGroupsByBlock.flatMap((g) => g.keys.map((k) => k.id)),
    ]);
    for (const { name, result } of await bothImplementations(responses)) {
      for (const [id, item] of Object.entries(result.items)) {
        if (!autoGradable.has(id)) continue;
        expect(item.verdict, `${name} recorded an auto-gradable item`).not.toBe(
          'recorded',
        );
      }
    }
  });

  it('echoes the wire version and section id', async () => {
    for (const { name, result } of await bothImplementations(fullSubmission())) {
      expect(result.wireVersion, name).toBe(CHECK_WIRE_VERSION);
      expect(result.sectionId, name).toBe(sectionId);
    }
  });

  it('keys solutions by block id, never by item id', async () => {
    // Blanks are keyed by BLANK id in `items` but their solution belongs to the
    // owning BLOCK. Mixing the two would silently unlock nothing.
    const blockIds = new Set(inv.solutions.map((s) => s.blockId));
    const real = gradeSection({
      document: doc as never,
      sectionId,
      responses: fullSubmission(),
    });
    expect(Object.keys(real.solutions).length).toBeGreaterThan(0);
    for (const id of Object.keys(real.solutions)) {
      expect(blockIds.has(id)).toBe(true);
    }
  });

  it('returns a verdict from the closed union only', async () => {
    const allowed = new Set(['correct', 'incorrect', 'recorded']);
    for (const { name, result } of await bothImplementations(fullSubmission())) {
      for (const item of Object.values(result.items)) {
        expect(allowed.has(item.verdict), `${name}: ${item.verdict}`).toBe(true);
      }
    }
  });
});

describe('the one deliberate difference, pinned rather than discovered', () => {
  it('the real engine OMITS unanswered items; the mock answers everything it is handed', async () => {
    // Not a bug in either. The mock is scripted, so it has no notion of "the
    // student left this blank" — it grades whatever id it receives. The real
    // engine drops unanswered items so the viewer shows no mark at all, which
    // is the ruled behavior (an omission is not a wrong answer).
    //
    // This is safe for the client: container/context.tsx `resultFor` returns
    // undefined for a missing id, and every component already renders that as
    // the unmarked state. Pinned here so the difference stays a known property
    // instead of surfacing as "some answers show no tick" after the swap.
    const responses = emptySectionResponses();
    const blankId = inv.blankGroupsByBlock[0]!.keys[0]!.id;
    responses.blanks[blankId] = '   '; // whitespace: an omission

    const [{ result: mockResult }, { result: realResult }] =
      await bothImplementations(responses);

    expect(mockResult!.items[blankId]).toBeDefined();
    expect(realResult!.items[blankId]).toBeUndefined();
  });

  it('agrees exactly once every submitted answer is real', async () => {
    // With nothing omitted, the two must cover the SAME id set — which is what
    // makes the difference above precisely "omission", and not a second,
    // unnoticed divergence hiding behind it.
    const responses = fullSubmission();
    const [{ result: mockResult }, { result: realResult }] =
      await bothImplementations(responses);

    const mockIds = new Set(Object.keys(mockResult!.items));
    const realIds = new Set(Object.keys(realResult!.items));
    expect([...realIds].sort()).toEqual([...mockIds].sort());
  });
});
