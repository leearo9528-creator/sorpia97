import { createClient } from "@/lib/supabase/server";
import { checkInAction, issueCouponAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; message?: string; error?: string }>;
}) {
  const { q, message, error } = await searchParams;
  const supabase = await createClient();

  // 프로필 목록 (검색어 있으면 필터)
  let profileQuery = supabase
    .from("profiles")
    .select("id,display_name,phone,email")
    .limit(100);
  if (q) {
    profileQuery = profileQuery.or(
      `display_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`,
    );
  }
  const { data: profiles } = await profileQuery;
  const profileIds = (profiles ?? []).map((p) => p.id);

  // 방문 횟수 일괄 집계 (관리자는 전체 visits 읽기 가능)
  const { data: visitRows } = profileIds.length
    ? await supabase.from("visits").select("profile_id").in("profile_id", profileIds)
    : { data: [] };

  const visitMap = new Map<string, number>();
  for (const r of visitRows ?? []) {
    visitMap.set(r.profile_id, (visitMap.get(r.profile_id) ?? 0) + 1);
  }

  const members = (profiles ?? [])
    .map((p) => ({ ...p, visits_count: visitMap.get(p.id) ?? 0 }))
    .sort((a, b) => b.visits_count - a.visits_count);

  return (
    <div className="grid gap-6">
      <section>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="이름 · 전화번호 · 아이디로 검색"
            className="input flex-1"
          />
          <button className="btn-primary" type="submit">검색</button>
          {q && (
            <a href="/admin/attendance" className="btn-outline">전체</a>
          )}
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
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--brand-strong)]">
            회원 목록
            <span className="ml-2 text-xs font-normal text-[var(--foreground-mute)]">
              {q ? `"${q}" 검색 결과 ${members.length}명` : `전체 ${members.length}명 · 방문 많은 순`}
            </span>
          </h2>
        </div>

        {members.length === 0 ? (
          <p className="text-center py-10 opacity-60 text-sm">결과가 없습니다.</p>
        ) : (
          <ul className="grid gap-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 gap-3 flex-wrap"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--brand-strong)]">
                    {m.display_name ?? "이름 없음"}
                  </div>
                  <div className="text-xs text-[var(--foreground-mute)] mt-0.5">
                    {m.phone ?? m.email ?? "-"} · 누적 {m.visits_count}회
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={checkInAction}>
                    <input type="hidden" name="profile_id" value={m.id} />
                    <input type="hidden" name="q" value={q ?? ""} />
                    <button className="btn-primary btn-sm" type="submit">출석 도장</button>
                  </form>
                  <form action={issueCouponAction}>
                    <input type="hidden" name="profile_id" value={m.id} />
                    <input type="hidden" name="q" value={q ?? ""} />
                    <button className="btn-outline btn-sm" type="submit">쿠폰 발급</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
