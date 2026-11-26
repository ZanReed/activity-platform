// =============================================================================
// server/dbPorts.check.ts — the server ports' row types fit the database
// (review C1 slice 5; docs/design/database-snapshot-and-types.md D4)
// -----------------------------------------------------------------------------
// The handlers in this directory read the database through hand-written port
// types (VersionForCheckRow, OwnCheckRow, …) that the Edge Functions' index.ts
// files fill with supabase-js calls. Nothing typechecks those Deno files (no
// Deno in CI), so a column renamed or retyped in a migration would reach the
// handlers unnoticed. This file checks, at compile time, that every port field
// is a column the generated schema (@activity/db-types, `pnpm db:types`) gives
// the function or table behind it, with a type the column's value fits;
// `unknown` fields (a jsonb the handler validates itself) only have to exist.
//
// THE MAPPING IS HAND-KEPT: each line below names the function or table that
// supabase/functions/{check,get}-activity/index.ts uses for that port today
// (checked 2026-11-26). If index.ts switches a port to another source, nothing
// here notices — that needs the Deno files typechecked (TODOS).
//
// It fails, rather than passing vacuously, when the source stops being a row
// set (a read rewrapped as jsonb, as 0104/0106 did — `RowOf` is then `never`)
// or a column is typed `any`. Nullability: checked for TABLE reads (the
// generator knows a table's NOT NULLs), not for function results (Postgres
// records none, so the generator types every result column non-null).
//
// Not imported by anything: no bundle carries it; tsc reads it because it is
// under src/. jsonb results (record_check, my_dol_state) stay hand-written.
// =============================================================================

import type { Database, Json } from '@activity/db-types';
import type { OwnCheckRow, VersionForCheckRow } from './check-activity-handler.js';
import type { GetActivityDb, PublishedActivityRow } from './get-activity-handler.js';
import type { PracticeAttemptRow, PracticeSnapshotRow } from './practice-handler.js';
import type { VideoSource } from '../blocks/videoSource.js';

type Fns = Database['public']['Functions'];
type Tables = Database['public']['Tables'];
type RowOf<F extends keyof Fns> = Fns[F]['Returns'] extends (infer R)[] ? R : never;

type IsAny<T> = 0 extends 1 & T ? true : false;
/** A function result's column fits the port field (nullability not known). */
type FieldFits<Port, Column> = IsAny<Column> extends true ? false
  : unknown extends Port ? true
  : [NonNullable<Column>] extends [NonNullable<Port>] ? true : false;
/** A table column fits the port field, nullability included. */
type FieldFitsStrict<Port, Column> = IsAny<Column> extends true ? false
  : unknown extends Port ? true
  : [Column] extends [Port] ? true : false;
/** Every field of the port is a column of `Row`, and its value fits. `never` rows fail. */
type Fits<Port, Row, Strict extends boolean = false> = [Row] extends [never] ? false
  : { [K in keyof Port]-?: K extends keyof Row
      ? (Strict extends true ? FieldFitsStrict<Port[K], Row[K]> : FieldFits<Port[K], Row[K]>)
      : false }[keyof Port];
/** A port's row may be INSERTED: every required column is sent, every sent
 *  field is a column, and its value fits (a jsonb column takes anything). */
type InsertFits<Port, Insert> =
  | { [K in keyof Insert]-?: undefined extends Insert[K] ? true : K extends keyof Port ? true : false }[keyof Insert]
  | { [K in keyof Port]-?: K extends keyof Insert
      ? (NonNullable<Json> extends NonNullable<Insert[K]> ? true : [Port[K]] extends [Insert[K]] ? true : false)
      : false }[keyof Port];
type Assert<T extends true> = T;

// ---- row-set functions (the server ports) ------------------------------------
export type VersionForCheck = Assert<Fits<VersionForCheckRow, RowOf<'get_activity_version_for_check'>>>;
export type PublishedActivity = Assert<Fits<PublishedActivityRow, RowOf<'get_published_activity'>>>;
export type PublicMeta = Assert<Fits<{ title: string; teacher_name: string | null }, RowOf<'get_activity_public_meta'>>>;
export type ClassMeta = Assert<Fits<{ name: string }, RowOf<'get_class_public_meta'>>>;
export type OwnChecks = Assert<Fits<OwnCheckRow, RowOf<'my_latest_checks'>>>;

// ---- table reads and writes (the server ports; nullability checked) ----------------
export type VersionContent = Assert<Fits<{ content: unknown }, Tables['activity_versions']['Row'], true>>;
export type CacheRead = Assert<Fits<{ content: unknown }, Tables['activity_version_reads']['Row'], true>>;
export type CacheWrite = Assert<InsertFits<Parameters<GetActivityDb['upsertCache']>[0], Tables['activity_version_reads']['Insert']>>;
export type CheckPhotos = Assert<Fits<{ responses: unknown }, Tables['section_checks']['Row'], true>>;
export type MixedSnapshots = Assert<Fits<PracticeSnapshotRow, Tables['mixed_session_items']['Row'], true>>;
export type MixedAttempts = Assert<Fits<PracticeAttemptRow, Tables['mixed_attempts']['Row'], true>>;
export type DolSnapshots = Assert<Fits<Omit<PracticeSnapshotRow, 'position' | 'retry_of'>, Tables['dol_practice_items']['Row'], true>>;
export type DolAttempts = Assert<Fits<PracticeAttemptRow, Tables['dol_practice_attempts']['Row'], true>>;

// ---- not a server port: the clip block's client read (blocks/videoSource.ts) --------
// The server's videoSource port is DbResult<unknown[]> and needs no check; the
// CLIENT side reads video_source's rows as VideoSource through the photo/video seam.
export type ClientVideoSource = Assert<Fits<VideoSource, RowOf<'video_source'>>>;
