-- =============================================================================
-- 0019_image_storage.sql — the author-image bucket (Cloudflare-exit ruling)
-- -----------------------------------------------------------------------------
-- Per the 2026-07-31 Cloudflare-exit ruling (STATE.md → Current focus): every
-- asset moves off R2 except static hosting of the SPA. Images are the one
-- asset class that MUST move deliberately rather than dying with the rewrite —
-- published HTML and the graph kit simply stop existing at S9, but author
-- images are real content the editor keeps producing.
--
-- Images are safe on Supabase Storage where HTML never was: the free-tier
-- anti-abuse rewrite (`text/html` → `text/plain` + sandbox CSP, the reason R2
-- exists at all — CLAUDE.md) targets HTML only. `image/*` is served with its
-- true Content-Type. That asymmetry is the whole reason this migration can
-- exist while published pages still can't come home.
--
-- Posture — a PUBLIC bucket with ZERO write policies, which mirrors R2 exactly:
--
--   * public = true       → reads bypass RLS via /storage/v1/object/public/…,
--                           so a plain <img src> works cross-origin with no
--                           token, on published pages, the viewer, and print.
--                           Same reachability the r2.dev bucket had; images
--                           were never secret (they render to any student).
--   * no policies         → storage.objects has RLS on by default, so writing
--                           is deny-by-default for anon AND authenticated.
--                           Only service_role (which bypasses RLS) can write,
--                           i.e. ONLY the upload-image Edge Function. The
--                           allowlist/audit_log/activity_version_reads posture:
--                           absence of policy IS the access control.
--
-- The authorization decision therefore stays exactly where it already was —
-- upload-image calls `can_edit_activity` as the CALLER before it writes a byte.
-- The bucket is not the gate; the function is. This deliberately preserves the
-- shipped security model rather than re-deriving it in policy SQL (see the
-- follow-on note at the foot of this file for the direct-upload variant, which
-- WOULD move the gate into policy and is a separate design decision).
--
-- file_size_limit + allowed_mime_types are belt-and-braces: the function
-- already validates both (and returns friendlier 413/415s than Storage does),
-- but R2 enforced NOTHING server-side, so a bug in the function was the only
-- thing between a caller and an arbitrary object. Now the bucket refuses too.
-- Keep the three limits in sync: this file, upload-image/index.ts (MAX_BYTES /
-- MIME_TO_EXT), and packages/app/src/lib/uploadImage.ts (the fail-fast guard).
-- =============================================================================

-- Idempotent: re-running (or a `db push` that replays this file) reconciles the
-- limits instead of erroring on the existing bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'activity-images',
  'activity-images',
  true,
  10485760, -- 10 MB — MAX_BYTES in upload-image/index.ts
  array[
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/avif'
  ]::text[]
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No policies on storage.objects for this bucket, on purpose. See the header:
-- public read is granted by `public = true`, and every write path that is not
-- service_role is denied by RLS having no matching policy. Adding an INSERT
-- policy for `authenticated` here would silently widen writes to every signed-in
-- user (students included) — do not add one without replacing the function's
-- can_edit_activity gate with an equivalent policy predicate.

-- =============================================================================
-- Verification (run after applying; each EXPECT is the pass condition)
-- =============================================================================
--
-- -- 1. Bucket exists, is public, and carries both limits.
-- --    EXPECT: 1 row, public=t, file_size_limit=10485760, 5 mime types.
-- select id, public, file_size_limit, allowed_mime_types
-- from storage.buckets where id = 'activity-images';
--
-- -- 2. NO policies reference this bucket. EXPECT: 0 rows.
-- --    (Policies on storage.objects are global; this greps their bodies for
-- --     the bucket name, since a policy could name it in USING/WITH CHECK.)
-- select policyname, cmd, qual, with_check
-- from pg_policies
-- where schemaname = 'storage' and tablename = 'objects'
--   and coalesce(qual, '') || coalesce(with_check, '') like '%activity-images%';
--
-- -- 3. RLS is on for storage.objects (Supabase default; assert it anyway —
-- --    deny-by-default is doing the access control here).
-- --    EXPECT: relrowsecurity = t.
-- select relrowsecurity from pg_class c
-- join pg_namespace n on n.oid = c.relnamespace
-- where n.nspname = 'storage' and c.relname = 'objects';
--
-- -- 4. Negative check, from the app (not SQL): signed in as a teacher, a direct
-- --    supabase.storage.from('activity-images').upload(...) must FAIL with a
-- --    row-level-security error. If it SUCCEEDS, a policy leaked in and every
-- --    authenticated user can write to the bucket — fix before deploying.
--
-- =============================================================================
-- Follow-on, NOT taken here (deliberate): direct-to-Storage upload.
-- -----------------------------------------------------------------------------
-- With Storage as the backend, the Edge Function is no longer load-bearing for
-- transport — the client could upload straight to the bucket under an INSERT
-- policy like
--   (storage.foldername(name))[1]::uuid  -- the activity id path segment
-- fed to can_edit_activity, with the bucket's own mime/size limits doing the
-- validation the function does today. That deletes a function, a multipart
-- round-trip through Deno, and the service-role write path, and it makes upload
-- progress reportable. It also moves the authorization gate from function code
-- into policy SQL, which is a real architecture decision (and needs its own
-- verification pass), so it is scoped OUT of this retarget. The key layout here
-- is already shaped for it: `{activityId}/{uuid}.{ext}` puts the activity id at
-- foldername index 1 with no dead prefix above it.
-- =============================================================================
