"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateBookingStatusAction(formData: FormData) {
  const id     = formData.get("id")     as string;
  const status = formData.get("status") as string;

  const supabase = await createClient();
  await supabase
    .from("trekking_bookings")
    .update({ status })
    .eq("id", id);

  revalidatePath("/admin/trekking");
}
