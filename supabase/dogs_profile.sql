-- 강아지 프로필 필드 추가
alter table public.dogs
  add column if not exists breed  text,
  add column if not exists weight numeric(5,2),
  add column if not exists gender text check (gender in ('공주님', '왕자님'));
