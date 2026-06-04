import { createClient } from "@/lib/supabase/server";
import { Dog, PawPrint } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NowPage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 오늘 출석한 보호자 id 모으기
  const { data: visits } = await supabase
    .from("visits")
    .select("profile_id")
    .gte("visited_at", todayStart.toISOString());

  const profileIds = Array.from(new Set((visits ?? []).map((v) => v.profile_id)));

  // 그 보호자들의 강아지 조회
  let dogs: { id: string; name: string; photo_url: string | null }[] = [];
  if (profileIds.length > 0) {
    const { data } = await supabase
      .from("dogs")
      .select("id,name,photo_url")
      .in("owner_id", profileIds);
    dogs = data ?? [];
  }

  return (
    <div className="section py-5 md:py-10 space-y-5 pb-24">
      <header>
        <span className="eyebrow">Right now</span>
        <h1 className="mt-2 h-display flex items-center gap-2">
          <PawPrint className="w-7 h-7 text-[var(--brand)]" />
          오늘의 소르피아
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-soft)]">
          오늘 다녀간 강아지들 · 총 <b className="text-[var(--brand-strong)]">{dogs.length}</b>마리
        </p>
      </header>

      {dogs.length === 0 ? (
        <div className="card-flat text-center py-12">
          <Dog className="w-10 h-10 mx-auto text-[var(--foreground-mute)]" />
          <p className="mt-3 text-sm text-[var(--foreground-soft)]">
            아직 오늘 첫 손님을 기다리고 있어요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {dogs.map((d) => (
            <div key={d.id} className="card !p-2">
              <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--surface-2)] flex items-center justify-center">
                {d.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.photo_url}
                    alt={d.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Dog className="w-7 h-7 text-[var(--foreground-mute)]" />
                )}
              </div>
              <div className="mt-2 text-xs font-semibold text-[var(--brand-strong)] truncate text-center">
                {d.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--foreground-mute)] text-center">
        * 출석 도장이 찍힌 회원의 강아지만 표시됩니다.
      </p>
    </div>
  );
}
