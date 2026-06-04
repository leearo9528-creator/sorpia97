-- ============================================================================
-- 멍카페 (애견동반 카페) 스키마
-- Supabase SQL Editor 에서 한 번에 실행하세요.
-- ============================================================================

-- ----- 확장 --------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----- profiles ----------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  display_name text,
  phone text,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now()
);

-- 새 가입자 자동으로 profiles 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 관리자 판정 함수 (RLS 에서 재사용)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----- dogs --------------------------------------------------------------
create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  birthday date,
  photo_url text,
  created_at timestamptz not null default now()
);
create index if not exists dogs_owner_idx on public.dogs(owner_id);

-- ----- visits (출석) -----------------------------------------------------
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  visited_at timestamptz not null default now(),
  checked_by uuid references public.profiles(id),
  memo text
);
create index if not exists visits_profile_idx on public.visits(profile_id, visited_at desc);

-- ----- coupons -----------------------------------------------------------
-- 종류:
--   attendance: 출석 N회 적립 보상 (예: 10회 시 음료 1잔 무료)
--   pass_drink: 구독 패스 월별 음료 쿠폰
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('attendance','pass_drink','etc')),
  title text not null,
  description text,
  source text,                       -- 어떤 룰/구독에서 발급됐는지
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  used_at timestamptz,
  used_by uuid references public.profiles(id)
);
create index if not exists coupons_profile_idx
  on public.coupons(profile_id, used_at, expires_at);

-- ----- contents (소개·시설 CMS) -----------------------------------------
create table if not exists public.contents (
  key text primary key,
  title text,
  body text,
  image_url text,
  updated_at timestamptz not null default now()
);

insert into public.contents (key, title, body) values
  ('cafe_intro',
   '5,000평 자연 속, 반려견과의 하루',
   E'경기도 동두천시 삼육사로 1802에 위치한 경기북부 일대 최대 규모의 애견동반 카페이자 캠프닉 복합 공간입니다.\n\n체급별 운동장 4개, 4단 자연 계곡, 12동의 프라이빗 캠프닉 텐트, 바베큐 존, 감성 카페와 무인 편의점까지 — 반려견과 보호자 모두를 위한 모든 것이 한 곳에 모여 있습니다.\n\n동두천 놀자숲 후문 바로 앞 · 왕방산 계곡 인접.'),
  ('facility',
   '시설 안내',
   '강아지 체급별 운동장부터 계곡 물놀이, 캠핑·바베큐까지 — 하루가 짧은 5,000평')
on conflict (key) do nothing;

-- ----- subscription_passes (판매 상품 정의) -----------------------------
-- 예: 넥스가드 패스 (12개월, 월 1회 넥스가드 + 음료 15잔)
create table if not exists public.subscription_passes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  duration_months int not null default 12,
  monthly_product text,             -- 매월 지급되는 제품 (예: '넥스가드')
  monthly_drink_quota int not null default 0,
  price int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.subscription_passes (code,name,description,duration_months,monthly_product,monthly_drink_quota,price) values
  ('nexgard12','넥스가드 패스','12개월 동안 매월 넥스가드 1개와 음료 쿠폰 15장을 제공합니다.',12,'넥스가드',15,360000)
on conflict (code) do nothing;

-- ----- pass_orders (구독 가입) -------------------------------------------
create table if not exists public.pass_orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  pass_id uuid not null references public.subscription_passes(id),
  started_on date not null default current_date,
  expires_on date not null,
  status text not null default 'active' check (status in ('active','paused','expired','canceled')),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists pass_orders_profile_idx on public.pass_orders(profile_id);

-- ----- pass_redemptions (월별 지급 이력) -------------------------------
create table if not exists public.pass_redemptions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.pass_orders(id) on delete cascade,
  month_index int not null,                  -- 1..duration_months
  product_redeemed_at timestamptz,           -- 넥스가드 수령 일시
  drinks_issued boolean not null default false,
  notes text,
  unique (order_id, month_index)
);

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.profiles            enable row level security;
alter table public.dogs                enable row level security;
alter table public.visits              enable row level security;
alter table public.coupons             enable row level security;
alter table public.contents            enable row level security;
alter table public.subscription_passes enable row level security;
alter table public.pass_orders         enable row level security;
alter table public.pass_redemptions    enable row level security;

-- profiles: 본인 / 관리자
drop policy if exists "profiles self read"  on public.profiles;
drop policy if exists "profiles self write" on public.profiles;
drop policy if exists "profiles admin all"  on public.profiles;
create policy "profiles self read"  on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles self write" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles admin all"  on public.profiles for all    using (public.is_admin()) with check (public.is_admin());

-- dogs: 본인 CRUD, 관리자 전체
drop policy if exists "dogs owner all" on public.dogs;
drop policy if exists "dogs admin all" on public.dogs;
create policy "dogs owner all" on public.dogs for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "dogs admin all" on public.dogs for all
  using (public.is_admin()) with check (public.is_admin());

-- visits: 본인 read, 관리자 전체
drop policy if exists "visits self read"  on public.visits;
drop policy if exists "visits admin all"  on public.visits;
create policy "visits self read" on public.visits for select using (profile_id = auth.uid() or public.is_admin());
create policy "visits admin all" on public.visits for all    using (public.is_admin()) with check (public.is_admin());

-- coupons: 본인 read, 관리자 전체
drop policy if exists "coupons self read"  on public.coupons;
drop policy if exists "coupons admin all"  on public.coupons;
create policy "coupons self read" on public.coupons for select using (profile_id = auth.uid() or public.is_admin());
create policy "coupons admin all" on public.coupons for all    using (public.is_admin()) with check (public.is_admin());

-- contents: 공개 read, 관리자 write
drop policy if exists "contents public read" on public.contents;
drop policy if exists "contents admin write" on public.contents;
create policy "contents public read" on public.contents for select using (true);
create policy "contents admin write" on public.contents for all using (public.is_admin()) with check (public.is_admin());

-- subscription_passes: 공개 read, 관리자 write
drop policy if exists "passes public read" on public.subscription_passes;
drop policy if exists "passes admin write" on public.subscription_passes;
create policy "passes public read" on public.subscription_passes for select using (true);
create policy "passes admin write" on public.subscription_passes for all using (public.is_admin()) with check (public.is_admin());

-- pass_orders: 본인 read, 관리자 전체
drop policy if exists "pass_orders self read" on public.pass_orders;
drop policy if exists "pass_orders admin all" on public.pass_orders;
create policy "pass_orders self read" on public.pass_orders for select using (profile_id = auth.uid() or public.is_admin());
create policy "pass_orders admin all" on public.pass_orders for all    using (public.is_admin()) with check (public.is_admin());

-- pass_redemptions: 본인 read (자기 주문에 한해), 관리자 전체
drop policy if exists "pass_redemptions self read" on public.pass_redemptions;
drop policy if exists "pass_redemptions admin all" on public.pass_redemptions;
create policy "pass_redemptions self read" on public.pass_redemptions for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.pass_orders o where o.id = order_id and o.profile_id = auth.uid()
    )
  );
create policy "pass_redemptions admin all" on public.pass_redemptions for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- Storage: 강아지 사진
-- ============================================================================
insert into storage.buckets (id, name, public) values ('dog-photos','dog-photos', true)
on conflict (id) do nothing;

drop policy if exists "dog-photos public read" on storage.objects;
drop policy if exists "dog-photos owner write" on storage.objects;
create policy "dog-photos public read" on storage.objects for select using (bucket_id = 'dog-photos');
create policy "dog-photos owner write" on storage.objects for insert with check (
  bucket_id = 'dog-photos' and auth.uid() is not null
);

-- ----- announcements (공지사항) ------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null default 'general'
    check (category in ('general','event','notice','closure')),
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "announcements public read" on public.announcements;
drop policy if exists "announcements admin all"  on public.announcements;
create policy "announcements public read" on public.announcements for select using (true);
create policy "announcements admin all"  on public.announcements for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 출석 → 출석쿠폰 자동 발급 (10회마다)
-- ============================================================================
create or replace function public.issue_attendance_coupon()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  total int;
begin
  select count(*) into total from public.visits where profile_id = new.profile_id;
  if total > 0 and total % 10 = 0 then
    insert into public.coupons (profile_id, kind, title, description, source, expires_at)
    values (new.profile_id, 'attendance', '음료 1잔 무료 쿠폰', '출석 10회 적립 보상', 'attendance_10', now() + interval '90 days');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_issue_attendance_coupon on public.visits;
create trigger trg_issue_attendance_coupon
  after insert on public.visits
  for each row execute procedure public.issue_attendance_coupon();
