// =============================================================================
// runtime/feedback.ts — student-facing manual-feedback sidecar (Phase 2.6)
// -----------------------------------------------------------------------------
// A tiny, self-contained IIFE inlined by document.ts ONLY on pages that have a
// short_answer/essay block (they carry a `.free-text-feedback` mount point).
// Kept OUT of the base runtime so no page pays for it unless it can be graded.
//
// On load: read the config (activityId + feedbackEndpoint) and the submission_id
// this browser stored when it submitted (the main runtime saves it on a
// successful submit). If both exist, POST to get-feedback; when the teacher has
// graded, fill each block's mount point with its per-criterion scores + feedback
// and reveal it. Everything is best-effort and silent on any failure — feedback
// is a bonus, never a blocker. All text goes in via textContent (no innerHTML),
// so teacher-authored feedback can't inject markup.
// =============================================================================

interface CriterionFeedback {
  label: string;
  maxPoints: number;
  earned?: number;
  feedback?: string;
}
interface BlockFeedback {
  blockId: string;
  criteria: CriterionFeedback[];
  generalFeedback?: string;
}
interface FeedbackResponse {
  graded: boolean;
  gradedAt?: string;
  blocks?: BlockFeedback[];
}

function readConfig(): { activityId: string; feedbackEndpoint: string } | null {
  const el = document.getElementById('activity-config');
  if (!el) return null;
  let c: { activityId?: unknown; feedbackEndpoint?: unknown };
  try {
    c = JSON.parse(el.textContent || '{}');
  } catch {
    return null;
  }
  if (
    typeof c.activityId !== 'string' ||
    typeof c.feedbackEndpoint !== 'string'
  ) {
    return null; // no feedback endpoint emitted → nothing to do
  }
  return { activityId: c.activityId, feedbackEndpoint: c.feedbackEndpoint };
}

function loadSubmissionId(activityId: string): string | null {
  try {
    return localStorage.getItem('activity_submission_id_' + activityId);
  } catch {
    return null;
  }
}

function el(tag: string, className: string, text?: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderBlock(container: HTMLElement, block: BlockFeedback): void {
  const panel = el('div', 'free-text-feedback__panel');
  panel.appendChild(el('p', 'free-text-feedback__heading', 'Feedback'));

  for (const c of block.criteria) {
    const row = el('div', 'free-text-feedback__criterion');
    row.appendChild(el('span', 'free-text-feedback__criterion-label', c.label));
    row.appendChild(
      el(
        'span',
        'free-text-feedback__criterion-score',
        (c.earned === undefined ? '—' : String(c.earned)) + ' / ' + c.maxPoints,
      ),
    );
    if (c.feedback) {
      row.appendChild(
        el('p', 'free-text-feedback__criterion-fb', c.feedback),
      );
    }
    panel.appendChild(row);
  }

  if (block.generalFeedback) {
    panel.appendChild(
      el('p', 'free-text-feedback__general', block.generalFeedback),
    );
  }

  container.textContent = '';
  container.appendChild(panel);
  container.hidden = false;
}

// Exported for tests; the auto-invoke at the bottom is the production entry.
export function run(): void {
  const containers = Array.prototype.slice.call(
    document.querySelectorAll('.free-text-feedback'),
  ) as HTMLElement[];
  if (containers.length === 0) return;
  const config = readConfig();
  if (!config) return;
  const submissionId = loadSubmissionId(config.activityId);
  if (!submissionId) return;

  void fetch(config.feedbackEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submission_id: submissionId }),
  })
    .then((r) => (r.ok ? (r.json() as Promise<FeedbackResponse>) : null))
    .then((data) => {
      if (!data || !data.graded || !data.blocks) return;
      const byId: Record<string, BlockFeedback> = {};
      for (const b of data.blocks) byId[b.blockId] = b;
      for (const container of containers) {
        const blockId = container.getAttribute('data-for-block');
        const block = blockId ? byId[blockId] : undefined;
        if (block) renderBlock(container, block);
      }
    })
    .catch(() => {
      /* feedback is best-effort — stay silent */
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
