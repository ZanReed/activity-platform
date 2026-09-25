/**
 * The model's output contract (design §4, SCHEMA_REV): JSON-schema-constrained
 * decoding server-side (vLLM guided decoding via `response_format:
 * json_schema`, W-6) plus a local validation pass here before anything is
 * submitted — the constrained decoder bounds the SHAPE, this bounds the
 * REFERENCES (criterion ids on the rubric, mis ids in the registry), and the
 * server RPC re-validates everything again ("rejected at the door"). Three
 * layers on purpose: W-4 needs local failures captured to disk for prompt
 * debugging, which a server refusal cannot give.
 */

export interface ModelCriterion {
  criterionId: string;
  earned: number;
  feedback?: string;
}

export interface ModelMisconception {
  misId: string;
  evidence: string;
}

export interface ModelOutput {
  confidence: 'high' | 'low';
  criteria: ModelCriterion[];
  general_feedback_draft?: string;
  misconceptions?: ModelMisconception[];
}

export interface RubricCriterion {
  id: string;
  label?: string;
  maxPoints: number;
}

/**
 * The JSON schema handed to the inference server as
 * `response_format: { type: 'json_schema', json_schema: { schema } }`.
 * Built per-item so the criterionId/misId enums are CLOSED over the actual
 * rubric and registry — the decoder then cannot hallucinate an id at all,
 * which is stronger than rejecting one after the fact.
 */
export function buildOutputJsonSchema(
  rubric: RubricCriterion[],
  registryIds: string[],
): Record<string, unknown> {
  const criterionIds = rubric.map((c) => c.id);
  return {
    type: 'object',
    additionalProperties: false,
    required: ['confidence', 'criteria'],
    properties: {
      confidence: { type: 'string', enum: ['high', 'low'] },
      criteria: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['criterionId', 'earned'],
          properties: {
            criterionId:
              criterionIds.length > 0
                ? { type: 'string', enum: criterionIds }
                : { type: 'string' },
            earned: { type: 'number' },
            feedback: { type: 'string' },
          },
        },
      },
      general_feedback_draft: { type: 'string' },
      misconceptions: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['misId', 'evidence'],
          properties: {
            misId:
              registryIds.length > 0
                ? { type: 'string', enum: registryIds }
                : { type: 'string' },
            evidence: { type: 'string', maxLength: 500 },
          },
        },
      },
    },
  };
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  output?: ModelOutput;
}

/**
 * Local validation of a raw model response. Mirrors the server's refusal
 * matrix (0042 §I) so a row the worker submits is a row the server accepts:
 * shape, closed criterion/mis references, earned ranges, and the
 * high-confidence full-coverage rule (every rubric criterion exactly once).
 * A 'low' output may be partial — it is telemetry, never a pre-fill (D6).
 */
export function validateModelOutput(
  raw: unknown,
  rubric: RubricCriterion[],
  registryIds: string[],
): ValidationResult {
  const errors: string[] = [];
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, errors: ['output is not an object'] };
  }
  const o = raw as Record<string, unknown>;

  if (o.confidence !== 'high' && o.confidence !== 'low') {
    errors.push(`confidence must be high|low (got ${JSON.stringify(o.confidence)})`);
  }

  const byId = new Map(rubric.map((c) => [c.id, c]));
  const criteria: ModelCriterion[] = [];
  if (!Array.isArray(o.criteria)) {
    errors.push('criteria must be an array');
  } else {
    const seen = new Set<string>();
    for (const item of o.criteria) {
      const c = item as Record<string, unknown>;
      const id = typeof c?.criterionId === 'string' ? c.criterionId : null;
      const spec = id === null ? undefined : byId.get(id);
      if (!spec) {
        errors.push(`criterionId ${JSON.stringify(c?.criterionId)} is not on this rubric`);
        continue;
      }
      if (seen.has(spec.id)) {
        errors.push(`criterionId ${spec.id} scored twice`);
        continue;
      }
      seen.add(spec.id);
      const earned = typeof c.earned === 'number' ? c.earned : NaN;
      if (!Number.isFinite(earned) || earned < 0 || earned > spec.maxPoints) {
        errors.push(`earned ${String(c.earned)} out of range for ${spec.id} (max ${spec.maxPoints})`);
        continue;
      }
      criteria.push({
        criterionId: spec.id,
        earned,
        ...(typeof c.feedback === 'string' && c.feedback.trim() !== ''
          ? { feedback: c.feedback }
          : {}),
      });
    }
    if (o.confidence === 'high' && criteria.length !== rubric.length) {
      errors.push(
        `high confidence must score every criterion exactly once (${criteria.length}/${rubric.length})`,
      );
    }
  }

  const registry = new Set(registryIds);
  const misconceptions: ModelMisconception[] = [];
  if (o.misconceptions !== undefined) {
    if (!Array.isArray(o.misconceptions)) {
      errors.push('misconceptions must be an array');
    } else {
      for (const item of o.misconceptions) {
        const m = item as Record<string, unknown>;
        if (typeof m?.misId !== 'string' || !registry.has(m.misId)) {
          errors.push(`misId ${JSON.stringify(m?.misId)} is not in the registry`);
          continue;
        }
        if (typeof m.evidence !== 'string' || m.evidence.trim() === '') {
          errors.push(`misconception ${m.misId} has no evidence excerpt`);
          continue;
        }
        misconceptions.push({ misId: m.misId, evidence: m.evidence.slice(0, 500) });
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    errors: [],
    output: {
      confidence: o.confidence as 'high' | 'low',
      criteria,
      ...(typeof o.general_feedback_draft === 'string' &&
      o.general_feedback_draft.trim() !== ''
        ? { general_feedback_draft: o.general_feedback_draft }
        : {}),
      ...(misconceptions.length > 0 ? { misconceptions } : {}),
    },
  };
}
