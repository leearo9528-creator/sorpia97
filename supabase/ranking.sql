-- 월별 랭킹 집계 함수
-- security definer: RLS 우회하여 전체 방문 집계
-- 동률 시 강아지 수가 많은 보호자가 상위 순위
create or replace function public.get_monthly_ranking(p_year int, p_month int)
returns table(
  profile_id uuid,
  display_name text,
  visit_count bigint,
  dog_count  bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select
    v.profile_id,
    coalesce(p.display_name, '회원') as display_name,
    count(distinct v.id)::bigint                         as visit_count,
    (select count(*) from public.dogs d where d.owner_id = v.profile_id)::bigint as dog_count
  from public.visits v
  join public.profiles p on p.id = v.profile_id
  where
    extract(year  from v.visited_at at time zone 'Asia/Seoul') = p_year
    and extract(month from v.visited_at at time zone 'Asia/Seoul') = p_month
  group by v.profile_id, p.display_name
  order by visit_count desc, dog_count desc
  limit 50;
$$;

grant execute on function public.get_monthly_ranking(int, int) to anon, authenticated;
