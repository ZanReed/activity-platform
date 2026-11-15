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
// flush-on-close bug class is not worth re-importing. Switching to another
// row (a click or Next) with unsaved entries prompts rather than silently
// discarding, and so does closing or reloading the tab. The page's own links
// (the results tabs, back links) are NOT guarded: BrowserRouter has no
// navigation blocker.
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

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { HIDE_NAMES_KEY, pseudonyms, readFlag, safeProgressPath, writeFlag } from '../lib/classProgress';
import { groupRows, nextOwedKey, rowKey } from '../lib/responsesQueue';
import { emptyQueueLabels, fetchQueueLabels, type QueueLabels } from '../lib/responsesLabels';
import {
  NEXT_COPY,
  RESPONSES_COPY as COPY,
  fetchGradingQueue,
  releaseGrades,
  unreleasedBadge,
  type GradingQueueRow,
} from '../lib/grading';
import ConfirmDialog from '../components/ConfirmDialog';
import ActivityResultsHeader from '../components/ActivityResultsHeader';
// The grading panel opens on a click, so it is its own chunk; the page warms
// it as soon as the queue arrives, so the first click does not wait for it.
const loadGradePanel = () => import('../components/GradePanel');
const GradePanel = lazy(loadGradePanel);
import { RELEASE_ALL_COPY, releaseEach } from '../lib/releaseAll';
import { fetchDolPassStatus, type DolPassRow } from '../lib/dolPass';
import {
  ASSIST_COPY,
  confirmSuggestion,
  deriveAssistDisplay,
  fetchAssistStatus,
  fetchSuggestions,
  fetchVersionRubrics,
  fetchDolOptionals,
  fetchDolPrimaries,
  quotaPausedLine,
  rejectSuggestion,
  relativeTime,
  type AssistDisplay,
  type AssistStatus,
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

// Hide names (the progress pages' switch, same device-remembered choice):
// "Student 4" in place of every name on the page, numbered by name order so
// the number holds still. A student outside the teacher's classes has no name
// to hide and keeps the plain "Not in your classes".
type NameOf = (row: GradingQueueRow) => string;

/** The assist values the lazy GradePanel uses (see its import note). */
const ASSIST_API = { ASSIST_COPY, confirmSuggestion, deriveAssistDisplay, rejectSuggestion };

/** The student picker's value for everyone outside the teacher's classes. */
const OUTSIDE = '__outside__';


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
  // Opened from a progress page's "N to grade" (class-progress-view.md DR-8):
  // go back there. Only an in-app progress path is honoured.
  const [search] = useSearchParams();
  const backToProgress = safeProgressPath(search.get('from'));
  const [rows, setRows] = useState<GradingQueueRow[] | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [assistStatus, setAssistStatus] = useState<AssistStatus>({ provider: 'off' });
  const [rubrics, setRubrics] = useState<Map<string, RubricCriterionSpec[]>>(new Map());
  // D65: the DoL's primary blocks (`${version}:${block}`) and who holds the
  // pass. Background, like the assist layer, and degrading to "no tick".
  const [dolPrimaries, setDolPrimaries] = useState<ReadonlySet<string>>(new Set());
  // D77: answers never owed. Empty until read, so a failed read over-counts rather than hides.
  const [dolOptionals, setDolOptionals] = useState<ReadonlySet<string>>(new Set());
  const [dolPasses, setDolPasses] = useState<ReadonlyMap<string, DolPassRow>>(new Map());
  // Section titles and question words, from each version's document. Empty
  // until read: a heading is then left out rather than showing an id.
  const [labels, setLabels] = useState<QueueLabels>(emptyQueueLabels);
  const [error, setError] = useState<string | null>(null);
  // A failed re-read AFTER a save keeps the queue on screen (the save itself
  // succeeded — its own errors show in the panel); only the first load blanks.
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnly, setNeedsOnly] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // The progress pages' Hide names, same device-remembered key. Read here
  // rather than through progress/common's hook, which would load that whole
  // shared chunk into this page for two lines.
  const [hideNames, setHideNamesState] = useState(() => readFlag(HIDE_NAMES_KEY));
  const setHideNames = (on: boolean) => {
    setHideNamesState(on);
    writeFlag(HIDE_NAMES_KEY, on);
  };
  // D8: switching rows with unsaved entries asks first. `dirty` is the open
  // panel's report; `pending` is the row waiting on the answer.
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  // Set when Next opened the panel, so focus lands in it rather than on <body>.
  const [focusPanel, setFocusPanel] = useState(false);
  // Narrowing the list: one student (an id, or OUTSIDE for every student the
  // teacher shares no class with), and "Only my classes".
  const [student, setStudent] = useState<string>('');
  const [mineOnly, setMineOnly] = useState(false);
  const choose = (k: string, viaNext = false) => {
    if (k === selected) return;
    if (dirty) {
      setPending(k);
      setFocusPanel(viaNext);
      return;
    }
    setFocusPanel(viaNext);
    setSelected(k);
  };

  // Each assist hydration carries a generation, so a slow one from an earlier
  // save never overwrites the result of a later one.
  const assistGen = useRef(0);

  // The queue renders the moment it arrives; the assist layer hydrates AFTER
  // it, in the background, and DEGRADES to nothing on failure. Both halves of
  // that are the same posture: drafts are advisory — a draft layer that could
  // delay or take down grading would invert "advisory, never authoritative".
  // Rows without assist data are plain manual rows (DR-6), so late flags only
  // ever add information. (Efficiency audit #8: a save no longer waits on it.)
  const hydrateAssist = useCallback(
    async (queue: GradingQueueRow[]) => {
      const gen = ++assistGen.current;
      try {
        const [sugg, status, specs] = await Promise.all([
          fetchSuggestions(id),
          fetchAssistStatus(),
          // Versions are immutable: each is downloaded once per page session.
          fetchVersionRubrics([...new Set(queue.map((r) => r.activity_version_id))]),
        ]);
        if (gen !== assistGen.current) return;
        setSuggestions(sugg);
        setAssistStatus(status);
        setRubrics(specs);
      } catch {
        if (gen !== assistGen.current) return;
        setSuggestions([]);
        setAssistStatus({ provider: 'off' });
      }
    },
    [id],
  );

  // `refresh` re-reads in place after a save, confirm, reject or release: the
  // queue and the open panel stay mounted (no "Loading…" swap), which is also
  // what lets the panel's DR-11 outcome message stay on screen (audit #8).
  const load = useCallback(
    async (opts: { refresh?: boolean } = {}) => {
      if (!opts.refresh) setLoading(true);
      let queue: GradingQueueRow[];
      try {
        queue = await fetchGradingQueue(id);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (opts.refresh) {
          setRefreshError(message);
          return;
        }
        setError(message);
        setRows(null);
        setLoading(false);
        return;
      }
      setRows(queue);
      setError(null);
      setRefreshError(null);
      setLoading(false);
      void hydrateAssist(queue);
      // Warm the panel's chunk while the teacher reads the list.
      if (queue.length > 0) void loadGradePanel().catch(() => undefined);
      void (async () => {
        try {
          const versions = [...new Set(queue.map((r) => r.activity_version_id))];
          void fetchDolOptionals(versions).then(setDolOptionals, () => setDolOptionals(new Set()));
          void fetchQueueLabels(versions).then(setLabels, () => setLabels(emptyQueueLabels()));
          const [primaries, passes] = await Promise.all([
            fetchDolPrimaries(versions),
            fetchDolPassStatus(id),
          ]);
          setDolPrimaries(primaries);
          setDolPasses(new Map(passes.map((p) => [p.student_id, p])));
        } catch {
          setDolPrimaries(new Set());
        }
      })();
    },
    [id, hydrateAssist],
  );
  const refresh = useCallback(() => load({ refresh: true }), [load]);

  useEffect(() => {
    void load();
  }, [load]);

  const suggestionByKey = useMemo(() => {
    const map = new Map<string, SuggestionRow>();
    for (const s of suggestions) map.set(`${s.check_id}:${s.block_id}`, s);
    return map;
  }, [suggestions]);

  const owed = useCallback(
    (row: GradingQueueRow) =>
      needsGrading(row) && !dolOptionals.has(`${row.activity_version_id}:${row.block_id}`),
    [dolOptionals],
  );
  const shownFor = useCallback(
    (row: GradingQueueRow) =>
      (!mineOnly || row.in_your_class) &&
      (student === '' || (student === OUTSIDE ? row.student_label === null : row.student_id === student)),
    [mineOnly, student],
  );
  const visible = useMemo(
    () => (rows ?? []).filter((row) => shownFor(row) && (needsOnly ? owed(row) : true)),
    [rows, needsOnly, owed, shownFor],
  );

  /** Section → question → rows (D4 by-question grouping); see groupRows. */
  const groups = useMemo(() => groupRows(visible), [visible]);

  const current = useMemo(
    () => (rows ?? []).find((row) => rowKey(row) === selected) ?? null,
    [rows, selected],
  );

  const alias = useMemo(
    () =>
      pseudonyms(
        (rows ?? []).flatMap((r) => (r.student_label === null ? [] : [{ student_id: r.student_id, name: r.student_label }])),
      ),
    [rows],
  );
  const nameOf: NameOf = useCallback(
    (row) =>
      row.student_label === null
        ? COPY.notInYourClass
        : hideNames
          ? (alias.get(row.student_id) ?? 'Student')
          : row.student_label,
    [hideNames, alias],
  );
  // Next never opens a row the student filters hide.
  const nextKey = useMemo(
    () => nextOwedKey(rows ?? [], selected, (row) => owed(row) && shownFor(row)),
    [rows, selected, owed, shownFor],
  );
  // The student picker: named students by the name this page shows (Hide
  // names applied), then one entry for everyone outside the teacher's classes.
  const studentOptions = useMemo(() => {
    const named = new Map<string, string>();
    let outside = false;
    for (const row of rows ?? []) {
      if (row.student_label === null) outside = true;
      else named.set(row.student_id, nameOf(row));
    }
    const list = [...named].map(([value, label]) => ({ value, label }));
    list.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    if (outside) list.push({ value: OUTSIDE, label: COPY.notInYourClass });
    return list;
  }, [rows, nameOf]);
  const someOutside = (rows ?? []).some((row) => !row.in_your_class);
  // J / K: the next / previous response in the list as shown, when the
  // teacher is not typing and no dialog is up. Through choose(), so unsaved
  // entries still ask. Positions are read over the WHOLE queue, so a row that
  // just left the filtered list (saved with Needs grading on) still has one.
  const fullOrder = useMemo(() => [...groupRows(rows ?? []).values()].flatMap((q) => [...q.values()].flat()), [rows]);
  const chooseRef = useRef(choose);
  chooseRef.current = choose;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((key !== 'j' && key !== 'k') || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const shown = new Set(visible.map(rowKey));
      const at = fullOrder.findIndex((r) => rowKey(r) === selected);
      const pick =
        key === 'j'
          ? fullOrder.slice(at + 1).find((r) => shown.has(rowKey(r)))
          : at < 0
            ? [...fullOrder].reverse().find((r) => shown.has(rowKey(r)))
            : fullOrder.slice(0, at).reverse().find((r) => shown.has(rowKey(r)));
      if (!pick) return;
      e.preventDefault();
      const wasDirty = dirtyRef.current;
      chooseRef.current(rowKey(pick));
      // Keep the keyboard on the list. Not while the discard question is
      // coming: Keep editing must return to where the teacher was.
      if (!wasDirty) {
        [...document.querySelectorAll<HTMLElement>('[data-row-key]')]
          .find((el) => el.getAttribute('data-row-key') === rowKey(pick))
          ?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullOrder, visible, selected]);
  // A filter that hides the open response closes it, unless it holds unsaved
  // entries (then it stays open until saved or left: never lose typed work).
  useEffect(() => {
    if (!selected || dirty) return;
    const open = (rows ?? []).find((r) => rowKey(r) === selected);
    if (open && !shownFor(open)) setSelected(null);
    // Only a FILTER change should close it, not a save or a refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownFor]);
  // A picked student who has left the queue (a refresh) is not a filter the
  // picker can show any more: back to everyone.
  useEffect(() => {
    if (student !== '' && rows && !studentOptions.some((o) => o.value === student)) setStudent('');
  }, [rows, student, studentOptions]);

  const outstanding = (rows ?? []).filter(owed).length;
  // With a student filter on, the header counts what the teacher can see,
  // and names the whole queue beside it.
  const filtering = student !== '' || mineOnly;
  const outstandingShown = filtering ? (rows ?? []).filter((r) => owed(r) && shownFor(r)).length : outstanding;
  // Every optional explanation the filter hides, a REVISED one (graded, then
  // changed) included — it used to vanish with no note (playtest sweep 2026-11-12).
  const optionalUnmarked = (rows ?? []).filter(
    (row) => needsGrading(row) && dolOptionals.has(`${row.activity_version_id}:${row.block_id}`),
  ).length;
  // Only students whose identity this teacher may see can be named in a
  // release action, so the bulk affordance counts exactly those.
  const unreleasedByStudent = useMemo(() => {
    const map = new Map<string, { count: number; label: string }>();
    for (const row of rows ?? []) {
      if (!row.graded || row.released_at) continue;
      const entry = map.get(row.student_id) ?? { count: 0, label: nameOf(row) };
      map.set(row.student_id, { count: entry.count + 1, label: entry.label });
    }
    return map;
  }, [rows, nameOf]);

  // G-4: asks first; a failure part-way keeps the queue on screen and names
  // who didn't get theirs, with a retry for just them.
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [releaseFailed, setReleaseFailed] = useState<{ ok: number; total: number; ids: string[] } | null>(null);

  async function releaseAll(ids: readonly string[]) {
    setBusy(true);
    try {
      const { released, failed } = await releaseEach(ids, (studentId) => releaseGrades(id, studentId));
      setReleaseFailed(failed.length > 0 ? { ok: released, total: ids.length, ids: failed } : null);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  // Only students still unreleased: one released since from their own row
  // drops out of the note, and the note goes when none are left.
  const stillFailed = (releaseFailed?.ids ?? []).filter((s) => unreleasedByStudent.has(s));

  const totalUnreleased = [...unreleasedByStudent.values()].reduce(
    (sum, entry) => sum + entry.count,
    0,
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* C-7: one header across the activity's results pages. */}
      <ActivityResultsHeader
        activityId={id ?? ''}
        current="responses"
        // Fable review: only a CLASS grid gets its own back link; from the
        // activity's Progress page, the Progress tab already goes there.
        back={backToProgress?.startsWith('/classes/') ? { to: backToProgress, label: 'Class progress' } : null}
      />
      <h1 className="mb-6 text-xl font-semibold text-ink">{COPY.title}</h1>

      {loading && <p className="text-sm text-muted">Loading…</p>}

      {error && (
        <div role="alert" className="rounded-lg border border-line bg-surface-2 p-4 text-sm text-danger">
          {COPY.loadFailed}: {error}
        </div>
      )}

      {refreshError && rows && !error && (
        <div role="alert" className="mb-4 rounded-lg border border-line bg-surface-2 p-3 text-sm text-danger">
          {COPY.refreshFailed}: {refreshError}
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
                {outstandingShown} need grading
                {filtering && outstandingShown !== outstanding && (
                  <span className="font-normal text-muted"> · {outstanding} in all</span>
                )}
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
            <label className="flex items-center gap-1.5 text-sm text-muted">
              <input
                type="checkbox"
                checked={hideNames}
                onChange={(e) => setHideNames(e.target.checked)}
              />
              Hide names
            </label>
            {studentOptions.length > 1 && (
              <select
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                aria-label="Student"
                className="min-h-9 rounded-md border border-line-strong bg-canvas px-2 text-sm text-ink"
              >
                <option value="">All students</option>
                {studentOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
            {someOutside && (
              <label className="flex items-center gap-1.5 text-sm text-muted">
                <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
                Only my classes
              </label>
            )}
            <span className="text-xs text-muted [@media(pointer:coarse)]:hidden">J / K: next / previous response</span>
            {optionalUnmarked > 0 && (
              <p className="text-sm text-muted" data-optional-unmarked={optionalUnmarked}>
                {optionalUnmarked === 1 ? '1 optional explanation' : `${optionalUnmarked} optional explanations`}: marking
                is up to you. Turn off the filter to read them.
              </p>
            )}
            {totalUnreleased > 0 && (
              <button
                type="button"
                onClick={() => setConfirmRelease(true)}
                disabled={busy}
                className="min-h-[44px] rounded-md bg-ink px-3 text-sm font-semibold text-canvas disabled:opacity-45"
              >
                Release all graded ({unreleasedByStudent.size} student
                {unreleasedByStudent.size === 1 ? '' : 's'})
              </button>
            )}
            {confirmRelease && (
              <ConfirmDialog
                title={RELEASE_ALL_COPY.title(unreleasedByStudent.size)}
                confirmLabel={RELEASE_ALL_COPY.confirm}
                onCancel={() => setConfirmRelease(false)}
                onConfirm={async () => {
                  setConfirmRelease(false);
                  await releaseAll([...unreleasedByStudent.keys()]);
                }}
              >
                <p>{RELEASE_ALL_COPY.body}</p>
              </ConfirmDialog>
            )}
            {stillFailed.length > 0 && releaseFailed && (
              <p role="alert" data-release-failed className="w-full text-sm text-danger">
                {RELEASE_ALL_COPY.partial(
                  releaseFailed.ok,
                  releaseFailed.total,
                  stillFailed.map((s) => unreleasedByStudent.get(s)?.label ?? '').join(', '),
                )}{' '}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void releaseAll(stillFailed)}
                  className="font-medium underline underline-offset-2"
                >
                  {RELEASE_ALL_COPY.retry}
                </button>
              </p>
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
          ) : visible.length === 0 && (student !== '' || mineOnly) ? (
            // The student filters hid everything: say that, not "all caught
            // up", which would speak for responses the teacher cannot see.
            <EmptyState
              title="Nothing here for this selection"
              body={
                (needsOnly ? 'Nothing left to grade for the students you picked.' : 'No responses from the students you picked.') +
                // Never swallow the release reminder "All caught up" carries.
                (totalUnreleased > 0 ? ` ${unreleasedBadge(totalUnreleased)}.` : '')
              }
              action={
                <button
                  type="button"
                  onClick={() => {
                    setStudent('');
                    setMineOnly(false);
                  }}
                  className="min-h-[44px] text-sm font-semibold text-strong underline underline-offset-2"
                >
                  Show everyone
                </button>
              }
            />
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
                {[...groups.entries()].map(([sectionId, questions]) => {
                  // Every row in a group shares the section, so any row's
                  // version names it (ids never cross versions).
                  const first = [...questions.values()][0]?.[0];
                  const sectionTitle = first
                    ? labels.sections.get(`${first.activity_version_id}:${sectionId}`)
                    : undefined;
                  return (
                    <div key={sectionId} className="mb-4">
                      {sectionTitle ? (
                        <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">
                          {sectionTitle}
                        </h2>
                      ) : null}
                      {[...questions.entries()].map(([blockId, blockRows]) => {
                        const question = blockRows[0]
                          ? labels.questions.get(`${blockRows[0].activity_version_id}:${blockId}`)
                          : undefined;
                        return (
                          <div
                            key={blockId}
                            className="mb-2 overflow-hidden rounded-lg border border-line bg-canvas"
                          >
                            {question ? (
                              <p
                                className="truncate border-b border-line px-3 py-1.5 text-xs font-medium text-ink"
                                title={question}
                                data-question-label
                              >
                                {question}
                              </p>
                            ) : null}
                            {blockRows.map((row) => (
                              <button
                                key={rowKey(row)}
                                type="button"
                                onClick={() => choose(rowKey(row))}
                                data-row-key={rowKey(row)}
                                aria-current={rowKey(row) === selected ? true : undefined}
                                className={`flex min-h-[44px] w-full items-center gap-2 border-b border-line px-3 py-2 text-left last:border-b-0 ${
                                  rowKey(row) === selected ? 'bg-surface-2' : ''
                                }`}
                              >
                                <span className="text-sm font-semibold text-ink">
                                  {nameOf(row)}
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
                                    suggestionByKey.get(rowKey(row)),
                                    row.graded,
                                  )}
                                />
                                <Chip status={statusOf(row)} />
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="md:flex-1">
                {current ? (
                  <Suspense fallback={<p className="rounded-lg border border-line bg-canvas p-6 text-sm text-muted">Loading…</p>}>
                  <GradePanel
                    key={rowKey(current)}
                    row={current}
                    activityId={id}
                    suggestion={suggestionByKey.get(rowKey(current))}
                    rubric={
                      rubrics.get(`${current.activity_version_id}:${current.block_id}`) ?? null
                    }
                    question={labels.questions.get(`${current.activity_version_id}:${current.block_id}`) ?? null}
                    dol={
                      dolPrimaries.has(`${current.activity_version_id}:${current.block_id}`)
                        ? { pass: dolPasses.get(current.student_id) ?? null }
                        : null
                    }
                    name={nameOf(current)}
                    onSaved={refresh}
                    onDirtyChange={setDirty}
                    onNext={nextKey ? () => choose(nextKey, true) : null}
                    autoFocus={focusPanel}
                    assist={ASSIST_API}
                  />
                  </Suspense>
                ) : (
                  <p className="rounded-lg border border-line bg-canvas p-6 text-sm text-muted">
                    Pick a response to grade.
                  </p>
                )}
              </div>
            </div>
          )}
          {pending && (
            <ConfirmDialog
              title={NEXT_COPY.discardTitle}
              confirmLabel={NEXT_COPY.discardConfirm}
              cancelLabel={NEXT_COPY.keepCancel}
              danger
              onCancel={() => setPending(null)}
              onConfirm={() => {
                setDirty(false);
                setSelected(pending);
                setPending(null);
              }}
            >
              <p>{NEXT_COPY.discardBody}</p>
            </ConfirmDialog>
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
