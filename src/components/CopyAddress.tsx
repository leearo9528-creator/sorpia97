"use client";

import { useState } from "react";
import { MapPin, Check, Copy } from "lucide-react";

export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      // 클립보드 권한이 없으면 수동 복사로 폴백
      window.prompt("주소를 복사하세요", address);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="주소 복사"
      className="mt-0.5 inline-flex items-center gap-1 text-xs text-[var(--foreground-mute)] hover:text-[var(--brand-strong)] transition-colors"
    >
      <MapPin className="w-3 h-3 shrink-0" />
      <span>{address}</span>
      {copied ? (
        <Check className="w-3 h-3 text-[var(--brand)] shrink-0" />
      ) : (
        <Copy className="w-3 h-3 opacity-60 shrink-0" />
      )}
      {copied && <span className="text-[var(--brand)] font-medium">복사됨</span>}
    </button>
  );
}
