import { createClient } from "@/lib/supabase/server";
import { Megaphone, Pin } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  general: "일반",
  event: "이벤트",
  notice: "안내",
  closure: "휴무",
};

const CATEGORY_CLASS: Record<string, string> = {
  general: "chip",
  event: "chip-accent",
  notice: "chip",
  closure: "bg-red-100 text-red-700 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("id,title,body,category,pinned,created_at")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  const list = announcements ?? [];

  return (
    <div className="section py-5 md:py-10 space-y-5 pb-24">
      <header>
        <span className="eyebrow">Announcements</span>
        <h1 className="mt-2 h-display">공지사항</h1>
        <p className="mt-2 text-sm text-[var(--foreground-soft)]">
          소르피아의 새로운 소식을 확인하세요.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="card-flat text-center py-12">
          <Megaphone className="w-8 h-8 mx-auto text-[var(--foreground-mute)]" />
          <p className="mt-3 text-sm text-[var(--foreground-soft)]">
            등록된 공지사항이 없습니다.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li
              key={a.id}
              className={
                "card space-y-2" +
                (a.pinned ? " border-[var(--brand)] border-2" : "")
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {a.pinned && (
                    <Pin className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />
                  )}
                  <span className={CATEGORY_CLASS[a.category] ?? "chip"}>
                    {CATEGORY_LABEL[a.category] ?? a.category}
                  </span>
                  <h2 className="font-semibold text-[var(--foreground)] text-[15px]">
                    {a.title}
                  </h2>
                </div>
                <time className="text-[11px] text-[var(--foreground-mute)] shrink-0 mt-0.5">
                  {formatDate(a.created_at)}
                </time>
              </div>
              <p className="text-sm text-[var(--foreground-soft)] whitespace-pre-wrap leading-relaxed">
                {a.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
