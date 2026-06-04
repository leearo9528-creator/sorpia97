import { createClient } from "@/lib/supabase/server";
import { Trash2, Pin } from "lucide-react";
import { createAnnouncementAction, deleteAnnouncementAction } from "./actions";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { value: "general", label: "일반" },
  { value: "notice", label: "안내" },
  { value: "event", label: "이벤트" },
  { value: "closure", label: "휴무" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function AnnouncementsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("id,title,body,category,pinned,created_at")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-8">
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

      {/* 새 공지 작성 폼 */}
      <form action={createAnnouncementAction} className="card grid gap-4">
        <h2 className="font-semibold text-[var(--brand-strong)]">새 공지사항 등록</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">제목</label>
            <input className="input" name="title" placeholder="공지 제목" required />
          </div>
          <div>
            <label className="label">카테고리</label>
            <select className="input" name="category">
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">내용</label>
          <textarea className="input min-h-[120px]" name="body" placeholder="공지 내용을 입력하세요." required />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pinned"
            name="pinned"
            className="w-4 h-4 rounded accent-[var(--brand)]"
          />
          <label htmlFor="pinned" className="text-sm text-[var(--foreground-soft)] flex items-center gap-1">
            <Pin className="w-3.5 h-3.5" />
            상단 고정
          </label>
        </div>

        <button className="btn-primary justify-self-start">등록</button>
      </form>

      {/* 기존 공지 목록 */}
      <div className="grid gap-3">
        <h2 className="font-semibold text-[var(--brand-strong)]">
          등록된 공지사항 ({(announcements ?? []).length}건)
        </h2>
        {(announcements ?? []).length === 0 ? (
          <p className="text-sm text-[var(--foreground-mute)] py-4 text-center">
            등록된 공지사항이 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {(announcements ?? []).map((a) => (
              <li
                key={a.id}
                className={
                  "row flex-wrap gap-y-2" +
                  (a.pinned ? " border-[var(--brand)]" : "")
                }
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {a.pinned && <Pin className="w-3.5 h-3.5 text-[var(--brand)] shrink-0" />}
                  <span className="text-[11px] text-[var(--foreground-mute)] shrink-0">
                    {formatDate(a.created_at)}
                  </span>
                  <span className="chip text-[11px] shrink-0">
                    {CATEGORIES.find((c) => c.value === a.category)?.label ?? a.category}
                  </span>
                  <span className="font-medium text-sm truncate">{a.title}</span>
                </div>
                <form action={deleteAnnouncementAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    삭제
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
