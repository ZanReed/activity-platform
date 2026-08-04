// =============================================================================
// verify-analytics-e2e.js — the LIVE verification of the S7 analytics surface
// -----------------------------------------------------------------------------
// Paste into the browser console on https://activity-platform.pages.dev while
// SIGNED IN as a teacher with at least one PUBLISHED activity. Self-contained:
// it reads the session from localStorage and the publishable key out of the app
// bundle, so there is nothing to fill in.
//
// Run it AFTER `pnpm deploy:get-activity` (which must keep --no-verify-jwt —
// the 3.2A meta branch calls that function with no Authorization header).
//
// WHY THIS EXISTS when the unit suites and verify-0026.sql are both green: it
// covers the layer neither can reach — the DEPLOYED function with the DEPLOYED
// bundle, a real session JWT over real HTTP, and PostgREST's own view of the
// RPC's grants. S4's equivalent probe earned its keep by catching a bug every
// local test missed (the client read `body.code` while the shared cors helper
// nests it at `details.code`), and the deploy-flag class of failure — a
// redeploy silently re-enabling verify_jwt — is invisible from anywhere else.
//
// ⚠ SIDE EFFECTS: none that need cleaning. Reads are reads; a census row, if
// one gets written, is derived data this system wants anyway (that is the whole
// point of the slice). Section E deliberately deletes ONE read-cache row to
// force a cache miss — the next read regenerates it, so the "damage" is one
// extra upgrade+sanitize. Unlike verify-check-e2e.js, this leaves no junk rows.
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

  const H = (extra) => ({
    Authorization: `Bearer ${jwt}`,
    apikey,
    'Content-Type': 'application/json',
    ...extra,
  });
  const READ = `${SUPA}/functions/v1/get-activity`;
  const RPC = (fn) => `${SUPA}/rest/v1/rpc/${fn}`;

  const analytics = (activityId) =>
    fetch(RPC('get_activity_analytics'), {
      method: 'POST',
      headers: H(),
      body: JSON.stringify({ p_activity_id: activityId }),
    }).then(async (r) => ({ status: r.status, json: await r.json().catch(() => ({})) }));

  // ================= A. The read path still works ============================
  // The handler changed on the cache-miss path, so the FIRST thing to prove is
  // that a normal read is unaffected. An analytics side-channel that breaks the
  // student read would be a catastrophic trade.
  const mine = await fetch(
    `${SUPA}/rest/v1/activities?select=id,title&status=eq.published&deleted_at=is.null&limit=1`,
    { headers: H() },
  ).then((r) => r.json());
  const ACT = mine?.[0]?.id;
  if (!ACT) return console.error('No PUBLISHED activity on this account — publish one, then re-run.');
  info(`activity ${ACT} — "${mine[0].title}"`);

  const resolved = await fetch(`${READ}?activity_id=${ACT}`, { headers: H() }).then((r) => r.json());
  const VERSION = resolved.version_id;
  rec('A1 resolve returns the current version', !!VERSION, VERSION);

  const contentRes = await fetch(`${READ}?activity_id=${ACT}&version_id=${VERSION}`, {
    headers: H(),
  });
  const content = await contentRes.json();
  rec(
    'A2 content read still serves a document (200 + sections)',
    contentRes.status === 200 && content?.activity?.sections?.length > 0,
    `status ${contentRes.status}`,
  );

  // A3. The analytics tables must not bleed into the student wire. The census
  // is server-side bookkeeping; a student's response should look identical to
  // before this slice.
  const wire = JSON.stringify(content);
  rec(
    'A3 no census/analytics field reached the served document',
    !/census|analytics_job|item_map/i.test(wire),
    `${wire.length} bytes scanned`,
  );

  // ================= B. The RPC is reachable and shaped ======================
  const own = await analytics(ACT);
  const ok = own.status === 200 && own.json && typeof own.json === 'object';
  rec('B1 get_activity_analytics answers the owner', ok, `status ${own.status}`);
  if (!ok) {
    console.error('Payload:', own.json);
    return console.error('Stopping — is 0026 applied? (run scripts/verify-0026.sql section 0)');
  }
  const payload = own.json;
  const fields = ['activity_id', 'current_version_id', 'censused', 'keys', 'totals', 'job'];
  rec(
    'B2 payload carries the documented shape',
    fields.every((f) => f in payload),
    `keys: ${Object.keys(payload).join(', ')}`,
  );
  info(`censused=${payload.censused} · keys=${payload.keys?.length ?? 0} · checks=${payload.totals?.checks ?? 0}`);
  info(
    payload.job
      ? `maintenance last ran ${payload.job.last_run_at} (${payload.job.section_check_rows} checks stored)`
      : 'maintenance job has NEVER run — schedule the cron (see 0026 section 5)',
  );

  // ================= C. Refusal, over real HTTP ==============================
  // The SQL matrix proves the gate inside the database; this proves PostgREST
  // exposes it the same way to a real signed-in caller.
  const stranger = await analytics('00000000-0000-4000-8000-000000000000');
  rec(
    'C1 an activity that is not mine is refused',
    stranger.status >= 400 && /not available/i.test(JSON.stringify(stranger.json)),
    `status ${stranger.status} :: ${JSON.stringify(stranger.json).slice(0, 60)}`,
  );

  // C2. Anonymous cannot call it at all (grant, not just gate).
  const anon = await fetch(RPC('get_activity_analytics'), {
    method: 'POST',
    headers: { apikey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_activity_id: ACT }),
  });
  rec('C2 anonymous is refused by the grant', anon.status >= 400, `status ${anon.status}`);

  // ================= D. Census coverage ======================================
  // A version already sitting in the read cache was never re-read through the
  // new code, so it has no census until the backfill runs. That is expected on
  // the day of the deploy and is NOT a failure — it is the reason the backfill
  // script exists.
  if (payload.censused) {
    rec('D1 the current version has a census', true, `${payload.keys.length} keys`);
    const table = payload.keys.map((k) => ({
      key: k.census_key,
      in_activity: k.block_count,
      students: k.students,
      correct_latest: `${k.correct_latest}/${k.verdicts_latest}`,
      correct_all: `${k.correct_all}/${k.verdicts_all}`,
    }));
    if (table.length) console.table(table);
    const ghost = payload.keys.find((k) => k.census_key === '_unattributed');
    if (ghost) {
      info(
        `${ghost.verdicts_all} verdict(s) are _unattributed — checks recorded against a version with no census. Run: pnpm backfill:census`,
      );
    }
  } else {
    rec(
      'D1 the current version has a census',
      false,
      'not censused yet — this version was already cached, so the new code never re-read it. Run `pnpm backfill:census`, then re-run this probe.',
    );
  }

  // ================= E. The WRITE path, live (optional) ======================
  // The only way to prove the deployed cache-fill actually writes a census is
  // to make it miss. That needs one service-role delete, so it is printed
  // rather than performed: this script holds no service-role key, by design.
  console.log('');
  console.log('--- E. To prove the live WRITE path (optional, author-side) ---');
  console.log('1. In the SQL editor (service role), force one cache miss:');
  console.log(`     delete from activity_version_reads where version_id = '${VERSION}';`);
  console.log(`     delete from activity_version_census where version_id = '${VERSION}';`);
  console.log(`     delete from activity_version_items  where version_id = '${VERSION}';`);
  console.log('2. Reload the activity in the viewer (or re-run this script).');
  console.log('3. Confirm the census came back — EXPECT one row per block kind:');
  console.log(`     select census_key, block_count from activity_version_census`);
  console.log(`     where version_id = '${VERSION}' order by 1;`);
  console.log('   ...and that the cache row was written only alongside it:');
  console.log(`     select sanitizer_rev from activity_version_reads where version_id = '${VERSION}';`);
  console.log('No cleanup needed: both rows are derived data the system wants.');

  // ================= Verdict =================================================
  const failed = out.filter((o) => !o.ok);
  console.log('');
  console.log(`=== verify-analytics-e2e: ${out.length - failed.length} PASS, ${failed.length} FAIL ===`);
  if (failed.length) console.warn('Failed:', failed.map((f) => f.n).join(', '));
})();
