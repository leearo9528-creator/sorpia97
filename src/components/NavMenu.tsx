"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 메뉴 열렸을 때 body 스크롤 잠금
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const isAdmin = role === "admin" || role === "manager";
  const adminLinks = ADMIN_LINKS.filter((l) => l.roles.includes(role ?? ""));

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
    router.push("/");
  }

  function close() { setOpen(false); }

  const overlay = open && mounted ? createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      role="dialog"
      aria-modal="true"
    >
      {/* 딤 배경 */}
      <div
        onClick={close}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      />

      {/* 패널 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: "min(320px, 85vw)",
          backgroundColor: "#ffffff",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 헤더 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: 64,
          borderBottom: "1px solid #f0f0f0",
        }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#225028" }}>{brandName}</span>
          <button
            onClick={close}
            style={{
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 12, background: "transparent", border: "none", cursor: "pointer",
            }}
            aria-label="닫기"
          >
            <X style={{ width: 22, height: 22, color: "#666" }} />
          </button>
        </div>

        {/* 링크 목록 */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {PUBLIC_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={close}
              style={{
                display: "block",
                padding: "14px 24px",
                fontSize: 15,
                color: "#374151",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}

          {user && (
            <>
              <div style={{ height: 1, backgroundColor: "#f3f4f6", margin: "8px 24px" }} />
              <Link
                href="/mypage"
                onClick={close}
                style={{
                  display: "block",
                  padding: "14px 24px",
                  fontSize: 15,
                  color: "#374151",
                  textDecoration: "none",
                }}
              >
                마이페이지
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <div style={{ height: 1, backgroundColor: "#f3f4f6", margin: "8px 24px" }} />
              <p style={{
                padding: "8px 24px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#9ca3af",
                margin: 0,
              }}>
                {role === "admin" ? "Admin" : "Manager"}
              </p>
              {adminLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  style={{
                    display: "block",
                    padding: "14px 24px",
                    fontSize: 15,
                    color: "#374151",
                    textDecoration: "none",
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* 하단 */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid #f0f0f0",
        }}>
          {user ? (
            <button
              onClick={handleSignOut}
              style={{
                background: "transparent",
                border: "none",
                color: "#9ca3af",
                fontSize: 14,
                cursor: "pointer",
                padding: 0,
              }}
            >
              로그아웃
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href="/login"
                onClick={close}
                style={{
                  flex: 1, textAlign: "center",
                  border: "1px solid #e5e7eb", borderRadius: 16,
                  padding: "10px 0", fontSize: 14, fontWeight: 500,
                  color: "#4b5563", textDecoration: "none",
                }}
              >
                로그인
              </Link>
              <Link
                href="/signup"
                onClick={close}
                style={{
                  flex: 1, textAlign: "center",
                  backgroundColor: "#3a7a3f", borderRadius: 16,
                  padding: "10px 0", fontSize: 14, fontWeight: 500,
                  color: "#ffffff", textDecoration: "none",
                }}
              >
                가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="메뉴"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40, height: 40,
          borderRadius: 12,
          background: "transparent", border: "none", cursor: "pointer",
          color: "#44523d",
        }}
      >
        <Menu style={{ width: 24, height: 24 }} strokeWidth={1.8} />
      </button>
      {overlay}
    </>
  );
}
