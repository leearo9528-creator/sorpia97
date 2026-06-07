import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateDogAction, deleteDogAction } from "./actions";
import { AlertCircle, Dog, ArrowLeft, Trash2 } from "lucide-react";

export default async function EditDogPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dog } = await supabase
    .from("dogs")
    .select("id,name,birthday,breed,weight,gender,photo_url")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!dog) redirect("/mypage");

  return (
    <div className="section py-8 md:py-12">
      <div className="max-w-md mx-auto">
        <Link href="/mypage" className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-mute)] mb-6 hover:text-[var(--brand)]">
          <ArrowLeft className="w-4 h-4" /> 마이페이지로
        </Link>

        <div className="flex items-center gap-2 text-[var(--brand-strong)] font-semibold mb-1">
          <Dog className="w-5 h-5" />
          <h1 className="h-display">강아지 정보 수정</h1>
        </div>
        <p className="text-sm text-[var(--foreground-soft)] mb-8">
          {dog.name}의 정보를 수정해요.
        </p>

        {error && (
          <div className="mb-6 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={updateDogAction} encType="multipart/form-data" className="space-y-5">
          <input type="hidden" name="dog_id" value={dog.id} />

          <div>
            <label className="label">이름 <span className="text-red-500">*</span></label>
            <input className="input" name="dog_name" defaultValue={dog.name} required />
          </div>

          <div>
            <label className="label">성별</label>
            <div className="flex gap-4 mt-2">
              {["공주님", "왕자님"].map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="dog_gender" value={g}
                    defaultChecked={dog.gender === g}
                    className="accent-[var(--brand)]" />
                  <span className="text-sm">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">견종 (선택)</label>
            <input className="input" name="dog_breed" defaultValue={dog.breed ?? ""} placeholder="예: 말티즈, 포메라니안" />
          </div>

          <div>
            <label className="label">몸무게 (선택)</label>
            <div className="relative">
              <input className="input pr-8" type="number" step="0.1" min="0" name="dog_weight"
                defaultValue={dog.weight ?? ""} placeholder="0.0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--foreground-mute)]">kg</span>
            </div>
          </div>

          <div>
            <label className="label">생년월일 (선택)</label>
            <input className="input" type="date" name="dog_birthday" defaultValue={dog.birthday ?? ""} />
          </div>

          <div>
            <label className="label">사진 (선택)</label>
            {dog.photo_url && (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden mb-2">
                <Image src={dog.photo_url} alt={dog.name} fill sizes="96px" className="object-cover" />
              </div>
            )}
            <input
              className="input file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand)] file:text-white file:px-3 file:py-1.5 file:text-xs file:font-semibold cursor-pointer"
              type="file" name="dog_photo" accept="image/*"
            />
          </div>

          <button type="submit" className="btn-primary w-full">저장하기</button>
        </form>

        {/* 삭제 */}
        <div className="mt-8 pt-6 border-t border-[var(--line)]">
          <form action={deleteDogAction}>
            <input type="hidden" name="dog_id" value={dog.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" /> {dog.name} 삭제
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
