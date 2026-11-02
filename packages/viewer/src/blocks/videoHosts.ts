// =============================================================================
// videoHosts.ts — one small player interface over each host (D64 VP-6)
// -----------------------------------------------------------------------------
// Nothing here runs until the student opens the card, so no host hears about a
// student who never watches. Switching host costs one more function here.
// =============================================================================

import { videoHostOf, youtubeIdOf } from '@activity/schema';
import type { VideoSource } from './videoSource.js';

export interface VideoPlayer {
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  time(): number;
  destroy(): void;
}

function mountFile(into: HTMLElement, source: VideoSource, onError: () => void): VideoPlayer {
  const video = document.createElement('video');
  video.className = 'viewer-video__media';
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  // The pause block can't appear inside fullscreen or picture-in-picture.
  video.setAttribute('controlslist', 'nofullscreen nodownload');
  video.disablePictureInPicture = true;
  // A captions file on another origin won't load without this, so the host must
  // send CORS headers (markdown-import-format.md).
  video.crossOrigin = 'anonymous';
  video.src = source.url;
  video.addEventListener('error', onError);
  if (source.captions) {
    const track = document.createElement('track');
    track.kind = 'captions';
    track.src = source.captions;
    track.srclang = 'en';
    track.label = 'English';
    track.default = true;
    video.append(track);
  }
  into.append(video);
  return {
    play: () => void video.play().catch(() => undefined),
    pause: () => video.pause(),
    seek: (seconds) => {
      video.currentTime = seconds;
    },
    time: () => video.currentTime,
    destroy: () => {
      video.removeEventListener('error', onError);
      video.pause();
      video.removeAttribute('src');
      video.remove();
    },
  };
}

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  destroy(): void;
}

interface YouTubeApi {
  Player: new (
    element: HTMLElement,
    options: {
      host: string;
      videoId: string;
      playerVars: Record<string, number>;
      events: { onReady: () => void; onError: () => void };
    },
  ) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// A script that hangs must still end in "isn't available" (VP-9).
const YOUTUBE_LOAD_TIMEOUT_MS = 15_000;

let youtubeApi: Promise<YouTubeApi> | null = null;

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  youtubeApi ??= new Promise<YouTubeApi>((resolve, reject) => {
    const fail = () => {
      youtubeApi = null;
      reject(new Error('The YouTube player did not load'));
    };
    const timer = window.setTimeout(fail, YOUTUBE_LOAD_TIMEOUT_MS);
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timer);
      resolve(window.YT!);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => {
      window.clearTimeout(timer);
      fail();
    };
    document.head.append(script);
  });
  return youtubeApi;
}

function mountYouTube(into: HTMLElement, videoId: string, onError: () => void): VideoPlayer {
  const slot = document.createElement('div');
  into.append(slot);
  let player: YouTubePlayer | null = null;
  let ready = false;
  let destroyed = false;
  loadYouTubeApi()
    .then((api) => {
      if (destroyed) return;
      player = new api.Player(slot, {
        host: 'https://www.youtube-nocookie.com',
        videoId,
        // Captions on, no fullscreen, inline on a phone, no suggested videos.
        playerVars: { cc_load_policy: 1, fs: 0, playsinline: 1, rel: 0 },
        events: {
          onReady: () => {
            ready = true;
            player?.playVideo();
          },
          onError,
        },
      });
    })
    .catch(onError);
  return {
    play: () => {
      if (ready) player?.playVideo();
    },
    pause: () => {
      if (ready) player?.pauseVideo();
    },
    seek: (seconds) => {
      if (ready) player?.seekTo(seconds, true);
    },
    time: () => (ready ? (player?.getCurrentTime() ?? 0) : 0),
    destroy: () => {
      destroyed = true;
      player?.destroy();
      slot.remove();
    },
  };
}

/** Null when the URL needs no player we have, which the importer refuses anyway. */
export function mountVideoPlayer(into: HTMLElement, source: VideoSource, onError: () => void): VideoPlayer | null {
  const host = videoHostOf(source.url);
  if (host === 'file') return mountFile(into, source, onError);
  const id = host === 'youtube' ? youtubeIdOf(source.url) : null;
  return id ? mountYouTube(into, id, onError) : null;
}
