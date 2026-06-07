-- 회원 삭제 시 본인이 처리해준 출석/쿠폰 기록 보존 (NULL로 만들고 행은 유지)
alter table public.visits
  drop constraint if exists visits_checked_by_fkey,
  add  constraint visits_checked_by_fkey
    foreign key (checked_by) references public.profiles(id) on delete set null;

alter table public.coupons
  drop constraint if exists coupons_used_by_fkey,
  add  constraint coupons_used_by_fkey
    foreign key (used_by) references public.profiles(id) on delete set null;
