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

export default function ActivityResponses() {
  const { id = '' } = useParams<{ id: string }>();
  const [rows, setRows] = useState<GradingQueueRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnly, setNeedsOnly] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchGradingQueue(id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setRows(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(
    () => (rows ?? []).filter((row) => (needsOnly ? needsGrading(row) : true)),
    [rows, needsOnly],
  );

  /** Section → question → rows. Insertion order follows the RPC's ordering,
   *  which is already version-desc then section then block. */
  const groups = useMemo(() => {
    const bySection = new Map<string, Map<string, GradingQueueRow[]>>();
    for (const row of visible) {
      const questions = bySection.get(row.section_id) ?? new Map();
      questions.set(row.block_id, [...(questions.get(row.block_id) ?? []), row]);
      bySection.set(row.section_id, questions);
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
                            className={`flex w-full items-center gap-2 border-b border-line px-3 py-2 text-left last:border-b-0 ${
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

/**
 * The grading panel. Entries live in local state until Save — explicit by
 * ruling — and a failed save KEEPS them: losing a teacher's typed rubric to a
 * network blip is the worst outcome this screen has, so the error renders
 * beside the button and the same payload can be retried.
 */
function GradePanel({
  row,
  activityId,
  onSaved,
}: {
  row: GradingQueueRow;
  activityId: string;
  onSaved: () => Promise<void>;
}) {
  const [entries, setEntries] = useState<CriterionEntry[]>(
    () =>
      (row.criteria ?? []).map((c) => ({
        criterionId: c.criterionId,
        earned: c.earned,
        feedback: c.feedback ?? undefined,
      })),
  );
  const [general, setGeneral] = useState(row.general_feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [releasing, setReleasing] = useState(false);

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      await saveCheckGrade({
        checkId: row.check_id,
        blockId: row.block_id,
        criteria: entries,
        generalFeedback: general,
      });
      await onSaved();
    } catch (err) {
      // Entries stay in state on purpose — see the panel's doc comment.
      setSaveError(err instanceof Error ? err.message : String(err));
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

  return (
    <div className="rounded-lg border border-line bg-canvas p-4">
      <p className="text-xs text-muted">
        {studentName(row)} · attempt {row.attempt_number}
      </p>

      <div className="mt-2 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink">
        {row.response_text ?? <em className="text-muted">{COPY.noAnswer}</em>}
      </div>

      {row.criteria && row.criteria.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {row.criteria.map((criterion) => {
            const entry = entries.find((e) => e.criterionId === criterion.criterionId);
            return (
              <li key={criterion.criterionId} className="flex items-center gap-2 text-sm">
                <label className="flex-1" htmlFor={`pts-${criterion.criterionId}`}>
                  {criterion.criterionId}
                </label>
                <input
                  id={`pts-${criterion.criterionId}`}
                  type="number"
                  min={0}
                  max={criterion.maxPoints}
                  value={entry?.earned ?? ''}
                  onChange={(e) => {
                    // Clamp here as well as server-side: the server refuses an
                    // out-of-range score (0034 §C), and a field that lets a
                    // teacher type 9 into a 4-point criterion only to bounce
                    // it on Save is a worse way to say the same thing.
                    const raw = Number(e.target.value);
                    const earned = Number.isFinite(raw)
                      ? Math.min(Math.max(raw, 0), criterion.maxPoints)
                      : 0;
                    setEntries((prev) => [
                      ...prev.filter((p) => p.criterionId !== criterion.criterionId),
                      { criterionId: criterion.criterionId, earned },
                    ]);
                  }}
                  className="w-16 rounded-md border border-line-strong px-2 py-1 text-center"
                />
                <span className="text-muted">/ {criterion.maxPoints}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      <label className="mt-3 block text-sm font-semibold text-strong" htmlFor="general-feedback">
        {COPY.generalFeedback}
      </label>
      <textarea
        id="general-feedback"
        value={general}
        onChange={(e) => setGeneral(e.target.value)}
        className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"
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

      {/* The released state is PERSISTENT chrome, not a toast: edits to an
          already-released grade go live immediately (G4), and a teacher
          reworking a score deserves to know they are editing in public. */}
      {row.released_at && (
        <p className="mt-2 text-xs font-semibold text-strong">{COPY.releasedNote}</p>
      )}

      {saveError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {COPY.saveFailed}
        </p>
      )}
    </div>
  );
}
