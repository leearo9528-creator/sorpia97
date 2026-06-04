"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createAnnouncementAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "general");
  const pinned = formData.get("pinned") === "on";

  if (!title || !body) {
    redirect(`/admin/announcements?error=${encodeURIComponent("제목과 내용을 입력해 주세요.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .insert({ title, body, category, pinned });

  if (error) {
    redirect(`/admin/announcements?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/announcements?message=${encodeURIComponent("공지사항이 등록되었습니다.")}`);
}

export async function deleteAnnouncementAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) {
    redirect(`/admin/announcements?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/announcements?message=${encodeURIComponent("삭제되었습니다.")}`);
}
