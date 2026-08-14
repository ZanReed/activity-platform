-- =============================================================================
-- 0030_class_activities.sql — S9 Drop 2: the student content surface
-- =============================================================================
-- The E-5 deferral comes due: a student shell whose Home lists classes but
-- can't reach activities is not a cutover. This migration is the D-2 package
-- as reworked by eng review (E-3 + E-6/OV-1 + D-3/E-2), all author-ruled:
--
--   1. `class_activities` — the purpose-built join table ("what appears on
--      students' Home"). NOT a retrofit of `assignments` (dead Phase-3 table,
--      wrong shape, zero consumers — left dormant).
--   2. TWO audited DEFINER write RPCs — `share_activity_to_class` /
--      `unshare_activity_from_class` — in the 0027 posture: deny-by-default,
--      `class.update` audit rows carrying the activity id. Client
--      INSERT/DELETE are denied outright.
--   3. `list_class_activities()` — the student Home list as ONE round trip.
--      OV-1 proved the original joined-select unimplementable
--      (`activities_select_own` is owner-only; a student's join returns no
--      titles), so this is a SECURITY DEFINER read scoped to the caller's
--      memberships. `can_read_activity` is NOT widened (the recorded
--      Activity-Bank landmine).
--   4. `get_class_public_meta(join_code)` — the anon pre-auth class-name
--      lookup (design ruling P2's S9 fix): the join gate shows "Join <class
--      name>" instead of the bare code. Served through get-activity's
--      anonymous meta branch (E-2) — never called directly by clients.
--
-- POSTURE (OV-9, stated so teacher copy never implies otherwise): share =
-- DISCOVERY, published = OPEN. Any signed-in admitted student can open any
-- published activity by UUID (`get_published_activity` grants to all
-- authenticated — unchanged link-sharing reality). `class_activities`
-- controls what appears on Home, not who may read. Access scoping is a named
-- future ruling, never a side effect.
--
-- ENUMERATION (OV-4, the honest arithmetic): join codes are ≈2^29.7 via
-- non-crypto random(), and get_class_public_meta is reachable anonymously
-- through the meta branch. The inherited limiter is self-documented as
-- nearly inert; a P3 liveness row forces it to fire once at production
-- values on the join_code path. Proportionality, recorded: a discovered code
-- is exploitable only BY an admitted student; payoff = class name + a
-- joinable code; recovery = B14 remove-and-regenerate. Revisit triggers:
-- multi-district, public signup, observed enumeration in logs. No DB write
-- on the read path (standing rule).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. The join table
-- -----------------------------------------------------------------------------
-- PK (class_id, activity_id): dedupe by construction — a double-clicked Add
-- upserts into a no-op instead of a duplicate row. Both FKs ON DELETE CASCADE:
-- they fire only at HARD purge (reads filter soft-deletes via the helpers /
-- server-side filters), so a purged class or activity takes its Home rows
-- with it instead of stranding orphans.
create table class_activities (
  class_id    uuid not null references classes(id) on delete cascade,
  activity_id uuid not null references activities(id) on delete cascade,
  added_by    uuid not null references users(id),
  added_at    timestamptz not null default now(),
  primary key (class_id, activity_id)
);

-- The student list reads newest-first per class (DR-1's mirror ordering:
-- tiebreak (added_at, activity_id)).
create index class_activities_class_idx
  on class_activities (class_id, added_at desc, activity_id desc);

alter table class_activities enable row level security;
alter table class_activities force row level security;

-- READS: members see their class's rows; the teacher sees their own class's.
-- (The teacher-side card ALSO joins activities for status/deleted_at — those
-- columns are visible to them via activities_select_own, since share below
-- requires ownership. DR-7's muted dead rows depend on that join.)
create policy class_activities_select
  on class_activities for select
  using (is_class_member(class_id) or is_class_teacher(class_id));

-- WRITES: none. No INSERT/UPDATE/DELETE policies — the audited RPCs below
-- are the only doors (0027 posture). 0028's default-privilege revoke means a
-- new table gets NO client grants; SELECT is granted back explicitly, and
-- verify-0030 asserts INSERT/DELETE stay denied at the grant layer too.
grant select on class_activities to authenticated;
grant select, insert, update, delete on class_activities to service_role;

-- -----------------------------------------------------------------------------
-- 2. share / unshare — the audited write doors
-- -----------------------------------------------------------------------------
-- Both raise plain-text errors the client maps (the join_class idiom). Share
-- REFUSES a never-published / no-longer-published activity (E-3): a Home row
-- students can't open is a broken promise, and the race (activity unpublished
-- between picker load and Add) gets DR-9(f)'s honest copy client-side.
create or replace function share_activity_to_class(
  p_class_id uuid,
  p_activity_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'Not your class';
  end if;
  if not can_edit_activity(p_activity_id) then
    raise exception 'Not your activity';
  end if;
  if not exists (
    select 1 from activities a
     where a.id = p_activity_id
       and a.status = 'published'
       and a.current_version_id is not null
       and a.deleted_at is null
  ) then
    raise exception 'Activity is not published';
  end if;

  -- Dedupe by construction: re-adding is a success no-op, and the audit rail
  -- below only records rows that actually came to exist.
  insert into class_activities (class_id, activity_id, added_by)
  values (p_class_id, p_activity_id, auth.uid())
  on conflict (class_id, activity_id) do nothing;

  if found then
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'class.update', 'class', p_class_id,
            jsonb_build_object('op', 'share_activity',
                               'activity_id', p_activity_id));
  end if;
end;
$$;

-- Unshare is the same lockout family as B14 (it changes what students see),
-- so it is audited the same way. Removing a row that is not there is a
-- success no-op WITHOUT an audit row — an audit rail that records non-events
-- lies. NOTE: no published-status check here, deliberately — DR-7's muted
-- dead rows exist precisely so a teacher can Remove an unpublished/deleted
-- activity's row.
create or replace function unshare_activity_from_class(
  p_class_id uuid,
  p_activity_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_class_teacher(p_class_id) then
    raise exception 'Not your class';
  end if;

  delete from class_activities
   where class_id = p_class_id and activity_id = p_activity_id;

  if found then
    insert into audit_log (actor_id, action, target_type, target_id, metadata)
    values (auth.uid(), 'class.update', 'class', p_class_id,
            jsonb_build_object('op', 'unshare_activity',
                               'activity_id', p_activity_id));
  end if;
end;
$$;

revoke execute on function share_activity_to_class(uuid, uuid) from public, anon;
revoke execute on function unshare_activity_from_class(uuid, uuid) from public, anon;
grant execute on function share_activity_to_class(uuid, uuid) to authenticated, service_role;
grant execute on function unshare_activity_from_class(uuid, uuid) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. The student Home list — ONE round trip (E-6 as reworked by OV-1)
-- -----------------------------------------------------------------------------
-- DEFINER because the student cannot read activity titles under RLS
-- (activities_select_own is owner-only) and can_read_activity must NOT widen.
-- The published + non-deleted filters run HERE, server-side, as defense in
-- depth — the client never gets a row it shouldn't render (DR: soft-deleted /
-- unpublished activities never render; a deleted class vanishes on next
-- fetch, ruled deliberate).
create or replace function list_class_activities()
returns table (
  class_id uuid,
  activity_id uuid,
  title text,
  added_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select ca.class_id, ca.activity_id, a.title, ca.added_at
  from class_activities ca
  join classes c on c.id = ca.class_id
  join class_members m on m.class_id = ca.class_id
  join activities a on a.id = ca.activity_id
  where m.student_id = auth.uid()
    and m.removed_at is null
    and c.deleted_at is null
    and a.status = 'published'
    and a.current_version_id is not null
    and a.deleted_at is null
  order by ca.added_at desc, ca.activity_id desc;
$$;

revoke execute on function list_class_activities() from public, anon;
grant execute on function list_class_activities() to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 4. The anon pre-auth class-name lookup (D-3/E-2)
-- -----------------------------------------------------------------------------
-- Same normalization as join_class (upper/trim), same deleted_at gate. Wire
-- discipline: the NAME and nothing else — no teacher name (the 0021 posture:
-- every current teacher display_name is NULL by ruling, and the join gate's
-- ruled composition shows only the class name), no ids, no code echo, no
-- member counts. The ONLY caller is get-activity's anonymous meta branch;
-- clients never call this RPC directly, but the grant is anon because that
-- branch runs as anon (the get_activity_public_meta precedent, 0017).
create or replace function get_class_public_meta(p_join_code text)
returns table (name text)
language sql
stable
security definer
set search_path = public
as $$
  select c.name
  from classes c
  where c.join_code = upper(trim(p_join_code))
    and c.deleted_at is null;
$$;

revoke execute on function get_class_public_meta(text) from public;
grant execute on function get_class_public_meta(text) to anon, authenticated, service_role;

-- =============================================================================
-- Verification: scripts/verify-0030.sql (registered in the verify-runner set).
-- NB verify-0028 §A's anon-reachable roster assertion was updated in the same
-- commit — the roster is now exactly TWO (get_activity_public_meta,
-- get_class_public_meta); leaving it at one would go red at the next live run.
-- =============================================================================
