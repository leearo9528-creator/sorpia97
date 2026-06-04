"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function back(params: Record<string, string>) {
  const sp = new URLSearchParams(params);
  redirect(`/admin/passes?${sp.toString()}`);
}

export async function activateOrderAction(formData: FormData) {
  const orderId = String(formData.get("order_id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase
    .from("pass_orders")
    .update({ status: "active" })
    .eq("id", orderId);
  if (error) back({ error: error.message });
  back({ message: "구독을 활성화했습니다." });
}

export async function redeemMonthAction(formData: FormData) {
  const orderId = String(formData.get("order_id") ?? "");
  const monthIndex = Number(formData.get("month_index") ?? 0);

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("pass_orders")
    .select("profile_id,subscription_passes(name,monthly_product,monthly_drink_quota)")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) back({ error: "주문을 찾을 수 없습니다." });
  const pass = (order as unknown as {
    subscription_passes: { name: string; monthly_product: string; monthly_drink_quota: number };
  }).subscription_passes;

  // upsert redemption
  const { error: rErr } = await supabase
    .from("pass_redemptions")
    .upsert(
      {
        order_id: orderId,
        month_index: monthIndex,
        product_redeemed_at: new Date().toISOString(),
        drinks_issued: true,
      },
      { onConflict: "order_id,month_index" },
    );

  if (rErr) back({ error: rErr.message });

  // 음료 쿠폰 N장 발급
  const expires = new Date();
  expires.setDate(expires.getDate() + 45);
  const rows = Array.from({ length: pass.monthly_drink_quota }).map(() => ({
    profile_id: (order as unknown as { profile_id: string }).profile_id,
    kind: "pass_drink",
    title: "음료 1잔 쿠폰",
    description: `${pass.name} ${monthIndex}월차 지급`,
    source: `pass:${orderId}:m${monthIndex}`,
    expires_at: expires.toISOString(),
  }));

  if (rows.length > 0) {
    const { error: cErr } = await supabase.from("coupons").insert(rows);
    if (cErr) back({ error: cErr.message });
  }

  back({
    message: `${monthIndex}월차 ${pass.monthly_product} 지급 + 음료 쿠폰 ${pass.monthly_drink_quota}장 발급 완료`,
  });
}
