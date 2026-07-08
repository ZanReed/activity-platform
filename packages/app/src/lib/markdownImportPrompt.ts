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
    'GRAPHS (a fenced block with the `graph` tag becomes a coordinate-plane question)',
    '- ```graph … ``` with one statement per line:',
    '    axes: -10..10, -10..10        (optional; this is the default window)',
    '    prompt: Graph the inequality.',
    '    answer: y > 2x + 1',
    '    options: partial-credit, allow-no-solution',
    '- The answer line takes ANY equation format (y = 2x + 3, 2x + 3y = 6,',
    '  y - 5 = 2(x - 1), x^2 - 4, x = 4, optionally "… for x >= 0"), an',
    '  inequality (the <, <=, >, >= sign sets the dotted/solid boundary and the',
    '  shaded side), a point list like (2, 3), (4, 5), a region like',
    '  region (0,0), (4,0), (2,4), or the word none for a "cannot be graphed"',
    '  trick question. Supported answer curves: linear, quadratic, exponential,',
    '  logarithmic, and vertical lines.',
    '- The prompt line may include inline math: prompt: Graph $y = 2x + 3$.',
    '- For an ungraded figure, use show: lines instead of an answer:',
    '    show: point (2, 3) closed "A"',
    '    show: line y = x dashed',
    '    show: expression sin(x)      (plots any formula)',
    '    show: ray (0,0) (2,1) open',
    '',
    'OTHER',
    '- Bold **like this**, italic *like this*, inline code `like this`.',
    '- Images:  ![a short description](https://full-image-url)',
    '- Don\'t use tables, blockquotes, links, or any code block inside the activity',
    '  other than ```graph — only the single outer block that wraps the whole',
    '  reply and ```graph fences are allowed; anything unsupported imports as',
    '  plain text.',
    '',
    'When I describe the activity I want, reply with only that single code block.',
].join('\n');
