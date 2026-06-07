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
} from "lucide-react";

const TABS = [
  { id: "entry", label: "입장료" },
  { id: "bath", label: "셀프목욕" },
  { id: "cafe", label: "카페" },
  { id: "bbq", label: "바베큐" },
  { id: "rental", label: "월요일 대관" },
];

export default function PricingPage() {
  return (
    <div className="section py-5 md:py-10 pb-24">
      <header>
        <span className="eyebrow">Guide</span>
        <h1 className="mt-2 h-display">이용안내</h1>
        <p className="mt-2 text-sm text-[var(--foreground-soft)]">
          강아지 입장료부터 시작해요 · 모든 결제는 현장에서 진행됩니다
        </p>
      </header>

      {/* 앵커 탭 */}
      <div className="mt-5">
        <SectionTabs tabs={TABS} />
      </div>

      <div className="space-y-10 mt-6">
        {/* ===== ① 입장료 (필수) ===== */}
        <section id="entry" className="space-y-4 scroll-mt-32">
          <div className="flex items-center gap-2">
            <Dog className="w-5 h-5 text-[var(--brand)]" />
            <h2 className="h-section">강아지 입장료</h2>
            <span className="chip bg-[var(--brand)] text-white">필수</span>
          </div>

          {/* 기본 입장료 */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--line)]">
              <span className="text-xs font-semibold text-[var(--foreground-mute)] uppercase tracking-wider">기본 입장료</span>
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

          {/* 패키지 */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-4 py-3 bg-[var(--accent-soft)] border-b border-[var(--line)]">
              <span className="text-sm font-bold text-[var(--accent-deep)]">입장 + 수영 + 목욕 패키지</span>
              <p className="text-xs text-[var(--accent-deep)]/80 mt-0.5">
                패키지 결제 시 원하는 목욕 시간 예약 선점
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[360px]">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--foreground-mute)]">구분</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-[var(--foreground-mute)]">7kg</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-[var(--foreground-mute)]">15kg</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-[var(--foreground-mute)]">30kg</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-[var(--foreground-mute)]">30kg+</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  <tr>
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">입장+수영</td>
                    <td className="px-3 py-3 text-center text-[var(--brand-strong)] font-semibold" colSpan={2}>1만원</td>
                    <td className="px-3 py-3 text-center text-[var(--brand-strong)] font-semibold" colSpan={2}>2만원</td>
                  </tr>
                  <tr className="bg-[var(--accent-soft)]/40">
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                      입장+수영<br />
                      <span className="text-[var(--accent-deep)] font-bold">+목욕</span>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-[var(--accent-deep)]">15,000</td>
                    <td className="px-3 py-3 text-center font-bold text-[var(--accent-deep)]">22,000</td>
                    <td className="px-3 py-3 text-center font-bold text-[var(--accent-deep)]">40,000</td>
                    <td className="px-3 py-3 text-center font-bold text-[var(--accent-deep)]">45,000</td>
                  </tr>
                  <tr className="text-[var(--foreground-mute)]">
                    <td className="px-4 py-3 text-xs">원가</td>
                    <td className="px-3 py-3 text-center text-xs line-through">17,000</td>
                    <td className="px-3 py-3 text-center text-xs line-through">25,000</td>
                    <td className="px-3 py-3 text-center text-xs line-through">45,000</td>
                    <td className="px-3 py-3 text-center text-xs line-through">55,000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-[var(--line)] flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--foreground-mute)]">결제 후 패키지로 번복은 불가해요 ㅠ</p>
            </div>
          </div>
        </section>

        {/* ===== ② 셀프목욕 (선택) ===== */}
        <section id="bath" className="space-y-4 scroll-mt-32">
          <div className="flex items-center gap-2">
            <Bath className="w-5 h-5 text-[var(--brand)]" />
            <h2 className="h-section">셀프목욕</h2>
            <span className="chip">선택</span>
          </div>

          {/* BATH */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--line)] flex items-center gap-2">
              <span className="inline-flex items-center rounded-lg bg-[var(--brand)] text-white text-xs font-bold px-2.5 py-1">
                BATH
              </span>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {[
                { label: "소형견 (7kg 이하)", sub: "1시간 사용", price: "7,000원" },
                { label: "중형견 (15kg 이하)", sub: "1시간 사용", price: "15,000원" },
                { label: "대형견 (30kg 이하)", sub: "1시간 사용", price: "25,000원" },
                { label: "대형견 (30kg 초과)", sub: "2시간 사용", price: "35,000원" },
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
          </div>

          {/* 제공품목 */}
          <div className="card space-y-2">
            <p className="text-xs font-bold text-[var(--brand-strong)] uppercase tracking-wider mb-3">제공품목</p>
            {[
              "하이포닉 샴푸 kg당 정량 + 20ml",
              "일회용 수건 1장 / 대형견 2장",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-[var(--foreground-soft)]">
                <Check className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>

          {/* 추가품목 */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--line)]">
              <span className="text-xs font-semibold text-[var(--foreground-mute)] uppercase tracking-wider">추가품목</span>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {[
                { label: "일회용 우비", sub: "털 붙는 것 방지", price: "3,000원" },
                { label: "디얼스코 머드팩", sub: "", price: "8,500원" },
                { label: "추가 일회용 수건", sub: "", price: "1,000원" },
              ].map(({ label, sub, price }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <span className="text-sm font-medium">{label}</span>
                    {sub && <span className="ml-2 text-xs text-[var(--foreground-mute)]">{sub}</span>}
                  </div>
                  <span className="font-semibold text-[var(--foreground)]">{price}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== ③ 카페 (선택) ===== */}
        <section id="cafe" className="space-y-4 scroll-mt-32">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-[var(--brand)]" />
            <h2 className="h-section">카페</h2>
            <span className="chip">선택</span>
          </div>
          <Link
            href="/menu"
            className="card flex items-center gap-4 hover:bg-[var(--surface-2)]/30 transition-colors"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)] shrink-0">
              <Coffee className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-[var(--brand-strong)]">전체 메뉴 보기</div>
              <p className="mt-0.5 text-xs text-[var(--foreground-soft)]">
                음료 · 푸드 · 디저트 · 여름 한정 메뉴
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--foreground-mute)]" />
          </Link>
        </section>

        {/* ===== ④ 바베큐 (선택) ===== */}
        <section id="bbq" className="space-y-4 scroll-mt-32">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[var(--accent-deep)]" />
            <h2 className="h-section">바베큐장</h2>
            <span className="chip">선택</span>
          </div>

          {/* 요금 */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--line)]">
              <span className="text-xs font-semibold text-[var(--foreground-mute)] uppercase tracking-wider">이용 요금</span>
            </div>
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--brand)]" />
                <span className="text-sm font-medium">1인</span>
                <span className="text-xs text-[var(--foreground-mute)]">(미취학 아동 불포함 가능)</span>
              </div>
              <span className="text-xl font-bold text-[var(--brand-strong)]">39,000원</span>
            </div>
          </div>

          {/* 1인 기본 구성 */}
          <div className="card space-y-4">
            <p className="text-xs font-bold text-[var(--brand-strong)] uppercase tracking-wider">1인 기본 구성</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-[var(--foreground-mute)] mb-1.5">메인 구성</p>
                <div className="space-y-1.5">
                  {["국내산 암돼지고기 250g", "그릴드 소시지", "구워 먹는 찰옥수수", "모둠 채소 (버섯, 대파 등)"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-[var(--foreground-soft)]">
                      <Check className="w-4 h-4 text-[var(--brand)] shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-[var(--line)] pt-3">
                <p className="text-xs font-semibold text-[var(--foreground-mute)] mb-1.5">사이드 & 찌개</p>
                <div className="space-y-1.5">
                  {["무한리필 반찬 (무쌈, 김치, 무말랭이, 마늘)", "된장찌개 / 김치찌개 / 부대찌개 中 택 1"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-[var(--foreground-soft)]">
                      <Check className="w-4 h-4 text-[var(--brand)] shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-[var(--line)] pt-3">
                <p className="text-xs font-semibold text-[var(--foreground-mute)] mb-1.5">카페 음료 포함</p>
                <div className="flex items-start gap-2 text-sm text-[var(--foreground-soft)]">
                  <Check className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                  <span>
                    1인당 아메리카노 1잔 증정{" "}
                    <span className="text-[var(--accent-deep)] font-medium">(오픈이벤트)</span>
                    <br />
                    <span className="text-xs text-[var(--foreground-mute)]">다른 메뉴 변경 시 +1,000원</span>
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-[var(--foreground-mute)] border-t border-[var(--line)] pt-3">
              무인편의점(주류·음료·한강라면·과자) · 카페&운동장 무제한 이용 · 포토존 즉석 인화 서비스
            </p>
          </div>

          {/* 이용방법 */}
          <div className="card !p-0 overflow-hidden">
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--line)]">
              <span className="text-xs font-semibold text-[var(--foreground-mute)] uppercase tracking-wider">이용 방법</span>
              <p className="text-[11px] text-[var(--foreground-mute)] mt-0.5">장갑을 꼭 착용해 주세요!</p>
            </div>
            <ol className="divide-y divide-[var(--line)]">
              {[
                { n: 1, main: '화로 가운데 "화로불솟"을 넣어 토치로 불을 피워주세요.', sub: '불이 30초 안으로 잘 붙습니다. 더 붙이면 위험해요!' },
                { n: 2, main: '바로 고기굽기 NO! 5분 후 석쇠를 올리고 구워주세요.', sub: '너무 세게 불을 붙이면 화재위험이 있습니다. 항상 조심!' },
                { n: 3, main: '추천 순서: 고기 → 소세지 → 김치 → 버섯 → 파', sub: '추가: 부대찌개 (연탄·용기 포함), 닭꼬치 (데리야키 소스 포함)' },
                { n: 4, main: '텐트 이용시간: 2시간', sub: '10분 전 정리정돈 + 분리수거 후 용품 반납 필수!' },
                { n: 5, main: '분리수거: 음식물·재활용·일반쓰레기', sub: '조리도구·토치·부탄가스 등은 예쁜 캠핑박스에 담아 반납해 주세요.' },
                { n: 6, main: '카페로 돌아가 용품 반납 → 아메리카노 수령 → 운동장에서 계속!', sub: '' },
                { n: 7, main: '피크닉 텐트 이용 고객: 아메리카노 → 다른 음료 변경 Only +1,000원', sub: '(비싼 거 드세요)' },
              ].map(({ n, main, sub }) => (
                <div key={n} className="flex items-start gap-3 px-4 py-3.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--brand)] text-white text-xs font-bold shrink-0 mt-0.5">{n}</span>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{main}</p>
                    {sub && <p className="text-xs text-[var(--foreground-mute)] mt-0.5">{sub}</p>}
                  </div>
                </div>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== ⑤ 월요일 단독 대관 (특별) ===== */}
        <section id="rental" className="space-y-4 scroll-mt-32">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[var(--accent-deep)]" />
            <h2 className="h-section">월요일 단독 대관</h2>
            <span className="chip bg-[var(--accent-soft)] text-[var(--accent-deep)]">예약</span>
          </div>

          <div className="card space-y-3">
            <p className="text-sm text-[var(--foreground-soft)] leading-relaxed">
              정기 휴무일인 <b className="text-[var(--brand-strong)]">매주 월요일</b>, 5,000평 전 공간을
              단독으로 대관할 수 있어요. 강아지 모임·동호회·촬영·생일파티 등에 추천합니다.
            </p>
            <div className="border-t border-[var(--line)] pt-3 space-y-1.5">
              {["전 공간 단독 사용 (운동장·수영장·카페·바베큐장)", "단체 모임 · 펫 동반 행사 · 촬영 가능"].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-[var(--foreground-soft)]">
                  <Check className="w-4 h-4 text-[var(--brand)] shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--foreground-mute)] border-t border-[var(--line)] pt-3">
              요금·일정은 인원과 구성에 따라 달라져요. 전화로 문의해 주세요.
            </p>
          </div>
        </section>

        {/* ===== 전화 · 길찾기 CTA ===== */}
        <section className="space-y-4">
          <div className="card bg-[var(--brand-soft)]/40">
            <p className="text-sm font-bold text-[var(--brand-strong)]">방문 전 확인해 주세요</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--foreground-soft)]">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-[var(--brand)] shrink-0" />
                {BRAND.hours}
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 text-[var(--brand)] shrink-0" />
                모든 결제는 현장에서 진행됩니다.
              </li>
            </ul>
            <ContactActions className="mt-4" />
          </div>
        </section>
      </div>
    </div>
  );
}
