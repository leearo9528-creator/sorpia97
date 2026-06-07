import { createClient } from "@/lib/supabase/server";
import { Eye, EyeOff, Plus, Pencil } from "lucide-react";
import {
  updateItemPriceAction,
  toggleItemActiveAction,
  addItemAction,
} from "./actions";
import { DeleteButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_text: string | null;
  rank: number | null;
  sort_order: number;
  is_active: boolean;
};

type MenuCategory = {
  id: string;
  code: string;
  name: string;
  sort_order: number;
  is_seasonal: boolean;
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
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .maybeSingle();

  if (me?.role !== "admin") {
    return (
      <p className="py-10 text-center opacity-60 text-sm">
        최고 관리자만 이용할 수 있습니다.
      </p>
    );
  }

  const { data } = await supabase
    .from("menu_categories")
    .select(
      "id,code,name,sort_order,is_seasonal,menu_items(id,name,description,price,price_text,rank,sort_order,is_active)",
    )
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

      <p className="text-xs text-[var(--foreground-mute)]">
        가격은 원 단위 정수 (예: 6500). 비정형 가격은 가격란 비우고 가격 텍스트에 입력.
      </p>

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

          <div className="mt-3 grid gap-2">
            {cat.menu_items.map((item) => (
              <div
                key={item.id}
                className={
                  "rounded-2xl border px-4 py-3 " +
                  (item.is_active
                    ? "bg-white border-[var(--line)]"
                    : "bg-[var(--surface-2)] border-[var(--line)] opacity-60")
                }
              >
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[var(--brand-strong)]">
                      {item.rank != null && (
                        <span className="mr-1 text-[var(--accent)] font-bold">{item.rank}.</span>
                      )}
                      {item.name}
                    </div>
                    {item.description && (
                      <div className="text-xs text-[var(--foreground-mute)] mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>

                  <form action={updateItemPriceAction} className="flex items-center gap-1.5 flex-wrap">
                    <input type="hidden" name="id" value={item.id} />
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="100"
                      defaultValue={item.price ?? ""}
                      placeholder="가격(원)"
                      className="w-24 rounded-xl border border-[var(--ring)] bg-[var(--surface)] px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40"
                    />
                    <input
                      name="price_text"
                      defaultValue={item.price_text ?? ""}
                      placeholder="가격텍스트"
                      className="w-36 rounded-xl border border-[var(--ring)] bg-[var(--surface)] px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-[var(--brand)] text-white text-xs px-2.5 py-1 hover:bg-[var(--brand-strong)]"
                    >
                      저장
                    </button>
                  </form>

                  <form action={toggleItemActiveAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="is_active" value={String(item.is_active)} />
                    <button
                      type="submit"
                      title={item.is_active ? "비활성화" : "활성화"}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[var(--surface-2)] text-[var(--foreground-mute)]"
                    >
                      {item.is_active
                        ? <Eye className="w-3.5 h-3.5" />
                        : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </form>

                  <DeleteButton id={item.id} name={item.name} />
                </div>
              </div>
            ))}

            <details className="mt-2">
              <summary className="cursor-pointer list-none text-xs text-[var(--brand)] font-semibold flex items-center gap-1 px-1 py-1">
                <Plus className="w-3.5 h-3.5" />
                항목 추가
              </summary>
              <form
                action={addItemAction}
                className="mt-2 rounded-2xl border border-dashed border-[var(--ring)] p-3 grid gap-2"
              >
                <input type="hidden" name="category_id" value={cat.id} />
                <input
                  name="name"
                  required
                  placeholder="메뉴 이름 *"
                  className="input !min-h-0 py-1.5 text-sm"
                />
                <input
                  name="description"
                  placeholder="설명 (선택)"
                  className="input !min-h-0 py-1.5 text-sm"
                />
                <div className="flex gap-2">
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="가격(원)"
                    className="input !min-h-0 py-1.5 text-sm flex-1"
                  />
                  <input
                    name="price_text"
                    placeholder="가격텍스트"
                    className="input !min-h-0 py-1.5 text-sm flex-1"
                  />
                </div>
                <button type="submit" className="btn-primary btn-sm justify-self-start">
                  추가
                </button>
              </form>
            </details>
          </div>
        </details>
      ))}
    </div>
  );
}
