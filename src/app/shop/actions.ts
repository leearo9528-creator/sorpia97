"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function applyForPassAction(formData: FormData) {
  const passId = String(formData.get("pass_id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/shop");

  const { data: pass } = await supabase
    .from("subscription_passes")
    .select("duration_months")
    .eq("id", passId)
    .maybeSingle();

  if (!pass) {
    redirect(`/shop?error=${encodeURIComponent("상품을 찾을 수 없습니다.")}`);
  }

  const today = new Date();
  const expires = new Date(today);
  expires.setMonth(expires.getMonth() + pass.duration_months);

  const { error } = await supabase.from("pass_orders").insert({
    profile_id: user.id,
    pass_id: passId,
    started_on: today.toISOString().slice(0, 10),
    expires_on: expires.toISOString().slice(0, 10),
    status: "active",
    note: "온라인 신청 (매장 결제 대기)",
  });

  if (error) {
    redirect(`/shop?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/shop?message=${encodeURIComponent("신청이 접수되었습니다. 매장에서 결제 후 활성화됩니다.")}`,
  );
}
