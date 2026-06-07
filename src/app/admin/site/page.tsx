import { createClient } from "@/lib/supabase/server";
import { uploadSitePhotoAction, deleteSitePhotoAction } from "./actions";
import { ImageIcon, Trash2, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

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

  const { data: photos } = await supabase
    .from("site_photos")
    .select("id,slot,url,sort_order")
    .in("slot", ["homepage", "map_layout"])
    .order("sort_order");

  const homePhotos = (photos ?? []).filter((p: { slot: string }) => p.slot === "homepage");
  const layoutPhotos = (photos ?? []).filter((p: { slot: string }) => p.slot === "map_layout");

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

      <div className="rounded-2xl border border-[var(--line)] p-5 grid gap-4">
        <div>
          <p className="font-semibold text-[var(--brand-strong)]">홈 슬라이드 사진</p>
          <p className="text-xs text-[var(--foreground-mute)] mt-0.5">
            여러 장 등록 가능 · 등록 순서대로 슬라이드 · 16:10 비율 권장
          </p>
        </div>

        {/* 현재 사진 목록 */}
        {homePhotos.length === 0 ? (
          <div className="w-full aspect-[16/10] rounded-2xl bg-[var(--surface-2)] border border-dashed border-[var(--ring)] flex flex-col items-center justify-center gap-2 text-[var(--foreground-mute)]">
            <ImageIcon className="w-8 h-8 opacity-40" strokeWidth={1.5} />
            <span className="text-xs">사진 없음</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {homePhotos.map((photo, idx) => (
              <div key={photo.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`홈 사진 ${idx + 1}`}
                  className="w-full aspect-[4/3] object-cover rounded-xl"
                />
                <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] rounded-lg px-1.5 py-0.5">
                  {idx + 1}
                </div>
                <form action={deleteSitePhotoAction} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="id" value={photo.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-white/90 text-red-500 hover:bg-red-50 shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {/* 업로드 폼 */}
        <form action={uploadSitePhotoAction} encType="multipart/form-data"
          className="flex items-center gap-3 flex-wrap border-t border-[var(--line)]/60 pt-3">
          <input type="hidden" name="slot" value="homepage" />
          <input
            type="file"
            name="photo"
            accept="image/*"
            required
            className="input file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand)] file:text-white file:px-3 file:py-1 file:text-xs file:font-semibold cursor-pointer flex-1"
          />
          <button type="submit" className="btn-primary btn-sm shrink-0 inline-flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> 사진 추가
          </button>
        </form>
      </div>

      {/* 배치도 */}
      <div className="rounded-2xl border border-[var(--line)] p-5 grid gap-4">
        <div>
          <p className="font-semibold text-[var(--brand-strong)]">소르피아 배치도</p>
          <p className="text-xs text-[var(--foreground-mute)] mt-0.5">
            홈 하단에 표시 · 1장만 사용 · 업로드 시 자동 교체
          </p>
        </div>

        {layoutPhotos.length === 0 ? (
          <div className="w-full aspect-[4/3] rounded-2xl bg-[var(--surface-2)] border border-dashed border-[var(--ring)] flex flex-col items-center justify-center gap-2 text-[var(--foreground-mute)]">
            <ImageIcon className="w-8 h-8 opacity-40" strokeWidth={1.5} />
            <span className="text-xs">배치도 없음</span>
          </div>
        ) : (
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={layoutPhotos[0].url}
              alt="배치도"
              className="w-full rounded-2xl object-contain border border-[var(--line)]"
            />
            <form action={deleteSitePhotoAction} className="absolute top-2 right-2">
              <input type="hidden" name="id" value={layoutPhotos[0].id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-xl bg-white/90 px-2 py-1 text-xs text-red-500 hover:bg-red-50 shadow-sm"
              >
                <Trash2 className="w-3 h-3" /> 삭제
              </button>
            </form>
          </div>
        )}

        <form action={uploadSitePhotoAction} encType="multipart/form-data"
          className="flex items-center gap-3 flex-wrap border-t border-[var(--line)]/60 pt-3">
          <input type="hidden" name="slot" value="map_layout" />
          <input
            type="file"
            name="photo"
            accept="image/*"
            required
            className="input file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand)] file:text-white file:px-3 file:py-1 file:text-xs file:font-semibold cursor-pointer flex-1"
          />
          <button type="submit" className="btn-primary btn-sm shrink-0 inline-flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> {layoutPhotos.length > 0 ? "교체" : "업로드"}
          </button>
        </form>
      </div>
    </div>
  );
}
