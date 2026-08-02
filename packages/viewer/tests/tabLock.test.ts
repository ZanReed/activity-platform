// =============================================================================
// tabLock.test.ts — one editable tab per student per activity (S6 V3 / S6-4)
// -----------------------------------------------------------------------------
// The hazard is quiet: two tabs open on the same activity both flush the same
// buffer key, so whichever one writes last wins and the student loses half
// their work with nothing on screen to explain it.
//
// The fake below is a real lock BROKER, not a stub that returns "yes": it
// queues waiters, grants on release, and implements steal the way the Web Locks
// spec does (holder's request promise rejects). A double that merely said
// "you hold it" would let every case here pass while the actual two-tab
// behavior stayed untested — the divergence class this repo keeps meeting.
// =============================================================================

import { describe, expect, it } from 'vitest';
import { createTabLock, type LockManagerLike } from '../src/index.js';

/**
 * Shared broker standing in for the browser's per-origin lock table. Each
 * `manager()` is one tab.
 */
function lockBroker() {
  interface Waiter {
    grant: () => void;
    reject: () => void;
  }
  // The holder is tracked by IDENTITY, not just presence. A request that
  // completes after being stolen from must not release the thief's lock —
  // getting this wrong in the fake produced three failures that looked like
  // implementation bugs and were not.
  const holders = new Map<string, { token: symbol; reject: () => void }>();
  const queues = new Map<string, Waiter[]>();

  function grantNext(name: string): void {
    const next = queues.get(name)?.shift();
    if (next) next.grant();
  }

  return {
    heldBy: (name: string) => holders.has(name),
    manager(): LockManagerLike {
      return {
        request(name, options, callback) {
          return new Promise<void>((resolve, reject) => {
            const run = () => {
              const token = Symbol('lock');
              // The holder's rejector: steal calls it.
              holders.set(name, {
                token,
                reject: () => reject(new Error('AbortError')),
              });
              void callback().then(() => {
                // Release ONLY if we are still the holder. If we were stolen
                // from, the lock belongs to someone else now and finishing our
                // callback must not evict them.
                if (holders.get(name)?.token === token) {
                  holders.delete(name);
                  grantNext(name);
                }
                resolve();
              });
            };

            if (options.steal) {
              const current = holders.get(name);
              if (current) {
                holders.delete(name);
                current.reject(); // spec: the displaced holder's promise rejects
              }
              run();
              return;
            }

            if (!holders.has(name)) {
              run();
              return;
            }

            const queue = queues.get(name) ?? [];
            queue.push({ grant: run, reject: () => reject(new Error('AbortError')) });
            queues.set(name, queue);
          });
        },
      };
    },
  };
}

const NAME = 'activity-viewer:lock:student-1:activity-1';
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('single tab', () => {
  it('holds the lock, so it may write', async () => {
    const broker = lockBroker();
    const lock = createTabLock({ name: NAME, locks: broker.manager() });
    await flush();

    expect(lock.isHeld()).toBe(true);
    lock.dispose();
  });

  it('releases on dispose, so the next tab can take over cleanly', async () => {
    const broker = lockBroker();
    const a = createTabLock({ name: NAME, locks: broker.manager() });
    await flush();
    const b = createTabLock({ name: NAME, locks: broker.manager() });
    await flush();

    expect(b.isHeld()).toBe(false);
    a.dispose(); // the student closes the first tab
    await flush();

    // No takeover click needed: closing a tab should hand the activity back.
    expect(b.isHeld()).toBe(true);
    b.dispose();
  });
});

describe('two tabs', () => {
  it('the second tab is read-only until it takes over', async () => {
    const broker = lockBroker();
    const a = createTabLock({ name: NAME, locks: broker.manager() });
    await flush();
    const b = createTabLock({ name: NAME, locks: broker.manager() });
    await flush();

    expect(a.isHeld()).toBe(true);
    expect(b.isHeld()).toBe(false);

    a.dispose();
    b.dispose();
  });

  it('"Use it here" moves the lock and demotes the old tab', async () => {
    const broker = lockBroker();
    const aChanges: boolean[] = [];
    const a = createTabLock({
      name: NAME,
      locks: broker.manager(),
      onChange: (held) => aChanges.push(held),
    });
    await flush();
    const b = createTabLock({ name: NAME, locks: broker.manager() });
    await flush();

    b.takeOver();
    await flush();

    expect(b.isHeld()).toBe(true);
    // The displaced tab learns it lost from the lock itself — no second
    // notification channel involved.
    expect(a.isHeld()).toBe(false);
    expect(aChanges).toEqual([true, false]);

    a.dispose();
    b.dispose();
  });

  it('a demoted tab regains the lock when the thief closes', async () => {
    const broker = lockBroker();
    const a = createTabLock({ name: NAME, locks: broker.manager() });
    await flush();
    const b = createTabLock({ name: NAME, locks: broker.manager() });
    await flush();
    b.takeOver();
    await flush();
    expect(a.isHeld()).toBe(false);

    b.dispose(); // the student closes the tab they took over in
    await flush();

    // The demoted tab re-queued rather than giving up, so the remaining tab
    // becomes usable without the student having to reload it.
    expect(a.isHeld()).toBe(true);
    a.dispose();
  });

  it('takeOver on the tab that already holds it is a no-op', async () => {
    const broker = lockBroker();
    const changes: boolean[] = [];
    const a = createTabLock({
      name: NAME,
      locks: broker.manager(),
      onChange: (held) => changes.push(held),
    });
    await flush();

    a.takeOver();
    await flush();

    expect(a.isHeld()).toBe(true);
    expect(changes).toEqual([true]); // no churn
    a.dispose();
  });

  it('different activities do not block each other', async () => {
    const broker = lockBroker();
    const a = createTabLock({ name: `${NAME}-one`, locks: broker.manager() });
    const b = createTabLock({ name: `${NAME}-two`, locks: broker.manager() });
    await flush();

    expect(a.isHeld()).toBe(true);
    expect(b.isHeld()).toBe(true);
    a.dispose();
    b.dispose();
  });
});

describe('subscription', () => {
  it('notifies subscribers on every transition and stops after unsubscribe', async () => {
    const broker = lockBroker();
    const a = createTabLock({ name: NAME, locks: broker.manager() });
    await flush();
    const b = createTabLock({ name: NAME, locks: broker.manager() });
    await flush();

    const seen: boolean[] = [];
    const unsubscribe = a.subscribe((held) => seen.push(held));
    b.takeOver();
    await flush();
    expect(seen).toEqual([false]);

    unsubscribe();
    b.dispose();
    await flush();
    expect(seen).toEqual([false]); // no notification after unsubscribe

    a.dispose();
  });
});

describe('no Web Locks support', () => {
  it('assumes a single tab rather than locking the student out', () => {
    // An older browser must not mean "you cannot do your worksheet". The
    // clobber guard is a safety net; losing the net is better than losing
    // access to the work entirely.
    const lock = createTabLock({ name: NAME, locks: null });
    expect(lock.isHeld()).toBe(true);
    lock.takeOver(); // no-op, must not throw
    expect(lock.isHeld()).toBe(true);
    lock.dispose();
  });
});

describe('abandoned claims', () => {
  it('a disposed tab emits no further transitions', async () => {
    const broker = lockBroker();
    const a = createTabLock({ name: NAME, locks: broker.manager() });
    await flush();
    const changes: boolean[] = [];
    const b = createTabLock({
      name: NAME,
      locks: broker.manager(),
      onChange: (held) => changes.push(held),
    });
    await flush();

    // B was QUEUED, then took over. Its original queued request still exists
    // inside the lock manager and gets granted later — after B is gone. The
    // end STATE is fine either way (it settles back to false), so this asserts
    // the transitions instead: without the generation guard the disposed lock
    // announces held→true→false to a subscriber that is the route's React
    // setState, after unmount and while a newer lock may already own the UI.
    b.takeOver();
    await flush();
    b.dispose();
    await flush();

    expect(changes).toEqual([true, false]);
    expect(b.isHeld()).toBe(false);
    // ...and the lock still lands where it should.
    expect(a.isHeld()).toBe(true);
    a.dispose();
  });
});
