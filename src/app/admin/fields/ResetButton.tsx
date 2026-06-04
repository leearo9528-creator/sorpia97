"use client";

import { RotateCcw } from "lucide-react";
import { resetDayAction } from "./actions";

export function ResetButton({ slotDate }: { slotDate: string }) {
  return (
    <form
      action={resetDayAction}
      onSubmit={(e) => {
        if (!confirm(`${slotDate} 모든 슬롯을 초기화(예약가능)하시겠습니까?`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slot_date" value={slotDate} />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-mute)] hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 border border-[var(--line)] transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        {slotDate} 전체 초기화
      </button>
    </form>
  );
}
