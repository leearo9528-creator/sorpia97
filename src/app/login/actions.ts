"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { idToEmail } from "@/lib/auth-id";

export async function signInAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/mypage");

  const email = idToEmail(username);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = "아이디 또는 비밀번호가 올바르지 않습니다.";
    redirect(`/login?error=${encodeURIComponent(msg)}&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}
