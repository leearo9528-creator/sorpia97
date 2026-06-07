import Link from "next/link";
import { signInAction } from "./actions";
import { AlertCircle } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="section py-10 md:py-16">
      <div className="max-w-sm mx-auto">
        <span className="eyebrow">Welcome back</span>
        <h1 className="mt-2 h-display">로그인</h1>
        <p className="mt-3 text-sm text-[var(--foreground-soft)]">
          처음이라면{" "}
          <Link href="/signup" className="text-[var(--accent)] font-semibold">
            회원가입
          </Link>
        </p>

        <form action={signInAction} className="mt-8 space-y-4">
          <input type="hidden" name="next" value={next ?? "/mypage"} />
          <div>
            <label className="label">아이디</label>
            <input className="input" name="username" required autoComplete="username" />
          </div>
          <div>
            <label className="label">비밀번호</label>
            <input
              className="input"
              type="password"
              name="password"
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {decodeURIComponent(error)}
            </div>
          )}
          <button type="submit" className="btn-primary w-full">
            로그인
          </button>
        </form>

        <p className="mt-6 text-xs text-center text-[var(--foreground-mute)]">
          카카오 로그인은 곧 추가됩니다.
        </p>
      </div>
    </div>
  );
}
