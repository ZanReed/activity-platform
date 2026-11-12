import { useEffect, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import type { ActivityMeta } from '@activity/schema';
import { formatTime, videoAttrsComplete, type VideoAttrs } from '../../lib/videoFence';
import { clipState, keptClipsBefore, locateClip, type ClipState } from '../../lib/videoPlacement';
import { tiptapToActivity } from '../../lib/serialize';
import type { VideoStorage } from '../extensions/Video';
import VideoForm from './VideoForm';

// ============================================================================
// VideoViewBody — the catch-up clip's card (D64 amendment 2026-11-12, V-2…V-5).
//
// It shows the clip, and says LIVE whether students would get it and why not:
//   * not saved yet — no title, link or pause (serialize drops the node);
//   * where it sits — videoPlacement's reasons, the save rule in words;
//   * the lesson changed — recordedAgainst ≠ the beat hash now, with the button
//     "This video matches the lesson as it is now" (V-4), which stamps it.
// The state is recomputed from the whole document a moment after each edit,
// the way a save would see it, so it never trusts the last save's `stale`.
//
// The form's open state is LOCAL React state, not ProseMirror's `selected`
// (the NodeView selection hazard: typing drops node selection). A new card,
// inserted with no data, opens straight into the form.
// ============================================================================

const RECHECK_MS = 300;

function summary(data: VideoAttrs): string {
    const times = data.pauses.map((p) => formatTime(p.at)).join(', ');
    return `${data.pauses.length} pause${data.pauses.length === 1 ? '' : 's'}: ${times}`;
}

export default function VideoViewBody({ node, updateAttributes, editor, getPos }: NodeViewProps) {
    const data = node.attrs.data as VideoAttrs | null;
    const disabled = !editor.isEditable;
    const [editing, setEditing] = useState(data === null);
    const [state, setState] = useState<ClipState | null>(null);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const storage = (editor.storage as { video?: VideoStorage }).video;
        const recheck = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const pos = typeof getPos === 'function' ? getPos() : undefined;
                const current = pos === undefined ? null : editor.state.doc.nodeAt(pos);
                const currentData = (current?.attrs.data ?? null) as VideoAttrs | null;
                if (pos === undefined || !videoAttrsComplete(currentData)) {
                    setState(null);
                    return;
                }
                const index = keptClipsBefore(editor.state.doc, pos);
                const meta = storage?.meta ?? {};
                try {
                    const doc = tiptapToActivity(editor.getJSON(), { title: '', ...meta } as unknown as ActivityMeta);
                    const found = locateClip(doc, index);
                    setState(found ? clipState(found.section, found.video, meta) : null);
                } catch {
                    // No status beats a stale "Ready" (Fable review 2026-11-12).
                    setState(null);
                }
            }, RECHECK_MS);
        };
        recheck();
        editor.on('update', recheck);
        storage?.listeners.add(recheck);
        return () => {
            clearTimeout(timer);
            editor.off('update', recheck);
            storage?.listeners.delete(recheck);
        };
    }, [editor, getPos]);

    const complete = videoAttrsComplete(data);

    return (
        <NodeViewWrapper className="block-video video-view" data-block-type="video">
            <div contentEditable={false}>
                <p className="block-video__title">{complete ? data.title : 'Catch-up video'}</p>
                {complete && <p className="block-video__url">{data.url}</p>}
                {complete && <p className="block-video__pauses">{summary(data)}</p>}

                {!complete && (
                    <p className="block-video__stale" role="status" data-video-status="unsaved">
                        Not saved yet. A video needs a title, a link and at least one pause.
                    </p>
                )}
                {complete && state && state.reasons.length > 0 && (
                    <div role="status" data-video-status="placement">
                        <p className="block-video__stale">Students won't get this video:</p>
                        <ul className="graph-figure-source__problems">
                            {state.reasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {complete && state && state.reasons.length === 0 && !state.matches && (
                    <div role="status" data-video-status="unmatched">
                        <p className="block-video__stale">
                            {data.recordedAgainst
                                ? "The lesson has changed since this video was confirmed, so students won't get it."
                                : "Students won't get this video until you confirm it matches the lesson."}
                        </p>
                        <p className="block-video__pauses">
                            Watch it against the worked and faded examples below. If they still match, confirm it.
                        </p>
                        <div className="graph-figure-view__actions">
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() => updateAttributes({ data: { ...data, recordedAgainst: state.hash } })}
                            >
                                This video matches the lesson as it is now
                            </button>
                        </div>
                    </div>
                )}
                {complete && state && state.reasons.length === 0 && state.matches && (
                    <p className="block-video__pauses" role="status" data-video-status="ready">
                        Ready. Students get it once video is cleared for your school.
                    </p>
                )}

                {editing ? (
                    <VideoForm
                        data={data}
                        disabled={disabled}
                        onChange={(next) => updateAttributes({ data: next })}
                        onDone={() => setEditing(false)}
                    />
                ) : (
                    <div className="graph-figure-view__actions">
                        <button type="button" disabled={disabled} onClick={() => setEditing(true)}>
                            Edit video
                        </button>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
}
