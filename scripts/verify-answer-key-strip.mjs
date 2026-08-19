#!/usr/bin/env node
// =============================================================================
// verify-answer-key-strip.mjs — the answer-key deploy liveness proof (E5.4, P3)
// -----------------------------------------------------------------------------
// WHAT THIS IS FOR. The answer-key slice added `answer` and `solution` to
// short_answer and essay, and declared them stripped in the viewer registry.
// That declaration only becomes TRUE on the live read path once the redeployed
// get-activity is serving — the OLD deployed bundle does not know the fields
// exist and would pass them straight through to a student. So there is a real
// window in which publishing an answer-bearing activity leaks the teacher's key
// to whoever opens it.
//
// The ordering constraint that closes the window: NO ANSWER-BEARING ACTIVITY IS
// PUBLISHED BEFORE THIS PROOF PASSES. This script is the proof.
//
// WHY A SENTINEL AND NOT A LOOK AT THE PAGE. The student surface never RENDERS
// `answer` even if it is served — no component reads it — so a clean-looking
// page proves nothing at all. The only honest observation is the WIRE: what
// get-activity actually returned. That is what this reads.
//
// P3, stated plainly: a safeguard nobody has watched fire is not a safeguard.
// Run this against a real published activity that really does carry a sentinel
// answer, and read the two assertions in order — the first proves the scan is
// not vacuous, the second is the safety property.
//
// ---------------------------------------------------------------------------
// HOW TO RUN IT (about five minutes, all author-side)
// ---------------------------------------------------------------------------
// 1. Deploy the new function:      pnpm deploy:get-activity
//    Then confirm the flag survived (CLAUDE.md): list_edge_functions must still
//    show get-activity with verify_jwt = false. It is the only one.
//
// 2. In the app, create a THROWAWAY activity with one short-answer question
//    whose answer is the sentinel. Paste this into the import dialog:
//
//        ```shortanswer
//        prompt: Sentinel probe — delete me.
//        answer: LEAK_PROBE_ANSWER_KEY_20260820
//        ```
//
//    Publish it, and copy the activity id out of the share link (/a/<id>).
//
// 3. Get a session token: open the app signed in, DevTools console, then
//        Object.entries(localStorage).find(([k]) => k.includes('auth-token'))
//    and copy the `access_token` out of the JSON value.
//
// 4. node scripts/verify-answer-key-strip.mjs \
//        --activity <id> --token <access_token>
//
//    (--url defaults to $SUPABASE_FUNCTIONS_URL, else derives from
//     $VITE_SUPABASE_URL. Pass --url explicitly if neither is set.)
//
// 5. RESIDUE IS YOURS TO CLEAR (policy P7): delete the throwaway activity in
//    the app afterwards, and say so in STATE.md when you record the result.
//    A sentinel activity left published is a probe that becomes a fixture.
// =============================================================================

const SENTINEL = 'LEAK_PROBE_ANSWER_KEY_20260820';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

function fail(message) {
  console.error(`\n  FAIL  ${message}\n`);
  process.exit(1);
}

const activityId = arg('activity');
const token = arg('token');
const base =
  arg('url') ??
  process.env.SUPABASE_FUNCTIONS_URL ??
  (process.env.VITE_SUPABASE_URL
    ? `${process.env.VITE_SUPABASE_URL.replace(/\/$/, '')}/functions/v1`
    : undefined);

if (!activityId || !token || !base) {
  console.error(
    'usage: node scripts/verify-answer-key-strip.mjs --activity <id> --token <jwt> [--url <functions-base>]',
  );
  process.exit(2);
}

const endpoint = `${base.replace(/\/$/, '')}/get-activity`;
const headers = { Authorization: `Bearer ${token}` };

async function get(params) {
  const url = `${endpoint}?${new URLSearchParams(params)}`;
  const res = await fetch(url, { headers });
  const text = await res.text();
  if (!res.ok) fail(`${res.status} from get-activity — ${text.slice(0, 300)}`);
  return { text, json: JSON.parse(text) };
}

console.log(`\nanswer-key strip liveness proof\n  ${endpoint}\n  activity ${activityId}\n`);

const resolved = await get({ activity_id: activityId });
const versionId = resolved.json.version_id;
if (typeof versionId !== 'string') fail('resolve returned no version_id');
console.log(`  resolved version ${versionId}`);

const served = await get({ activity_id: activityId, version_id: versionId });
const wire = served.text;

// ---- Leg 1: NON-VACUITY -----------------------------------------------------
// The probe activity must actually be the one we think it is. Without this a
// typo'd activity id, an unpublished draft, or a version that predates the
// sentinel would all "pass" the scan below by containing nothing.
const blocks = JSON.stringify(served.json.activity ?? {});
if (!/"type":"short_answer"/.test(blocks)) {
  fail(
    'the served version contains no short_answer block — this is not the probe ' +
      'activity, or the sentinel version was never published. The scan below ' +
      'would have passed vacuously.',
  );
}
console.log('  ok   the served version really is the probe (a short_answer is present)');

// ---- Leg 2: THE SAFETY PROPERTY ---------------------------------------------
if (wire.includes(SENTINEL)) {
  fail(
    `THE ANSWER REACHED THE WIRE. The deployed get-activity is still the old ` +
      `bundle (or the deploy did not take). Do NOT publish answer-bearing ` +
      `activities. Redeploy with 'pnpm deploy:get-activity' and re-run this.`,
  );
}
if (/"answer"\s*:/.test(blocks) || /"solution"\s*:/.test(blocks)) {
  fail(
    'an `answer` or `solution` KEY survived on the served document, even though ' +
      'the sentinel value did not — check which block type it is on.',
  );
}
console.log('  ok   no answer material on the wire — value AND key both absent');

console.log(
  '\n  PASS — the redeployed get-activity strips the answer-key fields.' +
    '\n  Now delete the throwaway activity (P7) and record the result in STATE.md.\n',
);
