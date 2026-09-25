// E2a's schema half: the accept/reject matrix for model outputs, mirroring
// the server's refusal set (0042 §I) so a submit the worker sends is a submit
// the server accepts. The closed-enum schema is asserted too — the decoder
// being UNABLE to hallucinate an id is the stronger guarantee; this validator
// is the belt to that brace.
import { describe, expect, it } from 'vitest';
import { buildOutputJsonSchema, validateModelOutput } from '../src/outputSchema.ts';
import { rubric, registryEntries, CRIT_METHOD, CRIT_CONCLUSION } from './fixtures.ts';

const registryIds = registryEntries.map((r) => r.id);

describe('buildOutputJsonSchema', () => {
  it('closes criterionId and misId over the actual rubric and registry', () => {
    const schema = buildOutputJsonSchema(rubric, registryIds) as {
      properties: {
        criteria: { items: { properties: { criterionId: { enum?: string[] } } } };
        misconceptions: { items: { properties: { misId: { enum?: string[] } } } };
      };
    };
    expect(schema.properties.criteria.items.properties.criterionId.enum).toEqual([
      CRIT_METHOD,
      CRIT_CONCLUSION,
    ]);
    expect(schema.properties.misconceptions.items.properties.misId.enum).toEqual(registryIds);
  });
});

describe('validateModelOutput', () => {
  const full = [
    { criterionId: CRIT_METHOD, earned: 2, feedback: 'divided correctly' },
    { criterionId: CRIT_CONCLUSION, earned: 2 },
  ];

  it('accepts a high-confidence full-coverage draft', () => {
    const r = validateModelOutput(
      {
        confidence: 'high',
        criteria: full,
        general_feedback_draft: 'Good comparison.',
        misconceptions: [{ misId: 'mis.rate.compares-totals', evidence: 'compared $3.60 to $4.50' }],
      },
      rubric,
      registryIds,
    );
    expect(r.ok).toBe(true);
    expect(r.output?.criteria).toHaveLength(2);
    expect(r.output?.misconceptions?.[0]?.misId).toBe('mis.rate.compares-totals');
  });

  it('rejects partial coverage at high confidence (the server rule, mirrored)', () => {
    const r = validateModelOutput(
      { confidence: 'high', criteria: [full[0]] },
      rubric,
      registryIds,
    );
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('every criterion');
  });

  it('accepts partial (even empty) criteria at low confidence — D6 abstain', () => {
    expect(validateModelOutput({ confidence: 'low', criteria: [] }, rubric, registryIds).ok).toBe(
      true,
    );
    expect(
      validateModelOutput({ confidence: 'low', criteria: [full[0]] }, rubric, registryIds).ok,
    ).toBe(true);
  });

  it('rejects a hallucinated criterionId', () => {
    const r = validateModelOutput(
      {
        confidence: 'high',
        criteria: [...full, { criterionId: '99999999-9999-4999-8999-999999999999', earned: 1 }],
      },
      rubric,
      registryIds,
    );
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('not on this rubric');
  });

  it('rejects earned out of range and duplicate criteria', () => {
    expect(
      validateModelOutput(
        { confidence: 'low', criteria: [{ criterionId: CRIT_METHOD, earned: 9 }] },
        rubric,
        registryIds,
      ).ok,
    ).toBe(false);
    expect(
      validateModelOutput(
        {
          confidence: 'high',
          criteria: [full[0], full[0], full[1]],
        },
        rubric,
        registryIds,
      ).ok,
    ).toBe(false);
  });

  it('rejects an unregistered misId and an evidence-free observation', () => {
    const base = { confidence: 'high', criteria: full };
    expect(
      validateModelOutput(
        { ...base, misconceptions: [{ misId: 'mis.invented', evidence: 'x' }] },
        rubric,
        registryIds,
      ).ok,
    ).toBe(false);
    expect(
      validateModelOutput(
        { ...base, misconceptions: [{ misId: 'mis.rate.ratio-inverted', evidence: '  ' }] },
        rubric,
        registryIds,
      ).ok,
    ).toBe(false);
  });

  it('caps evidence excerpts at 500 chars (the server mirror)', () => {
    const r = validateModelOutput(
      {
        confidence: 'high',
        criteria: full,
        misconceptions: [{ misId: 'mis.rate.ratio-inverted', evidence: 'y'.repeat(900) }],
      },
      rubric,
      registryIds,
    );
    expect(r.ok).toBe(true);
    expect(r.output?.misconceptions?.[0]?.evidence).toHaveLength(500);
  });

  it('rejects non-object and shapeless outputs', () => {
    expect(validateModelOutput(null, rubric, registryIds).ok).toBe(false);
    expect(validateModelOutput([], rubric, registryIds).ok).toBe(false);
    expect(validateModelOutput({ confidence: 'maybe', criteria: [] }, rubric, registryIds).ok).toBe(
      false,
    );
  });
});
