import { createClient } from "@/lib/supabase/server";
import { updateContentAction } from "./actions";

const EDITABLE_KEYS = [
  { key: "cafe_intro", label: "카페 소개 (홈)" },
  { key: "facility", label: "시설 안내 (홈)" },
];

export default async function ContentAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user!.id).maybeSingle();
  if (me?.role !== "admin") {
    return <p className="py-10 text-center opacity-60 text-sm">이 메뉴는 최고 관리자만 이용할 수 있습니다.</p>;
  }

  const { data: contents } = await supabase
    .from("contents")
    .select("key,title,body,image_url");
  const byKey = new Map((contents ?? []).map((c) => [c.key, c]));

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

      {EDITABLE_KEYS.map((k) => {
        const c = byKey.get(k.key);
        return (
          <form key={k.key} action={updateContentAction} className="card grid gap-3">
            <h2 className="font-semibold text-[var(--brand-strong)]">{k.label}</h2>
            <input type="hidden" name="key" value={k.key} />
            <div>
              <label className="label">제목</label>
              <input className="input" name="title" defaultValue={c?.title ?? ""} />
            </div>
            <div>
              <label className="label">본문</label>
              <textarea
                className="input min-h-[120px]"
                name="body"
                defaultValue={c?.body ?? ""}
              />
            </div>
            <div>
              <label className="label">이미지 URL (선택)</label>
              <input className="input" name="image_url" defaultValue={c?.image_url ?? ""} />
            </div>
            <button className="btn-primary justify-self-start">저장</button>
          </form>
        );
      })}
    </div>
  );
}
