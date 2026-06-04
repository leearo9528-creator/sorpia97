import { ImageIcon } from "lucide-react";

type Props = {
  label: string;          // "사진1"
  hint?: string;          // 어떤 사진인지 힌트
  aspect?: string;        // tailwind aspect 클래스 (default "aspect-[4/3]")
  className?: string;
  rounded?: string;       // 모서리
};

export function PhotoSlot({
  label,
  hint,
  aspect = "aspect-[4/3]",
  className = "",
  rounded = "rounded-3xl",
}: Props) {
  return (
    <div
      className={`${aspect} ${rounded} ${className} relative overflow-hidden bg-gradient-to-br from-[var(--brand-soft)] via-[var(--surface-2)] to-[var(--accent-soft)]/40 border border-dashed border-[var(--ring)] flex flex-col items-center justify-center text-center`}
    >
      <ImageIcon className="w-8 h-8 text-[var(--brand)]/40" strokeWidth={1.5} />
      <div className="mt-2 text-sm font-bold tracking-wider text-[var(--brand-strong)]/70">
        {label}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-[var(--foreground-mute)] px-3">
          {hint}
        </div>
      )}
    </div>
  );
}
