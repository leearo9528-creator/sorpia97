# 소르피아97 — 애견 동반 카페 멤버십 앱

Next.js 16 (App Router) + Supabase + Tailwind CSS v4 로 만든 동네 애견 카페 MVP.

---

## 기술 스택

| 항목 | 버전 / 내용 |
|------|------------|
| Next.js | 16.2.7 (App Router, React Server Components) |
| React | 19.2.4 |
| Supabase | `@supabase/ssr` 0.10.3 + `@supabase/supabase-js` 2.107 |
| Tailwind CSS | v4 (PostCSS 플러그인, CSS 변수 기반 테마) |
| 아이콘 | lucide-react 1.17 |
| 언어 | TypeScript 5, strict 모드 |
| 폰트 | Pretendard (CDN) |

---

## 환경 변수 (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # 서버 전용 (RLS 우회)
ADMIN_EMAILS=owner@example.com     # 쉼표로 여러 명 가능
```

`ADMIN_EMAILS`에 등록된 이메일은 회원가입 시 자동으로 `role='admin'` 부여.
이미 가입된 계정 승격은:
```sql
update public.profiles set role = 'admin' where email = 'me@example.com';
```

---

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

DB 초기화: Supabase SQL Editor에서 `supabase/schema.sql` → `supabase/board.sql` 순서로 실행.

---

## 브랜드 상수 (`src/lib/brand.ts`)

```
name:     소르피아97
tagline:  하울의 움직이는 성 실사판, 소피와 하울의 들판
address:  경기도 동두천시 삼육사로 1802
landmark: (BRAND.landmark)
hours:    매일 오픈 (매주 월요일 휴무)
notice:   매주 화요일은 수영장 물 교체일...
phone:    010-0000-0000  ← TODO: 실제 번호 입력
```

---

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx            # 루트 레이아웃 (Nav, BottomNav, Footer 포함)
│   ├── globals.css           # Tailwind 4 + CSS 변수 테마 + 공통 컴포넌트 유틸
│   ├── page.tsx              # 홈 — 카페 사진, 도장판, 액션 그리드, 정보
│   ├── board/
│   │   ├── page.tsx          # 발자국 피드 (게시글 + 좋아요)
│   │   ├── new/page.tsx      # 게시글 작성 (텍스트 + 이미지 업로드)
│   │   └── actions.ts        # createPostAction, toggleLikeAction
│   ├── login/
│   │   ├── page.tsx          # 이메일/비밀번호 로그인
│   │   └── actions.ts        # signInAction
│   ├── signup/
│   │   ├── page.tsx          # 회원가입 (보호자 + 강아지 정보)
│   │   └── actions.ts        # signUpAction (강아지 사진 Storage 업로드 포함)
│   ├── mypage/
│   │   └── page.tsx          # 마이페이지 — 도장, 쿠폰, 강아지 카드, 패스 현황
│   ├── ranking/
│   │   └── page.tsx          # 이번 달 출석 랭킹 TOP 50 (1~3위 상금 표시)
│   ├── now/
│   │   └── page.tsx          # 오늘의 소르피아 — 오늘 방문한 강아지 그리드
│   ├── pass/
│   │   ├── page.tsx          # 패스 랜딩 (히어로, 혜택, 비교표, FAQ)  ← 현재 Nav에서 숨김
│   │   └── actions.ts        # applyForPassFromLanding
│   ├── shop/
│   │   ├── page.tsx          # 패스 상품 목록                          ← 현재 Nav에서 숨김
│   │   └── actions.ts        # applyForPassAction
│   └── admin/
│       ├── layout.tsx        # 관리자 레이아웃 (role 검사 + 탭 네비)
│       ├── page.tsx          # 대시보드 KPI (회원/강아지/오늘방문/패스/쿠폰)
│       ├── members/page.tsx  # 회원 테이블 (검색 가능)
│       ├── attendance/
│       │   ├── page.tsx      # 출석 체크 + 최근 방문 로그
│       │   └── actions.ts    # checkInAction, issueCouponAction
│       ├── content/
│       │   ├── page.tsx      # CMS 편집 (cafe_intro, facility)
│       │   └── actions.ts    # updateContentAction
│       └── passes/
│           ├── page.tsx      # 패스 상품 + 주문 목록 + 월별 수령 그리드
│           └── actions.ts    # activateOrderAction, redeemMonthAction
├── components/
│   ├── Nav.tsx               # 상단 헤더 (sticky, auth 상태 반응, 관리자 뱃지)
│   ├── BottomNav.tsx         # 모바일 하단 탭바 [홈·발자국·랭킹·마이] — /admin에서 숨김
│   ├── Footer.tsx            # 데스크톱 푸터
│   ├── PhotoSlot.tsx         # 이미지 플레이스홀더 (관리자 편집 예정)
│   ├── SignOutButton.tsx     # 클라이언트 — 로그아웃 후 홈 이동
│   ├── SaveButton.tsx        # 클라이언트 — 북마크 토글 (미사용)
│   ├── ShareButton.tsx       # 클라이언트 — Web Share API / 클립보드 fallback
│   └── SectionTabs.tsx       # 클라이언트 — sticky 탭 (Intersection Observer 연동)
└── lib/
    ├── brand.ts              # 브랜드 상수
    └── supabase/
        ├── server.ts         # SSR 서버 클라이언트 (cookies 기반 세션)
        ├── client.ts         # 브라우저 클라이언트
        ├── middleware.ts     # 세션 갱신 + 인증 필요 경로 리다이렉트
        └── admin.ts          # Service role 클라이언트 (RLS 우회, 서버 전용)

middleware.ts                 # Next.js 미들웨어 — /mypage, /admin 미인증 시 /login 이동
supabase/schema.sql           # 핵심 테이블 + RLS + 트리거
supabase/board.sql            # board_posts, board_likes 테이블 (schema.sql 이후 실행)
```

---

## 데이터베이스 스키마

### 테이블

| 테이블 | 주요 컬럼 | 비고 |
|--------|----------|------|
| `profiles` | id(UUID), email, display_name, phone, role(member/admin) | `auth.users`와 1:1 |
| `dogs` | id, owner_id(FK→profiles), name, birthday, photo_url | 보호자당 N마리 |
| `visits` | id, profile_id, visited_at, checked_by, memo | 출석 체크 기록 |
| `coupons` | id, profile_id, kind, title, expires_at, used_at | kind: attendance / pass_drink 등 |
| `contents` | key(PK), title, body, image_url, updated_at | CMS — cafe_intro, facility |
| `subscription_passes` | id, code, name, duration_months, monthly_product, monthly_drink_quota, price, is_active | 상품 정의 |
| `pass_orders` | id, profile_id, pass_id, started_on, expires_on, status | status: active/paused/expired/canceled |
| `pass_redemptions` | id, order_id, month_index, product_redeemed_at, drinks_issued | 월별 지급 이력 |
| `board_posts` | id, profile_id, body, photo_url, created_at | 발자국 게시글 |
| `board_likes` | post_id, profile_id | 좋아요 (복합 PK) |

### Storage 버킷

| 버킷 | 공개 | 용도 |
|------|------|------|
| `dog-photos` | ✅ | 강아지 프로필 사진 |
| `board-photos` | ✅ | 게시글 첨부 사진 |

### RLS 요약

모든 테이블 RLS 활성화. 기본 원칙:
- 회원은 **자기 데이터만** 읽기/쓰기
- `contents`, `subscription_passes`는 **전체 공개 읽기**
- `role='admin'`은 **전체 접근**

### 트리거

| 트리거 | 시점 | 동작 |
|--------|------|------|
| `on_auth_user_created` | `auth.users` INSERT 후 | `profiles` 행 자동 생성 |
| `trg_issue_attendance_coupon` | `visits` INSERT 후 | 10회 방문마다 쿠폰 자동 발급 |

---

## 핵심 비즈니스 로직

### 출석 도장
1. 관리자 `/admin/attendance`에서 회원 검색 → 체크인
2. 10회마다 DB 트리거가 `attendance` 쿠폰 자동 발급
3. 홈·마이페이지에서 현재 10회 주기 내 도장 수 표시

### 구독 패스 (현재 UI 숨김 상태)
1. `subscription_passes`에 상품 정의 (현재: `nexgard12` — 12개월, 월 넥스가드 1개 + 음료 15잔, 360,000원)
2. 회원이 `/shop` 또는 `/pass`에서 신청 → `pass_orders` 생성
3. 관리자가 `/admin/passes`에서 매월 수령 버튼 클릭 → `pass_redemptions` 기록 + 음료 쿠폰 발급
4. 쿠폰 유효기간 45일

### 발자국 (게시판)
1. 회원이 `/board/new`에서 텍스트 + 사진 업로드
2. 사진은 `board-photos` 버킷에 저장, URL을 `board_posts.photo_url`에 기록
3. 다른 회원이 좋아요 가능 (`board_likes` 테이블)

---

## 라우트 → 페이지 요약

| 경로 | 인증 필요 | 설명 |
|------|----------|------|
| `/` | 선택 | 홈 (비로그인도 접근 가능, 도장판은 로그인 시만 표시) |
| `/board` | 선택 | 게시글 목록 (작성은 로그인 필요) |
| `/board/new` | ✅ | 게시글 작성 |
| `/login` | — | 로그인 |
| `/signup` | — | 회원가입 |
| `/mypage` | ✅ | 내 정보·도장·쿠폰·강아지 |
| `/ranking` | 선택 | 이번 달 출석 랭킹 |
| `/now` | 선택 | 오늘 방문한 강아지 |
| `/pass` | 선택 | 패스 랜딩 (**Nav에서 숨김**) |
| `/shop` | 선택 | 패스 상품 목록 (**Nav에서 숨김**) |
| `/admin` | ✅ admin | 관리자 대시보드 |
| `/admin/members` | ✅ admin | 회원 목록 |
| `/admin/attendance` | ✅ admin | 출석 체크 |
| `/admin/content` | ✅ admin | CMS 편집 |
| `/admin/passes` | ✅ admin | 패스 주문·수령 관리 |

---

## CSS / 디자인 시스템

`src/app/globals.css`에 Tailwind v4 CSS 변수로 정의.

| 변수 | 값 | 용도 |
|------|-----|------|
| `--brand` | `#3a7a3f` | 기본 초록 |
| `--brand-strong` | `#1e4a22` | 진한 초록 |
| `--brand-soft` | `#d4edda` | 연한 초록 배경 |
| `--accent` | `#f0b429` | 머스타드 노랑 |
| `--accent-deep` | `#b77f00` | 진한 노랑 |
| `--accent-soft` | `#fef3c7` | 연한 노랑 배경 |
| `--background` | `#fbfaee` | 크림 흰색 |

공통 유틸 클래스: `.btn-primary`, `.btn-ghost`, `.btn-sm`, `.card`, `.input`, `.textarea`, `.chip`, `.chip-accent`, `.eyebrow`, `.h-display`, `.h-section`, `.section`, `.section-wide`

---

## 현재 숨겨진 기능

| 기능 | 위치 | 상태 |
|------|------|------|
| 넥스가드 패스 | 홈 그리드 카드, Nav "패스" 링크 | 임시 숨김 (`page.tsx`, `Nav.tsx`에서 주석 처리) |

페이지 파일(`/pass`, `/shop`)과 DB 데이터는 그대로 존재. 다시 노출하려면 `src/app/page.tsx`의 패스 카드 블록과 `src/components/Nav.tsx`의 패스 링크 주석만 해제.

---

## TODO

- [ ] 카카오 OAuth 연동
- [ ] 결제 연동 (토스페이먼츠 / 카카오페이)
- [ ] 강아지 QR 카드 / 백신 정보 업로드
- [ ] 푸시 / 카카오 알림톡 (월별 지급 안내)
- [ ] 관리자 콘텐츠 이미지 직접 업로드 UI
- [ ] `brand.ts` 실제 전화번호 입력
