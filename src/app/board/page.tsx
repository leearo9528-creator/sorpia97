import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { toggleLikeAction } from "./actions";
import { Heart, Pencil, PawPrint } from "lucide-react";

export const dynamic = "force-dynamic";

type BoardPost = {
  id: string;
  profile_id: string;
  content: string;
  photo_url: string | null;
  created_at: string;
  author_name: string;
  like_count: number;
};

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
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase.rpc("get_board_posts", { p_limit: 50 });
  const posts: BoardPost[] = (data ?? []) as BoardPost[];

  // 본인이 좋아요 누른 글만 별도 조회 (RLS 통과)
  let likedIds = new Set<string>();
  if (user && posts.length > 0) {
    const { data: myLikes } = await supabase
      .from("board_likes")
      .select("post_id")
      .eq("profile_id", user.id)
      .in("post_id", posts.map((p) => p.id));
    likedIds = new Set((myLikes ?? []).map((l) => l.post_id));
  }

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

      {posts.length === 0 ? (
        <div className="card-flat text-center py-12">
          <PawPrint className="w-8 h-8 mx-auto text-[var(--foreground-mute)]" />
          <p className="mt-3 text-sm text-[var(--foreground-soft)]">
            아직 첫 발자국이 없어요. 첫 번째가 되어보세요!
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => {
            const liked = likedIds.has(p.id);
            return (
              <li key={p.id} className="card !p-0 overflow-hidden">
                <div className="flex items-center gap-3 px-4 pt-4">
                  <div className="w-9 h-9 rounded-full bg-[var(--brand)] text-white inline-flex items-center justify-center text-xs font-bold">
                    {(p.author_name ?? "?").slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[var(--brand-strong)] truncate">
                      {p.author_name}
                    </div>
                    <div className="text-[11px] text-[var(--foreground-mute)]">
                      {timeAgo(p.created_at)}
                    </div>
                  </div>
                </div>

                <p className="px-4 pt-3 text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                  {p.content}
                </p>

                {p.photo_url && (
                  <div className="relative mt-3 mx-4 rounded-2xl overflow-hidden bg-[var(--surface-2)] aspect-square">
                    <Image src={p.photo_url} alt="발자국 사진" fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
                  </div>
                )}

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
                      <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
                      {p.like_count}
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

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
