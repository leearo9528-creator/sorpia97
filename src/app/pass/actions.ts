"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function applyForPassFromLanding(formData: FormData) {
  const passId = String(formData.get("pass_id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/pass");

  const { data: pass } = await supabase
    .from("subscription_passes")
    .select("duration_months")
    .eq("id", passId)
    .maybeSingle();

  if (!pass) {
    redirect(`/pass?error=${encodeURIComponent("상품을 찾을 수 없습니다.")}#apply`);
  }

  const today = new Date();
  const expires = new Date(today);
  expires.setMonth(expires.getMonth() + pass.duration_months);

  const { error } = await supabase.from("pass_orders").insert({
    profile_id: user.id,
    pass_id: passId,
    started_on: today.toISOString().slice(0, 10),
    expires_on: expires.toISOString().slice(0, 10),
    status: "pending",
    note: "랜딩에서 신청 (매장 결제 대기)",
  });

  if (error) {
    redirect(`/pass?error=${encodeURIComponent(error.message)}#apply`);
  }

  redirect(
    `/pass?message=${encodeURIComponent("신청이 접수되었습니다. 14일 이내 매장에서 결제해 주세요.")}#apply`,
  );
}
