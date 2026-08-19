# Activities list surface — RULED (design review 2026-08-18)

> **Status:** RULED — full /plan-design-review, 7 passes + wireframes, 2026-08-18
> (9 decisions, D3–D11, all interactive). The sibling slice the taxonomy eng
> review deferred; builds the navigation on the taxonomy data that already
> shipped (tags, publish-truth course/unit, pedagogical_role). No code yet —
> this doc is the build input. Wireframes (3 explored directions + the ruled
> final) live in `~/.gstack/projects/ZanReed-activity-platform/designs/activities-list-20260818/`.

## 1. The ruled shape — the list IS the curriculum outline

**Direction B won (D3): grouped-by-unit outline, not flat-with-facets, not a
facet sidebar.** The deciding principle is the repo's own
[ux-lens.md](ux-lens.md) master thesis: a teacher thinks *"the factoring one in
Quadratics"*, not `course=X AND role=Y` — and the rejected variants were
control-per-column schema mirrors (the lens's #1 failure signature). Choosing
the outline **deleted** the facet dropdowns, the sidebar, and the sort control
rather than answering where to put them.

```
┌──────────────────────────────────────────────────────────┐
│ My activities                          [ New activity ]  │
│                                                          │
│ RECENTLY EDITED  [Vertex Form Exit…] [Untitled] [Factor…]│  ← D4: ≤5 chips, resume-work
│                                                          │
│ [ Search activities…                                 / ] │  ← D9: `/` focuses (guarded)
│ (drafts) (factoring) (word problems) (vertex form) …     │  ← D11 drafts chip + tag chips
│ 12 of 150 shown · clear                                  │  ← count line, aria-live
│                                                          │
│ ── Unit 2: Quadratics ─────────── 42 activities · 3 drafts│ ← sticky h2, natural sort (D5)
│   Factoring Trinomials Practice   Practice publ.  Aug 17 │  ← D8: flat rows, hairline
│   Vertex Form Exit Ticket         Lesson   publ.  Aug 16 │     separators, no cards
│   Completing the Square — Guided  Lesson   draft  Aug 16 │
│ ── Unit 3: Systems ────────────────────── 28 activities ─│
│   …                                                      │
│ ── No unit ──────────────────────────────── 6 activities─│  ← always last
└──────────────────────────────────────────────────────────┘
```

## 2. The rulings (D3–D11)

- **D3 — grouped outline.** Course→unit sticky headers with counts
  (`42 activities · 3 drafts`); activities nested; the outline is the default
  and only view. Escape hatch on record: counted facets (variant C) return only
  if real usage shows retrieval failing at volume.
- **D4 — recency strip.** "Recently edited": the 5 most recently edited
  activities as small title chips above the search field. Serves resume-work
  (the most common visit) and catches unit-less fresh "Untitled" drafts. Must
  stay one row — it is a shortcut, not a second list.
- **D5 — unit order: natural sort + naming convention.** `localeCompare(…,
  {numeric: true})` so "Unit 2" < "Unit 10"; number-prefixed names give strict
  curriculum order (documented, and cheap to adopt via the ```meta fence);
  "No unit" is always last. No unit entity, no drag-reorder — YAGNI upheld.
- **D6 — filters hide empty groups.** A filtered view (search/tags/drafts)
  shows only groups with matches; group order stays stable among survivors;
  the count line carries orientation; clearing restores the full map. The
  UNFILTERED outline is the stable spatial map.
- **D7 — scroll restoration is specified.** Editor→list back-navigation
  restores outline scroll (ScrollRestoration or equivalent), including after
  an autosave re-rendered rows. Kills the top-of-page dump on every round trip
  of a bulk-authoring sprint.
- **D8 — flat rows, no cards.** Rows lose per-row border/shadow/radius (the
  hard-rules "stacked cards" fail at 150 rows). Each group renders as one
  quiet container; 1px `--color-line` separators; ~36–40px rows; hover/focus =
  `surface-2` fill. Row anatomy: **title** (primary, the link) → **role badge +
  status badge** (secondary) → **edited date** (tertiary, right-aligned) →
  quiet actions. Unit label NOT repeated in rows — the header carries it.
- **D9 — `/` focuses search** with the standard guard (ignored when an
  input/textarea/contenteditable has focus); Escape clears + blurs; the
  placeholder advertises it ("Search… /").
- **D10 — responsive + a11y spec adopted** (verbatim in §4).
- **D11 — one "drafts" chip**, visually distinct at the head of the chip row;
  ANDs with tags + search. No status dropdown; no published/archived filters —
  "finish my unfinished work" is the only status-shaped task.

## 3. Interaction states (Pass 2 table — the build contract)

| Feature | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Outline | skeleton groups; **own selector + `aria-busy`, never shared with ready state** (prior learning: the StudentViewer skeleton/e2e trap) | "No activities yet…" + create CTA (keep today's) | keep today's load-error text | grouped outline | filtered: empty groups HIDE (D6) |
| Recent strip | absent (no layout shift on arrival) | absent silently (< 1 edited) | absent silently | ≤5 chips | <5 chips, no placeholders |
| Search | n/a | count line reads "0 of 150 shown" + clear link (keep the filtered-to-nothing message) | n/a | filtered outline | composes (AND) with chips |
| Tag/drafts chips | absent until vocabulary exists (shipped behavior) | — | n/a | chip row, wraps | uncapped wrap in v1 (see §6) |
| No-unit group | — | absent when empty | — | last, labeled "No unit" | hides under filters like any group |

## 4. Responsive + a11y (D10, adopted verbatim)

- **≥768px:** as designed. **<768px:** same single column; recent strip wraps
  to 2 rows max then truncates; sticky group headers persist; row actions
  (Analytics, Delete) collapse into a per-row ⋯ menu — 44px targets; row
  height ≥44px on touch.
- Groups: `<section aria-labelledby>` per unit; header is an `<h2>` — the page
  outline IS the document outline (screen-reader ToC for free).
- Count line `aria-live="polite"` — filter results announce themselves.
- Tag chips keep `aria-pressed` (shipped); skeleton per the table above.
- Focus order: search → chips → outline rows in DOM order; rows are links —
  Tab order is the navigation, no roving-focus cleverness.
- Contrast: muted-on-canvas is AA by token design; dimmed/empty treatments use
  `--color-muted`, never opacity on ink.

## 5. What already exists (reused, not rebuilt)

- The token system (`--color-*` in index.css) — every treatment above is
  expressed in it; no new colors.
- `StatusBadge`, the shipped tag-chip filter (AND semantics, aria-pressed,
  filtered-to-nothing state), delete-with-undo toasts, instant-create — all
  survive; the July 2026-07-18 review patterns are load-bearing.
- `collectTagVocabulary` feeds the chip row; `pedagogicalRole` labels the role
  badge; group counts derive from the same fetched rows.

## 6. NOT in scope (considered, deferred, rationale)

- **Counted-facet rail (variant C)** — returns only on demonstrated retrieval
  failure at volume; recorded escape hatch, not v1.
- **Sort control** — deleted by D3; curriculum order + recency strip cover the
  modes. **Status dropdown** — deleted by D11.
- **Tag-chip cap/overflow** — chips wrap uncapped; revisit past ~30 distinct
  tags (the vocabulary is author-curated; D5's convention keeps it small).
- **Collapsible groups** — sticky headers + hidden-when-filtered make collapse
  state unnecessary at 6–8 units; revisit only for multi-course scale.
- **Server-side search/pagination/virtualization** — client-side stands (≤1k
  rows); unchanged from the pre-review doc.
- **App-chrome typography** (`system-ui` stack) — a real universal-rules ding,
  but app-wide and owned by the backlog's /design-consultation brand pass, not
  this slice.

## 7. Implementation tasks

Synthesized from the review's findings; P1 blocks ship of the slice.

> **✅ T1–T4 BUILT 2026-08-19.** `lib/activityGrouping.ts` (grouping + natural
> sort), `lib/useScrollMemory.ts` (D7), and the rewritten
> `routes/Activities.tsx`. **One thing the design pass did not foresee, found
> in build:** `activities.unit` is publish-truth, so grouping on the column
> alone files every unpublished draft under "No unit" — i.e. breaks the outline
> for the bulk-authoring sprint it exists for. The list therefore reads
> **draft-first** (`draft_content->meta->>unit`, extracted server-side by a
> PostgREST json path so 150 rows never ship 150 documents), mirroring the
> editor's own draft > published load priority. The column keeps its single
> writer; taxonomy R1 is untouched.

- [x] **T1 (P1, human: ~1d / CC: ~45min)** — Activities.tsx — the grouped
  outline: natural-sorted unit groups w/ sticky `<h2>` headers + counts,
  No-unit last, flat rows per D8's anatomy, empty groups hidden under filters.
  - Surfaced by: D3/D5/D6/D8. Verify: unit-order and empty-group unit tests +
    the a11y lane's axe row.
- [x] **T2 (P1, human: ~2h / CC: ~15min)** — recent strip (≤5, no shift, absent
  states per §3). Surfaced by: D4.
- [x] **T3 (P1, human: ~2h / CC: ~15min)** — search + `/` guard + drafts chip +
  aria-live count line, all AND-composing with the shipped tag chips.
  Surfaced by: D9/D11/Pass 2.
- [x] **T4 (P1, human: ~1h / CC: ~10min)** — scroll restoration on
  editor→list return. Surfaced by: D7.
- [ ] **T5 (P2, human: ~3h / CC: ~20min)** — mobile: ⋯ action menu, 44px
  targets, strip truncation; axe + viewport e2e rows. Surfaced by: D10.
- [ ] **T6 (P2, human: ~2h / CC: ~15min)** — state coverage tests: skeleton
  selector distinct from ready (prior-learning pin), strip absence, zero-match
  count line. Surfaced by: Pass 2.

## GSTACK REVIEW REPORT

| Runs | Status | Findings |
|---|---|---|
| Step 0 — scope + rating | complete | initial 5/10; ux-lens schema-mirror flag |
| Step 0.5 — mockups | complete (fallback) | designer binary lacks API key → token-accurate HTML wireframes, 3 IA directions + ruled final |
| Pass 1 — Information architecture | 6→9/10 | 2 (recency home → D4; unit order → D5) |
| Pass 2 — Interaction states | 3→9/10 | 1 fork (empty groups → D6) + state table adopted |
| Pass 3 — User journey | 7→9/10 | 1 (scroll restoration → D7) |
| Pass 4 — AI slop / hard rules | 5→9/10 | 1 (hard-rejection #7, cards → D8); blacklist otherwise clean |
| Pass 5 — Design system | 8/10 | 0 (no DESIGN.md — tracked via backlog brand pass) |
| Pass 6 — Responsive & a11y | 4→9/10 | 2 (`/` → D9; spec block → D10) |
| Pass 7 — Unresolved decisions | complete | 1 (drafts chip → D11); sweep empty after |

Design outside voices: not run (offered path requires Codex/API credentials
absent on this machine; the three-variant wireframe comparison served as the
alternative-perspective instrument). Overall: 5/10 → 9/10. The remaining point
is earned in build, not on paper: the flat-row + sticky-header treatment must
be seen at real density in /design-review after implementation.

VERDICT: CLEARED FOR BUILD — direction B with rulings D3–D11; tasks T1–T6.

NO UNRESOLVED DECISIONS
