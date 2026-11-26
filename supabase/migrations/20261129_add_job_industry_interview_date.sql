-- Cevee Job Tracker: industry category and interview date.
-- Additive only; existing rows keep an empty industry and no interview date.

alter table public.job_applications
  add column if not exists industry text not null default '',
  add column if not exists interview_date text;

create index if not exists idx_job_applications_industry
  on public.job_applications(user_id, industry);
