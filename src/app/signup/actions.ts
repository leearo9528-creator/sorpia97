"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { idToEmail, isValidId } from "@/lib/auth-id";

function fail(msg: string): never {
  redirect(`/signup?error=${encodeURIComponent(msg)}`);
}

export async function signUpAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!username || !password || !displayName) {
    fail("필수 항목을 입력해 주세요.");
  }
  if (!isValidId(username)) {
    fail("아이디는 영문/숫자 4~20자로 입력해 주세요.");
  }
  if (password.length < 8) {
    fail("비밀번호는 8자 이상이어야 합니다.");
  }
  if (password !== passwordConfirm) {
    fail("비밀번호가 일치하지 않습니다.");
  }

  const email = idToEmail(username);

  const supabase = await createClient();
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (signUpError) {
    if (signUpError.message.toLowerCase().includes("already")) {
      fail("이미 사용 중인 아이디입니다.");
    }
    fail(signUpError.message);
  }

  const userId = signUp.user?.id;
  if (!userId) {
    fail("가입 처리 중 문제가 발생했어요. 다시 시도해 주세요.");
  }

  // profiles: 트리거가 생성하지만 성함·전화번호·아이디 보강
  // email 컬럼에는 로그인 아이디를 그대로 저장해 관리자가 알아보기 쉽게 함
  await supabase
    .from("profiles")
    .update({ display_name: displayName, phone, email: username })
    .eq("id", userId);

  redirect("/mypage");
}
