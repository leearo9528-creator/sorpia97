import { createClient } from "@supabase/supabase-js";

/**
 * 서비스 롤 키를 사용하는 관리자 클라이언트.
 * 절대 클라이언트 컴포넌트나 브라우저로 노출되지 않도록 서버 코드에서만 사용.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
