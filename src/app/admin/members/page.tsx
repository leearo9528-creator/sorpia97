import { createClient } from "@/lib/supabase/server";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user!.id).maybeSingle();
  if (me?.role !== "admin") {
    return <p className="py-10 text-center opacity-60 text-sm">이 메뉴는 최고 관리자만 이용할 수 있습니다.</p>;
  }

  let query = supabase
    .from("profiles")
    .select("id,email,display_name,phone,role,created_at,dogs(id,name,birthday,photo_url)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) {
    query = query.or(`display_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: members } = await query;

  return (
    <div>
      <form className="flex gap-2 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="이름, 이메일, 전화번호로 검색"
          className="input flex-1"
        />
        <button className="btn-primary" type="submit">검색</button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-[var(--ring)]/60 bg-white/80">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--muted)]/60 text-left">
            <tr>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3">전화</th>
              <th className="px-4 py-3">강아지</th>
              <th className="px-4 py-3">권한</th>
              <th className="px-4 py-3">가입일</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((m) => {
              const dogs = (m as unknown as { dogs: { name: string }[] }).dogs ?? [];
              return (
                <tr key={m.id} className="border-t border-[var(--ring)]/40">
                  <td className="px-4 py-2 font-medium">{m.display_name}</td>
                  <td className="px-4 py-2 opacity-80">{m.email}</td>
                  <td className="px-4 py-2 opacity-80">{m.phone ?? "-"}</td>
                  <td className="px-4 py-2">
                    {dogs.length ? dogs.map((d) => d.name).join(", ") : "-"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs " +
                        (m.role === "admin"
                          ? "bg-[var(--accent)] text-white"
                          : m.role === "manager"
                          ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                          : "bg-[var(--muted)]")
                      }
                    >
                      {m.role === "admin" ? "관리자" : m.role === "manager" ? "매니저" : "회원"}
                    </span>
                  </td>
                  <td className="px-4 py-2 opacity-80">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
            {(members ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center opacity-60">
                  결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
