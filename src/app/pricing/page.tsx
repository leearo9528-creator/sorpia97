import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { SectionTabs } from "@/components/SectionTabs";
import { ContactActions } from "@/components/ContactActions";
import {
  Bath,
  Dog,
  Check,
  AlertCircle,
  Flame,
  Users,
  Coffee,
  CalendarDays,
  ChevronRight,
  Clock,
  Waves,
} from "lucide-react";

const TABS = [
  { id: "entry", label: "입장안내" },
  { id: "optional", label: "선택이용" },
  { id: "rental", label: "월요일 대관" },
];

export default function PricingPage() {
  return (
    <div className="section py-5 md:py-10 pb-24">
      <header>
        <span className="eyebrow">Guide</span>
        <h1 className="mt-2 h-display">이용안내</h1>
        <p className="mt-2 text-sm text-[var(--foreground-soft)]">
          모든 결제는 현장에서 진행됩니다
        </p>
      </header>

      <div className="mt-5">
        <SectionTabs tabs={TABS} />
      </div>

      <div className="space-y-10 mt-6">

        {/* ===== ① 입장 안내 (필수) ===== */}
        <section id="entry" className="space-y-4 scroll-mt-32">
          <div className="flex items-center gap-2">
            <Dog className="w-5 h-5 text-[var(--brand)]" />
            <h2 className="h-section">입장 안내</h2>
            <span className="chip bg-[var(--brand)] text-white text-[11px]">필수</span>
          </div>

          {/* 강아지 입장료 */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--line)]">
              <p className="text-xs font-semibold text-[var(--foreground-mute)] uppercase tracking-wider">강아지 입장료</p>
            </div>
            <div className="divide-y divide-[var(--line)]">
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm font-medium">15kg 이하</span>
                <span className="font-bold text-[var(--brand-strong)]">5,000원</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm font-medium">15kg 초과</span>
                <span className="font-bold text-[var(--brand-strong)]">10,000원</span>
              </div>
            </div>
          </div>

          {/* 보호자 1인 1음료 */}
          <div className="card border-2 border-[var(--brand-soft)]">
            <div className="flex items-start gap-3">
              <Coffee className="w-5 h-5 text-[var(--brand)] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[var(--brand-strong)]">보호자 1인 1음료 필수</p>
                <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                  카페에서 음료 1잔 이상 주문해 주세요.
                </p>
                <Link
                  href="/menu"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--brand)] font-semibold"
                >
                  메뉴 보기 <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* OR 구분선 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--line)]" />
            <span className="text-xs font-bold text-[var(--foreground-mute)] px-2">또는</span>
            <div className="flex-1 h-px bg-[var(--line)]" />
          </div>

          {/* 바베큐 대안 */}
          <div className="card !p-0 overflow-hidden border-2 border-[var(--accent-soft)]">
            <div className="px-4 py-3 bg-[var(--accent-soft)] border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[var(--accent-deep)]" />
                <span className="font-bold text-[var(--accent-deep)]">바베큐 1인 39,000원</span>
                <span className="text-xs bg-[var(--accent-deep)] text-white rounded-full px-2 py-0.5 font-semibold">입장료 대체 가능</span>
              </div>
              <p className="text-xs text-[var(--accent-deep)]/80 mt-0.5">
                바베큐 결제 시 강아지 입장료 + 음료가 포함됩니다
              </p>
            </div>
            <div className="px-4 py-3 space-y-1.5">
              {[
                "국내산 암돼지고기 250g + 그릴드 소시지 + 찰옥수수 + 모둠채소",
                "무한리필 반찬 · 된장/김치/부대찌개 택 1",
                "아메리카노 1잔 증정 (오픈이벤트, 다른 음료 변경 시 +1,000원)",
                "무인편의점 · 카페 & 운동장 무제한 · 포토존 즉석인화",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-[var(--foreground-soft)]">
                  <Check className="w-4 h-4 text-[var(--accent-deep)] shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>

            {/* 바베큐 이용 방법 */}
            <div className="border-t border-[var(--line)]">
              <div className="px-4 py-2.5 bg-[var(--surface-2)]">
                <span className="text-[11px] font-semibold text-[var(--foreground-mute)] uppercase tracking-wider">이용 방법 (장갑 필수 착용)</span>
              </div>
              <ol className="divide-y divide-[var(--line)]">
                {[
                  { n: 1, main: '화로에 "화로불솟"을 넣고 토치로 점화', sub: '30초 내 점화됩니다. 과하게 붙이면 위험!' },
                  { n: 2, main: '5분 후 석쇠 올리고 구이 시작', sub: '추천 순서: 고기 → 소시지 → 김치 → 버섯 → 파' },
                  { n: 3, main: '텐트 이용시간 2시간', sub: '10분 전 정리정돈 + 분리수거 후 용품 반납' },
                  { n: 4, main: '카페 복귀 → 용품 반납 → 음료 수령 → 운동장 계속 이용', sub: '' },
                ].map(({ n, main, sub }) => (
                  <div key={n} className="flex items-start gap-3 px-4 py-3">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent-deep)] text-white text-[10px] font-bold shrink-0 mt-0.5">{n}</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{main}</p>
                      {sub && <p className="text-xs text-[var(--foreground-mute)] mt-0.5">{sub}</p>}
                    </div>
                  </div>
                ))}
              </ol>
            </div>
          </div>

        </section>

        {/* ===== ② 선택 이용 ===== */}
        <section id="optional" className="space-y-4 scroll-mt-32">
          <div className="flex items-center gap-2">
            <span className="h-section">선택 이용</span>
            <span className="chip text-[11px]">추가</span>
          </div>

          {/* 수영장 */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-4 py-3 bg-[var(--brand-soft)] border-b border-[var(--line)] flex items-center gap-2">
              <Waves className="w-4 h-4 text-[var(--brand-strong)]" />
              <span className="font-semibold text-[var(--brand-strong)]">수영장</span>
            </div>
            <div className="divide-y divide-[var(--line)]">
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm font-medium">15kg 이하</span>
                <span className="font-bold text-[var(--brand-strong)]">입장료 포함</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <span className="text-sm font-medium">15kg 초과</span>
                  <span className="ml-2 text-xs text-[var(--foreground-mute)]">입장+수영 패키지</span>
                </div>
                <span className="font-bold text-[var(--brand-strong)]">20,000원</span>
              </div>
              <div className="px-4 py-3 bg-[var(--surface-2)]">
                <p className="text-xs text-[var(--foreground-mute)]">
                  매주 화요일은 수영장 물 교체일 · 오전 방문 시 수영장 이용 대기 가능
                </p>
              </div>
            </div>
          </div>

          {/* 셀프목욕 */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--line)] flex items-center gap-2">
              <Bath className="w-4 h-4 text-[var(--brand-strong)]" />
              <span className="font-semibold text-[var(--brand-strong)]">셀프목욕</span>
              <span className="inline-flex items-center rounded-lg bg-[var(--brand)] text-white text-[10px] font-bold px-2 py-0.5 ml-1">BATH</span>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {[
                { label: "소형견 (7kg 이하)", sub: "1시간", price: "7,000원" },
                { label: "중형견 (15kg 이하)", sub: "1시간", price: "15,000원" },
                { label: "대형견 (30kg 이하)", sub: "1시간", price: "25,000원" },
                { label: "대형견 (30kg 초과)", sub: "2시간", price: "35,000원" },
              ].map(({ label, sub, price }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <span className="text-sm font-medium">{label}</span>
                    <span className="ml-2 text-xs text-[var(--foreground-mute)]">{sub}</span>
                  </div>
                  <span className="font-bold text-[var(--brand-strong)]">{price}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-[var(--line)] space-y-1">
              <p className="text-[11px] font-semibold text-[var(--foreground-mute)]">포함</p>
              <p className="text-xs text-[var(--foreground-soft)]">하이포닉 샴푸 · 일회용 수건 (대형견 2장)</p>
              <p className="text-[11px] font-semibold text-[var(--foreground-mute)] mt-2">추가 선택</p>
              <p className="text-xs text-[var(--foreground-soft)]">일회용 우비 3,000원 · 디얼스코 머드팩 8,500원 · 추가 수건 1,000원</p>
            </div>
          </div>

          {/* 목욕 패키지 안내 */}
          <div className="card bg-[var(--accent-soft)]/50">
            <p className="text-xs font-bold text-[var(--accent-deep)] mb-2">입장+수영+목욕 패키지</p>
            <p className="text-xs text-[var(--foreground-soft)] mb-2">패키지 결제 시 원하는 목욕 시간 예약 선점 가능</p>
            <div className="overflow-x-auto">
              <table className="text-xs min-w-[300px] w-full">
                <thead>
                  <tr className="border-b border-[var(--line)]">
                    <th className="text-left py-1.5 font-semibold text-[var(--foreground-mute)]">7kg</th>
                    <th className="text-center py-1.5 font-semibold text-[var(--foreground-mute)]">15kg</th>
                    <th className="text-center py-1.5 font-semibold text-[var(--foreground-mute)]">30kg</th>
                    <th className="text-right py-1.5 font-semibold text-[var(--foreground-mute)]">30kg+</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1.5 font-bold text-[var(--accent-deep)]">15,000</td>
                    <td className="py-1.5 text-center font-bold text-[var(--accent-deep)]">22,000</td>
                    <td className="py-1.5 text-center font-bold text-[var(--accent-deep)]">40,000</td>
                    <td className="py-1.5 text-right font-bold text-[var(--accent-deep)]">45,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[var(--foreground-mute)] mt-2">결제 후 패키지 번복 불가</p>
          </div>
        </section>

        {/* ===== ③ 월요일 단독 대관 ===== */}
        <section id="rental" className="space-y-4 scroll-mt-32">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[var(--accent-deep)]" />
            <h2 className="h-section">월요일 단독 대관</h2>
            <span className="chip bg-[var(--accent-soft)] text-[var(--accent-deep)] text-[11px]">Only My Dog</span>
          </div>

          <div className="card bg-[var(--brand-soft)]/40 text-sm text-[var(--foreground-soft)]">
            <p className="font-semibold text-[var(--brand-strong)] mb-1">매주 월요일 · 3시간 단독 이용</p>
            <p>정기 휴무일인 월요일에 소르피아 전 공간을 단독으로 대관할 수 있어요. 강아지 모임·동호회·촬영·생일파티에 추천합니다.</p>
            <p className="mt-1.5 text-xs text-[var(--foreground-mute)]">※ 평일 대관도 가능합니다. 전화로 문의해 주세요.</p>
          </div>

          {/* 요금표 */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--line)]">
              <span className="text-xs font-semibold text-[var(--foreground-mute)] uppercase tracking-wider">운동장 대관 요금 (3시간)</span>
            </div>
            <div className="divide-y divide-[var(--line)]">
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[var(--brand-strong)]">① 대형견 운동장</p>
                    <p className="text-xs text-[var(--foreground-mute)] mt-0.5">700평 운동장 + 11m 냉난방 셸터</p>
                  </div>
                  <span className="font-bold text-[var(--brand-strong)]">55,000원</span>
                </div>
                <div className="mt-2 flex items-start gap-2 text-xs text-[var(--foreground-soft)]">
                  <Check className="w-3.5 h-3.5 text-[var(--brand)] shrink-0 mt-0.5" />
                  수영장 단독이용 추가 가능 <span className="text-[var(--accent-deep)] font-semibold ml-1">(+30,000원)</span>
                </div>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[var(--brand-strong)]">② 중형견 운동장</p>
                    <p className="text-xs text-[var(--foreground-mute)] mt-0.5">약 500평 운동장 + 7m 냉난방 셸터</p>
                  </div>
                  <span className="font-bold text-[var(--brand-strong)]">55,000원</span>
                </div>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[var(--brand-strong)]">③ 소형견 운동장</p>
                    <p className="text-xs text-[var(--foreground-mute)] mt-0.5">약 250평 + 바베큐 텐트 3개</p>
                  </div>
                  <span className="font-bold text-[var(--brand-strong)]">45,000원</span>
                </div>
              </div>
            </div>
          </div>

          {/* 대관 포함 안내 */}
          <div className="card space-y-2">
            <p className="text-xs font-bold text-[var(--brand-strong)] mb-2">대관 중 이용 안내</p>
            {[
              "카페 주문 — 대관 시작 후 30분간 가능",
              "무인편의점 — 대관 중 계속 이용 가능",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-[var(--foreground-soft)]">
                <Check className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>

          <div className="card flex items-start gap-3 bg-[var(--accent-soft)]/40">
            <AlertCircle className="w-4 h-4 text-[var(--accent-deep)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--foreground-soft)]">
              대관 문의는 전화로 해주세요. 일정·인원에 따라 안내드립니다.
            </p>
          </div>
        </section>

        {/* ===== 전화 · 길찾기 CTA ===== */}
        <section className="space-y-3">
          <div className="card bg-[var(--brand-soft)]/40">
            <p className="text-sm font-bold text-[var(--brand-strong)]">방문 전 확인해 주세요</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--foreground-soft)]">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-[var(--brand)] shrink-0" />
                {BRAND.hours}
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 text-[var(--brand)] shrink-0" />
                모든 결제는 현장에서 진행됩니다
              </li>
            </ul>
            <ContactActions className="mt-4" />
          </div>
        </section>

      </div>
    </div>
  );
}
