-- ============================================================================
-- 비로그인 사용자도 '오늘의 소르피아' / '발자국'을 볼 수 있게 하는 함수들
-- security definer 로 RLS 우회. 노출되는 컬럼만 골라 반환하여 안전.
-- ============================================================================

-- 1) 오늘 출석한 강아지 목록 (이름 + 사진만)
drop function if exists public.get_today_dogs();

create or replace function public.get_today_dogs()
returns table(
  id        uuid,
  name      text,
  photo_url text
)
language sql
security definer
stable
set search_path = public
as $$
  select distinct d.id, d.name, d.photo_url
  from public.dogs d
  where d.owner_id in (
    select v.profile_id
    from public.visits v
    where v.visited_at at time zone 'Asia/Seoul'
       >= (current_date at time zone 'Asia/Seoul')
  )
  order by d.name;
$$;

grant execute on function public.get_today_dogs() to anon, authenticated;

-- 2) 발자국 게시글 목록 (작성자 이름 + 좋아요 카운트)
drop function if exists public.get_board_posts(int);

create or replace function public.get_board_posts(p_limit int default 50)
returns table(
  id           uuid,
  profile_id   uuid,
  content      text,
  photo_url    text,
  created_at   timestamptz,
  author_name  text,
  like_count   bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select
    bp.id,
    bp.profile_id,
    bp.content,
    bp.photo_url,
    bp.created_at,
    coalesce(p.display_name, '알 수 없음') as author_name,
    (select count(*) from public.board_likes bl where bl.post_id = bp.id) as like_count
  from public.board_posts bp
  left join public.profiles p on p.id = bp.profile_id
  order by bp.created_at desc
  limit p_limit;
$$;

grant execute on function public.get_board_posts(int) to anon, authenticated;
