// =============================================================================
// ActivityResponses.tsx — the /activity/:id/responses route (0034 G8 + G8-DR)
// -----------------------------------------------------------------------------
// The teacher's grading surface, and ActivityAnalytics's sibling: same route
// family, same data source (section_checks), same version-pinning discipline.
//
// THE COMPOSITION IS RULED, and three parts of it are load-bearing (design
// review 2026-08-15, board responses-tab-20260815):
//
//  * BY QUESTION, not by student (D4). The queue groups section → question →
//    students, because grading every answer to one question in a row is what
//    makes a rubric produce consistent scores. A by-student view is a recorded
//    follow-on, not a toggle in v1.
//  * WORKLOAD IS LEVEL-1, versions are a row TAG (D9). The eng plan grouped by
//    version for data coherence — correct, and untouched in the DATA — but
//    putting version headers at the top of the page makes a teacher's first
//    read infrastructure, and in the common one-version case it is pure
//    chrome. So: "N need grading" leads, and only rows from an older version
//    carry a version tag.
//  * A STALE ROW RE-ENTERS THE QUEUE (D5). When a student revises after being
//    graded, their row comes back wearing the amber chip rather than hiding
//    behind "Graded". A revision that vanishes from the teacher's radar is the
//    exact silent state the whole staleness ruling exists to prevent.
//
// Save is EXPLICIT (no autosave): grading is a deliberate act, an autosaving
// rubric would flood the audit trail with keystrokes, and the editor's
// flush-on-close bug class is not worth re-importing. Leaving a row with
// unsaved entries prompts rather than silently discarding.
//
// THE AI-ASSIST LAYER (0042; ai-grading-assist.md §4b DR-1..12) rides this
// surface without changing its rulings:
//  * Response FIRST, rubric second, suggestion third and SUBORDINATE (DR-1) —
//    pre-filled values wear a draft mark that clears per-field on touch.
//  * Confirm = the existing Save (DR-3): one button; when the panel
//    pre-filled from a draft, Save routes through confirm_grade_suggestion,
//    and the SERVER derives confirmed-vs-edited (DR-2/EH-5). An untouched
//    pre-fill is NOT dirty.
//  * Abstain (D6/DR-5) is a NEUTRAL badge — amber stays staleness's alone.
//  * Worker states (DR-6): "Draft pending" only under a live lease; a
//    never-attempted or worker-off row is a plain manual row; one header
//    heartbeat line makes silence legible.
//  * Assist reads DEGRADE to none: if the assist RPCs fail, the grading
//    queue still loads — drafts are advisory, grading is the product.
// =============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  RESPONSES_COPY as COPY,
  fetchGradingQueue,
  releaseGrades,
  releaseLabel,
  saveCheckGrade,
  unreleasedBadge,
  type CriterionEntry,
  type GradingQueueRow,
} from '../lib/grading';
import {
  ASSIST_COPY,
  confirmSuggestion,
  deriveAssistDisplay,
  fetchAssistStatus,
  fetchSuggestions,
  fetchVersionRubrics,
  quotaPausedLine,
  rejectSuggestion,
  relativeTime,
  type AssistDisplay,
  type AssistStatus,
  type RejectReason,
  type RubricCriterionSpec,
  type SuggestionRow,
} from '../lib/gradingAssist';

/** A queue row's status, in the order the UI cares about. `stale` outranks
 *  `graded` deliberately — see the D5 note in the header. */
type RowStatus = 'needs_grading' | 'stale' | 'graded';

function statusOf(row: GradingQueueRow): RowStatus {
  if (!row.graded) return 'needs_grading';
  return row.stale ? 'stale' : 'graded';
}

/** Needs-grading membership: ungraded OR revised-since-graded. */
function needsGrading(row: GradingQueueRow): boolean {
  return statusOf(row) !== 'graded';
}

function studentName(row: GradingQueueRow): string {
  return row.student_label ?? COPY.notInYourClass;
}

const CHIP: Record<RowStatus, { label: string; className: string }> = {
  needs_grading: {
    label: COPY.needsGrading,
    className: 'border-line-strong bg-surface-2 text-strong',
  },
  // The ONLY amber on the surface: it means "look again", never "error".
  stale: {
    label: COPY.textChanged,
    className: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  graded: {
    label: COPY.graded,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
};

function Chip({ status }: { status: RowStatus }) {
  const chip = CHIP[status];
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${chip.className}`}
      data-chip={status}
    >
      {chip.label}
    </span>
  );
}

/** The per-row assist flag (DR-7: flagged, never segregated). Neutral tones
 *  only — the draft mark must read as "machine-suggested", never as a status
 *  the queue's own chips speak in. */
function AssistFlag({ display }: { display: AssistDisplay }) {
  if (display.kind === 'prefill') {
    return (
      <span
        className="rounded border border-line bg-surface px-1.5 py-0.5 text-xs italic text-muted"
        data-assist="prefill"
      >
        {ASSIST_COPY.aiDraft}
      </span>
    );
  }
  if (display.kind === 'abstain') {
    return (
      <span
        className="rounded border border-line bg-surface px-1.5 py-0.5 text-xs text-muted"
        data-assist="abstain"
      >
        {ASSIST_COPY.abstain}
      </span>
    );
  }
  if (display.kind === 'draft_pending') {
    return (
      <span className="text-xs italic text-muted" data-assist="draft-pending">
        {ASSIST_COPY.draftPending}
      </span>
    );
  }
  return null;
}

export default function ActivityResponses() {
  const { id = '' } = useParams<{ id: string }>();
  const [rows, setRows] = useState<GradingQueueRow[] | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [assistStatus, setAssistStatus] = useState<AssistStatus>({ provider: 'off' });
  const [rubrics, setRubrics] = useState<Map<string, RubricCriterionSpec[]>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnly, setNeedsOnly] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let queue: GradingQueueRow[];
    try {
      queue = await fetchGradingQueue(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setRows(null);
      setLoading(false);
      return;
    }
    // The queue renders the moment it arrives; the assist layer hydrates
    // AFTER it and DEGRADES to nothing on failure. Both halves of that are
    // the same posture: drafts are advisory — a draft layer that could delay
    // or take down grading would invert "advisory, never authoritative".
    // Rows without assist data are plain manual rows (DR-6), so late flags
    // only ever add information.
    setRows(queue);
    setError(null);
    setLoading(false);
    try {
      const [sugg, status, specs] = await Promise.all([
        fetchSuggestions(id),
        fetchAssistStatus(),
        fetchVersionRubrics([...new Set(queue.map((r) => r.activity_version_id))]),
      ]);
      setSuggestions(sugg);
      setAssistStatus(status);
      setRubrics(specs);
    } catch {
      setSuggestions([]);
      setAssistStatus({ provider: 'off' });
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const suggestionByKey = useMemo(() => {
    const map = new Map<string, SuggestionRow>();
    for (const s of suggestions) map.set(`${s.check_id}:${s.block_id}`, s);
    return map;
  }, [suggestions]);

  const visible = useMemo(
    () => (rows ?? []).filter((row) => (needsOnly ? needsGrading(row) : true)),
    [rows, needsOnly],
  );

  /** Section → question → rows. Insertion order follows the RPC's ordering
   *  (version-desc then section then block); WITHIN a question, rows order
   *  oldest-submission-first (DR-7's fairness rule, applied at the level the
   *  D4 by-question grouping leaves free). */
  const groups = useMemo(() => {
    const bySection = new Map<string, Map<string, GradingQueueRow[]>>();
    for (const row of visible) {
      const questions = bySection.get(row.section_id) ?? new Map();
      questions.set(row.block_id, [...(questions.get(row.block_id) ?? []), row]);
      bySection.set(row.section_id, questions);
    }
    for (const questions of bySection.values()) {
      for (const blockRows of questions.values()) {
        blockRows.sort(
          (a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime(),
        );
      }
    }
    return bySection;
  }, [visible]);

  const key = (row: GradingQueueRow) => `${row.check_id}:${row.block_id}`;
  const current = useMemo(
    () => (rows ?? []).find((row) => key(row) === selected) ?? null,
    [rows, selected],
  );

  const outstanding = (rows ?? []).filter(needsGrading).length;
  // Only students whose identity this teacher may see can be named in a
  // release action, so the bulk affordance counts exactly those.
  const unreleasedByStudent = useMemo(() => {
    const map = new Map<string, { count: number; label: string }>();
    for (const row of rows ?? []) {
      if (!row.graded || row.released_at) continue;
      const entry = map.get(row.student_id) ?? { count: 0, label: studentName(row) };
      map.set(row.student_id, { count: entry.count + 1, label: entry.label });
    }
    return map;
  }, [rows]);

  async function releaseAll() {
    setBusy(true);
    try {
      for (const studentId of unreleasedByStudent.keys()) {
        await releaseGrades(id, studentId);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const totalUnreleased = [...unreleasedByStudent.values()].reduce(
    (sum, entry) => sum + entry.count,
    0,
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink">{COPY.title}</h1>
        <Link
          to={`/activity/${id}`}
          className="text-sm font-medium text-muted underline underline-offset-2 hover:text-strong"
        >
          Back to editor
        </Link>
      </div>

      {loading && <p className="text-sm text-muted">Loading…</p>}

      {error && (
        <div role="alert" className="rounded-lg border border-line bg-surface-2 p-4 text-sm text-danger">
          {COPY.loadFailed}: {error}
        </div>
      )}

      {rows && !loading && !error && (
        <>
          {/* Level-1 is the WORKLOAD (D9), not the version structure. */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {/* The header is the WORKLOAD count and nothing else. When the
                count is zero the card below says so — saying it in both places
                made "All caught up" ambiguous to read and to assert. */}
            {outstanding > 0 && (
              <p className="text-sm font-semibold text-strong" data-outstanding={outstanding}>
                {outstanding} need grading
              </p>
            )}
            <label className="flex items-center gap-1.5 text-sm text-muted">
              <input
                type="checkbox"
                checked={needsOnly}
                onChange={(e) => setNeedsOnly(e.target.checked)}
              />
              {COPY.needsGrading}
            </label>
            {totalUnreleased > 0 && (
              <button
                type="button"
                onClick={() => void releaseAll()}
                disabled={busy}
                className="min-h-[44px] rounded-md bg-ink px-3 text-sm font-semibold text-canvas disabled:opacity-45"
              >
                Release all graded ({unreleasedByStudent.size} student
                {unreleasedByStudent.size === 1 ? '' : 's'})
              </button>
            )}
            {/* DR-6: ONE heartbeat line, only when the provider is on —
                silence with the worker off is a plain manual queue, not a
                mystery. DR-9: the paused line mirrors the claim gate itself
                (same §G2 computation server-side), in NEUTRAL tones. */}
            {assistStatus.provider !== 'off' && (
              <span className="text-xs text-muted" data-assist-heartbeat>
                {assistStatus.last_draft_at
                  ? `${ASSIST_COPY.heartbeat} ${relativeTime(assistStatus.last_draft_at)}`
                  : ASSIST_COPY.heartbeatNone}
              </span>
            )}
            {assistStatus.provider !== 'off' && assistStatus.quota_paused && (
              <span
                className="rounded border border-line-strong bg-surface-2 px-2 py-0.5 text-xs font-semibold text-strong"
                data-assist-quota-paused
              >
                {quotaPausedLine(assistStatus.resumes_at)}
              </span>
            )}
          </div>

          {rows.length === 0 ? (
            <EmptyState title={COPY.emptyTitle} body={COPY.emptyBody} />
          ) : visible.length === 0 ? (
            // Distinct from the empty state above, and it names the remainder:
            // finishing the grading must not silently skip releasing it.
            <EmptyState
              title={COPY.allCaughtTitle}
              body={
                totalUnreleased > 0
                  ? `${COPY.allCaughtBody} ${unreleasedBadge(totalUnreleased)}.`
                  : COPY.allCaughtBody
              }
              action={
                <button
                  type="button"
                  onClick={() => setNeedsOnly(false)}
                  className="min-h-[44px] text-sm font-semibold text-strong underline underline-offset-2"
                >
                  {COPY.showGraded}
                </button>
              }
            />
          ) : (
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="md:w-2/5">
                {[...groups.entries()].map(([sectionId, questions]) => (
                  <div key={sectionId} className="mb-4">
                    <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">
                      {sectionId}
                    </h2>
                    {[...questions.entries()].map(([blockId, blockRows]) => (
                      <div
                        key={blockId}
                        className="mb-2 overflow-hidden rounded-lg border border-line bg-canvas"
                      >
                        {blockRows.map((row) => (
                          <button
                            key={key(row)}
                            type="button"
                            onClick={() => setSelected(key(row))}
                            aria-current={key(row) === selected ? true : undefined}
                            className={`flex min-h-[44px] w-full items-center gap-2 border-b border-line px-3 py-2 text-left last:border-b-0 ${
                              key(row) === selected ? 'bg-surface-2' : ''
                            }`}
                          >
                            <span className="text-sm font-semibold text-ink">
                              {studentName(row)}
                            </span>
                            <span className="flex-1 truncate text-xs text-muted">
                              {row.response_text ?? (
                                <em>{COPY.noAnswer}</em>
                              )}
                            </span>
                            {!row.is_current && (
                              <span className="rounded border border-line px-1.5 text-xs text-muted">
                                v{row.version_num}
                              </span>
                            )}
                            <AssistFlag
                              display={deriveAssistDisplay(
                                suggestionByKey.get(key(row)),
                                row.graded,
                              )}
                            />
                            <Chip status={statusOf(row)} />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="md:flex-1">
                {current ? (
                  <GradePanel
                    key={key(current)}
                    row={current}
                    activityId={id}
                    suggestion={suggestionByKey.get(key(current))}
                    rubric={
                      rubrics.get(`${current.activity_version_id}:${current.block_id}`) ?? null
                    }
                    onSaved={load}
                  />
                ) : (
                  <p className="rounded-lg border border-line bg-canvas p-6 text-sm text-muted">
                    Pick a response to grade.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-canvas px-6 py-10 text-center">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/** The draft mark (DR-1): italic + a visible "AI draft" tag beside the field
 *  it describes, cleared the moment the teacher touches that field. A style
 *  alone would not survive grayscale or a screen reader; the tag is text. */
function DraftMark() {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted" data-draft-mark>
      {ASSIST_COPY.aiDraft}
    </span>
  );
}

/**
 * The grading panel. Entries live in local state until Save — explicit by
 * ruling — and a failed save KEEPS them: losing a teacher's typed rubric to a
 * network blip is the worst outcome this screen has, so the error renders
 * beside the button and the same payload can be retried.
 *
 * PRE-FILL MODE (DR-1/2/3): when an ungraded row has a pending high-confidence
 * draft, entries initialize from it, each field wears the draft mark until
 * touched, and Save routes through confirm_grade_suggestion — the server
 * writes grade + resolution in ONE transaction and derives confirmed-vs-edited
 * itself. The rubric spec (labels, maxPoints) comes from the PINNED version,
 * so a first-time manual grade renders rubric rows too.
 */
function GradePanel({
  row,
  activityId,
  suggestion,
  rubric,
  onSaved,
}: {
  row: GradingQueueRow;
  activityId: string;
  suggestion: SuggestionRow | undefined;
  rubric: RubricCriterionSpec[] | null;
  onSaved: () => Promise<void>;
}) {
  const display = deriveAssistDisplay(suggestion, row.graded);
  const prefill = display.kind === 'prefill' ? display.suggestion : null;

  // The rubric the inputs render against: the pinned spec, else whatever a
  // saved grade already carries (maxPoints is denormalized on grades, 0034).
  const spec: RubricCriterionSpec[] = useMemo(() => {
    if (rubric && rubric.length > 0) return rubric;
    return (row.criteria ?? []).map((c) => ({
      id: c.criterionId,
      label: c.criterionId,
      maxPoints: c.maxPoints,
    }));
  }, [rubric, row.criteria]);

  const [entries, setEntries] = useState<CriterionEntry[]>(() => {
    const source = row.graded ? row.criteria : prefill ? prefill.criteria : row.criteria;
    return (source ?? []).map((c) => ({
      criterionId: c.criterionId,
      earned: c.earned,
      feedback: c.feedback ?? undefined,
    }));
  });
  const [general, setGeneral] = useState(
    () => (row.graded ? row.general_feedback : prefill?.general_feedback_draft) ?? '',
  );
  // DR-1: which fields still wear the draft mark. Keyed 'pts:<id>',
  // 'fb:<id>', 'general'. Starts full in pre-fill mode, empties on touch.
  const [drafted, setDrafted] = useState<Set<string>>(() => {
    if (!prefill) return new Set();
    const marks = new Set<string>();
    for (const c of prefill.criteria) {
      marks.add(`pts:${c.criterionId}`);
      if (c.feedback) marks.add(`fb:${c.criterionId}`);
    }
    if (prefill.general_feedback_draft) marks.add('general');
    return marks;
  });
  const [struck, setStruck] = useState<Set<string>>(new Set());
  const [rejecting, setRejecting] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [releasing, setReleasing] = useState(false);
  const [evidenceFor, setEvidenceFor] = useState<string | null>(null);

  const touch = (mark: string) =>
    setDrafted((prev) => {
      if (!prev.has(mark)) return prev;
      const next = new Set(prev);
      next.delete(mark);
      return next;
    });

  function setEntry(criterionId: string, patch: Partial<CriterionEntry>) {
    setEntries((prev) => {
      const existing = prev.find((p) => p.criterionId === criterionId);
      const merged: CriterionEntry = {
        criterionId,
        earned: existing?.earned ?? 0,
        feedback: existing?.feedback,
        ...patch,
      };
      return [...prev.filter((p) => p.criterionId !== criterionId), merged];
    });
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    setOutcome(null);
    try {
      if (prefill && !rejected) {
        // Confirm = the existing Save (DR-3). The server computes the DR-2
        // diff against the stored draft; the client only reports strikes.
        const result = await confirmSuggestion({
          suggestionId: prefill.suggestion_id,
          expectedUpdatedAt: prefill.updated_at,
          criteria: entries,
          generalFeedback: general,
          struckMis: [...struck],
        });
        setOutcome(
          result === 'confirmed' ? ASSIST_COPY.savedConfirmed : ASSIST_COPY.savedEdited,
        );
      } else {
        await saveCheckGrade({
          checkId: row.check_id,
          blockId: row.block_id,
          criteria: entries,
          generalFeedback: general,
        });
      }
      await onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('suggestion_changed')) {
        // EH-5: the draft moved under the teacher. Never guess whose values
        // won — reload the row and let them look again.
        setSaveError(ASSIST_COPY.draftChanged);
        await onSaved();
      } else {
        // Entries stay in state on purpose — see the panel's doc comment.
        setSaveError(COPY.saveFailed);
      }
    } finally {
      setSaving(false);
    }
  }

  async function reject(reason: RejectReason | null) {
    if (!prefill) return;
    setSaving(true);
    setSaveError(null);
    try {
      await rejectSuggestion({
        suggestionId: prefill.suggestion_id,
        expectedUpdatedAt: prefill.updated_at,
        reason,
      });
      // DR-8: reject clears the drafted values to a blank rubric — the row
      // becomes a plain manual row, in place, without losing the selection.
      setEntries([]);
      setGeneral('');
      setDrafted(new Set());
      setStruck(new Set());
      setRejecting(false);
      setRejected(true);
      setOutcome(ASSIST_COPY.draftRejected);
      await onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSaveError(message.includes('suggestion_changed') ? ASSIST_COPY.draftChanged : COPY.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function release() {
    setReleasing(true);
    try {
      await releaseGrades(activityId, row.student_id);
      await onSaved();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setReleasing(false);
    }
  }

  // DR-10: the teacher-only provenance trail on graded rows.
  const provenance =
    row.graded && display.kind === 'provenance'
      ? display.suggestion.status === 'edited'
        ? ASSIST_COPY.provenanceEdited
        : display.suggestion.status === 'confirmed'
          ? ASSIST_COPY.provenanceUnedited
          : display.suggestion.status === 'rejected'
            ? ASSIST_COPY.provenanceRejected
            : null
      : null;

  return (
    <div className="rounded-lg border border-line bg-canvas p-4">
      <p className="text-xs text-muted">
        {studentName(row)} · attempt {row.attempt_number}
      </p>

      {/* DR-1: the response comes FIRST — a teacher who reads the draft
          before the work is a teacher whose edit-rate stops meaning much. */}
      <div className="mt-2 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink">
        {row.response_text ?? <em className="text-muted">{COPY.noAnswer}</em>}
      </div>

      {display.kind === 'abstain' && (
        <p
          className="mt-2 rounded border border-line bg-surface px-2 py-1 text-xs text-muted"
          data-assist="abstain"
        >
          {ASSIST_COPY.abstain}
        </p>
      )}

      {prefill && !rejected && (
        <p className="mt-2 text-xs italic text-muted" data-assist="draft-note">
          {ASSIST_COPY.draftNote}
        </p>
      )}

      {spec.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {spec.map((criterion) => {
            const entry = entries.find((e) => e.criterionId === criterion.id);
            return (
              <li key={criterion.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <label className="flex-1" htmlFor={`pts-${criterion.id}`}>
                    {criterion.label}
                  </label>
                  {drafted.has(`pts:${criterion.id}`) && <DraftMark />}
                  <input
                    id={`pts-${criterion.id}`}
                    type="number"
                    min={0}
                    max={criterion.maxPoints}
                    value={entry?.earned ?? ''}
                    onChange={(e) => {
                      touch(`pts:${criterion.id}`);
                      // Clamp here as well as server-side: the server refuses
                      // an out-of-range score (0034 §C), and a field that lets
                      // a teacher type 9 into a 4-point criterion only to
                      // bounce it on Save is a worse way to say the same
                      // thing.
                      const raw = Number(e.target.value);
                      const earned = Number.isFinite(raw)
                        ? Math.min(Math.max(raw, 0), criterion.maxPoints)
                        : 0;
                      setEntry(criterion.id, { earned });
                    }}
                    className={`w-16 rounded-md border border-line-strong px-2 py-1 text-center ${
                      drafted.has(`pts:${criterion.id}`) ? 'italic text-muted' : ''
                    }`}
                  />
                  <span className="text-muted">/ {criterion.maxPoints}</span>
                </div>
                {(entry?.feedback !== undefined || prefill) && (
                  <div className="mt-1 flex items-center gap-2 pl-4">
                    <label className="sr-only" htmlFor={`fb-${criterion.id}`}>
                      {ASSIST_COPY.criterionFeedback} — {criterion.label}
                    </label>
                    {drafted.has(`fb:${criterion.id}`) && <DraftMark />}
                    <input
                      id={`fb-${criterion.id}`}
                      type="text"
                      placeholder={ASSIST_COPY.criterionFeedback}
                      value={entry?.feedback ?? ''}
                      onChange={(e) => {
                        touch(`fb:${criterion.id}`);
                        setEntry(criterion.id, {
                          feedback: e.target.value === '' ? undefined : e.target.value,
                        });
                      }}
                      className={`w-full rounded-md border border-line px-2 py-1 text-xs ${
                        drafted.has(`fb:${criterion.id}`) ? 'italic text-muted' : ''
                      }`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      {/* DR-4: individually strikeable observation chips. Confirmed by
          default WITH the grade; a strike disagrees with one observation
          without rejecting the draft. Strikes are edits (the server counts
          them) and per-tag telemetry. */}
      {prefill && !rejected && prefill.misconception_notes.length > 0 && (
        <div className="mt-3" data-assist="misconceptions">
          <p className="text-xs font-semibold text-strong">
            {ASSIST_COPY.misconceptionsHeading}
          </p>
          <p className="text-xs text-muted">{ASSIST_COPY.strikeHint}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {prefill.misconception_notes.map((note) => {
              const isStruck = struck.has(note.misId);
              return (
                <button
                  key={note.misId}
                  type="button"
                  aria-pressed={isStruck}
                  onClick={() =>
                    setStruck((prev) => {
                      const next = new Set(prev);
                      if (next.has(note.misId)) next.delete(note.misId);
                      else next.add(note.misId);
                      return next;
                    })
                  }
                  onFocus={() => setEvidenceFor(note.misId)}
                  onMouseEnter={() => setEvidenceFor(note.misId)}
                  className={`min-h-[44px] rounded-full border px-3 text-xs font-medium ${
                    isStruck
                      ? 'border-line bg-surface text-muted line-through'
                      : 'border-line-strong bg-surface-2 text-strong'
                  }`}
                >
                  {note.misId}
                </button>
              );
            })}
          </div>
          {evidenceFor && (
            <p className="mt-1 text-xs text-muted" data-assist="evidence">
              {/* Evidence renders as TEXT, never markup (design §4b/D-security). */}
              {prefill.misconception_notes.find((n) => n.misId === evidenceFor)?.evidence ??
                ''}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <label className="block text-sm font-semibold text-strong" htmlFor="general-feedback">
          {COPY.generalFeedback}
        </label>
        {drafted.has('general') && <DraftMark />}
      </div>
      <textarea
        id="general-feedback"
        value={general}
        onChange={(e) => {
          touch('general');
          setGeneral(e.target.value);
        }}
        className={`mt-1 w-full rounded-md border border-line px-3 py-2 text-sm ${
          drafted.has('general') ? 'italic text-muted' : ''
        }`}
        rows={3}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="min-h-[44px] rounded-md bg-ink px-4 text-sm font-semibold text-canvas disabled:opacity-45"
        >
          {saving ? COPY.saving : COPY.save}
        </button>
        {prefill && !rejected && !rejecting && (
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="min-h-[44px] rounded-md border border-line px-4 text-sm font-medium text-muted"
          >
            {ASSIST_COPY.rejectDraft}
          </button>
        )}
        {row.graded && !row.released_at && (
          <button
            type="button"
            onClick={() => void release()}
            disabled={releasing}
            className="min-h-[44px] rounded-md border border-line-strong px-4 text-sm font-semibold text-strong disabled:opacity-45"
          >
            {releaseLabel(1, studentName(row))}
          </button>
        )}
      </div>

      {/* DR-8: the one-tap reason — optional, three fixed causes, per-rev
          telemetry. Inline, not a modal: rejecting a draft is a small act. */}
      {rejecting && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5" data-assist="reject-reasons">
          <span className="text-xs text-muted">{ASSIST_COPY.rejectWhy}</span>
          {(Object.keys(ASSIST_COPY.rejectReasons) as RejectReason[]).map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => void reject(reason)}
              className="min-h-[44px] rounded border border-line px-2 text-xs text-strong"
            >
              {ASSIST_COPY.rejectReasons[reason]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void reject(null)}
            className="min-h-[44px] rounded border border-line px-2 text-xs text-muted"
          >
            {ASSIST_COPY.rejectNoReason}
          </button>
          <button
            type="button"
            onClick={() => setRejecting(false)}
            className="min-h-[44px] px-2 text-xs text-muted underline underline-offset-2"
          >
            {ASSIST_COPY.rejectCancel}
          </button>
        </div>
      )}

      {/* The released state is PERSISTENT chrome, not a toast: edits to an
          already-released grade go live immediately (G4), and a teacher
          reworking a score deserves to know they are editing in public. */}
      {row.released_at && (
        <p className="mt-2 text-xs font-semibold text-strong">{COPY.releasedNote}</p>
      )}

      {/* DR-10: provenance, teacher-facing only — student attribution never
          changes (D9). */}
      {provenance && (
        <p className="mt-2 text-xs text-muted" data-assist="provenance">
          {provenance}
        </p>
      )}

      {/* DR-11: outcomes announce. role=status is polite — it reports, it
          does not interrupt the next row's grading. */}
      <p role="status" className="mt-2 text-xs font-medium text-strong">
        {outcome ?? ''}
      </p>

      {saveError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {saveError}
        </p>
      )}
    </div>
  );
}
