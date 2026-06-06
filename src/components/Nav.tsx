import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/brand";
import { SignOutButton } from "./SignOutButton";
import { Bell, MapPin, ShieldCheck } from "lucide-react";

export async function Nav() {
  let user: { id: string; email?: string } | null = null;
  let role: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      user = { id: data.user.id, email: data.user.email ?? undefined };
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      role = profile?.role ?? "member";
    }
  } catch {}

  return (
    <header className="sticky top-0 z-30 bg-[var(--background)]/85 backdrop-blur border-b border-[var(--line)]">
      <div className="section-wide h-14 md:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--brand)] text-white text-sm font-bold"
            aria-hidden
          >
            S
          </span>
          <div className="leading-tight">
            <div className="font-bold text-[15px] text-[var(--brand-strong)]">
              {BRAND.name}
            </div>
            <div className="hidden md:flex items-center gap-1 text-[11px] text-[var(--foreground-mute)]">
              <MapPin className="w-3 h-3" /> 동두천
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--foreground-soft)]">
          <Link href="/menu" className="hover:text-[var(--brand-strong)]">메뉴</Link>
          <Link href="/pricing" className="hover:text-[var(--brand-strong)]">시설안내</Link>
          <Link href="/board" className="hover:text-[var(--brand-strong)]">발자국</Link>
          <Link href="/now" className="hover:text-[var(--brand-strong)]">오늘의 소르피아</Link>
          {user && (
            <Link href="/mypage" className="hover:text-[var(--brand-strong)]">마이페이지</Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {(role === "admin" || role === "manager") && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] text-[var(--brand-strong)] px-3 py-1.5 text-xs font-bold shadow-sm hover:opacity-90"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {role === "admin" ? "관리자" : "매니저"}
            </Link>
          )}
          {user ? (
            <>
              <button
                aria-label="알림"
                className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--surface-2)]"
              >
                <Bell className="w-5 h-5 text-[var(--foreground-soft)]" />
              </button>
              <div className="hidden md:block">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">
                로그인
              </Link>
              <Link href="/signup" className="btn-primary btn-sm">
                가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
