// =============================================================================
// TagChipInput — the one authoring control for activity tags (taxonomy R4/R5)
// -----------------------------------------------------------------------------
// Chips + a text field. Every committed value goes through normalizeTag, so
// what the chip shows is exactly what is stored and exactly what a filter
// matches — there is no separate display transform.
//
// Typeahead is a native <datalist>, deliberately (boring-by-default): it gives
// keyboard and screen-reader support for free, where a hand-rolled combobox
// would owe an aria-activedescendant/roving-focus implementation for the same
// result. The suggestion source is the author's own existing vocabulary, which
// is what keeps a hand-tagged corpus convergent — normalizeTag only fixes case
// and whitespace, never synonyms.
//
// Commit keys are Enter and comma (a comma is how people type tag lists), plus
// blur so a typed-but-uncommitted tag is never silently lost when the drawer
// closes. Backspace on an empty field removes the last chip — the standard
// affordance, and the only way to undo without reaching for the mouse.
// =============================================================================

import { useId, useState, type KeyboardEvent } from 'react';
import { normalizeTag } from '../lib/normalizeTags';

export default function TagChipInput({
    tags,
    onChange,
    vocabulary = [],
    label = 'Tags',
    help,
}: {
    tags: string[];
    onChange: (next: string[]) => void;
    /** The author's existing tags, for the datalist. Already normalized. */
    vocabulary?: readonly string[];
    label?: string;
    help?: string;
}) {
    const [draft, setDraft] = useState('');
    const inputId = useId();
    const listId = useId();

    // Commit the draft. Normalizing here (not on every keystroke) lets the
    // author type "Word Problems" and see it become "word problems" only on
    // commit, which reads as tidying rather than as the field fighting them.
    const commit = () => {
        const tag = normalizeTag(draft);
        setDraft('');
        if (tag === null) return;
        if (tags.includes(tag)) return; // silent no-op: the chip is already there
        onChange([...tags, tag]);
    };

    const removeAt = (i: number) => {
        onChange(tags.filter((_, ix) => ix !== i));
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            // Enter inside the drawer must not bubble into a form submit or the
            // editor beneath; comma must not land as a literal character.
            e.preventDefault();
            commit();
            return;
        }
        if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
            e.preventDefault();
            removeAt(tags.length - 1);
        }
    };

    // Only suggest what isn't already applied — a datalist that keeps offering
    // the chip you just added reads as broken.
    const suggestions = vocabulary.filter((v) => !tags.includes(v));

    return (
        <div>
            <label
                className="text-xs font-semibold uppercase tracking-wide text-muted"
                htmlFor={inputId}
            >
                {label}
            </label>

            {tags.length > 0 && (
                <ul className="mb-1.5 mt-1 flex flex-wrap gap-1.5">
                    {tags.map((tag, i) => (
                        <li
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-0.5 pl-2 pr-1 text-xs text-ink"
                        >
                            <span>{tag}</span>
                            <button
                                type="button"
                                onClick={() => removeAt(i)}
                                aria-label={`Remove tag ${tag}`}
                                className="rounded-full px-1 leading-none text-muted transition hover:bg-line hover:text-ink"
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <input
                id={inputId}
                list={listId}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={commit}
                placeholder="Add a tag…"
                className="w-full rounded-md border border-line-strong bg-canvas px-2 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <datalist id={listId}>
                {suggestions.map((v) => (
                    <option key={v} value={v} />
                ))}
            </datalist>

            <p className="mt-1 text-xs text-muted">
                {help ??
                    'Enter or comma to add. Used to find activities across units — role words like “review” belong in Bank role, not here.'}
            </p>
        </div>
    );
}
