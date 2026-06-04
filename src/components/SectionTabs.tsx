"use client";

import { useEffect, useState } from "react";

type Tab = { id: string; label: string };

export function SectionTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    tabs.forEach((t) => {
      const el = document.getElementById(t.id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(t.id);
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [tabs]);

  return (
    <div className="sticky top-14 md:top-16 z-20 -mx-5 px-5 bg-[var(--background)]/95 backdrop-blur border-b border-[var(--line)]">
      <nav className="flex gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <a
              key={t.id}
              href={`#${t.id}`}
              className={
                "relative px-3 py-3 text-sm font-semibold whitespace-nowrap transition-colors " +
                (isActive
                  ? "text-[var(--brand-strong)]"
                  : "text-[var(--foreground-mute)]")
              }
            >
              {t.label}
              {isActive && (
                <span className="absolute left-2 right-2 bottom-0 h-[2px] rounded-full bg-[var(--brand)]" />
              )}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
