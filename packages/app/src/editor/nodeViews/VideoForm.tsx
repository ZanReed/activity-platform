import { useState } from 'react';
import { videoHostOf } from '@activity/schema';
import type { VideoAttrs } from '../../lib/videoFence';
import { readDraft, toDraft, type Draft, type PauseDraft } from '../../lib/videoDraft';

// ============================================================================
// VideoForm — the catch-up clip's in-place form (D64 amendment 2026-11-12, V-2).
//
// It holds a DRAFT of every field and writes the node only when the whole draft
// is a valid clip, by the same rules the ```video fence applies (videoProblems).
// So a stored clip is always one the importer would accept: a half-typed link
// or a pause list mid-edit never reaches a save, and the form says what is
// stopping it. Each field checks on blur / Enter, never per keystroke.
//
// "Done" is refused while the draft has a problem; "Discard unsaved changes"
// returns to what is stored (valid fields were already written on blur).
// ============================================================================

const sameClip = (a: VideoAttrs | null, b: VideoAttrs | null) => JSON.stringify(a) === JSON.stringify(b);

export default function VideoForm({
    data,
    disabled,
    onChange,
    onDone,
}: {
    data: VideoAttrs | null;
    disabled: boolean;
    onChange: (next: VideoAttrs) => void;
    onDone: () => void;
}) {
    const [draft, setDraft] = useState<Draft>(() => toDraft(data));
    const [problems, setProblems] = useState<string[]>([]);
    const isFile = videoHostOf(draft.url.trim()) === 'file';

    // Check the whole draft and, when it is a clip, write it.
    const commit = (next: Draft = draft): boolean => {
        const read = readDraft(next, data);
        setProblems(read.problems);
        if (!read.attrs) return false;
        if (!sameClip(read.attrs, data)) onChange(read.attrs);
        return true;
    };

    const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
        }
    };
    const field = (key: 'title' | 'url' | 'captions') => ({
        value: draft[key],
        disabled,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [key]: e.target.value }),
        onBlur: () => commit(),
        onKeyDown: onEnter,
    });
    const setPause = (i: number, patch: Partial<PauseDraft>) =>
        setDraft({ ...draft, pauses: draft.pauses.map((row, j) => (j === i ? { ...row, ...patch } : row)) });

    return (
        <div className="chart-form video-form" contentEditable={false} data-video-form="true">
            <label>
                Title
                <input type="text" placeholder="Comparing decimals" {...field('title')} />
            </label>
            <label>
                Video link — YouTube, or an https .mp4 or .webm file
                <input type="url" placeholder="https://youtu.be/…" {...field('url')} />
            </label>
            {isFile && (
                <label>
                    Captions link — an https .vtt file (required for a video file)
                    <input type="url" placeholder="https://…/captions.vtt" {...field('captions')} />
                </label>
            )}
            <fieldset className="video-form__pauses" disabled={disabled}>
                <legend>Pauses — each stops at the next faded example after the video, in order</legend>
                {draft.pauses.map((row, i) => (
                    <div className="chart-form__row" key={i}>
                        <label>
                            Pause {i + 1} at
                            <input
                                type="text"
                                className="chart-form__num"
                                aria-label={`Pause ${i + 1} time`}
                                placeholder="3:20"
                                value={row.at}
                                onChange={(e) => setPause(i, { at: e.target.value })}
                                onBlur={() => commit()}
                                onKeyDown={onEnter}
                            />
                        </label>
                        <label>
                            Rewind to (optional)
                            <input
                                type="text"
                                className="chart-form__num"
                                aria-label={`Pause ${i + 1} rewind time`}
                                placeholder="previous pause"
                                value={row.rewind}
                                onChange={(e) => setPause(i, { rewind: e.target.value })}
                                onBlur={() => commit()}
                                onKeyDown={onEnter}
                            />
                        </label>
                        <button
                            type="button"
                            aria-label={`Remove pause ${i + 1}`}
                            disabled={draft.pauses.length === 1}
                            onClick={() => {
                                const next = { ...draft, pauses: draft.pauses.filter((_, j) => j !== i) };
                                setDraft(next);
                                commit(next);
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <div className="graph-figure-view__actions">
                    <button
                        type="button"
                        onClick={() => setDraft({ ...draft, pauses: [...draft.pauses, { at: '', rewind: '' }] })}
                    >
                        Add a pause
                    </button>
                </div>
            </fieldset>
            {problems.length > 0 && (
                <ul className="graph-figure-source__problems" role="alert">
                    {problems.map((p) => (
                        <li key={p}>{p}</li>
                    ))}
                </ul>
            )}
            {problems.length > 0 && data && (
                <p className="graph-figure-source__warn" role="note">
                    These changes aren't saved yet. The card keeps the last working version until they are fixed.
                </p>
            )}
            <div className="graph-figure-view__done-row">
                <button
                    type="button"
                    onClick={() => {
                        setDraft(toDraft(data));
                        setProblems([]);
                        onDone();
                    }}
                >
                    Discard unsaved changes
                </button>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        if (commit()) onDone();
                    }}
                >
                    Done
                </button>
            </div>
        </div>
    );
}
