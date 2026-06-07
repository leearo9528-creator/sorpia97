import Link from "next/link";
import { PhotoSlot } from "@/components/PhotoSlot";
import { CopyAddress } from "@/components/CopyAddress";
import { ContactActions } from "@/components/ContactActions";
import { BRAND } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import {
  PawPrint,
  Sparkles,
  Building2,
  UtensilsCrossed,
} from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key,value")
    .eq("key", "homepage_main");
  const mainPhoto = (settings ?? []).find((s: { key: string; value: string }) => s.key === "homepage_main")?.value ?? null;

  return (
    <div className="pb-12 space-y-5">

      {/* ── 헤더 ─────────────────────────────────────── */}
      <section className="section pt-3 md:pt-6">
        {mainPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainPhoto}
            alt="소르피아97"
            className="w-full aspect-[16/10] rounded-[24px] object-cover"
          />
        ) : (
          <PhotoSlot
            label="사진1"
            hint="카페 메인 전경"
            aspect="aspect-[16/10]"
            rounded="rounded-[24px]"
          />
        )}
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-[var(--brand-strong)] tracking-tight">
            {BRAND.name}
          </h1>
          <CopyAddress address={BRAND.address} />
        </div>
      </section>

      {/* ── 바로가기 그리드 ───────────────────────────── */}
      <section className="section">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/menu" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">카페 메뉴</div>
            <p className="mt-0.5 text-xs text-[var(--foreground-soft)]">음료 · 푸드 · 디저트</p>
          </Link>

          <Link href="/board" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <PawPrint className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">발자국</div>
            <p className="mt-0.5 text-xs text-[var(--foreground-soft)]">방문 후기 · 사진</p>
          </Link>

          <Link href="/pricing" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">이용안내</div>
            <p className="mt-0.5 text-xs text-[var(--foreground-soft)]">입장권 · 셀프목욕 · BBQ</p>
          </Link>

          <Link href="/now" className="card hover:bg-[var(--surface-2)]/30 transition-colors">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">오늘의 소르피아</div>
            <p className="mt-0.5 text-xs text-[var(--foreground-soft)]">오늘 다녀간 강아지</p>
          </Link>
        </div>
      </section>

      {/* ── 전화 · 길찾기 ────────────────────────────── */}
      <section className="section">
        <ContactActions />
      </section>

    </div>
  );
}
