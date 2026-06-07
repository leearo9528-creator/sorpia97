import { createClient } from "@/lib/supabase/server";
import { uploadSitePhotoAction, deleteSitePhotoAction } from "./actions";
import { ImageIcon, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

const SLOTS = [
  { key: "homepage_main", label: "홈 메인 사진", hint: "카페 전경 · 16:10 비율 권장" },
];

export default async function AdminSitePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase
    .from("profiles").select("role").eq("id", user!.id).maybeSingle();

  if (me?.role !== "admin") {
    return <p className="py-10 text-center opacity-60 text-sm">최고 관리자만 이용할 수 있습니다.</p>;
  }

  const { data: settings } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", SLOTS.map((s) => s.key));

  const sMap = new Map((settings ?? []).map((s: { key: string; value: string }) => [s.key, s.value]));

  return (
    <div className="grid gap-8 max-w-xl">
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

      {SLOTS.map((slot) => {
        const current = sMap.get(slot.key);
        return (
          <div key={slot.key} className="rounded-2xl border border-[var(--line)] p-5 grid gap-4">
            <div>
              <p className="font-semibold text-[var(--brand-strong)]">{slot.label}</p>
              <p className="text-xs text-[var(--foreground-mute)] mt-0.5">{slot.hint}</p>
            </div>

            {/* 현재 사진 */}
            {current ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current}
                  alt={slot.label}
                  className="w-full aspect-[16/10] object-cover rounded-2xl"
                />
                <form action={deleteSitePhotoAction} className="absolute top-2 right-2">
                  <input type="hidden" name="key" value={slot.key} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-xl bg-white/90 px-2 py-1 text-xs text-red-500 hover:bg-red-50 shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" /> 삭제
                  </button>
                </form>
              </div>
            ) : (
              <div className="w-full aspect-[16/10] rounded-2xl bg-[var(--surface-2)] border border-dashed border-[var(--ring)] flex flex-col items-center justify-center gap-2 text-[var(--foreground-mute)]">
                <ImageIcon className="w-8 h-8 opacity-40" strokeWidth={1.5} />
                <span className="text-xs">사진 없음</span>
              </div>
            )}

            {/* 업로드 폼 */}
            <form action={uploadSitePhotoAction} encType="multipart/form-data" className="flex items-center gap-3 flex-wrap">
              <input type="hidden" name="key" value={slot.key} />
              <input
                type="file"
                name="photo"
                accept="image/*"
                required
                className="input file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand)] file:text-white file:px-3 file:py-1 file:text-xs file:font-semibold cursor-pointer flex-1"
              />
              <button type="submit" className="btn-primary btn-sm shrink-0">
                {current ? "교체" : "업로드"}
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
