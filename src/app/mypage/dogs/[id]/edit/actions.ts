"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fail(id: string, msg: string): never {
  redirect(`/mypage/dogs/${id}/edit?error=${encodeURIComponent(msg)}`);
}

export async function updateDogAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id      = String(formData.get("dog_id") ?? "");
  const name    = String(formData.get("dog_name") ?? "").trim();
  const birthday = String(formData.get("dog_birthday") ?? "").trim();
  const breed   = String(formData.get("dog_breed") ?? "").trim() || null;
  const gender  = String(formData.get("dog_gender") ?? "").trim() || null;
  const weightRaw = String(formData.get("dog_weight") ?? "").trim();
  const weight  = weightRaw ? parseFloat(weightRaw) : null;
  const photo   = formData.get("dog_photo");

  if (!name) fail(id, "강아지 이름을 입력해 주세요.");

  let photoUrl: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    const ext = photo.name.split(".").pop() || "jpg";
    const path = `${user.id}/${id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("dog-photos")
      .upload(path, photo, { contentType: photo.type, upsert: true });
    if (!upErr) {
      const { data: pub } = supabase.storage.from("dog-photos").getPublicUrl(path);
      photoUrl = pub.publicUrl;
    }
  }

  const updateData: Record<string, unknown> = { name, birthday: birthday || null, breed, weight, gender };
  if (photoUrl) updateData.photo_url = photoUrl;

  const { error } = await supabase
    .from("dogs")
    .update(updateData)
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) fail(id, "수정 중 오류가 발생했어요.");
  redirect("/mypage");
}

export async function deleteDogAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("dog_id") ?? "");

  const { error } = await supabase
    .from("dogs")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) redirect(`/mypage/dogs/${id}/edit?error=${encodeURIComponent(error.message)}`);
  redirect("/mypage");
}
