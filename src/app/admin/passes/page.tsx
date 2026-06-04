import { createClient } from "@/lib/supabase/server";
import { activateOrderAction, redeemMonthAction } from "./actions";

export default async function PassesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;
  const supabase = await createClient();

  const [{ data: passes }, { data: orders }] = await Promise.all([
    supabase.from("subscription_passes").select("*").order("created_at", { ascending: false }),
    supabase
      .from("pass_orders")
      .select(
        "id,started_on,expires_on,status,profiles(display_name,email),subscription_passes(name,monthly_product,monthly_drink_quota,duration_months),pass_redemptions(month_index,product_redeemed_at,drinks_issued)",
      )
      .order("started_on", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="grid gap-8">
      {message && (
        <p className="text-sm rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
          {decodeURIComponent(message)}
        </p>
      )}
      {error && (
        <p className="text-sm rounded-xl bg-red-50 border border-red-200 px-3 py-2">
          {decodeURIComponent(error)}
        </p>
      )}

      <section>
        <h2 className="font-semibold text-[var(--brand-strong)]">상품 (구독 패스 정의)</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-4">
          {(passes ?? []).map((p) => (
            <div key={p.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs opacity-70">{p.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[var(--accent)]">
                    {p.price.toLocaleString()}원
                  </div>
                  <div className="text-xs opacity-70">{p.duration_months}개월</div>
                </div>
              </div>
              <p className="text-sm opacity-80 mt-2">{p.description}</p>
              <p className="text-sm mt-2">
                매월 <b>{p.monthly_product}</b> 1개 + 음료 쿠폰 {p.monthly_drink_quota}장
              </p>
              <p className="text-xs opacity-60 mt-2">
                활성: {p.is_active ? "예" : "아니오"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-[var(--brand-strong)]">구독 주문</h2>
        <div className="mt-3 grid gap-3">
          {(orders ?? []).map((o) => {
            const profile = (o as unknown as { profiles: { display_name: string; email: string } }).profiles;
            const pass = (o as unknown as {
              subscription_passes: { name: string; monthly_product: string; monthly_drink_quota: number; duration_months: number };
            }).subscription_passes;
            const reds = (o as unknown as {
              pass_redemptions: { month_index: number; product_redeemed_at: string | null; drinks_issued: boolean }[];
            }).pass_redemptions ?? [];

            return (
              <div key={o.id} className="card">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {profile?.display_name} · {pass?.name}
                    </div>
                    <div className="text-xs opacity-70">
                      {profile?.email} · {o.started_on} ~ {o.expires_on}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs rounded-full bg-[var(--muted)] px-2 py-0.5">
                      {o.status}
                    </span>
                    {o.status !== "active" && (
                      <form action={activateOrderAction}>
                        <input type="hidden" name="order_id" value={o.id} />
                        <button className="btn-outline text-xs">활성화</button>
                      </form>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Array.from({ length: pass?.duration_months ?? 12 }).map((_, i) => {
                    const month = i + 1;
                    const r = reds.find((x) => x.month_index === month);
                    const done = !!r?.product_redeemed_at;
                    return (
                      <form
                        key={month}
                        action={redeemMonthAction}
                        className="flex flex-col items-stretch"
                      >
                        <input type="hidden" name="order_id" value={o.id} />
                        <input type="hidden" name="month_index" value={month} />
                        <button
                          type="submit"
                          className={
                            "rounded-xl border px-2 py-2 text-xs " +
                            (done
                              ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                              : "border-[var(--ring)] hover:bg-[var(--muted)]")
                          }
                          title={
                            done
                              ? `이미 ${new Date(r!.product_redeemed_at!).toLocaleDateString()} 지급`
                              : "지급 처리"
                          }
                        >
                          {month}월차
                          <br />
                          {done ? "지급완료" : "지급하기"}
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {(orders ?? []).length === 0 && (
            <p className="opacity-60 text-sm">아직 주문이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}
