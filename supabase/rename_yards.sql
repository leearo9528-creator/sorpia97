-- 운동장 이름 변경: 소형견/중형견/대형견 → 소형운동장/중형운동장/대형운동장
-- 기존 슬롯 데이터 업데이트
update public.field_slots set yard = '소형운동장' where yard = '소형견';
update public.field_slots set yard = '중형운동장' where yard = '중형견';
update public.field_slots set yard = '대형운동장' where yard = '대형견';

-- check 제약 교체
alter table public.field_slots
  drop constraint if exists field_slots_yard_check;

alter table public.field_slots
  add constraint field_slots_yard_check
  check (yard in ('소형운동장', '중형운동장', '대형운동장'));
