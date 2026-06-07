"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string };

export function AdminNav({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap gap-2 border-b border-[var(--line)] pb-3">
      {tabs.map((t) => {
        const isActive = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
              (isActive
                ? "bg-[var(--brand)] text-white shadow-sm"
                : "text-[var(--foreground-soft)] hover:bg-[var(--surface-2)]")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
