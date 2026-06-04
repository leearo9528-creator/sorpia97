import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPostAction } from "../actions";
import { AlertCircle, ImageUp, X } from "lucide-react";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/board/new");

  return (
    <div className="section py-5 md:py-10">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/board"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--surface-2)]"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-[var(--brand-strong)]">발자국 남기기</h1>
        <div className="w-10" />
      </div>

      <form
        action={createPostAction}
        encType="multipart/form-data"
        className="space-y-4"
      >
        <textarea
          name="content"
          className="textarea"
          placeholder="오늘 소르피아 어땠나요? 우리 강아지 사진이나 추억을 남겨주세요."
          required
        />

        <label className="block">
          <span className="label">사진 (선택)</span>
          <div className="rounded-2xl border-2 border-dashed border-[var(--ring)] p-6 text-center cursor-pointer hover:bg-[var(--surface-2)]/50">
            <ImageUp className="w-6 h-6 mx-auto text-[var(--brand)]" />
            <div className="mt-2 text-xs text-[var(--foreground-mute)]">
              눌러서 사진 첨부
            </div>
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="sr-only"
            />
          </div>
        </label>

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {decodeURIComponent(error)}
          </div>
        )}

        <button type="submit" className="btn-primary w-full">
          올리기
        </button>
      </form>
    </div>
  );
}
