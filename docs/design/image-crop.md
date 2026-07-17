# Image crop mode (design) — 2026-07-17

`office-hours` design doc for the Group 3 deferred item "Image crop mode."
Feeds `/plan-eng-review`. Problem + intent were ruled by the author
(editor-refinement-pass.md, 2026-07-16); this doc locks the technical design.

## Problem

Teachers paste/upload images that need reframing — crop out a caption bar,
zoom to the relevant diagram region, drop dead margin. Today's image block
has NO real crop. The `height` field (rem) + `object-fit: cover` only
**center-crops**: you can shorten the box, but you can't choose *which* part
of the image shows, and you can't zoom into a sub-region. The author called the
popover's width/height chip rows the "terrible buttons."

## Ruling (author, 2026-07-16) — the fixed premises

- **Crop = an author-chosen rectangle (reframe), not center-cover.** Drag a
  frame to pick the visible region + zoom.
- **`height` (fixed rem) is REMOVED, folded into crop.** Width (scale) controls
  print footprint; crop controls framing. A separate rem-height axis is the
  confusing third control.
- **Scale (width) stays a drag-handle**, unchanged. Crop is orthogonal.
- **caption / alt → the descriptor drawer.** The command-bar "Edit" primary and
  the popover's width/height chip rows are removed.
- **Renders cross-browser with plain CSS, NOT `object-view-box`** (experimental;
  Firefox/Safari gaps as of 2026-07 — https://caniuse.com/mdn-css_properties_object-view-box).
  The pure renderer can't read image pixels, so the editor stores what CSS needs.

All four confirmed via `/office-hours` premise check (2026-07-17).

## Chosen model — Approach A: crop rect + stored aspect, wrapper + absolute img

Ratified 2026-07-17 over B (object-fit cover + object-position — pan only, no
zoom) and C (object-view-box + fallback — experimental, reopens the CSS premise,
fallback collapses into A anyway).

### Schema (additive, optional)

```
ImageBlock.crop?: {
  x: number,   // [0,1) left of the visible window, fraction of source width
  y: number,   // [0,1) top of the visible window, fraction of source height
  w: number,   // (0,1] width of the window, fraction of source width
  h: number,   // (0,1] height of the window, fraction of source height
}
ImageBlock.srcAspect?: number  // the SOURCE image's natural W/H ratio, captured
                               // by the editor from the loaded <img> on set/swap.
                               // Stable per src; the renderer derives the crop
                               // window's pixel aspect A = srcAspect·(w/h).
```
- **Aspect storage (eng-review B, 2026-07-17):** store the source's natural
  aspect ONCE (`srcAspect`), NOT a per-crop `aspect`. Crop-frame edits write
  only `{x,y,w,h}`; `srcAspect` changes only on src set/swap. The renderer
  derives `A = srcAspect·(w/h)`. This removes the rect↔aspect desync class (a
  bug that updated one but not the other would silently distort the image).
- `x+w ≤ 1`, `y+h ≤ 1` (window stays inside the source). Full-image crop
  (`0,0,1,1`) is never stored — absent = uncropped (omit-when-default, like
  `width`/`align`).
- **`srcAspect` is stored ONLY alongside `crop` — both-or-neither (test-spec,
  2026-07-17).** The editor writes `crop` + `srcAspect` together at crop-apply
  (it has the loaded `<img>` then); uncropped images carry NEITHER, so they stay
  byte-identical to today. Clearing `src` or resetting crop clears both. The
  renderer reads `srcAspect` only when `crop` is present. (This preserves the
  uncropped-identity invariant — storing `srcAspect` on every image would break
  it.)
- **`height` is removed** from the schema (no `.strict()` anywhere in
  packages/schema, and only renderer/image + ImageView read it — clean removal).

### Render (packages/renderer/src/blocks/image.ts)

```
CROPPED                                        UNCROPPED (today, unchanged)
<figure class="block-image is-cropped"         <figure class="block-image"
        style="aspect-ratio: A">                       ...>
  <img style="                                    <img src alt loading decoding>
    position:absolute;                          </figure>
    width:  (100/w)%;   height: (100/h)%;
    left:  -(x/w·100)%; top:   -(y/h·100)%;
  ">
</figure>
```
where `A = srcAspect·(w/h)` (the renderer derives it). Absolute positioning
makes width/height % resolve against the wrapper's width / height respectively;
`aspect-ratio: A` on the wrapper keeps the img unstretched. Result: the [x,y,w,h]
window exactly fills the figure, at any zoom, in every browser. `overflow:
hidden` on `.block-image.is-cropped` clips the rest. Block sizing
(`width`/`align`) composes: the wrapper still takes `--block-width`;
`aspect-ratio` sets its height.

**Why store `srcAspect`:** the renderer is pure (no I/O, no image dimensions),
so it can't turn a normalized rect into a pixel aspect. The editor HAS the
loaded `<img>` (knows naturalWidth/Height), captures the source ratio once, and
the renderer derives the crop aspect. Fragility: `srcAspect` goes stale if the
source is swapped — handled by **clearing `crop` + refreshing `srcAspect`
whenever `src` changes** (a crop into image X is meaningless for image Y).

### Fate of `height`

Removed. Width (fraction) + crop (reframe) cover the real needs; the absolute
rem-height was the confusing third axis the ruling targets. Consciously dropped:
"pin this image to exactly N rem tall on paper." If a teacher ever needs that,
it returns as a separate additive field — YAGNI now. **Migration:** greenfield
(author deleted test activities); Zod strips unknown keys by default, so any
stray `height` in an old doc is ignored, not a validation error. Confirm the
image schema isn't `.strict()` before removing (else an old `height` throws).

### Interaction (packages/app/src/editor/nodeViews/ImageView.tsx)

```
[selected image] --Crop-->  CROP MODE
  • full source shows, dimmed outside the frame
  • a draggable + resizable frame = the crop window
      - drag body → pan;  drag corner/edge handles → resize (zoom)
      - free aspect (P1: arbitrary rect); frame clamped to source bounds
  • Enter / ✓ → commit crop {x,y,w,h,aspect};  Escape → discard
```
- Own the gesture (setPointerCapture, live local preview, ONE commit on
  apply), mirroring the width-resize + ImageView gesture discipline. Crop's
  frame is 2-D (x,y,w,h) — its own gesture, NOT the shared `useBlockWidthResize`
  hook (that's 1-D width).
- Enter crop via a **command-bar primary "Crop"** on the selected image.

### Editing-surface decomposition (the ruling's "caption/alt → drawer")

```
BEFORE (one popover)                  AFTER
─────────────────────                 ─────────────────────────────────────
ImageEditPopover:                     Command bar (image):  Crop · Replace
  Source (URL/Upload)                   (Duplicate/Delete stay universal;
  Alt, Caption                           the generic "Edit" primary removed)
  Width chips  ← "terrible"           Drawer (image `advanced`):
  Height chips ← "terrible"             Alt text, Caption, Reset crop
  Align chips                         Popover (slimmed): Source (URL/Upload) only,
                                        opened by Replace / clicking an empty image
                                      Width: stays a drag-handle (unchanged)
                                      Align: stays with width for now (out of scope
                                        to move; fold into the drawer later)
```
Removed: the popover's Width chip row, the Height row + rem input, the "Edit"
command-bar primary.

### Print

The crop wrapper is static markup (no interactive controls to hide). `aspect-
ratio` + `overflow:hidden` + absolute positioning print in modern engines.
Add a print snapshot test: a cropped image prints the cropped window, not the
full source. Baseline print CSS unaffected (crop is content, not chrome).

### Deploy

Renderer + schema change → `pnpm bundle:renderer` (commit the bundle) +
**`publish-activity` redeploy**. Additive optional `crop` → **no
`schemaVersion` bump**. Removing `height` is safe under non-strict Zod (see
Migration). **No graph-kit change, no ingest redeploy** (image doesn't use the
kit; authoring display content, not submission wire).

## Data flow

```
author drags crop frame ──► ImageView commits crop{x,y,w,h} + aspect (from the
                            loaded <img>'s naturalW/H)
   │                                   │
   │  serialize.ts: node.attrs.crop ◄──┘  ⇄  ImageBlock.crop  (round-trip,
   │                                            omit-when-uncropped)
   ▼
renderer/blocks/image.ts ──► <figure aspect-ratio:A overflow:hidden> +
                             absolute <img> window  ──►  published page (all
                             browsers) + print
src replaced ──► clear crop (aspect would be stale)
```

## What already exists (reuse, don't rebuild)

- `sizingFields` (width/align) + the generic `.block-sized` path — crop composes
  with it; the wrapper already takes `--block-width`.
- ImageView's pointer-gesture discipline (setPointerCapture / live preview /
  one-commit / Escape) — the crop frame reuses the *pattern*, not the width hook.
- ImageEditPopover's draft-then-flush + floating-ui host — the slimmed
  source-only popover keeps it.
- The descriptor drawer + `custom`/typed field system — alt/caption/reset-crop
  drop in as drawer fields (same as the other blocks' settings moved to drawer).

## NOT in scope

- Aspect-lock presets (1:1, 16:9) in crop mode — free-aspect first; presets are
  additive later.
- Moving `width`/`align` fully into the drawer — width stays a drag-handle
  (ruling); align stays with it for now.
- Re-cropping across a source swap (crop clears on `src` change by design).
- `object-view-box` (rejected — experimental).
- Absolute rem-height (dropped with `height`; returns as a separate field only
  on real demand).

## Open questions (confirm at eng review / build)

1. Is `ImageBlock` Zod `.strict()`? If yes, removing `height` needs a deliberate
   drop of stray keys, not silent strip.
2. Crop-mode frame: does the dimmed source render the full image at natural
   aspect inside the selected block width, or a fixed working canvas? (Affects
   how handles map to normalized coords.)
3. Does the slimmed popover survive, or does "Replace" open a minimal source
   dialog and the popover retire entirely?

## Test net (input to /test-spec)

```
[+] schema/blocks/image.ts
  ├── crop bounds: x+w≤1, y+h≤1, w/h∈(0,1] accepted; out-of-range rejected   [unit]
  ├── srcAspect positive; absent still validates (additive)                   [unit]
  └── a stray `height` key is IGNORED (not .strict), not a validation error   [unit]
[+] renderer/blocks/image.ts   ◄── LOAD-BEARING render math
  ├── cropped → aspect-ratio = srcAspect·(w/h); img width (100/w)%, height
  │   (100/h)%, left -(x/w·100)%, top -(y/h·100)%; .is-cropped + overflow      [unit]
  ├── uncropped → byte-identical to today (identity)                          [unit]
  └── @media print → cropped window prints, not the full source               [unit snapshot]
[+] serialize.ts
  ├── crop {x,y,w,h} + srcAspect round-trip; uncropped omits crop             [unit]
  └── `height` no longer round-trips (removed)                                [unit]
[+] ImageView crop mode + commands                                           USER FLOWS
  ├── enter Crop → drag frame → apply → writes crop{x,y,w,h}                   ├── [→E2E] crop a graph-less image
  ├── Escape → discards, no commit                                            ├── [→E2E] Escape cancels
  ├── crop DISABLED until the image loads (srcAspect unknown)  ◄── MUST       ├── [GAP] tiny-crop clamp
  └── replacing src CLEARS crop + refreshes srcAspect  ◄── INVARIANT          └── [manual] real cropped page,
                                                                                    cross-browser (owner eyeball)
COVERAGE TARGET: render math + the two invariants (crop-disabled-until-load,
src-swap-clears-crop) are the load-bearing items; verify at the right layer
(render math = unit; the visual crop = one owner manual pass on a published page).
```

**Failure modes:** crop applied before load (srcAspect unknown) → **crop
disabled until load** (MUST); tiny crop (w/h→0) → clamp min crop size in the
gesture; crop + width sizing on the same wrapper → compose test; broken image +
crop → editor broken-state card (acceptable).

**Fresh-context sweep additions (test-spec, 2026-07-17) — build MUSTs:**
- **Zero/NaN `srcAspect` guard.** A viewBox-less SVG or sizeless data-URI fires
  `load` (so "disabled until load" passes) with `naturalW/H = 0` → `srcAspect =
  0/NaN` → broken render. **Disable crop when `naturalW/H === 0`** (SVG/data-URI
  is an ordinary web-image case, not fringe). Spec: CR-M8.
- **Gesture output is always in-bounds.** The crop frame clamps at the source
  edge (`x≥0, y≥0, x+w≤1, y+h≤1`) — a total function into the valid-rect space,
  never relying on schema-rejection (which would silently drop an edge crop).
  Spec: CR-INV3.
- **Gesture coordinate mapping is a tested requirement** (not just an open
  question): dragging the frame to a region must produce the matching normalized
  rect (resolves Open Q#2 into a MUST). Spec: CR-M7.
- **Cropping preserves `alt`/`src`/`loading`/`decoding`** (a11y) and
  **re-entering crop inits the frame to the existing rect** (no data loss).
  Spec: CR-M9, CR-M10.

**Perf:** none — static CSS, no runtime cost, no hot path.

## The assignment

Build order (right-sized diff, one coherent feature): schema (crop + srcAspect,
remove height) → renderer (crop wrapper + derived aspect) + bundle → serialize
round-trip → ImageView crop-mode gesture + Crop command-bar primary → popover
slim (drop width/height rows) + alt/caption/reset-crop drawer fields → editor
CSS → tests + owner cross-browser eyeball. Then `publish-activity` redeploy.

## GSTACK REVIEW REPORT

| Run | Status | Findings |
|---|---|---|
| Office-hours (design) | ✅ | 4 premises ratified; Approach A (crop rect + plain-CSS wrapper) chosen over object-fit-pan (no zoom) + object-view-box (experimental) |
| Scope challenge (Step 0) | ✅ | Right-sized (~8 files, one feature, 0 new services); `height` removal clean (no `.strict`, 2 consumers) |
| Architecture | ✅ | Store `srcAspect` once + derive crop aspect at render (kills the rect↔aspect desync class); 2-D crop gesture is its own, not the shared 1-D width hook |
| Code quality | ✅ | Reuses sizing render path, gesture discipline, popover host, drawer fields; no DRY concern |
| Tests | ⏭️ | Deferred to /test-spec: render math + 2 invariants (crop-disabled-until-load, src-swap-clears-crop) + print snapshot + serialize round-trip |
| Performance | ✅ | No issues — static CSS |

VERDICT: CLEARED — buildable. Renderer + schema (additive `crop`/`srcAspect`, no `schemaVersion` bump; `height` removed); `publish-activity` redeploy, no ingest/kit change. Owner cross-browser eyeball owed on a real cropped page.

NO UNRESOLVED DECISIONS
