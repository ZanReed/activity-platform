// lib/useLoad.ts keeps one copy per key in a module-level store, and a
// `remember` key outlives the screen that loaded it — by design, for a
// teacher's visit (review C5 slice 2). A test file's rows share that module,
// so without this the Bank row that expects a failed first load would get the
// previous row's remembered list instead. Every test starts with no copies.
import { afterEach } from 'vitest';
import { forgetLoads } from '../lib/useLoad';

afterEach(() => {
    forgetLoads();
});
