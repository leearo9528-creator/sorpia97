"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SlotStatus = "available" | "reserved" | "closed";

const NEXT_STATUS: Record<SlotStatus, SlotStatus> = {
  available: "reserved",
  reserved: "closed",
  closed: "available",
};

export async function cycleSlotAction(formData: FormData) {
  const yard = String(formData.get("yard") ?? "");
  const slot_date = String(formData.get("slot_date") ?? "");
  const slot_time = String(formData.get("slot_time") ?? "");
  const current = (formData.get("current") ?? "available") as SlotStatus;

  const next = NEXT_STATUS[current] ?? "available";
  const supabase = await createClient();

  if (next === "available") {
    await supabase
      .from("field_slots")
      .delete()
      .match({ yard, slot_date, slot_time });
  } else {
    await supabase.from("field_slots").upsert(
      { yard, slot_date, slot_time, status: next },
      { onConflict: "yard,slot_date,slot_time" },
    );
  }

  revalidatePath("/admin/fields");
  revalidatePath("/");
}
