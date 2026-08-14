// =============================================================================
// store/caches.ts — the service-worker cache naming contract (S6-5 / S6-6)
// -----------------------------------------------------------------------------
// One cache, one name, one producer: the app shell warms
// `activity-viewer:cache:shell` (main.tsx → warmAssetCache), and it holds
// application assets only — identical for every user, no student data.
//
// S9 Drop 4 REMOVED the per-student half of this contract (ruling D-8).
// `purgeStudentCaches` / `sweepForeignCaches` / `viewerContentCacheName` /
// `contentCacheUser` guarded user-scoped CONTENT caches — but S6 V8 retired
// the design that would have produced them (the worker caches no API
// responses; the offline document lives in localStorage's documentCache,
// inside the storage purge contract), so the pair was defense-in-depth
// against caches that could not exist, carrying a standing reachability-lint
// exemption (C6). If a future arc re-adds SW caching of per-student
// responses, it must resurrect the FULL contract — user-scoped names, the
// boot sweep, and the sign-out purge together (see the deleted
// implementations at tag-era history, S6 rulings S6-5/S6-6) — never a shared
// content cache: the Cache API keys by URL and ignores Authorization, and
// the read path serves per-student shuffles from one URL, so a shared cache
// would hand student B the copy graded against student A's shuffle.
//
// THE SHELL IS DELIBERATELY NOT PURGED AT SIGN-OUT. It holds application
// code and no student data; wiping it would make the next student re-download
// the app over school Wi-Fi, defeating offline capability precisely on the
// shared devices that need it most.
// =============================================================================

const VIEWER_CACHE_PREFIX = 'activity-viewer:cache:';

/** App assets. One copy per device, no student data. */
export const VIEWER_SHELL_CACHE = `${VIEWER_CACHE_PREFIX}shell`;
