// worker:run — the pull loop (D1). `--once` runs a single claim batch;
// `--dry-run` builds prompts and submits nothing. Stopping this process IS
// the pilot's pause hatch (W-9).
import { loadConfig } from '../config.ts';
import { loadAuthedClient, refresh, SessionExpiredError } from '../session.ts';
import { loadGoldenLog, assertValidatedTuple } from '../goldenLog.ts';
import { fetchRegistry } from '../rpc.ts';
import { claimAndProcess, freshCounters, printSummary } from '../engine.ts';
import { PROMPT_REV, SCHEMA_REV } from '../constants.ts';

const args = new Set(process.argv.slice(2));
const once = args.has('--once');
const dryRun = args.has('--dry-run');
const allowUnvalidated = args.has('--allow-unvalidated');

try {
  const config = loadConfig();

  // W-7: the golden-log start gate. A dry run is exempt — it submits
  // nothing, and reading the prompt is how you debug toward a golden run.
  if (!dryRun) {
    const warning = assertValidatedTuple(
      loadGoldenLog(config.goldenLogPath),
      { promptRev: PROMPT_REV, schemaRev: SCHEMA_REV, modelId: config.modelId },
      allowUnvalidated,
    );
    if (warning) console.warn(warning);
  }

  const client = await loadAuthedClient(config);
  const registry = await fetchRegistry(client);
  const counters = freshCounters();

  let running = true;
  process.on('SIGINT', () => {
    running = false;
    console.log('\nstopping after this batch (W-9: stopping the worker is the pause) …');
  });

  for (;;) {
    const result = await claimAndProcess(client, config, counters, { dryRun, registry });
    if (result.status === 'provider_off') {
      console.log(
        'provider_off: grading_provider is off (or unset) for this teacher.\n' +
          '  Fix: run the provider flip (README → "Flip the provider") and re-run.',
      );
      break;
    }
    if (result.status === 'quota_paused') {
      console.log(`quota_paused: resumes ${result.resumes_at ?? '(next period)'} — stopping.`);
      break;
    }
    if (once || dryRun) break;
    if (!running) break;
    if (result.items.length === 0) {
      await new Promise((r) => setTimeout(r, config.pollSeconds * 1000));
    }
    if (!running) break;
    await refresh(config, client);
  }

  printSummary(counters);
} catch (err) {
  if (err instanceof SessionExpiredError) {
    console.error(`\n${err.message}`);
  } else {
    console.error(`\nworker:run failed: ${(err as Error).message}`);
  }
  process.exit(1);
}
