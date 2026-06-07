"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { idToEmail } from "@/lib/auth-id";

function back(q: string, editId: string, params: Record<string, string>) {
  const sp = new URLSearchParams({
    ...(q      ? { q }            : {}),
    ...(editId ? { edit: editId } : {}),
    ...params,
  });
  redirect(`/admin/members?${sp.toString()}`);
}

// ── 회원 추가 (admin client) ──────────────────────────────
export async function addMemberAction(formData: FormData) {
  const memberId     = String(formData.get("member_id") ?? "").trim().toLowerCase();
  const display_name = String(formData.get("display_name") ?? "").trim();
  const phone        = String(formData.get("phone") ?? "").trim() || null;
  const password     = String(formData.get("password") ?? "").trim();
  const q            = String(formData.get("q") ?? "");

  if (!memberId || !display_name || !password)
    back(q, "", { error: "아이디, 이름, 비밀번호는 필수입니다." });

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: idToEmail(memberId),
    password,
    email_confirm: true,
    user_metadata: { display_name },
  });

  if (error) back(q, "", { error: error.message });

  if (data.user) {
    await admin
      .from("profiles")
      .update({ display_name, phone })
      .eq("id", data.user.id);
  }

  back(q, "", { message: `'${display_name}' 회원이 추가됐습니다.` });
}

// ── 회원 삭제 (admin client) ──────────────────────────────
export async function deleteMemberAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const q  = String(formData.get("q") ?? "");

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) back(q, "", { error: error.message });
  back(q, "", { message: "회원이 삭제됐습니다." });
}

// ── 프로필 수정 ───────────────────────────────────────────
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

// ── 출석 체크 (1일 1회, KST) ─────────────────────────────
export async function checkInAction(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const q         = String(formData.get("q") ?? "");
  const supabase  = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const kstNow     = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayKST   = kstNow.toISOString().split("T")[0];
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

// ── 출석 횟수 직접 조정 ───────────────────────────────────
export async function adjustVisitCountAction(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const target    = Math.max(0, parseInt(String(formData.get("count") ?? "0"), 10));
  const q         = String(formData.get("q") ?? "");

  if (isNaN(target)) back(q, profileId, { error: "올바른 숫자를 입력하세요." });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { count: current } = await supabase
    .from("visits")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId);

  const cur = current ?? 0;

  if (target > cur) {
    const rows = Array.from({ length: target - cur }, () => ({
      profile_id: profileId,
      checked_by: user?.id,
    }));
    const { error } = await supabase.from("visits").insert(rows);
    if (error) back(q, profileId, { error: error.message });
  } else if (target < cur) {
    const { data: toDelete } = await supabase
      .from("visits")
      .select("id")
      .eq("profile_id", profileId)
      .order("visited_at", { ascending: false })
      .limit(cur - target);

    if (toDelete?.length) {
      const { error } = await supabase
        .from("visits")
        .delete()
        .in("id", toDelete.map((v) => v.id));
      if (error) back(q, profileId, { error: error.message });
    }
  }

  back(q, profileId, { message: `방문 횟수가 ${target}회로 조정됐습니다.` });
}

// ── 쿠폰 발급 ────────────────────────────────────────────
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

// ── 쿠폰 삭제 ────────────────────────────────────────────
export async function deleteCouponAction(formData: FormData) {
  const couponId  = String(formData.get("coupon_id") ?? "");
  const profileId = String(formData.get("profile_id") ?? "");
  const q         = String(formData.get("q") ?? "");
  const supabase  = await createClient();

  const { error } = await supabase.from("coupons").delete().eq("id", couponId);
  if (error) back(q, profileId, { error: error.message });
  back(q, profileId, { message: "쿠폰이 삭제됐습니다." });
}

// ── 강아지 추가 ───────────────────────────────────────────
export async function addDogAction(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const name      = String(formData.get("name") ?? "").trim();
  const birthday  = String(formData.get("birthday") ?? "").trim() || null;
  const breed     = String(formData.get("breed") ?? "").trim() || null;
  const weightRaw = String(formData.get("weight") ?? "").trim();
  const gender    = String(formData.get("gender") ?? "").trim() || null;
  const weight    = weightRaw ? parseFloat(weightRaw) : null;
  const q         = String(formData.get("q") ?? "");

  if (!name) back(q, profileId, { error: "강아지 이름을 입력해 주세요." });

  const supabase = await createClient();
  const { error } = await supabase
    .from("dogs")
    .insert({ owner_id: profileId, name, birthday, breed, weight, gender });

  if (error) back(q, profileId, { error: error.message });
  back(q, profileId, { message: `'${name}' 강아지가 추가됐습니다.` });
}

// ── 강아지 수정 ───────────────────────────────────────────
export async function updateDogAction(formData: FormData) {
  const dogId     = String(formData.get("dog_id") ?? "");
  const profileId = String(formData.get("profile_id") ?? "");
  const name      = String(formData.get("name") ?? "").trim();
  const birthday  = String(formData.get("birthday") ?? "").trim() || null;
  const breed     = String(formData.get("breed") ?? "").trim() || null;
  const weightRaw = String(formData.get("weight") ?? "").trim();
  const gender    = String(formData.get("gender") ?? "").trim() || null;
  const weight    = weightRaw ? parseFloat(weightRaw) : null;
  const q         = String(formData.get("q") ?? "");

  if (!name) back(q, profileId, { error: "강아지 이름을 입력해 주세요." });

  const supabase = await createClient();
  const { error } = await supabase
    .from("dogs")
    .update({ name, birthday, breed, weight, gender })
    .eq("id", dogId);

  if (error) back(q, profileId, { error: error.message });
  back(q, profileId, { message: "강아지 정보가 수정됐습니다." });
}

// ── 강아지 삭제 ───────────────────────────────────────────
export async function deleteDogAction(formData: FormData) {
  const dogId     = String(formData.get("dog_id") ?? "");
  const profileId = String(formData.get("profile_id") ?? "");
  const q         = String(formData.get("q") ?? "");
  const supabase  = await createClient();

  const { error } = await supabase.from("dogs").delete().eq("id", dogId);
  if (error) back(q, profileId, { error: error.message });
  back(q, profileId, { message: "강아지가 삭제됐습니다." });
}
