-- ============================================================================
-- 카페 메뉴 (menu_categories, menu_items)
-- schema.sql 이후에 실행하세요.
-- ============================================================================

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  sort_order int not null default 0,
  is_seasonal boolean not null default false
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price int,        -- 원 단위 (null = 가격 미정)
  price_text text,  -- 비정형 표시 ("13,000 / 20,000원")
  rank int,         -- Best / Signature 순위
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists menu_items_category_idx on public.menu_items(category_id, sort_order);

-- ── 카테고리 시드 ─────────────────────────────────────────────────────────────
insert into public.menu_categories (code, name, sort_order, is_seasonal) values
  ('best',      'Best',           0,  false),
  ('signature', 'Signature',      1,  false),
  ('coffee',    'Coffee & Tea',   2,  false),
  ('tea',       'Tea',            3,  false),
  ('non_coffee','Non-Coffee',     4,  false),
  ('deli',      'Deli & Sandwich',5,  false),
  ('bread',     'Bread',          6,  false),
  ('gelato',    '젤라또',          7,  false),
  ('cake',      '케이크',          8,  false),
  ('summer',    'Summer Special', 9,  true)
on conflict (code) do nothing;

-- ── 아이템 시드 ───────────────────────────────────────────────────────────────
do $$
declare
  cid_best      uuid; cid_sig  uuid; cid_cof uuid; cid_tea  uuid;
  cid_non       uuid; cid_deli uuid; cid_bre uuid; cid_gel  uuid;
  cid_cake      uuid; cid_sum  uuid;
begin
  select id into cid_best      from public.menu_categories where code='best';
  select id into cid_sig       from public.menu_categories where code='signature';
  select id into cid_cof       from public.menu_categories where code='coffee';
  select id into cid_tea       from public.menu_categories where code='tea';
  select id into cid_non       from public.menu_categories where code='non_coffee';
  select id into cid_deli      from public.menu_categories where code='deli';
  select id into cid_bre       from public.menu_categories where code='bread';
  select id into cid_gel       from public.menu_categories where code='gelato';
  select id into cid_cake      from public.menu_categories where code='cake';
  select id into cid_sum       from public.menu_categories where code='summer';

  -- Best
  insert into public.menu_items (category_id, rank, name, sort_order, price)
  values
    (cid_best, 1, '바질치아바타 샌드위치 + 아메리카노 set', 0, 16800),
    (cid_best, 2, '김치볶음밥',                             1, 9800),
    (cid_best, 3, '라볶이 + 튀김',                          2, 14000)
  on conflict do nothing;

  -- Signature
  insert into public.menu_items (category_id, rank, name, description, sort_order, price)
  values
    (cid_sig, 1, '흑임자 소르라떼',      '커피+크림+흑임자의 조화',              0, 8000),
    (cid_sig, 2, '돌체라떼',             '너무 달지도 쓰지도 않은 사장님 원픽',  1, 8500),
    (cid_sig, 3, '제주말차크림 라떼',    '제주말차와 크림, 우유의 만남',         2, 8500)
  on conflict do nothing;

  -- Coffee
  insert into public.menu_items (category_id, name, sort_order, price)
  values
    (cid_cof, '아메리카노',           0, 6500),
    (cid_cof, '핸드드립 디카페인',    1, 7500),
    (cid_cof, '카페라떼 / 카페모카',  2, 7500),
    (cid_cof, '바닐라라떼',           3, 8000),
    (cid_cof, '카라멜 마끼아또',      4, 8000),
    (cid_cof, '아포가토 젤라또',      5, 8000)
  on conflict do nothing;

  -- Tea
  insert into public.menu_items (category_id, name, sort_order, price)
  values
    (cid_tea, '유자차',                              0, 7000),
    (cid_tea, 'TWG 잉글리시블랙퍼스트 (홍차)',       1, 7500),
    (cid_tea, 'TWG 실버문 (녹차)',                   2, null),
    (cid_tea, 'TWG 바닐라라버번 (루이보스티)',        3, null)
  on conflict do nothing;

  -- Non-Coffee
  insert into public.menu_items (category_id, name, sort_order, price)
  values
    (cid_non, '아이스티',                          0, 7000),
    (cid_non, '고구마라떼',                        1, 7500),
    (cid_non, '초코라떼',                          2, 7500),
    (cid_non, '망고라떼',                          3, 8000),
    (cid_non, '딸기라떼',                          4, 8000),
    (cid_non, '에이드 (자몽청/레몬청/블루레몬)',   5, 8500),
    (cid_non, '오레오쉐이크',                      6, 8500),
    (cid_non, '요거트 스무디 (플레인/생딸기/생블루베리)', 7, 9000),
    (cid_non, '자바칩 쵸코 프라페',               8, 9000),
    (cid_non, '우베크림라떼',                      9, 8500)
  on conflict do nothing;

  -- Deli
  insert into public.menu_items (category_id, name, sort_order, price, price_text)
  values
    (cid_deli, '잉글리시머핀 + 아메리카노',                  0, 11000, null),
    (cid_deli, '바질치아바타 샌드위치',                      1, 10300, null),
    (cid_deli, '바질치아바타 샌드위치 + 아메리카노 (set)',   2, 16800, null),
    (cid_deli, '모짜렐라 피자',                              3, 15000, null),
    (cid_deli, '바삭순살치킨 300g / 500g',                   4, null,  '13,000 / 20,000원'),
    (cid_deli, '계란치즈_김치볶음밥',                        5, 9800,  null),
    (cid_deli, '계란치즈_소불고기볶음밥',                    6, 9800,  null),
    (cid_deli, '치즈감자튀김',                               7, 7000,  null)
  on conflict do nothing;

  -- Bread
  insert into public.menu_items (category_id, name, sort_order, price)
  values
    (cid_bre, '휘낭시에',            0, 2800),
    (cid_bre, '에그타르트',          1, 3800),
    (cid_bre, '베이글+버터프레시',   2, 4000)
  on conflict do nothing;

  -- Gelato
  insert into public.menu_items (category_id, name, sort_order, price)
  values
    (cid_gel, '젤라또 2가지 맛',   0, 7500),
    (cid_gel, '젤라또 크로플',     1, 7300),
    (cid_gel, '젤라또 허니브레드', 2, 6500)
  on conflict do nothing;

  -- Cake
  insert into public.menu_items (category_id, name, sort_order, price)
  values
    (cid_cake, '말렌카 호두케이크',   0, 6800),
    (cid_cake, '말렌카 코코아케이크', 1, 6800)
  on conflict do nothing;

  -- Summer
  insert into public.menu_items (category_id, name, sort_order, price)
  values
    (cid_sum, '옛날 팥빙수',                  0, 14000),
    (cid_sum, '쿠앤크 초코젤라또빙수',        1, 15000),
    (cid_sum, '로투스 치즈 밀크 젤라또빙수', 2, 16000)
  on conflict do nothing;
end
$$;

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.menu_categories enable row level security;
alter table public.menu_items       enable row level security;

drop policy if exists "menu_categories public read" on public.menu_categories;
drop policy if exists "menu_categories admin all"   on public.menu_categories;
create policy "menu_categories public read" on public.menu_categories for select using (true);
create policy "menu_categories admin all"   on public.menu_categories for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "menu_items public read" on public.menu_items;
drop policy if exists "menu_items admin all"   on public.menu_items;
create policy "menu_items public read" on public.menu_items for select using (true);
create policy "menu_items admin all"   on public.menu_items for all
  using (public.is_admin()) with check (public.is_admin());
