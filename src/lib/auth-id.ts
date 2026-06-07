// 아이디 기반 인증 유틸
// Supabase Auth는 이메일이 필요하므로, 사용자가 입력한 아이디를
// 내부적으로 가상 이메일(예: hong@id.sorpia97.app)로 변환해 사용한다.

export const ID_EMAIL_DOMAIN = "id.sorpia97.app";

/** 아이디 → Supabase Auth 용 가상 이메일 */
export function idToEmail(id: string): string {
  return `${id.trim().toLowerCase()}@${ID_EMAIL_DOMAIN}`;
}

/** 가상 이메일 → 아이디 (도메인 제거). 일반 문자열이면 그대로 반환 */
export function emailToId(value: string | null | undefined): string {
  if (!value) return "";
  return value.endsWith(`@${ID_EMAIL_DOMAIN}`)
    ? value.slice(0, -`@${ID_EMAIL_DOMAIN}`.length)
    : value;
}

/** 아이디 형식 검증: 영문/숫자/._- 4~20자 */
export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9._-]{4,20}$/.test(id.trim());
}
