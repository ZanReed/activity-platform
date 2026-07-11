# Vocabulary definitions — Phase 2 design

**Status:** SHIPPED 2026-06-19; `publish-activity` redeployed 2026-07-06, so it reaches a page on its next re-publish. The inline feature is live in `packages/schema` (`DefinitionMark`), the renderer, the runtime sidecar (`runtime/definitions.ts`), and the editor. **The shipped shape is richer than the Stage-9c sketch below:** a definition carries `content` (rich text + inline math, via the shared `InlineRichTextEditor`) + an optional `image` ({src, alt}), not a bare `definition: string` — see the schema's `DefinitionMark` and STATE.md. The rest of this doc keeps the original rationale (why a mark, the data-attribute contract, the tenant-scoped Phase 4 glossary, auto-suggest) — still accurate. Phase 4 (glossary store + implicit reuse + auto-suggest) remains future work.

See ROADMAP.md "Phase 2 — Polish the loop" for the user-visible framing and "Phase 4 — Multi-tenancy" for the glossary extension.

## Why a mark, not a node

A mark is the right shape because the defined text is *still text* — it participates in line-wrapping, can have other marks layered on it (bold, italic), and the editor UX is "select text, click Define" rather than "insert a custom block." Nodes are for content that owns its own layout; marks are for properties of text runs.

## Proposed schema

\`\`\`typescript
// packages/schema/src/marks/definition.ts (PHASE 2)
// =============================================================================
// DefinitionMark — inline mark for vocabulary definitions
// =============================================================================

import { z } from 'zod';

export const DefinitionMark = z.object({
  type: z.literal('definition'),
  attrs: z.object({
    // Phase 2: literal definition typed by the teacher inline.
    definition: z.string().optional(),
    // Phase 4+: stable key into the tenant-scoped glossary store (resolved at
    // publish; see "Phase 4"). When present, glossaryKey takes priority over
    // the inline definition.
    glossaryKey: z.string().optional(),
  }).refine(
    (a) => Boolean(a.definition) || Boolean(a.glossaryKey),
    { message: 'definition mark must carry either definition or glossaryKey' }
  ),
});

export type DefinitionMark = z.infer<typeof DefinitionMark>;
\`\`\`

## Phase 4 — tenant-scoped glossary store

**Decided (2026-06-19): the glossary is account/tenant-scoped, not per-activity.** A teacher defines "factor" once for their whole account (and, under Phase 4 multi-tenancy, optionally shared at the district/org level) and every marked instance across every activity resolves to it. This rules out the originally-sketched `ActivityMeta.glossary`, which would have scoped a definition to a single document; the glossary moves *out* of the activity document into a tenant-level store the publish pipeline reads. The mark is unchanged — it still carries only a stable `glossaryKey` string (see the Phase-2 schema above), now resolving against the tenant store rather than anything in the document.

\`\`\`sql
-- New tenant-scoped table when Phase 4 lands (NOT a field on the activity doc).
create table glossary_entry (
  owner_id   uuid not null references ...,   -- tenant/account scope
  key        text not null,                  -- stable key, e.g. "factor-noun"
  term       text not null,                  -- display term ("factor")
  definition text not null,                  -- full definition text
  primary key (owner_id, key)
);
-- RLS: owner-scoped via the existing ownership helpers (do NOT inline the
-- ownership check). District/org sharing is a further Phase 4 multi-tenancy
-- nuance — see STATE.md open questions "Multi-tenancy / governance".
\`\`\`

Stable key, not term, for the same reason `blank.id` is stable: two senses of "factor" need separate entries, and renaming a term in the editor shouldn't break every reference to it.

**Resolution happens at publish, not render.** The renderer stays pure (JSON-in, HTML-out, no I/O), so it can't read the tenant store. The `publish-activity` Edge Function fetches the owner's glossary and either (a) bakes the resolved text into `data-definition` on each span — simple, but a published page goes stale until it is republished after a glossary edit — or (b) emits `data-glossary-key` and ships a per-tenant glossary JSON the runtime fetches at init (the "glossary map passed in at init time" the Runtime-behavior section anticipates) — live updates, at the cost of a fetch plus a hosting location for that JSON. Decide at Phase 4 implementation; (a) is the smaller first step and (b) can layer on later without a contract change, since both attributes are already reserved.

**This scoping choice does not affect Phase-2 forward-compat.** Tenant-scoping changes only *where the map lives* (a DB table vs. the activity doc), never the mark — which still just gains an optional `glossaryKey`. Shipping the inline version first stays safe. Promoting existing inline definitions later = collect distinct `(term, definition)` pairs across the account into `glossary_entry`, then add `glossaryKey` to each mark: a scriptable, additive transform whose only manual step is disambiguating same-term/different-sense entries.

### Two glossary shapes — implicit reuse (preferred) vs. managed

The same tenant `glossary_entry` store can power two very different teacher experiences; which one we surface is a UI/product choice, not a schema fork.

- **Implicit reuse (preferred direction, decided 2026-06-19).** No glossary a teacher has to curate. As a teacher writes inline definitions, the platform passively records them per account/tenant and offers them back as suggestions the next time the same term is defined — cross-activity reuse for free, no list to manage ("the site acts like the glossary as needed"). Lighter build: a write-through `(term → recent definition)` cache plus a suggestion in the Define popover. This is the default intent.
- **Managed glossary (heavier, optional, later).** A teacher curates an explicit list, edits "factor" once, and every `glossaryKey`-referencing instance updates at publish. Needs a management UI + glossaryKey resolution (see above).

**Decision (2026-06-19): lead with implicit reuse; an official managed glossary, if built, is opt-in and never forced.** A teacher may choose to lean on a curated glossary as their default, but the no-friction implicit-reuse behavior stays the baseline for everyone who doesn't. Both models read the same tenant store, so committing to the light model now forecloses nothing. Sibling to the Auto-suggest editor aid below, under the same "help, never force" philosophy.

## Auto-suggest (Phase 4+ editor aid) — never silent, never automatic

Once the tenant glossary exists, the obvious labor-saver is "auto-define every word that matches the glossary." The fully-automatic version is the wrong call here and is explicitly **not** what this section proposes — see "Why not silent auto-apply" below. The defensible version flips three knobs and keeps the teacher in the loop:

- **Suggest, don't apply.** Surface candidate matches in the *editor* (spellcheck-style squiggle/highlight on glossary terms that aren't yet marked). The teacher one-click accepts or dismisses each. Acceptance mints a normal definition mark; dismissal does nothing.
- **First-occurrence-only** is the default surfacing rule (how textbook glossaries behave): suggest the first un-marked instance per section, not every instance.
- **Opt-in**, off by default — a per-activity toggle (and optionally per-term), so a teacher who wants the firehose can have it but nobody gets it unasked.

**Why this is architecturally cheap (and why it can wait):** auto-suggest is a *pure editor affordance*. Accepting a suggestion creates the exact same `glossaryKey` definition mark a teacher would create by hand — same schema, same [data-attribute contract](#data-attribute-contract-renderer-output), same publish path, same determinism. The suggestion engine reads the tenant glossary (already fetched for the editor) and scans text nodes for matches; nothing about the renderer, runtime, or wire format changes. So this is additive editor work for Phase 4+ — it does **not** need to be designed now, and shipping the manual "select → Define" flow first loses nothing.

**Why not silent auto-apply** (the guardrail this design commits to — don't relitigate without revisiting these):

1. **Word-sense ambiguity.** The stable-key split (`factor-noun` vs. `factor-verb`) exists *because* string-matching can't tell which sense a sentence means; auto-applying would attach the wrong definition confidently and silently. A human accept/reject step is the disambiguation.
2. **Over-marking kills the signal.** Marking every instance turns the page into a sea of underlines and students tune the cue out; the value is in its scarcity. First-occurrence-only + opt-in counter this.
3. **Teacher intent.** Scaffolding is deliberate (the hard word, the first time — not the tenth). Suggest-don't-apply preserves that judgment.
4. **Assessment integrity.** A term must NOT be auto-defined inside a problem that is testing whether the student knows that term. A blanket matcher can't see that intent; a confirming human can.
5. **Determinism.** Because suggestions become real document marks at author time (not magic applied at render/publish), published output stays reviewable and doesn't retroactively change when the glossary grows.

**Hard "never":** never auto-define silently at render or publish; never blanket-mark every occurrence by default; never mark a term inside a problem that assesses that term.

## Data-attribute contract (renderer output)

\`\`\`html
<span class="definition"
      data-definition="..."      <!-- HTML-entity-escaped string  -->
      data-glossary-key="..."    <!-- Phase 4+; optional in Phase 2 -->
      tabindex="0"
      role="button"
      aria-haspopup="dialog">factor</span>
\`\`\`

This is additive to the frozen data-attribute contract. Attribute names are chosen now so the Phase 4 glossary layer doesn't require a rename.

## Runtime behavior

On init, query `.definition` spans and attach click/tap + keydown handlers (Enter/Space to open, Esc to close). Popover positioned via floating-ui. Focus returns to the trigger on close (managed dialog pattern). Definition text is read from `data-definition` (Phase 2) or resolved via a glossary map passed in at init time (Phase 4).

## What this design does NOT decide

1. **Tiptap mark UI affordance** — toolbar button vs. slash menu vs. context menu. Probably toolbar button next to bold/italic, but depends on what the toolbar looks like by the time Phase 2 lands.
2. **Popover library specifics** — floating-ui or @floating-ui/react? The runtime side is vanilla (can't pull in React); the editor side can use whichever fits the rest of the app.
3. **Definition editing UX** — inline edit (click the marked word, edit popover appears) vs. side panel. Probably inline with a "see all definitions" panel as a Phase 4 extension.
4. **Print behavior** — definitions as inline footnotes, bottom-of-page appendix, or just hidden. Decide at Stage 11 / Phase 2 implementation.
5. **Mobile/touch interaction** — tap-triggers-popover is cleaner than hover, and hover-on-desktop creates a dual interaction model. Probably tap-only across platforms, with the underline + cursor change communicating affordance.

None of these affect the schema or the data-attribute contract, so they're safe to defer.
