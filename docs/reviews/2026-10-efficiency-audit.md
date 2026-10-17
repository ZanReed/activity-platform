# Efficiency audit — 2026-10

**Report only. This audit changed nothing in the repo; this file is the only addition.** Cloud session, started from `main` at
`e0ca64ae`. Prompt: [2026-10-efficiency-audit-prompt.md](2026-10-efficiency-audit-prompt.md).
Measured input: [2026-10-18-live-perf-baseline.md](2026-10-18-live-perf-baseline.md).

## How this was done

- **First pass, four areas:** database (migrations 0001–0063), client data flow
  (`packages/app`, `packages/viewer`), rendering, and Edge Functions plus the
  service worker. The author of this report also ran the load side
  (`pnpm build`, `node scripts/check-perf-budget.mjs`) and the Playwright perf
  stub lane.
- **Refutation pass:** every candidate went to a separate reviewer whose only
  job was to refute it. Each reviewer read the caller rather than just the
  definition, looked for a later `create or replace`, checked DECISIONS, TODOS
  and the design docs, and re-measured where possible. Candidates that did not
  survive are not in the main list.
- **How the measurements were taken (none of the harnesses is committed):**
  - **SQL:** a throwaway local Postgres **16** cluster. PG17 was not installed.
    The planner behaviour relied on here is the same in 16 and 17: SET or
    DEFINER functions are not inlined, a CTE read twice is materialised, and
    DISTINCT ON quals are not pushed down. The cluster held a minimal copy of
    `section_checks` with its 0020 columns and indexes, plus function bodies
    copied verbatim from the migrations, seeded with `generate_series`.
    Absolute times are a laptop-class host, not Supabase compute. **The growth
    shapes are what to trust.**
  - **React and ProseMirror:** vitest plus jsdom, React dev mode, with
    counting wrappers, MutationObserver and the React Profiler. jsdom DOM
    operations are roughly 5–10× slower than Chrome, and dev React roughly 3–4×
    slower than prod. Each finding gives the raw number and an estimate for a
    real browser.
  - **Bundles:** node 22 `import()` timing over 5 fresh processes.
- **Live data has one student.** Every growth claim below comes from the code
  and from seeded rows, not from traffic.

**0063 confirmed.** After 0063 no user path scans `pg_timezone_names`:
`fact_class_zone`, `users_timezone_guard` and `recompute_check_rollup_days`
all go through `iana_zone_is_valid`, which checks the table first. Two ways
in remain:

- Its own fallback, for a zone name the table does not hold. That one is
  deliberate; see the appendix for the abuse angle.
- PostgREST's schema-cache reload, which is not app code.

Not re-filed.

## Scenarios

| | Scenario |
|---|---|
| **S1** | A student opens `/a/:id` on a 4× throttled Chromebook over slow 4G. |
| **S2** | A student checks a section, or opens daily practice. |
| **S3** | A teacher opens progress or first tries for a class of 30 on a 60-block activity. |
| **S4** | A teacher types in a long activity. |
| **S5** | 10 teachers × 5 classes × 30 students (1,500 students) over a term. |

---

## Main list (15), ranked by user-noticeable impact

### 1. Opening daily practice gets slower with the square of the number of days the student has practised

- **Where:** `supabase/migrations/0050_fact_sprint.sql:824-826` (`fact_sprint_entry`, the `v_best` query) calling `fact_sprint_score` (0050:690-716). Neither is redefined after 0050.
- **What + why it's slow:**
  - `v_best` runs `cross join lateral fact_sprint_score(s.id)` once for every finished session the student has.
  - `fact_sprint_score` is SQL with `SET search_path` and DEFINER, so it is never inlined. Each call rescans all of the student's sessions and attempts in the class and judges every attempt again, through `fact_attempt_judgment`, which is also not inlinable and expands jsonb per call.
  - `max(quick_right)` over all sessions is just the max of a single scored pass, so the outer loop is pure repetition.
  - `FactsEntry.tsx:133` calls the entry on open and again on Start (`:191`), so a practice pays it twice. `save_sprint_attempts` (0050:1092) pays one S·A score on every answer save.
- **Who notices:** the student, in S2, waiting on the daily-practice entry screen. It grows over the school year.
- **Growth:** sessions² × attempts per session, per student and class. S is bounded by retention (`keep_until`, at most about a school year).
- **Evidence:** measured on local PG16 with 1 student, 40 attempts per session and 6 families:

  | Finished sessions | `v_best` query |
  |---|---|
  | 60 | **1.58 s** |
  | 180 | **13.97 s** |

  One `fact_sprint_score` call at 180 sessions takes 78 ms. Live today shows S≈1, so it is invisible.
- **Confidence:** high. The only thing that would change it is a tzdata/TOAST effect on absolute time; the growth shape stays.
- **How to prove it here:**
  1. Seed one student with 150–180 finished `sprint_sessions` × 40 `sprint_attempts` in a practice-on class on the local stack.
  2. As that student (`set request.jwt.claims`, `set role authenticated`), run `explain analyze select fact_sprint_entry('<code>')`.
  3. Compare with `select max(quick_right) from fact_sprint_score('<one session id>')`.
- **Size:** quick fix. One grouped `scored` pass gives `best` and this session's score.
- **Survived refutation because:** the reviewer re-derived the latest definitions, confirmed the double call from `FactsEntry`, and measured the curve. practice-blocks.md §7 only sized the probe (about 900 rows), never the sprint history.

### 2. The class progress grid is quadratic in students × assigned activities

- **Where:** `supabase/migrations/0061_class_progress.sql:147-195` (`class_progress`, the cell CTE), over `per_version` (0061:95-103), which is materialised because it is read 5 times. Called from `ClassProgress.tsx` on every open and Refresh.
- **What + why it's slow:**
  - For each roster × activity cell there are two `exists (… from per_version …)` checks, a scalar `max(last_at)` subquery and a `left join lateral … order by … limit 1` (`shown`). EXPLAIN shows each as a plain per-row SubPlan over an unindexed CTE Scan, not a hashed SubPlan; the correlated `activity_version_id <> current_version_id` prevents hashing.
  - So every cell scans all of `per_version`.
  - `checks` also selects `sc.*`, so `responses` rides through the `latest` sort. That spilled 21.7 MB at 60k rows with `work_mem` 4 MB.
- **Who notices:** the teacher, in S3. The class page gets slower as the term's assignments pile up.
- **Growth:** (students × assigned activities)².
- **Evidence:** measured on local PG16 with the function body verbatim, 5 sections, 2 attempts and 2 versions per activity, JIT off:

  | Students × activities | Total | Of which correlated pieces |
  |---|---|---|
  | 30 × 25 | **295 ms** | ~120 ms. Matches the design doc's 173 ms figure. |
  | 30 × 50 | **1,029 ms** | ~480 ms |
  | 30 × 100 | **3,614 ms** | ~3.1 s (`shown` alone 954 ms) |
  | 60 × 50 | **3,767 ms** | — |
- **Confidence:** medium-high. Real document sizes change the constant (see the `hand` walk under "Looked at"), not the shape.
- **How to prove it here:**
  1. Seed 30 users × 100 activities × 2 versions × 5 sections × 2 attempts in one class.
  2. Run `explain analyze` on the body with `p_class_id` inlined. Look for `SubPlan` nodes and `Subquery Scan on shown` with loops equal to the cell count and Rows Removed ≈ |per_version|.
  3. Also run `show jit;` on live. Locally, JIT doubled the time at 30 × 50 (2.37 s vs 1.07 s), because four cross-joined `jsonb_array_elements` estimates push plan cost past `jit_above_cost`.
- **Size:** quick fix. One `group by (student, activity)` with `bool_or`/`max`, plus `distinct on` for the shown version, joined by hash. Keep the verify-0061 agreement rows.
- **Survived refutation because:** reproduced verbatim. The design's perf section (class-progress-view.md:258) assumed about 30 × 20 and never measured past that.

### 3. Activity analytics sorts every check on the platform, three times per page open (a regression)

- **Where:**
  - The view `section_checks_latest` (`0035_check_prune_disarmed.sql:59-62`, `select distinct on (student_id, activity_version_id, section_id) * from section_checks`).
  - It is read by `get_activity_analytics` at `0036_check_rollup.sql:695, 750, 753`, each read filtered `where activity_id = p_activity_id`.
  - Caller: `ActivityAnalytics.tsx:139`, on mount.
- **What + why it's slow:**
  - Postgres pushes a qual into a DISTINCT ON subquery only when the qual uses DISTINCT ON columns. `activity_id` is not one of them.
  - So each of the three reads runs a Seq Scan plus Sort/Unique over all of `section_checks`, for every teacher and activity, and only then filters.
  - 0026:321-331 used an activity-scoped CTE; 0036 swapped it for the view.
- **Who notices:** the teacher, in S3/S5, on the analytics page. It is invisible at 14 rows.
- **Growth:** total platform checks, whatever the activity's size. Nothing deletes checks while the prune is disarmed.
- **Evidence:** measured on local PG16 with 160k rows across 500 activities:
  - Through the view: **296 ms per read**, with a Seq Scan, a 14 MB external-merge sort, and 79,840 rows removed above it.
  - The same DISTINCT ON filtered inside: **0.58 ms**, through a bitmap scan on `section_checks_activity_idx`.
  - There are three reads per call.
- **Confidence:** high.
- **How to prove it here:** `explain (analyze, buffers) select count(distinct student_id) from section_checks_latest where activity_id = '<id>';` after seeding about 100k checks across a few hundred activities. Look for a filtered Subquery Scan above a full Sort/Unique.
- **Size:** quick fix. Filter on a DISTINCT ON key, which is pushable (`activity_version_id = any(array(select id from activity_versions where activity_id = p_activity_id))`), or inline an activity-filtered CTE as `list_grading_queue` does (0034:488). The prune keeps the view, and the verify-0035 §C(H) bond still holds.
- **Survived refutation because:** reproduced on a real planner. DECISIONS:949 records why the view exists, not its cost.

### 4. Direct client reads under OR'd RLS scan the whole platform table, with a DEFINER call per row (student Home included)

- **Where:**
  - `packages/app/src/lib/classes.ts:318-323` (`listMyClasses`, the student Home via `Home.tsx:229`): `class_members` filtered only on `removed_at is null`. Its policies are self OR `is_class_teacher(class_id)` (0014:185-189; helper latest at 0027:119).
  - `classActivities.ts:70-74` (`listTeacherClassActivities`): `class_activities` with no filter. Its policy is `is_class_member(class_id) or is_class_teacher(class_id)` (0030:72-74).
  - `classes.ts:109-114` (`listClasses`): the same pattern on `classes` (0014:156-160).
- **What + why it's slow:**
  - The client sends no sargable predicate, and an OR whose arm is a function call cannot use the `student_id`/`teacher_id` index.
  - So each read seq-scans the whole table and calls a non-inlinable DEFINER helper for every row that is not the caller's.
- **Who notices:** the student on every Home load (S1/S5), and teachers on Classes, AddToClass, ChainHooks and PublishStatus. It grows with the whole platform, not with one school.
- **Growth:** total rows platform-wide.
- **Evidence:** measured on local PG16 with 52k users, 2k classes, 50k memberships and 80k class_activities, impersonating a student or teacher:

  | Read | Time | Plan |
  |---|---|---|
  | `listMyClasses` | **282 ms** | Seq Scan, 49,999 rows removed, `is_class_teacher` per row |
  | `listTeacherClassActivities` | **838 ms** | two DEFINER calls per row |
  | `listClasses` | 9.7 ms | only 2k rows, so it is fine |
- **Confidence:** high on the plan, low on today's impact. S5 alone (1,500 memberships) is tens of ms.
- **How to prove it here:** seed 50k `class_members`, then `set role authenticated; set request.jwt.claims='{"sub":"<student>"}'; explain analyze select class_id from class_members where removed_at is null;`. Look for "Seq Scan … Rows Removed by Filter ≈ N".
- **Size:** quick fix. Add `.eq('student_id', uid)` / `.eq('teacher_id', uid)` on the client, so the index drives the scan and the policy only sees the caller's rows. Use `.in('class_id', mine)` or an RPC for `class_activities`.
- **Survived refutation because:** this is not the cost DECISIONS:426 accepted. That ruling accepted "one short-circuiting extra check per row", which is true per row. This finding is about which rows get scanned, and merging the two policies would not fix it. `class_activities` was never assessed. (The PublishStatus `.eq('activity_id')` part was narrowed: that filter is leakproof and runs before the policy, so only the plain seq scan on the unindexed column is left, which the advisor has already listed.)

### 5. Student viewer: every keystroke in a blank re-renders every block in the activity

- **Where:**
  - `packages/viewer/src/container/ViewerContainer.tsx:238`: `useSyncExternalStore(store.subscribe, store.getState, …)` over the whole state.
  - `container/context.tsx:87-127`: `ViewerProvider` puts the whole `state` in one context value, which 14 block types read via `useViewer()`.
  - `store/store.ts:315-319`: `setResponse` builds a new root state per keystroke.
- **What + why it's slow:**
  - Each keystroke makes a new root object, so the container re-renders, every `BlockSlot` and block re-renders (static paragraphs, callouts and worked examples included), and so does every context consumer.
  - Nothing remounts (KaTeX HTML is cached in `useState`, and graph-kit mounts are keyed on `[block.id, mode]`), so the cost is pure reconciliation.
  - The route level already does this right: `StudentViewer.tsx:588` selects a single number.
- **Who notices:** the student, in S1/S2, typing in a long worksheet on a throttled Chromebook.
- **Growth:** per block, per keystroke.
- **Evidence:** measured in vitest/jsdom on a 60-block document built from the sanitized fixture:
  - **60.0 block renders per keystroke**, 25.4 ms Profiler time (React dev).
  - Estimated about 6–8 ms in prod on a desktop and about 25–30 ms of input lag at a 4× CPU throttle.
  - The `structuredClone` of responses is negligible (0.02 ms).
- **Confidence:** high on the mechanism, medium on how much a student feels it.
- **How to prove it here:** a profiling build, React DevTools Profiler on `/a/:id` with a long activity, type 5 characters in one blank. Every block appears in each commit. For input-to-paint, take a Chrome Performance trace at 4× CPU.
- **Size:** its own small arc. Memoising `BlockSlot` alone does nothing, because the whole-state context re-renders every consumer anyway. The fix is per-item selector hooks, which touch the 14 `useViewer()` call sites.
- **Survived refutation because:** the reviewer confirmed both channels (the store subscription and the context). Nothing in TODOS covers render cost; TODOS ~1579 is about auto-check.

### 6. Number-facts reads judge the whole class, then keep one student, several times per request

- **Where:**
  - `fact_probe_judged(p_probe_id)`: defined at 0045:325, never redefined. SQL with DEFINER and SET, so it is not inlined. It judges every session in the probe.
  - Callers that filter afterwards: `fact_sprint_log` (0050:252, a lateral per probe) and `fact_sprint_families` (0050:343).
  - Call fan-out: `fact_sprint_build` calls `families` and `state`, `state` calls `families` again, and a start calls `families` a third time (0050:448, 549, 552, 893). So `fact_sprint_log` runs 3–4 times per entry.
  - `fact_sprint_overview` (0051:68) runs `families` once per member.
- **What + why it's slow:** every time one student's view is wanted, the whole class is judged, for every probe, and it is recomputed several times inside one request.
- **Who notices:**
  - S2: the student's practice entry, adding to finding 1.
  - S3: the teacher's number-facts page, which loads the overview once per `SprintPanel` mount, with no polling.
- **Growth:**
  - Entry: class size × probes × about 4.
  - Overview: students² × probes × probe items.
- **Evidence:** measured on local PG16 with 30 students, 15 closed probes and 55 items:
  - One `fact_probe_judged` call: 10.8 ms for 1,650 rows.
  - The log's check half for one student: 90 ms.
  - Extrapolated: entry about 0.3–0.4 s of judging; overview about 30 × 100 ms ≈ **3 s**.
  - Correction from refutation: the `checked` lateral is Memoized (10 hits, 1 miss), so it does not run once per family.
- **Confidence:** high on the mechanism, medium on size, which depends on probe item counts.
- **How to prove it here:** seed the class above, then as the teacher run `explain analyze select fact_sprint_overview('<class>')`, and as a student run `fact_sprint_entry`.
- **Size:** its own arc. It needs a per-session or per-student judged variant, or one judged CTE passed down, and it must keep the verify-0050 §B judgment bond between 0045 and 0050.
- **Survived refutation because:** measured. The `fact_probe_entry` (0047:649) caller was dropped as minor, since it is a single class-wide call.

### 7. Editor: every keystroke rebuilds every insert-zone widget after the caret

- **Where:** `packages/app/src/editor/extensions/InsertZones.ts:114`: `key: \`insert-zone-${kind}-${pos}\``. The decorations are rebuilt from scratch in `props.decorations` (`:102-126`).
- **What + why it's slow:**
  - ProseMirror reuses a widget only when `spec.key` matches (`prosemirror-view` `WidgetType.eq`, `placeWidget`). Typing one character shifts the position of every zone after the caret, so their keys all change and ProseMirror destroys and rebuilds each zone's DOM.
  - The header comment (`:18-21`, `:110-113`) says nothing churns on a keystroke. That is false for any edit that is not at the end, which also makes it a P11 claim.
- **Who notices:** the teacher, in S4, typing near the top of a long activity.
- **Growth:** per block below the caret, per keystroke.
- **Evidence:** measured with a headless Tiptap editor and the real `buildEditorExtensions()`, typing at the top, averaged over 100 keystrokes:

  | Blocks | pos in key | ordinal key | extension off | zone nodes recreated per keystroke |
  |---|---|---|---|---|
  | 60 | **7.1 ms** | 0.38 ms | 0.25 ms | 62 vs 0 |
  | 200 | **19.2 ms** | 0.52 ms | 0.23 ms | 202 vs 0 |

  - The mounted React `<Editor>` at 60 blocks: 16–22 ms per keystroke at the top vs 9.5–12 ms at the end.
  - jsdom inflates DOM cost, so in Chrome expect about 1 ms per keystroke at 60 blocks and 2–4 ms at 200 on a desktop, and about 4× that on a Chromebook. Style and layout invalidation come on top.
- **Confidence:** high on the mechanism, medium on the size in a real browser.
- **How to prove it here:** in the editor console, paste
  `let n=0;new MutationObserver(r=>r.forEach(m=>m.addedNodes.forEach(x=>x.classList?.contains('editor-insert-zone')&&n++))).observe(document.querySelector('.ProseMirror'),{childList:true,subtree:true})`,
  then type 10 characters in the first block. `n` comes out at about 10 × the zone count.
- **Size:** quick fix, with one trap. `buildZone` captures `pos` in its click closure (`:60-65`), so a stable key needs the position worked out at click time (`getPos` or `view.posAtDOM`). Otherwise clicks insert at a stale position.
- **Survived refutation because:** the reviewer verified ProseMirror's key comparison in source and isolated the key as the sole cause (ordinal key = 0 nodes recreated).

### 8. Responses page: every grade save reloads the whole queue and downloads every version's full document again

- **Where:** `packages/app/src/routes/ActivityResponses.tsx:171-205` (`load`), passed as `onSaved={load}` at `:436`.
  - It is awaited after save, confirm, reject and release (`:600, :607, :636, :649`) and by `releaseAll` (`:268`).
  - `fetchVersionRubrics` (`lib/gradingAssist.ts:96-104`) runs `.from('activity_versions').select('id, content')`.
- **What + why it's slow:**
  - Each save runs `list_grading_queue` (every row, including `response_text`), then suggestions, assist status, and the full raw `content` of every version in the queue, just to read rubric criteria.
  - Versions are immutable, so that download is pure repetition.
  - The Save button waits for all of it.
  - `setLoading(true)` (`:173`) also unmounts the queue and the open panel, because `:301` renders only when `!loading`. See the appendix for the visible consequence.
- **Who notices:** the teacher, grading essays, on every Save.
- **Growth:** per save × queue size × document size. A grading session is roughly quadratic: 60 saves × 60 rows plus the content.
- **Evidence:** argued from code; the request sequence was confirmed by a second reader.
- **Confidence:** high.
- **How to prove it here:** DevTools Network, filter `rest/v1`, save one grade. Expect `upsert_check_grade`, then `list_grading_queue`, `list_grade_suggestions`, `get_grading_assist_status`, and `activity_versions?select=id,content`. Note that last request's size, and the time until the button re-enables.
- **Size:** quick fix. Cache rubrics by version id, patch or re-read only the saved row, and keep the assist half out of the awaited path.
- **Survived refutation because:** confirmed and found worse (the panel unmount). Not in TODOS or the design docs.

### 9. Student open: every reopen still pays a content round trip and a CORS preflight, though the device already holds the document

- **Where:**
  - `packages/viewer/src/client/readClient.ts:192-212` (`load`: `resolve`, then always `fetchContent`), with `Authorization` sent from `:96-106`.
  - `StudentViewer.tsx:243` already saves each served document per user and version (`saveCachedDocument`), but `load()` never consults it.
  - `supabase/functions/_shared/cors.ts:31`.
- **What + why it's slow:**
  - `Authorization` is not a CORS-safelisted header, so every resolve and content GET is preflighted.
  - Chromium caches preflights per URL, in memory, for at most 2 h; `Max-Age: 86400` is clamped to 7200. The preflight runs before the HTTP-cache lookup.
  - So a reopen after 2 h or a browser restart costs OPTIONS + resolve, then OPTIONS + content (body from disk cache). That is about 3 serial round trips before the math preload can start.
  - The function answers OPTIONS itself (`handlePreflight`), so each preflight is very likely a billed invocation and may be a cold start.
  - Seeded activities are served `no-store` and pay full content on every open.
- **Who notices:** the student, in S1, on slow 4G (about 150–300 ms per round trip). Also running cost under S5: about 40% of get-activity invocations are estimated to be preflights.
- **Growth:** per open × distinct activity/version.
- **Evidence:** argued from the Fetch spec and Chromium's preflight cache; not measured live. Second reader confirmed `fetchMeta` (no headers, so not preflighted) and that check-activity is one fixed URL, so checks pay one preflight per 2 h, not one per check.
- **Confidence:** medium-high on the mechanism, medium on the billing.
- **How to prove it here:**
  1. DevTools Network with preflight rows visible, open `/a/:id`, and see OPTIONS before each get-activity GET.
  2. Reopen after a browser restart. The content GET says "(disk cache)", but its OPTIONS still goes out.
  3. Dashboard → Edge Functions → get-activity → Logs: OPTIONS rows there prove billing.
- **Size:** quick fix for the decision-compatible part: when the resolved `versionId` matches the device's saved document, skip `fetchContent`. That removes one preflight and one round trip from every non-seeded reopen. Merging resolve and content is a separate question; see "Challenges a decision".
- **Survived refutation because:** narrowly. The reviewer corrected the scope (meta and checks are not per-URL) and found the localStorage shortcut, which needs no ruling.

### 10. `class_misconceptions` carries every answer through two sorts and a materialised per-item CTE on each class page open

- **Where:** `0061_class_progress.sql:510-708`. `ClassProgress.tsx:62` calls `fetchMisconceptions(classId)` with no activity, in parallel with the grid.
  - `checks` (0061:562) runs two window functions with different orders over full rows, including `responses` and `verdicts`.
  - `items` (0061:576) is read by both `tags` and `wrong`, so it is materialised. It holds one row per item per attempt, each carrying `c.responses`, even though `wrong` is disabled when `p_activity_id` is null.
- **What + why it's slow:** the answer maps are copied into every item row and sorted twice, only to read the misconception tags.
- **Who notices:** the teacher, in S3/S5, on every class progress open.
- **Growth:** the class's students × activities × sections × attempts × items. It is roster-scoped, not platform-wide.
- **Evidence:** measured on local PG16 with 30k checks × 10 items and 837-byte inline responses: **690 ms with `responses` vs 475 ms with `null::jsonb`**, about 45% extra. Responses over about 2 KB go to TOAST, so mid-sized answers are the worst case.
- **Confidence:** medium.
- **How to prove it here:** `explain (analyze, buffers)` on the body with `p_activity_id` NULL. Compare `CTE items` width and the WindowAgg sort memory or disk use against a copy that projects `null::jsonb as responses`.
- **Size:** quick fix: a projection. Join `responses` back by id only inside `wrong`.
- **Survived refutation because:** narrowly. The scope was corrected to roster-only, but the 45% held.

### 11. Nightly jobs seq-scan all of `section_checks`, and the rollup recomputes 30 days of every active version

- **Where:**
  - `run_analytics_maintenance` (latest at 0036:370-460): the roll window at 0036:430 and the counts at :438/:440.
  - `recompute_check_rollup_days` (latest at `0063_zone_name_lookup.sql:136-219`): `_rollup_scope`, plus `= any(p_versions)` at 0063:157/172.
  - The only `section_checks` indexes are the four at 0020:88-104, and none leads with `created_at` or `activity_version_id`.
- **What + why it's slow:**
  - The roll window by `created_at` and the per-version filters each seq-scan the whole table.
  - The recompute re-aggregates every day ≥ now − 30 for every version touched in the window, including `jsonb_each(verdicts)`. The design (check-retention-and-rollup.md item 4) and the comment at 0063:162 both say "touched (version, day)" only.
- **Who notices:** nobody yet; it is a cost. S5 background I/O on small compute.
- **Growth:** total check history (scans) plus about 30 × daily volume per active version per night.
- **Evidence:** argued from the index list and the SQL.
- **Confidence:** high on the scans. Medium on the recompute width being unintended: it also happens to cover the MVCC late-commit window, so re-check verify-0036 §G/OV-6 before narrowing it.
- **How to prove it here:** load about 1M checks over 60 days, then `explain analyze select run_analytics_maintenance()` with `auto_explain.log_nested_statements = on`. Look for seq scans on `section_checks`, and `_rollup_scope` rows ≈ versions × 30.
- **Size:**
  - Quick fix for the indexes: a BRIN on `created_at` (the table is append-only, with no UPDATE anywhere), and a btree on `activity_version_id`, which also closes the advisor's unindexed-FK finding and serves the purge's RESTRICT check.
  - Its own careful arc for narrowing the recompute.
- **Survived refutation because:** narrowly. The candidate's third part, the "redundant" `or activity_version_id in (…)` in `purge_soft_deleted`, was **refuted**: it is deliberate belt-and-braces, documented at 0022:60-64 and kept at 0050:1265-1275.

### 12. Progress answer panel re-downloads the raw version document for every student opened

- **Where:** `packages/app/src/progress/AnswerPanel.tsx:50-69` → `lib/classProgress.ts:221-237` (`fetchVersionContents`, `select('id, version_num, content')`). Also on every Refresh of `routes/ActivityProgress.tsx:69-110`.
- **What + why it's slow:**
  - Each panel open runs `class_student_work`, then content, then misconception descriptions, in sequence.
  - Content is immutable per version id, and under `/activity/:id/progress` the parent already holds the current version's document (`ActivityProgress.tsx:81`), but nothing passes it down or caches it.
- **Who notices:** the teacher, in S3, clicking through 30 students. About one extra round trip plus 15–30 KB of JSON per click.
- **Growth:** per student opened × document size.
- **Evidence:** argued from code.
- **Confidence:** high.
- **How to prove it here:** DevTools Network, filter `activity_versions`. Open student A, then B, then A again: expect 3 identical `select=id,version_num,content` responses.
- **Size:** quick fix. A module-level `Map<versionId, Promise<content>>` in `classProgress.ts`, which finding 8's `fetchVersionRubrics` can share.
- **Survived refutation because:** narrowly. The wait on `class_student_work` is unavoidable (it supplies the version ids), so only the repeat download is real.

### 13. The daily-practice waiting room runs two RPCs in series every 10 s

- **Where:** `packages/app/src/routes/FactsEntry.tsx:122-145` (`enter`: `fetchEntry`, then `fetchSprintEntry` when the probe is `none_open`/`finished`/`closed`), polled at `:158-171`.
- **What + why it's slow:**
  - `fact_sprint_entry` with `p_start` false is side-effect-free: every return before the session INSERT is on that path, and all its helpers are `stable` (0050:766-870). It also takes only `p_code`.
  - In the waiting room the state is always `none_open`, so both calls always run back to back.
- **Who notices:** the student, in S2, on entry. Running cost: up to 60 polls × 2 serial RPCs per waiting student.
- **Growth:** per waiting student × 6 per minute (capped at 10 min).
- **Evidence:** argued from code and the SQL.
- **Confidence:** medium. After 0063 the serial penalty is one PostgREST round trip, plus finding 1's cost inside the second call.
- **How to prove it here:** DevTools on `/facts/:code` in the waiting room: two `rpc/` POSTs every 10 s, the second starting only when the first ends.
- **Size:** quick fix. `Promise.all` in the poll; optionally speculative on first entry.
- **Survived refutation because:** the reviewer read the SQL and confirmed it has no side effects.

### 14. Serial DB round trips inside the Edge Functions, with no region pinning

- **Where:**
  - check-activity restore: `versionForCheck` (`packages/viewer/src/server/check-activity-handler.ts:445`), then `ownLatestChecks` (`:470`), then `readVersion` (`:493`).
  - get-activity content: `publishedActivity` (`get-activity-handler.ts:356`), then `readCache` (`:409`).
  - `supabase/config.toml` sets no function region.
- **What + why it's slow:**
  - `ownLatestChecks` is the caller-scoped `my_latest_checks` RPC. It needs only the JWT `sub` and request fields, so it can run in `Promise.all` with `versionForCheck`, saving one of the three round trips.
  - `readVersion` must stay after authorisation. That order is recorded (`:425-427`: "nothing is read until the database has said this caller may check this version").
  - Functions run in the region nearest the caller by default, so if schools are far from the DB region, every serial call pays the cross-region RTT. The check-latency ruling says its 598 ms floor is "dominated by transit and the durable write".
- **Who notices:** the student, in S2 (restore lands later; restore is non-blocking under D4). It is a server cost per open.
- **Growth:** constant per request.
- **Evidence:** argued.
- **Confidence:** medium. It depends on geography.
- **How to prove it here:** `curl -i` either function and read the edge-region response header, then compare it with the project's DB region. Time restore locally with `supabase functions serve` and `Date.now()` deltas.
- **Size:** quick fix (the `Promise.all`), plus an optional region pin. Do not parallelise get-activity's cache read: it is `--no-verify-jwt`, so a speculative service-role read before auth would let garbage tokens make the server work. The gain there is one round trip, once per device and version.
- **Survived refutation because:** narrowly. Only the restore half and the region question survived intact.

### 15. Hashed assets are probably served `max-age=0`, so worker-less visits revalidate every chunk

- **Where:** there is no `_headers` file, and no `packages/app/public/` directory. The service worker's `warmAssetCache` (`packages/app/src/lib/swRegistration.ts:171-199`) is also affected.
- **What + why it's slow:**
  - Cloudflare Pages' default for static files is `public, max-age=0, must-revalidate` with an ETag.
  - The worker's CacheFirst `/assets/` rule (`vite.config.ts:180-200`) hides this on controlled visits.
  - But the first visit, a hard reload, or a profile that blocks or clears the worker sends a conditional request (304) per asset.
  - `warmAssetCache` `cache.add()`s every asset on visit 1 under the premise that "the browser's own HTTP cache answers". Under this default, each add is a revalidation round trip.
- **Who notices:** the student, in S1, on first visit and on managed Chromebooks that clear site data.
- **Growth:** per worker-less visit × asset count.
- **Evidence:** argued from Pages' documented default; not checked live.
- **Confidence:** medium. One `curl` settles it.
- **How to prove it here:** `curl -sI https://<site>/assets/<any-hash>.js | grep -i cache-control`.
- **Size:** quick fix: a `public/_headers` with `/assets/*  Cache-Control: public, max-age=31536000, immutable`.
- **Survived refutation because:** narrowly. The worker covers most visits, but the warm-cache premise in DECISIONS ("What the service worker may cache") depends on this header.

### Survived, below the line (one line each)

- **Inline source maps in both committed bundles:**
  - `scripts/bundle-grading-server.mjs:54` and `scripts/bundle-viewer-server.mjs:46` (`sourcemap: 'inline'`).
  - The maps are 77% of the bytes: 2.28 of 2.95 MB for grading, 0.84 of 1.09 MB for viewer.
  - They add about 20 ms (grading) and about 8 ms (viewer) to import time in node, which is under 1% of the 3–4 s cold start.
  - They are also why `get_edge_function` cannot read check-activity.
  - Dropping them requires re-baselining `GRADING_SERVER_MAX_KIB`/`VIEWER_SERVER_MAX_KIB` (`perf-budgets.mjs:53,71`); otherwise the leak ceiling loosens about 4×.
- **ActivityEditor re-renders the whole route on every keystroke:**
  - `ActivityEditor.tsx:437-439` calls `setTiptapJson`, which re-renders the route, including the closed, unmemoised `ConfigDrawer` (`:925`) with its two hidden Tiptap editors.
  - Measured 3.1 ms per commit in jsdom dev, about 0.5–1 ms in prod.
  - `memo` alone won't help, because `taxonomy={{…}}` (`:945-951`) is a fresh object on every render.
- **`list_bank` detoasts each listed version's content three times** (0056:50, 52, 69). Live it takes 7–47 ms; it grows with catalogue × document size.
- **`list_grading_queue`'s `blocks` walk** (0034:494-508) runs per latest row once `activity_versions` is large. It is activity-scoped and small.

---

## Challenges a decision

These survived refutation, but each one reverses a recorded ruling, so they are proposals for the author, not work items.

1. **Merge resolve and content into one conditional GET.**
   - **Decision:** DECISIONS → "Read API S2" (`docs/DECISIONS.md:437`): *"authenticated resolve (current version pointer, `no-cache`) / authenticated content (version-keyed, `private, max-age=31536000, immutable`)."*
   - **Proposal:** one "current content" GET with `ETag: <version_id>`, `no-cache` and `If-None-Match`.
     - First open goes from 2 invocations plus 2 preflights to 1 plus 1. The math preload starts one RTT plus a possible cold start earlier on S1.
     - A reopen becomes a 304 that costs what resolve costs today.
     - The `stale_version` retry disappears.
   - **What it loses:** zero-network content hits inside a live preflight window.
   - **Why only partly:** finding 9's localStorage shortcut gets most of the reopen win without touching the decision.
2. **Batch a grouped check into one request.**
   - **Decision:** `docs/design/activity-flow-modes.md:66-67`: *"Standing: **3A** (client composes N RPCs) … **8A** (fan-out accepted…)"*.
   - **The cost:** `store.ts:527-537` `Promise.all`s K `checkSection` calls. Each re-runs the auth RPC, the raw document read and the zod upgrade (10–25 ms cold for a 41–131 KB document), plus `record_check`, and counts against the 60/60 s ceiling. If isolates really recycle per request (DECISIONS S2's rate-limit finding), K parallel calls may each boot the 2.9 MB bundle.
   - **Who feels it:** wall-clock is bounded by the slowest call, so this is mostly invocation cost under S5, not something a student feels.
   - **Doc drift:** flow-modes R1 (`:100`) says "sequenced"; the code runs in parallel.
3. **Not recommended, recorded so nobody re-pitches it:** overlapping `readVersion` with `versionForCheck` on the check path would save a round trip. But it reverses the handler's stated security ordering (`check-activity-handler.ts:15-26`: *"the ordering here is the difference between a grading service and an answer-key API"*).

## Looked at, already fine

- **Shell budget:** shell JS **131.5 KiB gz** against a 158 cap; CSS 15.4 against 16.5; all 21 budgets pass (`node scripts/check-perf-budget.mjs`, this run). KaTeX, MathLive, JSXGraph, ProseMirror and zod are all off the shell. No load-side finding beyond #15.
- **Perf stub lane, one run on a cloud Linux host** (a record, not a gate, per DECISIONS "milliseconds are records"):
  - pre-auth 1025 ms against the 992 ms target;
  - worksheet interactive 1356 ms against 1135;
  - math rendered 2322 ms, with a LaTeX-fallback window of 966 ms.
  - A different machine, run once. Re-read from CI before acting on it.
- **SW precache** is `index.html` only (979 B). `/assets/` is CacheFirst with `ignoreVary`, and the API is never SW-cached (per DECISIONS). The offline document lives in localStorage.
- **Editor autosave:**
  - 1 s debounce, single-flight, trailing save, `update()` with no read-back.
  - `getJSON` 0.04 ms, change key 0.05–0.09 ms, and `tiptapToActivity` only inside `save()` (1.1–1.8 ms at 60–120 blocks).
  - Live `UPDATE … draft_content` mean is 2.6 ms.
- **Editor per-transaction walks:** `columnsGrip`/`placeholderHint` decorations take 0.001–0.025 ms. BlankIdUniqueness walks only on doc changes. Numbering is memoised per NodeView on `editor.state`, with no O(N²).
- **Popover and command-bar hosts:** they subscribe to transactions, but their setState calls bail out when nothing changed. The single-host pattern is intact.
- **Viewer math and graphs:** KaTeX HTML is cached in `useState`, graph-kit mounts are keyed on `[block.id, mode]`, and persistence is debounced at 300 ms.
- **Class grid `Cell` memoisation:** refuted. It runs once per click, react-router `Link`s re-render on any navigation regardless, and `gradeHref` changes on every selection anyway. That is about 8–12 ms per panel open at a realistic 30 × 20.
- **`record_check`, `get_activity_version_for_check`, `my_checked_section_ids`, `my_latest_checks`, `my_activity_progress`, `class_student_work`, `activity_first_tries`, `list_class_activities`, `my_chain_hooks`, `fact_probe_overview`, `list_grade_suggestions`:** each is bounded by an index prefix or by one student or activity.
- **`auth.uid()` in policies** is wrapped everywhere, as the advisor found.
- **The two permissive SELECT policies on `section_checks`** are moot for the app: no client reads the table directly since 0060, and DEFINER RPCs bypass RLS.
- **`practice_sessions.class_id`** (an advisor FK): no read path filters on it, and classes are soft-deleted only. No index is needed.
- **`claim_grade_suggestions`' whole-history walk** is already filed (ai-grading-assist.md:365, EH-16, deferred to D11). Not re-filed.
- **The class_progress/activity_progress `hand` walk** is already acknowledged (class-progress-view.md:585). Not re-filed. Note that its plan flips to per-row once `activity_versions` reaches thousands of rows.
- **`audit_log`** is about 23 action kinds at teacher/admin rate and is read by an indexed `actor_id`. **`activity_version_reads`** is bounded by versions × sanitizer revisions.
- **Edge per-request work on a read-cache hit:** no upgrade, sanitize or census. Shuffle and seed substitution take 1–7 ms. The admin client is module-scoped; the per-request user clients cost 0.14 ms.
- **Bundle contents:** no dead dependencies, mathjs is the `number` subset, and there is no MathLive or KaTeX in either server bundle.
- **Polling:** only FactsTeacher (5 s, while a probe is open and the tab is visible) and the FactsEntry waiting room (#13). Nothing refetches on focus, and nothing uses `select('*')`.
- **Activities list, Bank list, Classes page, student Home RPCs, glossary:** narrow columns, parallel where independent, and module-cached where repeated.
- **Releasing feedback and running restore earlier on the student open:** refuted as material. Both are fire-and-forget or non-blocking by ruling D4, and firing restore speculatively would add calls to opens that make none today.

## Appendix — correctness and doc issues noticed (one line each, not investigated)

- **Responses page:** `GradePanel` sets its outcome and then awaits `onSaved()`, and `load()`'s `setLoading(true)` unmounts the panel in the same batch, so the DR-11 `role=status` "saved" message (`ActivityResponses.tsx:906-909`) is probably never shown. No test asserts it.
- **Content URL cache key:** it is keyed only by `activity_id` + `version_id` and served `immutable` for a year. A `SANITIZER_REV` bump cannot reach copies already in browsers, although the server cache is keyed by revision. Medium-low confidence.
- **Floating supabase-js in both functions:** `supabase/functions/*/index.ts` import `https://esm.sh/@supabase/supabase-js@2`, a floating major, so each deploy can resolve a different minor. The app pins exact.
- **Dead functions named as live:** the headers of `get-activity/index.ts` and `check-activity/index.ts` still name `ingest-submission`/`get-feedback` (the dead "trio") as live peers. This is close-out question 3 material.
- **InsertZones comments:** `InsertZones.ts:18-21` and `:110-113` claim no churn per keystroke, which is false (finding 7). A P11 claim.
- **warmAssetCache comment:** the "nearly free" premise at `swRegistration.ts:171-199` depends on immutable caching headers that probably are not set (finding 15).
- **DECISIONS contradicts itself on isolates:** S2's rate-limit finding says nearly every request is a fresh isolate, while the check-latency ruling relies on thirty students keeping an isolate alive. A module-scope `BOOT_ID` log would settle it, and it decides how much #14 and the batching challenge matter.
- **Stale check-latency numbers:** the ruling (2026-08-01) predates the grading bundle reaching 2.95 MB. Its numbers may be stale.
- **Timezone fallback abuse (security-adjacent, out of scope):** any signed-in user can `PATCH /rest/v1/users?id=eq.<uid>` with `{"timezone":"junk"}` and make `iana_zone_is_valid` fall through to the `pg_timezone_names` scan (about 820 ms live) before the trigger raises. Table-level UPDATE comes from the 0032:75 grant. The app never writes `timezone`.
- **Never-reset notice:** `StudentViewer.tsx:288` sets `strandedNotice` and nothing resets it, so it could outlive its cause if the route param changes without an unmount. Low.
