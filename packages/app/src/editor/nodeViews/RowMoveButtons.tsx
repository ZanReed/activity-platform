import type { MouseEvent } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

/**
 * The list with the entry at `index` moved one place up (-1) or down (+1), or
 * null when it is already at that end. Lists are keyed by id everywhere they
 * are stored (answer keys, bindings, figures), so moving an entry changes only
 * the order a teacher and a student see.
 */
export function moveAt<T>(list: readonly T[], index: number, delta: -1 | 1): T[] | null {
    const to = index + delta;
    if (to < 0 || to >= list.length || index < 0 || index >= list.length) return null;
    const next = list.slice();
    const [entry] = next.splice(index, 1);
    if (entry === undefined) return null;
    next.splice(to, 0, entry);
    return next;
}

/**
 * Move up / Move down for one row of an answer list (ordering steps, choices,
 * matching items and options, correspondence items and cards). `what` names the
 * row the way its other buttons do ("choice B", "item 2").
 */
export function RowMoveButtons({
    index,
    count,
    what,
    disabled,
    onMove,
}: {
    index: number;
    count: number;
    what: string;
    disabled: boolean;
    onMove: (delta: -1 | 1) => void;
}) {
    // The row is keyed by id, so React MOVES its DOM node rather than
    // rebuilding it — but the move blurs the pressed button, and at either end
    // the button disables under the focus. Put focus back on the row's button
    // for the same direction, or the other one once the row reaches an end, so
    // a keyboard user can keep pressing.
    const press = (event: MouseEvent<HTMLButtonElement>, delta: -1 | 1) => {
        const group = event.currentTarget.parentElement;
        onMove(delta);
        requestAnimationFrame(() => {
            const same = group?.querySelector<HTMLButtonElement>(`[data-move="${delta}"]`);
            const other = group?.querySelector<HTMLButtonElement>(`[data-move="${-delta}"]`);
            (same && !same.disabled ? same : other)?.focus();
        });
    };
    return (
        <>
            <button
                type="button"
                className="mc-block__row-btn"
                data-move="-1"
                onClick={(event) => press(event, -1)}
                aria-label={`Move ${what} up`}
                title="Move up"
                disabled={disabled || index === 0}
            >
                <ArrowUp size={14} aria-hidden="true" />
            </button>
            <button
                type="button"
                className="mc-block__row-btn"
                data-move="1"
                onClick={(event) => press(event, 1)}
                aria-label={`Move ${what} down`}
                title="Move down"
                disabled={disabled || index === count - 1}
            >
                <ArrowDown size={14} aria-hidden="true" />
            </button>
        </>
    );
}
