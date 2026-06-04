import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PhotoSlot } from "@/components/PhotoSlot";
import { applyForPassFromLanding } from "./actions";
import {
  ShieldCheck,
  Check,
  Calendar,
  Gift,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  CircleHelp,
  Pill,
  Coffee,
} from "lucide-react";

type Pass = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  duration_months: number;
  monthly_product: string | null;
  monthly_drink_quota: number;
  price: number;
};

const STEPS = [
  {
    n: "01",
    Icon: ShieldCheck,
    title: "온라인 신청",
    body: "회원가입 후 패스 신청 버튼을 누르면 끝.",
  },
  {
    n: "02",
    Icon: Coffee,
    title: "매장에서 결제",
    body: "첫 방문 시 매장에서 결제하면 패스가 활성화돼요.",
  },
  {
    n: "03",
    Icon: Gift,
    title: "매월 수령",
    body: "매장 방문 시 이름·전화로 확인 후 약품 1개 + 음료 쿠폰 15장 지급.",
  },
];

const FAQS = [
  {
    q: "패스 가입 후 언제부터 사용 가능한가요?",
    a: "매장에서 결제가 완료된 시점부터 12개월간 유효합니다.",
  },
  {
    q: "음료 쿠폰 15장은 한 달 안에 다 써야 하나요?",
    a: "발급일로부터 약 45일간 유효합니다. 다음 달 분과 중복 보유도 가능합니다.",
  },
  {
    q: "약품을 한 달 건너뛰어도 되나요?",
    a: "월별 지급이라 이월되지 않습니다. 가급적 매월 방문해 받으시는 것을 권장합니다.",
  },
  {
    q: "환불 / 양도가 되나요?",
    a: "이미 지급된 회차는 환불 불가하며, 잔여 회차는 매장에서 별도 상담해 드립니다. 양도는 불가합니다.",
  },
];

export default async function PassLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;
  const supabase = await createClient();

  const [{ data: passes }, { data: userData }] = await Promise.all([
    supabase
      .from("subscription_passes")
      .select("id,code,name,description,duration_months,monthly_product,monthly_drink_quota,price")
      .eq("is_active", true)
      .order("price"),
    supabase.auth.getUser(),
  ]);

  const user = userData.user;
  const primary = (passes ?? [])[0] as Pass | undefined;

  return (
    <div className="pb-16">
      {/* ============ HERO ============ */}
      <section className="section pt-3 md:pt-6">
        <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-[var(--brand)] to-[var(--brand-strong)] text-white p-7 md:p-12">
          <div
            aria-hidden
            className="absolute -right-12 -top-12 w-72 h-72 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 chip-accent bg-[var(--accent)]/20 text-[var(--accent-soft)]">
              <Sparkles className="w-3.5 h-3.5" />
              12개월 한정 패스
            </span>
            <h1 className="mt-5 text-3xl md:text-5xl font-bold leading-tight tracking-tight">
              {primary?.name ?? "넥스가드 패스"}
            </h1>
            <p className="mt-4 text-base md:text-lg opacity-90 leading-relaxed">
              매월 <b>{primary?.monthly_product ?? "넥스가드"} 1개</b>와{" "}
              <b>음료 쿠폰 {primary?.monthly_drink_quota ?? 15}장</b>을 함께 받는
              패스. 강아지 건강과 카페 방문을 한 번에.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <a
                href="#apply"
                className="btn bg-[var(--accent)] text-[var(--brand-strong)] hover:opacity-90"
              >
                지금 신청하기
                <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="#how"
                className="btn border border-white/30 text-white hover:bg-white/10"
              >
                가입 방법
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 혜택 ============ */}
      <section className="section mt-10 md:mt-14">
        <span className="eyebrow">Benefits</span>
        <h2 className="mt-2 h-display">왜 패스로 받나요?</h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="card">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-strong)]">
              <Pill className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">
              매월 {primary?.monthly_product ?? "넥스가드"} 1개
            </div>
            <p className="mt-1 text-sm text-[var(--foreground-soft)]">
              잊지 않고 챙길 수 있도록 카페가 알려드리고 매장에서 직접 수령.
            </p>
          </div>
          <div className="card">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-deep)]">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="mt-3 font-bold text-[var(--brand-strong)]">
              매월 음료 쿠폰 {primary?.monthly_drink_quota ?? 15}장
            </div>
            <p className="mt-1 text-sm text-[var(--foreground-soft)]">
              혼자 와도, 친구와 와도 충분한 양. 약품과 같이 받아 즉시 사용.
            </p>
          </div>
        </div>

        {/* 비교표 */}
        <div className="mt-6 card !p-0 overflow-hidden">
          <div className="grid grid-cols-3 text-xs font-semibold text-[var(--foreground-mute)] uppercase tracking-wider border-b border-[var(--line)]">
            <div className="px-4 py-3">항목</div>
            <div className="px-4 py-3 text-center">개별 구매</div>
            <div className="px-4 py-3 text-center bg-[var(--brand-soft)]/40 text-[var(--brand-strong)]">
              패스
            </div>
          </div>
          {[
            ["약품 챙김", "직접 약국·병원", "매월 자동 안내"],
            ["음료 비용", "건당 5,000원~", "쿠폰 포함"],
            ["방문 동기", "필요 시", "매월 정기"],
          ].map(([label, a, b]) => (
            <div
              key={label}
              className="grid grid-cols-3 text-sm border-b last:border-b-0 border-[var(--line)]"
            >
              <div className="px-4 py-3 font-medium text-[var(--brand-strong)]">{label}</div>
              <div className="px-4 py-3 text-center text-[var(--foreground-mute)]">{a}</div>
              <div className="px-4 py-3 text-center bg-[var(--brand-soft)]/30 font-semibold text-[var(--brand-strong)]">
                {b}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 가입 흐름 ============ */}
      <section id="how" className="section mt-12 scroll-mt-24">
        <span className="eyebrow">How it works</span>
        <h2 className="mt-2 h-display">3스텝이면 끝</h2>

        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {STEPS.map(({ n, Icon, title, body }) => (
            <li key={n} className="card">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[var(--accent)]">{n}</span>
                <Icon className="w-5 h-5 text-[var(--brand)]" />
              </div>
              <div className="mt-3 font-bold text-[var(--brand-strong)]">{title}</div>
              <p className="mt-1 text-sm text-[var(--foreground-soft)] leading-relaxed">
                {body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-4 card-flat text-sm text-[var(--foreground-soft)] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 text-[var(--accent-deep)] shrink-0" />
          매장 결제 전까지는 패스가 활성화되지 않습니다. 신청 후 14일 이내 방문해
          주세요.
        </div>
      </section>

      {/* ============ 패스 카드 (가격 + 신청) ============ */}
      <section id="apply" className="section mt-12 scroll-mt-24">
        <span className="eyebrow">Pricing</span>
        <h2 className="mt-2 h-display">패스 신청</h2>

        {message && (
          <div className="mt-4 card flex items-start gap-3 border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800">{decodeURIComponent(message)}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 card flex items-start gap-3 border-red-200 bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{decodeURIComponent(error)}</p>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(passes ?? []).map((p) => (
            <div key={p.id} className="card relative overflow-hidden">
              <div
                aria-hidden
                className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-30 blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle, var(--accent-soft), transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="chip-accent">
                      <ShieldCheck className="w-3 h-3" />
                      {p.duration_months}개월 패스
                    </span>
                    <h3 className="mt-3 text-xl font-bold text-[var(--brand-strong)] tracking-tight">
                      {p.name}
                    </h3>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--brand-strong)]">
                    {p.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-[var(--foreground-mute)]">원</span>
                  <span className="text-xs text-[var(--foreground-mute)] ml-2">
                    · 월 {Math.round(p.price / p.duration_months).toLocaleString()}원꼴
                  </span>
                </div>

                <ul className="mt-5 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-[var(--brand)]" />
                    매월 <b className="text-[var(--brand-strong)]">{p.monthly_product}</b> 1개
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-[var(--brand)]" />
                    매월 음료 쿠폰 <b className="text-[var(--brand-strong)]">{p.monthly_drink_quota}장</b>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-[var(--brand)]" />
                    총 {p.duration_months}개월 유효, 자동갱신 없음
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-[var(--brand)]" />
                    매장 결제 (현장에서 확정)
                  </li>
                </ul>

                <form action={applyForPassFromLanding} className="mt-6">
                  <input type="hidden" name="pass_id" value={p.id} />
                  {user ? (
                    <button className="btn-primary w-full" type="submit">
                      신청하기
                    </button>
                  ) : (
                    <Link href="/login?next=/pass" className="btn-primary w-full">
                      로그인 후 신청
                    </Link>
                  )}
                </form>
                <p className="mt-2 text-[11px] text-center text-[var(--foreground-mute)]">
                  신청 후 14일 이내 매장 결제 시 활성화
                </p>
              </div>
            </div>
          ))}

          {(passes ?? []).length === 0 && (
            <p className="text-[var(--foreground-mute)] col-span-full text-center py-8">
              등록된 상품이 아직 없습니다.
            </p>
          )}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="section mt-12">
        <span className="eyebrow">FAQ</span>
        <h2 className="mt-2 h-display">자주 묻는 질문</h2>

        <div className="mt-6 card !p-0 divide-y divide-[var(--line)]">
          {FAQS.map((f) => (
            <details key={f.q} className="group">
              <summary className="px-4 py-4 cursor-pointer list-none flex items-start gap-3">
                <CircleHelp className="w-4 h-4 mt-0.5 text-[var(--brand)] shrink-0" />
                <span className="flex-1 font-semibold text-[var(--brand-strong)]">
                  {f.q}
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--foreground-mute)] mt-0.5 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-4 pb-4 pl-11 text-sm text-[var(--foreground-soft)] leading-relaxed">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ============ Bottom CTA ============ */}
      <section className="section mt-12">
        <div className="card-flat text-center py-10">
          <Calendar className="w-8 h-8 mx-auto text-[var(--brand)]" />
          <h3 className="mt-3 h-section">12개월, 약품 걱정 끝</h3>
          <p className="mt-2 text-sm text-[var(--foreground-soft)]">
            패스 하나면 강아지 건강 관리 루틴이 자연스럽게 자리잡아요.
          </p>
          <a href="#apply" className="btn-primary mt-5 inline-flex">
            지금 신청하기
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
