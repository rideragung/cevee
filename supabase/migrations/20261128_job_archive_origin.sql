-- Existing archives have no reliable origin. Leave them null for explicit restoration.
alter table public.job_applications add column if not exists archived_from text
  check (archived_from in ('applied', 'on_progress', 'offering', 'rejected'));
