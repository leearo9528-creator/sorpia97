import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { applyForPassAction } from "./actions";
import { Check, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;
  const supabase = await createClient();
  const { data: passes } = await supabase
    .from("subscription_passes")
    .select(
      "id,code,name,description,duration_months,monthly_product,monthly_drink_quota,price,is_active",
    )
    .eq("is_active", true)
    .order("price");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="section py-5 md:py-10 space-y-6">
      <header>
        <span className="eyebrow">Subscription</span>
        <h1 className="mt-2 h-display">구독 패스</h1>
        <p className="mt-3 text-[15px] text-[var(--foreground-soft)] leading-relaxed">
          12개월 동안 매월 강아지 용품 1개와 음료 쿠폰을 함께 받는 패스 상품.
          한 번 가입하면 매장 방문 때마다 매달 챙겨드려요.
        </p>
      </header>

      {message && (
        <div className="card flex items-start gap-3 border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">{decodeURIComponent(message)}</p>
        </div>
      )}
      {error && (
        <div className="card flex items-start gap-3 border-red-200 bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{decodeURIComponent(error)}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(passes ?? []).map((p) => (
          <div key={p.id} className="card relative overflow-hidden flex flex-col">
            <div
              aria-hidden
              className="absolute -right-12 -top-12 w-44 h-44 rounded-full opacity-30 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, var(--accent-soft), transparent 70%)",
              }}
            />
            <div className="relative flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="chip-accent">
                    <ShieldCheck className="w-3 h-3" /> {p.duration_months}개월 패스
                  </span>
                  <h2 className="mt-3 text-xl font-bold text-[var(--brand-strong)] tracking-tight">
                    {p.name}
                  </h2>
                  <div className="text-xs text-[var(--foreground-mute)] mt-1">
                    {p.code}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-[var(--foreground-soft)] leading-relaxed">
                {p.description}
              </p>

              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-[var(--brand)]" />
                  매월 <b className="text-[var(--brand-strong)]">{p.monthly_product}</b> 1개 제공
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-[var(--brand)]" />
                  매월 음료 쿠폰 <b className="text-[var(--brand-strong)]">{p.monthly_drink_quota}장</b> 지급
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 text-[var(--brand)]" />
                  총 {p.duration_months}개월 유효 (자동갱신 없음)
                </li>
              </ul>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[var(--brand-strong)]">
                  {p.price.toLocaleString()}
                </span>
                <span className="text-sm text-[var(--foreground-mute)]">원</span>
              </div>
            </div>

            <form action={applyForPassAction} className="mt-5 relative">
              <input type="hidden" name="pass_id" value={p.id} />
              {user ? (
                <button className="btn-primary w-full" type="submit">
                  신청하기
                </button>
              ) : (
                <Link href="/login?next=/shop" className="btn-primary w-full">
                  로그인 후 신청
                </Link>
              )}
            </form>
          </div>
        ))}
        {(passes ?? []).length === 0 && (
          <p className="text-[var(--foreground-mute)] col-span-full text-center py-8">
            등록된 상품이 아직 없습니다.
          </p>
        )}
      </div>

      <p className="text-xs text-[var(--foreground-mute)] text-center pt-2">
        * 현재는 매장 결제 기반 신청만 지원합니다. 신청 후 매장에서 결제를 진행해 주세요.
      </p>
    </div>
  );
}
