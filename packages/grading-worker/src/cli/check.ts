// worker:check — the endpoint preflight (W-5/W-6): proves the inference
// server is up AND that it actually honors `response_format: json_schema`.
// vLLM (guided decoding) does; Ollama diverges on exactly this feature, so a
// server that echoes prose here fails loudly BEFORE the first real batch
// fails confusingly.
import { loadConfig } from '../config.ts';
import { callModel } from '../inference.ts';
import { loadGoldenLog, isValidatedTuple } from '../goldenLog.ts';
import { PROMPT_REV, SCHEMA_REV } from '../constants.ts';

let config: ReturnType<typeof loadConfig>;
try {
  config = loadConfig();
} catch (err) {
  console.error(`worker:check failed: ${(err as Error).message}`);
  process.exit(1);
}
console.log('worker configuration:');
console.log(`  supabase   : ${config.supabaseUrl}`);
console.log(`  inference  : ${config.inferenceUrl}`);
console.log(`  model      : ${config.modelId}`);
console.log(`  batch/lease: ${config.batchSize} checks / ${config.leaseMinutes} min`);
console.log(`  session    : ${config.sessionPath}`);

const tuple = { promptRev: PROMPT_REV, schemaRev: SCHEMA_REV, modelId: config.modelId };
try {
  const log = loadGoldenLog(config.goldenLogPath);
  console.log(
    `  golden log : tuple (${tuple.promptRev}, ${tuple.schemaRev}, ${tuple.modelId}) ` +
      (isValidatedTuple(log, tuple)
        ? 'VALIDATED'
        : 'NOT VALIDATED — worker:run will refuse (W-7); see README → "E2b golden run"'),
  );
} catch (err) {
  console.log(`  golden log : unreadable (${(err as Error).message})`);
}

const result = await callModel(
  {
    system: 'You are a JSON echo. Return exactly the object the schema requires.',
    user: 'Return {"ok":"yes"}.',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['ok'],
      properties: { ok: { type: 'string', enum: ['yes'] } },
    },
    modelId: config.modelId,
    inferenceUrl: config.inferenceUrl,
  },
  config.failedOutputDir,
);

if (!result.ok) {
  console.error(`\nPREFLIGHT FAILED (${result.reason}): ${result.detail}`);
  console.error(
    result.reason === 'unreachable'
      ? '  Fix: start the inference server (README → "Start vLLM") and re-run.'
      : '  Fix: check the server logs; if this is Ollama, its structured-output\n' +
          '  support must pass THIS check before it may be used (W-6).',
  );
  process.exit(1);
}

const parsed = result.parsed as { ok?: string };
if (parsed?.ok !== 'yes') {
  console.error(
    `\nPREFLIGHT FAILED: server answered but did NOT honor the JSON schema\n` +
      `  (got ${result.raw.slice(0, 200)}).\n` +
      '  This server cannot run the pilot: schema-constrained decoding is the\n' +
      "  contract the whole output path relies on (W-6 — vLLM's guided decoding).",
  );
  process.exit(1);
}
console.log('\nPREFLIGHT OK: server reachable, JSON-schema decoding honored.');
