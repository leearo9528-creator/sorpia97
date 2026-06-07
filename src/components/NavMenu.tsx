"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  user: { id: string } | null;
  role: string | null;
  brandName: string;
};

const PUBLIC_LINKS = [
  { href: "/",        label: "홈" },
  { href: "/menu",    label: "카페 메뉴" },
  { href: "/pricing", label: "이용안내" },
  { href: "/board",   label: "발자국" },
  { href: "/now",     label: "오늘의 소르피아" },
  { href: "/ranking", label: "이달의 랭킹" },
];

const ADMIN_LINKS = [
  { href: "/admin/members",       label: "회원·강아지", roles: ["admin", "manager"] },
  { href: "/admin/menu",          label: "메뉴 관리",   roles: ["admin"] },
  { href: "/admin/trekking",      label: "트레킹 예약", roles: ["admin", "manager"] },
  { href: "/admin/announcements", label: "공지사항",    roles: ["admin"] },
  { href: "/admin/site",          label: "사이트 사진", roles: ["admin"] },
];

export function NavMenu({ user, role, brandName }: Props) {
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
        aria-label="메뉴"
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-[var(--foreground-soft)] hover:bg-[var(--surface-2)] transition-colors"
      >
        <Menu className="w-6 h-6" strokeWidth={1.8} />
      </button>

      {open && (
        <>
          {/* 딤 오버레이 */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* 사이드 패널 */}
          <div
            className="fixed right-0 top-0 bottom-0 z-50 w-72 flex flex-col shadow-2xl"
            style={{ backgroundColor: "#ffffff" }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
              <span className="font-bold text-base text-[var(--brand-strong)]">{brandName}</span>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 링크 목록 */}
            <nav className="flex-1 overflow-y-auto py-4">
              {PUBLIC_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-6 py-3.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {l.label}
                </Link>
              ))}

              {user && (
                <>
                  <div className="h-px bg-gray-100 my-2 mx-6" />
                  <Link
                    href="/mypage"
                    onClick={() => setOpen(false)}
                    className="block px-6 py-3.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    마이페이지
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <div className="h-px bg-gray-100 my-2 mx-6" />
                  <p className="px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    {role === "admin" ? "Admin" : "Manager"}
                  </p>
                  {adminLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="block px-6 py-3.5 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>

            {/* 하단 */}
            <div className="px-6 py-5 border-t border-gray-100">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  로그아웃
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setOpen(false)}
                    className="flex-1 text-center rounded-2xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                    로그인
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}
                    className="flex-1 text-center rounded-2xl bg-[var(--brand)] text-white py-2.5 text-sm font-medium hover:opacity-90">
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
