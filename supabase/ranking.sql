-- 월별 랭킹 집계 함수
-- security definer: RLS 우회하여 전체 방문 집계 (display_name + count만 반환, 개인정보 없음)
create or replace function public.get_monthly_ranking(p_year int, p_month int)
returns table(
  profile_id uuid,
  display_name text,
  visit_count bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select
    v.profile_id,
    coalesce(p.display_name, '회원') as display_name,
    count(*)::bigint as visit_count
  from public.visits v
  join public.profiles p on p.id = v.profile_id
  where
    extract(year  from v.visited_at at time zone 'Asia/Seoul') = p_year
    and extract(month from v.visited_at at time zone 'Asia/Seoul') = p_month
  group by v.profile_id, p.display_name
  order by visit_count desc
  limit 50;
$$;

-- 익명 포함 누구나 호출 가능 (반환값에 민감 정보 없음)
grant execute on function public.get_monthly_ranking(int, int) to anon, authenticated;
