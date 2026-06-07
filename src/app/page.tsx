import Link from "next/link";
import { PhotoSlot } from "@/components/PhotoSlot";
import { CopyAddress } from "@/components/CopyAddress";
import { ContactActions } from "@/components/ContactActions";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/brand";
import {
  Stamp,
  PawPrint,
  Sparkles,
  ChevronRight,
  Calendar,
  MapPin,
  Building2,
  UtensilsCrossed,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let visits = 0;

  if (user) {
    const { count: vCount } = await supabase
      .from("visits")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id);
    visits = vCount ?? 0;
  }

  const stamps = visits % 10;

  return (
    <div className="pb-12 space-y-5">

      {/* ── 헤더 ─────────────────────────────────────── */}
      <section className="section pt-3 md:pt-6">
        <PhotoSlot
          label="사진1"
          hint="카페 메인 전경"
          aspect="aspect-[16/10]"
          rounded="rounded-[24px]"
        />
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-[var(--brand-strong)] tracking-tight">
            {BRAND.name}
          </h1>
          <CopyAddress address={BRAND.address} />
        </div>
      </section>

      {/* ── 출석 도장 (로그인 시) ─────────────────────── */}
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
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-[var(--brand-strong)]">{stamps}</span>
                  <span className="text-[var(--foreground-mute)] text-sm">/ 10</span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--foreground-soft)]">
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
                      (filled ? "bg-[var(--brand)] text-white" : "bg-[var(--surface-2)] text-[var(--foreground-mute)]")
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

      {/* ── 바로가기 그리드 ───────────────────────────── */}
      <section className="section">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/menu" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">카페 메뉴</div>
            <p className="mt-0.5 text-xs text-[var(--foreground-soft)]">음료 · 푸드 · 디저트</p>
          </Link>

          <Link href="/board" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <PawPrint className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">발자국</div>
            <p className="mt-0.5 text-xs text-[var(--foreground-soft)]">방문 후기 · 사진</p>
          </Link>

          <Link href="/pricing" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">이용안내</div>
            <p className="mt-0.5 text-xs text-[var(--foreground-soft)]">입장권 · 셀프목욕 · BBQ</p>
          </Link>

          <Link href="/now" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">오늘의 소르피아</div>
            <p className="mt-0.5 text-xs text-[var(--foreground-soft)]">오늘 다녀간 강아지</p>
          </Link>
        </div>
      </section>

      {/* ── 정보 ─────────────────────────────────────── */}
      <section className="section space-y-3">
        <ul className="card !p-0 divide-y divide-[var(--line)]">
          <li className="flex items-start gap-3 px-4 py-3.5">
            <MapPin className="w-4 h-4 mt-0.5 text-[var(--brand)] shrink-0" />
            <div>
              <div className="text-sm">{BRAND.address}</div>
              <div className="text-xs text-[var(--foreground-mute)] mt-0.5">{BRAND.landmark}</div>
            </div>
          </li>
          <li className="flex items-start gap-3 px-4 py-3.5">
            <Calendar className="w-4 h-4 mt-0.5 text-[var(--brand)] shrink-0" />
            <div>
              <div className="text-sm">{BRAND.hours}</div>
              <div className="text-xs text-[var(--foreground-mute)] mt-0.5">{BRAND.notice}</div>
            </div>
          </li>
        </ul>
        <ContactActions />
      </section>

    </div>
  );
}
