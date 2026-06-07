import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Stamp, Dog, Gift, ChevronRight, Pencil } from "lucide-react";

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="section py-20 text-center">
        <p className="text-[var(--foreground-soft)]">로그인이 필요합니다.</p>
        <Link href="/login" className="btn-primary mt-4 inline-flex">로그인</Link>
      </div>
    );
  }

  const [{ data: profile }, { data: dogs }, { count: visitCount }] = await Promise.all([
    supabase.from("profiles").select("display_name,phone,email,role").eq("id", user.id).maybeSingle(),
    supabase.from("dogs").select("id,name,birthday,photo_url,breed,weight,gender").eq("owner_id", user.id),
    supabase.from("visits").select("id", { count: "exact", head: true }).eq("profile_id", user.id),
  ]);

  const visits = visitCount ?? 0;

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
      </div>

      {/* 출석 도장 카드 */}
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
              <span className="text-4xl font-bold text-[var(--brand-strong)]">{visits}</span>
              <span className="text-[var(--foreground-mute)] text-sm">회</span>
            </div>
            <p className="mt-1 text-xs text-[var(--foreground-soft)]">
              이달 방문 횟수 · 월 1위 5만원권 / 2위 3만원권 / 3위 1만원권
            </p>
            <Link
              href="/ranking"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand)] hover:opacity-70"
            >
              랭킹 보러가기 <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <Gift className="w-7 h-7 text-[var(--accent)]" />
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
            <p className="mt-3 text-sm text-[var(--foreground-soft)]">아직 등록된 강아지가 없어요.</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory">
            {(dogs ?? []).map((d) => (
              <div key={d.id} className="card shrink-0 w-44 snap-start relative">
                {/* 수정 버튼 */}
                <Link
                  href={`/mypage/dogs/${d.id}/edit`}
                  className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-white/80 flex items-center justify-center text-[var(--foreground-mute)] hover:text-[var(--brand)]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Link>

                <div className="aspect-square -mx-2 -mt-2 rounded-2xl overflow-hidden bg-[var(--surface-2)] flex items-center justify-center mb-3">
                  {d.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.photo_url} alt={d.name} className="w-full h-full object-cover" />
                  ) : (
                    <Dog className="w-10 h-10 text-[var(--foreground-mute)]" />
                  )}
                </div>
                <div className="font-semibold text-[var(--brand-strong)] truncate">{d.name}</div>
                {(d.gender || d.breed) && (
                  <div className="text-[11px] text-[var(--foreground-mute)] mt-0.5 truncate">
                    {[d.gender, d.breed].filter(Boolean).join(" · ")}
                  </div>
                )}
                <div className="text-[11px] text-[var(--foreground-mute)] mt-0.5">
                  {d.weight ? `${d.weight}kg` : ""}
                  {d.weight && d.birthday ? " · " : ""}
                  {d.birthday ? `${d.birthday} 생` : (!d.weight ? "생일 미등록" : "")}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
