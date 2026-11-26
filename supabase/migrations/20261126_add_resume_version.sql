-- Cevee MCP / optimistic concurrency migration.
-- Run this in the Supabase SQL editor before deploying the app version that
-- writes `version`. The app degrades to legacy upsert mode when the column is
-- missing, but conflict protection only works once this migration is applied.

alter table public.resumes
  add column if not exists version integer not null default 1;

-- Existing rows are already at version 1 thanks to the column default.
-- A conditional update must match both id and version:
--
--   update public.resumes
--      set title = $1,
--          layout_id = $2,
--          content = $3,
--          version = version + 1,
--          updated_at = now()
--    where id = $4
--      and version = $5
--  returning version;
