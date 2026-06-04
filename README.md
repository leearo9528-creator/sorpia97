# 🐾 멍카페 (애견동반 카페 홈페이지)

Next.js (App Router) + Supabase + Tailwind CSS 로 만든 동네 애견동반 카페 홈페이지 MVP.

## 기능 개요

- **카페·시설 소개** (`/`) — 관리자 페이지에서 본문/이미지 수정 가능
- **회원가입 / 로그인** (`/signup`, `/login`)
  - 보호자: 이메일·이름·전화번호
  - 강아지: 이름·생년월일·사진 (Supabase Storage)
  - *카카오 OAuth 는 추후 연동*
- **마이페이지** (`/mypage`) — 출석 도장판, 보유 쿠폰, 강아지 카드, 구독 패스 현황
- **출석 쿠폰제** — 방문 10회마다 음료 1잔 쿠폰 자동 발급 (DB 트리거)
- **구독 상품 (`/shop`)** — 예: *넥스가드 패스*
  - 12개월 동안 매월 넥스가드 1개 + 음료 쿠폰 15장
- **관리자 콘솔 (`/admin`)**
  - 대시보드 / 회원·강아지 조회 / 출석 체크·쿠폰 발급 / 구독 패스 관리 / 콘텐츠 편집

## 셋업

### 1) 의존성

```bash
npm install
```

### 2) Supabase 프로젝트 만들기

1. https://supabase.com 에서 새 프로젝트 생성
2. **SQL Editor** 에서 `supabase/schema.sql` 을 그대로 붙여 실행
3. **Project Settings → API** 에서 키 복사

### 3) 환경 변수

`.env.example` 을 `.env.local` 로 복사 후 채우기:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAILS=owner@example.com
```

> `ADMIN_EMAILS` 에 적힌 이메일은 회원가입 시 자동으로 `admin` 권한을 받습니다.
> 이미 가입된 계정을 관리자로 만들고 싶다면 SQL Editor 에서:
>
> ```sql
> update public.profiles set role = 'admin' where email = 'me@example.com';
> ```

### 4) 개발 서버

```bash
npm run dev
```

→ http://localhost:3000

## 폴더 구조

```
src/
  app/
    page.tsx              # 홈 (카페/시설 소개)
    login/                # 로그인
    signup/               # 회원가입 (강아지 정보 포함)
    mypage/               # 마이페이지
    shop/                 # 구독 패스 신청
    admin/                # 관리자 콘솔
      members/
      attendance/
      passes/
      content/
  components/             # Nav, Footer, SignOutButton
  lib/
    brand.ts              # 브랜드 상수
    supabase/             # Supabase 클라이언트 헬퍼
middleware.ts             # Next.js 미들웨어 (세션 + 경로 보호)
supabase/schema.sql       # DB 스키마 + RLS + 트리거
```

## 데이터 모델 요약

- `profiles` — 사용자 (auth.users 와 1:1, role: member/admin)
- `dogs` — 강아지 (소유자 별 N)
- `visits` — 출석 기록 (10회마다 트리거로 쿠폰 자동 발급)
- `coupons` — 쿠폰 (attendance / pass_drink / etc)
- `contents` — 홈 페이지 CMS 콘텐츠 (cafe_intro, facility)
- `subscription_passes` — 판매 상품 정의 (예: 넥스가드 패스)
- `pass_orders` — 회원의 구독 가입 내역
- `pass_redemptions` — 월별 지급 이력 (관리자가 매월 한 번 클릭)

모든 테이블에 RLS 적용 — 본인만 자기 데이터 조회 가능. 관리자(`role='admin'`)는 전체 접근.

## TODO (다음 단계)

- [ ] 카카오 OAuth 연동 (Supabase Auth → Providers → Kakao)
- [ ] 결제 연동 (토스페이먼츠 / 카카오페이) — 현재는 매장 결제 가정
- [ ] 강아지 QR 카드 / 백신 정보 업로드
- [ ] 푸시/카카오 알림톡 (월별 지급 안내)
- [ ] 관리자 — 콘텐츠 이미지 직접 업로드 UI
