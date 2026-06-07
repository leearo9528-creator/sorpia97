import { createClient } from "@/lib/supabase/server";
import { updateMemberRoleAction, updateMemberProfileAction } from "./actions";

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

  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user!.id).maybeSingle();
  if (me?.role !== "admin") {
    return <p className="py-10 text-center opacity-60 text-sm">이 메뉴는 최고 관리자만 이용할 수 있습니다.</p>;
  }

  let query = supabase
    .from("profiles")
    .select("id,email,display_name,phone,role,created_at,dogs(id,name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) {
    query = query.or(`display_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: members } = await query;

  return (
    <div>
      {message && (
        <p className="mb-4 text-sm rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2">
          {decodeURIComponent(message)}
        </p>
      )}
      {error && (
        <p className="mb-4 text-sm rounded-xl bg-red-50 border border-red-200 px-3 py-2">
          {decodeURIComponent(error)}
        </p>
      )}

      <form className="flex gap-2 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="이름, 아이디, 전화번호로 검색"
          className="input flex-1"
        />
        <button className="btn-primary" type="submit">검색</button>
      </form>

      <div className="grid gap-3">
        {(members ?? []).map((m) => {
          const dogs = (m as unknown as { dogs: { name: string }[] }).dogs ?? [];
          const isEditing = edit === m.id;

          return (
            <div
              key={m.id}
              className={
                "rounded-2xl border p-4 " +
                (isEditing ? "border-[var(--brand)] bg-[var(--brand-soft)]/20" : "border-[var(--line)] bg-white/80")
              }
            >
              {/* 기본 정보 행 */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[var(--brand-strong)]">{m.display_name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${roleBadge(m.role ?? "member")}`}>
                      {ROLE_OPTIONS.find((r) => r.value === m.role)?.label ?? m.role}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--foreground-mute)] mt-0.5 space-x-2">
                    <span>{m.email}</span>
                    {m.phone && <span>{m.phone}</span>}
                    {dogs.length > 0 && <span>🐾 {dogs.map((d) => d.name).join(", ")}</span>}
                    <span>{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* 편집 열기/닫기 링크 */}
                <a
                  href={isEditing ? `/admin/members${q ? `?q=${q}` : ""}` : `/admin/members?${q ? `q=${q}&` : ""}edit=${m.id}`}
                  className="text-xs text-[var(--brand)] font-medium hover:underline shrink-0"
                >
                  {isEditing ? "닫기" : "수정"}
                </a>
              </div>

              {/* 편집 패널 */}
              {isEditing && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {/* 프로필 수정 */}
                  <form action={updateMemberProfileAction} className="card !p-4 grid gap-3">
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

                  {/* 권한 변경 */}
                  <form action={updateMemberRoleAction} className="card !p-4 grid gap-3">
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
                      manager: 출석·공지·대관·트레킹 접근<br />
                      admin: 전체 접근
                    </p>
                    <button type="submit" className="btn-outline btn-sm justify-self-start">권한 변경</button>
                  </form>
                </div>
              )}
            </div>
          );
        })}

        {(members ?? []).length === 0 && (
          <p className="text-center opacity-60 text-sm py-8">결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
