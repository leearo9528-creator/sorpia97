"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function fail(msg: string): never {
  redirect(`/admin/site?error=${encodeURIComponent(msg)}`);
}

export async function uploadSitePhotoAction(formData: FormData) {
  const slot = String(formData.get("slot") ?? "").trim();
  const file = formData.get("photo");
  const supabase = await createClient();

  if (!slot) fail("slot이 없습니다.");
  if (!(file instanceof File) || file.size === 0) fail("파일을 선택해 주세요.");

  const ext  = (file as File).name.split(".").pop() || "jpg";
  const path = `${slot}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("site-photos")
    .upload(path, file as File, { contentType: (file as File).type, upsert: false });

  if (upErr) fail(upErr.message);

  const { data: pub } = supabase.storage.from("site-photos").getPublicUrl(path);

  // 현재 마지막 sort_order 조회
  const { data: last } = await supabase
    .from("site_photos")
    .select("sort_order")
    .eq("slot", slot)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("site_photos").insert({
    slot,
    url: pub.publicUrl,
    sort_order: (last?.sort_order ?? -1) + 1,
  });

  if (error) fail(error.message);

  revalidatePath("/");
  revalidatePath("/admin/site");
  redirect("/admin/site?message=사진이 추가됐습니다.");
}

export async function deleteSitePhotoAction(formData: FormData) {
  const id       = String(formData.get("id") ?? "").trim();
  const supabase = await createClient();

  const { error } = await supabase.from("site_photos").delete().eq("id", id);
  if (error) fail(error.message);

  revalidatePath("/");
  revalidatePath("/admin/site");
  redirect("/admin/site?message=삭제됐습니다.");
}
