"use client";

import { Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  async function handleShare() {
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* canceled */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사되었어요.");
    } catch {
      window.prompt("이 링크를 복사하세요", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex flex-col items-center gap-1 text-xs text-[var(--foreground-soft)] hover:text-[var(--brand-strong)]"
    >
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--surface-2)]">
        <Share2 className="w-[18px] h-[18px]" />
      </span>
      공유
    </button>
  );
}
