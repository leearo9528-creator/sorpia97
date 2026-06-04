"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function fail(msg: string): never {
  redirect(`/signup?error=${encodeURIComponent(msg)}`);
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const dogName = String(formData.get("dog_name") ?? "").trim();
  const dogBirthday = String(formData.get("dog_birthday") ?? "").trim();
  const dogPhoto = formData.get("dog_photo");

  if (!email || !password || !displayName || !dogName) {
    fail("필수 항목을 입력해 주세요.");
  }

  const supabase = await createClient();
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (signUpError) fail(signUpError.message);

  const userId = signUp.user?.id;
  if (!userId) {
    redirect(
      `/signup?message=${encodeURIComponent("확인 메일을 보냈어요. 메일 인증 후 로그인해 주세요.")}`,
    );
  }

  // profiles: 트리거가 만들지만 phone 등 보강
  await supabase
    .from("profiles")
    .update({ display_name: displayName, phone, email })
    .eq("id", userId);

  // 강아지 사진 업로드 (선택)
  let photoUrl: string | null = null;
  if (dogPhoto instanceof File && dogPhoto.size > 0) {
    const ext = dogPhoto.name.split(".").pop() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("dog-photos")
      .upload(path, dogPhoto, { contentType: dogPhoto.type, upsert: false });

    if (!upErr) {
      const { data: pub } = supabase.storage.from("dog-photos").getPublicUrl(path);
      photoUrl = pub.publicUrl;
    }
  }

  // 강아지 등록 (RLS 우회 위해 서비스 롤 사용 — 가입 직후 세션이 아직 set 되지 않을 수 있음)
  try {
    const admin = createAdminClient();
    await admin.from("dogs").insert({
      owner_id: userId,
      name: dogName,
      birthday: dogBirthday || null,
      photo_url: photoUrl,
    });

    // ADMIN_EMAILS 에 포함된 메일이면 자동으로 admin 역할 부여
    const adminEmails =
      process.env.ADMIN_EMAILS?.split(",").map((s) => s.trim().toLowerCase()) ?? [];
    if (adminEmails.includes(email.toLowerCase())) {
      await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
    }
  } catch {
    // 서비스 롤 미설정 시 무시 — 사용자가 마이페이지에서 등록할 수 있도록 안내.
  }

  redirect("/mypage");
}
