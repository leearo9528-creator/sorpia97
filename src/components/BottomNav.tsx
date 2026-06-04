"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PawPrint, Trophy, Megaphone, User } from "lucide-react";

const TABS = [
  { href: "/",               label: "홈",     icon: Home,      match: (p: string) => p === "/" },
  { href: "/board",          label: "발자국",  icon: PawPrint,  match: (p: string) => p.startsWith("/board") },
  { href: "/announcements",  label: "공지",    icon: Megaphone, match: (p: string) => p.startsWith("/announcements") },
  { href: "/ranking",        label: "랭킹",    icon: Trophy,    match: (p: string) => p.startsWith("/ranking") },
  { href: "/mypage",         label: "마이",    icon: User,
    match: (p: string) =>
      p.startsWith("/mypage") || p.startsWith("/login") || p.startsWith("/signup"),
  },
];

export function BottomNav() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--line)] bg-[var(--background)]/95 backdrop-blur pb-safe"
      aria-label="하단 메뉴"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                className={
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors " +
                  (active
                    ? "text-[var(--brand-strong)]"
                    : "text-[var(--foreground-mute)]")
                }
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
