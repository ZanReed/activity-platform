import type { MathPrompt } from '@activity/schema';

// Shared `prompts` node attribute for the math extensions (mathBlock +
// mathInline) — Model A in-equation blanks. Each prompt is a gradeable gap
// whose id matches a `\placeholder[id]{}` marker in the node's latex (schema
// MathPrompt). Persisted natively in the editor's Tiptap JSON; also mirrored to
// a `data-prompts` JSON attribute so an HTML copy/paste round-trips. Empty is
// the overwhelming common case, so renderHTML omits the attr entirely when there
// are no prompts (the width/align omit-when-default pattern) — a plain equation
// carries no Model A markup. See docs/design/math-blanks.md (Model A).
export const promptsAttribute = {
  prompts: {
    default: [] as MathPrompt[],
    parseHTML: (element: HTMLElement): MathPrompt[] => {
      const raw = element.getAttribute('data-prompts');
      if (!raw) return [];
      try {
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as MathPrompt[]) : [];
      } catch {
        return [];
      }
    },
    renderHTML: (attributes: { prompts?: MathPrompt[] }) => {
      const prompts = attributes.prompts;
      return prompts && prompts.length > 0
        ? { 'data-prompts': JSON.stringify(prompts) }
        : {};
    },
  },
};
