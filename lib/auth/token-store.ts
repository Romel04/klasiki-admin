// In-memory access token (cleared on full page reload, refreshed automatically via apiFetch).
let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}
export function setAccessToken(token: string | null) {
  accessToken = token;
}

// Refresh token has to be JS-readable (not httpOnly) since it's sent as a
// custom header, not automatically like a cookie. proxy.ts also reads this
// cookie server-side to gate protected routes.
const REFRESH_COOKIE = "klasiki_refresh_token";

export function getRefreshToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${REFRESH_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setRefreshToken(token: string, expiresAt?: string) {
  if (typeof document === "undefined") return;
  const expires = expiresAt ? `; expires=${new Date(expiresAt).toUTCString()}` : "";
  document.cookie = `${REFRESH_COOKIE}=${encodeURIComponent(token)}; path=/${expires}; SameSite=Lax`;
}

export function clearRefreshToken() {
  if (typeof document === "undefined") return;
  document.cookie = `${REFRESH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function clearAuth() {
  setAccessToken(null);
  clearRefreshToken();
}