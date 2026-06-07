# 소르피아97

경기 동두천 5,000평 애견동반 카페 · 캠프닉 · 트레킹 복합공간의 멤버십 / 안내 / 운영 콘솔.

- Next.js 16 (App Router) · React 19 · TypeScript 5
- Supabase (Postgres · Auth · Storage) — RLS 기반
- Tailwind CSS v4 (CSS 변수 테마)
- 아이콘: lucide-react · 폰트: Pretendard (CDN)

---

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

DB 초기화 — Supabase SQL Editor 에서 순서대로 실행:
1. `supabase/schema.sql`   — 핵심 테이블·RLS·트리거
2. `supabase/board.sql`    — 발자국 게시판
3. `supabase/trekking.sql` — 트레킹 패키지 예약

---

## 환경 변수 (`.env.local` / Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # 서버 전용 (RLS 우회)
```

- `SUPABASE_SERVICE_ROLE_KEY` 는 `NEXT_PUBLIC_` 접두사 금지. 노출 시 DB 전체 권한 유출.
- 관리자 승격은 SQL 로 수동 처리:
  ```sql
  update public.profiles set role = 'admin' where email = '<아이디>';
  ```

---

## 인증 모델 (아이디 + 비밀번호)

Supabase Auth 는 이메일이 필수라 **아이디를 가상 이메일로 변환**해서 사용한다.

- 사용자 입력: `hong` → 내부 저장: `hong@id.sorpia97.app`
- 변환 유틸: `src/lib/auth-id.ts`
- `profiles.email` 컬럼에는 가상 도메인을 떼고 아이디만 저장 (관리자가 회원 목록에서 식별하기 쉽게)
- 아이디 규칙: 영문/숫자/`._-` 4–20자

가입 트리거 `on_auth_user_created` 가 `auth.users` 행을 만들 때 `profiles` 를 자동 생성하고, 그 직후 `signup` 액션이 `display_name`·`phone`·`email(=아이디)` 을 업데이트한다.

---

## 라우트 맵

### 공개 / 회원

| 경로 | 인증 | 설명 |
|------|------|------|
| `/` | 선택 | 홈 — 도장판(로그인 시), 메뉴/이용안내/발자국/오늘의 소르피아 그리드, 전화·길찾기 CTA |
| `/menu` | — | 카페 메뉴 (Best · Signature · 음료 · 푸드 · 여름한정). **현재 하드코딩** |
| `/pricing` | — | 이용안내 (입장 · 선택이용 · 원데이패스 · 대관) |
| `/board` | 선택 | 발자국 피드 (게시 + 좋아요) |
| `/board/new` | 회원 | 발자국 작성 (사진 업로드) |
| `/ranking` | 선택 | 이번 달 출석 랭킹 TOP 50 (TOP3 상금) |
| `/now` | 선택 | 오늘 출석한 강아지 그리드 |
| `/announcements` | — | 공지사항 목록 (pinned 우선) |
| `/pass` | 선택 | 넥스가드 패스 랜딩 + 신청 |
| `/trekking` | 선택 | 왕방산 트레킹 패키지 안내 + 예약 (비회원도 가능) |
| `/login` `/signup` | — | 아이디/비밀번호 |
| `/mypage` | 회원 | 출석 도장 · 쿠폰 · 강아지 · 활성 패스 |
| `/mypage/dogs/new` | 회원 | 강아지 등록 (사진 업로드) |

### 관리자 (`role in ('admin','manager')`)

| 경로 | 권한 | 설명 |
|------|------|------|
| `/admin` | 둘 다 | 대시보드 KPI |
| `/admin/members` | admin | 회원 검색 (편집 X — TODO) |
| `/admin/attendance` | 둘 다 | 출석 도장 / 쿠폰 수동 발급 / 최근 출석 로그 |
| `/admin/passes` | admin | 패스 상품·주문 목록 + 월별 지급 그리드 |
| `/admin/fields` | 둘 다 | 운동장 슬롯 (소/중/대형견 × 12·15·18시) |
| `/admin/trekking` | 둘 다 | 날짜별 트레킹 예약 + 상태 변경 |
| `/admin/content` | admin | CMS (cafe_intro, facility) |
| `/admin/announcements` | 둘 다 | 공지 작성/삭제 |

레이아웃: `src/app/admin/layout.tsx` 에서 role 검사. `manager` 는 `ADMIN_TABS` 일부만 노출.

> **현재 Nav 미노출 페이지**: `/pass`, `/trekking`, `/ranking`, `/announcements`. 직접 URL 또는 다른 페이지 내부 링크로만 접근.

---

## 데이터 모델

### Core (`schema.sql`)

| 테이블 | 핵심 컬럼 | 비고 |
|--------|-----------|------|
| `profiles` | id (FK→auth.users), email, display_name, phone, role | role: `member`/`admin` (코드는 `manager` 도 사용 — **스키마 불일치, TODO**) |
| `dogs` | owner_id, name, birthday, photo_url | 1 보호자 N 강아지 |
| `visits` | profile_id, visited_at, checked_by, memo | 10회마다 `attendance` 쿠폰 자동 발급 트리거 |
| `coupons` | profile_id, kind, title, expires_at, used_at | kind: `attendance` / `pass_drink` / `etc` |
| `contents` | key (PK), title, body, image_url | CMS — `cafe_intro`, `facility` |
| `subscription_passes` | code, name, duration_months, monthly_product, monthly_drink_quota, price, is_active | 상품 정의. 시드: `nexgard12` |
| `pass_orders` | profile_id, pass_id, started_on, expires_on, status | status: `active`/`paused`/`expired`/`canceled`/`pending` (`pending` 은 코드에서만 사용, 스키마 check 누락) |
| `pass_redemptions` | order_id, month_index, product_redeemed_at, drinks_issued | unique(order_id, month_index) |
| `field_slots` | yard, slot_date, slot_time, status | 슬롯 없으면 `available` 간주 |
| `announcements` | title, body, category, pinned | category: general/event/notice/closure |

### Board (`board.sql`)
- `board_posts(profile_id, content, photo_url)`
- `board_likes(post_id, profile_id)` — 복합 PK

### Trekking (`trekking.sql`)
- `trekking_bookings(profile_id?, guest_name, guest_phone, trek_date, party_size, package_type, status, note)`
- 비회원도 예약 가능 (이름+전화로 식별)

### Storage 버킷
- `dog-photos` (public) — 강아지 사진
- `board-photos` (public) — 발자국 사진

### RLS 원칙
- 회원은 본인 데이터만 R/W
- `contents`, `subscription_passes`, `announcements`, `field_slots`, `board_posts`, `trekking_bookings` (insert) = 공개 read
- `is_admin()` 함수가 admin role 검사. **`manager` 는 RLS 차원에서는 일반 회원과 같다**. (서버 라우트 가드만 manager 허용)

### 트리거
- `on_auth_user_created` → `profiles` 자동 생성
- `trg_issue_attendance_coupon` → 출석 10회마다 음료 쿠폰

---

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx · globals.css · page.tsx
│   ├── login/ signup/                  # 아이디 인증
│   ├── menu/                           # 하드코딩 메뉴 — TODO: DB 백킹
│   ├── pricing/                        # 이용안내 (SectionTabs)
│   ├── board/ board/new/               # 발자국 + actions.ts
│   ├── ranking/ now/                   # 출석 기반 집계 페이지
│   ├── announcements/                  # 공지 목록 (관리자 작성)
│   ├── mypage/ mypage/dogs/new/        # 마이 + 강아지 등록
│   ├── pass/                           # 넥스가드 패스 랜딩
│   ├── trekking/                       # 왕방산 트레킹 예약
│   └── admin/
│       ├── layout.tsx                  # role 가드 + 탭
│       ├── page.tsx                    # KPI 대시보드
│       ├── members/                    # 회원 검색 (편집 X)
│       ├── attendance/                 # 출석 + 쿠폰
│       ├── passes/                     # 패스 상품/주문/지급
│       ├── fields/                     # 운동장 슬롯
│       ├── trekking/                   # 트레킹 예약 관리
│       ├── content/                    # CMS
│       └── announcements/              # 공지
├── components/
│   ├── Nav.tsx · BottomNav.tsx · Footer.tsx
│   ├── ContactActions.tsx              # 전화 + 네이버 길찾기 CTA
│   ├── CopyAddress.tsx                 # 주소 복사
│   ├── PhotoSlot.tsx                   # 이미지 placeholder
│   ├── SectionTabs.tsx                 # IntersectionObserver sticky 탭
│   └── SignOutButton.tsx
└── lib/
    ├── brand.ts                        # 브랜드 상수
    ├── auth-id.ts                      # 아이디 ↔ 가상 이메일
    └── supabase/{server,client,middleware,admin}.ts

middleware.ts                           # /mypage, /admin 미인증 → /login
supabase/{schema,board,trekking}.sql
```

---

## 디자인 시스템 (`globals.css`)

CSS 변수 팔레트 (들판 초록 + 햇살 노랑):
- `--brand` `#3a7a3f` · `--brand-strong` `#225028` · `--brand-soft` `#d8ecc4`
- `--accent` `#f0b429` · `--accent-soft` `#fce8a2` · `--accent-deep` `#c08711`
- `--background` `#fbfaee` (크림) · `--surface-2` `#f4efd0`

공통 유틸: `.btn-primary` `.btn-outline` `.btn-ghost` `.btn-accent` `.btn-sm` · `.card` `.card-flat` · `.input` `.textarea` `.label` · `.chip` `.chip-accent` · `.eyebrow` `.h-display` `.h-section` · `.section` `.section-wide` · `.row` · `.pb-safe` `.pt-safe`

터치 타겟 최소 48px, 모바일 본문 하단 72px 패딩 (탭바 공간).

---

## 페이지별 TODO

스키마/코드/UX 디테일 정리 — 우선순위 ★★★ 부터.

### 전역 / 인프라

- [ ] ★★★ **`profiles.role` check 제약 확장** — `('member','manager','admin')` 으로 변경. 현재 `manager` 로 업데이트 시 DB 가 거절.
  ```sql
  alter table public.profiles drop constraint profiles_role_check,
    add constraint profiles_role_check check (role in ('member','manager','admin'));
  ```
- [ ] ★★ `pass_orders.status` check 에 `'pending'` 추가 (현재 코드는 사용하지만 스키마는 미허용)
- [ ] ★★ Nav · BottomNav 에 `/announcements`, `/ranking`, `/trekking` 노출 (또는 의도적 숨김임을 코드 주석에 명시)
- [ ] ★ `is_admin()` 외에 `is_staff()` 헬퍼 추가 — manager 도 운영 기능 RLS 통과시키기
- [ ] ★ 카카오 OAuth (현재 placeholder 문구만 있음)
- [ ] ★ 푸시 / 카카오 알림톡 (월별 패스 지급 안내, 공지)
- [ ] ★ Storage 이미지 next/image 최적화 (현재 `<img>` + eslint-disable)

### `/` 홈
- [ ] PhotoSlot 자리에 실제 카페 사진 (관리자 업로드 + Storage 연동)
- [ ] 도장 카드: 디바이스마다 흔들리는 그라데이션 blur 모바일 성능 점검
- [ ] 오픈 이벤트(`BRAND.event` 닭가슴살 서비스) 배너 슬롯
- [ ] 비로그인 시 가입 유도 카드 1개

### `/menu`
- [ ] ★★★ **DB 백킹** — `menu_categories` + `menu_items` 테이블 신설, `/admin/menu` 에서 가격 조정 (요청사항)
- [ ] `priceText` 처럼 가변 가격 표시(13,000 / 20,000원) 표현 방식 결정
- [ ] 시즌 한정(여름) on/off 토글
- [ ] 사진 슬롯 추가 (Best·Signature 만이라도)

### `/pricing`
- [ ] 가격이 코드 안에 박혀 있음. 운영진이 가격 변경 시 코드 수정 필요. CMS 화 검토
- [ ] 셀프목욕 추가품목, 바베큐 구성 — `contents` 같은 단순 CMS 로 옮기거나 별도 테이블
- [ ] 원데이패스 할인 금액 계산을 자동화 (`bathOrig - bath` 로직)

### `/board`, `/board/new`
- [ ] 페이지네이션 — 현재 50건 고정. 무한 스크롤 또는 더보기
- [ ] 댓글 (`board_comments` 신설)
- [ ] 본인 글 수정/삭제 UI (RLS 는 이미 있음)
- [ ] 사진 압축 / 리사이즈 (업로드 전 클라이언트에서)
- [ ] 부적절 콘텐츠 신고

### `/ranking`
- [ ] 출석 "보호자 1인당 1일 1회" 정책이 RLS / 트리거 차원에서 강제되고 있지 않음 — 같은 날 중복 visit insert 가능
- [ ] 매월 1일 00:00 초기화 안내가 있는데, 실제 집계는 단순 `gte(monthStart)` 라 자동 — TZ (서버 UTC vs KST) 확인
- [ ] TOP3 상금 지급 자동화 / 수동 정산 흐름

### `/now`
- [ ] "출석 도장이 찍힌 회원의 강아지" 만 보임 — 사진 없는 강아지가 많아 보임. placeholder 일러스트 다양화
- [ ] 보호자 1명이 여러 마리면 전부 표시됨 — 의도 맞는지 확인

### `/announcements`
- [ ] Nav 노출
- [ ] 카테고리 필터
- [ ] 본문이 길 때 펼치기 (현재 전체 노출)

### `/pass`
- [ ] Nav 노출 여부 결정 — 현재 의도적 숨김 (README 구버전 코멘트)
- [ ] 신청 시 강아지 선택 (어떤 강아지에게 약품 지급할지)
- [ ] 결제 연동 (토스페이먼츠 / 카카오페이) — 현재 매장 결제만

### `/trekking`
- [ ] Nav 노출
- [ ] 날짜별 정원 제한 (`trekking_bookings` 에 `party_size` 합계 체크)
- [ ] 비회원 예약 후 본인 확인(전화 인증) 흐름
- [ ] 미션 스팟 사진 인증을 앱 안에서 처리 (현재는 카운터 대면 확인)
- [ ] 예약 시 강아지 정보 옵셔널 필드

### `/login`, `/signup`
- [ ] "카카오 로그인 곧 추가" placeholder → 구현 or 제거
- [ ] 아이디 중복 검사 비동기 표시 (현재는 submit 후 메시지)
- [ ] 전화번호 형식 검증 / 자동 하이픈

### `/mypage`
- [ ] 강아지 수정/삭제 UI
- [ ] 쿠폰 사용 처리 — 현재 회원 쪽에는 사용 버튼이 없음 (매장에서 카운터가 처리)
- [ ] 활성 패스 월별 지급 상태 시각화 (`pass_redemptions` join)
- [ ] 프로필 수정 (이름·전화)

### `/admin`
- [ ] manager 대시보드는 활성 패스/쿠폰 카운트 보일 필요 있는지 검토 (RLS 통과 여부)
- [ ] 그래프 (주간/월간 방문 추이)

### `/admin/members`
- [ ] ★★★ **편집 UI** (요청사항) — 권한 셀렉트, 전화/이름 수정, 회원 비활성화
- [ ] 페이지네이션 (현재 limit 100)
- [ ] CSV 내보내기
- [ ] 강아지 사진 썸네일 표시

### `/admin/attendance`
- [ ] 체크인 confirm — 잘못 누르면 즉시 visits insert 됨
- [ ] 같은 날 중복 체크인 가드
- [ ] 출석 취소(visits delete) 기능

### `/admin/passes`
- [ ] 상품 추가/수정 UI — 현재는 SQL 직접 (`nexgard12` 시드만)
- [ ] 주문 상태별 필터
- [ ] 환불 처리 흐름

### `/admin/fields`
- [ ] 슬롯 시간이 12/15/18시 고정 — 운영시간 변경 시 코드 수정 필요
- [ ] 운동장 종류·가격도 코드 상수 (`YARD_PRICE`) — 가격 테이블화

### `/admin/trekking`
- [ ] 패키지 가격이 코드 상수 (`PKG_LABEL`)
- [ ] 일별·주별 통계
- [ ] 알림톡 자동 발송 (확정 시)

### `/admin/content`
- [ ] 이미지 URL 입력만 가능 — Storage 직접 업로드 UI
- [ ] 편집 가능 키가 코드 상수 (`EDITABLE_KEYS`) — 동적으로 늘리려면 신규 키 추가 흐름

### `/admin/announcements`
- [ ] 수정 기능 (현재 작성·삭제만)
- [ ] 이미지 첨부

---

## 운영 메모

- BRAND 상수: `src/lib/brand.ts` 의 전화·주소·운영시간·이벤트 문구
- 카페 휴무: 월요일 정기, 화요일은 수영장 물 교체일
- 패스 시드: `nexgard12` (12개월, 월 넥스가드 1개 + 음료 15장, 360,000원)
- 트레킹 패키지: basic 9,900원 / premium 14,900원 (코드 상수)
