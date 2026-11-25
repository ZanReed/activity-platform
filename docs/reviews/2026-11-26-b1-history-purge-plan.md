# Purging `r2-final-backup-20260815/` from git history — plan

Review 2026-11-26, item B1. The folder has been **untracked** since `4426c21e`
and stays on disk; this plan removes it from **history**. That takes a rewrite
and a force-push, which only the author runs. Nothing here has been run.

## 1. Is it worth doing? (measured 2026-11-26)

| | |
|---|---|
| What the purge removes | 265 blobs: 67.8 MB raw, **7.7 MB in the pack** (the HTML compresses heavily) |
| The whole pack | ~80 MB of blobs, of which **56 MB is the history of the committed Edge Function bundles** (`supabase/functions/_shared/*.bundle.js`) |
| Commits rewritten | **884** (everything from `f7aefee3`, 2026-08-21, to `main`), plus the cloud branch below |
| Hash citations that go stale | **179 citations of 144 distinct hashes** in tracked files (TODOS 27, HISTORY 22, shell-size-review 10, STATE 8, …), plus the outside ones in §4 |

**The review overstated the size benefit.** The purge makes every clone about
7.7 MB (~10%) smaller. The reason left is the one upload: a novelty sloth
picture that looks like commercial third-party art and is served from a public
repo. It holds no personal data; the pages are test pages.

**Recommendation: leave history as it is, unless the image's copyright worries
you.** If it does, purge the whole folder in the one rewrite: purging only the
image costs the same.

If the goal is a smaller clone, purging the old bundle history would do far
more than this purge. That is a different decision with the same rewrite cost.
It is not proposed here.

## 2. Before you start

1. **Everything is pushed.** `main` is 7 commits ahead of `origin/main` today.
   Push first, and let CI go green.
2. **No session is writing.** Stop or finish every Claude session that shares
   this checkout. A commit made during the rewrite would be lost or would bring
   the old history back.
3. **Decide PR #3** (`cloud/efficiency-audit-2026-10`, open, report only). It
   contains `f7aefee3`, so it is rewritten too. Either merge or close it first,
   or accept that its branch gets new hashes as well (the steps below rewrite
   every branch).
4. **Keep an off-repo backup** of the current history:
   ```bash
   git -C "/Users/user/Project folder/activity-platform" bundle create ~/activity-platform-pre-purge-2026-11.bundle --all
   ```
   Store the bundle outside the repo. Don't create a tag inside the repo: a tag
   would keep every old object reachable.
5. **Install the tool:**
   ```bash
   brew install git-filter-repo
   ```

## 3. The rewrite (in a fresh mirror, never in the working checkout)

```bash
cd ~ && git clone --mirror git@github.com:ZanReed/activity-platform.git activity-platform-purge.git
```

```bash
cd ~/activity-platform-purge.git && git rev-parse main^{tree} > ~/purge-old-tree.txt
```

```bash
cd ~/activity-platform-purge.git && git filter-repo --path r2-final-backup-20260815 --invert-paths
```

filter-repo also rewrites abbreviated hashes inside commit **messages**, and it
writes `filter-repo/commit-map` (old → new) inside the mirror. Keep that file:
step 5 needs it.

**Check before pushing:**

```bash
cd ~/activity-platform-purge.git && git log --all --oneline -- r2-final-backup-20260815 | wc -l
```
Expect `0`.

```bash
cd ~/activity-platform-purge.git && test "$(git rev-parse main^{tree})" = "$(cat ~/purge-old-tree.txt)" && echo "main's files are byte-identical"
```
This must print. The folder was already untracked at the tip, so the newest
tree does not change, and neither do the deployed bundles' bytes. Their hash
proofs still hold.

```bash
cd ~/activity-platform-purge.git && git gc --prune=now --aggressive && git count-objects -vH
```
Expect a pack about 8 MB smaller.

filter-repo removes the `origin` remote. Put it back:

```bash
cd ~/activity-platform-purge.git && git remote add origin git@github.com:ZanReed/activity-platform.git
```

## 4. Push

Push branches and tags only. Don't use `--mirror`: GitHub refuses writes to
`refs/pull/*`, and the push would fail partway.

```bash
cd ~/activity-platform-purge.git && git push --force origin 'refs/heads/*:refs/heads/*' 'refs/tags/*:refs/tags/*'
```

Then:
- **CI** runs on the new `main`, and **Cloudflare Pages** redeploys an
  identical tree. Both are harmless; check that CI is green.
- **GitHub still serves the old objects** through the three PRs' refs, by
  direct SHA URL, and from cached views, until GitHub Support purges them
  (repo → Support → "remove cached views / sensitive data"). Ask for that only
  if the image is the reason for the purge; otherwise it doesn't matter.

## 5. Afterwards

1. **The working checkout.** Don't re-clone: the folder holds untracked files
   a clone wouldn't bring back (`.env.local`, `.env.supabase`, the backup
   folder itself, `tail/`). Instead:
   ```bash
   cd "/Users/user/Project folder/activity-platform" && git fetch origin && git reset --hard origin/main
   ```
   Then `git gc --prune=now` there, after checking that the reflog holds
   nothing you want.
2. **Re-point the hash citations in tracked files** (179 of them). A small
   script reads `filter-repo/commit-map`, swaps each old full or abbreviated
   hash for the new one at the same length, and you commit the result as one
   docs change. A Claude session can write and run it once the mirror exists;
   it needs the map file.
3. **Outside the repo:**
   - **Curriculum pin.** `platform-pins/capability-facts.pin.json` in
     ZanReed/curriculum records `source_commit e34521e5…`. Their scheduled
     `capability-drift.yml` fetches our file **by path from `main`** and
     compares sha256, so it keeps working. Only the recorded commit stops
     resolving. Tell the curriculum side in the liaison channel, or fix it at
     the next pin bump. Their `boundary-page.md` cites our hashes too.
   - **Notion boundary page.** The catalogue-prompt row's commit stamp goes
     stale; refresh it (already pre-authorized).
   - **Claude memory files** cite many old hashes. They are history, so leave
     them; new sessions will read the commit-map line in STATE.
   - **STATE.md** gets one line saying that hashes before the purge date were
     rewritten and where the map lives (keep `commit-map` in a durable
     location, e.g. next to the bundle).
4. Delete `~/activity-platform-purge.git` once all of this is done. Keep the
   bundle and the commit-map.

## 6. Rollback

Until step 4, nothing outside your machine has changed: delete the mirror.
After step 4, restore with
`git clone ~/activity-platform-pre-purge-2026-11.bundle restored`, then
force-push its branches the same way. That brings the folder back into history
and reverts every hash, so only do it if the rewrite went wrong.
