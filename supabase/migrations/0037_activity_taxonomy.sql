-- =============================================================================
-- 0037_activity_taxonomy.sql — tags, pedagogical_role, and publish-truth
--                              course/unit stamping
-- -----------------------------------------------------------------------------
-- Plan + every ruling: docs/design/activity-taxonomy.md (eng review 2026-08-18,
-- R1-R8 + outside voice). This is Drop 1 of a two-drop arc; Drop 2 adds the
-- ```meta import fence so pasted markdown can carry these fields.
--
--   §A  pedagogical_role — the Bank's trust-layer enum, captured at authoring
--       time (R7). Named pedagogical_role and NEVER activity_type: the
--       document already has meta.activityType (worksheet/exit_ticket/warm_up/
--       review) meaning PRESENTATION FORMAT. These are two axes — a Lesson can
--       be a worksheet or an exit ticket — and both vocabularies contain the
--       word "review". The naming is the whole collision fix (R2).
--   §B  tags — row-native discovery vocabulary (R4).
--   §C  publish_activity v2 — stamps course/unit from the published snapshot.
--
-- THE PROVENANCE RULING (R1/D9) — the load-bearing idea in this migration:
--
--   activities.course / .unit are PUBLISH-truth. They mirror what students
--   actually see, because the future catalog RPC lists PUBLISHED activities
--   and the viewer renders doc.meta.course from the published snapshot
--   (ViewerContainer.tsx). Stamping them from the DRAFT on every autosave --
--   the shape this migration deliberately does NOT take -- would let the
--   catalog advertise a course name no student has been served, and there is
--   no draft left to re-stamp from afterwards: publish_activity sets
--   draft_content = null on the very same UPDATE.
--
--   activities.tags / .pedagogical_role are the OPPOSITE and on purpose: they
--   are row-native LISTING metadata, like activities.visibility. Editing them
--   takes effect immediately, with no republish, because they describe how an
--   activity is filed rather than what it teaches. Nothing in this migration
--   stamps them -- the client writes them directly.
--
--   One column, one meaning. Do not add a second writer to course/unit.
--
-- NO GIN INDEX HERE, deliberately (R4/D12). The authoring surface filters
-- client-side over the owner's own already-fetched rows, so an index would
-- have no caller — and P1 says a primitive is not delivered until something
-- calls it. The Bank's catalog RPC migration adds `create index ... using gin
-- (tags)` beside its first server-side tag query, where its reasoning is
-- visible. On a few hundred rows Postgres seq-scans regardless.
--
-- GRANTS: none needed. 0032 grants select/insert/update/delete on
-- public.activities at TABLE level, which covers columns added later, and the
-- owner-scoped RLS policies are row-level and unchanged. No new read surface.
--
-- COMPLIANCE: none owed. tags / pedagogical_role / course / unit are activity
-- metadata, not person-referencing, so data-map-coverage.test.mjs neither
-- demands nor gets an entry.
-- =============================================================================

-- @section A-pedagogical-role

create type pedagogical_role as enum ('lesson', 'review', 'practice');

comment on type pedagogical_role is
  'The Activity Bank trust-layer label (design 2026-07-24 P3): Lesson (its DoL '
  'travels inside it), Review (spaced retrieval, NOT day-of-teaching content), '
  'Practice (as-needed resource shelf). Distinct from the DOCUMENT field '
  'meta.activityType, which is presentation format. See docs/design/'
  'activity-taxonomy.md R2/R7.';

alter table activities
  add column pedagogical_role pedagogical_role;

comment on column activities.pedagogical_role is
  'Row-native listing metadata, nullable (unclassified is a legitimate state). '
  'Written directly by the client; never stamped from the document.';

-- @section B-tags

alter table activities
  add column tags text[] not null default '{}';

comment on column activities.tags is
  'Row-native discovery vocabulary. Stored form is normalized by '
  'packages/app/src/lib/normalizeTags.ts (lowercased, trimmed, inner '
  'whitespace collapsed, deduped, unicode letters preserved) -- every write '
  'path routes through that one function. Free-text by ruling R4/R5; a '
  'controlled vocabulary is the deferred (c) migration. Role words belong in '
  'pedagogical_role, NOT here (R3 guardrail).';

-- @section C-publish-activity-v2

-- publish_activity v2 — identical to 0003's definition except for the two
-- stamped columns in the final UPDATE. Restated in full because `create or
-- replace function` needs the whole body; grants survive a replace, so the
-- 0003 `grant execute ... to authenticated` still stands.
--
-- Header correction while we are here (P5 — retiring a claim means auditing
-- the comments that cite it): 0003's original header said this RPC is "called
-- by the publish Edge Function" which then "renders and uploads the static
-- HTML to R2". That has been false since S9 Drop 1 — publish-activity was
-- deleted, the R2 world is gone, and the caller is now usePublish.ts calling
-- this RPC directly. The returned version id is still the contract.
create or replace function publish_activity(p_activity_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_draft_content jsonb;
  v_next_num      integer;
  v_version_id    uuid;
begin
  -- Authorization. SECURITY DEFINER bypasses RLS, so we explicitly check
  -- via the helper. Phase 3+: when collaborator roles arrive, this function
  -- gains nothing; can_edit_activity grows to recognize editor-role
  -- collaborators and that change flows through here automatically.
  if not can_edit_activity(p_activity_id) then
    raise exception 'Not authorized to publish this activity';
  end if;

  -- Load the draft content. Activity existence + non-deleted-ness was
  -- already verified by can_edit_activity above.
  select draft_content
    into v_draft_content
  from activities
  where id = p_activity_id;

  if v_draft_content is null then
    raise exception 'No draft content to publish';
  end if;

  -- Compute the next version number for this activity.
  select coalesce(max(version_num), 0) + 1
    into v_next_num
  from activity_versions
  where activity_id = p_activity_id;

  -- Insert the new version (immutable snapshot of the draft).
  insert into activity_versions (activity_id, version_num, content, created_by)
  values (p_activity_id, v_next_num, v_draft_content, auth.uid())
  returning id into v_version_id;

  -- Point the activity at the new version, mark as published, clear draft,
  -- and STAMP the publish-truth taxonomy columns from the snapshot we just
  -- froze (R1). Both reads are against v_draft_content — the exact jsonb
  -- written to activity_versions above — so the columns and the version can
  -- never disagree, and the stamp is inside the same transaction.
  --
  -- course is `not null` on the row, so a document missing meta.course keeps
  -- the previous column value rather than violating the constraint. unit is
  -- nullable and assigned directly: a published document with no unit means
  -- the activity HAS no unit, and the column must say so (mirroring, not
  -- accumulating).
  update activities
  set current_version_id = v_version_id,
      status             = 'published',
      draft_content      = null,
      course             = coalesce(v_draft_content -> 'meta' ->> 'course', course),
      unit               = v_draft_content -> 'meta' ->> 'unit',
      updated_at         = now()
  where id = p_activity_id;

  insert into audit_log (actor_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    'activity.publish',
    'activity',
    p_activity_id,
    jsonb_build_object('version_id', v_version_id, 'version_num', v_next_num)
  );

  return v_version_id;
end;
$$;
