import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "./AdminNav";

const ADMIN_TABS = [
  { href: "/admin/members",      label: "회원·강아지" },
  { href: "/admin/menu",         label: "메뉴" },
  { href: "/admin/trekking",     label: "트레킹 예약" },
  { href: "/admin/announcements",label: "공지사항" },
  { href: "/admin/site",         label: "사이트 사진" },
];

const MANAGER_TABS = [
  { href: "/admin/members",  label: "회원·강아지" },
  { href: "/admin/trekking", label: "트레킹 예약" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,display_name")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role;
  if (role !== "admin" && role !== "manager") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">접근 권한이 없습니다</h1>
        <p className="opacity-70 mt-2">관리자에게 권한을 요청하세요.</p>
        <Link href="/" className="btn-outline mt-6 inline-flex">
          홈으로
        </Link>
      </div>
    );
  }

  const tabs = role === "admin" ? ADMIN_TABS : MANAGER_TABS;
  const consoleLabel = role === "admin" ? "관리자 콘솔" : "매니저 콘솔";

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[var(--brand-strong)]">
          {consoleLabel}
        </h1>
        <span className="text-sm opacity-70">{profile?.display_name}</span>
      </div>
      <AdminNav tabs={tabs} />
      <div className="mt-8">{children}</div>
    </div>
  );
}
