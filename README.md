# 소르피아97

경기 동두천 5,000평 애견동반 카페 · 캠프닉 · 트레킹 복합공간의 멤버십 / 안내 / 운영 콘솔.

- Next.js 16 (App Router · Server Actions) · React 19 · TypeScript 5
- Supabase (Postgres · Auth · Storage) — RLS 기반
- Tailwind CSS v4 (CSS 변수 테마)
- 이미지: `next/image` (Vercel 자동 최적화 + Supabase Storage)
- 아이콘: lucide-react · 폰트: Pretendard (CDN)

---

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

DB 초기화 — Supabase SQL Editor 에서 순서대로 실행:

| 순서 | 파일 | 내용 |
|------|------|------|
| 1 | `supabase/schema.sql` | 코어 테이블·RLS·트리거 |
| 2 | `supabase/board.sql` | 발자국 게시판 |
| 3 | `supabase/trekking.sql` | 트레킹 패키지 예약 |
| 4 | `supabase/menu.sql` | 메뉴 카테고리·아이템 |
| 5 | `supabase/ranking.sql` | 월별 랭킹 집계 함수 (security definer) |
| 6 | `supabase/dogs_profile.sql` | dogs 테이블에 견종/무게/성별 컬럼 |
| 7 | `supabase/site_photos.sql` | 사이트 사진 슬롯 + menu_items.photo_url |
| 8 | `supabase/public_read.sql` | `/now`·`/board` 비로그인 read 함수 |
| 9 | `supabase/user_delete_fix.sql` | visits.checked_by / coupons.used_by FK SET NULL |

Storage 버킷 (모두 PUBLIC):
- `dog-photos` — 강아지 사진
- `board-photos` — 발자국 사진
- `site-photos` — 홈 슬라이드 / 배치도 / 메뉴 사진

---

## 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # 서버 전용 (RLS 우회 — 회원 추가/삭제)
```

`next.config.ts`:
- `serverActions.bodySizeLimit = 10mb` — 사진 업로드 허용
- `images.remotePatterns` — `*.supabase.co/storage/v1/object/public/**`

관리자 승격은 SQL 수동:
```sql
update public.profiles set role = 'admin' where email = '<아이디>';
```

---

## 인증 모델 (아이디 + 비밀번호)

Supabase Auth 는 이메일이 필수라 **아이디를 가상 이메일로 변환**해서 사용한다.

- 사용자 입력: `hong` → 내부 저장: `hong@id.sorpia97.app`
- 변환 유틸: `src/lib/auth-id.ts`
- `profiles.email` 에는 도메인을 떼고 아이디만 저장
- 아이디 규칙: 영문/숫자/`._-` 4–20자

가입 트리거 `on_auth_user_created` 가 `auth.users` 생성 시 `profiles` 를 자동 생성한다.

---

## 라우트 맵

### 공개 / 회원

| 경로 | 인증 | 설명 |
|------|------|------|
| `/` | — | 홈 — 슬라이드 사진, 바로가기 그리드, 오시는 길, 배치도 |
| `/menu` | — | 카페 메뉴 (DB) — Best · Signature · 음료 · 푸드 · 여름한정 |
| `/pricing` | — | 이용안내 |
| `/board` | 선택 | 발자국 피드 — 비로그인도 read |
| `/board/new` | 회원 | 발자국 작성 (사진 업로드) |
| `/ranking` | — | 이번 달 출석 랭킹 TOP 5 (TOP3 상금) — 비로그인도 read |
| `/now` | — | 오늘 출석한 강아지 그리드 — 비로그인도 read |
| `/announcements` | — | 공지사항 목록 |
| `/trekking` | 선택 | 왕방산 트레킹 예약 (비회원도 가능) |
| `/login` `/signup` | — | 아이디/비밀번호 |
| `/mypage` | 회원 | 출석 횟수 + 랭킹 링크, 우리 강아지 |
| `/mypage/dogs/new` | 회원 | 강아지 등록 |
| `/mypage/dogs/[id]/edit` | 회원 | 강아지 수정 / 삭제 |

### 관리자 (`role in ('admin','manager')`)

| 경로 | 권한 | 설명 |
|------|------|------|
| `/admin` | 둘 다 | `/admin/members` 로 즉시 redirect |
| `/admin/members` | 둘 다 | 회원 검색 · 추가(서비스롤) · 권한·정보 수정 · 삭제 · 출석체크 · 횟수조정 · 강아지 CRUD · 쿠폰 발급/삭제 |
| `/admin/menu` | admin | 카테고리 CRUD · 메뉴 추가/수정/사진/숨김/삭제 |
| `/admin/trekking` | 둘 다 | 날짜별 트레킹 예약 + 상태 변경 |
| `/admin/announcements` | admin | 공지 작성 / 삭제 |
| `/admin/site` | admin | 홈 슬라이드 사진 + 배치도 업로드 |

레이아웃: `src/app/admin/layout.tsx` 에서 role 검사. `manager` 는 회원·트레킹 탭만.

---

## 데이터 모델

### Core (`schema.sql`)

| 테이블 | 핵심 컬럼 | 비고 |
|--------|-----------|------|
| `profiles` | id (FK→auth.users), email, display_name, phone, role | role: `member`/`manager`/`admin` |
| `dogs` | owner_id, name, birthday, photo_url, breed, weight, gender | gender: `공주님`/`왕자님` |
| `visits` | profile_id, visited_at, checked_by | 10회마다 출석 쿠폰 자동 발급 |
| `coupons` | profile_id, kind, title, expires_at, used_at, used_by | kind: `attendance`/`pass_drink`/`etc` |

### Menu (`menu.sql`)
- `menu_categories(code, name, sort_order, is_seasonal)`
- `menu_items(category_id, name, description, price, price_text, photo_url, rank, sort_order, is_active)`

### Board (`board.sql`)
- `board_posts(profile_id, content, photo_url)`
- `board_likes(post_id, profile_id)` — 복합 PK

### Trekking (`trekking.sql`)
- `trekking_bookings(profile_id?, guest_name, guest_phone, trek_date, party_size, package_type, status)`

### Site (`site_photos.sql`)
- `site_photos(slot, url, sort_order)` — slot: `homepage` / `map_layout`
- `site_settings(key, value)` — 기타 key-value
- `menu_items.photo_url` 컬럼 추가

### Functions (`ranking.sql`, `public_read.sql`)
- `get_monthly_ranking(year, month)` — 동률 시 강아지 수 많은 보호자 상위
- `get_today_dogs()` — 오늘 출석한 강아지 (비로그인 read)
- `get_board_posts(limit)` — 게시글 + 작성자명 + 좋아요수 (비로그인 read)

세 함수 모두 `security definer` 로 RLS 우회. 노출 컬럼만 골라 반환.

### RLS 원칙
- 회원은 본인 데이터만 R/W
- 관리자(`is_admin()`) 전체 접근
- 비로그인 노출이 필요한 집계는 `security definer` 함수로 우회
- `dog-photos` 업로드: `auth.uid()::text = (storage.foldername(name))[1]` (본인 폴더)

---

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx · globals.css · page.tsx
│   ├── login/ signup/
│   ├── menu/                           # DB 기반 메뉴
│   ├── pricing/
│   ├── board/ board/new/
│   ├── ranking/ now/
│   ├── announcements/
│   ├── mypage/
│   │   └── dogs/{new, [id]/edit}/
│   ├── trekking/
│   └── admin/
│       ├── layout.tsx                  # role 가드
│       ├── page.tsx                    # → /admin/members
│       ├── AdminNav.tsx                # 활성 탭 client component
│       ├── members/                    # 회원·강아지·쿠폰·출석
│       ├── menu/                       # 카테고리·아이템·사진 CRUD
│       ├── trekking/
│       ├── announcements/
│       └── site/                       # 홈 사진·배치도 업로드
├── components/
│   ├── Nav.tsx · NavMenu.tsx           # 햄버거 드로어 (React Portal)
│   ├── BottomNav.tsx · Footer.tsx
│   ├── PhotoCarousel.tsx               # next/image fade 슬라이더
│   ├── PhotoSlot.tsx                   # placeholder
│   ├── ContactActions.tsx · CopyAddress.tsx
│   └── SectionTabs.tsx · SignOutButton.tsx
└── lib/
    ├── brand.ts · auth-id.ts
    └── supabase/{server,client,middleware,admin}.ts

middleware.ts                           # /mypage, /admin 미인증 → /login
supabase/*.sql
```

---

## 디자인 시스템 (`globals.css`)

들판 초록 + 햇살 노랑 팔레트:
- `--brand` `#3a7a3f` · `--brand-strong` `#225028` · `--brand-soft` `#d8ecc4`
- `--accent` `#f0b429` · `--accent-soft` `#fce8a2` · `--accent-deep` `#c08711`
- `--background` `#fbfaee` · `--surface-2` `#f4efd0`

공통 유틸: `.btn-primary` `.btn-outline` `.btn-ghost` `.btn-accent` `.btn-sm` · `.card` `.card-flat` · `.input` `.textarea` `.label` · `.chip` `.chip-accent` · `.eyebrow` `.h-display` `.h-section` · `.section` `.section-wide` · `.pb-safe` `.pt-safe`

터치 타겟 최소 48px. 모바일 본문 하단 72px 패딩 (탭바 공간).

---

## 운영 메모

- BRAND 상수: `src/lib/brand.ts` — 전화·주소·운영시간·이벤트
- 휴무: 월요일 정기 · 화요일은 수영장 물 교체일
- 출석 1일 1회 제한은 `checkInAction` 에서 KST 기준 체크
- 랭킹 동률 시 강아지 수 많은 보호자가 상위
- TOP3 상금: 5만/3만/1만 (마이페이지 표기 — 추후 변경 시 `src/app/mypage/page.tsx`)
