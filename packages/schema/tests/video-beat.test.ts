import { describe, expect, it } from 'vitest';
import {
  createVideoBlock,
  stampVideoStaleness,
  videoBeatHash,
  videoBeats,
  videoHostOf,
  videoPauseTargets,
  type Block,
  type VideoBlock,
} from '../src/index.js';

const id = () => crypto.randomUUID();
const text = (t: string) => ({ type: 'text', text: t, marks: [] });

const worked = (body = 'Line up the points.'): Block =>
  ({ id: id(), type: 'worked_example', title: 'Example', content: [{ id: id(), type: 'paragraph', content: [text(body)] }] }) as Block;

const faded = (answer = '0.8', prompt = 'The larger is ', acceptable: string[] = []): Block =>
  ({
    id: id(),
    type: 'faded_worked_example',
    title: 'Your turn',
    showStepLabels: true,
    content: [
      {
        id: id(),
        type: 'fill_in_blank',
        skills: [],
        content: [
          text(prompt),
          { type: 'blank', id: id(), answer, acceptableAnswers: acceptable, interchangeableWithPrevious: false },
        ],
      },
    ],
  }) as Block;

const sectionOf = (...blocks: Block[]) => ({
  title: 'Lesson',
  rows: blocks.map((block) => ({ columns: [{ blocks: [block] }] })),
});
const clip = (): VideoBlock => createVideoBlock();
const hashWith = (...rest: Block[]) => {
  const video = clip();
  return videoBeatHash(sectionOf(video, ...rest), video);
};

describe('videoBeatHash (VP-5, as revised by C-176)', () => {
  it('is eight hex characters, and the same across fresh ids (a save re-mints them)', () => {
    expect(hashWith(worked(), faded())).toMatch(/^[0-9a-f]{8}$/);
    expect(hashWith(worked(), faded())).toBe(hashWith(worked(), faded()));
  });

  it('a typo in a faded block leaves it alone', () => {
    expect(hashWith(worked(), faded('0.8', 'Teh larger is '))).toBe(hashWith(worked(), faded()));
  });

  it('a changed answer moves it, and so does an added accepted answer', () => {
    const base = hashWith(worked(), faded());
    expect(hashWith(worked(), faded('0.75'))).not.toBe(base);
    expect(hashWith(worked(), faded('0.8', 'The larger is ', ['.8']))).not.toBe(base);
  });

  it('another faded block moves it', () => {
    expect(hashWith(worked(), faded(), faded())).not.toBe(hashWith(worked(), faded()));
  });

  it('worked text moves it, re-spacing does not', () => {
    const base = hashWith(worked(), faded());
    expect(hashWith(worked('Line up the decimal points.'), faded())).not.toBe(base);
    expect(hashWith(worked('Line  up the\npoints.'), faded())).toBe(base);
  });

  it('a faded block above the clip is not a pause target and is not hashed', () => {
    const video = clip();
    const above = faded('9');
    const below = faded();
    const section = sectionOf(above, video, below);
    expect(videoPauseTargets(section, video)).toEqual([below]);
    const other = clip();
    expect(videoBeatHash(section, video)).toBe(videoBeatHash(sectionOf(other, below), other));
  });
});

describe('stampVideoStaleness', () => {
  const stampedClip = () => {
    const video = clip();
    const section = sectionOf(video, faded());
    video.recordedAgainst = videoBeatHash(section, video);
    return { video, section };
  };

  it('a correctly stamped clip pasted somewhere the importer refuses is stale, whatever its hash', () => {
    const inPlace = stampedClip();
    stampVideoStaleness([inPlace.section]);
    expect(inPlace.video.stale).toBe(false);

    const review = stampedClip();
    stampVideoStaleness([{ ...review.section, title: 'Review' }]);
    expect(review.video.stale).toBe(true);

    const dol = stampedClip();
    stampVideoStaleness([{ ...dol.section, dol: { skills: [] } }]);
    expect(dol.video.stale).toBe(true);

    const quiz = stampedClip();
    stampVideoStaleness([quiz.section], 'quiz');
    expect(quiz.video.stale).toBe(true);

    const copied = stampedClip();
    const twin = { ...copied.video, id: id() };
    const both = sectionOf(copied.video, twin, faded());
    stampVideoStaleness([both]);
    expect(copied.video.stale).toBe(true);
    expect(twin.stale).toBe(true);

    const short = stampedClip();
    short.video.pauses = [{ at: 1 }, { at: 2 }];
    stampVideoStaleness([short.section]);
    expect(short.video.stale).toBe(true);
  });

  it('a matching hash is current, a different one or none is stale', () => {
    const rest = [worked(), faded()];
    const video = clip();
    const section = sectionOf(video, ...rest);
    stampVideoStaleness([section]);
    expect(video.stale).toBe(true);
    video.recordedAgainst = videoBeatHash(section, video);
    stampVideoStaleness([section]);
    expect(video.stale).toBe(false);
    video.recordedAgainst = '00000000';
    stampVideoStaleness([section]);
    expect(video.stale).toBe(true);
  });

  it('videoBeats reports the hash a dry run prints', () => {
    const video = clip();
    const section = sectionOf(video, faded());
    expect(videoBeats([section])).toEqual([
      { title: video.title, hash: videoBeatHash(section, video), recordedAgainst: null, stale: true },
    ]);
  });
});

describe('videoHostOf (VP-6)', () => {
  it.each([
    'https://youtu.be/abc123',
    'https://www.youtube.com/watch?v=abc123',
    'https://m.youtube.com/watch?v=abc123',
    'https://www.youtube-nocookie.com/embed/abc123',
  ])('%s is YouTube', (url) => expect(videoHostOf(url)).toBe('youtube'));

  it.each(['https://example.org/clip.mp4', 'https://example.org/clip.WEBM?v=2'])('%s is a file', (url) =>
    expect(videoHostOf(url)).toBe('file'),
  );

  it.each([
    'http://youtu.be/abc123',
    'https://vimeo.com/123',
    'https://evil.example/youtube.com/watch',
    'https://youtube.com/watch',
    'https://example.org/clip.avi',
    'not a url',
  ])('%s is refused', (url) => expect(videoHostOf(url)).toBeNull());
});
