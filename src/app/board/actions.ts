"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPostAction(formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  const photo = formData.get("photo");

  if (!content) {
    redirect(`/board/new?error=${encodeURIComponent("내용을 입력해 주세요.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/board/new");

  let photoUrl: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    const ext = photo.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("board-photos")
      .upload(path, photo, { contentType: photo.type, upsert: false });
    if (!upErr) {
      const { data: pub } = supabase.storage.from("board-photos").getPublicUrl(path);
      photoUrl = pub.publicUrl;
    }
  }

  const { error } = await supabase.from("board_posts").insert({
    profile_id: user.id,
    content,
    photo_url: photoUrl,
  });

  if (error) {
    redirect(`/board/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/board");
  redirect("/board");
}

export async function toggleLikeAction(formData: FormData) {
  const postId = String(formData.get("post_id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/board");

  const { data: existing } = await supabase
    .from("board_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("board_likes")
      .delete()
      .eq("post_id", postId)
      .eq("profile_id", user.id);
  } else {
    await supabase.from("board_likes").insert({ post_id: postId, profile_id: user.id });
  }

  revalidatePath("/board");
}
