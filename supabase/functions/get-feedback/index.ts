// =============================================================================
// get-feedback — student-facing manual grading feedback (Phase 2.6)
// -----------------------------------------------------------------------------
// POST { submission_id } → this submission's per-criterion grading feedback,
// joined server-side with the rubric from the PINNED activity version (so the
// student page never needs the rubric baked in). The submission_id is an
// unguessable capability: no auth, service-role read; whoever holds the id (the
// student who submitted, from their own localStorage) sees that submission's
// feedback and nothing else. Returns { graded:false } when nothing is graded
// yet, so the sidecar can quietly show nothing.
//
// Deploy with `pnpm deploy:feedback` (flag baked in). This endpoint MUST run
// with `--no-verify-jwt`, exactly like ingest-submission: published pages fetch
// it anonymously with NO Authorization header, so the platform's default
// verify_jwt gate would 401 every request before this code runs. The
// submission_id capability is the only auth — that's by design. (A plain
// `supabase functions deploy get-feedback` re-enables verify_jwt and silently
// breaks anonymous feedback, the same footgun ingest-submission has.) Set the
// publish-activity FEEDBACK_ENDPOINT (or let it derive from SUBMISSION_ENDPOINT)
// so published pages point at it.
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ActivityDocument } from '../_shared/renderer.bundle.js';
import { handlePreflight, jsonResponse, errorResponse } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Criterion {
  id: string;
  label: string;
  maxPoints: number;
}
interface GradeRow {
  block_id: string;
  criteria: unknown;
  general_feedback: string | null;
  updated_at: string;
}

// Walk a validated document for short_answer/essay blocks carrying a rubric,
// returning blockId -> its criteria. Recurses into every nested block container
// (columns cells, faded/worked-example bodies) generically.
function collectRubrics(doc: unknown): Map<string, Criterion[]> {
  const out = new Map<string, Criterion[]>();
  const visit = (block: Record<string, unknown>): void => {
    const type = block.type;
    if (
      (type === 'short_answer' || type === 'essay') &&
      block.rubric &&
      typeof block.rubric === 'object'
    ) {
      const criteria = (block.rubric as { criteria?: unknown }).criteria;
      if (Array.isArray(criteria)) {
        out.set(block.id as string, criteria as Criterion[]);
      }
    }
    // Recurse into any nested block arrays this block carries.
    if (Array.isArray(block.content)) {
      for (const c of block.content) if (c && typeof c === 'object') visit(c as Record<string, unknown>);
    }
    if (Array.isArray(block.columns)) {
      for (const col of block.columns) {
        const cells = (col as { blocks?: unknown }).blocks;
        if (Array.isArray(cells)) {
          for (const c of cells) if (c && typeof c === 'object') visit(c as Record<string, unknown>);
        }
      }
    }
  };
  const sections = (doc as { sections?: unknown }).sections;
  if (Array.isArray(sections)) {
    for (const s of sections) {
      const blocks = (s as { blocks?: unknown }).blocks;
      if (Array.isArray(blocks)) {
        for (const b of blocks) if (b && typeof b === 'object') visit(b as Record<string, unknown>);
      }
    }
  }
  return out;
}

// Join grade rows with rubric criteria into the sidecar's shape. Pure — the
// heart of the endpoint, kept separate for clarity.
function shapeFeedback(
  rubrics: Map<string, Criterion[]>,
  grades: GradeRow[],
): {
  graded: boolean;
  gradedAt?: string;
  blocks: Array<{
    blockId: string;
    criteria: Array<{ label: string; maxPoints: number; earned?: number; feedback?: string }>;
    generalFeedback?: string;
  }>;
} {
  const blocks: Array<{
    blockId: string;
    criteria: Array<{ label: string; maxPoints: number; earned?: number; feedback?: string }>;
    generalFeedback?: string;
  }> = [];
  let latest = '';

  for (const g of grades) {
    const criteria = rubrics.get(g.block_id);
    if (!criteria) continue; // graded a block whose rubric is gone — skip
    if (g.updated_at > latest) latest = g.updated_at;

    const earnedById = new Map<string, { earned: number; feedback?: string }>();
    if (Array.isArray(g.criteria)) {
      for (const c of g.criteria as Array<Record<string, unknown>>) {
        const id = c.criterionId;
        const earned = Number(c.earned);
        if (typeof id === 'string' && Number.isFinite(earned)) {
          earnedById.set(id, {
            earned,
            feedback: typeof c.feedback === 'string' ? c.feedback : undefined,
          });
        }
      }
    }

    blocks.push({
      blockId: g.block_id,
      criteria: criteria.map((crit) => {
        const e = earnedById.get(crit.id);
        return {
          label: crit.label,
          maxPoints: crit.maxPoints,
          ...(e ? { earned: e.earned } : {}),
          ...(e?.feedback ? { feedback: e.feedback } : {}),
        };
      }),
      ...(g.general_feedback ? { generalFeedback: g.general_feedback } : {}),
    });
  }

  return {
    graded: blocks.length > 0,
    ...(latest ? { gradedAt: latest } : {}),
    blocks,
  };
}

Deno.serve(async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== 'POST') return errorResponse(req, 405, 'Method not allowed');

  let body: { submission_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, 400, 'Invalid JSON body');
  }
  const submissionId = body.submission_id;
  if (typeof submissionId !== 'string' || !UUID_RE.test(submissionId)) {
    return errorResponse(req, 400, 'submission_id must be a UUID');
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // The submission → which version's rubric to read against.
  const { data: sub, error: subErr } = await admin
    .from('submissions')
    .select('id, activity_id, activity_version_id')
    .eq('id', submissionId)
    .maybeSingle();
  if (subErr) return errorResponse(req, 500, 'Lookup failed');
  if (!sub) return errorResponse(req, 404, 'Not found');

  // Grades for this submission. None yet → not graded (a valid, common answer).
  const { data: gradeData, error: gradeErr } = await admin
    .from('grades')
    .select('block_id, criteria, general_feedback, updated_at')
    .eq('submission_id', submissionId);
  if (gradeErr) return errorResponse(req, 500, 'Lookup failed');
  if (!gradeData || gradeData.length === 0) {
    return jsonResponse(req, 200, { graded: false, blocks: [] });
  }

  // Pinned version content (fall back to the activity's current version for
  // legacy rows with a null activity_version_id).
  let versionId = sub.activity_version_id as string | null;
  if (!versionId) {
    const { data: act } = await admin
      .from('activities')
      .select('current_version_id')
      .eq('id', sub.activity_id)
      .maybeSingle();
    versionId = (act?.current_version_id as string | null) ?? null;
  }
  if (!versionId) return jsonResponse(req, 200, { graded: false, blocks: [] });

  const { data: version, error: vErr } = await admin
    .from('activity_versions')
    .select('content')
    .eq('id', versionId)
    .maybeSingle();
  if (vErr || !version) return errorResponse(req, 500, 'Lookup failed');

  const parsed = ActivityDocument.safeParse(version.content);
  if (!parsed.success) return jsonResponse(req, 200, { graded: false, blocks: [] });

  const rubrics = collectRubrics(parsed.data);
  const payload = shapeFeedback(rubrics, gradeData as GradeRow[]);
  return jsonResponse(req, 200, payload);
});
