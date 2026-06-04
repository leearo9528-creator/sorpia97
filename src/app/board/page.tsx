import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toggleLikeAction } from "./actions";
import { Heart, Pencil, PawPrint, ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  return new Date(iso).toLocaleDateString();
}

export default async function BoardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("board_posts")
    .select(
      "id,content,photo_url,created_at,profile_id,profiles(display_name),board_likes(profile_id)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="section py-5 md:py-10 space-y-5 pb-24">
      <header className="flex items-end justify-between">
        <div>
          <span className="eyebrow">Footprints</span>
          <h1 className="mt-2 h-display">발자국</h1>
          <p className="mt-2 text-sm text-[var(--foreground-soft)]">
            소르피아 다녀온 흔적을 남겨주세요 🐾
          </p>
        </div>
        {user ? (
          <Link href="/board/new" className="btn-primary btn-sm">
            <Pencil className="w-4 h-4" />
            글쓰기
          </Link>
        ) : (
          <Link href="/login?next=/board" className="btn-outline btn-sm">
            로그인
          </Link>
        )}
      </header>

      {(posts ?? []).length === 0 ? (
        <div className="card-flat text-center py-12">
          <PawPrint className="w-8 h-8 mx-auto text-[var(--foreground-mute)]" />
          <p className="mt-3 text-sm text-[var(--foreground-soft)]">
            아직 첫 발자국이 없어요. 첫 번째가 되어보세요!
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {(posts ?? []).map((p) => {
            const author = (p as unknown as { profiles: { display_name: string } | null })
              .profiles;
            const likes = (p as unknown as { board_likes: { profile_id: string }[] })
              .board_likes ?? [];
            const liked = user ? likes.some((l) => l.profile_id === user.id) : false;

            return (
              <li key={p.id} className="card !p-0 overflow-hidden">
                {/* Author header */}
                <div className="flex items-center gap-3 px-4 pt-4">
                  <div className="w-9 h-9 rounded-full bg-[var(--brand)] text-white inline-flex items-center justify-center text-xs font-bold">
                    {(author?.display_name ?? "?").slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[var(--brand-strong)] truncate">
                      {author?.display_name ?? "알 수 없음"}
                    </div>
                    <div className="text-[11px] text-[var(--foreground-mute)]">
                      {timeAgo(p.created_at)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="px-4 pt-3 text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                  {p.content}
                </p>

                {/* Photo */}
                {p.photo_url ? (
                  <div className="mt-3 mx-4 rounded-2xl overflow-hidden bg-[var(--surface-2)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.photo_url}
                      alt="발자국 사진"
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                ) : null}

                {/* Actions */}
                <div className="px-4 py-3 mt-2 flex items-center gap-4 border-t border-[var(--line)]">
                  <form action={toggleLikeAction}>
                    <input type="hidden" name="post_id" value={p.id} />
                    <button
                      type="submit"
                      disabled={!user}
                      className={
                        "inline-flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-60 " +
                        (liked
                          ? "text-[var(--accent-deep)]"
                          : "text-[var(--foreground-soft)] hover:text-[var(--brand-strong)]")
                      }
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={liked ? "currentColor" : "none"}
                      />
                      {likes.length}
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* FAB - 모바일에서 글쓰기 빠르게 */}
      {user && (
        <Link
          href="/board/new"
          className="md:hidden fixed right-5 bottom-24 z-30 w-14 h-14 rounded-full bg-[var(--brand)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--brand-strong)]"
          aria-label="글쓰기"
        >
          <Pencil className="w-5 h-5" />
        </Link>
      )}
    </div>
  );
}
