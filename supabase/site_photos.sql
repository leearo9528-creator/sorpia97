-- 사이트 설정 (텍스트 key-value)
create table if not exists public.site_settings (
  key   text primary key,
  value text
);
alter table public.site_settings enable row level security;
create policy "누구나 읽기" on public.site_settings for select using (true);
create policy "관리자만 수정" on public.site_settings for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 사이트 사진 (슬롯별 여러 장)
create table if not exists public.site_photos (
  id         uuid primary key default gen_random_uuid(),
  slot       text not null,          -- 'homepage'
  url        text not null,
  sort_order int  not null default 0,
  created_at timestamptz default now()
);
alter table public.site_photos enable row level security;
create policy "누구나 읽기" on public.site_photos for select using (true);
create policy "관리자만 수정" on public.site_photos for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 메뉴 아이템 사진 컬럼
alter table public.menu_items
  add column if not exists photo_url text;
