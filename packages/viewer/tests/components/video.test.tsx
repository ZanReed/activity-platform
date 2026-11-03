// =============================================================================
// video.test.tsx — the catch-up clip's card, gate and pause (D64 slice 2)
// -----------------------------------------------------------------------------
// Bound to rendered output. The server decides who gets a URL (verify-0078);
// these rows prove the client shows nothing without one, loads nothing from a
// host until the card is opened, and stops at the real faded block.
// =============================================================================

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { youtubeIdOf } from '@activity/schema';
import Video, { VIDEO_COPY } from '../../src/blocks/Video.js';
import { formatClipTime, pauseStep, rewindTarget } from '../../src/blocks/videoPauseGate.js';
import { setVideoLink } from '../../src/blocks/videoSourceSeam.js';
import { ViewerProvider } from '../../src/container/context.js';
import type { ViewerStore } from '../../src/store/store.js';

const ACTIVITY = 'aaaaaaaa-0000-4000-8000-000000000001';
const VERSION = 'bbbbbbbb-0000-4000-8000-000000000001';
const SECTION = 'section-1';
const BLOCK = {
  id: 'clip-1',
  type: 'video',
  title: 'Comparing decimals',
  pauses: [{ at: 10 }, { at: 20, rewindTo: 5 }],
  stale: false,
};
const ok = (row: unknown) => ({ data: [row], error: null });
const FILE = { url: 'https://example.org/clip.webm', captions: 'https://example.org/clip.vtt' };
const RESPONSES = { blanks: { b1: '3' }, choices: {}, matches: {}, correspondences: {}, orderings: {}, freeText: {}, graphs: {} };

type Answer = { data: unknown; error: unknown };
const pauseSays = (state: string, feedback?: unknown[]): Answer => ({ data: { wireVersion: 3, state, feedback }, error: null });
const invoke = vi.fn(async (): Promise<Answer> => pauseSays('right'));
const CHECK_URL = 'https://edge.test/check-activity?forceFunctionRegion=us-east-2';
const fetchStub = vi.fn<[string, RequestInit], Promise<{ ok: boolean; json: () => Promise<unknown> }>>(async () => {
  const answer = await invoke();
  return { ok: !answer.error, json: async () => answer.data };
});
function linkWith(rpc: (name: string, args: Record<string, string>) => PromiseLike<Answer>) {
  return {
    client: { rpc, auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } },
    checkUrl: () => CHECK_URL,
  } as never;
}

function makeStore() {
  return { getState: () => ({ activityId: ACTIVITY, versionId: VERSION, sections: {}, responses: RESPONSES }), subscribe: () => () => undefined } as never as ViewerStore;
}

// The shape the container and the block render: the attribute is on the wrapper
// AND on the block's own root, which a browser run caught and a flat fixture hid.
function Faded({ id }: { id: string }) {
  return (
    <div className="viewer-block" data-block-id={id} data-block-type="faded_worked_example">
      <div data-block-type="faded_worked_example" />
    </div>
  );
}

function mount(extra: Record<string, unknown> = {}, mode: 'screen' | 'print' = 'screen') {
  const store = makeStore();
  const view = render(
    <ViewerProvider store={store} defaultSectionId={SECTION}>
      <section className="viewer-section">
        <Faded id="early" />
        <Video block={{ ...BLOCK, ...extra } as never} mode={mode} />
        <Faded id="f1" />
        <Faded id="f2" />
      </section>
    </ViewerProvider>,
  );
  return { ...view, store };
}

let currentTime = 0;
const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();

beforeEach(() => {
  currentTime = 0;
  invoke.mockReset();
  invoke.mockImplementation(async () => pauseSays('right'));
  fetchStub.mockClear();
  vi.stubGlobal('fetch', fetchStub);
  play.mockClear();
  pause.mockClear();
  vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(play);
  vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
  vi.spyOn(window.HTMLMediaElement.prototype, 'currentTime', 'get').mockImplementation(() => currentTime);
  vi.spyOn(window.HTMLMediaElement.prototype, 'currentTime', 'set').mockImplementation((value: number) => {
    currentTime = value;
  });
});

afterEach(() => {
  cleanup();
  setVideoLink(null);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
  delete window.YT;
});

describe('the gate, on the client (VP-7)', () => {
  it('no reader: nothing, not even a placeholder', async () => {
    const { container } = mount();
    await act(async () => {});
    expect(container.querySelector('.viewer-video')).toBeNull();
    expect(container.textContent).toBe('');
  });

  it('the server says no: nothing', async () => {
    setVideoLink(linkWith(async () => ({ data: [], error: null })));
    const { container } = mount();
    await act(async () => {});
    expect(container.querySelector('.viewer-video')).toBeNull();
  });

  it('the server errors: nothing', async () => {
    setVideoLink(linkWith(async () => ({ data: null, error: { message: 'Not authorized' } })));
    const { container } = mount();
    await act(async () => {});
    expect(container.querySelector('.viewer-video')).toBeNull();
  });

  it('the read fails: nothing', async () => {
    setVideoLink(
      linkWith(async () => {
        throw new Error('offline');
      }),
    );
    const { container } = mount();
    await act(async () => {});
    expect(container.querySelector('.viewer-video')).toBeNull();
  });

  it('asks for this activity, version and block', async () => {
    const reader = vi.fn(async () => ok(FILE));
    setVideoLink(linkWith(reader));
    mount();
    await screen.findByRole('button', { name: /Missed this lesson/ });
    expect(reader).toHaveBeenCalledWith('video_source', {
      p_activity_id: ACTIVITY,
      p_version_id: VERSION,
      p_block_id: 'clip-1',
    });
  });

  it('print: no card and no read (VP-9)', async () => {
    const reader = vi.fn(async () => ok(FILE));
    setVideoLink(linkWith(reader));
    const { container } = mount({}, 'print');
    await act(async () => {});
    expect(reader).not.toHaveBeenCalled();
    expect(container.querySelector('.viewer-video')).toBeNull();
  });
});

describe('the card (VP-2)', () => {
  beforeEach(() => setVideoLink(linkWith(async () => ok(FILE))));

  it('stays closed, with the title, and loads nothing from the host until tapped', async () => {
    const { container } = mount();
    const open = await screen.findByRole('button', { name: `${VIDEO_COPY.open} · Comparing decimals` });
    expect(open.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('video, iframe')).toBeNull();
    fireEvent.click(open);
    expect(open.getAttribute('aria-expanded')).toBe('true');
    const video = container.querySelector('video')!;
    expect(video.getAttribute('src')).toBe(FILE.url);
    expect(play).toHaveBeenCalled();
  });

  it('a file plays inline with captions on and no fullscreen (VP-6)', async () => {
    const { container } = mount();
    fireEvent.click(await screen.findByRole('button', { name: /Missed/ }));
    const video = container.querySelector('video')!;
    expect(video.playsInline).toBe(true);
    expect(video.getAttribute('controlslist')).toContain('nofullscreen');
    const track = video.querySelector('track')!;
    expect(track.getAttribute('src')).toBe(FILE.captions);
    expect(track.default).toBe(true);
  });

  it('closes again, and the player goes with it', async () => {
    const { container } = mount();
    const open = await screen.findByRole('button', { name: /Missed/ });
    fireEvent.click(open);
    fireEvent.click(open);
    expect(open.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('video')).toBeNull();
  });

  it('back online, reopening tries again', async () => {
    const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { container } = mount();
    const open = await screen.findByRole('button', { name: /Missed/ });
    fireEvent.click(open);
    expect(screen.getByText(VIDEO_COPY.unavailable)).toBeTruthy();
    fireEvent.click(open);
    online.mockReturnValue(true);
    fireEvent.click(open);
    expect(screen.queryByText(VIDEO_COPY.unavailable)).toBeNull();
    expect(container.querySelector('video')).not.toBeNull();
  });

  it('after a right answer, focus lands on the player, not the page', async () => {
    const { container } = mount();
    const open = await screen.findByRole('button', { name: /Missed/ });
    vi.useFakeTimers();
    fireEvent.click(open);
    currentTime = 10;
    await act(async () => void vi.advanceTimersByTime(300));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: VIDEO_COPY.check })));
    expect(document.activeElement).toBe(container.querySelector('.viewer-video__frame'));
  });

  it('out of date says so to whoever got the URL, which is only the owner', async () => {
    mount({ stale: true });
    expect(await screen.findByText(VIDEO_COPY.stale)).toBeTruthy();
  });

  it('current says nothing about it', async () => {
    mount();
    await screen.findByRole('button', { name: /Missed/ });
    expect(screen.queryByText(VIDEO_COPY.stale)).toBeNull();
  });

  it('a host that fails says so, and the activity carries on (VP-9)', async () => {
    const { container } = mount();
    fireEvent.click(await screen.findByRole('button', { name: /Missed/ }));
    fireEvent.error(container.querySelector('video')!);
    expect(await screen.findByText(VIDEO_COPY.unavailable)).toBeTruthy();
  });

  it('offline at the tap says so, and fetches nothing', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { container } = mount();
    fireEvent.click(await screen.findByRole('button', { name: /Missed/ }));
    expect(await screen.findByText(VIDEO_COPY.unavailable)).toBeTruthy();
    expect(container.querySelector('video')).toBeNull();
  });
});

describe('stopping at a pause (VP-1, VP-2)', () => {
  beforeEach(() => setVideoLink(linkWith(async () => ok(FILE))));

  async function playing() {
    const view = mount();
    const open = await screen.findByRole('button', { name: /Missed/ });
    // Before the click: the player's interval must be a fake one.
    vi.useFakeTimers();
    fireEvent.click(open);
    await act(async () => {});
    return view;
  }
  const tick = () => act(async () => void vi.advanceTimersByTime(300));

  it('stops at the pause, in the next faded block AFTER the clip, not the one above it', async () => {
    const { container } = await playing();
    currentTime = 9;
    await tick();
    expect(container.querySelector('.viewer-video-stop')).toBeNull();
    currentTime = 10;
    await tick();
    expect(pause).toHaveBeenCalled();
    const stop = container.querySelector('.viewer-video-stop')!;
    expect(stop.closest('[data-block-id]')!.getAttribute('data-block-id')).toBe('f1');
  });

  const press = (name: string) => act(async () => fireEvent.click(screen.getByRole('button', { name })));
  const stoppedIn = (container: HTMLElement) =>
    container.querySelector('.viewer-video-stop')?.closest('[data-block-id]')?.getAttribute('data-block-id');

  it('a stop says what to do, and offers neither a rewind nor a way past yet', async () => {
    const { container } = await playing();
    currentTime = 10;
    await tick();
    expect(container.querySelector('.viewer-video-stop [role="status"]')!.textContent).toBe(VIDEO_COPY.prompt);
    expect(screen.queryByRole('button', { name: VIDEO_COPY.keepGoing })).toBeNull();
    expect(screen.queryByRole('button', { name: /Rewind/ })).toBeNull();
  });

  it('sends this block and the typed answers to the app\'s URL, with only headers CORS allows', async () => {
    await playing();
    currentTime = 10;
    await tick();
    await press(VIDEO_COPY.check);
    const [url, init] = fetchStub.mock.calls[0]!;
    expect(url).toBe(CHECK_URL);
    expect(init.headers).toEqual({ Authorization: 'Bearer tok', 'Content-Type': 'application/json' });
    expect(JSON.parse(init.body as string)).toEqual({
      wireVersion: 3, mode: 'video-pause', activityId: ACTIVITY, versionId: VERSION, blockId: 'f1', responses: RESPONSES,
    });
  });

  it('wrong: the feedback, a rewind and a retry; the second miss adds Keep going (VP-3)', async () => {
    invoke.mockImplementation(async () =>
      pauseSays('wrong', [[{ type: 'text', text: 'You added instead of multiplied.' }]]),
    );
    const { container } = await playing();
    currentTime = 10;
    await tick();
    await press(VIDEO_COPY.check);
    const status = container.querySelector('.viewer-video-stop [role="status"]')!;
    expect(status.textContent).toContain(VIDEO_COPY.wrong);
    expect(status.textContent).toContain('You added instead of multiplied.');
    expect(screen.getByRole('button', { name: `${VIDEO_COPY.rewindTo} 0:00` })).toBeTruthy();
    expect(screen.queryByRole('button', { name: VIDEO_COPY.keepGoing })).toBeNull();
    expect(stoppedIn(container)).toBe('f1');

    await press(VIDEO_COPY.tryAgain);
    expect(screen.getByRole('button', { name: VIDEO_COPY.keepGoing })).toBeTruthy();
    expect(stoppedIn(container)).toBe('f1');
  });

  it('wrong with no authored feedback: the words and the buttons only (C-176)', async () => {
    invoke.mockImplementation(async () => pauseSays('wrong', []));
    const { container } = await playing();
    currentTime = 10;
    await tick();
    await press(VIDEO_COPY.check);
    expect(container.querySelector('.viewer-video-stop__feedback')).toBeNull();
    expect(screen.getByRole('button', { name: VIDEO_COPY.tryAgain })).toBeTruthy();
  });

  it('nothing typed asks for an answer, and still can\'t trap anyone', async () => {
    invoke.mockImplementation(async () => pauseSays('empty'));
    const { container } = await playing();
    currentTime = 10;
    await tick();
    await press(VIDEO_COPY.check);
    expect(container.querySelector('.viewer-video-stop [role="status"]')!.textContent).toBe(VIDEO_COPY.empty);
    await press(VIDEO_COPY.tryAgain);
    expect(screen.getByRole('button', { name: VIDEO_COPY.keepGoing })).toBeTruthy();
  });

  it('a failed check offers Keep going at once: the network is not their mistake', async () => {
    invoke.mockImplementation(async () => ({ data: null, error: { message: 'offline' } }));
    await playing();
    currentTime = 10;
    await tick();
    await press(VIDEO_COPY.check);
    expect(screen.getByRole('button', { name: VIDEO_COPY.keepGoing })).toBeTruthy();
  });

  it('an answer this version does not know reads as failed, so it can\'t trap anyone', async () => {
    invoke.mockImplementation(async () => pauseSays('something_new'));
    await playing();
    currentTime = 10;
    await tick();
    await press(VIDEO_COPY.check);
    expect(screen.getByRole('button', { name: VIDEO_COPY.keepGoing })).toBeTruthy();
  });

  it('signed out: failed, and nothing is sent', async () => {
    setVideoLink({
      client: { rpc: async () => ok(FILE), auth: { getSession: async () => ({ data: { session: null } }) } },
      checkUrl: () => CHECK_URL,
    } as never);
    await playing();
    currentTime = 10;
    await tick();
    await press(VIDEO_COPY.check);
    expect(fetchStub).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: VIDEO_COPY.keepGoing })).toBeTruthy();
  });

  it('rewind goes to the previous pause or the authored time, plays, and stops at the same block again', async () => {
    invoke.mockImplementationOnce(async () => pauseSays('right'));
    invoke.mockImplementation(async () => pauseSays('wrong', []));
    const { container } = await playing();
    currentTime = 10;
    await tick();
    await press(VIDEO_COPY.check);
    currentTime = 20;
    await tick();
    expect(stoppedIn(container)).toBe('f2');
    await press(VIDEO_COPY.check);
    play.mockClear();
    // BLOCK's second pause authors rewindTo: 5.
    await press(`${VIDEO_COPY.rewindTo} 0:05`);
    expect(currentTime).toBe(5);
    expect(play).toHaveBeenCalled();
    expect(container.querySelector('.viewer-video-stop')).toBeNull();
    await tick();
    expect(container.querySelector('.viewer-video-stop')).toBeNull();
    currentTime = 20;
    await tick();
    expect(stoppedIn(container)).toBe('f2');
    // The miss from before the rewind still counts toward the way past.
    await press(VIDEO_COPY.check);
    expect(screen.getByRole('button', { name: VIDEO_COPY.keepGoing })).toBeTruthy();
  });

  it('with no authored rewind the first pause goes to the start', () => {
    expect(rewindTarget([{ at: 10 }, { at: 20 }, { at: 30, rewindTo: 25 }], 0)).toBe(0);
    expect(rewindTarget([{ at: 10 }, { at: 20 }, { at: 30, rewindTo: 25 }], 1)).toBe(10);
    expect(rewindTarget([{ at: 10 }, { at: 20 }, { at: 30, rewindTo: 25 }], 2)).toBe(25);
  });

  it('the section already checked elsewhere: the clip just carries on', async () => {
    invoke.mockImplementation(async () => pauseSays('already_checked'));
    const { container } = await playing();
    currentTime = 10;
    await tick();
    play.mockClear();
    await press(VIDEO_COPY.check);
    expect(container.querySelector('.viewer-video-stop')).toBeNull();
    expect(play).toHaveBeenCalled();
  });

  it('a press during a slow check sends one try', async () => {
    let answer: (value: Answer) => void = () => undefined;
    invoke.mockImplementation(() => new Promise((resolve) => (answer = resolve)));
    await playing();
    currentTime = 10;
    await tick();
    await press(VIDEO_COPY.check);
    await press(VIDEO_COPY.checking);
    expect(invoke).toHaveBeenCalledTimes(1);
    await act(async () => answer(pauseSays('right')));
  });

  it('a right answer moves on to the second block, and plays', async () => {
    const { container } = await playing();
    currentTime = 10;
    await tick();
    play.mockClear();
    await press(VIDEO_COPY.check);
    expect(container.querySelector('.viewer-video-stop')).toBeNull();
    expect(play).toHaveBeenCalled();
    currentTime = 15;
    await tick();
    expect(container.querySelector('.viewer-video-stop')).toBeNull();
    currentTime = 20;
    await tick();
    expect(container.querySelector('.viewer-video-stop')!.closest('[data-block-id]')!.getAttribute('data-block-id')).toBe('f2');
  });

  it('seeking past an unanswered pause snaps back to it', async () => {
    const { container } = await playing();
    currentTime = 18;
    await tick();
    expect(currentTime).toBe(10);
    expect(container.querySelector('.viewer-video-stop')).not.toBeNull();
  });

  it('a pause with no block to stop at never strands the student', async () => {
    const view = mount({ pauses: [{ at: 1 }, { at: 2 }, { at: 3 }] });
    const open = await screen.findByRole('button', { name: /Missed/ });
    vi.useFakeTimers();
    fireEvent.click(open);
    currentTime = 1;
    await tick();
    await press(VIDEO_COPY.check);
    currentTime = 2;
    await tick();
    await press(VIDEO_COPY.check);
    currentTime = 3;
    await tick();
    expect(view.container.querySelector('.viewer-video-stop')).toBeNull();
    expect(currentTime).toBe(3);
  });

  it('once the section is checked it plays straight through, with places to jump to (VP-3)', async () => {
    const store = makeStore();
    vi.spyOn(store, 'getState');
    const checked = { ...store.getState(), sections: { [SECTION]: { phase: 'checked' } } };
    (store.getState as ReturnType<typeof vi.fn>).mockReturnValue(checked);
    const { container } = render(
      <ViewerProvider store={store} defaultSectionId={SECTION}>
        <section className="viewer-section">
          <Video block={BLOCK as never} mode="screen" />
          <Faded id="f1" />
          <Faded id="f2" />
        </section>
      </ViewerProvider>,
    );
    const open = await screen.findByRole('button', { name: /Missed/ });
    vi.useFakeTimers();
    fireEvent.click(open);
    currentTime = 10;
    await tick();
    expect(container.querySelector('.viewer-video-stop')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '0:20' }));
    expect(currentTime).toBe(20);
  });
});

describe('the YouTube host (VP-6)', () => {
  it('uses the no-cookie host with captions on and no fullscreen, once opened', async () => {
    const created: { host: string; videoId: string; playerVars: Record<string, number> }[] = [];
    const playVideo = vi.fn();
    class Player {
      constructor(_el: HTMLElement, options: never) {
        created.push(options);
        queueMicrotask(() => (options as { events: { onReady(): void } }).events.onReady());
      }
      playVideo = playVideo;
      pauseVideo = vi.fn();
      seekTo = vi.fn();
      getCurrentTime = () => 0;
      destroy = vi.fn();
    }
    window.YT = { Player } as never;
    setVideoLink(linkWith(async () => ok({ url: 'https://youtu.be/abc123', captions: null })));
    mount();
    const open = await screen.findByRole('button', { name: /Missed/ });
    expect(created).toEqual([]);
    fireEvent.click(open);
    await waitFor(() => expect(playVideo).toHaveBeenCalled());
    expect(created[0]!.host).toBe('https://www.youtube-nocookie.com');
    expect(created[0]!.videoId).toBe('abc123');
    expect(created[0]!.playerVars).toMatchObject({ cc_load_policy: 1, fs: 0, playsinline: 1 });
  });

  it('reads the id from every form the importer takes', () => {
    for (const url of [
      'https://youtu.be/abc123',
      'https://www.youtube.com/watch?v=abc123',
      'https://www.youtube-nocookie.com/embed/abc123',
    ]) {
      expect(youtubeIdOf(url)).toBe('abc123');
    }
    expect(youtubeIdOf('https://example.org/abc123.mp4')).toBeNull();
  });
});

describe('pauseStep and the time format', () => {
  const pauses = [{ at: 10 }];
  it('before, at, slightly past and far past', () => {
    expect(pauseStep(pauses, 0, 9.9)).toEqual({ stop: false });
    expect(pauseStep(pauses, 0, 10)).toEqual({ stop: true, seekTo: null });
    expect(pauseStep(pauses, 0, 10.9)).toEqual({ stop: true, seekTo: null });
    expect(pauseStep(pauses, 0, 12)).toEqual({ stop: true, seekTo: 10 });
    expect(pauseStep(pauses, 1, 99)).toEqual({ stop: false });
  });
  it('formats', () => {
    expect(formatClipTime(65)).toBe('1:05');
    expect(formatClipTime(3661)).toBe('1:01:01');
  });
});
