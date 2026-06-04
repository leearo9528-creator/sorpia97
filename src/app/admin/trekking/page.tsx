import { createClient } from "@/lib/supabase/server";
import { updateBookingStatusAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_META = {
  pending:   { label: "대기",  cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  confirmed: { label: "확정",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  canceled:  { label: "취소",  cls: "bg-gray-100 text-gray-500 border-gray-200" },
} as const;

const PKG_LABEL: Record<string, string> = {
  basic:   "베이직 (₩9,900)",
  premium: "프리미엄 (₩14,900)",
};

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatDateKo(s: string) {
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  });
}

type Booking = {
  id: string;
  guest_name: string;
  guest_phone: string;
  trek_date: string;
  party_size: number;
  package_type: string;
  status: string;
  created_at: string;
  note: string | null;
};

export default async function TrekkingAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const { date: dateParam, status: statusParam } = await searchParams;
  const today = toDateString(new Date());
  const targetDate = dateParam ?? today;

  const supabase = await createClient();

  let query = supabase
    .from("trekking_bookings")
    .select("id,guest_name,guest_phone,trek_date,party_size,package_type,status,created_at,note")
    .eq("trek_date", targetDate)
    .order("created_at", { ascending: false });

  if (statusParam && statusParam !== "all") {
    query = query.eq("status", statusParam);
  }

  const { data: bookings } = await query;
  const all = bookings ?? [];

  const counts = {
    total:     all.length,
    pending:   all.filter((b) => b.status === "pending").length,
    confirmed: all.filter((b) => b.status === "confirmed").length,
    canceled:  all.filter((b) => b.status === "canceled").length,
    people:    all.filter((b) => b.status !== "canceled").reduce((s, b) => s + b.party_size, 0),
  };

  return (
    <div className="grid gap-6 max-w-3xl">
      {/* 헤더 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-[var(--brand-strong)] text-lg">트레킹 패키지 예약</h2>
          <p className="text-sm text-[var(--foreground-mute)] mt-0.5">
            {formatDateKo(targetDate)}
            {targetDate === today && (
              <span className="ml-2 chip text-[10px] py-0.5">오늘</span>
            )}
          </p>
        </div>
        <form method="get" className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={targetDate}
            className="input !min-h-0 py-1.5 text-sm"
            style={{ width: "160px" }}
          />
          {statusParam && statusParam !== "all" && (
            <input type="hidden" name="status" value={statusParam} />
          )}
          <button type="submit" className="btn-primary btn-sm">이동</button>
        </form>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "전체",   value: counts.total,     sub: "건" },
          { label: "대기",   value: counts.pending,   sub: "건" },
          { label: "확정",   value: counts.confirmed, sub: "건" },
          { label: "예약 인원", value: counts.people, sub: "명" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card !p-4 text-center">
            <div className="text-2xl font-bold text-[var(--brand-strong)]">{value}</div>
            <div className="text-xs text-[var(--foreground-mute)] mt-0.5">
              {label} <span className="opacity-60">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all",       label: "전체" },
          { value: "pending",   label: "대기" },
          { value: "confirmed", label: "확정" },
          { value: "canceled",  label: "취소" },
        ].map(({ value, label }) => {
          const active = (statusParam ?? "all") === value;
          return (
            <a
              key={value}
              href={`?date=${targetDate}&status=${value}`}
              className={
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                (active
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[var(--surface-2)] text-[var(--foreground-soft)] hover:bg-[var(--brand-soft)]")
              }
            >
              {label}
            </a>
          );
        })}
      </div>

      {/* 예약 목록 */}
      <div className="grid gap-3">
        {all.length === 0 && (
          <div className="card text-center py-10 text-[var(--foreground-mute)] text-sm">
            해당 날짜의 예약이 없습니다.
          </div>
        )}

        {all.map((b: Booking) => {
          const meta = STATUS_META[b.status as keyof typeof STATUS_META] ?? STATUS_META.pending;
          return (
            <div key={b.id} className="card">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                {/* 예약자 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[var(--brand-strong)]">{b.guest_name}</span>
                    <span className="text-sm text-[var(--foreground-mute)]">{b.guest_phone}</span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--foreground-soft)]">
                    <span>{PKG_LABEL[b.package_type] ?? b.package_type}</span>
                    <span>{b.party_size}명</span>
                    <span className="text-[var(--foreground-mute)]">
                      신청 {new Date(b.created_at).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {b.note && (
                    <p className="mt-1.5 text-xs text-[var(--foreground-mute)] bg-[var(--surface-2)] rounded-lg px-2.5 py-1.5">
                      {b.note}
                    </p>
                  )}
                </div>

                {/* 상태 변경 버튼 */}
                <div className="flex gap-2 shrink-0">
                  {b.status !== "confirmed" && b.status !== "canceled" && (
                    <form action={updateBookingStatusAction}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="status" value="confirmed" />
                      <button type="submit" className="btn-primary btn-sm">확정</button>
                    </form>
                  )}
                  {b.status !== "canceled" && (
                    <form action={updateBookingStatusAction}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="status" value="canceled" />
                      <button
                        type="submit"
                        className="btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50"
                      >
                        취소
                      </button>
                    </form>
                  )}
                  {b.status === "canceled" && (
                    <form action={updateBookingStatusAction}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="status" value="pending" />
                      <button type="submit" className="btn-outline btn-sm">복원</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
