import { createClient } from "@/lib/supabase/server";
import { checkInAction, issueCouponAction } from "./actions";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; message?: string; error?: string }>;
}) {
  const { q, message, error } = await searchParams;
  const supabase = await createClient();

  let members: { id: string; display_name: string | null; email: string | null; visits_count: number }[] = [];
  if (q) {
    const { data } = await supabase
      .from("profiles")
      .select("id,display_name,email")
      .or(`display_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
      .limit(20);

    members = await Promise.all(
      (data ?? []).map(async (p) => {
        const { count } = await supabase
          .from("visits")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", p.id);
        return { ...p, visits_count: count ?? 0 };
      }),
    );
  }

  const { data: recent } = await supabase
    .from("visits")
    .select("id,visited_at,profile_id,profiles(display_name,email)")
    .order("visited_at", { ascending: false })
    .limit(15);

  return (
    <div className="grid gap-8">
      <section>
        <h2 className="font-semibold text-[var(--brand-strong)]">출석 체크</h2>
        <form className="mt-3 flex gap-2">
          <input name="q" defaultValue={q} placeholder="회원 검색" className="input flex-1" />
          <button className="btn-outline" type="submit">검색</button>
        </form>
        {message && (
          <p className="mt-3 text-sm rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
            {decodeURIComponent(message)}
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm rounded-xl bg-red-50 border border-red-200 px-3 py-2">
            {decodeURIComponent(error)}
          </p>
        )}

        {q && (
          <ul className="mt-4 grid gap-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-[var(--ring)]/60 bg-white/80 p-3"
              >
                <div>
                  <div className="font-medium">{m.display_name}</div>
                  <div className="text-xs opacity-70">
                    {m.email} · 누적 {m.visits_count}회
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={checkInAction}>
                    <input type="hidden" name="profile_id" value={m.id} />
                    <input type="hidden" name="q" value={q} />
                    <button className="btn-primary" type="submit">출석 도장</button>
                  </form>
                  <form action={issueCouponAction}>
                    <input type="hidden" name="profile_id" value={m.id} />
                    <input type="hidden" name="q" value={q} />
                    <button className="btn-outline" type="submit">쿠폰 수동 발급</button>
                  </form>
                </div>
              </li>
            ))}
            {members.length === 0 && (
              <li className="opacity-60 text-sm">검색 결과 없음.</li>
            )}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-[var(--brand-strong)]">최근 출석</h2>
        <ul className="mt-3 divide-y divide-[var(--ring)]/40 rounded-2xl border border-[var(--ring)]/60 bg-white/80">
          {(recent ?? []).map((r) => {
            const p = (r as unknown as { profiles: { display_name: string; email: string } }).profiles;
            return (
              <li key={r.id} className="flex justify-between px-4 py-2 text-sm">
                <span>{p?.display_name ?? r.profile_id}</span>
                <span className="opacity-70">{new Date(r.visited_at).toLocaleString()}</span>
              </li>
            );
          })}
          {(recent ?? []).length === 0 && (
            <li className="px-4 py-6 text-center opacity-60 text-sm">아직 출석 기록이 없습니다.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
