// =============================================================================
// TimezoneControl — "Days follow Auckland time · Change" (PP-11, 0088)
// -----------------------------------------------------------------------------
// One per teacher, not per class: the zone moves the day for ALL their classes,
// and the control says so before anything is saved. Unset (the Chicago
// default) and the browser disagrees: a one-click offer, never a silent write.
// Used on My classes now and on the Plan page when it lands (PP-1).
// =============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    browserZone,
    fetchMyTimezone,
    offerZone,
    saveMyTimezone,
    zoneCity,
    zoneOptions,
    type MyTimezone,
} from '../lib/teacherTimezone';

const WARNING =
    'This moves the day for all your classes: practice, due dates, Today and the plan. Best done outside class time.';

const LINK = 'font-medium text-muted underline underline-offset-2 hover:text-strong';

export default function TimezoneControl() {
    const [mine, setMine] = useState<MyTimezone | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [choice, setChoice] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savedNote, setSavedNote] = useState('');
    const browser = useMemo(() => browserZone(), []);
    // Focus returns to "Change" after Save, Cancel or the offer (never <body>).
    const changeRef = useRef<HTMLButtonElement>(null);
    const [refocus, setRefocus] = useState(false);
    useEffect(() => {
        if (refocus && !editing) {
            changeRef.current?.focus();
            setRefocus(false);
        }
    }, [refocus, editing]);

    useEffect(() => {
        let cancelled = false;
        fetchMyTimezone()
            .then((m) => {
                if (!cancelled) setMine(m);
            })
            .catch((err: unknown) => {
                if (!cancelled) setLoadError(err instanceof Error ? err.message : 'could not load');
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const save = async (zone: string) => {
        setSaving(true);
        setSaveError(null);
        try {
            const next = await saveMyTimezone(zone);
            setMine(next);
            setSavedNote(`Saved: days now follow ${zoneCity(next.zone)} time.`);
            setEditing(false);
            setRefocus(true);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Not saved.');
        } finally {
            setSaving(false);
        }
    };

    if (loadError) {
        return (
            <p className="text-xs text-muted" data-timezone-control>
                Your timezone couldn’t be loaded ({loadError}).
            </p>
        );
    }
    if (!mine) return null;

    const offer = offerZone(mine, browser);

    return (
        <section aria-label="Your timezone" className="text-sm text-muted" data-timezone-control>
            {!editing && (
                <p>
                    Days follow <span className="font-medium text-strong">{zoneCity(mine.zone)}</span> time
                    {!mine.isSet && ' (the default)'}
                    {' · '}
                    <button
                        ref={changeRef}
                        type="button"
                        className={LINK}
                        aria-label="Change your timezone"
                        onClick={() => {
                            setChoice(mine.zone);
                            setSaveError(null);
                            setSavedNote('');
                            setEditing(true);
                        }}
                    >
                        Change
                    </button>
                </p>
            )}
            {!editing && offer && (
                <div className="mt-2 rounded-md border border-line bg-canvas px-3 py-2" data-timezone-offer>
                    <p className="text-strong">
                        Your classes follow {zoneCity(mine.zone)} time. Use {zoneCity(offer)} time?
                    </p>
                    <p className="mt-1 text-xs">{WARNING}</p>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={() => void save(offer)}
                        className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
                    >
                        {saving ? 'Saving…' : `Use ${zoneCity(offer)} time`}
                    </button>
                </div>
            )}
            {editing && (
                <form
                    className="mt-1 flex flex-wrap items-center gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void save(choice);
                    }}
                >
                    <label htmlFor="teacher-timezone" className="text-strong">
                        Days follow
                    </label>
                    <select
                        id="teacher-timezone"
                        aria-describedby="teacher-timezone-warning"
                        value={choice}
                        onChange={(e) => setChoice(e.target.value)}
                        className="rounded-md border border-line-strong bg-canvas px-2 py-1 text-sm text-ink"
                    >
                        {zoneOptions(mine.zone).map((z) => (
                            <option key={z} value={z}>
                                {z.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        disabled={saving || (mine.isSet && choice === mine.zone)}
                        className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                        type="button"
                        className={LINK}
                        onClick={() => {
                            setEditing(false);
                            setRefocus(true);
                        }}
                    >
                        Cancel
                    </button>
                    <p id="teacher-timezone-warning" className="basis-full text-xs">
                        {WARNING}
                    </p>
                </form>
            )}
            <p role="status" className="sr-only">
                {savedNote}
            </p>
            {saveError && (
                <p role="alert" className="mt-1 text-xs text-danger">
                    {saveError}
                </p>
            )}
        </section>
    );
}
