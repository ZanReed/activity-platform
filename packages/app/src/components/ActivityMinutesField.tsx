// =============================================================================
// ActivityMinutesField — "About how long" in the settings drawer (PP-5, 0088)
// -----------------------------------------------------------------------------
// Writes `activities.minutes` ON ITS OWN (onCommit), never through autosave:
// the autosave UPDATE carries draft_content, so a time edit riding along would
// put a draft on a published activity. Commits on blur or Enter; blank clears.
// The saved state is visible (UX rule: visible state indicators).
// =============================================================================

import { useEffect, useState } from 'react';
import { MAX_ACTIVITY_MINUTES, parseMinutesInput } from '../lib/activityMinutes';
import { SELECT_CLASS, SETTINGS_HELP_CLASS, SETTINGS_LABEL_CLASS } from './settingsClasses';

export interface ActivityTime {
    minutes: number | null;
    /** Saves the column; rejects with an Error the field shows. */
    onCommit: (next: number | null) => Promise<void>;
    /** Imported from a catalogue file: the next import replaces an app edit. */
    fromFile: boolean;
}

type Status = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; message: string };

export default function ActivityMinutesField({ minutes, onCommit, fromFile }: ActivityTime) {
    const [text, setText] = useState(minutes === null ? '' : String(minutes));
    const [status, setStatus] = useState<Status>({ kind: 'idle' });

    // A value that changes underneath (a paste filled it, or this field's own
    // save landed) shows here.
    useEffect(() => {
        setText(minutes === null ? '' : String(minutes));
    }, [minutes]);

    const commit = async () => {
        const parsed = parseMinutesInput(text);
        if (!parsed.ok) {
            setStatus({ kind: 'error', message: parsed.message });
            return;
        }
        if (parsed.minutes === minutes) {
            setText(minutes === null ? '' : String(minutes));
            if (status.kind === 'error') setStatus({ kind: 'idle' });
            return;
        }
        setStatus({ kind: 'saving' });
        try {
            await onCommit(parsed.minutes);
            setStatus({ kind: 'saved' });
        } catch (err) {
            setStatus({
                kind: 'error',
                message: `Not saved: ${err instanceof Error ? err.message : 'try again'}.`,
            });
        }
    };

    return (
        <div data-activity-minutes>
            <label className={SETTINGS_LABEL_CLASS} htmlFor="activity-minutes">
                About how long
            </label>
            <div className="flex items-center gap-2">
                <input
                    id="activity-minutes"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={3}
                    className={`${SELECT_CLASS.replace('w-full', 'w-20')}`}
                    value={text}
                    placeholder="Not set"
                    aria-describedby="activity-minutes-help"
                    aria-invalid={status.kind === 'error'}
                    onChange={(e) => {
                        setText(e.target.value);
                        if (status.kind !== 'saving') setStatus({ kind: 'idle' });
                    }}
                    onBlur={() => void commit()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            void commit();
                        }
                    }}
                />
                <span className="text-sm text-muted">min</span>
                <span role="status" className="text-xs text-muted" data-minutes-status={status.kind}>
                    {status.kind === 'saving' && 'Saving…'}
                    {status.kind === 'saved' && 'Saved'}
                </span>
            </div>
            {status.kind === 'error' && (
                <p role="alert" className="mt-1 text-xs text-danger">
                    {status.message}
                </p>
            )}
            <p id="activity-minutes-help" className={SETTINGS_HELP_CLASS}>
                Your estimate for a typical class, start to finish (1 to {MAX_ACTIVITY_MINUTES}).
                It adds up on your class plan. Leave blank if you don’t know.
                {fromFile &&
                    ' This activity comes from a file: if the file states minutes:, the next import replaces this with its value.'}
            </p>
        </div>
    );
}
