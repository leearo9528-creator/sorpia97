-- ============================================================================
-- 소르피아97 트레킹 패키지 예약 스키마
-- Supabase SQL Editor 에서 실행하세요.
-- ============================================================================

create table if not exists public.trekking_bookings (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references public.profiles(id) on delete set null,
  guest_name    text not null,
  guest_phone   text not null,
  trek_date     date not null,
  party_size    int not null default 1 check (party_size between 1 and 20),
  package_type  text not null default 'basic' check (package_type in ('basic','premium')),
  status        text not null default 'pending'
                  check (status in ('pending','confirmed','canceled')),
  note          text,
  created_at    timestamptz not null default now()
);

create index if not exists trekking_bookings_date_idx
  on public.trekking_bookings(trek_date, status);

create index if not exists trekking_bookings_profile_idx
  on public.trekking_bookings(profile_id);

alter table public.trekking_bookings enable row level security;

drop policy if exists "trekking self read"     on public.trekking_bookings;
drop policy if exists "trekking public insert" on public.trekking_bookings;
drop policy if exists "trekking admin all"     on public.trekking_bookings;

-- 비회원도 예약 가능 (name + phone 으로 식별)
create policy "trekking public insert" on public.trekking_bookings
  for insert with check (true);

-- 본인 예약 조회 (로그인 시), 관리자 전체
create policy "trekking self read" on public.trekking_bookings
  for select using (profile_id = auth.uid() or public.is_admin());

-- 관리자 전체 CUD
create policy "trekking admin all" on public.trekking_bookings
  for all using (public.is_admin()) with check (public.is_admin());
