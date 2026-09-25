/**
 * The W-7 start gate: the worker REFUSES to run a
 * (PROMPT_REV, SCHEMA_REV, model_id) tuple that has no E2b golden run in the
 * committed log. This is what closes the ungated-local-model-swap hole — any
 * swap needs a golden run first, or the explicit, loud
 * `--allow-unvalidated` override (such rows still stamp their real model_id,
 * so experiment rows stay distinguishable per-rev in telemetry).
 *
 * The log is an in-repo JSON file (golden-log.json beside the package root):
 * appending an entry is a reviewable diff, exactly like the rev constants it
 * keys on.
 */
import { readFileSync } from 'node:fs';

export interface GoldenEntry {
  promptRev: number;
  schemaRev: number;
  modelId: string;
  ranAt: string;
  fixtures: number;
  notes?: string;
}

export interface Tuple {
  promptRev: number;
  schemaRev: number;
  modelId: string;
}

export function parseGoldenLog(text: string): GoldenEntry[] {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('golden-log.json must be a JSON array');
  return parsed as GoldenEntry[];
}

export function loadGoldenLog(path: string): GoldenEntry[] {
  return parseGoldenLog(readFileSync(path, 'utf8'));
}

export function isValidatedTuple(log: GoldenEntry[], tuple: Tuple): boolean {
  return log.some(
    (e) =>
      e.promptRev === tuple.promptRev &&
      e.schemaRev === tuple.schemaRev &&
      e.modelId === tuple.modelId,
  );
}

/**
 * The gate itself. Throws unless the tuple is logged or the override is set;
 * the override path returns a warning string the caller MUST print (a silent
 * override would be no gate at all).
 */
export function assertValidatedTuple(
  log: GoldenEntry[],
  tuple: Tuple,
  allowUnvalidated: boolean,
): string | null {
  if (isValidatedTuple(log, tuple)) return null;
  const name = `(prompt_rev ${tuple.promptRev}, schema_rev ${tuple.schemaRev}, model ${tuple.modelId})`;
  if (!allowUnvalidated) {
    throw new Error(
      `REFUSING TO RUN: ${name} has no E2b golden run in golden-log.json.\n` +
        `Run the golden procedure (README → "E2b golden run") against this tuple\n` +
        `and commit the log entry, or pass --allow-unvalidated for a local experiment.`,
    );
  }
  return (
    `⚠ UNVALIDATED TUPLE ${name} — running under --allow-unvalidated.\n` +
    `  Suggestions will stamp this model_id, so its rows stay distinguishable\n` +
    `  in per-rev telemetry. Do not confirm drafts from an unvalidated tuple\n` +
    `  into real grades without looking at them twice.`
  );
}
