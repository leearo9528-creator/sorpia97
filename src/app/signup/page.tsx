import Link from "next/link";
import { signUpAction } from "./actions";
import { AlertCircle, CheckCircle2, User } from "lucide-react";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="section py-8 md:py-12">
      <div className="max-w-md mx-auto">
        <span className="eyebrow">Sign up</span>
        <h1 className="mt-2 h-display">회원가입</h1>
        <p className="mt-3 text-sm text-[var(--foreground-soft)]">
          보호자 정보를 입력해 주세요. 강아지 정보는 가입 후 마이페이지에서 추가할 수 있어요.{" "}
          <Link href="/login" className="text-[var(--accent)] font-semibold">
            이미 계정 있어요
          </Link>
        </p>

        {message && (
          <div className="mt-6 flex items-start gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            {decodeURIComponent(message)}
          </div>
        )}
        {error && (
          <div className="mt-6 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {decodeURIComponent(error)}
          </div>
        )}

        <form
          action={signUpAction}
          className="mt-8 space-y-7"
        >
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--brand-strong)] font-semibold">
              <User className="w-4 h-4" /> 보호자 정보
            </div>
            <div>
              <label className="label">이름</label>
              <input className="input" name="display_name" required />
            </div>
            <div>
              <label className="label">이메일</label>
              <input className="input" type="email" name="email" required />
            </div>
            <div>
              <label className="label">전화번호</label>
              <input className="input" name="phone" placeholder="010-0000-0000" />
            </div>
            <div>
              <label className="label">비밀번호 (8자 이상)</label>
              <input
                className="input"
                type="password"
                name="password"
                minLength={8}
                required
              />
            </div>
          </section>

          <button type="submit" className="btn-primary w-full">
            가입하기
          </button>
          <p className="text-xs text-center text-[var(--foreground-mute)]">
            가입 시 이용약관 및 반려견 안전 수칙에 동의한 것으로 간주합니다.
          </p>
        </form>
      </div>
    </div>
  );
}
