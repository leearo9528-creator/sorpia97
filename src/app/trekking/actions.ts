"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function bookTrekkingAction(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const trek_date   = formData.get("trek_date")   as string;
  const party_size  = Number(formData.get("party_size") ?? 1);
  const pkg         = formData.get("package_type") as string;
  const guest_name  = (formData.get("guest_name")  as string).trim();
  const guest_phone = (formData.get("guest_phone") as string).trim();

  if (!trek_date || !guest_name || !guest_phone) {
    redirect(
      "/trekking?error=" +
        encodeURIComponent("날짜, 이름, 연락처를 모두 입력해 주세요."),
    );
  }

  const { error } = await supabase.from("trekking_bookings").insert({
    profile_id:   user?.id ?? null,
    guest_name,
    guest_phone,
    trek_date,
    party_size,
    package_type: pkg === "premium" ? "premium" : "basic",
  });

  if (error) {
    redirect(
      "/trekking?error=" +
        encodeURIComponent("예약 저장 중 오류가 발생했습니다. 다시 시도해 주세요."),
    );
  }

  redirect(
    "/trekking?message=" +
      encodeURIComponent(
        `${trek_date} 예약이 접수됐습니다. 당일 카운터에서 결제 후 패키지가 시작됩니다.`,
      ),
  );
}
