-- Cevee Job Tracker migration.
-- Creates (or upgrades) the job_applications table with Row Level Security and optimistic concurrency.

create table if not exists public.job_applications (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  resume_id text,
  company text not null,
  role text not null,
  status text not null default 'applied',
  progress_stage text,
  employment_type text not null default 'full_time',
  work_mode text not null default 'onsite',
  location text not null default '',
  salary_range text not null default '',
  job_url text not null default '',
  applied_date text,
  job_description text not null default '',
  notes text not null default '',
  version integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Additive upgrades for existing deployments
alter table public.job_applications
  add column if not exists progress_stage text;

alter table public.job_applications
  add column if not exists employment_type text not null default 'full_time';

create index if not exists idx_job_applications_user_id
  on public.job_applications(user_id);

create index if not exists idx_job_applications_updated_at
  on public.job_applications(updated_at desc);

create index if not exists idx_job_applications_status
  on public.job_applications(user_id, status);

alter table public.job_applications enable row level security;

drop policy if exists "Users can CRUD their own job applications" on public.job_applications;

create policy "Users can CRUD their own job applications"
  on public.job_applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
