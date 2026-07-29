// Paste into the browser console on the signed-in app (localhost:5173 or
// activity-platform.pages.dev). Verifies the get-activity CONTENT branch.
//
// Paste EITHER the bare UUID or any URL containing it. Safe to re-run.

(async () => {
  const INPUT = 'PASTE-UUID-OR-URL-HERE';

  const BASE = 'https://dtqutpdplefmufrrakxs.supabase.co/functions/v1/get-activity';

  const id = (INPUT.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  ) || [])[0];
  if (!id) return console.error('No UUID found in INPUT.');

  const k = Object.keys(localStorage).find(
    (x) => x.startsWith('sb-') && x.endsWith('-auth-token'),
  );
  if (!k) return console.error('No Supabase session — signed in on this origin?');
  const token = JSON.parse(localStorage.getItem(k)).access_token;
  const auth = { Authorization: `Bearer ${token}` };
  const get = (u) => fetch(u, { headers: auth, cache: 'no-store' });

  console.log('activity', id);

  // 1. RESOLVE
  const r1 = await get(`${BASE}?activity_id=${id}`);
  const resolved = await r1.json();
  console.log('1. RESOLVE', r1.status, '|', r1.headers.get('cache-control'), resolved);
  if (!r1.ok) return console.error('resolve failed — stopping');
  const CONTENT = `${BASE}?activity_id=${id}&version_id=${resolved.version_id}`;

  // 2. CONTENT
  const r2 = await get(CONTENT);
  const wire = await r2.text();
  console.log('2. CONTENT', r2.status, '|', r2.headers.get('cache-control'), '|', wire.length, 'bytes');

  // 3. LEAK SCAN — every probe must be false
  console.log('3. LEAK SCAN (all must be false):');
  const probes = [
    '"answer"', '"acceptableAnswers"', '"correct"', '"solution"', '"rubric"',
    '"key"', 'mistakeFeedback', 'noSolutionCorrect', 'correctPoints',
    'correctInterval', '"models"', '"domains"', '"regions"', '"inequalities"',
    '"rays"', '"segments"', '"tolerance"', 'partialCredit', 'builtinFeedback',
  ];
  const leaked = probes.filter((p) => wire.includes(p));
  for (const p of probes) console.log('   ', wire.includes(p) ? '❌' : '✅', p);
  console.log(leaked.length ? `   >>> ${leaked.length} LEAK(S): ${leaked}` : '   >>> clean');

  // 3b. POSITIVE CONTROL — allowNoSolution MUST survive (registry says so).
  //     If this is false, the sanitizer is over-stripping, which a leak scan
  //     alone would never catch.
  console.log('3b. allowNoSolution present (must be TRUE):', wire.includes('allowNoSolution'));

  // 4. STALE VERSION
  const r4 = await get(`${BASE}?activity_id=${id}&version_id=11111111-1111-4111-8111-111111111111`);
  console.log('4. STALE', r4.status, await r4.json());

  // 5. ORDERING SERVE-SHUFFLE — the one behavior the server-side cache scan
  //    cannot show (the cached artifact holds AUTHORED order; the permutation
  //    is applied per request, seeded by version + user).
  const doc = JSON.parse(wire).activity;
  const blocks = doc.sections.flatMap((s) =>
    s.rows.flatMap((r) => r.columns.flatMap((c) => c.blocks)),
  );
  const ordering = blocks.filter((b) => b.type === 'ordering');
  if (!ordering.length) {
    console.log('5. SHUFFLE — no ordering block in this activity, skipped');
  } else {
    const textOf = (o) =>
      o.items.map((i) => (i.content || []).map((n) => n.text || '').join('')).join(' ');
    const served = textOf(ordering[0]);
    const r5 = await get(CONTENT);
    const again = textOf(
      JSON.parse(await r5.text()).activity.sections
        .flatMap((s) => s.rows.flatMap((r) => r.columns.flatMap((c) => c.blocks)))
        .filter((b) => b.type === 'ordering')[0],
    );
    console.log('5. SHUFFLE served order :', served);
    console.log('   second fetch        :', again);
    console.log('   stable across fetches (must be TRUE):', served === again);
    console.log('   >>> paste the served order back to Claude to compare vs authored');
  }
})();
