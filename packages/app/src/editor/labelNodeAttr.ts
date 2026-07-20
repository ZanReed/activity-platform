// Shared Tiptap node attribute for the per-block display label (numbering/label
// decouple). Spread `...labelNodeAttr` into a node's addAttributes() return so
// every labeled block stores the label identically. null = auto (the default);
// {mode:'custom',text} / {mode:'none'} are the opt-outs. Stored as JSON in
// data-label for copy-paste fidelity; the canonical persistence path is
// serialize.ts (applyLabelFromNode / applyLabelToNode).

type LabelValue = { mode: string; text?: string } | null;

export const labelNodeAttr = {
    label: {
        default: null as LabelValue,
        parseHTML: (element: HTMLElement): LabelValue => {
            const raw = element.getAttribute('data-label');
            if (!raw) return null;
            try {
                const parsed = JSON.parse(raw);
                return parsed &&
                    typeof parsed === 'object' &&
                    typeof parsed.mode === 'string'
                    ? parsed
                    : null;
            } catch {
                return null;
            }
        },
        renderHTML: (attributes: Record<string, unknown>) => {
            const v = attributes.label as LabelValue;
            return v && typeof v === 'object'
                ? { 'data-label': JSON.stringify(v) }
                : {};
        },
    },
};
