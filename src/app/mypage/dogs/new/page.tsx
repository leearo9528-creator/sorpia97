import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { addDogAction } from "./actions";
import { AlertCircle, Dog, ArrowLeft } from "lucide-react";

export default async function AddDogPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await searchParams;

  return (
    <div className="section py-8 md:py-12">
      <div className="max-w-md mx-auto">
        <Link href="/mypage" className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-mute)] mb-6 hover:text-[var(--brand)]">
          <ArrowLeft className="w-4 h-4" /> 마이페이지로
        </Link>

        <div className="flex items-center gap-2 text-[var(--brand-strong)] font-semibold mb-1">
          <Dog className="w-5 h-5" />
          <h1 className="h-display">강아지 등록</h1>
        </div>
        <p className="text-sm text-[var(--foreground-soft)] mb-8">
          함께 방문하는 강아지를 추가해 주세요.
        </p>

        {error && (
          <div className="mb-6 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={addDogAction} encType="multipart/form-data" className="space-y-5">
          <div>
            <label className="label">이름 <span className="text-red-500">*</span></label>
            <input className="input" name="dog_name" required />
          </div>
          <div>
            <label className="label">생년월일 (선택)</label>
            <input className="input" type="date" name="dog_birthday" />
          </div>
          <div>
            <label className="label">사진 (선택)</label>
            <input
              className="input file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand)] file:text-white file:px-3 file:py-1.5 file:text-xs file:font-semibold cursor-pointer"
              type="file"
              name="dog_photo"
              accept="image/*"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}
