import { useEffect, useRef, useState } from 'react';
import {
    fetchMisconceptionList,
    MISCONCEPTION_HELP,
    searchMisconceptions,
    type MisconceptionEntry,
} from '../../lib/misconceptionList';

// =============================================================================
// MisconceptionField — which misconception a wrong answer shows (GUI amendment
// 2026-11-12, M-1…M-6). One field, used by the blank popover's mistake rows,
// a multiple-choice choice's feedback, and a graph's anticipated mistakes.
//
// Ids are picked from the course list, never typed (M-2): an id nobody's list
// describes would show unlabelled on the class misconception view. An id
// already on the activity but missing from the list stays, and says so.
// The list is fetched only when a field has an id or a search opens (M-5).
//
// Keys stay inside the field while searching (Fable review): Escape closes the
// search, not the blank popover around it, and focus returns to the button
// that opened it. Enter picks the first match.
// =============================================================================

const SHOWN = 8;

function useList(active: boolean): { list: MisconceptionEntry[] | null; failed: boolean } {
    const [list, setList] = useState<MisconceptionEntry[] | null>(null);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        if (!active || list) return;
        let live = true;
        setFailed(false);
        fetchMisconceptionList().then(
            (l) => {
                if (!live) return;
                setList(l);
                setFailed(false);
            },
            () => live && setFailed(true),
        );
        return () => {
            live = false;
        };
    }, [active, list]);
    return { list, failed };
}

/** What the chip says: the description, nothing while loading, or that the
 *  id isn't in the list. An entry with no description is still IN the list. */
function chipText(value: string, list: readonly MisconceptionEntry[] | null): string | null {
    if (!list) return null;
    const entry = list.find((e) => e.id === value);
    if (!entry) return 'Not in the course list';
    return entry.description;
}

export default function MisconceptionField({
    value,
    onChange,
    disabled = false,
    note,
    context,
}: {
    value: string | undefined;
    onChange: (id: string | undefined) => void;
    disabled?: boolean;
    /** A line under the field, e.g. why a correct choice never records it. */
    note?: string;
    /** Names the answer in labels, e.g. "choice B". */
    context: string;
}) {
    const [searching, setSearching] = useState(false);
    const [query, setQuery] = useState('');
    const { list, failed } = useList(searching || value !== undefined);
    const rootRef = useRef<HTMLDivElement>(null);
    const wasSearching = useRef(false);
    const matches = list ? searchMisconceptions(list, query, list.length) : [];
    const results = matches.slice(0, SHOWN);

    // Back to the Add / Change button when the search closes.
    useEffect(() => {
        if (wasSearching.current && !searching) {
            rootRef.current?.querySelector<HTMLButtonElement>('[data-misconception-trigger]')?.focus();
        }
        wasSearching.current = searching;
    }, [searching]);

    const close = () => {
        setSearching(false);
        setQuery('');
    };
    const pick = (id: string) => {
        onChange(id);
        close();
    };

    return (
        <div className="misconception-field" data-misconception-field="true" ref={rootRef}>
            <span className="misconception-field__label">Misconception</span>
            {value !== undefined && !searching && (
                <div className="misconception-field__chip">
                    <span>
                        {chipText(value, list)}
                        <code className="misconception-field__id">{value}</code>
                    </span>
                    <button
                        type="button"
                        data-misconception-trigger
                        disabled={disabled}
                        onClick={() => setSearching(true)}
                        aria-label={`Change the misconception for ${context}`}
                    >
                        Change
                    </button>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(undefined)}
                        aria-label={`Remove the misconception from ${context}`}
                    >
                        Remove
                    </button>
                </div>
            )}
            {value === undefined && !searching && (
                <button
                    type="button"
                    data-misconception-trigger
                    className="misconception-field__add"
                    disabled={disabled}
                    onClick={() => setSearching(true)}
                    aria-label={`Add a misconception to ${context}`}
                >
                    + Misconception
                </button>
            )}
            {searching && (
                <div
                    className="misconception-field__search"
                    onKeyDown={(e) => {
                        // Every key stays here: editor shortcuts and the blank
                        // popover's Escape must not see a key typed in a search.
                        e.stopPropagation();
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            close();
                        }
                    }}
                >
                    <input
                        type="search"
                        autoFocus
                        value={query}
                        placeholder="Search the course’s misconceptions"
                        aria-label={`Search misconceptions for ${context}`}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const first = results[0];
                                if (first) pick(first.id);
                            }
                        }}
                    />
                    {failed && <p role="status">The course’s misconceptions couldn’t load; try again later.</p>}
                    {list && (
                        <>
                            <ul className="misconception-field__results" aria-label="Matching misconceptions">
                                {results.map((e) => (
                                    <li key={e.id}>
                                        <button type="button" onClick={() => pick(e.id)}>
                                            <span>{e.description ?? e.id}</span>
                                            <code className="misconception-field__id">{e.id}</code>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <p className="misconception-field__note" role="status">
                                {matches.length === 0
                                    ? 'No misconception matches.'
                                    : matches.length > SHOWN
                                      ? `Showing ${SHOWN} of ${matches.length}. Type more to narrow it.`
                                      : ''}
                            </p>
                        </>
                    )}
                    <button type="button" onClick={close}>
                        Cancel
                    </button>
                </div>
            )}
            {failed && !searching && (
                <p className="misconception-field__note" role="status">
                    The course’s misconception names couldn’t load.
                </p>
            )}
            {(searching || value !== undefined) && <p className="misconception-field__note">{MISCONCEPTION_HELP}</p>}
            {note && <p className="misconception-field__note">{note}</p>}
        </div>
    );
}
