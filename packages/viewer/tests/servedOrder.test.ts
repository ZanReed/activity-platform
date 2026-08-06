// =============================================================================
// servedOrder.test.ts — first DIRECT coverage of computeServedOrderings (A5)
// -----------------------------------------------------------------------------
// Until 2026-08-06 this function — live in every check request, and the thing
// that keeps the ordering omission rule honest about what each student was
// actually served — was exercised by NOTHING at any level: every handler test
// stubs the port it sits behind, and the live Deno wiring is untested by
// definition (s2-retro audit, correction 1). A drift here does not throw; it
// silently marks correct arrangements as omissions for a subset of students.
//
// The load-bearing assertion is the last one: the permutation computed from the
// RAW document equals the permutation the read path serves from the SANITIZED
// document. That equality is the function's whole premise (stated in its
// header); if sanitize ever starts touching item arrays or ids, this is the
// test that goes red.
// =============================================================================

import { describe, expect, it } from 'vitest';

import { computeServedOrderings } from '../src/server/grading/servedOrder.js';
import { serveSeed } from '../src/sanitize/serveSeed.js';
import { applyServeShuffles } from '../src/sanitize/shuffle.js';
import { sanitizeActivityDocument } from '../src/sanitize/sanitize.js';
import type { ActivityDocument } from '@activity/schema';

const VERSION = 'aaaaaaaa-0000-4000-8000-0000000000v1';

function items(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `item-${i}`,
    content: [{ type: 'text', text: `step ${i}` }],
  }));
}

function orderingBlock(id: string, n = 6) {
  return {
    id,
    type: 'ordering',
    prompt: [{ type: 'text', text: 'arrange' }],
    items: items(n),
  };
}

/** Raw (upgraded) document: one top-level ordering block, one nested inside a
 * container-shaped block, one in a second section, one non-ordering block. */
function rawDoc() {
  return {
    schemaVersion: 2,
    meta: { title: 'served-order fixture' },
    sections: [
      {
        id: 'sec-1',
        rows: [
          {
            id: 'r1',
            columns: [
              {
                id: 'c1',
                blocks: [
                  orderingBlock('ord-top'),
                  { id: 'para-1', type: 'paragraph', content: [{ type: 'text', text: 'x' }] },
                  {
                    id: 'wrap-1',
                    type: 'callout',
                    children: [orderingBlock('ord-nested', 4)],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'sec-2',
        rows: [
          {
            id: 'r2',
            columns: [{ id: 'c2', blocks: [orderingBlock('ord-elsewhere')] }],
          },
        ],
      },
    ],
  };
}

const authored = (n = 6) => items(n).map((i) => i.id);

describe('computeServedOrderings', () => {
  it('is deterministic for the same version + student', () => {
    const a = computeServedOrderings(rawDoc(), 'sec-1', VERSION, 'student-1');
    const b = computeServedOrderings(rawDoc(), 'sec-1', VERSION, 'student-1');
    expect(a).toEqual(b);
  });

  it('returns a permutation of the authored item ids, per ordering block', () => {
    const out = computeServedOrderings(rawDoc(), 'sec-1', VERSION, 'student-1');
    expect(Object.keys(out).sort()).toEqual(['ord-nested', 'ord-top']);
    expect([...out['ord-top']!].sort()).toEqual([...authored()].sort());
    expect([...out['ord-nested']!].sort()).toEqual([...authored(4)].sort());
  });

  it('finds ordering blocks nested inside container blocks', () => {
    const out = computeServedOrderings(rawDoc(), 'sec-1', VERSION, 'student-9');
    expect(out['ord-nested']).toBeDefined();
    expect(out['ord-nested']).toHaveLength(4);
  });

  it('scopes to the requested section and returns {} for an unknown one', () => {
    const s1 = computeServedOrderings(rawDoc(), 'sec-1', VERSION, 'student-1');
    expect(s1['ord-elsewhere']).toBeUndefined();
    expect(
      computeServedOrderings(rawDoc(), 'nope', VERSION, 'student-1'),
    ).toEqual({});
  });

  it('never returns the authored order (the never-identity guarantee flows through)', () => {
    // The viewer shuffle guarantees never-identity even at size 2, where a fair
    // shuffle would deal the authored order back half the time (S5.5 lesson —
    // one student in two served a pre-solved question).
    for (let s = 0; s < 50; s++) {
      const six = computeServedOrderings(rawDoc(), 'sec-1', VERSION, `stu-${s}`);
      expect(six['ord-top']).not.toEqual(authored());

      const two = {
        schemaVersion: 2,
        meta: { title: 't' },
        sections: [
          {
            id: 'sec-1',
            rows: [
              { id: 'r', columns: [{ id: 'c', blocks: [orderingBlock('o2', 2)] }] },
            ],
          },
        ],
      };
      const out = computeServedOrderings(two, 'sec-1', VERSION, `stu-${s}`);
      expect(out['o2']).not.toEqual(authored(2));
    }
  });

  it('varies across students (the per-student seed reaches the shuffle)', () => {
    const seen = new Set<string>();
    for (let s = 0; s < 20; s++) {
      const out = computeServedOrderings(rawDoc(), 'sec-1', VERSION, `stu-${s}`);
      seen.add(out['ord-top']!.join(','));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('THE BOND: raw-document permutation === the permutation the read path serves', () => {
    // The read path serves applyServeShuffles(sanitize(doc), seed); the grader
    // recomputes from the RAW document. The function's header claims these are
    // the same permutation because the shuffle is structural and sanitize does
    // not touch item ids or order. Assert it, per student, on both blocks.
    for (let s = 0; s < 10; s++) {
      const student = `bond-student-${s}`;
      const raw = rawDoc();

      const served = applyServeShuffles(
        sanitizeActivityDocument(raw as unknown as ActivityDocument),
        serveSeed(VERSION, student),
      ) as unknown as {
        sections: Array<{
          id: string;
          rows: Array<{
            columns: Array<{
              blocks: Array<Record<string, unknown>>;
            }>;
          }>;
        }>;
      };

      const sec = served.sections.find((x) => x.id === 'sec-1')!;
      const blocks = sec.rows[0]!.columns[0]!.blocks;
      const topServed = (blocks[0]!.items as Array<{ id: string }>).map((i) => i.id);
      const nestedServed = (
        (blocks[2]!.children as Array<Record<string, unknown>>)[0]!
          .items as Array<{ id: string }>
      ).map((i) => i.id);

      const computed = computeServedOrderings(raw, 'sec-1', VERSION, student);
      expect(computed['ord-top']).toEqual(topServed);
      expect(computed['ord-nested']).toEqual(nestedServed);
    }
  });

  it('serveSeed spells the read path seed exactly (the grading-honesty contract)', () => {
    expect(serveSeed('v', 'u')).toBe('v:u');
  });
});
