# Activity taxonomy — RULED (eng review 2026-08-18)

**Status:** ✅ **SHIPPED AND LIVE** — Drop 1 (migration **0037**, applied + verified
live 2026-08-18, verify-0037 = 11/0) and Drop 2 (the ` ```meta ` import fence). The
fence gained `work:` on 2026-08-21 — the first NESTED knob it reaches (`print.workSpace`),
which this doc's "flat enums only" line deliberately gated on real demand.

> **Status:** RULED — full eng review with outside voice, 2026-08-18. Resolves
> [free-activity-catalog.md](free-activity-catalog.md) **decision #6** (the last
> open catalog decision). Trigger: the author's large activity catalogue —
> taxonomy is the one choice whose retrofit cost scales with every activity
> authored, and the corpus is empty (tool-read 2026-08-18: 3 throwaway rows),
> so this was the last cheap moment. **No code yet** — this doc is the build
> input for the arc below.

## 0. The reframing this review ran on

Decision #6 was written as "which tags mechanism." The code sweep said the real
question is different: **six classification fields already exist across two
storage layers, and only one has an editing UI.**

| Field | Storage | Grain | UI | Ruling below |
|---|---|---|---|---|
| `course` | `activities` column AND `ActivityMeta` | activity | none | R1: doc owns display, publish stamps the column |
| `unit` | both layers, same as course | activity | none | R1 |
| `activityType` | `ActivityMeta` ([document.ts:229](../../packages/schema/src/document.ts)) | activity | drawer picker | R2: distinct axis (presentation format), untouched |
| `meta.skills` | `ActivityMeta` | activity | none | R3: stays inert (A4 inherited) |
| `block.skills` | 8 question block types | per question | none | R3 |
| `tags` | new `activities` column | activity | new (this arc) | R4–R6 |
| `pedagogical_role` | new `activities` column | activity | new (this arc) | R7 |

Prior-ruling posture (agreed at review start): the 2026-07-24 Activity Bank
rulings (P3/P4/A4, doc in `~/.gstack/projects/ZanReed-activity-platform/`)
stand as priors, re-opened only where two new facts bite — the
authoring-at-volume trigger, and the `activityType` collision P3 didn't see.

## 1. The rulings (R1–R8)

**R1 — course/unit: the document owns display; the row columns are
PUBLISH-truth, stamped by `publish_activity`.** The viewer shows
`doc.meta.course` from the published snapshot
([ViewerContainer.tsx:257](../../packages/viewer/src/container/ViewerContainer.tsx));
the future catalog RPC reads the row columns of published activities. So the
columns must mean what students see: `publish_activity` derives course/unit
from the snapshot content into the row (one migration — the RPC also sets
`draft_content = null` at [0003_functions.sql:202](../../supabase/migrations/0003_functions.sql),
which is why autosave-time stamping was rejected: a draft is the wrong
document for a catalog, and post-publish there is no draft to re-stamp from).
Autosave NEVER touches the columns. A course/unit control lands in the config
drawer's Settings panel (edits `doc.meta`). `course` gains `.min(1)` in the
schema. Author-list facets show last-published values; a never-published
draft shows the default — accepted.

**R2 — two "type" axes, collision killed by naming.** Document `activityType`
(worksheet/exit_ticket/warm_up/review) is **presentation format** — live, has
UI, drives rendering; untouched. The Bank's P3 enum (Lesson/Review/Practice)
is **pedagogical role** and ships as `pedagogical_role` (R7) — never under
the name `activity_type`. Both contain "review"; they mean different things;
the names now say so.

**R3 — skills stay inert (A4 inherited, not re-decided), plus one guardrail.**
Neither A4 revisit trigger (multi-author listing; a selection engine) has
fired. The guardrail this doc adds: **tags are row-level discovery
vocabulary; skills, when triggered, get their own tables keyed by block;
never merge the two.** Corollary of R7: role words (lesson/review/practice)
belong in `pedagogical_role`, never in tags — and skill-shaped tags are
accepted as an editorial risk the future skills arc may have to re-map.

**R4 — tags ship NOW, as a conscious overturn of P3's supersession, scoped to
the authoring surface.** P3's premise was consumer navigation of a curated
Bank; today's trigger is the author navigating 150 of their own activities —
a genuinely new fact. `tags text[] not null default '{}'` on `activities`.
The Bank's Lesson/Review/Practice labels remain its primary navigation; tags
join the Bank later as an optional facet. **No GIN index in this slice** —
the authoring filter is client-side; the index ships in the Bank catalog
RPC's own migration, beside its first server-side tag query (recorded in §4).

**R5 — normalization contract:** stored tags are lowercased, trimmed,
internal whitespace collapsed to single spaces, exact duplicates dropped,
empty rejected; unicode letters allowed (macrons fine); display = stored
form. One pure function `normalizeTags()` shared by every write path (chip
input now, the meta fence in Drop 2, any future import). Synonym/plural
drift stays editorial — single-author curation plus the typeahead is the
control; a controlled vocabulary is the (c) migration, deferred as before.

**R6 — P1 caller: a minimal tag filter ships in the same slice.** Chips above
the Activities list filtering client-side over the already-fetched rows. The
full list redesign (search/sort/pagination) stays a separate sibling slice.
A write-only tags column would recreate the `meta.skills` pattern this
review exists to end.

**R7 — `pedagogical_role` ships in this arc** (outside-voice overturn of the
review's own "doc-only rename" ruling): nullable enum column
(`lesson`/`review`/`practice`), a drawer select beside the tags input, a meta-
fence key in Drop 2. Rationale: the corpus is authored NOW — capture the
Bank's badge data at the free moment instead of a 150-row retro-classification
pass, and structurally prevent role-as-tag leakage. Risk accepted: if the
Bank pass reshapes the enum, a remap follows — but P3 already red-teamed
these three values.

**R8 — the importer grows a `meta` fence as Drop 2 of this arc** (before bulk
authoring starts, tracked in §3): course/unit/tags/pedagogical_role expressed
in pasted markdown, parsed through `importFormatRegistry.ts` so the
three-artifact sync (parser + prompt + markdown-import-format.md) stays
guarded. Without it, every one of 150 imports needs a manual drawer pass —
the N× tax on the platform's primary authoring path.

## 2. Mechanism notes (why the shape is safe)

```
AUTHOR EDITS                        ROW (activities)
┌────────────────────┐   autosave   ┌──────────────────────────┐
│ doc.meta.course ───┼──────────────┼─> draft_content (JSONB)  │
│ doc.meta.unit      │  (one UPDATE)│   tags        (row-native │
│ tags chip input ───┼──────────────┼─>              live)      │
│ role select ───────┼──────────────┼─> pedagogical_role        │
└────────────────────┘              │   course, unit  <─────────┼─┐
                                    └──────────────────────────┘ │
                       publish_activity RPC: snapshot content ───┘
                       → activity_versions AND stamps course/unit
                       (draft_content = null after)
```

- **Tags/role are row-native listing metadata** (like `visibility`): editing
  them post-publish updates the listing immediately, no republish — by design.
- **course/unit are publish-truth**: stamped server-side in one place,
  P4-honest (derived, not merely written). A reconciliation sweep test pins
  row == published-snapshot meta across the corpus.
- **`changeKey` must include tags + role** ([ActivityEditor.tsx:392](../../packages/app/src/routes/ActivityEditor.tsx)) —
  a tags-only edit must dirty the autosave fingerprint, and the load path
  must hydrate them from the row. Named test, not an afterthought.
- **Ordering (OV-7, stated because the blast radius is total):** the
  migration is applied live BEFORE the SPA change is pushed. Once `save()`
  includes the new columns, an unmigrated backend 400s EVERY autosave, not
  just tags.
- No new RLS surface (owner-scoped `activities` policies cover the columns);
  tags/course/unit/role are not person-referencing — no data-map entry owed.

## 3. The arc — two drops

**Drop 1 — taxonomy slice:** migration (tags + pedagogical_role + the
`publish_activity` course/unit stamping; verify script per repo convention) →
`normalizeTags()` → drawer: course/unit fields, tags chip input with
typeahead-over-existing-tags, role select → autosave: columns in the same row
UPDATE + changeKey + load-path hydration → Activities list: tag filter chips
+ empty state. Tests: the 13 gaps from the review's coverage trace plus the
changeKey row and the P4 sweep.

**Drop 2 — the `meta` import fence (TRACKED — the arc is not done until this
lands):** fence in `markdownToTiptap.ts` via the registry, prompt + format
doc updated in the same commit (three-artifact sync), values routed through
`normalizeTags()`/the role enum. Gate: lands before bulk authoring begins.

## 4. Handoffs recorded for later arcs

- **Bank catalog RPC migration adds the GIN index on tags** beside its first
  server-side tag query (deferred from this arc by P1).
- The catalog RPC's column surface gains `tags` and `pedagogical_role`
  (amends free-activity-catalog decision #3's list).
- **Parallel-session last-write-wins now covers tags/role** (pre-existing
  pattern on `draft_content`, widened knowingly; see TODOS if promoted).
- Future skills arc inherits R3's guardrail and possibly a retag pass for
  skill-shaped tags.

## 5. NOT in scope (considered, deferred, with rationale)

- **The list-surface redesign** (search/sort/pagination) — sibling slice;
  needs its own design pass. The R6 filter is deliberately minimal.
- **Skills model/UI** — A4 stands; no trigger has fired.
- **Controlled tag vocabulary / tag tables** (option c) — single-author
  curation suffices; the (b)→(c) migration stays mechanical.
- **Search/`tsvector`** — Phase 5 as before; columns keep the door open.
- **Unifying the two type enums** — rejected: orthogonal axes (a Lesson can
  be a worksheet or an exit ticket); naming solves the collision.
- **The actual tag vocabulary** — the author's curriculum, not an eng call.

## 6. What already exists (reused, not rebuilt)

- `activities.course/unit` columns (0001) — reused as the publish-truth home.
- `ActivityMeta` + the config drawer's Settings panel — the tags/role/course
  controls extend it; no new surface invented.
- Autosave's single-row UPDATE — the atomic carrier for row-native fields.
- `importFormatRegistry.ts` + guard test — Drop 2's seam, pre-built.
- `visibility` enum + partial index — untouched; listing semantics unchanged.

## 7. Failure modes (each named in the test plan)

| Path | Failure | Covered by |
|---|---|---|
| autosave with new columns, unmigrated backend | ALL draft writes 400 | OV-7 ordering rule + integration row |
| tags-only edit | silently never saves | changeKey unit test |
| publish stamping | row ≠ snapshot meta | P4 sweep test + verify script |
| normalize skipped on a future write path | vocabulary fragments | normalizeTags as the single shared function; Drop 2 reuses it |
| tag filter, zero matches | blank screen | empty-state e2e row |
| two sessions editing metadata | last write wins | accepted, recorded (§4) |

## GSTACK REVIEW REPORT

| Runs | Status | Findings |
|---|---|---|
| Section 1 — Architecture | complete | 4 (dual-layer course/unit; activityType collision; skills re-litigation; P3 supersession re-opening) |
| Section 2 — Code quality | complete | 1 (normalization contract) |
| Section 3 — Tests | complete | 1 (P1 caller) + 13-gap coverage trace |
| Section 4 — Performance | complete | 0 (GIN nuance recorded, later promoted to D12) |
| Outside voice (Claude subagent; Codex not installed) | complete | 10 findings; 4 substantive tensions taken to rulings |

Decisions D1–D12 all ruled interactively (scope, priors posture, 4
architecture findings, normalization, P1 caller, then 4 cross-model
tensions: provenance → publish-truth; meta fence → Drop 2 same arc;
pedagogical_role → ships now; GIN → deferred to Bank). Outside-voice
finding 6's missing-typeahead premise was corrected (typeahead was already
in scope); finding 10 recorded as an accepted widening. CODEX absorbed: not
installed — Claude subagent served as the outside voice.

VERDICT: CLEARED FOR BUILD — two-drop arc as §3, migration-before-push
ordering binding.

NO UNRESOLVED DECISIONS
