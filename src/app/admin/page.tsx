import { createClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  const supabase = await createClient();
  const [m, d, vToday, activePasses, coupons] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("dogs").select("*", { count: "exact", head: true }),
    supabase
      .from("visits")
      .select("*", { count: "exact", head: true })
      .gte("visited_at", new Date(new Date().toDateString()).toISOString()),
    supabase.from("pass_orders").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("coupons").select("*", { count: "exact", head: true }).is("used_at", null),
  ]);

  const cards = [
    { label: "전체 회원", value: m.count ?? 0 },
    { label: "등록된 강아지", value: d.count ?? 0 },
    { label: "오늘 출석", value: vToday.count ?? 0 },
    { label: "활성 구독 패스", value: activePasses.count ?? 0 },
    { label: "미사용 쿠폰", value: coupons.count ?? 0 },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="card">
          <div className="text-sm opacity-70">{c.label}</div>
          <div className="text-3xl font-semibold mt-2 text-[var(--brand-strong)]">
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
