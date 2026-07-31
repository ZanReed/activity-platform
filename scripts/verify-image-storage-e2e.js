// =============================================================================
// verify-image-storage-e2e.js — the LIVE half of the image-bucket verification
// -----------------------------------------------------------------------------
// Paste into the browser console on https://activity-platform.pages.dev while
// SIGNED IN AS A TEACHER who owns at least one activity. Runs the checks that
// scripts/verify-image-storage.sql structurally cannot: everything above the
// RLS predicate — that the client's session JWT actually reaches Storage, that
// the bucket's mime/size limits fire, and that the upsert/overwrite path is
// closed at the API layer (not just in policy).
//
// Self-contained: reads the session from localStorage and the publishable key
// out of the app bundle, so there is nothing to fill in and no key to paste.
//
// Companion to the SQL matrix; re-run both after any migration touching auth,
// RLS, grants, or can_edit_activity (see supabase/migrations/README.md →
// "Regression re-runs").
//
// SIDE EFFECT: T1 uploads one tiny probe PNG that CANNOT be deleted from the
// client (the bucket has no DELETE policy, by design). It is named
// `_e2e-probe-<timestamp>.png` so the future orphan-GC (TODOS.md) sweeps it.
// =============================================================================

(async () => {
  const P = (n, ok, d) => console.log(`${ok ? '✅ PASS' : '❌ FAIL'} — ${n}${d ? ' :: ' + d : ''}`);
  const URL_BASE = location.origin;
  const out = [];
  const rec = (n, ok, d) => { P(n, ok, d); out.push(ok); };

  // ---- session + apikey -----------------------------------------------------
  const sk = Object.keys(localStorage).find(k => /^sb-.*-auth-token$/.test(k));
  if (!sk) return console.error('Not signed in (no Supabase session in localStorage). Sign in first.');
  const sess = JSON.parse(localStorage.getItem(sk));
  const jwt = sess.access_token || sess?.currentSession?.access_token;
  if (!jwt) return console.error('Session found but no access_token — sign out and back in.');

  const bundleSrc = [...document.querySelectorAll('script[src]')].map(s => s.src).find(s => /assets\/index-/.test(s));
  const bundle = await fetch(bundleSrc).then(r => r.text());
  const apikey = (bundle.match(/sb_publishable_[A-Za-z0-9_-]+/) || bundle.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/) || [])[0];
  const SUPA = (bundle.match(/https:\/\/[a-z]+\.supabase\.co/) || [])[0];
  if (!apikey || !SUPA) return console.error('Could not read apikey / project URL from the bundle.');

  const H = extra => ({ Authorization: `Bearer ${jwt}`, apikey, ...extra });
  const post = (path, body, hdrs) =>
    fetch(`${SUPA}/storage/v1/object/activity-images/${path}`, { method: 'POST', headers: H(hdrs), body })
      .then(async r => ({ status: r.status, body: await r.text() }));

  // ---- discover an activity THIS user owns (RLS returns only theirs) --------
  const mine = await fetch(`${SUPA}/rest/v1/activities?select=id&deleted_at=is.null&limit=1`, { headers: H() }).then(r => r.json());
  const ACT = mine?.[0]?.id;
  if (!ACT) return console.error('No activity owned by this account — create one, then re-run.');
  console.log(`fixture: activity ${ACT}`);

  const png = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], { type: 'image/png' });
  const probeKey = `${ACT}/_e2e-probe-${Date.now()}.png`;

  // T1 — the one that matters: does storage-js's session JWT reach Storage and
  // satisfy the policy? (The assumption class that failed once on functions.invoke.)
  const t1 = await post(probeKey, png, { 'Content-Type': 'image/png' });
  rec('T1 owner upload allowed (session JWT reaches Storage)', t1.status === 200, `HTTP ${t1.status} ${t1.body.slice(0, 120)}`);

  // T2 — public read with NO token, exactly what <img src> does.
  const pub = `${SUPA}/storage/v1/object/public/activity-images/${probeKey}`;
  const t2 = await fetch(pub, { cache: 'no-store' });
  rec('T2 public read works tokenless', t2.status === 200 && (t2.headers.get('content-type') || '').startsWith('image/'),
      `HTTP ${t2.status} content-type=${t2.headers.get('content-type')} cache-control=${t2.headers.get('cache-control')}`);

  // T3 — same key again, no upsert: a duplicate must be refused.
  const t3 = await post(probeKey, png, { 'Content-Type': 'image/png' });
  rec('T3 duplicate key refused (upsert:false semantics)', t3.status !== 200, `HTTP ${t3.status} ${t3.body.slice(0, 120)}`);

  // T4 — THE OVERWRITE TEST: upsert:true on an existing object needs an UPDATE
  // policy, which deliberately does not exist. Must fail.
  const t4 = await post(probeKey, png, { 'Content-Type': 'image/png', 'x-upsert': 'true' });
  rec('T4 upsert/overwrite blocked (no UPDATE policy)', t4.status !== 200, `HTTP ${t4.status} ${t4.body.slice(0, 140)}`);

  // T5 — bucket mime allowlist, bypassing the client-side guard entirely.
  const t5 = await post(`${ACT}/_e2e-probe-${Date.now()}.txt`, new Blob(['x'], { type: 'text/plain' }), { 'Content-Type': 'text/plain' });
  rec('T5 disallowed mime rejected by bucket', t5.status !== 200, `HTTP ${t5.status} ${t5.body.slice(0, 140)}`);

  // T6 — bucket size limit (11 MB > the 10 MB cap), also bypassing the client.
  const big = new Blob([new Uint8Array(11 * 1024 * 1024)], { type: 'image/png' });
  const t6 = await post(`${ACT}/_e2e-probe-${Date.now()}-big.png`, big, { 'Content-Type': 'image/png' });
  rec('T6 oversize rejected by bucket', t6.status !== 200, `HTTP ${t6.status} ${t6.body.slice(0, 140)}`);

  // T7 — an activity this user does NOT own: the policy's whole point.
  const t7 = await post(`${crypto.randomUUID()}/_e2e-probe.png`, png, { 'Content-Type': 'image/png' });
  rec('T7 upload to a non-owned activity denied', t7.status !== 200, `HTTP ${t7.status} ${t7.body.slice(0, 140)}`);

  // T8 — malformed key: must be a clean denial, never a 500 (the D1 CASE pin,
  // observed at the API layer this time).
  const t8 = await post(`garbage-not-a-uuid/_e2e-probe.png`, png, { 'Content-Type': 'image/png' });
  rec('T8 non-uuid key denied cleanly (no 5xx)', t8.status !== 200 && t8.status < 500, `HTTP ${t8.status} ${t8.body.slice(0, 140)}`);

  console.log(`\n=== ${out.filter(Boolean).length}/${out.length} PASS ===`);
  console.log(`orphan left behind (expected, no DELETE policy): ${probeKey}`);
})();
