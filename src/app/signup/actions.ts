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

  if (!email || !password || !displayName) {
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

  await supabase
    .from("profiles")
    .update({ display_name: displayName, phone, email })
    .eq("id", userId);

  try {
    const admin = createAdminClient();
    const adminEmails =
      process.env.ADMIN_EMAILS?.split(",").map((s) => s.trim().toLowerCase()) ?? [];
    if (adminEmails.includes(email.toLowerCase())) {
      await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
    }
  } catch {
    // 서비스 롤 미설정 시 무시
  }

  redirect("/mypage");
}
