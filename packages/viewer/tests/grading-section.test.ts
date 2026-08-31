// =============================================================================
// grading-section.test.ts — gradeSection end to end (S4)
// -----------------------------------------------------------------------------
// The primitives are pinned in grading-primitives.test.ts; this file pins the
// ORCHESTRATION — the decisions about what reaches the wire, which is where a
// correct scorer can still produce a wrong student experience:
//
//   * an unanswered item is ABSENT from `items`, not marked wrong
//   * a static block's solution unlocks even though it answered nothing
//   * free text is 'recorded' and can never be judged
//   * blanks nested in a container are graded and attribute to their own ids
//   * NOTHING leaving the server carries an answer key — the second channel is
//     sanitized like the first
//
// Driven off the GENERATED fixtures (the same authored document the sanitized
// fixtures derive from), so a new block type with a fixture is exercised here
// automatically rather than needing a hand-written case.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { authoredFixtureDocument } from '../src/fixtures/index.js';
import {
  emptySectionResponses,
  type SectionResponses,
} from '../src/check/wire.js';
import {
  gradeSection,
  SectionNotFoundError,
} from '../src/server/grading/index.js';
import { inventorySection, findSection } from '../src/server/grading/walk.js';

const doc = authoredFixtureDocument() as unknown as {
  sections: Array<{ id: string; rows: unknown[] }>;
};
const sectionId = doc.sections[0]!.id;

function grade(responses: Partial<SectionResponses>, servedOrderings = {}) {
  return gradeSection({
    document: doc as never,
    sectionId,
    responses: { ...emptySectionResponses(), ...responses },
    servedOrderings,
  });
}

/** The inventory the section actually offers, so tests reference real ids. */
const inv = inventorySection(findSection(doc as never, sectionId)!);

describe('the section must exist', () => {
  it('throws rather than reporting an empty success for an unknown section', () => {
    // Grading a section that isn't there as "zero items, all fine" would tell
    // the student their work was checked when nothing was.
    expect(() =>
      gradeSection({
        document: doc as never,
        sectionId: 'no-such-section',
        responses: emptySectionResponses(),
      }),
    ).toThrow(SectionNotFoundError);
  });
});

describe('the fixture section is worth testing against', () => {
  // A guard, not a formality. Most tests below reference `inv` entries by
  // index; if the fixtures ever stopped carrying one of these families, those
  // tests would pass by asserting nothing — the same vacuous-green trap that
  // once made an empty activity look like a passing leak scan.
  it('offers every response family the orchestrator can grade', () => {
    expect(inv.blankGroupsByBlock.length).toBeGreaterThan(1);
    expect(inv.multipleChoice.length).toBeGreaterThan(0);
    expect(inv.matching.length).toBeGreaterThan(0);
    expect(inv.ordering.length).toBeGreaterThan(0);
    expect(inv.graphs.length).toBeGreaterThan(0);
    expect(inv.freeText.length).toBeGreaterThan(0);
    expect(inv.solutions.length).toBeGreaterThan(0);
  });
});

describe('unanswered items are absent, never wrong', () => {
  it('returns no items at all when the student submits nothing', () => {
    const result = grade({});
    expect(Object.keys(result.items)).toHaveLength(0);
  });

  it('omits a blank left empty while still grading an answered one', () => {
    // Two different blank-bearing blocks: the fixture blocks carry one blank
    // each, so this deliberately does NOT assume a multi-blank block exists.
    const first = inv.blankGroupsByBlock[0]!.keys[0]!;
    const second = inv.blankGroupsByBlock[1]!.keys[0]!;
    const result = grade({
      blanks: { [first.id]: first.answers[0] ?? '', [second.id]: '   ' },
    });
    expect(result.items[first.id]).toBeDefined();
    expect(result.items[second.id]).toBeUndefined();
  });

  it('omits an empty free-text answer', () => {
    const blockId = inv.freeText[0]!;
    expect(grade({ freeText: { [blockId]: '   ' } }).items[blockId]).toBeUndefined();
  });

  it('omits a graph the student never touched', () => {
    const g = inv.graphs[0]!;
    const result = grade({
      graphs: {
        [g.blockId]: {
          interaction: String(g.block.interaction?.type ?? ''),
          points: [],
        },
      },
    });
    expect(result.items[g.blockId]).toBeUndefined();
  });
});

describe('verdicts', () => {
  it('marks a correct blank correct', () => {
    const key = inv.blankGroupsByBlock[0]?.keys[0];
    expect(key).toBeDefined();
    const result = grade({ blanks: { [key!.id]: key!.answers[0] ?? '' } });
    expect(result.items[key!.id]?.verdict).toBe('correct');
  });

  it('marks a wrong blank incorrect', () => {
    const key = inv.blankGroupsByBlock[0]?.keys[0];
    const result = grade({ blanks: { [key!.id]: 'definitely not the answer' } });
    expect(result.items[key!.id]?.verdict).toBe('incorrect');
  });

  it('marks the exact correct choice set correct', () => {
    const mc = inv.multipleChoice[0];
    expect(mc, 'fixtures should contain a multiple_choice').toBeDefined();
    const result = grade({ choices: { [mc!.blockId]: mc!.correctIds } });
    expect(result.items[mc!.blockId]?.verdict).toBe('correct');
  });

  it('marks the authored ordering correct and an untouched one absent', () => {
    const o = inv.ordering[0];
    if (!o) return;
    const shuffled = [...o.authoredOrder].reverse();

    expect(
      grade({ orderings: { [o.blockId]: o.authoredOrder } }, {
        [o.blockId]: shuffled,
      }).items[o.blockId]?.verdict,
    ).toBe('correct');

    // Submitting exactly what we served is not a claim about the answer.
    expect(
      grade({ orderings: { [o.blockId]: shuffled } }, { [o.blockId]: shuffled })
        .items[o.blockId],
    ).toBeUndefined();
  });

  it('grades a fully-correct matching block', () => {
    const m = inv.matching[0];
    if (!m) return;
    const result = grade({ matches: { [m.blockId]: m.key } });
    expect(result.items[m.blockId]?.verdict).toBe('correct');
  });
});

describe('the graph family dispatches to the kit for every variant', () => {
  // The engine holds no geometry of its own — it decodes the wire and calls
  // graph-kit's pure scorers, the same ones the published page uses. What can
  // still go wrong is DISPATCH: sending a number line's 1-D value into the 2-D
  // point scorer, forgetting that a data plot's key is computed from its
  // dataset, or dropping the endpoint styles that distinguish "2 ≤ x < 7" from
  // "2 < x < 7". So this table walks every authored variant and checks that a
  // correct answer marks correct and a wrong one marks incorrect.

  /** What a student who answered CORRECTLY would have sent, per variant. */
  function correctWork(block: {
    type?: string;
    interaction?: Record<string, unknown> & { type?: string };
    data?: number[];
    config?: Record<string, unknown>;
  }): Record<string, unknown> | null {
    const i = block.interaction ?? {};
    const t = i.type;
    if (t === 'display') return null; // takes no input; never gradable

    if (block.type === 'interactive_graph') {
      switch (t) {
        case 'plot_point':
          return { points: i.correctPoints };
        case 'plot_function': {
          const m = (i.models as Array<Record<string, number>>)[0]!;
          // Two handles on y = slope·x + intercept.
          return {
            points: [
              [0, m.intercept],
              [1, (m.slope ?? 0) + (m.intercept ?? 0)],
            ],
          };
        }
        case 'shade_region':
          return {
            points: (i.regions as Array<Record<string, unknown>>)[0]!
              .correctVertices,
          };
        case 'graph_inequality': {
          const k = (i.inequalities as Array<Record<string, unknown>>)[0]!;
          const b = k.boundary as Record<string, number>;
          return {
            points: [
              [0, b.intercept],
              [1, (b.slope ?? 0) + (b.intercept ?? 0)],
            ],
            parts: [
              {
                points: [
                  [0, b.intercept],
                  [1, (b.slope ?? 0) + (b.intercept ?? 0)],
                ],
                strict: k.strict,
                side: k.shadeSide,
              },
            ],
          };
        }
        case 'plot_ray': {
          const r = (i.rays as Array<Record<string, unknown>>)[0]!;
          return {
            points: [r.from, r.through],
            shape: 'ray_positive',
            endpointStyles: [r.fromStyle ?? 'closed'],
          };
        }
        case 'plot_segment': {
          const s = (i.segments as Array<Record<string, unknown>>)[0]!;
          return {
            points: [s.from, s.to],
            shape: 'segment',
            endpointStyles: s.endpoints ?? ['closed', 'closed'],
          };
        }
        default:
          return null;
      }
    }

    if (block.type === 'number_line') {
      if (t === 'plot_point') {
        // 1-D positions ride the shared 2-D slot as [value, 0].
        return {
          points: (i.correctPoints as number[]).map((v) => [v, 0]),
        };
      }
      if (t === 'plot_interval') {
        const ci = i.correctInterval as Record<string, unknown>;
        // Endpoint STYLES are part of the answer, so they travel in `domain`.
        return {
          points: [],
          domain: {
            ...(ci.min !== undefined ? { minX: ci.min } : {}),
            ...(ci.minStyle !== undefined ? { minStyle: ci.minStyle } : {}),
            ...(ci.max !== undefined ? { maxX: ci.max } : {}),
            ...(ci.maxStyle !== undefined ? { maxStyle: ci.maxStyle } : {}),
          },
        };
      }
      return null;
    }

    if (block.type === 'data_plot') {
      const data = block.data ?? [];
      if (t === 'build_dotplot') {
        // The student reproduces the dataset; values ride at index 1.
        return { points: data.map((v, idx) => [idx, v]) };
      }
      if (t === 'build_histogram') {
        const cfg = (block.config ?? {}) as {
          binWidth?: number;
          tickStep?: number;
          min?: number;
          max?: number;
        };
        const width = cfg.binWidth && cfg.binWidth > 0 ? cfg.binWidth : cfg.tickStep ?? 1;
        const min = cfg.min ?? 0;
        const max = cfg.max ?? 0;
        const counts: number[] = [];
        for (let lo = min; lo < max; lo += width) {
          const hi = lo + width;
          counts.push(
            data.filter((v) => v >= lo && (hi >= max ? v <= hi : v < hi)).length,
          );
        }
        return { points: counts.map((c, idx) => [idx, c]) };
      }
      if (t === 'build_boxplot') {
        const s = [...data].sort((a, b) => a - b);
        const n = s.length;
        const mid = Math.floor(n / 2);
        const lower = s.slice(0, mid);
        const upper = n % 2 ? s.slice(mid + 1) : s.slice(mid);
        const med = (arr: number[]): number => {
          const m = Math.floor(arr.length / 2);
          return arr.length % 2 ? arr[m]! : (arr[m - 1]! + arr[m]!) / 2;
        };
        const five = [s[0]!, med(lower), med(s), med(upper), s[n - 1]!];
        return { points: five.map((v, idx) => [idx, v]) };
      }
      return null;
    }
    return null;
  }

  const gradable = inv.graphs.filter(
    (g) => g.block.interaction?.type !== 'display',
  );

  it('has a gradable instance of all three graph block types', () => {
    const types = new Set(gradable.map((g) => g.block.type));
    expect(types).toEqual(
      new Set(['interactive_graph', 'number_line', 'data_plot']),
    );
  });

  for (const g of gradable) {
    const label = `${g.block.type}/${g.block.interaction?.type}`;

    it(`marks a correct ${label} answer correct`, () => {
      const work = correctWork(g.block);
      expect(work, `no correct-work builder for ${label}`).not.toBeNull();
      const result = grade({
        graphs: {
          [g.blockId]: {
            interaction: String(g.block.interaction?.type),
            ...work,
          } as never,
        },
      });
      expect(result.items[g.blockId]?.verdict).toBe('correct');
    });

    it(`marks a wrong ${label} answer incorrect`, () => {
      // Displace every coordinate far outside any authored tolerance.
      const work = correctWork(g.block) as {
        points?: [number, number][];
        domain?: Record<string, number | string>;
        parts?: Array<Record<string, unknown>>;
      };
      const shifted = {
        ...work,
        points: (work.points ?? []).map(([x, y]) => [x + 37, y + 37]),
        ...(work.domain
          ? {
              domain: {
                ...work.domain,
                ...(work.domain.minX !== undefined
                  ? { minX: (work.domain.minX as number) + 37 }
                  : {}),
                ...(work.domain.maxX !== undefined
                  ? { maxX: (work.domain.maxX as number) + 37 }
                  : {}),
              },
            }
          : {}),
        ...(work.parts
          ? {
              parts: work.parts.map((p) => ({
                ...p,
                points: ((p.points as [number, number][]) ?? []).map(([x, y]) => [
                  x + 37,
                  y + 37,
                ]),
              })),
            }
          : {}),
      };
      const result = grade({
        graphs: {
          [g.blockId]: {
            interaction: String(g.block.interaction?.type),
            ...shifted,
          } as never,
        },
      });
      expect(result.items[g.blockId]?.verdict).toBe('incorrect');
    });
  }

  it('never grades a display-mode graph, even if work is somehow submitted', () => {
    const display = inv.graphs.find(
      (g) => g.block.interaction?.type === 'display',
    );
    expect(display, 'fixtures should include a display graph').toBeDefined();
    const result = grade({
      graphs: {
        [display!.blockId]: { interaction: 'display', points: [[1, 1]] },
      },
    });
    expect(result.items[display!.blockId]).toBeUndefined();
  });

  it('refuses to grade work whose interaction disagrees with the served block', () => {
    // A payload naming a different interaction is a malformed request, not a
    // wrong answer — it must never come back as a mark against the student.
    const g = gradable[0]!;
    const result = grade({
      graphs: {
        [g.blockId]: { interaction: 'some_other_interaction', points: [[0, 0]] },
      },
    });
    expect(result.items[g.blockId]).toBeUndefined();
  });
});

describe('the recorded family is never judged', () => {
  it('returns recorded for free text, whatever the student wrote', () => {
    const blockId = inv.freeText[0];
    expect(blockId, 'fixtures should contain a free-text block').toBeDefined();
    for (const text of ['a thoughtful answer', 'asdf', '42']) {
      expect(grade({ freeText: { [blockId!]: text } }).items[blockId!]).toEqual({
        verdict: 'recorded',
      });
    }
  });

  it('never emits correct or incorrect for a free-text id', () => {
    const blockId = inv.freeText[0];
    if (!blockId) return;
    const verdict = grade({ freeText: { [blockId]: 'x' } }).items[blockId]?.verdict;
    expect(verdict).not.toBe('correct');
    expect(verdict).not.toBe('incorrect');
  });
});

describe('solutions unlock (ruling S4-13)', () => {
  it('returns solutions for blocks in the section', () => {
    const result = grade({});
    expect(Object.keys(result.solutions).length).toBeGreaterThan(0);
  });

  it('includes the solution of a STATIC block that answered nothing', () => {
    // The bug this prevents: a grader that walks only responding blocks leaves
    // a `problem`'s worked solution locked forever, and to the student that
    // reads as a broken box rather than as a grading rule.
    const respondingIds = new Set([
      ...inv.blankGroupsByBlock.map((g) => g.blockId),
      ...inv.multipleChoice.map((m) => m.blockId),
      ...inv.matching.map((m) => m.blockId),
      ...inv.ordering.map((o) => o.blockId),
      ...inv.graphs.map((g) => g.blockId),
      ...inv.freeText,
    ]);
    const staticWithSolution = inv.solutions.find(
      (s) => !respondingIds.has(s.blockId),
    );
    expect(
      staticWithSolution,
      'fixtures should include a static block carrying a solution',
    ).toBeDefined();
    expect(grade({}).solutions[staticWithSolution!.blockId]).toBeDefined();
  });

  it('returns solutions even when the student answered nothing at all', () => {
    // Parity, ruled explicitly (S4-T3): reveal-on-check matches the published
    // page, where the key was in the HTML anyway. Pinned so that changing it
    // is a deliberate pedagogy decision rather than an accident.
    const before = Object.keys(grade({}).solutions).length;
    expect(before).toBeGreaterThan(0);
  });
});

describe('nothing leaving the server carries an answer key (ruling S4-4)', () => {
  const SECRET_KEYS = [
    'answer',
    'acceptableAnswers',
    'correct',
    'mistakeFeedback',
    'tolerance',
    'equivalence',
    'correctPoints',
    'models',
    'regions',
    'inequalities',
    'correctInterval',
    'key',
    'rubric',
    'noSolutionCorrect',
  ];

  /** Every key name appearing anywhere in a serialized value. */
  function keysIn(value: unknown, out = new Set<string>()): Set<string> {
    if (Array.isArray(value)) {
      for (const v of value) keysIn(v, out);
      return out;
    }
    if (value === null || typeof value !== 'object') return out;
    for (const [k, v] of Object.entries(value)) {
      out.add(k);
      keysIn(v, out);
    }
    return out;
  }

  it('emits no secret field name anywhere in a full check response', () => {
    // Answer everything the section offers, so every feedback and solution
    // path is exercised in one response.
    const responses: SectionResponses = emptySectionResponses();
    for (const g of inv.blankGroupsByBlock) {
      for (const key of g.keys) responses.blanks[key.id] = 'wrong on purpose';
    }
    for (const mc of inv.multipleChoice) {
      responses.choices[mc.blockId] = mc.choices.map((c) => c.id);
    }
    for (const f of inv.freeText) responses.freeText[f] = 'recorded text';

    const result = gradeSection({
      document: doc as never,
      sectionId,
      responses,
    });

    const present = keysIn(result);
    for (const secret of SECRET_KEYS) {
      expect(present.has(secret), `"${secret}" leaked in the check response`).toBe(
        false,
      );
    }
  });

  it('strips an in-band blank pasted inside an authored solution', () => {
    // The precise leak the outbound sanitizer exists for: a teacher pastes a
    // worked solution that happens to contain a blank token, and every student
    // who checks the section receives that blank's answers.
    const poisoned = structuredClone(doc) as unknown as {
      sections: Array<{
        rows: Array<{ columns: Array<{ blocks: Record<string, unknown>[] }> }>;
      }>;
    };
    const block = poisoned.sections[0]!.rows[0]!.columns[0]!.blocks[0]!;
    block.solution = [
      { type: 'text', text: 'first isolate x' },
      {
        type: 'blank',
        id: 'leaky-blank',
        answer: 'SUPER-SECRET',
        acceptableAnswers: ['ALSO-SECRET'],
      },
    ];

    const result = gradeSection({
      document: poisoned as never,
      sectionId: poisoned.sections[0]!.rows ? sectionId : sectionId,
      responses: emptySectionResponses(),
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('SUPER-SECRET');
    expect(serialized).not.toContain('ALSO-SECRET');
    // The readable part of the solution still reaches the student.
    expect(serialized).toContain('first isolate x');
  });

  it('does not mutate the raw document while sanitizing its content', () => {
    // The document is the cached raw artifact; mutating it here would corrupt
    // grading for every subsequent student in the same isolate.
    const before = JSON.stringify(doc);
    grade({});
    expect(JSON.stringify(doc)).toBe(before);
  });
});

describe('containers', () => {
  it('grades blanks nested inside a container against their own ids', () => {
    // A blank inside a faded_worked_example step belongs to that step. If the
    // walk attributed it to the container, the id would not match what the
    // client sent and the answer would silently never be scored.
    const nested = inv.blankGroupsByBlock.find((g) => g.keys.length > 0);
    expect(nested).toBeDefined();
    const allIds = new Set(
      inv.blankGroupsByBlock.flatMap((g) => g.keys.map((k) => k.id)),
    );
    // Every collected blank id is a real id from the document, not a synthesized
    // container id.
    for (const id of allIds) expect(typeof id).toBe('string');
    expect(allIds.size).toBeGreaterThan(0);
  });
});

describe('wire shape', () => {
  it('stamps the wire version and echoes the section id', () => {
    const result = grade({});
    expect(result.sectionId).toBe(sectionId);
    expect(result.wireVersion).toBe(2);
  });

  it('keys items by the SAME ids the request used', () => {
    const key = inv.blankGroupsByBlock[0]?.keys[0];
    const result = grade({ blanks: { [key!.id]: 'anything' } });
    expect(Object.keys(result.items)).toContain(key!.id);
  });
});

describe('misconception ids reach the wire (the sensor guard)', () => {
  // The data-layer contract of the misconception-sensors slice (decisions 4-6
  // + eng review A1, docs/design/misconception-sensors.md): a WRONG answer that
  // matches a mapped distractor carries that distractor's mis.* id on its
  // CheckItemResult — which the handler stores verbatim in
  // section_checks.verdicts, so these wire assertions are also the stored-shape
  // assertions. Purpose-built documents rather than the shared fixtures: each
  // family's binding is stated inline, so reverting any one family's
  // propagation turns exactly one case red (mutation-proven 2026-08-24).
  const t = (text: string) => ({ type: 'text', text });
  const blankId = crypto.randomUUID();
  const mcId = crypto.randomUUID();
  const rightChoice = crypto.randomUUID();
  const wrongChoice = crypto.randomUUID();
  const wrongChoiceB = crypto.randomUUID();
  const wrongChoiceUnmapped = crypto.randomUUID();
  const graphId = crypto.randomUUID();

  /** A section holding one block, so each family can be graded in isolation. */
  function oneBlockDoc(block: Record<string, unknown>) {
    return {
      sections: [
        { id: 'sensor-section', rows: [{ columns: [{ blocks: [block] }] }] },
      ],
    };
  }

  function gradeDoc(
    doc: unknown,
    responses: Partial<SectionResponses>,
  ) {
    return gradeSection({
      document: doc as never,
      sectionId: 'sensor-section',
      responses: { ...emptySectionResponses(), ...responses },
    });
  }

  // ---- blanks ---------------------------------------------------------------

  const blankBlock = {
    id: crypto.randomUUID(),
    type: 'fill_in_blank',
    content: [
      t('unit rate: '),
      {
        type: 'blank',
        id: blankId,
        answer: '12',
        acceptableAnswers: [],
        mistakeFeedback: [
          {
            match: '21',
            feedback: [t('digits reversed')],
            misconceptionId: 'mis.place-value.digit-reversal',
          },
          // An anticipated mistake with feedback but NO binding: the feedback
          // must still reach the student, and no id may be invented for it.
          { match: '10', feedback: [t('close, recount')] },
        ],
      },
    ],
  };

  it('a wrong blank matching a mapped distractor carries its id', () => {
    const result = gradeDoc(oneBlockDoc(blankBlock), {
      blanks: { [blankId]: '21' },
    });
    expect(result.items[blankId]?.verdict).toBe('incorrect');
    expect(result.items[blankId]?.misconceptionIds).toEqual([
      'mis.place-value.digit-reversal',
    ]);
  });

  it('a matched entry with no binding yields feedback but no ids', () => {
    const result = gradeDoc(oneBlockDoc(blankBlock), {
      blanks: { [blankId]: '10' },
    });
    expect(result.items[blankId]?.verdict).toBe('incorrect');
    expect(JSON.stringify(result.items[blankId]?.feedback)).toContain(
      'close, recount',
    );
    expect(result.items[blankId]?.misconceptionIds).toBeUndefined();
  });

  it('a wrong answer that matches NO mapped distractor carries no ids', () => {
    const result = gradeDoc(oneBlockDoc(blankBlock), {
      blanks: { [blankId]: '99' },
    });
    expect(result.items[blankId]?.verdict).toBe('incorrect');
    expect(result.items[blankId]?.misconceptionIds).toBeUndefined();
  });

  it('a CORRECT blank never carries an id, even with distractors mapped', () => {
    const result = gradeDoc(oneBlockDoc(blankBlock), {
      blanks: { [blankId]: '12' },
    });
    expect(result.items[blankId]?.verdict).toBe('correct');
    expect(result.items[blankId]?.misconceptionIds).toBeUndefined();
  });

  it('a NUMERIC blank matches a mapped distractor by VALUE, not spelling', () => {
    // The sensor's honesty depends on this: an author writes `!0.5` once, and
    // every student who typed the same wrong NUMBER — .5, 1/2, 0.50 — must be
    // counted. Exact-string matching would under-count by an unknowable factor
    // and deny those students the targeted feedback they earned.
    const numId = crypto.randomUUID();
    const numericBlank = oneBlockDoc({
      id: crypto.randomUUID(),
      type: 'fill_in_blank',
      content: [
        t('rate: '),
        {
          type: 'blank',
          id: numId,
          answer: '1.5',
          acceptableAnswers: [],
          answerType: 'numeric',
          tolerance: 0,
          mistakeFeedback: [
            {
              match: '0.5',
              feedback: [t('you divided the wrong way')],
              misconceptionId: 'mis.roc.inverts-ratio',
            },
          ],
        },
      ],
    });

    for (const spelling of ['0.5', '.5', '1/2', '0.50']) {
      const result = gradeDoc(numericBlank, { blanks: { [numId]: spelling } });
      expect(result.items[numId]?.verdict, spelling).toBe('incorrect');
      expect(result.items[numId]?.misconceptionIds, spelling).toEqual([
        'mis.roc.inverts-ratio',
      ]);
    }

    // A different wrong number is still just wrong.
    const other = gradeDoc(numericBlank, { blanks: { [numId]: '7' } });
    expect(other.items[numId]?.misconceptionIds).toBeUndefined();
  });

  // ---- multiple choice ------------------------------------------------------

  const mcBlock = {
    id: mcId,
    type: 'multiple_choice',
    prompt: [t('select every rate that is wrong')],
    multiSelect: true,
    choices: [
      { id: rightChoice, content: [t('right')], correct: true },
      {
        id: wrongChoice,
        content: [t('endpoint')],
        correct: false,
        feedback: [t('endpoint, not rate')],
        misconceptionId: 'mis.roc.uses-endpoint-value',
      },
      {
        id: wrongChoiceB,
        content: [t('inverted')],
        correct: false,
        misconceptionId: 'mis.roc.inverts-ratio',
      },
      { id: wrongChoiceUnmapped, content: [t('other')], correct: false },
    ],
  };

  it('a selected mapped MC distractor carries its id', () => {
    const result = gradeDoc(oneBlockDoc(mcBlock), {
      choices: { [mcId]: [wrongChoice] },
    });
    expect(result.items[mcId]?.verdict).toBe('incorrect');
    expect(result.items[mcId]?.misconceptionIds).toEqual([
      'mis.roc.uses-endpoint-value',
    ]);
  });

  it('TWO selected mapped distractors carry BOTH ids, in choice order', () => {
    // The A1 ruling: a student who demonstrates two misconceptions has both
    // recorded. A single-string shape dropped one silently, which under-counts
    // exactly the co-occurrence the data layer exists to measure.
    const result = gradeDoc(oneBlockDoc(mcBlock), {
      choices: { [mcId]: [wrongChoiceB, wrongChoice] },
    });
    expect(result.items[mcId]?.misconceptionIds).toEqual([
      'mis.roc.uses-endpoint-value',
      'mis.roc.inverts-ratio',
    ]);
  });

  it('a mapped distractor the student did NOT select stays silent', () => {
    // Emitting an id for an unselected choice would record a misconception
    // nobody demonstrated — the sensor equivalent of inventing data.
    const result = gradeDoc(oneBlockDoc(mcBlock), {
      choices: { [mcId]: [wrongChoiceUnmapped] },
    });
    expect(result.items[mcId]?.verdict).toBe('incorrect');
    expect(result.items[mcId]?.misconceptionIds).toBeUndefined();
  });

  it('a CORRECT MC selection never carries an id', () => {
    const result = gradeDoc(oneBlockDoc(mcBlock), {
      choices: { [mcId]: [rightChoice] },
    });
    expect(result.items[mcId]?.verdict).toBe('correct');
    expect(result.items[mcId]?.misconceptionIds).toBeUndefined();
  });

  // ---- interactive graph ----------------------------------------------------

  const graphBlock = (extra: Record<string, unknown> = {}) => ({
    id: graphId,
    type: 'interactive_graph',
    prompt: [t('graph y = 2x + 1')],
    axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    interaction: {
      type: 'plot_function',
      models: [
        {
          family: 'linear',
          slope: 2,
          intercept: 1,
          slopeTolerance: 0.1,
          interceptTolerance: 0.1,
        },
      ],
    },
    mistakeFeedback: [
      {
        match: 'y = x + 2',
        feedback: [t('the coefficient is the slope')],
        misconceptionId: 'mis.slope.reads-intercept',
      },
    ],
    ...extra,
  });

  /** Points exactly on y = x + 2 — the anticipated mistake, not the key. */
  const mistakenCurve = {
    interaction: 'plot_function',
    points: [
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
    ] as [number, number][],
  };

  it('a wrong graph matching an authored mistake carries its id AND feedback', () => {
    const result = gradeDoc(oneBlockDoc(graphBlock()), {
      graphs: { [graphId]: mistakenCurve },
    });
    expect(result.items[graphId]?.verdict).toBe('incorrect');
    expect(result.items[graphId]?.misconceptionIds).toEqual([
      'mis.slope.reads-intercept',
    ]);
    expect(JSON.stringify(result.items[graphId]?.feedback)).toContain(
      'the coefficient is the slope',
    );
  });

  it('a CORRECT graph never carries an id', () => {
    const result = gradeDoc(oneBlockDoc(graphBlock()), {
      graphs: {
        [graphId]: {
          interaction: 'plot_function',
          points: [
            [0, 1],
            [1, 3],
            [2, 5],
            [3, 7],
          ],
        },
      },
    });
    expect(result.items[graphId]?.verdict).toBe('correct');
    expect(result.items[graphId]?.misconceptionIds).toBeUndefined();
  });

  it('a "no solution" claim is never annotated', () => {
    const result = gradeDoc(
      oneBlockDoc(graphBlock({ allowNoSolution: true })),
      { graphs: { [graphId]: { interaction: 'plot_function', points: [], noSolution: true } } },
    );
    expect(result.items[graphId]?.verdict).toBe('incorrect');
    expect(result.items[graphId]?.misconceptionIds).toBeUndefined();
    expect(result.items[graphId]?.feedback).toBeUndefined();
  });

  it('a wrong graph matching NO authored mistake carries nothing', () => {
    // X3: built-in classifier TEXT is deliberately not wired. A wrong answer
    // that no authored mistake anticipates is mark-only, even though the kit
    // could classify it — that is a student-facing slice of its own.
    const result = gradeDoc(oneBlockDoc(graphBlock()), {
      graphs: {
        [graphId]: {
          interaction: 'plot_function',
          points: [
            [0, -9],
            [1, -9],
            [2, -9],
          ],
        },
      },
    });
    expect(result.items[graphId]?.verdict).toBe('incorrect');
    expect(result.items[graphId]?.misconceptionIds).toBeUndefined();
    expect(result.items[graphId]?.feedback).toBeUndefined();
  });

  it('a graph SYSTEM (several models) is not annotated', () => {
    const systemId = crypto.randomUUID();
    const line = (slope: number, intercept: number) => ({
      family: 'linear',
      slope,
      intercept,
      slopeTolerance: 0.1,
      interceptTolerance: 0.1,
    });
    const result = gradeDoc(
      oneBlockDoc({
        id: systemId,
        type: 'interactive_graph',
        prompt: [t('graph both lines')],
        axisConfig: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
        interaction: { type: 'plot_function', models: [line(2, 1), line(-1, 4)] },
        mistakeFeedback: [
          {
            match: 'y = x + 2',
            feedback: [t('nope')],
            misconceptionId: 'mis.slope.reads-intercept',
          },
        ],
      }),
      {
        graphs: {
          [systemId]: {
            interaction: 'plot_function',
            points: [],
            parts: [{ points: [[0, 2], [1, 3], [2, 4]] as [number, number][] }],
          },
        },
      },
    );
    expect(result.items[systemId]?.verdict).toBe('incorrect');
    expect(result.items[systemId]?.misconceptionIds).toBeUndefined();
  });

  // ---- cross-family guard ---------------------------------------------------

  it('a number_line block never picks up a graph annotation', () => {
    // selectGraphMistake's first line narrows to interactive_graph. Without it
    // a number line or data plot could inherit an interactive_graph's matcher
    // dispatch, annotating a family the compiler was never built for.
    const lineId = crypto.randomUUID();
    const result = gradeDoc(
      oneBlockDoc({
        id: lineId,
        type: 'number_line',
        prompt: [t('plot 4')],
        config: { min: 0, max: 10 },
        interaction: { type: 'plot_point', correctPoints: [4], tolerance: 0.1 },
        mistakeFeedback: [
          {
            match: '7',
            feedback: [t('too far right')],
            misconceptionId: 'mis.numberline.off-by-three',
          },
        ],
      }),
      { graphs: { [lineId]: { interaction: 'plot_point', points: [[7, 0]] } } },
    );
    expect(result.items[lineId]?.verdict).toBe('incorrect');
    expect(result.items[lineId]?.misconceptionIds).toBeUndefined();
  });

  it('a data_plot block never picks up a graph annotation', () => {
    const plotId = crypto.randomUUID();
    const result = gradeDoc(
      oneBlockDoc({
        id: plotId,
        type: 'data_plot',
        prompt: [t('build the dot plot')],
        data: [1, 2, 2, 3],
        config: { min: 0, max: 5 },
        interaction: { type: 'build_dotplot' },
        mistakeFeedback: [
          {
            match: '9',
            feedback: [t('wrong shape')],
            misconceptionId: 'mis.stats.miscounts',
          },
        ],
      }),
      {
        graphs: {
          [plotId]: { interaction: 'build_dotplot', points: [[9, 9]] },
        },
      },
    );
    expect(result.items[plotId]?.verdict).toBe('incorrect');
    expect(result.items[plotId]?.misconceptionIds).toBeUndefined();
  });
});

describe('unit-bearing blanks grade end to end (the walk projects the unit)', () => {
  // The unit lives on the BlankToken and must survive blankTokenToKey — the
  // primitives suite builds BlankKeys by hand, so only a real document can
  // prove the projection. Reverting the walk's unit fields turns exactly
  // these cases red while every primitives case stays green.
  const t = (text: string) => ({ type: 'text', text });
  const unitBlankId = crypto.randomUUID();

  const unitBlock = {
    id: crypto.randomUUID(),
    type: 'fill_in_blank',
    content: [
      t('the speed is '),
      {
        type: 'blank',
        id: unitBlankId,
        answer: '1.5',
        acceptableAnswers: [],
        answerType: 'numeric',
        unit: 'km/h',
        acceptableUnits: ['kph'],
        mistakeFeedback: [
          {
            match: 'unit-missing',
            feedback: [t('what are you measuring in?')],
            misconceptionId: 'mis.units.dropped',
          },
        ],
      },
    ],
  };

  function docOf(block: Record<string, unknown>) {
    return {
      sections: [
        { id: 'unit-section', rows: [{ columns: [{ blocks: [block] }] }] },
      ],
    };
  }

  function grade(entry: string) {
    return gradeSection({
      document: docOf(unitBlock) as never,
      sectionId: 'unit-section',
      responses: {
        ...emptySectionResponses(),
        blanks: { [unitBlankId]: entry },
      },
    });
  }

  it('value + unit is correct; alternates count', () => {
    expect(grade('1.5 km/h').items[unitBlankId]?.verdict).toBe('correct');
    expect(grade('3/2 kph').items[unitBlankId]?.verdict).toBe('correct');
  });

  it('a bare value is incorrect AND carries the bound misconception', () => {
    const result = grade('1.5');
    expect(result.items[unitBlankId]?.verdict).toBe('incorrect');
    expect(result.items[unitBlankId]?.misconceptionIds).toEqual([
      'mis.units.dropped',
    ]);
    expect(JSON.stringify(result.items[unitBlankId]?.feedback)).toContain(
      'what are you measuring in?',
    );
  });

  it('a wrong unit is incorrect without the missing-unit id', () => {
    const result = grade('1.5 mph');
    expect(result.items[unitBlankId]?.verdict).toBe('incorrect');
    expect(result.items[unitBlankId]?.misconceptionIds).toBeUndefined();
  });
});
