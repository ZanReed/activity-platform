// study:run — the D7 blind-study protocol AS a script (§5.2):
//   pnpm study:run --checks path/to/check-ids.txt
// The file lists check ids (one per line, or a JSON array) produced by the
// committed study query (scripts/grading-study-checks.sql). The claim runs
// under the study flag, which server-side means: explicit-id claim with
// per-id ownership validation (EH-2), rows marked source='study' (excluded
// from the queue UI and edit-rate telemetry, EH-10), and ANCHORS OFF — the
// step-1 hand grades are the ground truth being compared against and must
// not leak into the "blind" numbers.
import { readFileSync } from 'node:fs';
import { loadConfig } from '../config.ts';
import { loadAuthedClient, SessionExpiredError } from '../session.ts';
import { loadGoldenLog, assertValidatedTuple } from '../goldenLog.ts';
import { fetchRegistry } from '../rpc.ts';
import { claimAndProcess, freshCounters, printSummary } from '../engine.ts';
import { PROMPT_REV, SCHEMA_REV } from '../constants.ts';
import { parseCheckIds } from '../checkIds.ts';

const argv = process.argv.slice(2);
const checksFlag = argv.indexOf('--checks');
const allowUnvalidated = argv.includes('--allow-unvalidated');
if (checksFlag === -1 || !argv[checksFlag + 1]) {
  console.error(
    'Usage: pnpm study:run --checks <file>\n' +
      '  <file>: check ids, one per line or a JSON array — generate it with\n' +
      '  scripts/grading-study-checks.sql (the committed study query).',
  );
  process.exit(1);
}

try {
  const config = loadConfig();
  const ids = parseCheckIds(readFileSync(argv[checksFlag + 1] as string, 'utf8'));
  console.log(`study run over ${ids.length} checks (anchors OFF server-side)`);

  const warning = assertValidatedTuple(
    loadGoldenLog(config.goldenLogPath),
    { promptRev: PROMPT_REV, schemaRev: SCHEMA_REV, modelId: config.modelId },
    allowUnvalidated,
  );
  if (warning) console.warn(warning);

  const client = await loadAuthedClient(config);
  const registry = await fetchRegistry(client);
  const counters = freshCounters();
  let dropped = 0;

  // Chunk CLIENT-side: the server inserts study rows for every id it is
  // handed per call (it does not dedupe re-claims across calls — study rows
  // are per-run inserts), so each id is passed exactly once.
  for (let i = 0; i < ids.length; i += config.batchSize) {
    const chunk = ids.slice(i, i + config.batchSize);
    const result = await claimAndProcess(client, config, counters, {
      dryRun: false,
      registry,
      study: true,
      studyCheckIds: chunk,
    });
    if (result.status !== 'ok') {
      console.error(`stopping: claim returned ${result.status}`);
      break;
    }
    dropped += result.dropped ?? 0;
  }

  if (dropped > 0) {
    console.warn(
      `⚠ ${dropped} supplied check ids were DROPPED (not this teacher's checks — EH-2).`,
    );
  }
  printSummary(counters);
  console.log('\nNext: `pnpm study:report` (needs GRADING_DATABASE_URL, see README).');
} catch (err) {
  if (err instanceof SessionExpiredError) console.error(`\n${err.message}`);
  else console.error(`\nstudy:run failed: ${(err as Error).message}`);
  process.exit(1);
}
