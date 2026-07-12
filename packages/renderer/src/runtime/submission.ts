// =============================================================================
// runtime/submission.ts — Response gathering + submission
// -----------------------------------------------------------------------------
// Payload (Session 4 + Stage 14):
//   - blanks[].confidence — derived from state.blocks[ref.blockId].confidence
//     at submit time. Every blank in a block gets the same per-block value.
//   - responses.checkpointResults — built from per-section state. Included
//     only when at least one section qualifies (checked, checkedAt set,
//     total > 0). Schema requires total positive, so zero-blank sections are
//     filtered out defensively.
//
// Stage 14 additions:
//   - Network retry: sendWithRetry POSTs with exponential backoff (1s/4s/16s)
//     on transient failures (network error / HTTP 5xx). 4xx is terminal (the
//     payload is bad — retrying won't help). The payload is persisted to
//     localStorage before the POST so a tab close mid-flight survives; the
//     bootstrap flush resends it next load.
//   - Attempt reconciliation: the ingest response's canonical attempt_number
//     is read back into state.attemptNumber and surfaced ("Attempt N") when > 1.
//   - Resubmit: in free revisionMode (and non-single submissionMode) a
//     successful submit keeps state + persistence and relabels the button
//     "Resubmit" instead of freezing the form. locked/single modes freeze and
//     clear persisted state as before.
// =============================================================================

import { $ } from './dom.js';
import { scoreBlanksInScope, trimValue } from './blanks.js';
import { scoreMcBlocks } from './mcs.js';
import { scoreMatchBlocks } from './matches.js';
import { scoreOrderingBlocks } from './orderings.js';
import { gatherFreeResponses, type FreeResult } from './free-text.js';
import { graphExt, numberLineExt, dataPlotExt } from './graph-integration.js';
import type { RuntimeConfig } from './config.js';
import type { Refs } from './refs.js';
import type { RuntimeState } from './state.js';
import {
  clearActivityState,
  saveName,
  savePendingSubmission,
  loadPendingSubmission,
  clearPendingSubmission,
} from './storage.js';

interface BlankResult {
  answer: string;
  correct: boolean;
  confidence?: 'unsure' | 'think_so' | 'certain';
}

// Mirrors schema GraphResponse — the wire contract with ingest-submission.
// `type` is the block's interaction discriminant (plot_point, plot_function, …);
// the schema Zod-validates it on ingest, so the runtime carries it as a string.
// Exported for graph-integration.ts, which builds the map; the payload shape
// (SubmissionResponsesPayload) is assembled here.
export interface GraphResult {
  type: string;
  studentPoints: [number, number][];
  correct: boolean;
  confidence?: 'unsure' | 'think_so' | 'certain';
  /** graph_inequality (v4): the student's boundary-style + shaded-side choices. */
  strict?: boolean;
  side?: 'above' | 'below' | 'left' | 'right';
  /** v4: the student chose "cannot be graphed / no solution". */
  noSolution?: boolean;
  /** v4: per-part partial credit (partialCredit blocks only). */
  earned?: number;
  total?: number;
  /** v4: domain-restricted plot_function endpoint answer. */
  domain?: {
    minX?: number;
    minStyle?: 'open' | 'closed';
    maxX?: number;
    maxStyle?: 'open' | 'closed';
  };
  /** plot_ray / plot_segment: the student's chosen shape. */
  shape?: 'ray_positive' | 'ray_negative' | 'segment';
  /** plot_ray: the drawn endpoint's style. */
  fromStyle?: 'open' | 'closed';
  /** plot_segment: per-endpoint styles, canonical order. */
  endpoints?: ['open' | 'closed', 'open' | 'closed'];
}

// Mirrors schema ChoiceResponse — one multiple_choice block's answer.
export interface McResult {
  selected: string[];
  correct: boolean;
  confidence?: 'unsure' | 'think_so' | 'certain';
}

// Mirrors schema MatchResponse — one matching block's answer (per-pair
// earned/total; the pairing map is item id → docked target id).
export interface MatchResult {
  pairs: Record<string, string>;
  correct: boolean;
  earned: number;
  total: number;
  confidence?: 'unsure' | 'think_so' | 'certain';
}

// Mirrors schema OrderResponse — one ordering block's full arrangement.
export interface OrderResult {
  order: string[];
  correct: boolean;
  confidence?: 'unsure' | 'think_so' | 'certain';
}

// Mirrors schema NumberLineResponse — one number_line block's answer (1-D).
// Discriminated on `type` (validated by the schema on ingest): a plot_point
// carries studentPoints, a plot_interval its bounds + styles (never both). The
// bridge builds the correct variant; the runtime carries `type` as a string.
export interface NumberLineResult {
  type: string;
  /** plot_point: the student's plotted positions in line units. */
  studentPoints?: number[];
  /** plot_interval: interval/ray bounds + open/closed styles (absent = unbounded). */
  min?: number;
  minStyle?: 'open' | 'closed';
  max?: number;
  maxStyle?: 'open' | 'closed';
  correct: boolean;
  confidence?: 'unsure' | 'think_so' | 'certain';
}

// Mirrors schema DataPlotResponse — one graded data_plot block's answer.
// Discriminated on `type` (validated by the schema on ingest): build_dotplot
// carries the plotted dot values. The bridge builds it; the runtime carries
// `type` as a string.
export interface DataPlotResult {
  type: string;
  /** build_dotplot: the student's plotted dot values (a multiset). */
  studentValues?: number[];
  /** build_histogram: the student's per-bin frequencies, in bin order. */
  studentBins?: number[];
  /** build_boxplot: the student's placed five-number summary (line units). */
  studentFive?: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
  correct: boolean;
  confidence?: 'unsure' | 'think_so' | 'certain';
}

interface CheckpointResultPayload {
  score: number;
  total: number;
  checkedAt: string;
}

interface SubmissionResponsesPayload {
  schemaVersion: 9;
  blanks: Record<string, BlankResult>;
  checkpointResults?: Record<string, CheckpointResultPayload>;
  graphResponses?: Record<string, GraphResult>;
  choices?: Record<string, McResult>;
  matches?: Record<string, MatchResult>;
  orderings?: Record<string, OrderResult>;
  numberLineResponses?: Record<string, NumberLineResult>;
  dataPlotResponses?: Record<string, DataPlotResult>;
  /** Ungraded free text per self_explanation block. Never in the score. */
  freeResponses?: Record<string, FreeResult>;
}

// Wire shape POSTed to the ingest-submission Edge Function. Keys are
// snake_case to match the function's contract (and the DB columns / RPC
// params it forwards to) — the runtime and the function are separate
// codebases joined only by this JSON, so the field names ARE the contract.
// A camelCase drift here is silently accepted by JSON.stringify and only
// surfaces as a 400 ("activity_id is required") on a live POST, which no
// unit test exercised — see buildSubmissionPayload's regression test.
export interface SubmissionPayload {
  activity_id: string;
  display_name: string;
  responses: SubmissionResponsesPayload;
  score: number;
}

/**
 * Assemble the submission wire payload. Pure (no DOM, no network) so the
 * snake_case contract with ingest-submission can be unit-tested directly.
 */
export function buildSubmissionPayload(
  config: RuntimeConfig,
  displayName: string,
  gathered: {
    blanks: Record<string, BlankResult>;
    graphResponses?: Record<string, GraphResult>;
    choices?: Record<string, McResult>;
    matches?: Record<string, MatchResult>;
    orderings?: Record<string, OrderResult>;
    numberLineResponses?: Record<string, NumberLineResult>;
    dataPlotResponses?: Record<string, DataPlotResult>;
    freeResponses?: Record<string, FreeResult>;
    score: number;
  },
  checkpointResults: Record<string, CheckpointResultPayload> | undefined,
): SubmissionPayload {
  const responses: SubmissionResponsesPayload = {
    schemaVersion: 9,
    blanks: gathered.blanks,
  };
  if (checkpointResults) {
    responses.checkpointResults = checkpointResults;
  }
  if (gathered.graphResponses) {
    responses.graphResponses = gathered.graphResponses;
  }
  if (gathered.choices) {
    responses.choices = gathered.choices;
  }
  if (gathered.matches) {
    responses.matches = gathered.matches;
  }
  if (gathered.orderings) {
    responses.orderings = gathered.orderings;
  }
  if (gathered.numberLineResponses) {
    responses.numberLineResponses = gathered.numberLineResponses;
  }
  if (gathered.dataPlotResponses) {
    responses.dataPlotResponses = gathered.dataPlotResponses;
  }
  if (gathered.freeResponses) {
    responses.freeResponses = gathered.freeResponses;
  }
  return {
    activity_id: config.activityId,
    display_name: displayName,
    responses,
    score: gathered.score,
  };
}

interface GatheredResponses {
  blanks: Record<string, BlankResult>;
  graphResponses?: Record<string, GraphResult>;
  choices?: Record<string, McResult>;
  matches?: Record<string, MatchResult>;
  orderings?: Record<string, OrderResult>;
  numberLineResponses?: Record<string, NumberLineResult>;
  dataPlotResponses?: Record<string, DataPlotResult>;
  freeResponses?: Record<string, FreeResult>;
  score: number;
  totalScored: number;
}

/**
 * Pure score arithmetic, split from gatherResponses so it's testable
 * without a DOM. A fraction in [0, 1]; zero scored blanks scores 0 (not NaN).
 */
export function computeScore(totalCorrect: number, totalScored: number): number {
  return totalScored > 0 ? totalCorrect / totalScored : 0;
}

/**
 * Iterate refs.blanks, score each blank into state, assemble the payload.
 * Per-blank confidence comes from state.blocks[ref.blockId].confidence
 * (one value per block, applied uniformly to every blank in that block).
 * Omitted from the payload when the block has no selected confidence —
 * the schema field is optional.
 */
export function gatherResponses(
  state: RuntimeState,
  refs: Refs,
): GatheredResponses {
  const blanks: Record<string, BlankResult> = {};
  let totalCorrect = 0;
  let totalScored = 0;

  // Score all blanks first (group-aware), then read each verdict from state —
  // so grouped blanks submit the same consume-once result the section check
  // showed, rather than an independent rescore that would fail (3,2)≡(2,3).
  scoreBlanksInScope(state, refs, refs.blanks.keys());
  for (const [blankId, ref] of refs.blanks) {
    const correct = state.blanks[blankId]?.result ?? null;
    if (correct !== null) totalScored += 1;
    if (correct === true) totalCorrect += 1;
    const result: BlankResult = {
      answer: trimValue(ref.input.value),
      correct: correct === true,
    };
    const blockState = state.blocks[ref.blockId];
    if (blockState?.confidence) {
      result.confidence = blockState.confidence;
    }
    blanks[blankId] = result;
  }

  // Multiple-choice blocks — one scorable unit each. Unanswered blocks are
  // omissions: counted in neither total nor correct, absent from the map
  // (ChoiceResponse.selected is schema-required non-empty).
  scoreMcBlocks(state, refs, refs.mcs.keys());
  let choices: Record<string, McResult> | undefined;
  for (const [blockId] of refs.mcs) {
    const mcState = state.mcs[blockId];
    if (!mcState || mcState.selected.length === 0) continue;
    totalScored += 1;
    if (mcState.result === true) totalCorrect += 1;
    const result: McResult = {
      selected: mcState.selected,
      correct: mcState.result === true,
    };
    if (mcState.confidence) result.confidence = mcState.confidence;
    (choices ??= {})[blockId] = result;
  }

  // Matching blocks — scored per pair: an answered block contributes its item
  // count to the total and its earned pairs to correct. Unanswered blocks are
  // omissions (absent from the map, out of the score).
  scoreMatchBlocks(state, refs, refs.matches.keys());
  let matches: Record<string, MatchResult> | undefined;
  for (const [blockId] of refs.matches) {
    const matchState = state.matches[blockId];
    if (!matchState || matchState.result === null) continue;
    totalScored += matchState.total;
    totalCorrect += matchState.earned;
    const result: MatchResult = {
      pairs: matchState.pairs,
      correct: matchState.result === true,
      earned: matchState.earned,
      total: matchState.total,
    };
    if (matchState.confidence) result.confidence = matchState.confidence;
    (matches ??= {})[blockId] = result;
  }

  // Ordering blocks — one scorable unit each, all-or-nothing. An untouched
  // list is an omission (absent from the map, out of the score).
  scoreOrderingBlocks(state, refs, refs.orderings.keys());
  let orderings: Record<string, OrderResult> | undefined;
  for (const [blockId] of refs.orderings) {
    const orderState = state.orderings[blockId];
    if (!orderState || orderState.result === null) continue;
    totalScored += 1;
    if (orderState.result === true) totalCorrect += 1;
    const result: OrderResult = {
      order: orderState.order,
      correct: orderState.result === true,
    };
    if (orderState.confidence) result.confidence = orderState.confidence;
    (orderings ??= {})[blockId] = result;
  }

  // Interactive-graph blocks score alongside blanks (each is one scorable unit,
  // client-side-scored by the graph feature as the student moved the point). An
  // unanswered graph is an omission — counted in neither total nor correct, and
  // absent from the graphResponses map. In the base runtime build this yields
  // nothing (no graph blocks exist).
  const graphs = graphExt.gatherGraphResponses(state, refs);
  totalScored += graphs.scored;
  totalCorrect += graphs.correct;

  // Number-line blocks — one scorable unit each, all-or-nothing (same omission
  // rule as graphs). A no-op in the base runtime build (no number-line blocks).
  const numberLines = numberLineExt.gatherNumberLineResponses(state, refs);
  totalScored += numberLines.scored;
  totalCorrect += numberLines.correct;

  // Data-plot blocks — one scorable unit each, all-or-nothing (same omission
  // rule as graphs). A no-op in the base runtime build (no data-plot blocks).
  const dataPlots = dataPlotExt.gatherDataPlotResponses(state, refs);
  totalScored += dataPlots.scored;
  totalCorrect += dataPlots.correct;

  // Free-text blocks (self_explanation / short_answer / essay) — never
  // auto-scored, so they touch neither total nor correct. Just gathered into the
  // payload (undefined when nothing written); short_answer/essay await manual
  // grading in a separate table.
  const freeResponses = gatherFreeResponses(refs);

  return {
    blanks,
    ...(graphs.graphResponses && { graphResponses: graphs.graphResponses }),
    ...(choices && { choices }),
    ...(matches && { matches }),
    ...(orderings && { orderings }),
    ...(numberLines.numberLineResponses && {
      numberLineResponses: numberLines.numberLineResponses,
    }),
    ...(dataPlots.dataPlotResponses && {
      dataPlotResponses: dataPlots.dataPlotResponses,
    }),
    ...(freeResponses && { freeResponses }),
    score: computeScore(totalCorrect, totalScored),
    totalScored,
  };
}

/**
 * Build the checkpointResults map from per-section state. Includes only
 * sections that have been checked at least once AND have at least one
 * blank — the schema requires CheckpointResult.total to be positive
 * (z.number().int().positive()), so a zero-blank section would fail
 * validation server-side.
 *
 * Returns undefined when no sections qualify (kept out of the payload
 * entirely — schema field is optional, absent is fine).
 */
export function gatherCheckpointResults(
  state: RuntimeState,
): Record<string, CheckpointResultPayload> | undefined {
  const results: Record<string, CheckpointResultPayload> = {};
  let count = 0;
  for (const [sectionId, sectionState] of Object.entries(state.sections)) {
    if (
      sectionState.checked &&
      sectionState.checkedAt !== null &&
      sectionState.total > 0
    ) {
      results[sectionId] = {
        score: sectionState.score,
        total: sectionState.total,
        checkedAt: sectionState.checkedAt,
      };
      count += 1;
    }
  }
  return count > 0 ? results : undefined;
}

export function setStatus(msg: string, kind?: string): void {
  const el = $('.submit-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'submit-status' + (kind ? ' ' + kind : '');
}

export function setScore(score: number, total: number): void {
  const el = $('.score-display');
  if (!el || total === 0) return;
  const pct = Math.round(score * 100);
  el.textContent =
  'Score: ' + Math.round(score * total) + ' / ' + total + ' (' + pct + '%)';
}

// ---------------------------------------------------------------------------
// Network send + retry.
// ---------------------------------------------------------------------------

/** Backoff delays (ms) applied between retries of a transient failure. */
const RETRY_DELAYS_MS = [1000, 4000, 16000];

interface SendResult {
  ok: boolean;
  /** Canonical server attempt_number, present on success when returned. */
  attemptNumber?: number;
  /** On failure: true = don't retry (bad payload); false = transient. */
  terminal?: boolean;
  /** On failure: a human-readable message for the status line. */
  message?: string;
}

interface SendHooks {
  /** Called before each backoff wait. nextAttempt is 1-based. */
  onRetry?: (nextAttempt: number, waitMs: number) => void;
  /** Injectable for tests; defaults to setTimeout. */
  delay?: (ms: number) => Promise<void>;
  /** Injectable for tests; defaults to global fetch. */
  fetchFn?: typeof fetch;
}

/**
 * Classify an HTTP failure status. 4xx means the request itself is bad
 * (validation, identity, malformed) — retrying the identical payload won't
 * help, so it's terminal. 5xx (and anything unexpected) is treated as a
 * transient server-side problem worth retrying.
 */
export function classifyFailure(status: number): 'terminal' | 'retryable' {
  return status >= 400 && status < 500 ? 'terminal' : 'retryable';
}

/** One POST attempt. Never throws — classifies every outcome into SendResult. */
async function postOnce(
  endpoint: string,
  payload: unknown,
  fetchFn: typeof fetch,
): Promise<SendResult> {
  let res: Response;
  try {
    res = await fetchFn(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Fetch rejects on network failure (offline, DNS, CORS preflight fail).
    return { ok: false, terminal: false, message: 'Network error' };
  }

  if (res.ok) {
    let attemptNumber: number | undefined;
    try {
      const data = (await res.json()) as { attempt_number?: unknown };
      if (typeof data.attempt_number === 'number') {
        attemptNumber = data.attempt_number;
      }
    } catch {
      // Response wasn't JSON — the submission still succeeded; we just can't
      // reconcile the attempt number. Leave it undefined.
    }
    return { ok: true, attemptNumber };
  }

  let message = 'Submission failed (' + res.status + ')';
  try {
    const text = await res.text();
    if (text) message = text;
  } catch {
    // ignore — keep the status-code message
  }
  return { ok: false, terminal: classifyFailure(res.status) === 'terminal', message };
}

/**
 * POST with exponential backoff. Returns on the first success, the first
 * terminal failure, or after the retry budget is exhausted (the final
 * transient SendResult). Pure with respect to the DOM — the caller maps the
 * result to status text and button state.
 */
export async function sendWithRetry(
  endpoint: string,
  payload: unknown,
  hooks: SendHooks = {},
): Promise<SendResult> {
  const delay =
  hooks.delay ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const fetchFn = hooks.fetchFn ?? fetch;

  let attempt = 0;
  for (;;) {
    const result = await postOnce(endpoint, payload, fetchFn);
    if (result.ok || result.terminal) return result;
    if (attempt >= RETRY_DELAYS_MS.length) return result; // budget exhausted
    const waitMs = RETRY_DELAYS_MS[attempt]!;
    hooks.onRetry?.(attempt + 2, waitMs);
    await delay(waitMs);
    attempt += 1;
  }
}

/**
 * Apply a confirmed-success outcome to state + DOM. Branches on mode:
 *   - free revisionMode (non-single): keep state + persistence, relabel the
 *     button "Resubmit", leave the form editable so the student can revise.
 *   - otherwise: freeze — mark submitted, clear persisted state, disable the
 *     button. "single" submissionMode always freezes (it ignores revisionMode).
 *
 * scoreDisplay is null on the bootstrap-flush path (the stored payload carries
 * a 0..1 score but not the denominator), so the "X / Y" line is shown only for
 * an in-page submit where totalScored is known.
 */
function applySubmitSuccess(
  config: RuntimeConfig,
  state: RuntimeState,
  button: HTMLButtonElement | null,
  scoreDisplay: { score: number; total: number } | null,
): void {
  const allowResubmit =
  config.submissionMode !== 'single' && config.revisionMode === 'free';
  const attemptLabel =
  state.attemptNumber > 1
  ? 'Attempt ' + state.attemptNumber + ' submitted!'
  : 'Submitted!';

  if (scoreDisplay) setScore(scoreDisplay.score, scoreDisplay.total);

  if (allowResubmit) {
    setStatus(attemptLabel + ' You can revise and resubmit.', 'success');
    if (button) {
      button.disabled = false;
      button.textContent = 'Resubmit';
    }
  } else {
    setStatus(attemptLabel + ' You can close this page.', 'success');
    state.submitted = true;
    clearActivityState(config);
    if (button) {
      button.disabled = true;
      button.textContent = 'Submitted';
    }
  }
}

/**
 * Validate the name, gather responses (scoring every blank into state),
 * render the final state, persist the payload, then POST with retry. On
 * success: reconcile the attempt number, clear the pending slot, and apply
 * the mode-appropriate success UI. On terminal failure: drop the pending slot
 * and surface the error. On exhausted retries: keep the pending slot (it
 * resends on reload) and let the student retry manually.
 */
export function submit(
  config: RuntimeConfig,
  refs: Refs,
  state: RuntimeState,
  onUpdate: () => void,
): void {
  const nameInput = $<HTMLInputElement>('#student-name');
  const name = nameInput ? trimValue(nameInput.value) : '';
  if (!name) {
    setStatus('Please enter your name before submitting.', 'error');
    if (nameInput) nameInput.focus();
    return;
  }
  state.studentName = name;
  saveName(name);

  const data = gatherResponses(state, refs);
  const checkpointResults = gatherCheckpointResults(state);
  onUpdate();

  const payload = buildSubmissionPayload(config, name, data, checkpointResults);

  // Persist before the network call so a close mid-flight survives.
  savePendingSubmission(config, payload);

  const button = $<HTMLButtonElement>('.submit-button');
  if (button) button.disabled = true;
  setStatus('Submitting…');

  void sendWithRetry(config.submissionEndpoint, payload, {
    onRetry: (_nextAttempt, waitMs) => {
      setStatus(
        'Network problem — retrying in ' + Math.round(waitMs / 1000) + 's…',
        'error',
      );
    },
  }).then((result) => {
    if (result.ok) {
      state.attemptNumber = result.attemptNumber ?? state.attemptNumber;
      clearPendingSubmission(config);
      applySubmitSuccess(config, state, button, {
        score: data.score,
        total: data.totalScored,
      });
    } else if (result.terminal) {
      clearPendingSubmission(config);
      setStatus(result.message ?? 'Submission failed.', 'error');
      if (button) button.disabled = false;
    } else {
      setStatus(
        'Couldn’t submit after several tries. Your work is saved — check your ' +
        'connection and press Submit again.',
        'error',
      );
      if (button) button.disabled = false;
    }
  });
}

/**
 * Resend a submission that was persisted but never confirmed (tab closed
 * mid-flight, or in-page retries exhausted on a prior load). Called once on
 * bootstrap. No-ops when there's nothing pending.
 *
 * Phase 1 accepts a duplicate-attempt risk here: if the original POST actually
 * reached the server but its response was lost, this resend creates a second
 * attempt row. The server increments attempt_number canonically and the
 * teacher dashboard dedups by best/all-attempts, so a dup is tolerable. An
 * idempotency token is the proper fix when that becomes a real problem.
 */
export function flushPendingSubmission(
  config: RuntimeConfig,
  state: RuntimeState,
): void {
  const payload = loadPendingSubmission(config);
  if (!payload) return;

  const button = $<HTMLButtonElement>('.submit-button');
  if (button) button.disabled = true;
  setStatus('Resending your previous submission…');

  void sendWithRetry(config.submissionEndpoint, payload, {
    onRetry: (_nextAttempt, waitMs) => {
      setStatus(
        'Network problem — retrying in ' + Math.round(waitMs / 1000) + 's…',
        'error',
      );
    },
  }).then((result) => {
    if (result.ok) {
      state.attemptNumber = result.attemptNumber ?? state.attemptNumber;
      clearPendingSubmission(config);
      applySubmitSuccess(config, state, button, null);
    } else if (result.terminal) {
      clearPendingSubmission(config);
      setStatus('Your previous submission could not be sent.', 'error');
      if (button) button.disabled = false;
    } else {
      setStatus(
        'Couldn’t resend your previous submission. Check your connection and ' +
        'press Submit again.',
        'error',
      );
      if (button) button.disabled = false;
    }
  });
}
