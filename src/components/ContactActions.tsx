import { BRAND } from "@/lib/brand";
import { Phone, MapPin } from "lucide-react";

// 전화걸기 · 네이버 길찾기 CTA (안내 사이트의 핵심 전환 버튼)
export function ContactActions({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <a
        href={`tel:${BRAND.phoneRaw}`}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] text-white font-bold py-3.5 hover:opacity-90 transition-opacity"
      >
        <Phone className="w-4 h-4" />
        전화 문의
      </a>
      <a
        href={BRAND.naverMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--surface-2)] text-[var(--brand-strong)] font-bold py-3.5 hover:bg-[var(--surface-2)]/70 transition-colors border border-[var(--line)]"
      >
        <MapPin className="w-4 h-4" />
        길찾기
      </a>
    </div>
  );
}
