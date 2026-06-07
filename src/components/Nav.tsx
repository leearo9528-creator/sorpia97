import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/brand";
import { NavMenu } from "./NavMenu";

export async function Nav() {
  let user: { id: string } | null = null;
  let role: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      user = { id: data.user.id };
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
      <div className="section-wide h-14 md:h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--brand)] text-white text-sm font-bold"
            aria-hidden
          >
            S
          </span>
          <div className="font-bold text-[15px] text-[var(--brand-strong)]">
            {BRAND.name}
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--foreground-soft)]">
          <Link href="/menu"    className="hover:text-[var(--brand-strong)]">메뉴</Link>
          <Link href="/pricing" className="hover:text-[var(--brand-strong)]">이용안내</Link>
          <Link href="/board"   className="hover:text-[var(--brand-strong)]">발자국</Link>
          <Link href="/now"     className="hover:text-[var(--brand-strong)]">오늘의 소르피아</Link>
          {user && <Link href="/mypage" className="hover:text-[var(--brand-strong)]">마이페이지</Link>}
        </nav>

        <NavMenu user={user} role={role} brandName={BRAND.name} />
      </div>
    </header>
  );
}
