import { createClient } from "@/lib/supabase/server";
import { Eye, EyeOff, Plus, Pencil, FolderPlus, Trash2 } from "lucide-react";
import {
  updateItemAction,
  toggleItemActiveAction,
  addItemAction,
  addCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "./actions";
import { DeleteButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

type MenuItem = {
  id: string; name: string; description: string | null;
  price: number | null; price_text: string | null;
  rank: number | null; sort_order: number; is_active: boolean;
};
type MenuCategory = {
  id: string; code: string; name: string;
  sort_order: number; is_seasonal: boolean;
  menu_items: MenuItem[];
};

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string; open?: string }>;
}) {
  const { message, error, open } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase
    .from("profiles").select("role").eq("id", user!.id).maybeSingle();

  if (me?.role !== "admin") {
    return <p className="py-10 text-center opacity-60 text-sm">최고 관리자만 이용할 수 있습니다.</p>;
  }

  const { data } = await supabase
    .from("menu_categories")
    .select("id,code,name,sort_order,is_seasonal,menu_items(id,name,description,price,price_text,rank,sort_order,is_active)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "menu_items" });

  const categories: MenuCategory[] = (data ?? []).map((c) => ({
    ...c,
    menu_items: (c.menu_items ?? []) as MenuItem[],
  }));

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

      {/* 카테고리 추가 */}
      <details className="rounded-2xl border border-dashed border-[var(--brand)]/50 p-4">
        <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">
          <FolderPlus className="w-4 h-4" /> 카테고리 추가
        </summary>
        <form action={addCategoryAction} className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label">카테고리 이름 *</label>
            <input className="input" name="name" placeholder="예: 시그니처" required />
          </div>
          <div>
            <label className="label">코드 *</label>
            <input className="input" name="code" placeholder="예: signature (영문)" required />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
              <input type="checkbox" name="is_seasonal" className="rounded" />
              시즌 카테고리
            </label>
            <button type="submit" className="btn-primary btn-sm mb-2">추가</button>
          </div>
        </form>
      </details>

      {/* 카테고리별 섹션 */}
      {categories.map((cat) => (
        <details key={cat.id} open={open === cat.code || undefined} className="group">
          <summary className="cursor-pointer list-none flex items-center justify-between py-3 border-b border-[var(--line)]">
            <h2 className="font-semibold text-[var(--brand-strong)] flex items-center gap-2">
              {cat.name}
              {cat.is_seasonal && <span className="chip-accent text-[10px]">시즌</span>}
              <span className="text-xs text-[var(--foreground-mute)] font-normal ml-1">
                {cat.menu_items.length}개
              </span>
            </h2>
            <Pencil className="w-4 h-4 text-[var(--foreground-mute)] group-open:text-[var(--brand)]" />
          </summary>

          <div className="mt-3 grid gap-3">
            {/* 카테고리 이름 수정 + 삭제 */}
            <div className="flex items-center gap-3 flex-wrap pb-2 border-b border-[var(--line)]/60">
              <form action={updateCategoryAction} className="flex items-center gap-2 flex-1 flex-wrap">
                <input type="hidden" name="id" value={cat.id} />
                <input
                  name="name"
                  defaultValue={cat.name}
                  required
                  className="input !min-h-0 py-1 text-sm w-36"
                />
                <label className="flex items-center gap-1.5 text-xs text-[var(--foreground-mute)] cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_seasonal"
                    defaultChecked={cat.is_seasonal}
                    className="rounded"
                  />
                  시즌
                </label>
                <button type="submit" className="btn-outline btn-sm">카테고리 저장</button>
              </form>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={cat.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 카테고리 삭제
                </button>
              </form>
            </div>

            {/* 메뉴 아이템 목록 */}
            {cat.menu_items.map((item) => (
              <div
                key={item.id}
                className={
                  "rounded-2xl border p-4 " +
                  (item.is_active
                    ? "bg-white border-[var(--line)]"
                    : "bg-[var(--surface-2)] border-[var(--line)] opacity-60")
                }
              >
                <form action={updateItemAction} className="grid gap-2">
                  <input type="hidden" name="id" value={item.id} />
                  <div className="flex gap-2 flex-wrap">
                    <input
                      name="name" required defaultValue={item.name}
                      placeholder="메뉴 이름"
                      className="input !min-h-0 py-1.5 text-sm flex-1 min-w-32"
                    />
                    <input
                      name="description" defaultValue={item.description ?? ""}
                      placeholder="설명 (선택)"
                      className="input !min-h-0 py-1.5 text-sm flex-1 min-w-32"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      name="price" type="number" min="0" step="100"
                      defaultValue={item.price ?? ""} placeholder="가격(원)"
                      className="w-28 rounded-xl border border-[var(--ring)] bg-[var(--surface)] px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40"
                    />
                    <input
                      name="price_text" defaultValue={item.price_text ?? ""}
                      placeholder="가격텍스트"
                      className="w-40 rounded-xl border border-[var(--ring)] bg-[var(--surface)] px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40"
                    />
                    <button type="submit" className="rounded-xl bg-[var(--brand)] text-white text-xs px-3 py-1.5 hover:bg-[var(--brand-strong)]">
                      저장
                    </button>
                    <form action={toggleItemActiveAction} className="contents">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="is_active" value={String(item.is_active)} />
                      <button type="submit" title={item.is_active ? "숨기기" : "표시"}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-[var(--surface-2)] text-[var(--foreground-mute)]">
                        {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </form>
                    <DeleteButton id={item.id} name={item.name} />
                  </div>
                </form>
              </div>
            ))}

            {/* 항목 추가 */}
            <details className="mt-1">
              <summary className="cursor-pointer list-none text-xs text-[var(--brand)] font-semibold flex items-center gap-1 px-1 py-1">
                <Plus className="w-3.5 h-3.5" /> 항목 추가
              </summary>
              <form action={addItemAction} className="mt-2 rounded-2xl border border-dashed border-[var(--ring)] p-3 grid gap-2">
                <input type="hidden" name="category_id" value={cat.id} />
                <input name="name" required placeholder="메뉴 이름 *" className="input !min-h-0 py-1.5 text-sm" />
                <input name="description" placeholder="설명 (선택)" className="input !min-h-0 py-1.5 text-sm" />
                <div className="flex gap-2">
                  <input name="price" type="number" min="0" step="100" placeholder="가격(원)" className="input !min-h-0 py-1.5 text-sm flex-1" />
                  <input name="price_text" placeholder="가격텍스트" className="input !min-h-0 py-1.5 text-sm flex-1" />
                </div>
                <button type="submit" className="btn-primary btn-sm justify-self-start">추가</button>
              </form>
            </details>
          </div>
        </details>
      ))}
    </div>
  );
}
