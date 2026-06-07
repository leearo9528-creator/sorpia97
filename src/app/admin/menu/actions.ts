"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function back(params: Record<string, string>) {
  const sp = new URLSearchParams(params);
  redirect(`/admin/menu?${sp.toString()}`);
}

export async function updateItemPriceAction(formData: FormData) {
  const id         = String(formData.get("id") ?? "");
  const priceRaw   = String(formData.get("price") ?? "").trim();
  const price_text = String(formData.get("price_text") ?? "").trim() || null;

  const price = priceRaw === "" ? null : parseInt(priceRaw.replace(/,/g, ""), 10);

  if (priceRaw !== "" && (isNaN(price!) || price! < 0)) {
    back({ error: "가격은 0 이상의 숫자(원 단위)로 입력해 주세요." });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ price, price_text })
    .eq("id", id);

  if (error) back({ error: error.message });
  revalidatePath("/menu");
  back({ message: "저장됐습니다." });
}

export async function toggleItemActiveAction(formData: FormData) {
  const id        = String(formData.get("id") ?? "");
  const is_active = formData.get("is_active") === "true";

  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_items")
    .update({ is_active: !is_active })
    .eq("id", id);

  if (error) back({ error: error.message });
  revalidatePath("/menu");
  back({ message: is_active ? "비활성 처리됐습니다." : "활성 처리됐습니다." });
}

export async function addItemAction(formData: FormData) {
  const category_id = String(formData.get("category_id") ?? "");
  const name        = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const priceRaw    = String(formData.get("price") ?? "").trim();
  const price_text  = String(formData.get("price_text") ?? "").trim() || null;

  if (!name) back({ error: "메뉴 이름을 입력해 주세요." });

  const price = priceRaw === "" ? null : parseInt(priceRaw.replace(/,/g, ""), 10);

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("menu_items")
    .select("sort_order")
    .eq("category_id", category_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (last?.sort_order ?? -1) + 1;

  const { error } = await supabase
    .from("menu_items")
    .insert({ category_id, name, description, price, price_text, sort_order });

  if (error) back({ error: error.message });
  revalidatePath("/menu");
  back({ message: `'${name}' 추가됐습니다.` });
}

export async function deleteItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) back({ error: error.message });
  revalidatePath("/menu");
  back({ message: "삭제됐습니다." });
}
