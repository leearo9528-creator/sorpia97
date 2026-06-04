"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function back(q: string, params: Record<string, string>) {
  const sp = new URLSearchParams({ q, ...params });
  redirect(`/admin/attendance?${sp.toString()}`);
}

export async function checkInAction(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const q = String(formData.get("q") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("visits")
    .insert({ profile_id: profileId, checked_by: user?.id });

  if (error) back(q, { error: error.message });
  back(q, { message: "출석 도장을 찍었습니다. (10회마다 쿠폰 자동 발급)" });
}

export async function issueCouponAction(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const q = String(formData.get("q") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.from("coupons").insert({
    profile_id: profileId,
    kind: "etc",
    title: "음료 1잔 무료 쿠폰",
    description: "관리자 수동 발급",
    source: "manual",
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (error) back(q, { error: error.message });
  back(q, { message: "쿠폰을 발급했습니다." });
}
