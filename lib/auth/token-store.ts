export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

const ACCESS_COOKIE = "klasiki_access_token";
const REFRESH_COOKIE = "klasiki_refresh_token";
const ACCESS_STORAGE_KEY = "klasiki_access_token";
const USER_STORAGE_KEY = "klasiki_user";
const REFRESH_STORAGE_KEY = "klasiki_refresh_token";

let accessToken: string | null = null;
let currentUser: CurrentUser | null = null;

// Helper to decode JWT exp claim
export function parseJwtExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    let jsonStr = "";
    if (typeof window !== "undefined") {
      jsonStr = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } else {
      jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    }
    const json = JSON.parse(jsonStr);
    if (typeof json.exp === "number") {
      return json.exp * 1000;
    }
  } catch {}
  return null;
}

export function isTokenExpired(token: string): boolean {
  const exp = parseJwtExp(token);
  if (!exp) return false;
  // Consider expired if within 30 seconds of expiry
  return Date.now() >= exp - 30000;
}

function computeCookieExpiry(expiresAt?: string, defaultSeconds = 604800): string {
  let seconds = defaultSeconds;
  if (expiresAt) {
    const parsed = new Date(expiresAt);
    if (!isNaN(parsed.getTime())) {
      const diffSec = Math.floor((parsed.getTime() - Date.now()) / 1000);
      if (diffSec > 0) seconds = diffSec;
    } else {
      const num = Number(expiresAt);
      if (!isNaN(num) && num > 0) {
        const ms = num > 1e11 ? num : num * 1000;
        const diffSec = Math.floor((ms - Date.now()) / 1000);
        if (diffSec > 0) seconds = diffSec;
      }
    }
  }
  const date = new Date(Date.now() + seconds * 1000).toUTCString();
  return `; max-age=${seconds}; expires=${date}`;
}

export function getAccessToken(): string | null {
  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }

  if (typeof window !== "undefined") {
    // Try localStorage
    const stored = window.localStorage.getItem(ACCESS_STORAGE_KEY);
    if (stored && !isTokenExpired(stored)) {
      accessToken = stored;
      return stored;
    }

    // Try cookie
    const match = document.cookie.match(new RegExp(`(?:^|; )${ACCESS_COOKIE}=([^;]*)`));
    const cookieToken = match ? decodeURIComponent(match[1]) : null;
    if (cookieToken && !isTokenExpired(cookieToken)) {
      accessToken = cookieToken;
      window.localStorage.setItem(ACCESS_STORAGE_KEY, cookieToken);
      return cookieToken;
    }
  }

  return null;
}

export function setAccessToken(token: string | null, expiresAt?: string) {
  accessToken = token;
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem(ACCESS_STORAGE_KEY, token);
    const expiryStr = computeCookieExpiry(expiresAt, 7200); // 2 hours default
    document.cookie = `${ACCESS_COOKIE}=${encodeURIComponent(token)}; path=/${expiryStr}; SameSite=Lax`;
  } else {
    window.localStorage.removeItem(ACCESS_STORAGE_KEY);
    document.cookie = `${ACCESS_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

export function getCurrentUser(): CurrentUser | null {
  if (currentUser) return currentUser;

  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        currentUser = JSON.parse(stored);
        return currentUser;
      }
    } catch {}
  }

  return null;
}

export function setCurrentUser(user: CurrentUser | null) {
  currentUser = user;
  if (typeof window === "undefined") return;

  if (user) {
    try {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {}
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function getRefreshToken(): string | null {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp(`(?:^|; )${REFRESH_COOKIE}=([^;]*)`));
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(REFRESH_STORAGE_KEY);
  }
  return null;
}

export function setRefreshToken(token: string, expiresAt?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REFRESH_STORAGE_KEY, token);
  const expiryStr = computeCookieExpiry(expiresAt, 604800); // 7 days default
  document.cookie = `${REFRESH_COOKIE}=${encodeURIComponent(token)}; path=/${expiryStr}; SameSite=Lax`;
}

export function clearRefreshToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REFRESH_STORAGE_KEY);
  document.cookie = `${REFRESH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function clearAuth() {
  setAccessToken(null);
  setCurrentUser(null);
  clearRefreshToken();
}