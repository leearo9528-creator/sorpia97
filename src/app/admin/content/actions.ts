"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateContentAction(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");
  const image_url = String(formData.get("image_url") ?? "") || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("contents")
    .upsert({ key, title, body, image_url, updated_at: new Date().toISOString() });

  if (error) {
    redirect(`/admin/content?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/content?message=${encodeURIComponent("저장되었습니다.")}`);
}
