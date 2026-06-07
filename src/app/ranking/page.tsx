import { createClient } from "@/lib/supabase/server";
import { Trophy, Medal, Award, Crown } from "lucide-react";

export const dynamic = "force-dynamic";

const PRIZES = [
  { rank: 1, label: "1등", prize: 50000, Icon: Crown,  color: "text-[#d4a017]" },
  { rank: 2, label: "2등", prize: 30000, Icon: Medal,  color: "text-[#9aa1a8]" },
  { rank: 3, label: "3등", prize: 10000, Icon: Award,  color: "text-[#cd7f32]" },
];

export default async function RankingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: rows } = await supabase.rpc("get_monthly_ranking", {
    p_year: year,
    p_month: month,
  });

  const sorted = (rows ?? []) as { profile_id: string; display_name: string; visit_count: number }[];

  const myEntry = user ? sorted.find((s) => s.profile_id === user.id) ?? null : null;
  const myRank  = myEntry ? sorted.indexOf(myEntry) + 1 : null;

  const monthLabel = `${year}년 ${month}월`;

  return (
    <div className="section py-5 md:py-10 space-y-6 pb-24">
      <header>
        <span className="eyebrow">Ranking</span>
        <h1 className="mt-2 h-display flex items-center gap-2">
          <Trophy className="w-7 h-7 text-[var(--accent-deep)]" />
          {monthLabel} 랭킹
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-soft)]">
          매달 1일 출석 횟수 기준 TOP 3에게 상금을 드려요.
        </p>
      </header>

      {/* 상금 카드 */}
      <section className="grid grid-cols-3 gap-2">
        {PRIZES.map(({ rank, label, prize, Icon, color }) => (
          <div key={rank} className="card text-center !p-4">
            <Icon className={`w-7 h-7 mx-auto ${color}`} />
            <div className="mt-2 text-xs font-semibold text-[var(--foreground-mute)]">
              {label}
            </div>
            <div className="mt-0.5 font-bold text-[var(--brand-strong)]">
              {prize.toLocaleString()}원
            </div>
          </div>
        ))}
      </section>

      {/* 내 순위 */}
      {user && (
        <section className="card-flat flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--foreground-mute)]">내 순위</div>
            <div className="mt-1 text-2xl font-bold text-[var(--brand-strong)]">
              {myRank ? `${myRank}위` : "기록 없음"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[var(--foreground-mute)]">이번 달 출석</div>
            <div className="mt-1 text-2xl font-bold text-[var(--brand-strong)]">
              {myEntry?.visit_count ?? 0}회
            </div>
          </div>
        </section>
      )}

      {/* 순위 리스트 */}
      <section>
        <h2 className="h-section mb-3">TOP 50</h2>
        {sorted.length === 0 ? (
          <div className="card-flat text-center py-10 text-sm text-[var(--foreground-soft)]">
            아직 이번 달 출석 기록이 없어요.
          </div>
        ) : (
          <ol className="card !p-0 divide-y divide-[var(--line)]">
            {sorted.map((s, i) => {
              const rank  = i + 1;
              const isMe  = user?.id === s.profile_id;
              return (
                <li
                  key={s.profile_id}
                  className={
                    "flex items-center gap-3 px-4 py-3 " +
                    (isMe ? "bg-[var(--brand-soft)]/40" : "")
                  }
                >
                  <div
                    className={
                      "shrink-0 w-9 h-9 rounded-full inline-flex items-center justify-center font-bold text-sm " +
                      (rank === 1
                        ? "bg-[#fff5d4] text-[#d4a017]"
                        : rank === 2
                          ? "bg-[#f0f1f3] text-[#6a7079]"
                          : rank === 3
                            ? "bg-[#fde9d4] text-[#cd7f32]"
                            : "bg-[var(--surface-2)] text-[var(--foreground-mute)]")
                    }
                  >
                    {rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[var(--brand-strong)] truncate">
                      {s.display_name}
                      {isMe && <span className="ml-2 text-[10px] chip">나</span>}
                    </div>
                  </div>
                  <div className="font-bold text-[var(--brand-strong)]">
                    {s.visit_count}회
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <p className="text-xs text-[var(--foreground-mute)] text-center">
        * 매월 1일 00:00 에 초기화 · 출석은 보호자 1인당 1일 1회 카운트
      </p>
    </div>
  );
}
