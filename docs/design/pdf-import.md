# PDF → activity import — design

**Status:** design captured, not implemented (2026-06-16). A long-term authoring feature: read an existing worksheet PDF and turn it into an editable `ActivityDocument` draft. Captured ahead of implementation in the same role as `vocabulary-definitions.md` and `interactive-graph-block.md` — the open questions below are resolved at implementation kickoff, not now.

Companion to STATE.md (where things are) and ROADMAP.md (where things are going). Sibling design: `photo-grading.md` (the assessment-side OCR feature). The two were scoped together; they share the "AI as a lossy transform feeding a human-review endpoint" shape but are otherwise independent.

## The core realization: this is an AI feature, not an OCR feature

Classic OCR (Tesseract et al.) reads **characters**. The hard problem here is reading **structure** — recognizing "this is a section header," "this is a fill-in-blank," "this is a callout," "this run of text is the prompt and this gap is the answer slot." OCR gives you a wall of text; a vision-capable LLM gives you the semantics. So OCR is at most a preprocessing step, and a modern vision model lets you skip even that:

- **Born-digital PDFs** (made in Word/LaTeX/Docs) carry a text layer — extract it directly, no OCR.
- **Scanned PDFs** (photocopied worksheets) — feed the page images straight to a vision model. No separate OCR stage.

## Pipeline

```
PDF ──[vision LLM]──▶ import DSL ──[deterministic converter]──▶ Tiptap JSONContent ──▶ tiptapToActivity() ──▶ ActivityDocument
                                   └──────── shared with the queued markdown-paste import ────────┘
```

The AI does **one** thing: transcribe the page into the import DSL. Everything downstream is deterministic and already exists or is already planned. Output lands as an **editable draft in the editor** — never an auto-published activity. The teacher is the human-in-the-loop at the lossy boundary.

## The import DSL (what "AI target" means)

"Target" = the format the AI is instructed to write its output in. There are three candidate targets and the middle one wins:

| Target | Why not / why |
|---|---|
| Raw Tiptap `JSONContent` | Deeply nested, many required fields, easy for the model to malform. **No.** |
| Freeform markdown | Easy for the model, but cannot express a blank's answer key or a checkpoint section. **Too lossy.** |
| **A small import DSL** | Flat, forgiving, maps 1:1 onto the existing block types. The model produces this; one deterministic converter turns it into Tiptap. **Yes.** |

The DSL is a markdown superset whose extra syntax names the block types the editor already supports (`fill_in_blank`, `section_break` + checkpoint flag, `callout`, `heading`, `math_block`, lists, image). Sketch:

```
# Cell Biology {checkpoint}

The powerhouse of the cell is the [[mitochondria]].
Plants make food through [[__]].          <- blank, no answer on the page → import empty

> [!note] ATP is the energy currency of the cell.

1. Define osmosis.
2. Define diffusion.
```

- `[[answer]]` → fill-in-blank with that answer.
- `[[__]]` (or empty) → blank with **no** answer key.
- `> [!note] …` → callout (variant by keyword).
- `{checkpoint}` on a heading → checkpoint section break.

**Build the `DSL → Tiptap` converter once and it serves two features:** the queued **markdown-paste import** (Phase 1 polish) compiles to the same DSL, so the converter is shared work, not duplicated.

> Note: `callout` and `problem` are currently schema-only — no editor round-trip yet (see `serialize.ts`). The DSL can emit them, but the converter's coverage is bounded by what the Tiptap schema round-trips at implementation time. Sequence accordingly.

## Hard rule: transcription only, never inference (author decision, 2026-06-16)

**The AI's only job is faithful transcription of what is on the page. It must never infer or invent.**

- Capture a blank's answer **only if it is literally written on the page** (e.g. an answer-key copy, or worked solutions printed alongside).
- If a blank's answer is not on the page, import the blank **empty**. The teacher fills the answer key in the editor afterward.
- Do **not** ask the model to "solve" the worksheet.

Rationale: vision models drift when given two cognitive jobs at once (transcribe *and* reason about correctness). Pinning the model to a single job — transcribe structure + text — makes the output predictable and keeps the model focused on importing existing information. `BlankToken.answer` is required (min 1 char) at the schema level, so empty-on-import is represented as a draft state the editor flags for completion, not as a schema violation pushed to publish.

## Where it runs

An edge function calling the vision API (keeps the API key server-side), returning the DSL or the Tiptap JSON. The client renders the result into the editor as a fresh draft. No renderer/runtime/schema changes: the feature is **purely additive**, lives entirely in the app + an edge function, and reuses `tiptapToActivity()` untouched. (`tiptapToActivity` mints fresh UUIDs per call — fine here; an imported draft *wants* fresh IDs.)

## Constraint alignment

- **Renderer/runtime purity intact** — no I/O or AI in the pure packages; this is app + edge only.
- **Wire format is the contract** — the DSL is a new authoring-side wire format; version it if it ever needs incompatible changes.
- **No speculative schema fields** — the feature targets the existing block types; it does not motivate new schema.

## What this design does NOT decide

1. **DSL surface syntax** — the exact tokens (`[[ ]]`, `> [!variant]`, `{checkpoint}`) are illustrative; finalize when the converter is built.
2. **Model + prompt** — which vision model, single-pass vs. page-by-page, how the structure prompt is framed. Decide at kickoff against the then-current best Claude vision model.
3. **Answer-key alignment mode** — when a teacher uploads a worksheet *and* a separate answer key, how (or whether) to align them. v1 floor is "transcribe each independently; teacher reconciles." Alignment is an upgrade, not a v1 requirement.
4. **Math fidelity** — how reliably handwritten/typeset math becomes `math_block` / `mathInline`. Likely the weakest transcription axis; measure before promising it.
5. **Multi-page / multi-column handling** — reading order on complex layouts. Defer until real PDFs are tested.
6. **Review affordance** — how the editor flags "imported, needs answer key" blanks for the teacher. A small UI concern, decided with the editor as it stands at implementation time.
