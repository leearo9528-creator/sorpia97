import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { MapPin, Phone, Clock, Info } from "lucide-react";

export function Footer() {
  return (
    <footer className="hidden md:block mt-20 border-t border-[var(--line)] bg-[var(--surface-2)]/60">
      <div className="section-wide py-12 grid gap-8 md:grid-cols-4 text-sm">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--brand)] text-white text-sm font-bold">
              S
            </span>
            <div className="font-bold text-[var(--brand-strong)]">{BRAND.name}</div>
          </div>
          <p className="mt-3 text-[var(--foreground-soft)] leading-relaxed">
            {BRAND.tagline}
            <br />
            <span className="text-[var(--foreground-mute)]">{BRAND.subTagline}</span>
          </p>
        </div>
        <div>
          <div className="font-semibold text-[var(--brand-strong)] mb-3">위치</div>
          <ul className="space-y-2 text-[var(--foreground-soft)]">
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" />{BRAND.address}</li>
            <li className="text-xs text-[var(--foreground-mute)] pl-6">{BRAND.landmark}</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-[var(--brand-strong)] mb-3">운영</div>
          <ul className="space-y-2 text-[var(--foreground-soft)]">
            <li className="flex items-start gap-2"><Clock className="w-4 h-4 mt-0.5" />{BRAND.hours}</li>
            <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5" />{BRAND.phone}</li>
            <li className="flex items-start gap-2 text-xs text-[var(--foreground-mute)]"><Info className="w-4 h-4 mt-0.5" />{BRAND.notice}</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-[var(--foreground-mute)] pb-6">
        © {new Date().getFullYear()} {BRAND.name}
        <span className="mx-2">·</span>
        <Link href="/admin" className="hover:underline">관리자</Link>
      </div>
    </footer>
  );
}
