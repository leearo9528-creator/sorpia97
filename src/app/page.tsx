import Link from "next/link";
import { PhotoSlot } from "@/components/PhotoSlot";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/brand";
import {
  Stamp,
  PawPrint,
  Trophy,
  Sparkles,
  Ticket,
  ChevronRight,
  Calendar,
  MapPin,
  TreePine,
} from "lucide-react";

const YARDS = ["소형견", "중형견", "대형견"] as const;
const TIMES = ["12:00", "15:00", "18:00"] as const;
const TIME_LABEL: Record<string, string> = { "12:00": "12시", "15:00": "15시", "18:00": "18시" };

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-emerald-100",  text: "text-emerald-700", label: "예약가능" },
  reserved:  { bg: "bg-red-100",      text: "text-red-600",     label: "예약됨"  },
  closed:    { bg: "bg-[var(--surface-2)]", text: "text-[var(--foreground-mute)]", label: "마감" },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let visits = 0;
  let activePassName: string | null = null;
  let myRank: number | null = null;

  const today = new Date().toISOString().split("T")[0];
  const { data: fieldSlots } = await supabase
    .from("field_slots")
    .select("yard,slot_time,status")
    .eq("slot_date", today);

  const slotMap = new Map<string, string>();
  for (const s of fieldSlots ?? []) {
    slotMap.set(`${s.yard}|${s.slot_time}`, s.status);
  }

  if (user) {
    const [{ count: vCount }, { data: pass }] = await Promise.all([
      supabase
        .from("visits")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id),
      supabase
        .from("pass_orders")
        .select("subscription_passes(name)")
        .eq("profile_id", user.id)
        .eq("status", "active")
        .order("started_on", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    visits = vCount ?? 0;
    const passRow = pass as unknown as {
      subscription_passes: { name: string } | null;
    } | null;
    activePassName = passRow?.subscription_passes?.name ?? null;

    // 이번 달 랭킹 (간단 계산)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const { data: rows } = await supabase
      .from("visits")
      .select("profile_id")
      .gte("visited_at", monthStart.toISOString());

    const counts = new Map<string, number>();
    for (const r of rows ?? []) {
      counts.set(r.profile_id, (counts.get(r.profile_id) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const idx = sorted.findIndex(([id]) => id === user.id);
    myRank = idx >= 0 ? idx + 1 : null;
  }

  const stamps = visits % 10;

  return (
    <div className="pb-12 space-y-6">
      {/* ============ 사진 + 상호명 (간략) ============ */}
      <section className="section pt-3 md:pt-6">
        <PhotoSlot
          label="사진1"
          hint="카페 메인 전경"
          aspect="aspect-[16/10]"
          rounded="rounded-[24px]"
        />
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--brand-strong)] tracking-tight">
              {BRAND.name}
            </h1>
            <p className="mt-1 text-xs text-[var(--foreground-mute)] flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              동두천 · {BRAND.landmark}
            </p>
          </div>
          {!user && (
            <Link href="/signup" className="btn-primary btn-sm">
              가입
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </section>

      {/* ============ 도장판 (로그인 시) ============ */}
      {user && (
        <section className="section">
          <Link
            href="/mypage"
            className="card relative overflow-hidden block hover:bg-[var(--surface-2)]/30 transition-colors"
          >
            <div
              aria-hidden
              className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-30 blur-2xl"
              style={{ background: "radial-gradient(circle, var(--brand-soft), transparent 70%)" }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <span className="chip">
                  <Stamp className="w-3 h-3" /> 출석 도장
                </span>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[var(--brand-strong)]">
                    {stamps}
                  </span>
                  <span className="text-[var(--foreground-mute)] text-sm">/ 10</span>
                </div>
                <p className="mt-1 text-xs text-[var(--foreground-soft)]">
                  누적 {visits}회 · 다음 무료까지 {10 - stamps}회
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--foreground-mute)]" />
            </div>
            <div className="mt-4 grid grid-cols-10 gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => {
                const filled = i < stamps;
                return (
                  <div
                    key={i}
                    className={
                      "aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold " +
                      (filled
                        ? "bg-[var(--brand)] text-white"
                        : "bg-[var(--surface-2)] text-[var(--foreground-mute)]")
                    }
                  >
                    {filled ? <PawPrint className="w-3 h-3" /> : i + 1}
                  </div>
                );
              })}
            </div>
          </Link>
        </section>
      )}

      {/* ============ 액션 카드 그리드 (스타벅스 풍) ============ */}
      <section className="section">
        <div className="grid grid-cols-2 gap-3">
          {/* 발자국 */}
          <Link href="/board" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <PawPrint className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">발자국</div>
            <p className="mt-1 text-xs text-[var(--foreground-soft)]">
              방문 후기·사진 남기기
            </p>
          </Link>

          {/* 랭킹 */}
          <Link href="/ranking" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-deep)]">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">랭킹</div>
            <p className="mt-1 text-xs text-[var(--foreground-soft)]">
              {myRank ? `이번 달 ${myRank}위` : "이번 달 TOP 3"}
            </p>
          </Link>

          {/* 지금 소르피아 */}
          <Link href="/now" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">오늘의 소르피아</div>
            <p className="mt-1 text-xs text-[var(--foreground-soft)]">
              오늘 다녀간 강아지
            </p>
          </Link>

          {/* 패스 */}
          <Link href="/pass" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-deep)]">
              <Ticket className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">
              {activePassName ? activePassName : "넥스가드 패스"}
            </div>
            <p className="mt-1 text-xs text-[var(--foreground-soft)]">
              {activePassName ? "이번 달 수령 보기" : "12개월 약품 + 음료"}
            </p>
          </Link>
        </div>
      </section>

      {/* ============ 운동장 대관 현황 ============ */}
      <section className="section">
        <div className="flex items-center justify-between mb-3">
          <h2 className="h-section">운동장 대관 현황</h2>
          <span className="text-xs text-[var(--foreground-mute)]">오늘</span>
        </div>
        <div className="card !p-0 overflow-hidden">
          {/* 헤더 */}
          <div className="grid grid-cols-4 border-b border-[var(--line)] bg-[var(--surface-2)]">
            <div className="px-3 py-2.5 text-xs font-semibold text-[var(--foreground-mute)]">
              <TreePine className="w-3.5 h-3.5 inline mr-1 opacity-60" />운동장
            </div>
            {TIMES.map((t) => (
              <div
                key={t}
                className="px-2 py-2.5 text-center text-xs font-semibold text-[var(--foreground-mute)]"
              >
                {TIME_LABEL[t]}
              </div>
            ))}
          </div>
          {/* 행 */}
          {YARDS.map((yard, yi) => (
            <div
              key={yard}
              className={
                "grid grid-cols-4 items-center" +
                (yi < YARDS.length - 1 ? " border-b border-[var(--line)]" : "")
              }
            >
              <div className="px-3 py-3 text-sm font-semibold text-[var(--brand-strong)]">
                {yard}견
              </div>
              {TIMES.map((time) => {
                const st = slotMap.get(`${yard}|${time}`) ?? "available";
                const style = STATUS_STYLE[st] ?? STATUS_STYLE.available;
                return (
                  <div key={time} className="px-2 py-3 flex justify-center">
                    <span
                      className={`inline-flex items-center justify-center rounded-xl px-2.5 py-1 text-[11px] font-semibold ${style.bg} ${style.text}`}
                    >
                      {style.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* ============ 랭킹 미니 배너 (이번 달 상금) ============ */}
      <section className="section">
        <Link
          href="/ranking"
          className="card relative overflow-hidden block hover:bg-[var(--surface-2)]/30 transition-colors"
        >
          <div
            aria-hidden
            className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-40 blur-2xl"
            style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
          />
          <div className="relative flex items-center gap-4">
            <Trophy className="w-9 h-9 text-[var(--accent-deep)] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[var(--accent-deep)] uppercase tracking-wider">
                이번 달 상금
              </div>
              <div className="mt-0.5 font-bold text-[var(--brand-strong)]">
                출석왕 1등 <span className="text-[var(--accent-deep)]">5만원</span>
                <span className="text-[var(--foreground-mute)] mx-1">·</span>
                2등 3만원
                <span className="text-[var(--foreground-mute)] mx-1">·</span>
                3등 1만원
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--foreground-mute)]" />
          </div>
        </Link>
      </section>

      {/* ============ 정보 ============ */}
      <section className="section">
        <h2 className="h-section mb-3">정보</h2>
        <ul className="card !p-0 divide-y divide-[var(--line)]">
          <li className="flex items-start gap-3 px-4 py-3.5">
            <MapPin className="w-4 h-4 mt-0.5 text-[var(--brand)] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm">{BRAND.address}</div>
              <div className="text-xs text-[var(--foreground-mute)] mt-0.5">
                {BRAND.landmark}
              </div>
            </div>
          </li>
          <li className="flex items-start gap-3 px-4 py-3.5">
            <Calendar className="w-4 h-4 mt-0.5 text-[var(--brand)] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm">{BRAND.hours}</div>
              <div className="text-xs text-[var(--foreground-mute)] mt-0.5">
                {BRAND.notice}
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
