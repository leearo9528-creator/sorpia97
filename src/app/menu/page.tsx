import { Clock, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_text: string | null;
  rank: number | null;
  sort_order: number;
  is_active: boolean;
};

type MenuCategory = {
  id: string;
  code: string;
  name: string;
  sort_order: number;
  is_seasonal: boolean;
  menu_items: MenuItem[];
};

function fmt(price: number | null, priceText: string | null): string {
  if (priceText) return priceText;
  if (price !== null) return `${price.toLocaleString()}원`;
  return "—";
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] last:border-0">
      <span className="text-sm">{item.name}</span>
      <span className="text-sm font-semibold text-[var(--brand-strong)] shrink-0 ml-3">
        {fmt(item.price, item.price_text)}
      </span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--line)]">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-mute)]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export default async function MenuPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("menu_categories")
    .select("id,code,name,sort_order,is_seasonal,menu_items(id,name,description,price,price_text,rank,sort_order,is_active)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "menu_items" });

  const categories: MenuCategory[] = (data ?? []).map((c) => ({
    ...c,
    menu_items: ((c.menu_items ?? []) as MenuItem[]).filter((i) => i.is_active),
  }));

  const byCode = new Map(categories.map((c) => [c.code, c]));

  const best      = byCode.get("best");
  const signature = byCode.get("signature");
  const drinks    = ["coffee", "tea", "non_coffee"].map((c) => byCode.get(c)).filter(Boolean) as MenuCategory[];
  const foods     = ["deli", "bread", "gelato", "cake"].map((c) => byCode.get(c)).filter(Boolean) as MenuCategory[];
  const summer    = byCode.get("summer");

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
      {best && best.menu_items.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold text-[var(--brand-strong)]">Best</h2>
          <div className="grid gap-2">
            {best.menu_items.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)).map((item) => (
              <div key={item.id} className="card flex items-start gap-3 !py-3">
                <span className="text-lg font-bold text-[var(--accent)] w-6 shrink-0">{item.rank}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[var(--brand-strong)]">{item.name}</div>
                  {item.description && (
                    <p className="text-xs text-[var(--foreground-mute)] mt-0.5">{item.description}</p>
                  )}
                </div>
                <span className="font-bold text-[var(--brand-strong)] shrink-0 text-sm">
                  {fmt(item.price, item.price_text)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SIGNATURE */}
      {signature && signature.menu_items.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold text-[var(--brand-strong)]">Signature</h2>
          <div className="grid gap-2">
            {signature.menu_items.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)).map((item) => (
              <div key={item.id} className="card flex items-start gap-3 !py-3">
                <span className="text-base font-bold text-[var(--accent)] w-6 shrink-0">{item.rank}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[var(--brand-strong)]">{item.name}</div>
                  {item.description && (
                    <p className="text-xs text-[var(--foreground-mute)] mt-0.5">{item.description}</p>
                  )}
                </div>
                <span className="font-bold text-[var(--brand-strong)] shrink-0 text-sm">
                  {fmt(item.price, item.price_text)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 음료 */}
      {drinks.some((c) => c.menu_items.length > 0) && (
        <section className="space-y-3">
          <h2 className="font-bold text-[var(--brand-strong)]">음료</h2>
          {drinks.filter((c) => c.menu_items.length > 0).map((cat) => (
            <SectionCard key={cat.id} title={cat.name}>
              {cat.menu_items.map((item) => (
                <MenuRow key={item.id} item={item} />
              ))}
            </SectionCard>
          ))}
        </section>
      )}

      {/* 푸드 */}
      {foods.some((c) => c.menu_items.length > 0) && (
        <section className="space-y-3">
          <h2 className="font-bold text-[var(--brand-strong)]">푸드</h2>
          {foods.filter((c) => c.menu_items.length > 0).map((cat) => (
            <SectionCard key={cat.id} title={cat.name}>
              {cat.menu_items.map((item) => (
                <MenuRow key={item.id} item={item} />
              ))}
            </SectionCard>
          ))}
        </section>
      )}

      {/* 여름 한정 */}
      {summer && summer.menu_items.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[var(--accent-deep)]" />
            <h2 className="font-bold text-[var(--brand-strong)]">여름 한정 메뉴</h2>
          </div>
          <SectionCard title="Summer Special">
            {summer.menu_items.map((item) => (
              <MenuRow key={item.id} item={item} />
            ))}
          </SectionCard>
        </section>
      )}
    </div>
  );
}
