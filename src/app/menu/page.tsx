import { Clock, Flame } from "lucide-react";

const w = (x: number) => `${(x * 1000).toLocaleString()}원`;

const SIGNATURE = [
  { rank: 1, name: "흑임자 소르라떼", desc: "커피+크림+흑임자의 조화", price: 8.0 },
  { rank: 2, name: "돌체라떼", desc: "너무 달지도 쓰지도 않은 사장님 원픽", price: 8.5 },
  { rank: 3, name: "제주말차크림 라떼", desc: "제주말차와 크림, 우유의 만남", price: 8.5 },
];

const COFFEE = [
  { name: "아메리카노", price: 6.5 },
  { name: "핸드드립 디카페인", price: 7.5 },
  { name: "카페라떼 / 카페모카", price: 7.5 },
  { name: "바닐라라떼", price: 8.0 },
  { name: "카라멜 마끼아또", price: 8.0 },
  { name: "아포가토 젤라또", price: 8.0 },
];

const TEA = [
  { name: "유자차", price: 7.0 },
  { name: "TWG 잉글리시블랙퍼스트 (홍차)", price: 7.5 },
  { name: "TWG 실버문 (녹차)", price: null },
  { name: "TWG 바닐라라버번 (루이보스티)", price: null },
];

const NON_COFFEE = [
  { name: "아이스티", price: 7.0 },
  { name: "고구마라떼", price: 7.5 },
  { name: "초코라떼", price: 7.5 },
  { name: "망고라떼", price: 8.0 },
  { name: "딸기라떼", price: 8.0 },
  { name: "에이드 (자몽청/레몬청/블루레몬)", price: 8.5 },
  { name: "오레오쉐이크", price: 8.5 },
  { name: "요거트 스무디 (플레인/생딸기/생블루베리)", price: 9.0 },
  { name: "자바칩 쵸코 프라페", price: 9.0 },
  { name: "우베크림라떼", price: 8.5 },
];

const BREAD = [
  { name: "휘낭시에", price: 2.8 },
  { name: "에그타르트", price: 3.8 },
  { name: "베이글+버터프레시", price: 4.0 },
];

const GELATO = [
  { name: "젤라또 2가지 맛", price: 7.5 },
  { name: "젤라또 크로플", price: 7.3 },
  { name: "젤라또 허니브레드", price: 6.5 },
];

const CAKE = [
  { name: "말렌카 호두케이크", price: 6.8 },
  { name: "말렌카 코코아케이크", price: 6.8 },
];

const DELI = [
  { name: "잉글리시머핀 + 아메리카노", price: 11.0 },
  { name: "바질치아바타 샌드위치", price: 10.3 },
  { name: "바질치아바타 샌드위치 + 아메리카노 (set)", price: 16.8 },
  { name: "모짜렐라 피자", price: 15.0 },
  { name: "바삭순살치킨 300g / 500g", price: null, priceText: "13,000 / 20,000원" },
  { name: "계란치즈_김치볶음밥", price: 9.8 },
  { name: "계란치즈_소불고기볶음밥", price: 9.8 },
  { name: "치즈감자튀김", price: 7.0 },
];

const SUMMER = [
  { name: "옛날 팥빙수", price: 14.0 },
  { name: "쿠앤크 초코젤라또빙수", price: 15.0 },
  { name: "로투스 치즈 밀크 젤라또빙수", price: 16.0 },
];

const BEST = [
  { rank: 1, name: "바질치아바타 샌드위치 + 아메리카노 set", price: 16.8 },
  { rank: 2, name: "김치볶음밥", desc: "소고기 패티·수제소스·마요네즈·감자튀김", price: 9.8 },
  { rank: 3, name: "라볶이 + 튀김", desc: "소고기 패티·수제소스·마요네즈·감자튀김", price: 14.0 },
];

function MenuRow({ name, price, priceText }: { name: string; price: number | null; priceText?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] last:border-0">
      <span className="text-sm">{name}</span>
      <span className="text-sm font-semibold text-[var(--brand-strong)] shrink-0 ml-3">
        {priceText ?? (price !== null ? w(price) : "—")}
      </span>
    </div>
  );
}

function SectionCard({ title, label, children }: { title: string; label?: string; children: React.ReactNode }) {
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--line)] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-mute)]">{title}</span>
        {label && <span className="text-[11px] text-[var(--foreground-mute)]">{label}</span>}
      </div>
      {children}
    </div>
  );
}

export default function MenuPage() {
  return (
    <div className="section py-5 md:py-10 pb-24 space-y-8">
      <header>
        <span className="eyebrow">Menu</span>
        <h1 className="mt-2 h-display">카페 메뉴</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--foreground-mute)]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            평일 12:00–22:00 · 주말 11:00–22:00
          </span>
          <span>ICE 500ml · HOT 380ml</span>
        </div>
      </header>

      {/* BEST */}
      <section className="space-y-2">
        <h2 className="font-bold text-[var(--brand-strong)]">Best</h2>
        <div className="grid gap-2">
          {BEST.map((item) => (
            <div key={item.rank} className="card flex items-start gap-3 !py-3">
              <span className="text-lg font-bold text-[var(--accent)] w-6 shrink-0">{item.rank}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[var(--brand-strong)]">{item.name}</div>
                {item.desc && <p className="text-xs text-[var(--foreground-mute)] mt-0.5">{item.desc}</p>}
              </div>
              <span className="font-bold text-[var(--brand-strong)] shrink-0 text-sm">{w(item.price)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SIGNATURE */}
      <section className="space-y-2">
        <h2 className="font-bold text-[var(--brand-strong)]">Signature</h2>
        <div className="grid gap-2">
          {SIGNATURE.map((item) => (
            <div key={item.rank} className="card flex items-start gap-3 !py-3">
              <span className="text-base font-bold text-[var(--accent)] w-6 shrink-0">{item.rank}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[var(--brand-strong)]">{item.name}</div>
                <p className="text-xs text-[var(--foreground-mute)] mt-0.5">{item.desc}</p>
              </div>
              <span className="font-bold text-[var(--brand-strong)] shrink-0 text-sm">{w(item.price)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 음료 */}
      <section className="space-y-3">
        <h2 className="font-bold text-[var(--brand-strong)]">음료</h2>
        <SectionCard title="Coffee & Tea">
          {COFFEE.map((i) => <MenuRow key={i.name} {...i} />)}
        </SectionCard>
        <SectionCard title="Tea">
          {TEA.map((i) => <MenuRow key={i.name} {...i} />)}
        </SectionCard>
        <SectionCard title="Non-Coffee">
          {NON_COFFEE.map((i) => <MenuRow key={i.name} {...i} />)}
        </SectionCard>
      </section>

      {/* 푸드 */}
      <section className="space-y-3">
        <h2 className="font-bold text-[var(--brand-strong)]">푸드</h2>
        <SectionCard title="Deli & Sandwich">
          {DELI.map((i) => <MenuRow key={i.name} {...i} />)}
        </SectionCard>
        <SectionCard title="Bread">
          {BREAD.map((i) => <MenuRow key={i.name} {...i} />)}
        </SectionCard>
        <SectionCard title="젤라또">
          {GELATO.map((i) => <MenuRow key={i.name} {...i} />)}
        </SectionCard>
        <SectionCard title="케이크">
          {CAKE.map((i) => <MenuRow key={i.name} {...i} />)}
        </SectionCard>
      </section>

      {/* 여름 한정 */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[var(--accent-deep)]" />
          <h2 className="font-bold text-[var(--brand-strong)]">여름 한정 메뉴</h2>
        </div>
        <SectionCard title="Summer Special">
          {SUMMER.map((i) => <MenuRow key={i.name} {...i} />)}
        </SectionCard>
      </section>
    </div>
  );
}
