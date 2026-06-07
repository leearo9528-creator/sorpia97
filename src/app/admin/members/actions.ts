"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function back(q: string, params: Record<string, string>) {
  const sp = new URLSearchParams({ ...(q ? { q } : {}), ...params });
  redirect(`/admin/members?${sp.toString()}`);
}

export async function updateMemberRoleAction(formData: FormData) {
  const id   = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const q    = String(formData.get("q") ?? "");

  if (!["member", "manager", "admin"].includes(role)) {
    back(q, { error: "유효하지 않은 권한입니다." });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) back(q, { error: "로그인이 필요합니다." });

  // 자기 자신의 role 변경 금지
  if (user!.id === id) back(q, { error: "자신의 권한은 변경할 수 없습니다." });

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id);

  if (error) back(q, { error: error.message });
  back(q, { message: "권한이 변경됐습니다." });
}

export async function updateMemberProfileAction(formData: FormData) {
  const id           = String(formData.get("id") ?? "");
  const display_name = String(formData.get("display_name") ?? "").trim();
  const phone        = String(formData.get("phone") ?? "").trim() || null;
  const q            = String(formData.get("q") ?? "");

  if (!display_name) back(q, { error: "이름을 입력해 주세요." });

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name, phone })
    .eq("id", id);

  if (error) back(q, { error: error.message });
  back(q, { message: "회원 정보가 수정됐습니다." });
}
