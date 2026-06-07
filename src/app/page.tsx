import Link from "next/link";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { CopyAddress } from "@/components/CopyAddress";
import { BRAND } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { PawPrint, Sparkles, Building2, UtensilsCrossed, MapPin, Phone, Clock, ExternalLink } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("site_photos")
    .select("url,slot")
    .in("slot", ["homepage", "map_layout"])
    .order("sort_order");

  const homePhotos = (photos ?? []).filter((p: { slot: string; url: string }) => p.slot === "homepage").map((p: { url: string }) => p.url);
  const layoutPhoto = (photos ?? []).find((p: { slot: string; url: string }) => p.slot === "map_layout")?.url ?? null;

  return (
    <div className="pb-24 space-y-5">

      {/* ── 헤더 ─────────────────────────────────────── */}
      <section className="section pt-3 md:pt-6">
        <PhotoCarousel
          photos={homePhotos}
          aspect="aspect-[16/10]"
          rounded="rounded-[24px]"
        />
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

      {/* ── 오시는 길 ────────────────────────────────── */}
      <section className="section">
        <div className="text-center mb-5">
          <span className="eyebrow">Location</span>
          <h2 className="mt-1 text-2xl font-bold text-[var(--brand-strong)]">오시는 길</h2>
        </div>

        <div className="card space-y-4">
          <div>
            <p className="text-xs font-semibold text-[var(--foreground-mute)] uppercase tracking-wider mb-1">주소</p>
            <p className="font-medium text-[var(--brand-strong)]">{BRAND.address}</p>
            <p className="text-sm text-[var(--foreground-soft)] mt-0.5">{BRAND.landmark}</p>
          </div>
          <div className="h-px bg-[var(--line)]" />
          <div>
            <p className="text-xs font-semibold text-[var(--foreground-mute)] uppercase tracking-wider mb-1">운영시간</p>
            <p className="text-sm text-[var(--foreground-soft)]">
              <Clock className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              {BRAND.hoursWeekday}
            </p>
            <p className="text-sm text-[var(--foreground-soft)]">
              <Clock className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
              {BRAND.hoursWeekend}
            </p>
            <p className="text-xs text-red-500 mt-1">{BRAND.closedDay}</p>
          </div>
        </div>

        {/* 지도 링크 버튼 */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <a
            href={BRAND.naverMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#03C75A] text-white font-bold py-3.5 text-sm hover:opacity-90 transition-opacity"
          >
            <MapPin className="w-4 h-4" />
            네이버 지도
          </a>
          <a
            href={`https://map.kakao.com/link/search/${encodeURIComponent(BRAND.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#FEE500] text-[#3C1E1E] font-bold py-3.5 text-sm hover:opacity-90 transition-opacity"
          >
            <MapPin className="w-4 h-4" />
            카카오맵
          </a>
        </div>

        <a
          href={`tel:${BRAND.phoneRaw}`}
          className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] text-white font-bold py-3.5 text-sm hover:opacity-90 transition-opacity w-full"
        >
          <Phone className="w-4 h-4" />
          {BRAND.phone} 전화 문의
        </a>
      </section>

      {/* ── 배치도 ───────────────────────────────────── */}
      {layoutPhoto && (
        <section className="section">
          <div className="text-center mb-4">
            <span className="eyebrow">Map</span>
            <h2 className="mt-1 text-2xl font-bold text-[var(--brand-strong)]">소르피아 배치도</h2>
          </div>
          <div className="rounded-3xl overflow-hidden border border-[var(--line)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={layoutPhoto} alt="소르피아97 배치도" className="w-full object-contain" />
          </div>
          <a
            href={layoutPhoto}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[var(--foreground-mute)] hover:text-[var(--brand)]"
          >
            <ExternalLink className="w-3.5 h-3.5" /> 크게 보기
          </a>
        </section>
      )}

    </div>
  );
}
