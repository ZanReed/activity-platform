// =============================================================================
// scripts/deploy-train.mjs — Interactive deploy-ordering walkthrough
// -----------------------------------------------------------------------------
// The deploy-ordering rules (CLAUDE.md "Division of labor" + the Edge Functions
// README) encoded as an executable, so they can't be misremembered:
//
//   1. Kit change  → upload the kit FIRST (`pnpm upload:graph-kit`), THEN deploy
//      publish-activity. Reversed, the live function points at a not-yet-uploaded
//      hash and the summon button 404s on every page published in the gap.
//   2. Wire bump   → redeploy ingest-submission BEFORE republishing any activity.
//      A page publishing the new wire POSTs a version the live ingest 400s until
//      ingest is redeployed. Ingest accepts older wire versions, so ingest-first
//      never breaks already-published pages.
//   3. ingest-submission is ALWAYS deployed with --no-verify-jwt (students submit
//      anonymously; there is no config.toml, so a plain redeploy silently
//      re-enables JWT verification and 401s every submission).
//
// Asks what changed, prints the ordered plan, then runs each step with a y/n
// confirmation. Every command is also runnable by hand (`pnpm deploy:ingest`
// etc.) — this script only sequences them.
//
// Run: pnpm deploy:train
// =============================================================================

import { createInterface } from 'node:readline/promises';
import { spawnSync } from 'node:child_process';

if (!process.stdin.isTTY) {
  console.log('deploy-train is interactive; no TTY detected. The ordered checklist:');
  console.log('  1. Kit changed?  pnpm upload:graph-kit   (confirm the Uploaded: lines)');
  console.log('  2. Wire bumped?  pnpm deploy:ingest      (always --no-verify-jwt)');
  console.log('  3. Renderer/schema/kit-URL changed?  pnpm deploy:publish');
  console.log('  4. Deploy the app if it changed; re-publish affected activities.');
  console.log('  5. Commit the regenerated graph-kit manifest if step 1 ran.');
  process.exit(0);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const yes = async (q) => /^y(es)?$/i.test((await rl.question(`${q} [y/N] `)).trim());

console.log('Deploy train — answer what changed; the ordering is handled for you.\n');

const kitChanged = await yes('Did packages/graph-kit change (new kit hash)?');
const wireBumped = await yes('Did the submission wire format (schemaVersion) bump?');
const publishChanged = await yes(
  'Did schema/renderer/runtime change (publish-activity needs the fresh bundle)?',
);
const appChanged = await yes('Did the app (editor/dashboard) change?');

/** @type {{label: string, cmd?: string[], note?: string}[]} */
const steps = [];

if (kitChanged) {
  steps.push({
    label: 'Upload the graph kit to R2 (MUST precede the publish-activity deploy)',
    cmd: ['pnpm', 'upload:graph-kit'],
    note: 'Confirm the "Uploaded:" lines before continuing.',
  });
}
if (wireBumped) {
  steps.push({
    label: 'Redeploy ingest-submission with --no-verify-jwt (MUST precede any republish)',
    cmd: ['pnpm', 'deploy:ingest'],
  });
}
if (publishChanged || kitChanged) {
  steps.push({
    label: 'Redeploy publish-activity (picks up the committed bundle + kit manifest)',
    cmd: ['pnpm', 'deploy:publish'],
  });
}
if (appChanged) {
  steps.push({
    label: 'Deploy the app (manual — however the SPA is hosted)',
    note: 'No command wired here; deploy the app the usual way, then continue.',
  });
}
steps.push({
  label: 'Re-publish affected activities so live pages pick up the changes',
  note: 'From the editor, or skip if nothing published needs the change yet.',
});
if (kitChanged) {
  steps.push({
    label: 'Commit the regenerated supabase/functions/_shared/graph-kit-manifest.ts',
    note: 'An uncommitted manifest makes a future clean-checkout deploy point pages at a stale hash.',
  });
}

console.log('\nPlan:');
steps.forEach((s, i) => console.log(`  ${i + 1}. ${s.label}`));
console.log('');

for (const [i, s] of steps.entries()) {
  console.log(`\nStep ${i + 1}/${steps.length}: ${s.label}`);
  if (s.note) console.log(`  ${s.note}`);
  if (!s.cmd) {
    await rl.question('  Press Enter when done (or Ctrl+C to abort the train). ');
    continue;
  }
  if (!(await yes(`  Run \`${s.cmd.join(' ')}\` now?`))) {
    console.log('  Skipped. (The remaining order still assumes this eventually runs.)');
    continue;
  }
  const res = spawnSync(s.cmd[0], s.cmd.slice(1), { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error(`\n  Step failed (exit ${res.status}). Stopping the train — fix and re-run;`);
    console.error('  completed steps are safe to leave in place (ordering only constrains later steps).');
    rl.close();
    process.exit(res.status ?? 1);
  }
}

rl.close();
console.log('\nDeploy train complete. Update STATE.md "Pending author actions" if anything was skipped.');
