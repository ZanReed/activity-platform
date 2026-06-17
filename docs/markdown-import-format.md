# Markdown import format

The reference for the **Import from markdown** feature: paste Markdown into the editor (the **Import markdown** button in an activity's header) and it becomes editable activity blocks. This page is written for two audiences:

1. **Teachers** writing or pasting Markdown by hand.
2. **AI assistants** — the importer is built to consume model-generated Markdown, so this format is the contract a model writes to. The same format is the planned transcription target for [PDF import](design/pdf-import.md); investing in a clear spec here pays off there too.

The importer is deterministic, additive, and never destructive: anything it doesn't understand is flattened to plain text with a visible warning, never dropped silently and never able to corrupt the document. The authoritative behavior lives in [`packages/app/src/lib/markdownToTiptap.ts`](../packages/app/src/lib/markdownToTiptap.ts); this page mirrors it.

> **Shortcut:** the Import dialog has a **Copy AI prompt** button that copies the [prompt block below](#prompt-to-paste-into-an-ai-assistant) to your clipboard. Paste it into ChatGPT or Claude, then describe the activity you want.

## Quick reference

| You write | You get |
|---|---|
| `#`, `##`, `###` | Heading levels 1–3 (`####`+ clamp to 3) |
| a blank line between blocks | separate blocks — this is how you separate problems |
| `**bold**`, `*italic*`, `` `code` `` | text formatting |
| `-` / `*` / `+` lists, `1.` lists, indent to nest | bullet / ordered lists |
| `{{answer}}` | a fill-in-the-blank with that answer |
| `{{answer\|alt1\|alt2}}` | a blank whose alternates after `\|` are also accepted |
| a paragraph containing `{{…}}` | a **fill-in-the-blank problem block** |
| a list whose items contain `{{…}}` | **one problem block per item** |
| `## Topic {checkpoint}` | a **checkpoint section break** titled "Topic" |
| `$x^2$` | inline math |
| `$$ … $$` on its own paragraph | a display math block |
| `![alt](https://url)` | an image block |

## Rules that matter

- **Separate every problem (and every block) with a blank line.** Consecutive non-blank lines are one paragraph in Markdown, so they merge into a single block. One blank line = a new block.
- **Blanks only work in paragraphs and list items.** A `{{…}}` inside a heading stays literal text (headings can't hold blanks).
- **A blank needs at least one character.** `{{}}` is treated as literal text, not a blank. Put a real answer in the braces.
- **A list of problems flattens.** If each item of a numbered or bulleted list contains a blank, the list becomes one problem block per item (the editor re-numbers them). A list with no blanks stays an ordinary list.
- **Display math must stand alone.** `$$…$$` becomes a block-level equation only when it is its own paragraph (blank line above and below). Inline `$…$` can appear anywhere in a line.
- **Inline math has a guard.** A lone `$` or currency like `$5 and $10` is *not* treated as math — only a properly closed `$…$` with no space just inside the delimiters.
- **Write real LaTeX in math.** Backslash commands (`\frac`, `\sum`, `\int`, `\,`) are preserved exactly.
- **Image URLs must be absolute** (`https://…`). A relative or empty URL is skipped with a warning.
- **Don't wrap the whole document in a code fence.** A model that returns everything inside ```` ``` ```` will have the entire activity imported as one plain-text block.

## Not supported (degrades to plain text, with a warning)

Tables, fenced/indented code blocks, blockquotes, raw HTML, links (the link text is kept, the URL dropped), and strikethrough. These import as plain paragraphs/text and surface a note in the dialog so you can fix them by hand. (Callouts and other block types beyond fill-in-the-blank have no Markdown round-trip yet.)

## Worked example

Input:

```markdown
# Cell Biology {checkpoint}

The powerhouse of the cell is the {{mitochondria}}.

1. Water is made of hydrogen and {{oxygen|O2}}.
2. The area of a triangle is $\frac{1}{2}bh$, so for b = 6, h = 4 the area is {{12}}.

$$E = mc^2$$

![a labelled cell diagram](https://example.com/cell.png)
```

Becomes: a **checkpoint section** titled "Cell Biology", a **fill-in-the-blank** problem (answer `mitochondria`), **two more problems** from the numbered list (one accepting `oxygen` or `O2`, one with inline math and answer `12`), a **display equation**, and an **image block**.

## Prompt to paste into an AI assistant

This is the exact text behind the dialog's **Copy AI prompt** button. Paste it into ChatGPT/Claude, then describe the activity you want:

```text
You are writing a classroom activity that I will import by pasting Markdown.
Follow these formatting rules exactly, and output ONLY the Markdown — do not
wrap your whole answer in a code block and do not add any commentary.

STRUCTURE
- Headings use #, ##, ### (three levels only).
- Put a blank line between every block. Each problem must be its own
  paragraph separated by a blank line — lines that touch merge into one block.
- To start a new checkpoint section, end a heading with {checkpoint}:
  ## Part 2 {checkpoint}

FILL-IN-THE-BLANK
- Wrap each answer in double curly braces:  The capital of France is {{Paris}}.
- Offer alternate accepted answers with vertical bars:  made of hydrogen and {{oxygen|O2}}.
- Always put a real answer inside the braces (an empty {{}} is ignored).
- Blanks work only in normal paragraphs and list items — never inside a heading.
- A numbered or bulleted list whose items each contain a blank becomes one
  problem per item — a clean way to write a problem set.

MATH (write real LaTeX)
- Inline math between single dollar signs:  the area is $\frac{1}{2}bh$
- A displayed equation on its own line, with a blank line above and below:

  $$\int_0^1 x\,dx = \frac{1}{2}$$

OTHER
- Bold **like this**, italic *like this*, inline code `like this`.
- Images:  ![a short description](https://full-image-url)
- Do NOT use tables, fenced code blocks, blockquotes, or links — they are not
  supported and will be flattened to plain text.

When I describe the activity I want, reply with only the formatted Markdown.
```

> Keep this block in sync with `MARKDOWN_IMPORT_AI_PROMPT` in [`packages/app/src/lib/markdownImportPrompt.ts`](../packages/app/src/lib/markdownImportPrompt.ts) and the converter rules in `markdownToTiptap.ts`.
