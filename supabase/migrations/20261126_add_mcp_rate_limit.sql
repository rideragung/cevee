-- Phase 4: per-user rate limit for the remote MCP endpoint.
-- The Edge function calls consume_mcp_quota() with the user's own access token.
-- Direct table access is denied; only the security-definer function can write.

create table if not exists public.mcp_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null default 0,
  primary key (user_id, window_start)
);

create index if not exists mcp_usage_window_start_idx
  on public.mcp_usage (window_start);

alter table public.mcp_usage enable row level security;
revoke all on public.mcp_usage from anon, authenticated;

create or replace function public.consume_mcp_quota(
  p_limit integer default 120,
  p_window_seconds integer default 60
)
returns table(allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_window_start timestamptz;
  v_count integer;
  v_limit integer := greatest(1, p_limit);
  v_window_seconds integer := greatest(1, p_window_seconds);
begin
  if v_user_id is null then
    return query select false, 0, now();
    return;
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / v_window_seconds) * v_window_seconds
  );

  insert into public.mcp_usage (user_id, window_start, request_count)
  values (v_user_id, v_window_start, 1)
  on conflict (user_id, window_start)
  do update set request_count = public.mcp_usage.request_count + 1
  returning request_count into v_count;

  return query
    select
      v_count <= v_limit,
      greatest(v_limit - v_count, 0),
      v_window_start + make_interval(secs => v_window_seconds);
end;
$$;

revoke all on function public.consume_mcp_quota(integer, integer) from public;
grant execute on function public.consume_mcp_quota(integer, integer) to authenticated;

-- Optional maintenance (run occasionally or schedule with pg_cron):
-- delete from public.mcp_usage where window_start < now() - interval '2 days';
