-- Cevee Job Tracker: structured Indonesian location codes and job posting platform.
-- Additive only; existing rows keep an empty province/regency/platform and their free-text location.

alter table public.job_applications
  add column if not exists province_code text not null default '',
  add column if not exists regency_code text not null default '',
  add column if not exists job_platform text not null default '';

create index if not exists idx_job_applications_job_platform
  on public.job_applications(user_id, job_platform);
