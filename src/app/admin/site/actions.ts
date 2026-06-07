"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function fail(msg: string): never {
  redirect(`/admin/site?error=${encodeURIComponent(msg)}`);
}

export async function uploadSitePhotoAction(formData: FormData) {
  const key  = String(formData.get("key") ?? "").trim();
  const file = formData.get("photo");
  const supabase = await createClient();

  if (!key) fail("key가 없습니다.");
  if (!(file instanceof File) || file.size === 0) fail("파일을 선택해 주세요.");

  const ext  = (file as File).name.split(".").pop() || "jpg";
  const path = `${key}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("site-photos")
    .upload(path, file as File, { contentType: (file as File).type, upsert: true });

  if (upErr) fail(upErr.message);

  const { data: pub } = supabase.storage.from("site-photos").getPublicUrl(path);

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: pub.publicUrl });

  if (error) fail(error.message);

  revalidatePath("/");
  revalidatePath("/admin/site");
  redirect("/admin/site?message=저장됐습니다.");
}

export async function deleteSitePhotoAction(formData: FormData) {
  const key      = String(formData.get("key") ?? "").trim();
  const supabase = await createClient();

  await supabase.from("site_settings").delete().eq("key", key);

  revalidatePath("/");
  revalidatePath("/admin/site");
  redirect("/admin/site?message=삭제됐습니다.");
}
