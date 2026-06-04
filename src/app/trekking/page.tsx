import { createClient } from "@/lib/supabase/server";
import { SectionTabs } from "@/components/SectionTabs";
import { bookTrekkingAction } from "./actions";
import {
  Mountain,
  Smartphone,
  CalendarCheck,
  Gift,
  Clock,
  Users,
  ChevronRight,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Camera,
  Star,
  Footprints,
  Leaf,
  ArrowDown,
  Info,
} from "lucide-react";

/* ---------- 정적 데이터 ---------- */

const TABS = [
  { id: "intro",   label: "코스 안내" },
  { id: "mission", label: "미션 스팟" },
  { id: "book",    label: "패키지 예약" },
  { id: "reward",  label: "리워드 수령" },
];

const COURSES = [
  {
    label: "산림욕 코스",
    level: 1,
    levelText: "초급",
    distance: "1.2 km",
    duration: "약 40분",
    desc: "왕방골 입구에서 숲길을 한 바퀴 도는 평탄한 순환 코스. 아이나 반려견을 동반하기 좋습니다.",
    color: "var(--brand-soft)",
    textColor: "var(--brand-strong)",
  },
  {
    label: "계곡 코스",
    level: 2,
    levelText: "중급",
    distance: "2.8 km",
    duration: "약 1시간 30분",
    desc: "왕방골 계곡을 따라 오르는 코스. 물소리와 함께 걷는 여름 최고의 산책.",
    color: "var(--accent-soft)",
    textColor: "var(--accent-deep)",
  },
  {
    label: "정상 코스",
    level: 3,
    levelText: "고급",
    distance: "5.2 km",
    duration: "약 3시간",
    desc: "왕방산 정상(737m)까지 완등하는 풀코스. 동두천 시내와 산맥 전경이 펼쳐집니다.",
    color: "var(--foreground)",
    textColor: "white",
  },
];

const MISSIONS = [
  {
    n: "01",
    icon: Footprints,
    title: "소르피아 출발 인증",
    where: "카페 앞 트레킹 보드",
    desc: "패키지 수령 시 카운터에서 미션 카드를 받고, 출발 보드 앞에서 첫 인증 사진을 찍으세요.",
  },
  {
    n: "02",
    icon: Camera,
    title: "왕방골 계곡 포토존",
    where: "계곡 돌다리 위",
    desc: "물길을 건너는 돌다리 위에서 계곡과 함께 인증. 여름에는 물안개가 피어오릅니다.",
  },
  {
    n: "03",
    icon: MapPin,
    title: "숲길 전망대",
    where: "상부 전망 데크",
    desc: "동두천 시내와 능선이 한눈에 보이는 전망 포인트. 현수막에 GPS 스팟이 표시돼 있습니다.",
  },
  {
    n: "04",
    icon: Mountain,
    title: "정상 표지석 (선택)",
    where: "왕방산 정상 737m",
    desc: "완등자를 위한 보너스 스팟. 정상 표지석과 함께 찍은 사진을 카운터에 보여주세요.",
  },
  {
    n: "05",
    icon: CheckCircle2,
    title: "소르피아 귀환 인증",
    where: "카페 카운터",
    desc: "하산 후 카운터에서 미션 카드를 제출하고 스탬프를 받으면 리워드가 시작됩니다.",
  },
];

const PACKAGES = [
  {
    code: "basic",
    name: "베이직",
    price: 9900,
    items: ["음료 1잔 (핫·아이스 선택)", "미션 카드", "기념 스티커"],
  },
  {
    code: "premium",
    name: "프리미엄",
    price: 14900,
    items: ["음료 1잔", "강아지 간식 세트", "미션 카드", "기념 스탬프 수첩"],
    recommended: true,
  },
];

const REWARDS = [
  {
    condition: "패키지 구매",
    badge: "기본",
    color: "var(--brand-soft)",
    textColor: "var(--brand-strong)",
    items: ["음료 1잔 (선택)"],
  },
  {
    condition: "3스팟 이상 인증",
    badge: "업그레이드",
    color: "var(--accent-soft)",
    textColor: "var(--accent-deep)",
    items: ["음료 1잔 + 간식 업그레이드", "소르피아 리워드 스탬프"],
  },
  {
    condition: "5스팟 풀 클리어",
    badge: "풀클리어",
    color: "var(--brand)",
    textColor: "white",
    items: ["음료 1잔 + 간식 세트", "소르피아97 한정 굿즈", "리워드 도장 완성"],
  },
];

/* ---------- 난이도 시각화 ---------- */
function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1" aria-label={`난이도 ${level}점`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={
            "inline-block w-2.5 h-2.5 rounded-full " +
            (i <= level
              ? "bg-[var(--brand)]"
              : "bg-[var(--brand-soft)] border border-[var(--brand-soft)]")
          }
        />
      ))}
    </div>
  );
}

/* ---------- 페이지 ---------- */
export default async function TrekkingPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;

  let user: { id: string } | null = null;
  let profile: { display_name: string | null; phone: string | null } | null = null;

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    user = userData.user ? { id: userData.user.id } : null;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, phone")
        .eq("id", user.id)
        .maybeSingle();
      profile = data;
    }
  } catch {}

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="pb-16">
      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <section className="section pt-3 md:pt-6">
        <div className="rounded-[28px] overflow-hidden bg-[var(--brand-strong)] text-white p-7 md:p-12 relative">
          {/* 배경 텍스처 — 순수 타이포그래피 장식 */}
          <p
            aria-hidden
            className="absolute top-4 right-5 text-[72px] md:text-[100px] font-black opacity-5 leading-none select-none tracking-tighter"
          >
            山
          </p>

          <div className="relative">
            <span className="eyebrow text-[var(--accent)]">
              Sorpia Trekking Package
            </span>
            <h1 className="mt-4 text-[32px] md:text-5xl font-bold leading-[1.1] tracking-tight">
              왕방산,
              <br />
              소르피아에서
              <br />
              시작하다
            </h1>
            <p className="mt-5 text-base md:text-lg opacity-80 leading-relaxed max-w-md">
              카페에서 패키지를 구매하고, 왕방산을 자유롭게 걸어보세요.
              하산 후 소르피아에서 리워드가 기다립니다.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <a
                href="#book"
                className="btn bg-[var(--accent)] text-[var(--brand-strong)] hover:opacity-90"
              >
                패키지 예약
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="#intro"
                className="btn border border-white/30 text-white hover:bg-white/10"
              >
                코스 보기
              </a>
            </div>

            {/* 간략 정보 */}
            <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap gap-x-6 gap-y-2 text-sm opacity-70">
              <span className="flex items-center gap-1.5">
                <Mountain className="w-4 h-4" /> 왕방산 737m
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> 40분 ~ 3시간
              </span>
              <span className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4" /> 국유림 등산로 (무료)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 섹션 탭 ══════════════════════════════════════════════════════ */}
      <div className="section mt-6">
        <SectionTabs tabs={TABS} />
      </div>

      {/* ═══ 01 / 코스 안내 ══════════════════════════════════════════════ */}
      <section id="intro" className="section mt-10 scroll-mt-28">
        <span className="eyebrow">Course</span>
        <h2 className="mt-2 h-display">내 페이스대로,<br />세 가지 코스</h2>
        <p className="mt-3 text-[var(--foreground-soft)] leading-relaxed">
          왕방산 등산로는 국유림으로 누구나 무료로 이용할 수 있습니다.
          소르피아를 출발점으로 삼아 원하는 코스를 자유롭게 선택하세요.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {COURSES.map((c) => (
            <div key={c.label} className="card flex flex-col gap-4">
              {/* 난이도 + 레이블 */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: c.color,
                      color: c.textColor,
                      opacity: c.level === 3 ? 1 : undefined,
                    }}
                  >
                    {c.levelText}
                  </span>
                  <div className="mt-2 font-bold text-[var(--brand-strong)]">
                    {c.label}
                  </div>
                </div>
                <DifficultyDots level={c.level} />
              </div>

              {/* 거리 · 시간 바 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[var(--foreground-mute)]">
                  <span>{c.distance}</span>
                  <span>{c.duration}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--brand-soft)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--brand)] transition-all"
                    style={{ width: `${(c.level / 3) * 100}%` }}
                  />
                </div>
              </div>

              <p className="text-sm text-[var(--foreground-soft)] leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>

        {/* 법적 안내 */}
        <div className="mt-4 card-flat flex items-start gap-2.5 text-sm text-[var(--foreground-soft)]">
          <Info className="w-4 h-4 mt-0.5 text-[var(--foreground-mute)] shrink-0" />
          <p>
            왕방산 등산로는 국유지이며 별도 입장료가 없습니다.
            본 패키지는 소르피아97 카페 시설·트레킹 기념품·하산 리워드를
            포함한 상품입니다.
          </p>
        </div>
      </section>

      {/* ═══ 02 / 미션 스팟 ═══════════════════════════════════════════════ */}
      <section id="mission" className="section mt-14 scroll-mt-28">
        <span className="eyebrow">Mobile Mission</span>
        <h2 className="mt-2 h-display">산행 중 미션 스팟을<br />찍어오세요</h2>
        <p className="mt-3 text-[var(--foreground-soft)] leading-relaxed">
          총 5개 스팟 중 3개 이상 인증하면 리워드가 업그레이드됩니다.
          스마트폰 카메라 하나면 충분합니다.
        </p>

        {/* 미션 스텝 */}
        <ol className="mt-6 relative">
          {MISSIONS.map((m, i) => (
            <li key={m.n} className="flex gap-4 pb-6 last:pb-0">
              {/* 세로 연결선 */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--brand-strong)] text-white text-xs font-bold shrink-0">
                  {m.n}
                </div>
                {i < MISSIONS.length - 1 && (
                  <div className="mt-1 w-px flex-1 min-h-[24px] bg-[var(--line)]" />
                )}
              </div>

              {/* 내용 */}
              <div className="pt-1.5 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[var(--brand-strong)]">
                    {m.title}
                  </span>
                  {m.n === "04" && (
                    <span className="chip text-[10px] px-2">선택</span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--foreground-mute)]">
                  <MapPin className="w-3 h-3" />
                  {m.where}
                </div>
                <p className="mt-1.5 text-sm text-[var(--foreground-soft)] leading-relaxed">
                  {m.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* 미션 진행 방법 요약 */}
        <div className="mt-4 card-flat">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-mute)] mb-3">
            미션 진행 방법
          </p>
          <ol className="space-y-2 text-sm text-[var(--foreground-soft)]">
            {[
              "카운터에서 '미션 카드'를 받으세요",
              "산행 중 각 스팟에서 사진 촬영",
              "하산 후 카운터에 사진 보여주기",
              "달성 스팟 수에 따라 리워드 지급",
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)] text-[11px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ 03 / 패키지 예약 ════════════════════════════════════════════ */}
      <section id="book" className="section mt-14 scroll-mt-28">
        <span className="eyebrow">Booking</span>
        <h2 className="mt-2 h-display">소르피아97<br />트레킹 패키지 티켓</h2>
        <p className="mt-3 text-[var(--foreground-soft)] leading-relaxed">
          온라인으로 예약 신청 후, 당일 카운터에서 결제하면
          패키지가 시작됩니다. 예약 없이 현장에서도 바로 구매 가능합니다.
        </p>

        {/* 알림 메시지 */}
        {message && (
          <div className="mt-4 card flex items-start gap-3 border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800">{decodeURIComponent(message)}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 card flex items-start gap-3 border-red-200 bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{decodeURIComponent(error)}</p>
          </div>
        )}

        {/* 패키지 선택 카드 */}
        <form action={bookTrekkingAction} className="mt-6 space-y-5">
          {/* 패키지 옵션 */}
          <div>
            <label className="label">패키지 선택</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {PACKAGES.map((p) => (
                <label
                  key={p.code}
                  className="card cursor-pointer has-[:checked]:border-[var(--brand)] has-[:checked]:ring-2 has-[:checked]:ring-[var(--brand)]/20 transition-all"
                >
                  <input
                    type="radio"
                    name="package_type"
                    value={p.code}
                    defaultChecked={p.recommended}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {p.recommended && (
                        <span className="chip-accent text-[10px] mb-2">추천</span>
                      )}
                      <div className="font-bold text-[var(--brand-strong)] mt-1">
                        {p.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[var(--brand-strong)]">
                        {p.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-[var(--foreground-mute)]">원/인</span>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {p.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-[var(--foreground-soft)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </label>
              ))}
            </div>
          </div>

          {/* 방문 날짜 */}
          <div>
            <label htmlFor="trek_date" className="label">방문 날짜</label>
            <input
              id="trek_date"
              name="trek_date"
              type="date"
              min={today}
              required
              className="input"
            />
          </div>

          {/* 인원수 */}
          <div>
            <label htmlFor="party_size" className="label">인원수</label>
            <select id="party_size" name="party_size" className="input" defaultValue="2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}명
                </option>
              ))}
            </select>
          </div>

          {/* 예약자 정보 */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="guest_name" className="label">이름</label>
              <input
                id="guest_name"
                name="guest_name"
                type="text"
                placeholder="홍길동"
                defaultValue={profile?.display_name ?? ""}
                required
                className="input"
              />
            </div>
            <div>
              <label htmlFor="guest_phone" className="label">연락처</label>
              <input
                id="guest_phone"
                name="guest_phone"
                type="tel"
                placeholder="010-0000-0000"
                defaultValue={profile?.phone ?? ""}
                required
                className="input"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            <CalendarCheck className="w-4 h-4" />
            예약 신청하기
          </button>

          <p className="text-center text-[11px] text-[var(--foreground-mute)]">
            예약은 방문 의향을 알리는 용도이며, 실제 결제는 당일 카운터에서 진행됩니다.
          </p>
        </form>

        {/* 법적 고지 */}
        <div className="mt-4 card-flat text-xs text-[var(--foreground-mute)] leading-relaxed flex items-start gap-2">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            본 티켓은 소르피아97 카페 시설 이용권 및 트레킹 기념품·리워드를 포함한
            패키지 상품입니다. 왕방산 국유림 등산로 이용은 별도 비용 없이 자유롭게
            가능하며, 소르피아97은 등산로 운영 주체가 아닙니다.
          </span>
        </div>
      </section>

      {/* ═══ 04 / 리워드 수령 ════════════════════════════════════════════ */}
      <section id="reward" className="section mt-14 scroll-mt-28">
        <span className="eyebrow">Reward</span>
        <h2 className="mt-2 h-display">하산 후,<br />소르피아에서 쉬어가세요</h2>
        <p className="mt-3 text-[var(--foreground-soft)] leading-relaxed">
          미션을 많이 달성할수록 더 풍성한 리워드가 준비돼 있습니다.
          카운터에 미션 카드를 제출하면 바로 수령할 수 있습니다.
        </p>

        {/* 리워드 티어 */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {REWARDS.map((r) => (
            <div
              key={r.badge}
              className="card flex flex-col gap-3"
            >
              <div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: r.color, color: r.textColor }}
                >
                  {r.badge}
                </span>
                <p className="mt-2 text-sm font-semibold text-[var(--foreground-soft)]">
                  {r.condition}
                </p>
              </div>
              <ul className="space-y-1.5">
                {r.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[var(--brand-strong)] font-medium">
                    <Gift className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 수령 방법 */}
        <div className="mt-6 card">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-mute)] mb-4">
            리워드 수령 방법
          </p>
          <ol className="space-y-4">
            {[
              {
                icon: Footprints,
                title: "하산 후 카운터 방문",
                desc: "산행을 마치고 소르피아 카운터로 돌아오세요.",
              },
              {
                icon: Camera,
                title: "미션 카드 + 사진 제출",
                desc: "스마트폰에 저장한 스팟 사진을 카운터에서 확인합니다.",
              },
              {
                icon: Star,
                title: "달성 수 확인 후 리워드 즉시 지급",
                desc: "인증된 스팟 수에 따라 음료·간식·굿즈를 바로 드립니다.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--brand-soft)] text-[var(--brand-strong)] shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-[var(--brand-strong)] text-sm">
                    {title}
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--foreground-soft)]">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══ 하단 CTA ══════════════════════════════════════════════════════ */}
      <section className="section mt-14 mb-4">
        <div className="card-flat text-center py-10">
          <Mountain className="w-8 h-8 mx-auto text-[var(--brand)]" />
          <h3 className="mt-3 h-section">왕방산을 소르피아와 함께</h3>
          <p className="mt-2 text-sm text-[var(--foreground-soft)]">
            산 아래에서 시작해 산 아래로 돌아오는 하루.
            <br />
            카페가 출발점이자 도착점이 됩니다.
          </p>
          <a href="#book" className="btn-primary mt-6 inline-flex">
            패키지 예약
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
