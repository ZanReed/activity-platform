// =============================================================================
// GradePanel.tsx — one response's grading panel (routes/ActivityResponses)
// -----------------------------------------------------------------------------
// Split out of the Responses page (2026-11-15) so the page's journey budget
// pays for the panel only when a teacher opens a response; the page warms this
// chunk as soon as its queue arrives. Rulings: see the page's header comment.
// =============================================================================

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NEXT_COPY,
  RESPONSES_COPY as COPY,
  releaseGrades,
  releaseLabel,
  saveCheckGrade,
  type CriterionEntry,
  type GradingQueueRow,
} from '../lib/grading';
import { DOL_PASS_COPY, baseLevelMet, baseLevelOf, setDolPass, type DolPassRow } from '../lib/dolPass';
// TYPES only from lib/gradingAssist: the page hands this panel the values it
// needs (`assist`). A value import here would make that module one only the
// page and this chunk share, which the bundler folds into the page's chunk,
// renaming it out of the build manifest the journey budget reads.
import type * as GradingAssist from '../lib/gradingAssist';
import type { RejectReason, RubricCriterionSpec, SuggestionRow } from '../lib/gradingAssist';


/** What this panel uses from lib/gradingAssist, passed in by the page. */
export type AssistApi = Pick<
  typeof GradingAssist,
  'ASSIST_COPY' | 'confirmSuggestion' | 'deriveAssistDisplay' | 'rejectSuggestion'
>;

/** The draft mark (DR-1): italic + a visible "AI draft" tag beside the field
 *  it describes, cleared the moment the teacher touches that field. A style
 *  alone would not survive grayscale or a screen reader; the tag is text. */
function DraftMark({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted" data-draft-mark>
      {label}
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
/** What Save would send, as a comparable string (D8's dirty check). An
 *  emptied criterion feedback box already stores undefined (its onChange),
 *  so it compares equal to one never typed in. */
function gradeSnapshot(
  entries: readonly CriterionEntry[],
  general: string,
  tickTouched: boolean | null,
  struck: ReadonlySet<string>,
): string {
  return JSON.stringify([
    [...entries]
      .sort((a, b) => a.criterionId.localeCompare(b.criterionId)),
    general,
    tickTouched,
    [...struck].sort(),
  ]);
}

export default function GradePanel({
  row,
  activityId,
  photoSlot,
  suggestion,
  rubric,
  question,
  dol,
  name,
  onSaved,
  onDirtyChange,
  onNext,
  autoFocus,
  assist,
}: {
  row: GradingQueueRow;
  activityId: string;
  /** A photo of working's photos, drawn by the route (slice 3). A SLOT, not an
   *  import: if this panel imported the photo modules the route also imports,
   *  Rollup would fold the route into a shared chunk (the perf budget's
   *  "responses" journey caught it). Absent = the student sent no photo. */
  photoSlot?: ReactNode;
  suggestion: SuggestionRow | undefined;
  rubric: RubricCriterionSpec[] | null;
  /** "Q13 · Explain to Tama why…", or null while the document is unread. */
  question: string | null;
  /** D65: this row is the DoL's primary item; the student's current pass. */
  dol: { pass: DolPassRow | null } | null;
  /** The student as this page names them (Hide names applied). */
  name: string;
  onSaved: () => Promise<void>;
  /** Reports whether the panel holds entries Save has not sent. */
  onDirtyChange: (dirty: boolean) => void;
  /** Opens the next response still to grade; null when none is left. */
  onNext: (() => void) | null;
  /** Move focus into the panel when it opens (it was opened by Next). */
  autoFocus: boolean;
  assist: AssistApi;
}) {
  const { ASSIST_COPY, confirmSuggestion, deriveAssistDisplay, rejectSuggestion } = assist;
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
  // D65 DL-11: the "DoL passed" tick. Untouched (null) it FOLLOWS the
  // prefill — every base-level line at full marks — so the common case is the
  // one Save; a teacher's touch takes over. An auto pass is fixed.
  const [tickTouched, setTickTouched] = useState<boolean | null>(null);
  const storedPass = dol?.pass ?? null;
  const prefillTick = storedPass === null && baseLevelMet(spec, entries);
  const ticked = tickTouched ?? (storedPass !== null || prefillTick);

  // D8: what Save would send, against what was last loaded or saved. An
  // untouched pre-fill is not dirty (DR-3): the baseline IS the pre-fill.
  const snapshot = gradeSnapshot(entries, general, tickTouched, struck);
  const [baseline, setBaseline] = useState(snapshot);
  const dirty = snapshot !== baseline;
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  // A panel that goes away (its row left the queue on a refresh) holds
  // nothing any more, so it must not leave the page believing it does.
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  // Closing or reloading the tab with an unsaved grade asks the browser's
  // own question. (In-app links are not guarded: BrowserRouter has no
  // blocker. See the header comment.)
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!autoFocus) return;
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>('input:not([disabled]), textarea') ?? panel)?.focus();
    // Mount only: focus is placed once, when Next opens the panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const sent = snapshot;
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
      // The pass rides the same Save (DL-11): set it when ticked and absent,
      // clear it when unticked and the pass is a TEACHER's (an auto one stands).
      if (dol && storedPass?.source !== 'auto') {
        if (ticked && storedPass === null) await setDolPass(row.check_id, true);
        else if (!ticked && storedPass?.source === 'teacher') await setDolPass(row.check_id, false);
      }
      setBaseline(sent);
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
      // The cleared panel is the new saved state: rejecting is not an edit.
      setBaseline(gradeSnapshot([], '', tickTouched, new Set()));
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
    <div ref={panelRef} tabIndex={-1} data-grade-panel className="rounded-lg border border-line bg-canvas p-4 focus:outline-none">
      {question ? <p className="mb-1 text-sm font-medium text-ink">{question}</p> : null}
      <p className="text-xs text-muted">
        {name} · attempt {row.attempt_number}
      </p>

      {/* DR-1: the response comes FIRST — a teacher who reads the draft
          before the work is a teacher whose edit-rate stops meaning much. */}
      <div className="mt-2 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink">
        {row.block_type === 'photo_response' ? (
          (photoSlot ?? <em className="text-muted">{COPY.noAnswer}</em>)
        ) : (
          row.response_text ?? <em className="text-muted">{COPY.noAnswer}</em>
        )}
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
                  {drafted.has(`pts:${criterion.id}`) && <DraftMark label={ASSIST_COPY.aiDraft} />}
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
                    {drafted.has(`fb:${criterion.id}`) && <DraftMark label={ASSIST_COPY.aiDraft} />}
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
        {drafted.has('general') && <DraftMark label={ASSIST_COPY.aiDraft} />}
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

      {dol && (
        <div className="mt-3 rounded-md border border-line px-3 py-2" data-dol-pass>
          <label className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-strong">
            <input
              type="checkbox"
              checked={ticked}
              disabled={storedPass?.source === 'auto'}
              onChange={(e) => setTickTouched(e.target.checked)}
            />
            {DOL_PASS_COPY.label}
          </label>
          <p className="text-xs text-muted">
            {storedPass?.source === 'auto'
              ? DOL_PASS_COPY.auto
              : tickTouched === null && prefillTick
                ? DOL_PASS_COPY.prefill(baseLevelOf(spec) ?? '')
                : DOL_PASS_COPY.hint}
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="min-h-[44px] rounded-md bg-ink px-4 text-sm font-semibold text-canvas disabled:opacity-45"
        >
          {saving ? COPY.saving : COPY.save}
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={saving}
            className="min-h-[44px] rounded-md border border-line-strong px-4 text-sm font-semibold text-strong disabled:opacity-45"
          >
            {NEXT_COPY.next}
          </button>
        )}
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
            {releaseLabel(1, name)}
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
