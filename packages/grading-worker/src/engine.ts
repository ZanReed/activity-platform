/**
 * The claim → infer → validate → submit engine, shared by worker:run and
 * study:run. Every failure lands in the W-4 taxonomy (problem + cause + fix,
 * counted, printed in the run summary) — log-and-skip, never log-and-stall,
 * never silent.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkerConfig } from './config.ts';
import { buildGradingPrompt, type RegistryEntry } from './promptBuilder.ts';
import { buildOutputJsonSchema, validateModelOutput } from './outputSchema.ts';
import { callModel } from './inference.ts';
import { claimSuggestions, submitSuggestion, type ClaimItem, type ClaimResult } from './rpc.ts';
import { PROMPT_REV, SCHEMA_REV } from './constants.ts';

export interface RunCounters {
  claimed: number;
  stored: number;
  abstained: number;
  forcedAbstain: number;
  schemaFailures: number;
  validationRejects: number;
  leaseExpired: number;
  inferenceErrors: number;
}

export function freshCounters(): RunCounters {
  return {
    claimed: 0,
    stored: 0,
    abstained: 0,
    forcedAbstain: 0,
    schemaFailures: 0,
    validationRejects: 0,
    leaseExpired: 0,
    inferenceErrors: 0,
  };
}

export function printSummary(c: RunCounters): void {
  console.log(
    `\nrun summary: claimed ${c.claimed} · stored ${c.stored} ` +
      `(abstained ${c.abstained}, forced-abstain ${c.forcedAbstain}) · ` +
      `schema-failures ${c.schemaFailures} · validation-rejects ${c.validationRejects} · ` +
      `lease-expired ${c.leaseExpired} · inference-errors ${c.inferenceErrors}`,
  );
}

export interface ProcessOptions {
  dryRun: boolean;
  registry: RegistryEntry[];
}

/** Process one claimed batch. Mutates `counters`; returns false when the run
 *  should abort (inference server down after retries — W-4's abort case). */
export async function processItems(
  client: SupabaseClient,
  config: WorkerConfig,
  items: ClaimItem[],
  counters: RunCounters,
  opts: ProcessOptions,
): Promise<boolean> {
  for (const item of items) {
    const rubric = item.block.rubric?.criteria ?? [];
    const built = buildGradingPrompt({
      block: item.block,
      responseText: item.response_text,
      anchors: item.anchors ?? [],
      registryEntries: opts.registry,
    });

    if (opts.dryRun) {
      console.log(`\n--- DRY RUN prompt for block ${item.block_id} ---\n`);
      console.log(built.system + '\n\n' + built.user);
      continue;
    }

    // EH-12: content the renderer could not carry into text (an image, a
    // graph) means the model would grade on partial context without knowing
    // it. Force the D6 abstain instead — the row stays a plain manual row.
    if (built.lossyRender) {
      counters.forcedAbstain++;
      const outcome = await submitSuggestion(
        client,
        item.suggestion_id,
        { confidence: 'low', criteria: [] },
        { modelId: config.modelId, promptRev: PROMPT_REV, schemaRev: SCHEMA_REV },
        { in: null, out: null },
      );
      if (outcome.kind === 'lease_expired') counters.leaseExpired++;
      console.log(
        `  block ${item.block_id}: prompt content not text-renderable → forced abstain (EH-12)`,
      );
      continue;
    }

    const schema = buildOutputJsonSchema(
      rubric,
      opts.registry.map((r) => r.id),
    );

    // Inference, with one retry then abort-the-run (W-4: an unreachable
    // server fails the RUN with the fix, not every item one by one).
    let inference = await callModel(
      {
        system: built.system,
        user: built.user,
        schema,
        modelId: config.modelId,
        inferenceUrl: config.inferenceUrl,
      },
      config.failedOutputDir,
    );
    if (!inference.ok && inference.reason === 'unreachable') {
      await new Promise((r) => setTimeout(r, 2000));
      inference = await callModel(
        {
          system: built.system,
          user: built.user,
          schema,
          modelId: config.modelId,
          inferenceUrl: config.inferenceUrl,
        },
        config.failedOutputDir,
      );
      if (!inference.ok && inference.reason === 'unreachable') {
        counters.inferenceErrors++;
        console.error(
          `\nABORTING RUN: ${inference.detail}\n` +
            `  Fix: start the inference server (README → "Start vLLM"), verify with\n` +
            `  \`pnpm worker:check\`, then re-run. Claimed leases release on their own.`,
        );
        return false;
      }
    }
    if (!inference.ok) {
      counters.inferenceErrors++;
      if (inference.reason === 'bad_json') {
        counters.schemaFailures++;
        console.warn(
          `  block ${item.block_id}: model output failed to parse (${inference.detail}); ` +
            `raw captured at ${inference.capturePath}`,
        );
      } else {
        console.warn(`  block ${item.block_id}: inference error — ${inference.detail}`);
      }
      continue;
    }

    const validated = validateModelOutput(
      inference.parsed,
      rubric,
      opts.registry.map((r) => r.id),
    );
    if (!validated.ok || !validated.output) {
      counters.schemaFailures++;
      console.warn(
        `  block ${item.block_id}: output failed local validation — ${validated.errors.join('; ')}`,
      );
      continue;
    }

    const outcome = await submitSuggestion(
      client,
      item.suggestion_id,
      validated.output,
      { modelId: config.modelId, promptRev: PROMPT_REV, schemaRev: SCHEMA_REV },
      { in: inference.tokensIn, out: inference.tokensOut },
    );
    if (outcome.kind === 'stored') {
      counters.stored++;
      if (validated.output.confidence === 'low') counters.abstained++;
    } else if (outcome.kind === 'lease_expired') {
      counters.leaseExpired++;
      console.warn(`  block ${item.block_id}: lease expired before submit — skipped (re-claimable)`);
    } else {
      counters.validationRejects++;
      console.warn(`  block ${item.block_id}: server rejected — ${outcome.reason}`);
    }
  }
  return true;
}

/** One claim + process round. Returns the claim result for gating decisions. */
export async function claimAndProcess(
  client: SupabaseClient,
  config: WorkerConfig,
  counters: RunCounters,
  opts: ProcessOptions & { study?: boolean; studyCheckIds?: string[] },
): Promise<ClaimResult> {
  const result = await claimSuggestions(client, {
    limit: config.batchSize,
    // Dry runs still lease what they claim; a 1-minute lease keeps the
    // blast radius of "I only wanted to see the prompt" near zero.
    leaseMinutes: opts.dryRun ? 1 : config.leaseMinutes,
    promptRev: PROMPT_REV,
    schemaRev: SCHEMA_REV,
    modelId: config.modelId,
    study: opts.study,
    studyCheckIds: opts.studyCheckIds,
  });
  if (result.status !== 'ok') return result;
  counters.claimed += result.items.length;
  await processItems(client, config, result.items, counters, opts);
  return result;
}
