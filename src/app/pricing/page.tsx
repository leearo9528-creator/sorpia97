import { Bath, Dog, Check, AlertCircle } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="section py-5 md:py-10 space-y-10 pb-24">
      <header>
        <span className="eyebrow">Pricing</span>
        <h1 className="mt-2 h-display">요금 안내</h1>
        <p className="mt-2 text-sm text-[var(--foreground-soft)]">
          입장권 · 셀프목욕 요금표
        </p>
      </header>

      {/* ===== 댕댕이 입장권 ===== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Dog className="w-5 h-5 text-[var(--brand)]" />
          <h2 className="h-section">댕댕이 입장권</h2>
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
            <span className="text-sm font-bold text-[var(--accent-deep)]">패키지</span>
            <p className="text-xs text-[var(--accent-deep)]/80 mt-0.5">
              목욕 패키지 → 원하는 목욕 시간 예약 선점
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

      {/* ===== 셀프목욕 요금표 ===== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bath className="w-5 h-5 text-[var(--brand)]" />
          <h2 className="h-section">셀프목욕 요금표</h2>
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
    </div>
  );
}
