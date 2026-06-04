"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function SignOutButton({ minimal = false }: { minimal?: boolean }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={minimal ? "btn-ghost btn-sm" : "btn-outline btn-sm"}
    >
      <LogOut className="w-4 h-4" />
      로그아웃
    </button>
  );
}
