# Free activity catalog — design

**Status:** design captured, not implemented (2026-06-16). **Target: Phase 2** (author intent — an onboarding lever, see "Why now"). A public, browsable catalog of free activities — initially math, all authored by the platform owner — that any teacher can find and **run as-is**. Captured ahead of implementation in the same role as the sibling OCR designs (`pdf-import.md`, `photo-grading.md`).

Companion to ROADMAP.md (this is the Phase 5 marketplace's *free + discovery* slice, pulled forward into Phase 2) and STATE.md.

## Why now — onboarding, not just a marketplace test

This is the Phase 5 marketplace's catalog slice, but its **primary v1 value is cold-start**: a brand-new teacher shouldn't face a blank editor. Two facts make Phase 2 the natural home:

- Phase 2's own "Done when" is a cold-start bar (*"never seen the system before … use it with students that week"*). A free catalog beats it — a newcomer assigns a quality activity *that day*, zero build time.
- Phase 2 is where **self-signup replaces the allowlist** — the moment strangers arrive. Starter content is the canonical onboarding lever for exactly that moment; the two ship as companions.

Secondary value: it seeds the eventual Phase 5 marketplace with quality first-party math content — today's free activities become the marketplace's launch catalog. It also doubles as a **worked-examples library**: browsing good activities teaches the editor's capabilities.

## The decision: "use" = run-in-place, not fork-to-edit (author-confirmed 2026-06-16)

A consuming teacher **finds an activity and runs the published student experience** — shares the link, assigns it, prints it. They do **not** copy it into their own library to edit. This is deliberately the same primitive Phase 5 specifies: *"use purchased activities as if you authored them (read-only — assign them, see submissions, but not edit)."*

The alternative — clone/fork into your own library to remix — is **deferred** (see "Cold-start nuance"). It is a different, heavier primitive that pulls in the ID-stability work (`serialize.ts` mints fresh UUIDs per call; flagged as a Phase 4 collab dependency) and multi-tenancy ownership transfer. Phase 5 itself does not offer it (purchased items are read-only). Out of scope here.

## The clean architecture: a catalog is an index over already-public URLs

The distribution mechanism already exists. `publish-activity` produces a **public R2 URL** for an activity; that HTML is already world-readable by design. So:

> **The catalog is a discovery index over already-public published URLs, plus a little metadata.** Run-in-place needs no new content-access machinery — browse → get the public link → assign/print/run.

That makes the Phase 2 slice genuinely small: a "listed" flag, some tags, and a browse UI.

### What's new (and where it lives)

- **A public-listing concept** — "listed in the catalog" vs. private. Lives as **DB/app-layer metadata on the activity row, NOT in `ActivityDocument`.** Keeps the renderer pure; keeps Phase 5's richer catalog (standards alignment, ratings, price) as additive columns/tables, never a document migration.
- **Listing ≠ publishing.** Publishing is the distribution mechanism (produces the URL); listing is catalog membership. Keep them separate — in Phase 5 paid items are published-but-gated, so conflating them now creates a reshape later.
- **A discovery surface** — a public (or signed-in) browse route, sibling of the existing `Activities` route, filterable by subject/topic/grade. Math is the first category facet. ROADMAP names Postgres `tsvector` for Phase 5 search; v1 is a simple DB filter — just keep listing data in the DB where `tsvector` can index it later.
- **Attribution** — "by &lt;author&gt;" on listings. Trivial for one author; generalizes to multi-author for free.
- **One new RLS surface** — a read policy so non-owners can read *listed* rows' catalog metadata. Per repo discipline, **call the ownership/visibility helpers; don't inline the check.** (Running the activity needs no policy — the R2 HTML is already public.)

## Marketplace compatibility (the Phase 5 mapping)

| Phase 5 marketplace piece | Free v1 |
|---|---|
| Browse/discovery catalog (topic, grade) | ✅ this is the feature |
| Free items | ✅ all of them (ROADMAP lists "free and paid items" — free is first-class) |
| "Use as if you authored, read-only" | ✅ run-in-place |
| Paid items + **Stripe** | ❌ deferred (and CLAUDE.md forbids pre-building billing) |
| Purchase/**entitlement** table | ❌ not needed — free = everyone entitled |
| **Multi-author** onboarding, royalties, author dashboards | ❌ single author for now |
| Reviews / ratings | ❌ deferred |
| **Server-side grading** (the "security ceiling") | ❌ not needed — see below |

**Why the security ceiling doesn't bind:** Phase 5 needs server-side grading because *paid* items have author IP at stake (answer keys live in published HTML). ROADMAP calls keys-in-HTML *"acceptable for low-stakes practice."* These are **free formative math** activities — no IP to protect, low stakes — so existing client-side grading is correct. The feature ships on what's already built and inherits none of Phase 5's hardest refactor.

## Keep-the-door-open seams (cost ~zero now)

1. **Listing metadata in the DB, not the document schema** (renderer purity; Phase 5 catalog fields stay additive).
2. **Structure the listing record so a future `price` / entitlement is an additive column** — don't build it, just don't design a schema that fights it.
3. **Listing separate from publishing** (paid-but-gated items in Phase 5 need the split).
4. **Attribution generalizes to multi-author** — store "who authored this" on the listing even though it's always you for now.

Explicitly **do NOT build now:** Stripe/entitlements, reviews/ratings, multi-author onboarding, royalty/author dashboards, and the clone/fork primitive.

## Cold-start nuance: two flavors of "don't start from scratch"

The onboarding goal has two flavors, and run-in-place fully serves only one:

- **"Assign a ready-made activity as-is"** → run-in-place serves this completely. Instant time-to-value; no editor needed.
- **"Use one as a starting point I can adapt to my class"** (change the numbers, swap a problem) → needs the **clone/template** primitive, which is deferred (multi-tenancy + ID stability).

Run-in-place still serves cold-start strongly (instant value + worked examples to learn from), but it does not let a consumer *tweak*. Decision: **ship run-in-place for Phase 2; treat "start from a copy" as a named follow-on**, naturally landing with Phase 4 multi-tenancy/collab (which solves ID stability anyway), or pulled forward if early-adopter feedback shows teachers want to customize rather than assign as-is.

A *possible* cheap bridge if customization demand appears before Phase 4: ride the Phase 2 **markdown/DSL importer** (see `pdf-import.md`) — "export this activity's content as DSL → paste into a new activity → edit." Lossy (only DSL-expressible content survives; images/complex math degrade), no ownership transfer, not a true clone — an escape hatch, not the real answer. Recorded as an option, not a recommendation.

## What this design does NOT decide

1. **Consumer submission dashboards depend on Phase 3.** Run-in-place "assign them, *see submissions*" (the Phase 5 wording) presumes per-teacher assignment scoping, which is Phase 3 (assignments / opaque tokens / roster identity). Today submissions key to activity + student identity with no per-assigning-teacher view, so the **author would see one shared pool across all consumers** — fine for the author, but a consuming teacher does not get a scoped dashboard until Phase 3. The **Phase 2-feasible slice is therefore: browse + assign/print/run (the student-facing experience)**; per-consumer dashboards trail into Phase 3. Decide at kickoff whether v1 even surfaces submissions to consumers or positions catalog activities as practice/printables first.
2. **Public vs. signed-in browse** — is the catalog visible to logged-out visitors (marketing reach) or only to signed-in teachers? Changes whether the listing-read policy is fully public or authenticated.
3. **Catalog taxonomy** — free-text tags vs. a controlled subject/topic/grade vocabulary. Start simple; a controlled vocabulary is the kind of thing Phase 5 standards-alignment formalizes.
4. **Curation/quality bar** — since it's first-party only, this is just the author's editorial judgment now; community submission + moderation is the Phase 5 governance problem (provenance, similarity detection, flagging), explicitly deferred there.
5. **Where the browse route lives** — its own top-level route vs. a tab on the existing dashboard. A small UI call at implementation time.
