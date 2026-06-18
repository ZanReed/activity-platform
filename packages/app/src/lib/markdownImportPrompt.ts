// =============================================================================
// markdownImportPrompt.ts — the canonical "format for the importer" instruction
// -----------------------------------------------------------------------------
// A self-contained prompt block a teacher can paste into ChatGPT/Claude so the
// model emits Markdown that the activity importer (markdownToTiptap) accepts.
// The Import dialog's "Copy AI prompt" button copies this verbatim.
//
// This is the human-facing twin of the rules encoded in markdownToTiptap.ts and
// documented in docs/markdown-import-format.md — keep all three in sync when the
// accepted syntax changes. LaTeX backslashes are doubled because these are
// single-quoted strings (so `\\frac` is the literal `\frac`).
// =============================================================================

export const MARKDOWN_IMPORT_AI_PROMPT = [
    'You are writing a classroom activity that I will import by pasting Markdown.',
    'Put your ENTIRE reply inside a single fenced code block — begin and end it',
    'with a line of three backtick characters — and write nothing outside it. That',
    'makes this chat show a Copy button, so I get the raw Markdown instead of a',
    'rendered preview. Inside that block, follow these rules exactly.',
    '',
    'STRUCTURE',
    '- Headings use #, ##, ### (three levels only).',
    '- Put a blank line between every block. Each problem must be its own',
    '  paragraph separated by a blank line — lines that touch merge into one block.',
    '- To start a new checkpoint section, end a heading with {checkpoint}:',
    '  ## Part 2 {checkpoint}',
    '',
    'FILL-IN-THE-BLANK',
    '- Wrap each answer in double curly braces:  The capital of France is {{Paris}}.',
    '- Offer alternate accepted answers with vertical bars:  made of hydrogen and {{oxygen|O2}}.',
    '- When two blanks may be answered in either order (e.g. factoring), mark the',
    '  second one with a leading tilde:  (x + {{2}})(x + {{~3}}). Each answer still',
    '  counts once, so 2 and 3 in either order is right but 2 and 2 is not.',
    '- Always put a real answer inside the braces (an empty {{}} is ignored).',
    '- Blanks work only in normal paragraphs and list items — never inside a heading.',
    '- A numbered or bulleted list whose items each contain a blank becomes one',
    '  problem per item — a clean way to write a problem set.',
    '',
    'MATH (write real LaTeX)',
    '- Inline math between single dollar signs:  the area is $\\frac{1}{2}bh$',
    '- A displayed equation on its own line, with a blank line above and below:',
    '',
    '  $$\\int_0^1 x\\,dx = \\frac{1}{2}$$',
    '',
    'OTHER',
    '- Bold **like this**, italic *like this*, inline code `like this`.',
    '- Images:  ![a short description](https://full-image-url)',
    '- Don\'t use tables, blockquotes, links, or any code block inside the activity',
    '  — only the single outer block that wraps the whole reply is allowed; anything',
    '  unsupported imports as plain text.',
    '',
    'When I describe the activity I want, reply with only that single code block.',
].join('\n');
