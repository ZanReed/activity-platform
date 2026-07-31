-- =============================================================================
-- 0019_image_storage.sql — direct-to-Storage author images (Cloudflare exit)
-- -----------------------------------------------------------------------------
-- Per the 2026-07-31 Cloudflare-exit ruling (STATE.md → Current focus) and the
-- same-day eng review (decision record in DECISIONS.md → "Direct-to-Storage
-- image upload"): author images move off R2 onto Supabase Storage, and the
-- upload-image Edge Function is DELETED — the editor uploads straight to the
-- bucket, and this migration's INSERT policy is the authorization gate.
--
-- Images are safe on Supabase Storage where HTML never was: the free-tier
-- anti-abuse rewrite (`text/html` → `text/plain` + sandbox CSP, the reason R2
-- exists at all — CLAUDE.md) targets HTML only. `image/*` is served with its
-- true Content-Type.
--
-- Posture:
--
--   * public = true       → reads bypass RLS via /storage/v1/object/public/…,
--                           so a plain <img src> works cross-origin with no
--                           token. Same reachability the r2.dev bucket had;
--                           images were never secret (they render to any
--                           student). No SELECT policy needed or wanted.
--   * ONE INSERT policy   → authenticated users may insert ONLY under a key
--                           whose first (and only) folder is the id of an
--                           activity they can edit — the policy calls
--                           public.can_edit_activity, the SAME helper every
--                           other write path trusts (CLAUDE.md: never inline
--                           ownership checks in policies; call the helpers).
--                           When Phase 3+ grows the helper to recognize
--                           editor-role collaborators, the bucket follows
--                           automatically.
--   * NO update/delete    → objects are immutable-by-absence: an upsert or
--                           overwrite finds no UPDATE policy and dies, so an
--                           author can never clobber another's object (uuid
--                           keys make collisions vanishing, the policy makes
--                           them impossible). No delete path — orphans are an
--                           accepted residue (TODOS.md: post-S9 GC).
--
-- file_size_limit + allowed_mime_types are now LOAD-BEARING, not
-- belt-and-braces: with the Edge Function gone they are the only server-side
-- mime/size enforcement. Keep the two limits in sync with the client's
-- fail-fast guard (packages/app/src/lib/uploadImage.ts — which exists for
-- friendly messages, not for security).
--
-- Predicate notes (eng review D1/D5, 2026-07-31):
--   * The uuid cast is wrapped in CASE because Postgres does NOT guarantee
--     left-to-right AND evaluation — a bare regex guard beside the cast can be
--     reordered away, letting `garbage/x.png` abort the insert with a cast
--     ERROR instead of a clean policy denial. CASE is the guaranteed guard.
--   * The regex is case-insensitive (~*): activities.id and randomUUID() both
--     emit lowercase today, but an uppercase-normalized id from any future
--     code path must not become a silent deny.
--   * Text-comparison (a.id::text = segment) was considered and rejected: it
--     would inline the ownership check the helper rule exists to centralize.
--
-- Apply note: CREATE POLICY on storage.objects requires privileges on a table
-- Supabase owns. Probe-verified 2026-07-31 that `postgres` (the role both
-- `db push` and the MCP run as) CAN create policies there on this project.
-- If a future platform change breaks that ("must be owner of table objects"),
-- the recovery is: run this file's DDL verbatim in the dashboard SQL editor,
-- then `supabase migration repair --status applied 0019`.
-- =============================================================================

-- Idempotent: re-running reconciles the limits instead of erroring.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'activity-images',
  'activity-images',
  true,
  10485760, -- 10 MB — MAX_IMAGE_BYTES in packages/app/src/lib/uploadImage.ts
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

-- The gate. Key layout is `{activityId}/{uuid}.{ext}`:
--   storage.foldername(name) = the folder segments, excluding the filename —
--   exactly one segment allowed, and it must be the id of an activity the
--   caller can edit. Root-level keys (foldername = {}, so array_length is
--   NULL) and nested keys (length 2+) both fail the depth check; a non-uuid
--   segment falls to CASE's ELSE false without ever reaching the cast.
drop policy if exists activity_images_insert_editors on storage.objects;
create policy activity_images_insert_editors
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'activity-images'
  and array_length(storage.foldername(name), 1) = 1
  and case
        when (storage.foldername(name))[1]
             ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then public.can_edit_activity(((storage.foldername(name))[1])::uuid)
        else false
      end
);

-- Deliberately ABSENT (do not add without a design pass):
--   * INSERT policy without the can_edit_activity call — would open the bucket
--     to every signed-in user, students included.
--   * UPDATE policy — would enable overwrites (and is the prerequisite for
--     TUS/resumable upload progress; see TODOS.md before adding).
--   * SELECT/DELETE policies — reads ride the public-URL route; deletion is
--     the post-S9 GC's job, service-role side.

-- =============================================================================
-- Verification (run after applying; each EXPECT is the pass condition).
-- The full behavioral matrix — allow/deny per role, the cast-error pin, the
-- overwrite denial — lives in scripts/verify-image-storage.sql (re-run it
-- after ANY future auth/RLS/grant migration, per migrations/README.md).
-- =============================================================================
--
-- -- 1. Bucket exists, is public, and carries both limits.
-- --    EXPECT: 1 row, public=t, file_size_limit=10485760, 5 mime types.
-- select id, public, file_size_limit, allowed_mime_types
-- from storage.buckets where id = 'activity-images';
--
-- -- 2. EXACTLY the one INSERT policy references this bucket — no UPDATE,
-- --    DELETE, or SELECT policy does. EXPECT: 1 row, cmd = 'INSERT',
-- --    policyname = 'activity_images_insert_editors'.
-- select policyname, cmd
-- from pg_policies
-- where schemaname = 'storage' and tablename = 'objects'
--   and coalesce(qual, '') || coalesce(with_check, '') like '%activity-images%';
--
-- -- 3. The policy's WITH CHECK calls can_edit_activity (the helper rule) and
-- --    contains the CASE guard. EXPECT: 1 row, both flags true.
-- select policyname,
--        with_check like '%can_edit_activity%' as calls_helper,
--        with_check ilike '%case%'             as case_guarded
-- from pg_policies
-- where schemaname = 'storage' and tablename = 'objects'
--   and policyname = 'activity_images_insert_editors';
--
-- -- 4. RLS is on for storage.objects (Supabase default; assert it anyway).
-- --    EXPECT: relrowsecurity = t.
-- select relrowsecurity from pg_class c
-- join pg_namespace n on n.oid = c.relnamespace
-- where n.nspname = 'storage' and c.relname = 'objects';
--
-- -- 5. can_edit_activity's grant posture is unchanged by this migration.
-- --    EXPECT: exactly {authenticated, service_role} (+postgres), no anon,
-- --    no PUBLIC — the 0016 lockdown intact.
-- select coalesce(g.rolname, 'PUBLIC') as grantee
-- from pg_proc p
-- cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
-- left join pg_roles g on g.oid = a.grantee
-- where p.proname = 'can_edit_activity'
-- order by 1;
