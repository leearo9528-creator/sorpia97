"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function back(q: string, editId: string, params: Record<string, string>) {
  const sp = new URLSearchParams({
    ...(q      ? { q }         : {}),
    ...(editId ? { edit: editId } : {}),
    ...params,
  });
  redirect(`/admin/members?${sp.toString()}`);
}

// ── 프로필 수정 ────────────────────────────────────────────
export async function updateMemberProfileAction(formData: FormData) {
  const id           = String(formData.get("id") ?? "");
  const display_name = String(formData.get("display_name") ?? "").trim();
  const phone        = String(formData.get("phone") ?? "").trim() || null;
  const q            = String(formData.get("q") ?? "");

  if (!display_name) back(q, id, { error: "이름을 입력해 주세요." });

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name, phone })
    .eq("id", id);

  if (error) back(q, id, { error: error.message });
  back(q, id, { message: "회원 정보가 수정됐습니다." });
}

// ── 권한 변경 ─────────────────────────────────────────────
export async function updateMemberRoleAction(formData: FormData) {
  const id   = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const q    = String(formData.get("q") ?? "");

  if (!["member", "manager", "admin"].includes(role))
    back(q, id, { error: "유효하지 않은 권한입니다." });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) back(q, id, { error: "로그인이 필요합니다." });
  if (user!.id === id) back(q, id, { error: "자신의 권한은 변경할 수 없습니다." });

  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) back(q, id, { error: error.message });
  back(q, id, { message: "권한이 변경됐습니다." });
}

// ── 출석 체크 (1일 1회 제한, KST 기준) ───────────────────
export async function checkInAction(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const q         = String(formData.get("q") ?? "");
  const supabase  = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const kstNow    = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayKST  = kstNow.toISOString().split("T")[0];
  const startOfDay = new Date(todayKST + "T00:00:00+09:00").toISOString();
  const endOfDay   = new Date(todayKST + "T23:59:59+09:00").toISOString();

  const { count } = await supabase
    .from("visits")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .gte("visited_at", startOfDay)
    .lte("visited_at", endOfDay);

  if (count && count > 0)
    back(q, profileId, { error: "오늘 이미 출석 처리된 회원입니다." });

  const { error } = await supabase
    .from("visits")
    .insert({ profile_id: profileId, checked_by: user?.id });

  if (error) back(q, profileId, { error: error.message });
  back(q, profileId, { message: "출석 도장을 찍었습니다." });
}

// ── 쿠폰 수동 발급 ────────────────────────────────────────
export async function issueCouponAction(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const q         = String(formData.get("q") ?? "");
  const supabase  = await createClient();

  const { error } = await supabase.from("coupons").insert({
    profile_id: profileId,
    kind: "etc",
    title: "음료 1잔 무료 쿠폰",
    description: "관리자 수동 발급",
    source: "manual",
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (error) back(q, profileId, { error: error.message });
  back(q, profileId, { message: "쿠폰을 발급했습니다." });
}

// ── 쿠폰 직권 삭제 ────────────────────────────────────────
export async function deleteCouponAction(formData: FormData) {
  const couponId  = String(formData.get("coupon_id") ?? "");
  const profileId = String(formData.get("profile_id") ?? "");
  const q         = String(formData.get("q") ?? "");
  const supabase  = await createClient();

  const { error } = await supabase.from("coupons").delete().eq("id", couponId);
  if (error) back(q, profileId, { error: error.message });
  back(q, profileId, { message: "쿠폰이 삭제됐습니다." });
}
