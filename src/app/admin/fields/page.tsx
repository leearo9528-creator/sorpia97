import { createClient } from "@/lib/supabase/server";
import { cycleSlotAction } from "./actions";

export const dynamic = "force-dynamic";

const YARDS = ["소형견", "중형견", "대형견"] as const;
const TIMES = ["12:00", "15:00", "18:00"] as const;
const TIME_LABEL: Record<string, string> = {
  "12:00": "12시",
  "15:00": "15시",
  "18:00": "18시",
};

const STATUS_LABEL: Record<string, string> = {
  available: "예약가능",
  reserved: "예약됨",
  closed: "마감",
};
const STATUS_CLASS: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  reserved:  "bg-red-100 text-red-700 border-red-200",
  closed:    "bg-gray-100 text-gray-500 border-gray-200",
};

function toDateString(d: Date) {
  return d.toISOString().split("T")[0];
}

export default async function FieldsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const today = toDateString(new Date());
  const targetDate = dateParam ?? today;

  const supabase = await createClient();
  const { data: slots } = await supabase
    .from("field_slots")
    .select("yard,slot_time,status")
    .eq("slot_date", targetDate);

  const statusMap = new Map<string, string>();
  for (const s of slots ?? []) {
    statusMap.set(`${s.yard}|${s.slot_time}`, s.status);
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-[var(--brand-strong)] text-lg">
          운동장 대관 현황 관리
        </h2>
        <form method="get" className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={targetDate}
            className="input !min-h-0 py-1.5 text-sm w-auto"
          />
          <button type="submit" className="btn-primary btn-sm">이동</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--line)]">
              <th className="text-left pb-3 pr-4 text-[var(--foreground-mute)] font-medium">
                운동장
              </th>
              {TIMES.map((t) => (
                <th
                  key={t}
                  className="text-center pb-3 px-2 text-[var(--foreground-mute)] font-medium"
                >
                  {TIME_LABEL[t]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {YARDS.map((yard) => (
              <tr key={yard} className="border-b border-[var(--line)] last:border-0">
                <td className="py-3 pr-4 font-semibold text-[var(--brand-strong)] whitespace-nowrap">
                  {yard}견
                </td>
                {TIMES.map((time) => {
                  const current = (statusMap.get(`${yard}|${time}`) ?? "available") as
                    | "available"
                    | "reserved"
                    | "closed";
                  return (
                    <td key={time} className="py-3 px-2 text-center">
                      <form action={cycleSlotAction}>
                        <input type="hidden" name="yard" value={yard} />
                        <input type="hidden" name="slot_date" value={targetDate} />
                        <input type="hidden" name="slot_time" value={time} />
                        <input type="hidden" name="current" value={current} />
                        <button
                          type="submit"
                          className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 ${STATUS_CLASS[current]}`}
                        >
                          {STATUS_LABEL[current]}
                        </button>
                      </form>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-[var(--foreground-mute)]">
          버튼을 클릭하면 예약가능 → 예약됨 → 마감 → 예약가능 순으로 변경됩니다.
        </p>
      </div>
    </div>
  );
}
