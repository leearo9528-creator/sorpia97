import { createClient } from "@/lib/supabase/server";
import { setSlotAction } from "./actions";
import { ResetButton } from "./ResetButton";

export const dynamic = "force-dynamic";

const YARDS = ["대형운동장", "중형운동장", "소형운동장"] as const;
const TIMES = ["12:00", "15:00", "18:00"] as const;

const TIME_LABEL: Record<string, string> = {
  "12:00": "12시",
  "15:00": "15시",
  "18:00": "18시",
};
const YARD_PRICE: Record<string, string> = {
  대형운동장: "55,000원",
  중형운동장: "55,000원",
  소형운동장: "45,000원",
};

type SlotStatus = "available" | "reserved" | "closed";

const STATUS_OPTIONS: { value: SlotStatus; label: string; cls: string }[] = [
  { value: "available", label: "예약가능", cls: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { value: "reserved",  label: "예약됨",   cls: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100" },
  { value: "closed",    label: "마감",     cls: "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100" },
];

const ACTIVE_CLS: Record<SlotStatus, string> = {
  available: "border-emerald-500 bg-emerald-500 text-white shadow-sm",
  reserved:  "border-red-500 bg-red-500 text-white shadow-sm",
  closed:    "border-gray-500 bg-gray-500 text-white shadow-sm",
};

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatDateKo(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}

export default async function FieldsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; }>;
}) {
  const { date: dateParam } = await searchParams;
  const today = toDateString(new Date());
  const targetDate = dateParam ?? today;
  const isToday = targetDate === today;

  const supabase = await createClient();
  const { data: slots } = await supabase
    .from("field_slots")
    .select("yard,slot_time,status")
    .eq("slot_date", targetDate);

  const statusMap = new Map<string, SlotStatus>();
  for (const s of slots ?? []) {
    statusMap.set(`${s.yard}|${s.slot_time}`, s.status as SlotStatus);
  }

  const reservedCount = (slots ?? []).filter((s) => s.status === "reserved").length;
  const closedCount = (slots ?? []).filter((s) => s.status === "closed").length;

  return (
    <div className="grid gap-6 max-w-2xl">
      {/* 헤더 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-[var(--brand-strong)] text-lg">운동장 대관 현황</h2>
          <p className="text-sm text-[var(--foreground-mute)] mt-0.5">
            {formatDateKo(targetDate)}
            {isToday && <span className="ml-2 chip text-[10px] py-0.5">오늘</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 날짜 이동 */}
          <form method="get" className="flex items-center gap-2">
            <input
              type="date"
              name="date"
              defaultValue={targetDate}
              className="input !min-h-0 py-1.5 text-sm"
              style={{ width: "160px" }}
            />
            <button type="submit" className="btn-primary btn-sm">이동</button>
          </form>
        </div>
      </div>

      {/* 요약 뱃지 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="chip-accent text-xs">예약됨 {reservedCount}건</span>
        {closedCount > 0 && (
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">마감 {closedCount}건</span>
        )}
        <span className="text-xs text-[var(--foreground-mute)]">
          전체 {YARDS.length * TIMES.length}슬롯 중 {reservedCount + closedCount}건 처리
        </span>
      </div>

      {/* 슬롯 그리드 */}
      <div className="grid gap-4">
        {YARDS.map((yard) => (
          <div key={yard} className="card !p-0 overflow-hidden">
            {/* 운동장 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] bg-[var(--surface-2)]">
              <div>
                <span className="font-bold text-[var(--brand-strong)]">{yard}</span>
                <span className="ml-2 text-xs text-[var(--foreground-mute)]">{YARD_PRICE[yard]}</span>
              </div>
            </div>

            {/* 시간별 행 */}
            <div className="divide-y divide-[var(--line)]">
              {TIMES.map((time) => {
                const current = statusMap.get(`${yard}|${time}`) ?? "available";
                return (
                  <div key={time} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-10 text-sm font-semibold text-[var(--foreground-soft)] shrink-0">
                      {TIME_LABEL[time]}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.map((opt) => {
                        const isActive = current === opt.value;
                        return (
                          <form key={opt.value} action={setSlotAction}>
                            <input type="hidden" name="yard" value={yard} />
                            <input type="hidden" name="slot_date" value={targetDate} />
                            <input type="hidden" name="slot_time" value={time} />
                            <input type="hidden" name="status" value={opt.value} />
                            <button
                              type="submit"
                              disabled={isActive}
                              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all disabled:cursor-default ${
                                isActive ? ACTIVE_CLS[current] : opt.cls
                              }`}
                            >
                              {opt.label}
                            </button>
                          </form>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 전체 초기화 */}
      <ResetButton slotDate={targetDate} />
    </div>
  );
}
