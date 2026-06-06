import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import {
  Stamp,
  Ticket,
  Dog,
  ChevronRight,
  Gift,
  PawPrint,
  ShoppingBag,
} from "lucide-react";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="section py-20 text-center">
        <p className="text-[var(--foreground-soft)]">로그인이 필요합니다.</p>
        <Link href="/login" className="btn-primary mt-4 inline-flex">
          로그인
        </Link>
      </div>
    );
  }

  const [
    { data: profile },
    { data: dogs },
    { count: visitCount },
    { data: coupons },
    { data: orders },
  ] = await Promise.all([
    supabase.from("profiles").select("display_name,phone,email,role").eq("id", user.id).maybeSingle(),
    supabase.from("dogs").select("id,name,birthday,photo_url").eq("owner_id", user.id),
    supabase.from("visits").select("id", { count: "exact", head: true }).eq("profile_id", user.id),
    supabase
      .from("coupons")
      .select("id,kind,title,description,issued_at,expires_at,used_at")
      .eq("profile_id", user.id)
      .order("issued_at", { ascending: false }),
    supabase
      .from("pass_orders")
      .select(
        "id,started_on,expires_on,status,subscription_passes(name,monthly_product,monthly_drink_quota,duration_months)",
      )
      .eq("profile_id", user.id)
      .eq("status", "active")
      .order("started_on", { ascending: false }),
  ]);

  const visits = visitCount ?? 0;
  const stamps = visits % 10;
  const validCoupons = (coupons ?? []).filter((c) => !c.used_at);
  const usedCoupons = (coupons ?? []).filter((c) => c.used_at);

  return (
    <div className="section py-5 md:py-10 space-y-5">
      {/* 인사 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[var(--brand)] text-white inline-flex items-center justify-center font-bold text-lg">
          {(profile?.display_name ?? "U").slice(0, 1)}
        </div>
        <div className="flex-1">
          <div className="text-xs text-[var(--foreground-mute)]">반가워요 🐾</div>
          <div className="font-bold text-[var(--brand-strong)]">
            {profile?.display_name ?? "회원"}님
          </div>
        </div>
        <SignOutButton minimal />
      </div>

      {/* 출석 도장 — 메인 카드 */}
      <section className="card relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-30 blur-2xl"
          style={{ background: "radial-gradient(circle, var(--brand-soft), transparent 70%)" }}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <span className="chip">
              <Stamp className="w-3 h-3" /> 출석 도장
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[var(--brand-strong)]">
                {stamps}
              </span>
              <span className="text-[var(--foreground-mute)] text-sm">/ 10</span>
            </div>
            <p className="mt-1 text-xs text-[var(--foreground-soft)]">
              누적 {visits}회 · 다음 무료 음료까지 {10 - stamps}회
            </p>
          </div>
          <Gift className="w-7 h-7 text-[var(--accent)]" />
        </div>

        <div className="mt-5 grid grid-cols-10 gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => {
            const filled = i < stamps;
            return (
              <div
                key={i}
                className={
                  "aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold transition-all " +
                  (filled
                    ? "bg-[var(--brand)] text-white shadow-sm"
                    : "bg-[var(--surface-2)] text-[var(--foreground-mute)]")
                }
              >
                {filled ? <PawPrint className="w-3.5 h-3.5" /> : i + 1}
              </div>
            );
          })}
        </div>
      </section>

      {/* 빠른 액션 그리드 */}
      <section className="grid grid-cols-2 gap-3">
        <div className="card-flat">
          <Ticket className="w-5 h-5 text-[var(--accent)]" />
          <div className="mt-2 text-xs text-[var(--foreground-mute)]">사용 가능 쿠폰</div>
          <div className="mt-0.5 text-2xl font-bold text-[var(--brand-strong)]">
            {validCoupons.length}
            <span className="text-sm text-[var(--foreground-mute)] font-medium ml-1">장</span>
          </div>
        </div>
        <div className="card-flat">
          <ShoppingBag className="w-5 h-5 text-[var(--brand)]" />
          <div className="mt-2 text-xs text-[var(--foreground-mute)]">활성 구독 패스</div>
          <div className="mt-0.5 text-2xl font-bold text-[var(--brand-strong)]">
            {(orders ?? []).filter((o) => o.status === "active").length}
            <span className="text-sm text-[var(--foreground-mute)] font-medium ml-1">개</span>
          </div>
        </div>
      </section>

      {/* 강아지 카드 */}
      <section>
        <div className="flex items-end justify-between mb-3 px-1">
          <h2 className="h-section">우리 강아지</h2>
          <Link href="/mypage/dogs/new" className="text-xs text-[var(--brand)] font-medium">+ 추가</Link>
        </div>
        {(dogs ?? []).length === 0 ? (
          <div className="card-flat text-center py-8">
            <Dog className="w-8 h-8 mx-auto text-[var(--foreground-mute)]" />
            <p className="mt-3 text-sm text-[var(--foreground-soft)]">
              아직 등록된 강아지가 없어요.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory">
            {(dogs ?? []).map((d) => (
              <div
                key={d.id}
                className="card shrink-0 w-44 snap-start"
              >
                <div className="aspect-square -mx-2 -mt-2 rounded-2xl overflow-hidden bg-[var(--surface-2)] flex items-center justify-center mb-3">
                  {d.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.photo_url} alt={d.name} className="w-full h-full object-cover" />
                  ) : (
                    <Dog className="w-10 h-10 text-[var(--foreground-mute)]" />
                  )}
                </div>
                <div className="font-semibold text-[var(--brand-strong)] truncate">
                  {d.name}
                </div>
                <div className="text-[11px] text-[var(--foreground-mute)] mt-0.5">
                  {d.birthday ? `${d.birthday} 생` : "생일 미등록"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 쿠폰 */}
      <section>
        <div className="flex items-end justify-between mb-3 px-1">
          <h2 className="h-section">보유 쿠폰</h2>
          {usedCoupons.length > 0 && (
            <span className="text-xs text-[var(--foreground-mute)]">
              사용 {usedCoupons.length}장
            </span>
          )}
        </div>
        {validCoupons.length === 0 ? (
          <div className="card-flat text-center py-6 text-sm text-[var(--foreground-soft)]">
            사용 가능한 쿠폰이 없습니다.
          </div>
        ) : (
          <ul className="space-y-2">
            {validCoupons.map((c) => (
              <li
                key={c.id}
                className="card flex items-center gap-4 !p-4"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Ticket className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--brand-strong)] truncate">
                    {c.title}
                  </div>
                  <div className="text-xs text-[var(--foreground-mute)] truncate">
                    {c.description}
                  </div>
                </div>
                <div className="text-[11px] text-right text-[var(--foreground-mute)] shrink-0">
                  {c.expires_at
                    ? `~ ${new Date(c.expires_at).toLocaleDateString()}`
                    : "기한 없음"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 구독 패스 */}
      <section>
        <div className="flex items-end justify-between mb-3 px-1">
          <h2 className="h-section">내 구독 패스</h2>
          <Link
            href="/shop"
            className="text-xs text-[var(--brand)] font-medium inline-flex items-center"
          >
            상품 <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(orders ?? []).length === 0 ? (
          <div className="card-flat text-center py-6">
            <p className="text-sm text-[var(--foreground-soft)]">
              아직 가입한 구독 패스가 없습니다.
            </p>
            <Link href="/shop" className="btn-outline btn-sm mt-3 inline-flex">
              패스 둘러보기
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {(orders ?? []).map((o) => {
              const pass = o.subscription_passes as unknown as
                | {
                    name: string;
                    monthly_product: string | null;
                    monthly_drink_quota: number;
                    duration_months: number;
                  }
                | null;
              return (
                <li key={o.id} className="card">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-semibold text-[var(--brand-strong)]">
                        {pass?.name ?? "구독 패스"}
                      </div>
                      <div className="text-xs text-[var(--foreground-mute)] mt-0.5">
                        {o.started_on} ~ {o.expires_on}
                      </div>
                    </div>
                    <span
                      className={
                        o.status === "active"
                          ? "chip"
                          : "chip bg-[var(--surface-2)] text-[var(--foreground-mute)]"
                      }
                    >
                      {o.status}
                    </span>
                  </div>
                  {pass && (
                    <p className="mt-3 text-sm text-[var(--foreground-soft)]">
                      매월 <b className="text-[var(--brand-strong)]">{pass.monthly_product}</b> 1개 + 음료 쿠폰 {pass.monthly_drink_quota}장
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
