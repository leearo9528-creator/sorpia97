"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fail(msg: string): never {
  redirect(`/mypage/dogs/new?error=${encodeURIComponent(msg)}`);
}

export async function addDogAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name     = String(formData.get("dog_name")    ?? "").trim();
  const birthday = String(formData.get("dog_birthday") ?? "").trim();
  const breed    = String(formData.get("dog_breed")   ?? "").trim() || null;
  const gender   = String(formData.get("dog_gender")  ?? "").trim() || null;
  const weightRaw = String(formData.get("dog_weight") ?? "").trim();
  const weight   = weightRaw ? parseFloat(weightRaw) : null;
  const photo    = formData.get("dog_photo");

  if (!name) fail("강아지 이름을 입력해 주세요.");

  let photoUrl: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    const ext = photo.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("dog-photos")
      .upload(path, photo, { contentType: photo.type, upsert: false });
    if (!upErr) {
      const { data: pub } = supabase.storage.from("dog-photos").getPublicUrl(path);
      photoUrl = pub.publicUrl;
    }
  }

  const { error } = await supabase.from("dogs").insert({
    owner_id: user.id,
    name,
    birthday: birthday || null,
    breed,
    weight,
    gender,
    photo_url: photoUrl,
  });

  if (error) fail("강아지 등록 중 오류가 발생했어요. 다시 시도해 주세요.");

  redirect("/mypage");
}
