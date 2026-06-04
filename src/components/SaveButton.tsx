"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";

export function SaveButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setSaved((v) => !v)}
      className="flex flex-col items-center gap-1 text-xs text-[var(--foreground-soft)] hover:text-[var(--brand-strong)]"
    >
      <span
        className={
          "inline-flex items-center justify-center w-10 h-10 rounded-full " +
          (saved
            ? "bg-[var(--accent-soft)] text-[var(--accent-deep)]"
            : "bg-[var(--surface-2)]")
        }
      >
        <Bookmark className="w-[18px] h-[18px]" fill={saved ? "currentColor" : "none"} />
      </span>
      {saved ? "저장됨" : "저장"}
    </button>
  );
}
