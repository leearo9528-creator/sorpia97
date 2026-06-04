-- ============================================================================
-- 발자국 게시판 (board_posts, board_likes)
-- Supabase SQL Editor 에서 한 번 실행하세요. supabase/schema.sql 이후에 실행.
-- ============================================================================

create table if not exists public.board_posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  photo_url text,
  created_at timestamptz not null default now()
);
create index if not exists board_posts_created_idx on public.board_posts(created_at desc);

create table if not exists public.board_likes (
  post_id uuid not null references public.board_posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

alter table public.board_posts enable row level security;
alter table public.board_likes enable row level security;

-- 누구나 read, 회원만 insert, 본인 글만 update/delete, 관리자 전체
drop policy if exists "board_posts public read"   on public.board_posts;
drop policy if exists "board_posts member insert" on public.board_posts;
drop policy if exists "board_posts owner write"   on public.board_posts;
drop policy if exists "board_posts admin all"     on public.board_posts;

create policy "board_posts public read"   on public.board_posts for select using (true);
create policy "board_posts member insert" on public.board_posts for insert with check (auth.uid() = profile_id);
create policy "board_posts owner write"   on public.board_posts for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "board_posts admin all"     on public.board_posts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "board_likes public read"  on public.board_likes;
drop policy if exists "board_likes self write"   on public.board_likes;
drop policy if exists "board_likes admin all"    on public.board_likes;

create policy "board_likes public read" on public.board_likes for select using (true);
create policy "board_likes self write"  on public.board_likes for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "board_likes admin all"   on public.board_likes for all
  using (public.is_admin()) with check (public.is_admin());

-- ----- Storage: 발자국 사진 ----------------------------------------------
insert into storage.buckets (id, name, public) values ('board-photos','board-photos', true)
on conflict (id) do nothing;

drop policy if exists "board-photos public read" on storage.objects;
drop policy if exists "board-photos auth write"  on storage.objects;
create policy "board-photos public read" on storage.objects for select using (bucket_id = 'board-photos');
create policy "board-photos auth write"  on storage.objects for insert with check (
  bucket_id = 'board-photos' and auth.uid() is not null
);
