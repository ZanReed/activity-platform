// =============================================================================
// Video — the catch-up clip's card and player (D64, video-pause-points.md)
// -----------------------------------------------------------------------------
// Lazy, so the shell pays for one binding line. The URL comes from the server's
// gate (VP-7), and with no URL nothing shows at all: not a card, not a placeholder.
//
// VP-2: at a pause the clip stops and the page scrolls to the real faded block,
// so there is one rendering of blanks, math entry and feedback. The control sits
// in that block through a portal. It offers "Keep going" until slice 3 adds the
// check there. Once the section is checked the clip plays straight through, and
// its pause times become places to jump to (VP-3).
//
// The faded blocks are found in the rendered section, because the served document
// holds the same order and the shell has no room for another context field.
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { VideoBlock } from '@activity/schema';
import type { BlockComponentProps } from '../registry/types.js';
import { useViewer, useViewerSelector } from '../container/context.js';
import { mountVideoPlayer, type VideoPlayer } from './videoHosts.js';
import { formatClipTime, pauseStep } from './videoPauseGate.js';
import { readVideoSource, type VideoSource } from './videoSource.js';

export const VIDEO_COPY = {
  open: 'Missed this lesson? Watch the catch-up',
  stale: 'Video is out of date',
  unavailable: "The video isn't available right now",
  keepGoing: 'Keep going',
  jump: 'Jump to',
} as const;

const TICK_MS = 250;

function fadedBlocksAfter(card: Element): Element[] {
  const section = card.closest('.viewer-section');
  if (!section) return [];
  return Array.from(section.querySelectorAll(".viewer-block[data-block-type='faded_worked_example']")).filter(
    (el) => card.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
}

function ClipPlayer({
  pauses,
  source,
  sectionChecked,
  onFail,
}: {
  pauses: VideoBlock['pauses'];
  source: VideoSource;
  sectionChecked: boolean;
  onFail: () => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const player = useRef<VideoPlayer | null>(null);
  const nextPause = useRef(0);
  const [stopHost, setStopHost] = useState<HTMLElement | null>(null);
  const keepGoing = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!frame.current) return;
    const mounted = mountVideoPlayer(frame.current, source, onFail);
    if (!mounted) onFail();
    player.current = mounted;
    // The tap that opened the card is the gesture a browser asks for.
    mounted?.play();
    return () => {
      mounted?.destroy();
      player.current = null;
    };
    // The source and pauses are fixed for the life of a served version.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sectionChecked || stopHost) return;
    const timer = window.setInterval(() => {
      const clip = player.current;
      if (!clip || !frame.current) return;
      const step = pauseStep(pauses, nextPause.current, clip.time());
      if (!step.stop) return;
      const target = fadedBlocksAfter(frame.current)[nextPause.current];
      // With no block to stop at, stopping would strand the student.
      if (!target) {
        nextPause.current += 1;
        return;
      }
      clip.pause();
      if (step.seekTo !== null) clip.seek(step.seekTo);
      const host = document.createElement('div');
      host.className = 'viewer-video-stop';
      target.append(host);
      setStopHost(host);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [pauses, sectionChecked, stopHost]);

  useEffect(() => {
    if (!stopHost) return;
    stopHost.parentElement?.scrollIntoView?.({ block: 'center' });
    keepGoing.current?.focus({ preventScroll: true });
    return () => stopHost.remove();
  }, [stopHost]);

  return (
    <>
      <div ref={frame} className="viewer-video__frame" tabIndex={-1} />
      {sectionChecked ? (
        <p className="viewer-video__jumps">
          {VIDEO_COPY.jump}{' '}
          {pauses.map((pause) => (
            <button
              key={pause.at}
              type="button"
              className="viewer-video__jump"
              onClick={() => {
                player.current?.seek(pause.at);
                player.current?.play();
              }}
            >
              {formatClipTime(pause.at)}
            </button>
          ))}
        </p>
      ) : null}
      {stopHost
        ? createPortal(
            <button
              ref={keepGoing}
              type="button"
              className="viewer-video__button"
              onClick={() => {
                nextPause.current += 1;
                setStopHost(null);
                frame.current?.scrollIntoView?.({ block: 'center' });
                frame.current?.focus({ preventScroll: true });
                player.current?.play();
              }}
            >
              {VIDEO_COPY.keepGoing}
            </button>,
            stopHost,
          )
        : null}
    </>
  );
}

export default function Video({ block, mode }: BlockComponentProps<VideoBlock>) {
  const { store, sectionOf, groupOf } = useViewer();
  const [source, setSource] = useState<VideoSource | null>(null);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const sectionId = sectionOf(block.id);
  const sectionChecked = useViewerSelector((state) => {
    if (!sectionId) return false;
    const group = groupOf(sectionId) ?? [sectionId];
    return group.some((id) => state.sections[id]?.phase === 'checked');
  });

  useEffect(() => {
    if (mode === 'print') return;
    let live = true;
    const { activityId, versionId } = store.getState();
    void readVideoSource(activityId, versionId, block.id).then((found) => {
      if (live) setSource(found);
    });
    return () => {
      live = false;
    };
  }, [block.id, mode, store]);

  if (mode === 'print' || !source) return <div hidden />;

  return (
    <div className="viewer-video">
      <button
        type="button"
        className="viewer-video__open"
        aria-expanded={open}
        onClick={() => {
          setFailed(!navigator.onLine);
          setOpen(!open);
        }}
      >
        {VIDEO_COPY.open} · {block.title}
      </button>
      {block.stale ? <p className="viewer-video__stale">{VIDEO_COPY.stale}</p> : null}
      {open && failed ? (
        <p className="viewer-video__unavailable" role="status">
          {VIDEO_COPY.unavailable}
        </p>
      ) : open ? (
        <ClipPlayer
          pauses={block.pauses}
          source={source}
          sectionChecked={sectionChecked}
          onFail={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
