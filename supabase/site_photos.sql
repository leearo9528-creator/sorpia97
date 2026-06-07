-- 사이트 설정 테이블 (홈 사진 등 key-value 저장)
create table if not exists public.site_settings (
  key   text primary key,
  value text
);

alter table public.site_settings enable row level security;

create policy "누구나 읽기"
  on public.site_settings for select using (true);

create policy "관리자만 수정"
  on public.site_settings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 메뉴 아이템 사진 컬럼
alter table public.menu_items
  add column if not exists photo_url text;
