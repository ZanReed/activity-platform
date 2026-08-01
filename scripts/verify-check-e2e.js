// =============================================================================
// verify-check-e2e.js — the LIVE verification of the check-activity endpoint
// -----------------------------------------------------------------------------
// Paste into the browser console on https://activity-platform.pages.dev while
// SIGNED IN, with at least one PUBLISHED activity on the account. Self-contained:
// reads the session from localStorage and the publishable key out of the app
// bundle, so there is nothing to fill in and no key to paste.
//
// Runs the checks the unit suites and the SQL matrix structurally cannot —
// everything above the database: that the deployed function is reachable and
// enforcing, that a real session JWT survives the round trip, that the wire the
// browser actually receives carries no answer key, and how long a check TAKES
// on a real Edge deployment.
//
// It drives the REAL student path end to end: get-activity (resolve → content)
// to obtain the version and the served document, then check-activity against a
// section of it. Nothing is hand-constructed; if the read API and the grader
// disagree about ids, this fails.
//
// ⚠ THE p95 SECTION IS THE POINT OF THIS SCRIPT. Finding R2 left the cold-start
// mitigation deliberately unruled ("measure the batched RPC first; if p95
// misses, options are a warm-ping cron or accepting with explicit Checking… UI
// — don't pre-build either"). Section E produces exactly that number. Paste its
// output into STATE so the ruling is made on data.
//
// ⚠ SIDE EFFECT — THIS WRITES REAL ROWS. Every graded check inserts a
// section_checks row for the signed-in account (there is no DELETE policy, by
// design — the same absence that makes checks un-rewritable). The timing run
// dominates: ~20 rows. They are on YOUR OWN activity and attributable to your
// user id; the script prints the exact cleanup SQL at the end. Run it as
// service role in the SQL editor if you want them gone.
//
// PRE-VERIFIED WITHOUT CREDENTIALS (2026-08-01, plain curl — no session needed):
// the deployed function answers 401 `UNAUTHORIZED_NO_AUTH_HEADER` to an
// unauthenticated POST (the verify_jwt gate is on and enforcing) and 204 to a
// CORS preflight echoing the Pages origin with the right allow-headers. So the
// deploy itself is known-good; everything below needs a real session.
//
// NOT COVERED HERE, deliberately: the 429 rate ceiling. Tripping it live needs
// ~60 real checks (~60 junk rows) to prove something already verified against
// the real database in the 0020 probe (case B8, `rate_limited` raised). Paying
// 60 rows to re-prove a green assertion is a bad trade; noted rather than
// silently skipped.
// =============================================================================

(async () => {
  const out = [];
  const rec = (n, ok, d) => {
    console.log(`${ok ? '✅ PASS' : '❌ FAIL'} — ${n}${d ? ' :: ' + d : ''}`);
    out.push({ n, ok });
  };
  const info = (m) => console.log(`   … ${m}`);

  // ---- session + apikey -----------------------------------------------------
  const sk = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
  if (!sk) return console.error('Not signed in (no Supabase session in localStorage).');
  const sess = JSON.parse(localStorage.getItem(sk));
  const jwt = sess.access_token || sess?.currentSession?.access_token;
  if (!jwt) return console.error('Session found but no access_token — sign out and back in.');

  const bundleSrc = [...document.querySelectorAll('script[src]')]
    .map((s) => s.src)
    .find((s) => /assets\/index-/.test(s));
  const bundle = await fetch(bundleSrc).then((r) => r.text());
  const apikey = (bundle.match(/sb_publishable_[A-Za-z0-9_-]+/) ||
    bundle.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/) || [])[0];
  const SUPA = (bundle.match(/https:\/\/[a-z]+\.supabase\.co/) || [])[0];
  if (!apikey || !SUPA) return console.error('Could not read apikey / project URL from the bundle.');

  const H = (extra) => ({ Authorization: `Bearer ${jwt}`, apikey, 'Content-Type': 'application/json', ...extra });
  const CHECK = `${SUPA}/functions/v1/check-activity`;
  const READ = `${SUPA}/functions/v1/get-activity`;

  const postCheck = (body, headers) =>
    fetch(CHECK, { method: 'POST', headers: headers ?? H(), body: JSON.stringify(body) })
      .then(async (r) => ({ status: r.status, json: await r.json().catch(() => ({})) }));

  // ================= A. Fixture: the real student read path ==================
  const mine = await fetch(
    `${SUPA}/rest/v1/activities?select=id&status=eq.published&deleted_at=is.null&limit=1`,
    { headers: H() },
  ).then((r) => r.json());
  const ACT = mine?.[0]?.id;
  if (!ACT) return console.error('No PUBLISHED activity on this account — publish one, then re-run.');

  const resolved = await fetch(`${READ}?activity_id=${ACT}`, { headers: H() }).then((r) => r.json());
  const VERSION = resolved.version_id;
  if (!VERSION) return console.error('get-activity did not resolve a version:', resolved);

  const content = await fetch(`${READ}?activity_id=${ACT}&version_id=${VERSION}`, { headers: H() })
    .then((r) => r.json());
  // The served document lives under `activity` — the same key readClient reads
  // (`data.activity`), not `document`/`content`. Guessing this wrong is a
  // silent no-op that looks like "the activity has no sections", so the error
  // below prints the keys we actually got.
  const doc = content.activity;
  if (!doc?.sections?.length) {
    return console.error(
      `Served response has no sections. Top-level keys: [${Object.keys(content).join(', ')}]`,
      content,
    );
  }

  /** Collect response ids from a served section, the way the viewer's
   *  blockIndex does — deep, because a blank can sit inside a container. */
  const idsOf = (node, acc = { blanks: [], choices: [], freeText: [], choicePick: {} }) => {
    const walk = (n) => {
      if (Array.isArray(n)) return n.forEach(walk);
      if (!n || typeof n !== 'object') return;
      if (n.type === 'blank' && n.id) acc.blanks.push(n.id);
      if (n.type === 'multiple_choice' && n.id) {
        acc.choices.push(n.id);
        // Capture a selectable option so the MC actually gets ANSWERED — the
        // served block carries choice ids (only the `correct` flag is
        // stripped), so picking the first is enough to exercise grading.
        const first = Array.isArray(n.choices) ? n.choices[0]?.id : undefined;
        if (first) acc.choicePick[n.id] = [first];
      }
      if (['short_answer', 'essay', 'self_explanation'].includes(n.type) && n.id) {
        acc.freeText.push(n.id);
      }
      Object.values(n).forEach(walk);
    };
    walk(node);
    return acc;
  };

  // Pick the RICHEST section rather than the first. A leading section is often
  // just a heading, and grading one with no responses would fail B4 for a
  // reason that has nothing to do with the grader.
  let section = null;
  let ids = { blanks: [], choices: [], freeText: [], choicePick: {} };
  let best = -1;
  for (const s of doc.sections) {
    const got = idsOf(s);
    const n = got.blanks.length + got.choices.length + got.freeText.length;
    if (n > best) { best = n; section = s; ids = got; }
  }
  const SECTION = section.id;
  console.log(`fixture: activity ${ACT} · version ${VERSION} · section ${SECTION}`);
  info(`chose the richest of ${doc.sections.length} section(s): ${ids.blanks.length} blanks, ${ids.choices.length} MC, ${ids.freeText.length} free-text`);
  if (best === 0) {
    console.warn('⚠ No response-bearing blocks found in ANY section — B4 will fail.');
    console.warn('  Use an activity with at least one blank, MC, or free-text block.');
  }

  const baseBody = (over = {}) => ({
    wireVersion: 2,
    activityId: ACT,
    versionId: VERSION,
    sectionId: SECTION,
    responses: {
      blanks: Object.fromEntries(ids.blanks.map((id) => [id, 'e2e-probe-answer'])),
      choices: ids.choicePick,
      freeText: Object.fromEntries(ids.freeText.map((id) => [id, 'e2e probe text'])),
    },
    ...over,
  });

  // ================= B. The happy path =======================================
  const t0 = performance.now();
  const happy = await postCheck(baseBody());
  const firstMs = Math.round(performance.now() - t0);
  rec('B1 a real check returns 200', happy.status === 200, `${happy.status} in ${firstMs} ms`);
  rec('B2 response echoes the section + wire version',
    happy.json.sectionId === SECTION && happy.json.wireVersion === 2,
    JSON.stringify({ s: happy.json.sectionId === SECTION, w: happy.json.wireVersion }));
  rec('B3 the server assigned an attempt number',
    typeof happy.json.attemptNumber === 'number', String(happy.json.attemptNumber));
  const gradedCount = Object.keys(happy.json.items ?? {}).length;
  rec('B4 it actually graded something', gradedCount > 0, `${gradedCount} items`);

  // ================= C. The security surface ================================
  const noAuth = await fetch(CHECK, {
    method: 'POST', headers: { apikey, 'Content-Type': 'application/json' },
    body: JSON.stringify(baseBody()),
  }).then((r) => r.status);
  // Verified from a plain curl too: the 401 body is Supabase's own
  // (`UNAUTHORIZED_NO_AUTH_HEADER`), not the handler's — because
  // check-activity runs with verify_jwt TRUE, so the platform gate refuses the
  // request before our code is reached. That is the design (a check always
  // comes from a signed-in student), and the handler's own missing-auth branch
  // is the backstop if the flag were ever dropped.
  rec('C1 no Authorization header → 401', noAuth === 401, String(noAuth));

  // The parentage probe, live. A version id that is real but belongs to a
  // DIFFERENT activity must be refused — and because solutions come back for
  // every block in a section, a pass here would mean handing over a foreign
  // activity's whole solution set.
  const others = await fetch(
    `${SUPA}/rest/v1/activity_versions?select=id,activity_id&activity_id=neq.${ACT}&limit=1`,
    { headers: H() },
  ).then((r) => r.json()).catch(() => []);
  const FOREIGN = others?.[0]?.id;
  if (FOREIGN) {
    const foreign = await postCheck(baseBody({ versionId: FOREIGN }));
    rec('C2 a version from ANOTHER activity → 404 (no solution set returned)',
      foreign.status === 404 && !JSON.stringify(foreign.json).includes('solutions'),
      `${foreign.status}`);
  } else {
    info('SKIP C2 — RLS exposed no other activity_versions row to this account');
  }

  const badVersion = await postCheck(baseBody({ versionId: '00000000-0000-4000-8000-000000000000' }));
  rec('C3 an unknown version → 404 with the same message (no oracle)',
    badVersion.status === 404, String(badVersion.status));

  // The machine code is nested: _shared/cors.ts emits
  // { error, details: { code } }. The first live run read it top-level and
  // reported `undefined` — which turned out to be a REAL client bug, not a
  // script bug: httpCheckService read the same wrong path, so the stale-tab
  // mapping could never fire in production.
  const codeOf = (r) => r.json?.details?.code ?? r.json?.code;

  const staleWire = await postCheck(baseBody({ wireVersion: 99 }));
  rec('C4 a stale wire version → 400 code wire_version_mismatch',
    staleWire.status === 400 && codeOf(staleWire) === 'wire_version_mismatch',
    `${staleWire.status} ${codeOf(staleWire)}`);

  const badSection = await postCheck(baseBody({ sectionId: 'no-such-section' }));
  rec('C5 an unknown section → 400 unknown_section, not 500',
    badSection.status === 400 && codeOf(badSection) === 'unknown_section',
    `${badSection.status} ${codeOf(badSection)}`);

  // ================= D. Leak scan on the LIVE wire ==========================
  // The unit suite scans a locally-graded response. This scans the bytes the
  // BROWSER received from the deployed function — the only place a bundling or
  // deploy mistake could reintroduce a leak the tests cannot see.
  const wire = JSON.stringify(happy.json);
  const FORBIDDEN = ['acceptableAnswers', 'mistakeFeedback', 'correctPoints', 'noSolutionCorrect',
    'correctInterval', 'inequalities', 'tolerance', 'equivalence', 'rubric', '"key"', '"correct"'];
  const present = FORBIDDEN.filter((k) => wire.includes(k));
  rec('D1 no answer-key field name in the live response', present.length === 0, present.join(', ') || 'clean');
  rec('D2 the response is non-trivial (a blank one would pass D1 vacuously)',
    wire.length > 100, `${wire.length} bytes`);

  // ================= E. TIMING — the number R2 is waiting on =================
  console.log('\n⏱  Timing 20 warm checks (this writes ~20 rows) …');
  const samples = [];
  for (let i = 0; i < 20; i++) {
    const t = performance.now();
    const r = await postCheck(baseBody());
    const ms = performance.now() - t;
    if (r.status === 200) samples.push(ms);
    else info(`sample ${i} returned ${r.status} — excluded`);
  }
  samples.sort((a, b) => a - b);
  const pct = (p) => Math.round(samples[Math.min(samples.length - 1, Math.floor(samples.length * p))]);
  const stats = {
    n: samples.length,
    firstCallMs: firstMs,
    p50: pct(0.5), p90: pct(0.9), p95: pct(0.95),
    min: Math.round(samples[0]), max: Math.round(samples[samples.length - 1]),
  };
  console.log('⏱  WARM TIMING:', JSON.stringify(stats));
  info('firstCallMs is the closest thing to a cold start here; a true cold');
  info('start needs the isolate evicted first (idle ~15 min, then re-run B1).');
  rec('E1 collected enough samples to quote a p95', samples.length >= 15, `${samples.length}/20`);

  // ================= F. Persistence + idempotency ===========================
  const rows = await fetch(
    `${SUPA}/rest/v1/section_checks?select=id,attempt_number,section_id&activity_id=eq.${ACT}&order=created_at.desc&limit=5`,
    { headers: H() },
  ).then((r) => r.json()).catch(() => []);
  rec('F1 checks persisted and are readable by their owner',
    Array.isArray(rows) && rows.length > 0, `${rows?.length ?? 0} recent rows`);
  rec('F2 attempts increment across re-checks',
    Array.isArray(rows) && rows.length > 1 && rows[0].attempt_number > rows[1].attempt_number,
    rows?.slice(0, 3).map((r) => r.attempt_number).join(','));

  const key = `e2e-idem-${Date.now()}`;
  const one = await postCheck(baseBody({ idempotencyKey: key }));
  const two = await postCheck(baseBody({ idempotencyKey: key }));
  rec('F3 a replayed request does NOT mint a second attempt',
    one.json.attemptNumber === two.json.attemptNumber,
    `${one.json.attemptNumber} vs ${two.json.attemptNumber}`);

  // ================= Verdict ================================================
  const passed = out.filter((o) => o.ok).length;
  console.log(`\n=== verify-check-e2e: ${passed} PASS, ${out.length - passed} FAIL ===`);
  if (passed !== out.length) console.log('FAILED:', out.filter((o) => !o.ok).map((o) => o.n));
  console.log('\n📋 Paste the WARM TIMING line into STATE.md — it is what the open');
  console.log('   cold-start ruling (finding R2) has been waiting on.');
  console.log('\n🧹 Cleanup (SQL editor, service role) — removes ONLY this run’s rows:');
  console.log(`   delete from section_checks
    where activity_id = '${ACT}'
      and created_at > now() - interval '30 minutes';`);
})();
