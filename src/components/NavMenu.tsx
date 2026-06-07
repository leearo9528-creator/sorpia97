"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShieldCheck, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  user: { id: string } | null;
  role: string | null;
};

const PUBLIC_LINKS = [
  { href: "/",        label: "홈" },
  { href: "/menu",    label: "카페 메뉴" },
  { href: "/board",   label: "발자국" },
  { href: "/pricing", label: "이용안내" },
  { href: "/now",     label: "오늘의 소르피아" },
  { href: "/ranking", label: "이달의 랭킹" },
];

const ADMIN_LINKS = [
  { href: "/admin/members",       label: "회원·강아지",  roles: ["admin", "manager"] },
  { href: "/admin/menu",          label: "메뉴 관리",    roles: ["admin"] },
  { href: "/admin/trekking",      label: "트레킹 예약",  roles: ["admin", "manager"] },
  { href: "/admin/announcements", label: "공지사항",     roles: ["admin"] },
  { href: "/admin/site",          label: "사이트 사진",  roles: ["admin"] },
];

export function NavMenu({ user, role }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isAdmin = role === "admin" || role === "manager";
  const adminLinks = ADMIN_LINKS.filter((l) => l.roles.includes(role ?? ""));

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
    router.push("/");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[var(--surface-2)] text-[var(--foreground-soft)]"
        aria-label="메뉴 열기"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <>
          {/* 딤 오버레이 */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* 사이드 패널 */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-[var(--background)] shadow-2xl flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--line)] shrink-0">
              <span className="font-bold text-[var(--brand-strong)]">메뉴</span>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[var(--surface-2)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 링크 목록 */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
              {/* 공개 페이지 */}
              {PUBLIC_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--brand-strong)] transition-colors"
                >
                  {l.label}
                </Link>
              ))}

              {/* 로그인 회원 전용 */}
              {user && (
                <>
                  <div className="h-px bg-[var(--line)] my-2" />
                  <Link
                    href="/mypage"
                    onClick={() => setOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--brand-strong)] transition-colors"
                  >
                    마이페이지
                  </Link>
                </>
              )}

              {/* 관리자 전용 */}
              {isAdmin && (
                <>
                  <div className="h-px bg-[var(--line)] my-2" />
                  <div className="flex items-center gap-1.5 px-3 py-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-deep)]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-mute)]">
                      {role === "admin" ? "관리자" : "매니저"}
                    </span>
                  </div>
                  {adminLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--brand-strong)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>

            {/* 하단 로그인/로그아웃 */}
            <div className="px-3 py-4 border-t border-[var(--line)] shrink-0">
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--foreground-mute)] hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> 로그아웃
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setOpen(false)} className="btn-outline text-center text-sm py-2">
                    로그인
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="btn-primary text-center text-sm py-2">
                    가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
