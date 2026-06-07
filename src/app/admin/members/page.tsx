import { createClient } from "@/lib/supabase/server";
import { Ticket, CheckCircle2, Trash2, Dog, UserPlus } from "lucide-react";
import {
  addMemberAction,
  deleteMemberAction,
  updateMemberProfileAction,
  updateMemberRoleAction,
  checkInAction,
  adjustVisitCountAction,
  issueCouponAction,
  deleteCouponAction,
  addDogAction,
  updateDogAction,
  deleteDogAction,
} from "./actions";

export const dynamic = "force-dynamic";

const ROLE_OPTIONS = [
  { value: "member",  label: "회원" },
  { value: "manager", label: "매니저" },
  { value: "admin",   label: "관리자" },
];

function roleBadge(role: string) {
  if (role === "admin")   return "bg-[var(--accent)] text-white";
  if (role === "manager") return "bg-[var(--brand-soft)] text-[var(--brand-strong)]";
  return "bg-[var(--surface-2)] text-[var(--foreground-mute)]";
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; message?: string; error?: string; edit?: string }>;
}) {
  const { q, message, error, edit } = await searchParams;
  const supabase = await createClient();

  let profileQuery = supabase
    .from("profiles")
    .select("id,email,display_name,phone,role,created_at")
    .limit(200);
  if (q) {
    profileQuery = profileQuery.or(
      `display_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`,
    );
  }
  const { data: profiles } = await profileQuery;
  const profileIds = (profiles ?? []).map((p) => p.id);

  const kstNow     = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayKST   = kstNow.toISOString().split("T")[0];
  const startOfDay = new Date(todayKST + "T00:00:00+09:00").toISOString();

  const [{ data: visitRows }, { data: editCoupons }, { data: editDogs }] =
    await Promise.all([
      profileIds.length
        ? supabase
            .from("visits")
            .select("profile_id,visited_at")
            .in("profile_id", profileIds)
        : { data: [] as { profile_id: string; visited_at: string }[] },
      edit
        ? supabase
            .from("coupons")
            .select("id,kind,title,description,issued_at,expires_at,used_at")
            .eq("profile_id", edit)
            .order("issued_at", { ascending: false })
        : { data: null },
      edit
        ? supabase
            .from("dogs")
            .select("id,name,birthday")
            .eq("owner_id", edit)
            .order("created_at")
        : { data: null },
    ]);

  const visitTotalMap = new Map<string, number>();
  const visitTodaySet = new Set<string>();
  for (const v of visitRows ?? []) {
    visitTotalMap.set(v.profile_id, (visitTotalMap.get(v.profile_id) ?? 0) + 1);
    if (v.visited_at >= startOfDay) visitTodaySet.add(v.profile_id);
  }

  const members = (profiles ?? [])
    .map((p) => ({
      ...p,
      visits_count:  visitTotalMap.get(p.id) ?? 0,
      checked_today: visitTodaySet.has(p.id),
    }))
    .sort((a, b) => b.visits_count - a.visits_count);

  return (
    <div className="grid gap-4">

      {/* 회원 추가 */}
      <details className="rounded-2xl border border-dashed border-[var(--brand)]/50 p-4">
        <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">
          <UserPlus className="w-4 h-4" /> 회원 추가
        </summary>
        <form action={addMemberAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="q" value={q ?? ""} />
          <div>
            <label className="label">아이디 *</label>
            <input className="input" name="member_id" placeholder="hong (영문/숫자)" required />
          </div>
          <div>
            <label className="label">이름 *</label>
            <input className="input" name="display_name" placeholder="홍길동" required />
          </div>
          <div>
            <label className="label">전화번호</label>
            <input className="input" name="phone" placeholder="010-0000-0000" />
          </div>
          <div>
            <label className="label">비밀번호 *</label>
            <input className="input" name="password" type="password" placeholder="초기 비밀번호" required />
          </div>
          <button type="submit" className="btn-primary btn-sm sm:col-span-2 justify-self-start">
            추가
          </button>
        </form>
      </details>

      {/* 검색 */}
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="이름 · 전화번호 · 아이디 검색"
          className="input flex-1"
        />
        <button className="btn-primary" type="submit">검색</button>
        {q && <a href="/admin/members" className="btn-outline">전체</a>}
      </form>

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

      <p className="text-xs text-[var(--foreground-mute)]">
        {q ? `"${q}" 검색 결과 ${members.length}명` : `전체 ${members.length}명 · 방문 많은 순`}
      </p>

      <div className="grid gap-3">
        {members.map((m) => {
          const isEditing    = edit === m.id;
          const coupons      = isEditing ? (editCoupons ?? []) : [];
          const dogs         = isEditing ? (editDogs ?? []) : [];
          const validCoupons = coupons.filter((c) => !c.used_at);
          const usedCoupons  = coupons.filter((c) => c.used_at);

          return (
            <div
              key={m.id}
              className={
                "rounded-2xl border p-4 " +
                (isEditing
                  ? "border-[var(--brand)] bg-[var(--brand-soft)]/10"
                  : "border-[var(--line)] bg-white/80")
              }
            >
              {/* 요약 행 */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[var(--brand-strong)]">
                      {m.display_name ?? "이름 없음"}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${roleBadge(m.role ?? "member")}`}>
                      {ROLE_OPTIONS.find((r) => r.value === m.role)?.label ?? m.role}
                    </span>
                    {m.checked_today && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> 오늘 출석
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--foreground-mute)] mt-0.5 space-x-2">
                    <span>{m.phone ?? m.email}</span>
                    <span>누적 {m.visits_count}회</span>
                  </div>
                </div>
                <a
                  href={
                    isEditing
                      ? `/admin/members${q ? `?q=${q}` : ""}`
                      : `/admin/members?${q ? `q=${q}&` : ""}edit=${m.id}`
                  }
                  className="text-xs text-[var(--brand)] font-medium hover:underline shrink-0"
                >
                  {isEditing ? "닫기" : "수정"}
                </a>
              </div>

              {/* 편집 패널 */}
              {isEditing && (
                <div className="mt-5 grid gap-5">

                  {/* 출석 체크 */}
                  <section className="rounded-2xl border border-[var(--line)] p-4">
                    <p className="text-xs font-bold text-[var(--brand-strong)] uppercase tracking-wider mb-3">출석 체크</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm">
                        누적 <b className="text-[var(--brand-strong)]">{m.visits_count}회</b>
                      </span>
                      {m.checked_today ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 오늘 출석 완료
                        </span>
                      ) : (
                        <form action={checkInAction}>
                          <input type="hidden" name="profile_id" value={m.id} />
                          <input type="hidden" name="q" value={q ?? ""} />
                          <button className="btn-primary btn-sm" type="submit">출석 도장 찍기</button>
                        </form>
                      )}
                    </div>
                    {/* 횟수 직접 조정 */}
                    <form action={adjustVisitCountAction} className="mt-3 flex items-center gap-2">
                      <input type="hidden" name="profile_id" value={m.id} />
                      <input type="hidden" name="q" value={q ?? ""} />
                      <input
                        name="count"
                        type="number"
                        min="0"
                        defaultValue={m.visits_count}
                        className="w-20 rounded-xl border border-[var(--ring)] bg-[var(--surface)] px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40"
                      />
                      <span className="text-xs text-[var(--foreground-mute)]">회로 조정</span>
                      <button type="submit" className="btn-outline btn-sm">적용</button>
                    </form>
                  </section>

                  {/* 강아지 관리 */}
                  <section className="rounded-2xl border border-[var(--line)] p-4">
                    <p className="text-xs font-bold text-[var(--brand-strong)] uppercase tracking-wider mb-3">
                      강아지 <span className="font-normal text-[var(--foreground-mute)] normal-case">{dogs.length}마리</span>
                    </p>
                    <div className="grid gap-2">
                      {dogs.map((dog) => (
                        <form key={dog.id} action={updateDogAction} className="flex items-center gap-2 flex-wrap">
                          <input type="hidden" name="dog_id" value={dog.id} />
                          <input type="hidden" name="profile_id" value={m.id} />
                          <input type="hidden" name="q" value={q ?? ""} />
                          <Dog className="w-4 h-4 text-[var(--brand)] shrink-0" />
                          <input
                            name="name"
                            defaultValue={dog.name}
                            required
                            placeholder="이름"
                            className="input !min-h-0 py-1 text-sm w-28"
                          />
                          <input
                            name="birthday"
                            type="date"
                            defaultValue={dog.birthday ?? ""}
                            className="input !min-h-0 py-1 text-sm w-36"
                          />
                          <button type="submit" className="btn-outline btn-sm">저장</button>
                          {/* 삭제 */}
                          <button
                            type="button"
                            formAction={deleteDogAction.bind(null) as never}
                            onClick={async (e) => {
                              const f = new FormData();
                              f.set("dog_id", dog.id);
                              f.set("profile_id", m.id);
                              f.set("q", q ?? "");
                              // handled by separate form below
                            }}
                            className="hidden"
                          />
                        </form>
                      ))}
                      {dogs.map((dog) => (
                        <form key={`del-${dog.id}`} action={deleteDogAction} className="hidden">
                          <input type="hidden" name="dog_id" value={dog.id} />
                          <input type="hidden" name="profile_id" value={m.id} />
                          <input type="hidden" name="q" value={q ?? ""} />
                        </form>
                      ))}
                    </div>
                    {/* 개별 삭제 버튼 (별도 폼) */}
                    <div className="grid gap-2 mt-1">
                      {dogs.map((dog) => (
                        <div key={`row-${dog.id}`} className="flex items-center gap-2">
                          <span className="text-sm text-[var(--brand-strong)] w-28 truncate">{dog.name}</span>
                          <form action={deleteDogAction}>
                            <input type="hidden" name="dog_id" value={dog.id} />
                            <input type="hidden" name="profile_id" value={m.id} />
                            <input type="hidden" name="q" value={q ?? ""} />
                            <button type="submit" className="inline-flex items-center justify-center w-6 h-6 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                    {/* 강아지 추가 */}
                    <details className="mt-3">
                      <summary className="cursor-pointer list-none text-xs text-[var(--brand)] font-semibold flex items-center gap-1">
                        + 강아지 추가
                      </summary>
                      <form action={addDogAction} className="mt-2 grid gap-2">
                        <input type="hidden" name="profile_id" value={m.id} />
                        <input type="hidden" name="q" value={q ?? ""} />
                        <div className="flex gap-2 flex-wrap">
                          <input name="name" required placeholder="이름 *" className="input !min-h-0 py-1.5 text-sm flex-1" />
                          <input name="birthday" type="date" className="input !min-h-0 py-1.5 text-sm" />
                        </div>
                        <button type="submit" className="btn-primary btn-sm justify-self-start">추가</button>
                      </form>
                    </details>
                  </section>

                  {/* 쿠폰 관리 */}
                  <section className="rounded-2xl border border-[var(--line)] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-[var(--brand-strong)] uppercase tracking-wider">
                        쿠폰
                        <span className="ml-2 font-normal text-[var(--foreground-mute)] normal-case">
                          사용가능 {validCoupons.length}장 · 사용됨 {usedCoupons.length}장
                        </span>
                      </p>
                      <form action={issueCouponAction}>
                        <input type="hidden" name="profile_id" value={m.id} />
                        <input type="hidden" name="q" value={q ?? ""} />
                        <button className="btn-outline btn-sm" type="submit">+ 쿠폰 발급</button>
                      </form>
                    </div>
                    {coupons.length === 0 ? (
                      <p className="text-xs text-[var(--foreground-mute)] py-2">보유 쿠폰 없음</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {coupons.map((c) => (
                          <li
                            key={c.id}
                            className={
                              "flex items-center gap-3 rounded-xl px-3 py-2 " +
                              (c.used_at ? "opacity-50 bg-[var(--surface-2)]" : "bg-[var(--accent-soft)]")
                            }
                          >
                            <Ticket className="w-4 h-4 shrink-0 text-[var(--accent)]" />
                            <div className="flex-1 min-w-0 text-sm">
                              <div className="font-medium text-[var(--brand-strong)] truncate">{c.title}</div>
                              <div className="text-xs text-[var(--foreground-mute)]">
                                {c.used_at
                                  ? `사용됨 ${new Date(c.used_at).toLocaleDateString()}`
                                  : c.expires_at
                                    ? `~ ${new Date(c.expires_at).toLocaleDateString()}`
                                    : "기한 없음"}
                              </div>
                            </div>
                            <form action={deleteCouponAction}>
                              <input type="hidden" name="coupon_id" value={c.id} />
                              <input type="hidden" name="profile_id" value={m.id} />
                              <input type="hidden" name="q" value={q ?? ""} />
                              <button type="submit" title="쿠폰 삭제" className="inline-flex items-center justify-center w-6 h-6 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  {/* 기본 정보 + 권한 */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <form action={updateMemberProfileAction} className="rounded-2xl border border-[var(--line)] p-4 grid gap-3">
                      <p className="text-xs font-bold text-[var(--brand-strong)] uppercase tracking-wider">기본 정보</p>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="q" value={q ?? ""} />
                      <div>
                        <label className="label">이름</label>
                        <input className="input" name="display_name" defaultValue={m.display_name ?? ""} required />
                      </div>
                      <div>
                        <label className="label">전화번호</label>
                        <input className="input" name="phone" defaultValue={m.phone ?? ""} placeholder="010-0000-0000" />
                      </div>
                      <button type="submit" className="btn-primary btn-sm justify-self-start">저장</button>
                    </form>

                    <form action={updateMemberRoleAction} className="rounded-2xl border border-[var(--line)] p-4 grid gap-3">
                      <p className="text-xs font-bold text-[var(--brand-strong)] uppercase tracking-wider">권한</p>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="q" value={q ?? ""} />
                      <div>
                        <label className="label">역할</label>
                        <select className="input" name="role" defaultValue={m.role ?? "member"}>
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[11px] text-[var(--foreground-mute)]">
                        manager: 회원·트레킹 접근<br />admin: 전체 접근
                      </p>
                      <button type="submit" className="btn-outline btn-sm justify-self-start">권한 변경</button>
                    </form>
                  </div>

                  {/* 회원 삭제 */}
                  <form action={deleteMemberAction} className="flex justify-end">
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="q" value={q ?? ""} />
                    <button
                      type="submit"
                      className="text-xs text-red-500 hover:text-red-700 hover:underline"
                      onClick={(e) => {
                        // client-side confirm handled via DeleteMemberButton if needed
                      }}
                    >
                      회원 탈퇴 처리
                    </button>
                  </form>

                </div>
              )}
            </div>
          );
        })}

        {members.length === 0 && (
          <p className="text-center opacity-60 text-sm py-8">결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
