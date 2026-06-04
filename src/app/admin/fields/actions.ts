"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SlotStatus = "available" | "reserved" | "closed";

export async function setSlotAction(formData: FormData) {
  const yard = String(formData.get("yard") ?? "");
  const slot_date = String(formData.get("slot_date") ?? "");
  const slot_time = String(formData.get("slot_time") ?? "");
  const status = String(formData.get("status") ?? "available") as SlotStatus;

  const supabase = await createClient();

  if (status === "available") {
    await supabase
      .from("field_slots")
      .delete()
      .match({ yard, slot_date, slot_time });
  } else {
    await supabase.from("field_slots").upsert(
      { yard, slot_date, slot_time, status },
      { onConflict: "yard,slot_date,slot_time" },
    );
  }

  revalidatePath("/");
  redirect(`/admin/fields?date=${slot_date}`);
}

export async function resetDayAction(formData: FormData) {
  const slot_date = String(formData.get("slot_date") ?? "");
  const supabase = await createClient();
  await supabase.from("field_slots").delete().eq("slot_date", slot_date);
  revalidatePath("/");
  redirect(`/admin/fields?date=${slot_date}`);
}
